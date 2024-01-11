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
    /** @type {qx.tool.compiler.MetaDatabase} */
    __metaDb: null,

    /** @type {Stream} where to write the .d.ts */
    __outputStream: null,

    __outputStreamClosed: null,

    /** @type {qx.tool.compiler.MetaExtraction} */
    __currentClass: null,

    /** @type {object} */
    __hierarchy: null,

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
        "qx/tool/cli/templates/TypeScriptWriter-base_declaration.d.ts"
      );

      let baseDeclaration = await fs.promises.readFile(str, "utf8");
      this.write(baseDeclaration + "\n");
    },

    /**
     * Closes the stream
     */
    async close() {
      await this.__outputStream.end();
      this.__outputStream = null;
      await this.__outputStreamClosed;
      this.__outputStreamClosed = null;

      // add global declaration file for tooling (eg, text editor) support
      const globalFile = path.join("source", "global.d.ts");
      if (!fs.existsSync(globalFile)) {
        fs.writeFileSync(
          globalFile,
          [
            "// the reference directive enables tooling to discover the generated type definitions",
            `/// <reference path="../${this.getOutputTo()}" />`,
            "",
            "// add custom global declarations here"
          ].join("\n")
        );
      }
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
      let declared = false;
      for (let classname of classnames) {
        let metaData = this.__metaDb.getMetaData(classname);
        var pos = classname.lastIndexOf(".");
        var packageName = "";
        if (pos > -1) {
          packageName = classname.substring(0, pos);
        }
        if (lastPackageName != packageName) {
          if (lastPackageName) {
            this.write("}\n\n");
          }
          if (packageName) {
            this.write("declare module " + packageName + " {\n");
            declared = true;
          } else {
            declared = false;
          }
          lastPackageName = packageName;
        } else {
          this.write("\n");
        }
        await this.writeClass(metaData, declared);
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
    async writeClass(meta, declared) {
      if (!meta.className) {
        return;
      }

      this.__currentClass = meta;
      this.__hierarchy = this.__metaDb.getHierarchyFlat(meta);
      // qx.tool.compiler.Console.info("Processing class " + meta.packageName + "." + meta.name);
      var extendsClause = "";
      if (
        meta.superClass &&
        meta.superClass !== "Object" &&
        meta.superClass !== "Array" &&
        meta.superClass !== "Error"
      ) {
        if (meta.type === "interface" && Array.isArray(meta.superClass)) {
          let superTypes = meta.superClass.map(sup => this.getType(sup));
          superTypes.filter(sup => sup != "any");
          if (superTypes.length) {
            extendsClause = " extends " + superTypes.join(", ");
          }
        } else {
          let superType = this.getType(meta.superClass);
          if (superType != "any") {
            extendsClause = " extends " + superType;
          }
        }
      }
      var type = "class "; // default for class and mixins
      if (meta.type === "interface") {
        type = "interface ";
      } else if (meta.abstract) {
        type = "abstract " + type;
      }
      if (!declared) {
        type = "declare " + type;
      }

      this.__writeJsDoc(meta.jsdoc?.raw, meta.location);
      this.write("  // " + meta.className + "\n");
      let name = meta.className;
      let pos = name.lastIndexOf(".");
      if (pos > -1) {
        name = name.substring(pos + 1);
      }
      this.write("  " + type + name + extendsClause);

      if (meta.interfaces && meta.interfaces.length) {
        this.write(
          " implements " +
            meta.interfaces.map(itf => this.getType(itf)).join(", ")
        );
      }

      this.write(" {\n");

      if (meta.type == "class" && meta.construct) {
        this.writeConstructor(meta.construct);
      }

      this.writeClassBody(meta);

      this.write("\n  }\n");
      this.__currentClass = null;
      this.__hierarchy = null;
    },

    /**
     * Include the members, statics, properties of all mixins, if any.
     */
    includeMixins(meta) {
      const mixins = meta.mixins
        ? Array.isArray(meta.mixins)
          ? meta.mixins
          : [meta.mixins]
        : [];

      for (const mixin of mixins) {
        this.write(this.__indent + `// Mixin: ${mixin}\n`);
        this.writeClassBody(this.__hierarchy.mixins[mixin]);
      }
    },

    /**
     * Writes the body of the class (excl. constructor) and processes mixins
     */
    writeClassBody(meta) {
      if (meta.isSingleton) {
        this.writeMethods(
          {
            getInstance: {
              type: "function",
              access: "public",
              jsdoc: {
                "@return": [{ type: meta.className }]
              },

              appearsIn: []
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
    },

    /**
     * Writes the property accessors
     */
    writeProperties(meta) {
      for (let propertyName in meta.properties) {
        let propertyMeta = meta.properties[propertyName];
        if (propertyMeta.appearsIn.length) {
          const superLikeName = propertyMeta.appearsIn.slice(-1)[0];
          const superLikeMeta = this.__metaDb.getMetaData(superLikeName);
          const superLikeProperty = superLikeMeta.properties[propertyName];
          superLikeProperty.jsdoc = propertyMeta.jsdoc;
          propertyMeta = superLikeProperty;
        }

        let upname = qx.lang.String.firstUp(propertyName);
        let type = propertyMeta.json?.check ?? "any";

        if (Array.isArray(type)) {
          // `[t1, t2]` -> `t1|t2`
          type = JSON.stringify(type).replace(/,/g, "|").slice(1, -1);
        } else if (typeof type === "string") {
          if (
            !type.match(/^[a-z\d\s.\|\<\>\&\(\)\[\]]+$/i) ||
            type === "[[ ObjectMethod Function ]]"
          ) {
            type = "any";
          }
        } else {
          type = "any";
        }
        if (!propertyMeta.json?.group) {
          this.__writeMethod("get" + upname, {
            location: propertyMeta.location,
            returnType: type,
            jsdoc: { raw: [`Gets the ${propertyName} property`] },
            override: propertyMeta.override
          });

          if (typeof type === "string" && type.toLowerCase() === "boolean") {
            this.__writeMethod("is" + upname, {
              location: propertyMeta.location,
              returnType: type,
              jsdoc: { raw: [`Gets the ${propertyName} property`] },
              override: propertyMeta.override
            });
          }
        }
        this.__writeMethod("set" + upname, {
          location: propertyMeta.location,
          parameters: [{ name: "value", type }],
          returnType: type,
          jsdoc: { raw: [`Sets the ${propertyName} property`] },
          override: propertyMeta.override
        });

        this.__writeMethod("reset" + upname, {
          location: propertyMeta.location,
          jsdoc: { raw: [`Resets the ${propertyName} property`] },
          override: propertyMeta.override
        });

        if (propertyMeta.json?.async) {
          this.__writeMethod("get" + upname + "Async", {
            location: propertyMeta.location,
            returnType: "qx.Promise",
            jsdoc: {
              raw: [`Gets the ${propertyName} property, asynchronously`]
            },

            override: propertyMeta.override
          });

          if (typeof type === "string" && type.toLowerCase() === "boolean") {
            this.__writeMethod("is" + upname + "Async", {
              location: propertyMeta.location,
              returnType: "qx.Promise",
              jsdoc: {
                raw: [`Gets the ${propertyName} property, asynchronously`]
              },

              override: propertyMeta.override
            });
          }
          this.__writeMethod("set" + upname + "Async", {
            location: propertyMeta.location,
            parameters: [{ name: "value", type }],
            returnType: "qx.Promise",
            jsdoc: { raw: [`Sets the ${propertyName} property`] },
            override: propertyMeta.override
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
      // TODO: use an AST parser to handle modifying complex type expressions

      // handle certain cases
      var defaultType = "any";
      if (!typename || typename == "[[ Function ]]") {
        return defaultType;
      }
      if (typeof typename == "object") {
        typename = typename.name;
      }

      // handle transformations

      if (typename === "Array") {
        return "any[]";
      }

      //mapping
      const fromTypes = Object.keys(
        qx.tool.compiler.targets.TypeScriptWriter.TYPE_MAPPINGS
      );

      const re = new RegExp(
        `(^|[^.a-zA-Z0-9])(${fromTypes
          .join("|")
          .replace("*", "\\*")})($|[^.a-zA-Z0-9<])`
      );

      // regexp matches overlapping strings, so we need to loop
      while (typename.match(re)) {
        typename = typename.replace(
          re,
          (match, p1, p2, p3) =>
            `${p1}${qx.tool.compiler.targets.TypeScriptWriter.TYPE_MAPPINGS[p2]}${p3}`
        );
      }

      //nullables
      typename = typename.replace(/\?.*$/, "");

      // handle global types
      if (
        (this.__metaDb.getMetaData(typename) && typename.indexOf(".") != -1) ||
        (this.__metaDb.getMetaData(typename.replace(/\[\]/g, "")) &&
          typename.replace(/\[\]/g, "").indexOf(".") != -1)
      ) {
        return "globalThis." + typename;
      }

      typename = typename.replace("Promise<", "globalThis.Promise<");
      typename = typename.replace(
        /(^|[^.a-zA-Z])(var|\*)([^.a-zA-Z]|$)/g,
        "$1any$3"
      );

      // this will do for now, but it will fail on an expression like `Array<Record<string, any>>`
      typename = typename.replace(/(?<!qx\.data\.)Array<([^>]+)>/g, "($1)[]");

      // We don't know the type
      // qx.tool.compiler.Console.error("Unknown type: " + typename);
      return typename;
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
     * @typedef {Object} MethodConfig
     * @property {object} location
     * @property {Boolean} access
     * @property {Boolean} abstract
     * @property {Boolean} async
     * @property {Boolean} static
     * @property {Boolean} mixin
     * @property {Array} parameters JSDoc parameters and types
     * @property {any} returnType JSDoc return type
     * @property {object} jsdoc
     *
     * @param {String} methodName
     * @param {MethodConfig} config
     */
    __writeMethod(methodName, config) {
      var declaration = "";

      if (config.access === "protected" || config.access === "public") {
        declaration += config.access + " ";
      } else if (config.access === "private") {
        return;
      }

      if (config.static) {
        declaration += "static ";
      }

      if (config.abstract) {
        declaration += "abstract ";
      }

      if (config.override) {
        declaration += "override ";
      }

      declaration += this.__escapeMethodName(methodName) + "(";

      if (config.parameters) {
        declaration += this.__serializeParameters(config.parameters);
      }
      declaration += ")";

      var returnType = "void";
      if (config.returnType) {
        returnType = this.getType(config.returnType.type);
      }
      declaration += ": " + returnType;

      this.__writeJsDoc(config.jsdoc?.raw, config.location);

      this.write(
        this.__indent +
          `// ${this.__currentClass.className}${
            config.static ? "#" : "."
          }${methodName}\n`
      );

      this.write(this.__indent + declaration + ";" + "\n");
    },

    /**
     * Writes the JSDoc content and adds a link to the source code
     * @param {string[]} jsdoc
     * @param {object} location
     */
    __writeJsDoc(jsdoc, location) {
      const fixup = source => {
        source = source
          // to ensure that links work correctly, include the full class path
          .replace(
            /\{@link #([^}]+)\}/g,
            `{@link ${this.__currentClass.className}.$1}`
          );

        if (source.match(/@param|@return/)) {
          const typeExpr =
            qx.tool.compiler.jsdoc.Parser.getTypeExpression(source);
          if (typeExpr) {
            source =
              source.slice(0, typeExpr.start - 1).trim() +
              " " +
              source.slice(typeExpr.end + 1, source.length).trim();
          }
          if (source.trim().match(/^\*\s*(@param|@return(s?))$/)) {
            return "";
          }
        }
        return source.trim();
      };

      jsdoc = (jsdoc ?? []).map(fixup).filter(line => line.trim().length);
      if (jsdoc.length) {
        jsdoc.push("*");
      }

      const sourceCodePath = path.relative(
        path.dirname(this.getOutputTo()),
        path.join(
          process.cwd(),
          this.__metaDb.getRootDir(),
          this.__currentClass.classFilename
        )
      );

      // currently, VSCode does not support the use of `%file:%line:%column` in
      // in-file links, though it supports them in all other contexts.
      // TODO: find/create issue at microsoft/vscode regarding the above
      const locationSpecifier = ""; // location?.start
      //   ? `:${location.start.line}:${location.start.column}`
      //   : "";

      this.write(
        `${this.__indent}/**\n` +
          [
            ...jsdoc,
            `* [source code](${sourceCodePath}${locationSpecifier})`,
            `*/\n`
          ]
            .map(line => `${this.__indent} ${line}`)
            .join("\n")
      );
    },

    __serializeParameters(params) {
      let forceOptional = false;
      let arr = params.map(paramMeta => {
        var decl = paramMeta.name;
        let optional = paramMeta.optional;
        if (paramMeta.name == "varargs") {
          optional = true;
        }
        if (optional || forceOptional) {
          decl += "?";
          forceOptional = true;
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

      const access = isStatic ? "statics" : "members";

      for (var name in methods) {
        let methodMeta = methods[name];
        if (methodMeta.appearsIn.length) {
          const superLikeName = methodMeta.appearsIn.slice(-1)[0];
          const superLikeMeta = this.__metaDb.getMetaData(superLikeName);
          const superLikeMember = superLikeMeta[access][name];
          superLikeMember.jsdoc = methodMeta.jsdoc;
          methodMeta = superLikeMember;
        }

        if (methodMeta.type === "function") {
          this.__writeMethod(name, {
            location: methodMeta.location,
            access: classMeta.type !== "interface" && methodMeta.access,
            abstract: classMeta.type !== "interface" && methodMeta.abstract,
            async: methodMeta.async,
            static: isStatic,
            mixin: methodMeta.mixin,
            parameters: methodMeta.params,
            returnType: methodMeta.returnType,
            jsdoc: methodMeta.jsdoc ?? {},
            override: methodMeta.override
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
    }
  },

  statics: {
    TYPE_MAPPINGS: {
      Event: "qx.event.type.Event",
      LocalizedString: "qx.locale.LocalizedString",
      LayoutItem: "qx.ui.core.LayoutItem",
      Widget: "qx.ui.core.Widget",
      Decorator: "qx.ui.decoration.Decorator",
      MWidgetController: "qx.ui.list.core.MWidgetController",
      AbstractTreeItem: "qx.ui.tree.core.AbstractTreeItem",
      Axis: "qx.ui.virtual.core.Axis",
      ILayer: "qx.ui.virtual.core.ILayer",
      Pane: "qx.ui.virtual.core.Pane",
      IDesktop: "qx.ui.window.IDesktop",
      IWindowManager: "qx.ui.window.IWindowManager",
      DateFormat: "qx.util.format.DateFormat",
      Class: "qx.Class",
      Interface: "qx.Interface",
      Mixin: "qx.Mixin",
      Theme: "qx.Theme",
      Boolean: "boolean",
      Number: "number",
      String: "string",
      document: "Document",
      Stylesheet: "StyleSheet",
      Element: "HTMLElement",
      Object: "object",
      Map: "Record<string, any>",
      Iterable: "Iterable<any>",
      Iterator: "Iterator<any>",
      Array: "Array<any>",
      RegEx: "RegExp",
      // TODO: deprecate the below types as they are non-standard aliases for builtin types without any tangible benefit
      var: "any",
      "*": "any",
      arguments: "any"
    }
  }
});
