/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * JBaron (Peter, @jbaron)
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * *********************************************************************** */

var path = require("path");

var fs = require("fs");
var jsonlint = require("jsonlint");
const {promisify} = require("util");
const readFile = promisify(fs.readFile);
/**
 * Generates TypeScript .d.ts files
 */
qx.Class.define("qx.tool.compiler.targets.TypeScriptWriter", {
  extend: qx.core.Object,

  construct: function(target) {
    this.base(arguments);
    this.__target = target;
  },

  properties: {
    outputTo: {
      init: "qooxdoo.d.ts",
      check: "String"
    }
  },

  members: {
    __indent: "    ",
    __outputStream: null,
    __classes: null,
    __target: null,
    __apiCache: null,
    __dirname: null,
    __currentClass: null,

    /**
     * Generates the .d.ts file
     *
     * @param application
     *          {qx.tool.compiler.app.Application?} the application; if not
     *          provided, all classes are output
     */
    run: async function(application) {
      this.__apiCache = {};
      await new Promise((resolve, reject) => {
        var time = new Date();
        this.__outputStream = fs.createWriteStream(path.join(this.__target.getOutputDir(), this.getOutputTo()));
        this.write(`// Generated declaration file at ${time}\n`);

        this.writeBase()
          .then(async () => {
            var analyser = this.__target.getAnalyser();
            this.__classes = new qx.tool.utils.IndexedArray();
            if (application) {
              application.getDependencies().forEach(classname => {
                if (classname != "q" && classname != "qxWeb") {
                  this.__classes.push(classname);
                }
              });
            } else {
              analyser.getLibraries().forEach(library => {
                var symbols = library.getKnownSymbols();
                for (var name in symbols) {
                  var type = symbols[name];
                  if (type === "class" && name !== "q" && name !== "qxWeb") {
                    this.__classes.push(name);
                  }
                }
              });
            }
            this.__classes.sort();

            var lastPackageName = null;
            var classIndex = 0;
            var next = () => {
              if (classIndex >= this.__classes.getLength()) {
                return undefined;
              }

              var className = this.__classes.getItem(classIndex++);
              var pos = className.lastIndexOf(".");
              var packageName = "";
              if (pos > -1) {
                packageName = className.substring(0, pos);
              }
              if (lastPackageName != packageName) {
                if (lastPackageName !== null) {
                  this.write("}\n");
                }
                if (packageName) {
                  this.write("declare module " + packageName + " {\n");
                } else {
                  this.write("declare {\n");
                }
                lastPackageName = packageName;
              }
              return this.loadAPIFile(className)
                .then(meta => this.writeClass(meta))
                .then(() => next())
                .catch(err => this.error("Error while processing file: " + className + " error: " + err.stack));
            };

            return next()
              .then(() => this.write("}\n"))
              .then(() => this.__outputStream.end());
          })
          .then(resolve)
          .catch(reject);
      });
    },

    /**
     * Write a piece of code to the declaration file
     */
    write: function(msg) {
      this.__outputStream.write(msg);
    },

    /**
     * Load a single API file
     * @async
     */
    loadAPIFile: function(classname) {
      if (classname === "Object" || classname === "Array" || classname === "Error") {
        return null;
      }
      if (this.__apiCache[classname]) {
        return Promise.resolve(this.__apiCache[classname]);
      }
      var fileName = path.join(this.__target.getOutputDir(), "transpiled", classname.replace(/\./g, "/") + ".json");
      return readFile(fileName, "UTF-8")
        .then(content => this.__apiCache[classname] = jsonlint.parse(content))
        .catch(err => this.error("Error parsing " + classname + ": " + err.stack));
    },

    /**
     * Write some util declarations out that will help with the rest
     * @async
     */
    writeBase: function() {
      return readFile(path.join(__dirname, "TypeScriptWriter-base_declaration.txt"), "UTF-8")
        .then(content => this.write(content));
    },

    /**
     * Do the mapping of types from Qooxdoo to TypeScript
     */
    getType: function(t) {
      var defaultType = "any";
      if (!t || t == "[[ Function ]]") {
        return defaultType;
      }
      if (typeof t == "object") {
        t = t.name;
      }

      // Check if we have a mapping for this type
      var result = qx.tool.compiler.targets.TypeScriptWriter.TYPE_MAPPINGS[t];
      if (result) {
        return result;
      }

      if (this.__classes.contains(t)) {
        return t;
      }

      // We don't know the type
      // this.error("Unknown type: " + t);
      return defaultType;
    },

    /**
     * Write a constructor
     */
    writeConstructor: function(methodMeta) {
      this.write(this.__indent + "constructor (" + this.serializeParameters(methodMeta, true) + ");\n");
    },

    /**
     * Write all the methods of a type
     */
    writeMethods: function(methods, classMeta, isStatic = false) {
      if (!methods || !Object.keys(methods).length) {
        return;
      }
      var IGNORE = qx.tool.compiler.targets.TypeScriptWriter.IGNORE[this.__currentClass.className];
      var comment = isStatic ? "Statics" : "Members";
      for (var name in methods) {
        var methodMeta = methods[name];
        if (methodMeta.type == "function") {
          var hideMethod = IGNORE && IGNORE.indexOf(name) > -1;

          var decl = "";
          comment = "";

          if (methodMeta.access) {
            if (methodMeta.access === "protected") {
              decl += "protected ";
            }
            if (methodMeta.access === "private") {
              continue;
            }
          }
          if (isStatic) {
            decl += "static ";
          }

          if (classMeta.type != "interface" && methodMeta.abstract) {
            decl += "abstract ";
            comment += "Abstract ";
          }
          if (methodMeta.mixin) {
            comment += "Mixin ";
          }
          if (methodMeta.overriddenFrom) {
            comment += "Overridden from " + methodMeta.overriddenFrom + " ";
          }
          decl += this.__escapeMethodName(name) + "(";
          decl += this.serializeParameters(methodMeta);
          decl += ")";

          var returnType = "void";
          if (methodMeta.jsdoc && methodMeta.jsdoc["@return"]) {
            var tag = methodMeta.jsdoc["@return"][0];
            if (tag && tag.type) {
              returnType = this.getType(tag.type);
            }
          }
          decl += ": " + returnType;

          if (comment) {
            comment = " // " + comment;
          }

          let hasDescription = methodMeta.jsdoc && methodMeta.jsdoc["@description"] && methodMeta.jsdoc["@description"][0];

          if (hasDescription) {
            this.write(this.__indent + "/**\n");
            methodMeta.jsdoc["@description"][0].body.split("\n").forEach(line => {
              this.write(this.__indent + " * " + line + "\n");
            });
            this.write(this.__indent + " */\n");
          }

          this.write(this.__indent + (hideMethod ? "// " : "") + decl + ";" + comment + "\n");
        }
      }
    },

    /**
     * Escapes the name with quote marks, only if necessary
     *
     * @param name
     *          {String} the name to escape
     * @return {String} the escaped (if necessary) name
     */
    __escapeMethodName: function(name) {
      if (!name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        return "\"" + name + "\"";
      }
      return name;
    },

    /**
     * Serializes all the arguments of a method. Once one parameter is optional,
     * the remaining ones are also optional (is a TypeScript requirement)
     *
     * @return {String}
     */
    serializeParameters: function(methodMeta, optional = false) {
      var result = "";
      if (methodMeta && methodMeta.jsdoc) {
        var params = methodMeta.jsdoc["@param"];
        if (params) {
          params.forEach((paramMeta, paramIndex) => {
            var type = "any";
            var paramName = paramMeta.paramName || ("unnamed" + paramIndex);
            var decl = paramName;
            if (paramName == "varargs") {
              optional = true;
            }
            if (paramMeta.optional || optional) {
              decl += "?";
              optional = true;
            }
            decl += ": ";
            if (paramMeta.type) {
              var tmp = null;
              if (qx.lang.Type.isArray(paramMeta.type)) {
                if (paramMeta.type.length == 1) {
                  tmp = paramMeta.type[0];
                }
              } else {
                tmp = paramMeta.type;
              }
              if (tmp) {
                type = this.getType(tmp);
                if (tmp.dimensions) {
                  type += "[]";
                }
              }
            }
            decl += type;
            if (paramIndex > 0) {
              result += ", ";
            }
            result += decl;
          });
        }
      }
      return result;
    },

    /**
     * Write the class or interface declaration
     */
    writeClass: async function(meta) {
      this.__currentClass = meta;
      // this.info("Processing class " + meta.packageName + "." + meta.name);
      var extendsClause = "";
      if (meta.superClass && meta.superClass !== "Object" && meta.superClass !== "Array" && meta.superClass !== "Error") {
        let superType = this.getType(meta.superClass);
        if (superType != "any") {
          extendsClause = " extends " + superType;
        }
      }
      var type = "class "; // default for class and mixins
      if (meta.type === "interface") {
        type = "interface ";
      } else if (meta.abstract) {
        type = "abstract " + type;
      }
      this.write("  // " + meta.className + "\n");
      this.write("  " + type + meta.name + extendsClause);

      if (meta.interfaces && meta.interfaces.length) {
        this.write(" implements " + meta.interfaces.join(", "));
      }

      this.write(" {\n");

      if (meta.type == "class") {
        this.writeConstructor(meta.construct);
      }

      if (meta.isSingleton) {
        this.writeMethods({
          getInstance: {
            type: "function",
            access: "public",
            jsdoc: {
              "@return": [{ type: meta.className }]
            }
          }
        }, meta, true);
      }

      this.writeMethods(meta.statics, meta, true);
      this.writeMethods(meta.members, meta);
      this.write("\n  }\n");
      this.__currentClass = null;
    },

    /**
     * Write the module declaration if any.
     */
    writeModule: async function(meta) {
      var moduleName = meta.packageName;
      if (moduleName) {
        this.write("declare module " + moduleName + " {\n");
      } else {
        this.write("declare ");
      }
      await this.writeClass(meta);
      if (moduleName) {
        this.write("}\n");
      }
    }
  },

  statics: {
    IGNORE: {
      "qx.ui.virtual.core.CellEvent": [ "init"],
      "qx.ui.table.columnmodel.resizebehavior.Default": [ "set" ],
      "qx.ui.progressive.renderer.table.Widths": [ "set" ],
      "qx.ui.table.columnmodel.resizebehavior": [ "set" ],
      "qx.ui.table.pane.CellEvent": [ "init" ],
      "qx.ui.mobile.dialog.Manager": [ "error" ],
      "qx.ui.mobile.container.Navigation": [ "add" ],
      "qx.ui.website.Table": [ "filter", "sort" ],
      "qx.ui.website.DatePicker": [ "init", "sort" ],
      "qx.event.type.Orientation": [ "init" ],
      "qx.event.type.KeySequence": [ "init" ],
      "qx.event.type.KeyInput": [ "init" ],
      "qx.event.type.GeoPosition": [ "init" ],
      "qx.event.type.Drag": [ "init" ],
      "qx.bom.request.SimpleXhr": [ "addListener", "addListenerOnce" ],
      "qx.event.dispatch.AbstractBubbling": [ "dispatchEvent" ],
      "qx.event.dispatch.Direct": [ "dispatchEvent" ],
      "qx.event.dispatch.MouseCapture": [ "dispatchEvent" ],
      "qx.event.type.Native": [ "init" ],
      "qx.html.Element": [ "removeListener", "removeListenerById" ],
      "qx.html.Flash": ["setAttribute"],
      "qx.util.LibraryManager": [ "get", "set" ]
    },

    TYPE_MAPPINGS: {
      "Widget": "qx.ui.core.Widget",
      "LayoutItem": "qx.ui.core.LayoutItem",
      "AbstractTreeItem": "qx.ui.tree.core.AbstractTreeItem",
      "ILayer": "qx.ui.virtual.core.ILayer",
      "Axis": "qx.ui.virtual.core.Axis",
      "DateFormat": "qx.util.format.DateFormat",
      "LocalizedString": "qx.locale.LocalizedString",
      "Decorator": "qx.ui.decoration.Decorator",
      "Event": "qx.event.type.Event",
      "CanvasRenderingContext2D": "CanvasRenderingContext2D",
      "MWidgetController": "qx.ui.list.core.MWidgetController",
      "IDesktop": "qx.ui.window.IDesktop",
      "IWindowManager": "qx.ui.window.IWindowManager",
      "Pane": "qx.ui.virtual.core.Pane",
      "Class": "qx.Class",
      "Interface": "qx.Interface",
      "Mixin": "qx.Mixin",
      "Theme": "qx.Theme",
      "Boolean": "boolean",
      "String": "string",
      "Color": "string",
      "Font": "string",
      "Function": "Function",
      "Date": "Date",
      "Window": "Window",
      "Document": "Document",
      "document": "Document",
      "Stylesheet": "StyleSheet",
      "Node": "Node",
      "Custom check function": "Custom check function",
      "Error": "ErrorImpl",
      "Element": "HTMLElement",
      "RegExp": "RegExp",
      "var": "any",
      "Array": "qx.data.Array",
      "Object": "any",
      "Map": "IMap",
      "Integer": "number",
      "Number": "number",
      "Double": "number",
      "Float": "number",
      "PositiveInteger": "number",
      "PositiveNumber": "number"
    }
  }
});
