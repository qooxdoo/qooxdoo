/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2011-2025 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * *********************************************************************** */

const fs = require("fs");
const path = require("upath");

const forceArray = value => {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
};

/**
 * StdClassParser is used to parse a class file and extract the metadata.  This
 * strictly does not persist state (outside of the `parse()` method) so that it
 * can be used in a multi-threaded environment, ie we can use Node Workers to
 * parse multiple files at once.
 *
 * @typedef {Object} MetaData
 * @property {String} className - The name of the class
 * @property {Number} version - The version of the metadata format
 * @property {Number} lastModified - The last modified timestamp of the class file
 * @property {String} lastModifiedIso - The last modified timestamp of the class file in ISO format
 * @property {String} classFilename - The filename of the class, relative to the meta root dir
 * @property {String} superClass
 * @property {Object.<string, PropertyMeta>} properties
 *
 * @typedef {Object} PropertyMeta
 * @property {{start: *, end:*}} location
 * @property {String} jsdoc
 * @property {Boolean=} nullable
 * @property {String} init The code for the init value. This is not the value itself!
 * @property {(String|String[])=} check
 *
 *
 */
qx.Class.define("qx.tool.compiler.meta.StdClassParser", {
  extend: qx.core.Object,
  implement: [qx.tool.compiler.meta.IStdClassParser],

  statics: {
    /** Meta Data Version - stored in meta data files */
    VERSION: 0.3
  },

  members: {
    /** @type {MetaData} The metadata, only valid during `parse()` */
    __metaData: null,

    /** @type {string} Expected class name derived from file path */
    __expectedClassname: null,

    /**
     * @Override
     */
    async parse(metaRootDir, libraryPath, classFilename) {
      classFilename = await qx.tool.utils.files.Utils.correctCase(classFilename);

      let stat = await fs.promises.stat(classFilename);
      this.__metaData = {
        version: qx.tool.compiler.meta.StdClassParser.VERSION,
        lastModified: stat.mtime.getTime(),
        lastModifiedIso: stat.mtime.toISOString(),
        classFilename: path.relative(metaRootDir, classFilename)
      };

      this.__expectedClassname = path.relative(libraryPath, classFilename).replace(/\.js$/, "").split(path.sep).join(".");

      const babelCore = require("@babel/core");
      let src = await fs.promises.readFile(classFilename, "utf8");

      this.__dependencyScanner = this.__pluginDependencyScanner();
      let plugins = [require("@babel/plugin-syntax-jsx"), this.__plugin()];

      var config = {
        ast: true,
        babelrc: false,
        sourceFileName: classFilename,
        filename: classFilename,
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
          retainLines: true,
          compact: false
        },

        passPerPreset: true
      };

      babelCore.transform(src, config);
      let metaData = this.__metaData;
      if (metaData.uses) {
        metaData.uses = Object.keys(metaData.uses);
      }
      this.__metaData = null;
      return metaData;
    },

    /**
     * The Babel plugin
     *
     * @returns {Object}
     */
    __plugin() {
      let metaData = this.__metaData;
      let t = this;
      return {
        visitor: {
          Program(path) {
            path.skip();
            let found = false;
            // Babel's path.get() may return either an array or a single NodePath object
            // depending on the AST structure and Babel version, so we normalize to array
            let bodyPaths = path.get("body");
            if (!Array.isArray(bodyPaths)) {
              bodyPaths = [bodyPaths];
            }
            bodyPaths.forEach(path => {
              let node = path.node;
              if (node.type == "ExpressionStatement" && node.expression.type == "CallExpression") {
                let str = qx.tool.utils.BabelHelpers.collapseMemberExpression(node.expression.callee);

                let m = str.match(/^qx\.([a-z]+)\.define$/i);
                let definingType = m && m[1];
                if (definingType) {
                  if (found) {
                    qx.tool.compiler.Console.warn(
                      `Ignoring class '${node.expression.arguments[0].value}' in file '${metaData.classFilename}' because a class, mixin, or interface was already found in this file.`
                    );

                    return;
                  }
                  found = true;
                  metaData.type = definingType.toLowerCase();
                  metaData.location = {
                    start: node.loc.start,
                    end: node.loc.end
                  };

                  metaData.className = node.expression.arguments[0].value;
                  if (t.__expectedClassname !== metaData.className) {
                    qx.tool.compiler.Console.warn(
                      `Class name '${metaData.className}' does not match expected class name '${t.__expectedClassname}' derived from file path.`
                    );
                  }
                  if (typeof metaData.className != "string") {
                    metaData.className = null;
                  }
                  metaData.jsdoc = qx.tool.utils.BabelHelpers.getJsDoc(node.leadingComments);

                  t.__scanClassDef(path.get("expression.arguments")[1]);
                }
              }
            });
          }
        }
      };
    },

    __pluginDependencyScanner() {
      let metaData = this.__metaData;
      let t = this;
      return {
        NewExpression(path) {
          let node = path.node;
          let str = qx.tool.utils.BabelHelpers.collapseMemberExpression(node.callee);
          if (str.match(/(([a-zA-Z0-9_]+)\.)+([A-Z][a-zA-Z0-9_]+)/)) {
            if (!metaData.uses) {
              metaData.uses = {};
            }
            metaData.uses[str] = true;
          }
        }
      };
    },

    /**
     * Scans the class definition
     *
     * @param {NodePath} path
     */
    __scanClassDef(path) {
      if (!path || !path.node || path.node.type !== "ObjectExpression") {
        // The class definition is not a plain object literal (e.g. wrapped in
        // qx.core.Environment.select(...)).  Static analysis is not possible.
        return;
      }
      let metaData = this.__metaData;

      const getFunctionParams = node => {
        if (node.type == "ObjectMethod") {
          return node.params;
        }
        if (node.value.type == "FunctionExpression") {
          return node.value.params;
        }
        throw new Error("Don't know how to get parameters from " + node.type);
      };

      const collapseParamMeta = (node, meta) => {
        getFunctionParams(node).forEach((param, i) => {
          let name = qx.tool.utils.BabelHelpers.collapseParam(param, i);
          meta.params.push({ name });
        });
      };

      path.skip();
      let ctorAnnotations = {};
      // Babel's path.get() may return either an array or a single NodePath object
      // depending on the AST structure and Babel version, so we normalize to array
      let propertiesPaths = path.get("properties");
      if (!Array.isArray(propertiesPaths)) {
        propertiesPaths = [propertiesPaths];
      }
      propertiesPaths.forEach(path => {
        let property = path.node;
        let propertyName;
        if (property.key.type === "Identifier") {
          propertyName = property.key.name;
        } else if (property.key.type === "StringLiteral") {
          propertyName = property.key.value;
        }

        // Extend
        if (propertyName == "extend") {
          metaData.superClass = qx.tool.utils.BabelHelpers.collapseMemberExpression(property.value);
        }

        // Class Annotations
        else if (propertyName == "@") {
          let node = path.get("value").node;
          if (node.type == "ArrayExpression") {
            metaData.annotation = node.elements.map((el, index) => path.get(`value.elements.${index}`).getSource());
          } else {
            metaData.annotation = [path.get("value").getSource()];
          }
        }

        // Core
        else if (propertyName == "implement" || propertyName == "include") {
          let name = propertyName == "include" ? "mixins" : "interfaces";
          metaData[name] = [];
          // eg: `include: [qx.my.first.MMixin, qx.my.next.MMixin, ..., qx.my.last.MMixin]`
          if (property.value.type == "ArrayExpression") {
            property.value.elements.forEach(element => {
              metaData[name].push(qx.tool.utils.BabelHelpers.collapseMemberExpression(element));
            });
          }
          // eg: `include: qx.my.MMixin`
          else if (property.value.type == "MemberExpression") {
            metaData[name].push(qx.tool.utils.BabelHelpers.collapseMemberExpression(property.value));
          }
          // eg, `include: qx.core.Environment.filter({...})`
          else if (property.value.type === "CallExpression") {
            let calleeLiteral = "";
            let current = property.value.callee;
            while (current) {
              let suffix = calleeLiteral ? `.${calleeLiteral}` : "";
              if (current.type === "MemberExpression") {
                calleeLiteral = current.property.name + suffix;
                current = current.object;
                continue;
              } else if (current.type === "Identifier") {
                calleeLiteral = current.name + suffix;
                break;
              }
              throw new Error(
                `${metaData.className}: error parsing mixin types: cannot resolve ${property.value.callee.type} in CallExpression`
              );
            }
            if (calleeLiteral === "qx.core.Environment.filter") {
              const properties = property.value.arguments[0]?.properties;
              properties?.forEach(prop => metaData[name].push(qx.tool.utils.BabelHelpers.collapseMemberExpression(prop.value)));
            } else {
              this.warn(
                `${metaData.className}: could not determine mixin types from call \`${calleeLiteral}\`. Type support for this class may be limited.`
              );
            }
          }
        }

        // Type
        else if (propertyName == "type") {
          metaData.isSingleton = property.value.value == "singleton";
          metaData.abstract = property.value.value == "abstract";
        }

        // Constructor & Destructor Annotations
        else if (propertyName == "@construct" || propertyName == "@destruct") {
          ctorAnnotations[propertyName] = path.get("value").toString();
        }

        // Constructor & Destructor Methods
        else if (propertyName == "construct" || propertyName == "destruct") {
          let memberMeta = (metaData[propertyName] = {
            type: "function",
            params: [],
            location: {
              start: path.node.loc.start,
              end: path.node.loc.end
            }
          });

          collapseParamMeta(property, memberMeta);
        }

        // Events
        else if (propertyName == "events") {
          metaData.events = {};
          let eventAnnotations = {};
          let eventPaths = path.get("value.properties");
          if (!Array.isArray(eventPaths)) {
            eventPaths = [eventPaths];
          }
          eventPaths.forEach(eventPath => {
            let event = eventPath.node;
            let name = event.key.type === "StringLiteral" ? event.key.value : event.key.name;
            if (name && name[0] === "@") {
              eventAnnotations[name] = eventPath.get("value").toString();
              return;
            }
            if (!name) {
              return;
            }
            metaData.events[name] = {
              type: null,
              jsdoc: qx.tool.utils.BabelHelpers.getJsDoc(event.leadingComments)
            };
            if (event.value.type == "StringLiteral") {
              metaData.events[name].type = event.value.value;
              metaData.events[name].location = {
                start: event.loc.start,
                end: event.loc.end
              };
            }
          });
          for (let annoName in eventAnnotations) {
            let bareName = annoName.substring(1);
            if (metaData.events[bareName]) {
              metaData.events[bareName].annotation = forceArray(eventAnnotations[annoName]);
            }
          }
        }

        // Properties
        else if (propertyName == "properties") {
          this.__scanProperties(path.get("value.properties"));
        }

        // Members & Statics
        else if (propertyName == "members" || propertyName == "statics") {
          let type = propertyName;
          let annotations = {};
          metaData[type] = {};
          if (path.node.value.type == "ObjectExpression") {
            // Babel's path.get() may return either an array or a single NodePath object
            // depending on the AST structure and Babel version, so we normalize to array
            let memberPaths = path.get("value.properties");
            if (!Array.isArray(memberPaths)) {
              memberPaths = [memberPaths];
            }
            memberPaths.forEach(memberPath => {
              let member = memberPath.node;
              const name = qx.tool.utils.BabelHelpers.collapseMemberExpression(member.key);
              if (name[0] == "@") {
                annotations[name] = memberPath.get("value").toString();
                return;
              }

              let memberMeta = (metaData[type][name] = {
                jsdoc: qx.tool.utils.BabelHelpers.getJsDoc(member.leadingComments)
              });

              memberMeta.access = name.startsWith("__") ? "private" : name.startsWith("_") ? "protected" : "public";
              memberMeta.location = {
                start: member.loc.start,
                end: member.loc.end
              };

              if (member.type === "ObjectMethod" || (member.type === "ObjectProperty" && member.value.type === "FunctionExpression")) {
                memberMeta.type = "function";
                memberMeta.params = [];
                collapseParamMeta(member, memberMeta);
              } else if (type === "statics" && member.type === "ObjectProperty") {
                memberMeta.init = memberPath.get("value").getSource();
              }
            });
          }
          for (let metaName in annotations) {
            let bareName = metaName.substring(1);
            let memberMeta = metaData[type][bareName];
            if (memberMeta) {
              memberMeta.annotation = forceArray(annotations[metaName]);
            }
          }
          path.traverse(this.__dependencyScanner);
        }
      });
      if (ctorAnnotations["@construct"] && metaData.construct) {
        metaData.construct.annotation = forceArray(ctorAnnotations["@construct"]);
      }
      if (ctorAnnotations["@destruct"] && metaData.destruct) {
        metaData.destruct.annotation = forceArray(ctorAnnotations["@destruct"]);
      }
    },

    /**
     * Scans the properties in the class definition
     *
     * @param {NodePath[]} paths
     */
    __scanProperties(paths) {
      let metaData = this.__metaData;
      if (!metaData.properties) {
        metaData.properties = {};
      }

      /**
       *
       * @param {NodePath} path
       */
      const traversePath = path => {
        path.skip();
        let property = path.node;
        let name = qx.tool.utils.BabelHelpers.collapseMemberExpression(property.key);

        let propMeta = (metaData.properties[name] = {});

        let visitor = {
          ObjectProperty(path) {
            let prop = path.node;
            path.skip();
            let value = prop.value;
            let key = prop.key.type == "Identifier" ? prop.key.name : prop.key.value;
            switch (key) {
              case "nullable": {
                propMeta.nullable = prop.value.value;
                break;
              }
              case "check": {
                if (value.type == "ArrayExpression") {
                  propMeta.check = value.elements.map(el => el.value);
                } else {
                  propMeta.check = value.value;
                }
                break;
              }
              case "@": {
                if (value.type == "ArrayExpression") {
                  //Serialize the elements of the array to raw JavaScript syntax which can be eval()ed later
                  propMeta.annotation = value.elements.map((el, index) => path.get(`value.elements.${index}`).getSource());
                } else {
                  //Serialize the single annotation to JavaScript syntax
                  propMeta.annotation = [path.get("value").getSource()];
                }
                break;
              }
              case "refine": {
                propMeta.refine = prop.value.value;
                break;
              }
              case "init": {
                //we don't evaluate init. We just take the raw source because it can be any expression which the compiler might not be able to evaluate.
                propMeta.init = path.get("value").getSource();
                break;
              }
            }
          }
        };
        path.traverse(visitor);

        Object.assign(propMeta, {
          location: {
            start: path.node.loc.start,
            end: path.node.loc.end
          },

          jsdoc: qx.tool.utils.BabelHelpers.getJsDoc(property.leadingComments)
        });
      };

      paths.forEach(traversePath);
    }
  }
});
