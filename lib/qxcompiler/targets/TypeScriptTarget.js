/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
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
 * ************************************************************************/

var path = require("path");
var qx = require("qooxdoo");
var fs = require("fs");
var util = require("../../util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

var log = util.createLog("typescript");

require("./SourceTarget");

/**
 * Generates TypeScript .d.ts files
 */
qx.Class.define("qxcompiler.targets.TypeScriptTarget", {
  extend: qxcompiler.targets.SourceTarget,
  
  properties: {
    outputTo: {
      init: "qooxdoo.d.ts",
      check: "String"
    }
  },

  members: {
    __indent: "    ",
    __output: null,
    __classes: null,

    /*
     * @Override
     */
    generateApplication: function(application, environment, cb) {
      this.base(arguments, application, environment, (err) => {
        if (err)
          return cb && cb(err);
        this.run(application, environment)
          .then(() => cb && cb())
          .catch((err) => cb && cb(err));
      });
    },
    
    run: function(application, environment) {
      this.__apiCache = {};
      return new Promise((resolve, reject) => {
        var time = new Date();
        this.__output = `// Generated declaration file at ${time}\n`;
        
        this.writeBase()
          .then(async () => {
            var analyser = this.getAnalyser();
            this.__classes = new qxcompiler.utils.IndexedArray();
            application.getDependencies().forEach((classname) => { 
                if (classname != "q" && classname != "qxWeb")
                  this.__classes.push(classname) 
              });
            this.__classes.sort();

            var lastPackageName = null;
            var classIndex = 0;
            var next = async () => {
              if (classIndex >= this.__classes.getLength())
                return;
              
              var className = this.__classes.getItem(classIndex++);
              var pos = className.lastIndexOf('.');
              var packageName = "";
              if (pos > -1)
                packageName = className.substring(0, pos);
              if (lastPackageName != packageName) {
                if (lastPackageName !== null) 
                  this.write("}\n");
                if (packageName) 
                  this.write("declare module " + packageName + " {\n");
                else
                  this.write("declare {\n");
                lastPackageName = packageName;
              }
              return this.loadAPIFile(className)
                .then((meta) => this.writeClass(meta))
                .then(() => next())
                .catch((err) => this.error("Error while processing file: " + className + " error: " + err.stack));
            }
            
            return next()
              .then(() => this.write("}\n"))
              .then(() => writeFile(path.join(this.getOutputDir(), this.getOutputTo()), this.__output));
          })
          .then(resolve)
          .catch(reject);
      });
    },

    /**
     * Write a piece of code to the declaration file
     */
    write: function(msg) {
     this.__output += msg;
    },
   
    /**
     * Load a single API file
     */
    loadAPIFile: async function(classname) {
      if (classname === "Object" || classname === "Array" || classname === "Error")
        return null;
      if (this.__apiCache[classname])
        return Promise.resolve(this.__apiCache[classname]);
      var fileName = path.join(this.getOutputDir(), "transpiled", classname.replace(/\./g, '/') + ".json"); 
      return readFile(fileName, "UTF-8")
        .then((content) => this.__apiCache[classname] = JSON.parse(content))
        .catch((err) => this.error("Error parsing " + classname + ": " + err.stack));
    },

    /**
     * Write some util declarations out that will help with the rest
     */
    writeBase: async function() {
      return readFile(path.join(__dirname, "TypeScriptTarget-base_declaration.txt"), "UTF-8")
        .then((content) => this.write(content));
    },

    /**
     * Do the mapping of types from Qooxdoo to TypeScript
     */
    getType: function(t) {
      var defaultType = "any";
      if (!t || t == "[[ Function ]]")
        return defaultType;
      if (typeof t == "object")
        t = t.name;
      
      // Check if we have a mapping for this type
      if (qxcompiler.targets.TypeScriptTarget.TYPE_MAPPINGS.hasOwnProperty(t)) {
        var result = qxcompiler.targets.TypeScriptTarget.TYPE_MAPPINGS[t];
        return result;
      }
      
      if (this.__classes.contains(t))
        return t;
      
      // We don't know the type
      //this.error("Unknown type: " + t);
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
      if (!methods || !Object.keys(methods).length)
        return;
      var IGNORE = qxcompiler.targets.TypeScriptTarget.IGNORE[this.__currentClass.className];
      var comment = isStatic ? "Statics" : "Members";
      for (var name in methods) {
        var methodMeta = methods[name];
        if (methodMeta.type == "function") {

          var hideMethod = IGNORE && IGNORE.indexOf(name) > -1;

          var decl = "";
          var comment = "";

          if (methodMeta.access) {
            if (methodMeta.access === "protected")
              decl += "protected ";
            if (methodMeta.access === "private")
              continue;
          }
          if (isStatic)
            decl += "static ";
          
          if (classMeta.type != "interface" && methodMeta.abstract) {
            decl += "abstract ";
            comment += "Abstract ";
          }
          if (methodMeta.mixin)
            comment += "Mixin ";
          if (methodMeta.overriddenFrom)
            comment += "Overridden from " + methodMeta.overriddenFrom + " ";
          decl += name + "(";
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
          
          if (comment)
            comment = " // " + comment;
          this.write(this.__indent + (hideMethod ? "// " : "") + decl + ";" + comment + "\n");
        }
      }
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
        var first = true;
        if (params) {
          params.forEach((paramMeta, paramIndex) => {
            var type = "any";
            var paramName = paramMeta.paramName || ("unnamed" + paramIndex);
            var decl = paramName;
            if (paramName == "varargs")
              optional = true;
            if (paramMeta.optional || optional) {
              decl += "?";
              optional = true;
            }
            decl += ": ";
            if (paramMeta.type) {
              var tmp = null;
              if (qx.lang.Type.isArray(paramMeta.type)) {
                if (paramMeta.type.length == 1)
                  tmp = paramMeta.type[0];
              } else
                tmp = paramMeta.type;
              if (tmp) {
                type = this.getType(tmp);
                if (tmp.dimensions)
                  type += "[]";
              }
            }
            decl += type;
            if (paramIndex > 0)
              result += ", ";
            result += decl;
            first = false;
          });
        }
      }
      return result;
    },

    /**
     * Write the class or interface declaration
     */
    writeClass: async function(meta) {
      if (meta.className == "qx.data.controller.List")
        debugger;
      this.__currentClass = meta;
      //this.info("Processing class " + meta.packageName + "." + meta.name);
      var extendsClause = "";
      if (meta.superClass && meta.superClass !== "Object" && meta.superClass !== "Array" && meta.superClass !== "Error") {
        var type = this.getType(meta.superClass);
        if (type != "any")
          extendsClause = " extends " + type;
      }
      var type = "class "; // default for class and mixins
      if (meta.type === "interface")
        type = "interface ";
      else if (meta.abstract)
        type = "abstract " + type;
      this.write("  // " + meta.className + "\n");
      this.write("  " + type + meta.name + extendsClause);
      
      if (meta.interfaces && meta.interfaces.length)
        this.write(" implements " + meta.interfaces.join(", "));

      this.write(" {\n");
      
      if (meta.type == "class")
        this.writeConstructor(meta.constructor);
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
      }
      else {
        this.write("declare ");
      }
      await this.writeClass(meta);
      if (moduleName)
          this.write("}\n");
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
