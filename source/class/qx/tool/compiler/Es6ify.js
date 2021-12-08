var fs = require("fs");
var babelCore = require("@babel/core");

var types = require("@babel/types");
var babylon = require("@babel/parser");
const prettier = require("prettier");

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
                this.__pluginFunctionExpressions(),
                this.__pluginArrowFunctions(),
                this.__pluginRemoveUnnecessaryThis()
              ],
            },
          ],
        ],
        parserOpts: { sourceType: "script" },
        generatorOpts: {
          retainLines: true
        },
        passPerPreset: true,
      };
      let result = prettier.format(src, {
        parser(text, { babel }) {
          const ast = babel(text);
          let result = babelCore.transform(text, config);
          return result.ast;
        }
      });
      
      await fs.promises.writeFile(this.__filename + ".out", result, "utf8");
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
      return {
        visitor: {
          CallExpression(path) {
            for (let i = 0; i < path.node.arguments.length; i++){
              let argNode = path.node.arguments[i];
              if (argNode.type == "FunctionExpression") {
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
                path.node.arguments[i] = replacement;
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
});
