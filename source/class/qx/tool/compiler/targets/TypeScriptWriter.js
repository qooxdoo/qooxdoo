/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
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
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

/**
 * Generates TypeScript .d.ts files
 */
qx.Class.define("qx.tool.compiler.targets.TypeScriptWriter", {
  extend: qx.core.Object,

  /**
   *
   * @param {qx.tool.compiler.targets.MetaDatabase} metaDb loaded database
   */
  construct(metaDb) {
    super();
    this.__metaDb = metaDb;
  },

  properties: {
    outputTo: {
      init: "qooxdoo.d.ts",
      check: "String"
    }
  },

  members: {
    /** @type{qx.tool.compiler.MetaDatabase} */
    __metaDb: null,

    /** @type{Stream} where to write the .d.ts */
    __outputStream: null,

    __outputStreamClosed: null,

    /** @type{qx.tool.compiler.MetaExtraction} */
    __currentClass: null,

    /** Current indent */
    __indent: "    ",

    /**
     * Opens the stream to write to
     */
    async open() {
      var time = new Date();
      this.__outputStream = fs.createWriteStream(this.getOutputTo());
      this.__outputStreamClosed = new qx.Promise();
      this.__outputStream.on("close", () =>
        this.__outputStreamClosed.resolve()
      );

      this.write(`// Generated declaration file at ${time}\n`);

      let str = qx.util.ResourceManager.getInstance().toUri(
        "qx/tool/cli/templates/TypeScriptWriter-base_declaration.txt"
      );
      let baseDeclaration = await fs.promises.readFile(str, "utf8");
      this.write(baseDeclaration);
    },

    /**
     * Closes the stream
     */
    async close() {
      this.write("}\n");
      await this.__outputStream.end();
      this.__outputStream = null;
      await this.__outputStreamClosed;
      this.__outputStreamClosed = null;
    },

    /**
     * Processes a list of filename and generates the .d.ts
     *
     */
    async process() {
      await this.open();
      let classnames = this.__metaDb.getClassnames();
      classnames.sort();
      let lastPackageName = null;
      for (let classname of classnames) {
        let metaData = this.__metaDb.getMetaData(classname);
        var pos = classname.lastIndexOf(".");
        var packageName = "";
        if (pos > -1) {
          packageName = classname.substring(0, pos);
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
        await this.writeClass(metaData);
      }
      await this.close();
    },

    /**
     * Write a piece of code to the declaration file
     */
    write(msg) {
      this.__outputStream.write(msg);
    },

    /**
     * Write the class or interface declaration
     */
    async writeClass(meta) {
      if (!meta.className) {
        return;
      }

      this.__currentClass = meta;
      // qx.tool.compiler.Console.info("Processing class " + meta.packageName + "." + meta.name);
      var extendsClause = "";
      if (
        meta.superClass &&
        meta.superClass !== "Object" &&
        meta.superClass !== "Array" &&
        meta.superClass !== "Error"
      ) {
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
      let name = meta.className;
      let pos = name.lastIndexOf(".");
      if (pos > -1) {
        name = name.substring(pos + 1);
      }
      this.write("  " + type + name + extendsClause);

      if (meta.interfaces && meta.interfaces.length) {
        this.write(" implements " + meta.interfaces.join(", "));
      }

      this.write(" {\n");

      if (meta.type == "class" && meta.construct) {
        this.writeConstructor(meta.construct);
      }

      if (meta.isSingleton) {
        this.writeMethods(
          {
            getInstance: {
              type: "function",
              access: "public",
              jsdoc: {
                "@return": [{ type: meta.className }]
              }
            }
          },

          meta,
          true
        );
      }

      this.writeMethods(meta.statics, meta, true);
      this.writeMethods(meta.members, meta);

      if (meta.properties) {
        this.writeProperties(meta);
      }

      this.write("\n  }\n");
      this.__currentClass = null;
    },

    /**
     * Writes the property accessors
     *
     * @param {*} meta
     */
    writeProperties(meta) {
      for (let propertyName in meta.properties) {
        let propertyMeta = meta.properties[propertyName];
        let upname = qx.lang.String.firstUp(propertyName);
        let type = propertyMeta.check || "any";
        if (!propertyMeta.group) {
          this.__writeMethod("get" + upname, {
            returnType: type,
            description: `Gets the ${propertyName} property`
          });
          if (type == "Boolean") {
            this.__writeMethod("is" + upname, {
              returnType: type,
              description: `Gets the ${propertyName} property`
            });
          }
        }
        this.__writeMethod("set" + upname, {
          params: [{ name: "value", type }],
          description: `Sets the ${propertyName} property`
        });
        this.__writeMethod("reset" + upname, {
          description: `Resets the ${propertyName} property`
        });

        if (propertyMeta.async) {
          this.__writeMethod("get" + upname + "Async", {
            returnType: type,
            description: `Gets the ${propertyName} property, asynchronously`
          });
          if (type == "Boolean") {
            this.__writeMethod("is" + upname + "Async", {
              returnType: type,
              description: `Gets the ${propertyName} property, asynchronously`
            });
          }
          this.__writeMethod("set" + upname + "Async", {
            params: [{ name: "value", type }],
            description: `Sets the ${propertyName} property`
          });
        }
      }
    },

    /**
     * Do the mapping of types from Qooxdoo to TypeScript
     *
     * @param {String} typename the name of the type to convert
     * @return {String} the Typescript name, if possible
     */
    getType(typename) {
      var defaultType = "any";
      if (!typename || typename == "[[ Function ]]") {
        return defaultType;
      }
      if (typeof typename == "object") {
        typename = typename.name;
      }

      // Check if we have a mapping for this type
      var result =
        qx.tool.compiler.targets.TypeScriptWriter.TYPE_MAPPINGS[typename];
      if (result) {
        return result;
      }

      if (this.__metaDb.getMetaData(typename)) {
        return typename;
      }

      // We don't know the type
      // qx.tool.compiler.Console.error("Unknown type: " + typename);
      return defaultType;
    },

    /**
     * Write a constructor
     */
    writeConstructor(methodMeta) {
      this.write(
        this.__indent +
          "constructor (" +
          this.__serializeParameters(methodMeta.params) +
          ");\n"
      );
    },

    /**
     * @typedef {Object} MethodMeta
     * @property {Boolean} access
     * @property {Boolean} abstract
     * @property {Boolean} async
     * @property {Boolean} static
     * @property {Boolean} mixin
     * @property {Array} parameters JSDoc parameters and types
     * @property {*} returnType JSDoc return type
     * @property {String} description
     * @property {Boolean} hideMethod
     *
     * @param {String} methodName
     * @param {MethodMeta} config
     */
    __writeMethod(methodName, config) {
      var decl = "";
      var comment = "";

      if (config.access === "protected") {
        decl += "protected ";
      }
      if (config.access === "private") {
        return;
      }
      if (config.static) {
        decl += "static ";
      }

      if (config.abstract) {
        decl += "abstract ";
        comment += "Abstract ";
      }
      if (config.mixin) {
        comment += "Mixin ";
      }
      decl += this.__escapeMethodName(methodName) + "(";

      if (config.parameters) {
        decl += this.__serializeParameters(config.parameters);
      }
      decl += ")";

      var returnType = "void";
      if (config.returnType) {
        returnType = this.getType(config.returnType.type);
      }
      decl += ": " + returnType;

      if (comment) {
        comment = " // " + comment;
      }

      if (config.description) {
        this.write(this.__indent + "/**\n");
        config.description.split("\n").forEach(line => {
          this.write(this.__indent + " * " + line + "\n");
        });
        this.write(this.__indent + " */\n");
      }

      this.write(
        this.__indent +
          (config.hideMethod ? "// " : "") +
          decl +
          ";" +
          comment +
          "\n"
      );
    },

    __serializeParameters(params) {
      let arr = params.map(paramMeta => {
        var decl = paramMeta.name;
        let optional = paramMeta.optional;
        if (paramMeta.name == "varargs") {
          optional = true;
        }
        if (optional) {
          decl += "?";
        }
        decl += ": ";
        let type = "any";
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
        return decl;
      });
      return arr.join(", ");
    },

    /**
     * Write all the methods of a type
     */
    writeMethods(methods, classMeta, isStatic = false) {
      if (!methods || !Object.keys(methods).length) {
        return;
      }
      var IGNORE =
        qx.tool.compiler.targets.TypeScriptWriter.IGNORE[
          this.__currentClass.className
        ];

      var comment = isStatic ? "Statics" : "Members";
      for (var name in methods) {
        var methodMeta = methods[name];
        if (methodMeta.type == "function") {
          this.__writeMethod(name, {
            access: methodMeta.access,
            abstract: classMeta.type != "interface" && methodMeta.abstract,
            async: methodMeta.async,
            static: isStatic,
            mixin: methodMeta.mixin,
            parameters: methodMeta.params,
            returnType: methodMeta.returnType,
            description: methodMeta.jsdoc?.["@description"]?.[0]?.body,
            hideMethod: IGNORE && IGNORE.indexOf(name) > -1
          });
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
    __escapeMethodName(name) {
      if (!name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        return '"' + name + '"';
      }
      return name;
    },

    /**
     * Write the module declaration if any.
     */
    async writeModule(meta) {
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
      "qx.ui.virtual.core.CellEvent": ["init"],
      "qx.ui.table.columnmodel.resizebehavior.Default": ["set"],
      "qx.ui.progressive.renderer.table.Widths": ["set"],
      "qx.ui.table.columnmodel.resizebehavior": ["set"],
      "qx.ui.table.pane.CellEvent": ["init"],
      "qx.ui.mobile.dialog.Manager": ["error"],
      "qx.ui.mobile.container.Navigation": ["add"],
      "qx.ui.website.Table": ["filter", "sort"],
      "qx.ui.website.DatePicker": ["init", "sort"],
      "qx.event.type.Orientation": ["init"],
      "qx.event.type.KeySequence": ["init"],
      "qx.event.type.KeyInput": ["init"],
      "qx.event.type.GeoPosition": ["init"],
      "qx.event.type.Drag": ["init"],
      "qx.bom.request.SimpleXhr": ["addListener", "addListenerOnce"],
      "qx.event.dispatch.AbstractBubbling": ["dispatchEvent"],
      "qx.event.dispatch.Direct": ["dispatchEvent"],
      "qx.event.dispatch.MouseCapture": ["dispatchEvent"],
      "qx.event.type.Native": ["init"],
      "qx.html.Element": ["removeListener", "removeListenerById"],
      "qx.html.Flash": ["setAttribute"],
      "qx.util.LibraryManager": ["get", "set"]
    },

    TYPE_MAPPINGS: {
      Widget: "qx.ui.core.Widget",
      LayoutItem: "qx.ui.core.LayoutItem",
      AbstractTreeItem: "qx.ui.tree.core.AbstractTreeItem",
      ILayer: "qx.ui.virtual.core.ILayer",
      Axis: "qx.ui.virtual.core.Axis",
      DateFormat: "qx.util.format.DateFormat",
      LocalizedString: "qx.locale.LocalizedString",
      Decorator: "qx.ui.decoration.Decorator",
      Event: "qx.event.type.Event",
      CanvasRenderingContext2D: "CanvasRenderingContext2D",
      MWidgetController: "qx.ui.list.core.MWidgetController",
      IDesktop: "qx.ui.window.IDesktop",
      IWindowManager: "qx.ui.window.IWindowManager",
      Pane: "qx.ui.virtual.core.Pane",
      Class: "qx.Class",
      Interface: "qx.Interface",
      Mixin: "qx.Mixin",
      Theme: "qx.Theme",
      Boolean: "boolean",
      String: "string",
      Color: "string",
      Font: "string",
      Function: "Function",
      Date: "Date",
      Window: "Window",
      Document: "Document",
      document: "Document",
      Stylesheet: "StyleSheet",
      Node: "Node",
      "Custom check function": "Custom check function",
      Error: "ErrorImpl",
      Element: "HTMLElement",
      RegExp: "RegExp",
      var: "any",
      Array: "qx.data.Array",
      Object: "any",
      Map: "IMap",
      Integer: "number",
      Number: "number",
      Double: "number",
      Float: "number",
      PositiveInteger: "number",
      PositiveNumber: "number"
    }
  }
});
