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


qx.Class.define("qx.tool.compiler.Es6ify", {
  extend: qx.core.Object,

  construct(filename) {
    this.base(arguments);
    this.__filename = filename;
  },

  members: {
    __filename: null,

    async transform() {
      let src = await fs.promises.readFile(this.__filename, "utf8");

      let babelConfig = {};
      let options = qx.lang.Object.clone(babelConfig.options || {}, true);
      options.modules = false;
      var config = {
        ast: true,
        babelrc: false,
        sourceFileName: this.__filename,
        filename: this.__filename,
        sourceMaps: false,
        presets: [
          [
            {
              plugins: [
                require("@babel/plugin-syntax-jsx"),
                this.__pluginFunctionExpressions(),
                this.__pluginArrowFunctions(),
                this.__pluginRemoveUnnecessaryThis()
              ],
            },
          ]
        ],
        parserOpts: { sourceType: "script" },
        generatorOpts: {
          retainLines: true
        },
        passPerPreset: true,
      };
      let result = babelCore.transform(src, config);
      let prettyCode = prettier.format(result.code, { parser: "babel" });
      
      await fs.promises.writeFile(this.__filename, prettyCode, "utf8");
    },

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

    __pluginArrowFunctions() {
      const toArrowExpression = (argNode) => {
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
      };

      return {
        visitor: {
          CallExpression(path) {
            if (path.node.callee.type == "MemberExpression") {
              let callee = collapseMemberExpression(path.node.callee);
              if (callee == "qx.event.GlobalError.observeMethod" || 
                  callee == "this.assertException" || 
                  callee == "this.assertEventFired" || 
                  callee == "qx.core.Assert.assertEventFired")
                return;
            }
            for (let i = 0; i < path.node.arguments.length; i++){
              let argNode = path.node.arguments[i];
              if (argNode.type == "FunctionExpression") {
                path.node.arguments[i] = toArrowExpression(argNode);
              }
            }
          }
        }
      }
    },

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
    }
  },

  statics: {
    async scan(filename) {

      async function processFile(filename) {
        console.log(`Processing ${filename}...`);
        let ify = new qx.tool.compiler.Es6ify(filename);
        await ify.transform();
      }

      async function scanImpl(filename) {
        let basename = path.basename(filename);
        let stat = await fs.promises.stat(filename);

        if (stat.isFile() && basename.match(/\.js$/)) {
          await processFile(filename);

        } else if (stat.isDirectory() && basename[0] != '.') {
          let files = await fs.promises.readdir(filename);
          for (let i = 0; i < files.length; i++) {
            let subname = path.join(filename, files[i]);
            await scanImpl(subname);
          }
        }
      }

      await scanImpl(filename);
    }
  }
});
