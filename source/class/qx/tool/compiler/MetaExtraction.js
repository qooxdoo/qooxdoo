const fs = require("fs");
const path = require("upath");
const babelCore = require("@babel/core");
const types = require("@babel/types");

qx.Class.define("qx.tool.compiler.MetaExtraction", {
  extend: qx.core.Object,

  construct(metaRootDir) {
    super();
    this.setMetaRootDir(metaRootDir || null);
  },

  properties: {
    /** Root directory for meta data; if provided then paths are stored relative, not absolute, which helps make
     * meta directories relocatable
     */
    metaRootDir: {
      init: null,
      nullable: true,
      check: "String"
    }
  },

  statics: {
    /** Meta Data Version - stored in meta data files */
    VERSION: 0.2
  },

  members: {
    /** @type{Object} the parsed data*/
    __metaData: null,

    /**
     * Loads the meta from disk
     *
     * @param {String} filename
     */
    async loadMeta(filename) {
      let metaData = await qx.tool.utils.Json.loadJsonAsync(filename);
      if (metaData.version === qx.tool.compiler.MetaExtraction.VERSION) {
        this.__metaData = metaData;
      } else {
        this.__metaData = null;
      }
    },

    /**
     * Saves the meta to disk
     *
     * @param {String} filename
     */
    async saveMeta(filename) {
      await qx.tool.utils.Utils.makeParentDir(filename);
      await qx.tool.utils.Json.saveJsonAsync(filename, this.__metaData);
    },

    /**
     * Returns the actual meta data
     *
     * @returns {*}
     */
    getMetaData() {
      return this.__metaData;
    },

    /**
     * Checks whether the meta data is out of date compared to the last modified
     * timestamp of the classname
     *
     * @returns {Boolean}
     */
    async isOutOfDate() {
      let classFilename = this.__metaData.classFilename;
      if (this.getMetaRootDir()) {
        classFilename = path.join(this.getMetaRootDir(), classFilename);
      }
      let stat = await fs.promises.stat(classFilename);
      let lastModified = this.__metaData?.lastModified;
      if (lastModified && lastModified == stat.mtime.getTime()) {
        return false;
      }
      return true;
    },

    /**
     * Parses the file and returns the metadata
     *
     * @param {String} classFilename the .js file to parse
     * @return {Object}
     */
    async parse(classFilename) {
      classFilename = await qx.tool.utils.files.Utils.correctCase(
        classFilename
      );
      let stat = await fs.promises.stat(classFilename);
      this.__metaData = {
        version: qx.tool.compiler.MetaExtraction.VERSION,
        lastModified: stat.mtime.getTime(),
        lastModifiedIso: stat.mtime.toISOString()
      };

      if (this.getMetaRootDir()) {
        this.__metaData.classFilename = path.relative(
          this.getMetaRootDir(),
          classFilename
        );
      } else {
        this.__metaData.classFilename = path.resolve(classFilename);
      }

      let src = await fs.promises.readFile(classFilename, "utf8");
      let babelConfig = {
        options: {
          modules: false
        }
      };
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

      let result;
      result = babelCore.transform(src, config);
      return this.__metaData;
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
            path.get("body").forEach(path => {
              let node = path.node;
              if (
                node.type == "ExpressionStatement" &&
                node.expression.type == "CallExpression"
              ) {
                let str = qx.tool.utils.BabelHelpers.collapseMemberExpression(
                  node.expression.callee
                );
                let m = str.match(/^qx\.([a-z]+)\.define$/i);
                let definingType = m && m[1];
                if (definingType) {
                  metaData.type = definingType.toLowerCase();
                  metaData.className = node.expression.arguments[0].value;
                  if (typeof metaData.className != "string") {
                    metaData.className = null;
                  }
                  metaData.jsdoc = qx.tool.utils.BabelHelpers.getJsDoc(
                    node.leadingComments
                  );
                  t.__scanClassDef(path.get("expression.arguments")[1]);
                }
              }
            });
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

      path.skip();
      path.get("properties").forEach(path => {
        let property = path.node;

        // Extend
        if (property.key.name == "extend") {
          metaData.superClass =
            qx.tool.utils.BabelHelpers.collapseMemberExpression(property.value);

          // Core
        } else if (
          property.key.name == "implement" ||
          property.key.name == "include"
        ) {
          let name = property.key.name == "include" ? "interfaces" : "mixins";
          metaData[name] = [];
          if (property.value.type == "ArrayExpression") {
            property.value.elements.forEach(element => {
              metaData[name].push(
                qx.tool.utils.BabelHelpers.collapseMemberExpression(element)
              );
            });
          } else {
            metaData[name].push(
              qx.tool.utils.BabelHelpers.collapseMemberExpression(
                property.value
              )
            );
          }

          // Type
        } else if (property.key.name == "type") {
          metaData.isSingleton = property.value.value == "singleton";
          metaData.abstract = property.value.value == "abstract";

          // Methods
        } else if (
          property.key.name == "construct" ||
          property.key.name == "destruct"
        ) {
          let memberMeta = (metaData[property.key.name] = {
            type: "function",
            params: []
          });
          getFunctionParams(property).forEach(param => {
            memberMeta.params.push({
              name: qx.tool.utils.BabelHelpers.collapseMemberExpression(param)
            });
          });

          // Events
        } else if (property.key.name == "events") {
          metaData.events = {};
          property.value.properties.forEach(event => {
            let name = event.key.name;
            metaData.events[name] = {
              type: null,
              jsdoc: qx.tool.utils.BabelHelpers.getJsDoc(event.leadingComments)
            };
            if (event.value.type == "StringLiteral") {
              metaData.events[name].type = event.value.value;
            }
          });

          // Properties
        } else if (property.key.name == "properties") {
          this.__scanProperties(path.get("value.properties"));

          // Members & Statics
        } else if (
          property.key.name == "members" ||
          property.key.name == "statics"
        ) {
          let type = property.key.name;
          metaData[type] = {};
          property.value.properties.forEach(member => {
            let name = qx.tool.utils.BabelHelpers.collapseMemberExpression(
              member.key
            );
            let memberMeta = (metaData[type][name] = {
              jsdoc: qx.tool.utils.BabelHelpers.getJsDoc(member.leadingComments)
            });
            memberMeta.access = name.startsWith("__")
              ? "private"
              : name.startsWith("_")
              ? "protected"
              : "public";
            if (member.type == "ObjectMethod") {
              memberMeta.type = "function";
              memberMeta.params = [];
              member.params.forEach(param => {
                memberMeta.params.push({
                  name: qx.tool.utils.BabelHelpers.collapseMemberExpression(
                    param
                  )
                });
              });
            }
          });
        }
      });
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

      paths.forEach(path => {
        path.skip();
        let property = path.node;
        let name = qx.tool.utils.BabelHelpers.collapseMemberExpression(
          property.key
        );
        metaData.properties[name] = {
          json: qx.tool.utils.BabelHelpers.collectJson(property.value, true),
          jsdoc: qx.tool.utils.BabelHelpers.getJsDoc(property.leadingComments)
        };
      });
    },

    fixupJsDoc(typeResolver) {
      let metaData = this.__metaData;

      const fixupEntry = obj => {
        if (obj && obj.jsdoc) {
          qx.tool.compiler.jsdoc.Parser.parseJsDoc(obj.jsdoc, typeResolver);
          if (obj.jsdoc["@param"] && obj.params) {
            let paramsLookup = {};
            obj.params.forEach(param => {
              paramsLookup[param.name] = param;
            });
            obj.jsdoc["@param"].forEach(paramDoc => {
              let param = paramsLookup[paramDoc.paramName];
              if (param) {
                if (paramDoc.type) {
                  param.type = paramDoc.type;
                }
                if (paramDoc.optional !== undefined) {
                  param.optional = paramDoc.optional;
                }
                if (paramDoc.defaultValue !== undefined) {
                  param.defaultValue = paramDoc.defaultValue;
                }
              }
            });
          }
          let returnDoc = obj.jsdoc["@return"]?.[0];
          if (returnDoc) {
            obj.returnType = {
              type: returnDoc.type
            };
            if (returnDoc.optional !== undefined) {
              obj.returnType.optional = returnDoc.optional;
            }
            if (returnDoc.defaultValue !== undefined) {
              obj.returnType.defaultValue = returnDoc.defaultValue;
            }
          }
          if (obj.jsdoc["@throws"]?.length) {
            obj.returnType = obj.jsdoc["@throws"][0]?.type;
          }
        }
      };

      const fixupSection = sectionName => {
        var section = metaData[sectionName];
        if (section) {
          for (var name in section) {
            fixupEntry(section[name]);
          }
        }
      };

      fixupSection("properties");
      fixupSection("events");
      fixupSection("members");
      fixupSection("statics");
      fixupEntry(metaData.clazz);
      fixupEntry(metaData.construct);
      fixupEntry(metaData.destruct);
      fixupEntry(metaData.defer);
    }
  }
});
