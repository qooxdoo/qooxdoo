/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2021 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

const fs = require("fs");
const path = require("path");
const babelCore = require("@babel/core");

const types = require("@babel/types");
const babylon = require("@babel/parser");
const prettier = require("prettier");

/**
 * Helper method that collapses the MemberExpression into a string
 * @param node
 * @returns {string}
 */
 function collapseMemberExpression(node) {
  var done = false;
  function doCollapse(node) {
    if (node.type == "ThisExpression") {
      return "this";
    }
    if (node.type == "Identifier") {
      return node.name;
    }
    if (node.type == "ArrayExpression") {
      var result = [];
      node.elements.forEach(element => result.push(doCollapse(element)));
      return result;
    }
    if (node.type != "MemberExpression") {
      return "(" + node.type + ")";
    }
    if (types.isIdentifier(node.object)) {
      let str = node.object.name;
      if (node.property.name) {
        str += "." + node.property.name;
      } else {
        done = true;
      }
      return str;
    }
    var str;
    if (node.object.type == "ArrayExpression") {
      str = "[]";
    } else {
      str = doCollapse(node.object);
    }
    if (done) {
      return str;
    }
    // `computed` is set if the expression is a subscript, eg `abc[def]`
    if (node.computed) {
      done = true;
    } else if (node.property.name) {
      str += "." + node.property.name;
    } else {
      done = true;
    }
    return str;
  }

  return doCollapse(node);
}

/**
 * Processes a .js source file and tries to upgrade to ES6 syntax
 * 
 * This is a reliable but fairly unintrusive upgrade, provided that `arrowFunctions` property is
 * `careful`.  The issue is that this code: `setTimeout(function() { something(); })` can be 
 * changed to `setTimeout(() => something())` and that is often desirable, but it also means that
 * the `this` will be different because an arrow function always has the `this` from where the 
 * code is written.
 * 
 * However, if you use an API which changes `this` then the switch to arrow functions will break 
 * your code.  Mostly, in Qooxdoo, changes to `this` are done via an explicit API (eg 
 * `obj.addListener("changeXyx", function() {}, this)`) and so those known APIs can be translated,
 * but there are places which do not work this way (eg the unit tests `qx.dev.unit.TestCase.resume()`).
 * Third party integrations are of course completely unknown.
 * 
 * If `arrowFunctions` is set to aggressive, then all functions are switched to arrow functions except
 * where there is a known API that does not support it (eg any call to `.resume` in a test class); this
 * could break your code.
 * 
 * If `arrowFunctions is set to `careful` (the default), then functions are only switched to arrow 
 * functions where the API is known  (eg `.addListener`).
 * 
 * The final step is that the ES6ify will use https://prettier.io/ to reformat the code, and will use
 * the nearest `prettierrc.json` for configuration
 */
qx.Class.define("qx.tool.compiler.Es6ify", {
  extend: qx.core.Object,

  construct(filename) {
    this.base(arguments);
    this.__filename = filename;
  },

  properties: {
    /** Whether to convert functions to arrow functions; careful means only on things like addListener callbacks */
    arrowFunctions: {
      init: "careful",
      check: [ "never", "always", "careful", "aggressive" ],
      nullable: true
    },

    /** Whether to overwrite the original file */
    overwrite: {
      init: false,
      check: "Boolean"
    }
  },

  members: {
    __filename: null,

    async transform() {
      let src = await fs.promises.readFile(this.__filename, "utf8");

      let babelConfig = {};
      let options = qx.lang.Object.clone(babelConfig.options || {}, true);
      options.modules = false;
      let plugins = [
        require("@babel/plugin-syntax-jsx"),
        this.__pluginFunctionExpressions()
      ];
      if (this.getArrowFunctions() != "never") {
        plugins.push(this.__pluginArrowFunctions());
      }
      plugins.push(this.__pluginRemoveUnnecessaryThis());
      plugins.push(this.__pluginSwitchToSuper());
      var config = {
        ast: true,
        babelrc: false,
        sourceFileName: this.__filename,
        filename: this.__filename,
        sourceMaps: false,
        presets: [
          [
            {
              plugins: plugins
            }
          ]
        ],
        parserOpts: { 
          allowSuperOutsideMethod: true,
          sourceType: "script" 
        },
        generatorOpts: {
          retainLines: true
        },
        passPerPreset: true
      };
      let result = babelCore.transform(src, config);

      let prettierConfig = await prettier.resolveConfig(this.__filename, { editorConfig: true })||{};
      prettierConfig.parser = "babel";
      let prettyCode = prettier.format(result.code, prettierConfig);
      
      let outname = this.__filename + (this.isOverwrite() ? "" : ".es6ify");
      await fs.promises.writeFile(outname, prettyCode, "utf8");
    },

    /**
     * Plugin that converts object properties which are functions into object methods, eg
     * ```
     * {
     *   myMethod: function() {}
     * }
     * ```
     * becomes
     * ```
     * {
     *   myMethod() {}
     * }
     * ```
     * @returns 
     */
    __pluginFunctionExpressions() {
      return {
        visitor: {
          ObjectExpression(path) {
            for (let i = 0; i < path.node.properties.length; i++) {
              let propNode = path.node.properties[i];
              if (
                propNode.type == "ObjectProperty" &&
                propNode.value.type == "FunctionExpression"
              ) {
                let replacement = types.objectMethod(
                  "method",
                  propNode.key,
                  propNode.value.params,
                  propNode.value.body,
                  propNode.value.computed,
                  propNode.value.generator,
                  propNode.value.async
                );
                replacement.loc = propNode.loc;
                replacement.start = propNode.start;
                replacement.end = propNode.end;
                replacement.leadingComments = propNode.leadingComments;
                path.node.properties[i] = replacement;
              }
            }
          }
        }
      };
    },

    __toArrowExpression(argNode) {
      let body = argNode.body;
      if (body.body.length == 1 && body.body[0].type == "ReturnStatement") {
        body = body.body[0].argument;
      }
      let replacement = types.arrowFunctionExpression(
        argNode.params,
        body,
        argNode.async
      );
      replacement.loc = argNode.loc;
      replacement.start = argNode.start;
      replacement.end = argNode.end;
      replacement.leadingComments = argNode.leadingComments;
      return replacement;
    },

    /**
     * Tries to convert functions into arrow functions
     * @returns 
     */
    __pluginArrowFunctions() {
      let t = this;
      const isTest = this.__filename.indexOf("/test/") > -1;
      let arrowFunctions = this.getArrowFunctions();

      return {
        visitor: {
          CallExpression(path) {
            if (path.node.callee.type == "MemberExpression") {
              let callee = collapseMemberExpression(path.node.callee);
              if (arrowFunctions == "careful") {
                if (!callee.endsWith(".addListener")) {
                  return;
                }
                if (
                  path.node.arguments.length != 3 ||
                  path.node.arguments[0].type != "StringLiteral" ||
                  path.node.arguments[1].type != "ArrowFunctionExpression" ||
                  path.node.arguments[2].type != "ThisExpression"
                ) {
                  return;
                }
    
              } else if (arrowFunctions == "aggressive") {
                if (callee == "qx.event.GlobalError.observeMethod" || 
                    callee == "this.assertException" || 
                    callee == "this.assertEventFired" || 
                    callee == "qx.core.Assert.assertEventFired" ||
                    (isTest && callee.endsWith(".resume"))) {
                  return;
                }
              }
            } else if (arrowFunctions == "careful") {
              return;
            }
            for (let i = 0; i < path.node.arguments.length; i++){
              let argNode = path.node.arguments[i];
              if (argNode.type == "FunctionExpression") {
                path.node.arguments[i] = t.__toArrowExpression(argNode);
              }
            }
          }
        }
      }
    },

    /**
     * Where a function has been translated into an arrow function, the this binding is not needed
     * and can be removed
     * @returns 
     */
    __pluginRemoveUnnecessaryThis() {
      return {
        visitor: {
          CallExpression(path) {
            if (
              path.node.callee.type == "MemberExpression" &&
              path.node.callee.object.type == "ThisExpression" &&
              path.node.callee.property.type == "Identifier" &&
              path.node.callee.property.name == "addListener" &&
              path.node.arguments.length == 3 &&
              path.node.arguments[0].type == "StringLiteral" &&
              path.node.arguments[1].type == "ArrowFunctionExpression" &&
              path.node.arguments[2].type == "ThisExpression"
            ) {
              qx.lang.Array.removeAt(path.node.arguments, 2);
            }
          }
        }
      }
    },

    /**
     * Translates `this.base(arguments...)` into `super`
     * @returns 
     */
    __pluginSwitchToSuper() {
      return {
        visitor: {
          CallExpression(path) {
            if (
              path.node.callee.type == "MemberExpression" &&
              path.node.callee.object.type == "ThisExpression" &&
              path.node.callee.property.type == "Identifier" &&
              path.node.callee.property.name == "addListener" &&
              path.node.arguments.length == 3 &&
              path.node.arguments[0].type == "StringLiteral" &&
              path.node.arguments[1].type == "ArrowFunctionExpression" &&
              path.node.arguments[2].type == "ThisExpression"
            ) {
              qx.lang.Array.removeAt(path.node.arguments, 2);
            }
          }
        }
      }
    }
  }
});
