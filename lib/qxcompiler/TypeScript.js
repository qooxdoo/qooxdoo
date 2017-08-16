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
var util = require("../util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

var log = util.createLog("typescript");

class Types {
}
Types.Class = "class";
Types.Methods = "methods";
Types.MethodsStatic = "methods-static";
Types.Method = "method";
Types.Constructor = "constructor";
Types.Properties = "properties";
Types.Property = "property";
Types.Return = "return";
Types.Types = "types";
Types.Entry = "entry";
Types.Param = "param";


/**
 * Generates TypeScript .d.ts files
 */
qx.Class.define("qxcompiler.TypeScript", {
  extend: qx.core.Object,

  construct: function(analyser) {
    this.base(arguments);
    this.__analyser = analyser;
  },
  
  properties: {
     baseDir: {
      init: ".",
      check: "String"
    }
  },

  members: {
    __indent: "    ",
    __output: null,
    __classes: null,
    __allTypes: null,
    
    load: async function() {
      this.processedMethods = {};
      this.properties = {};
      this.fromProperty = null;
      await this.loadFileNames();
    },

    run: async function(outputTo) {
      var time = new Date();
      this.__output = `// Generated declaration file at ${time}\n`;
      
      await this.writeBase();
      
      this.__classes = new qxcompiler.utils.IndexedArray();
      this.__analyser.getLibraries().forEach(function(library) {
        var symbols = library.getKnownSymbols();
        for (var symbolName in symbols) {
          var symbolType = symbols[symbolName];
          if (symbolType == "class")
            this.__classes.push(symbolName);
        }
      });
      this.__allTypes = this.__classes.toObject();
      
      while (this.__classes.pop()) {
        try {
          var src = await this.loadAPIFile(fileName);
          // Reset the golbal methods list.
          this.processedMethods = {};
          this.properties = {};
          await this.writeModule(src);
        }
        catch (err) {
          this.error("processed file: " + fileName + " error: " + err);
        }
      }
      
      return writeFile(outputTo, output);
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
    loadAPIFile: async function(name) {
      this.info("Parsing API file" + name);
      var fileName = path.join(this.getBaseDir(), name);
      return readFile(fileName, "UTF-8")
        .then((content) => return JSON.parse(content));
    },

    /**
     * Write some util declarations out that will help with the rest
     */
    writeBase: async function() {
      return readFile("base_declaration.txt", "UTF-8")
        .then((content) => this.write(content));
    },

    /**
     * Do the mapping of types from Qooxdoo to TypeScript
     */
    getType: function(t) {
      var defaultType = "any";
      if (!t)
        return defaultType;
      
      // Check if we have a mapping for this type
      if (qxcompiler.TypeScript.TYPE_MAPPINGS.hasOwnProperty(t)) {
        var result = qxcompiler.TypeScript.TYPE_MAPPINGS[t];
        return result;
      }
      
      if (this.__allTypes[t])
        return t;
      
      // We don't know the type
      this.error("Unknown type: " + t);
      return defaultType;
    },

    /**
     * Write a constructor
     */
    writeConstructor: function(d) {
      d.forEach((m) => {
        if (m.type === Types.Method) {
          this.write(this.__indent + "constructor (");
          this.writeParameters(m, true);
          this.write(");\n");
        }
      });
    },

    /**
     * Utility function to find the child of a a certain type
     */
    findChildByType: function(t, parent) {
      if (!parent)
        return null;
      if (!parent.children)
        return null;
      var result = null;
      for (var i = 0; i < parent.children.length; i++) {
        var child = parent.children[i];
        if (child.type === t)
          return child;
      }
      if (1 == 1)
        return null;
      parent.children.forEach((c) => {
        if (c.type === t) {
          result = c;
        }
      });
      return result;
    },

    /**
     * Write all the methods of a type
     */
    writeMethods: function(d, isStatic = false, isMixin = false) {
      d.forEach((m) => {
        if (m.type === Types.Method) {
          this.fromProperty = null;
          if (m.attributes && m.attributes.fromProperty) {
            this.fromProperty = m.attributes.fromProperty;
          }
          // Is this really a method in a based class
          if (m.attributes.overriddenFrom)
            return;
          // Check if we already processed this method as part of mixin or
          // interface
          if (this.processedMethods[m.attributes.name])
            return;
          // var modifier = "public";
          var staticClause = isStatic ? "static " : "";
          // Seems access when defined is private, protected and internal
          // We all map this to private
          // if ((!m.attributes.access) || (m.attributes.access ===
          // "protected")) {
          this.info("Processing method " + m.attributes.name);
          var modifier = "";
          this.processedMethods[m.attributes.name] = true;
          if (m.attributes.access) {
            if (m.attributes.access === "protected")
              modifier = "protected ";
            if (m.attributes.access === "private")
              return;
          }
          if (isMixin && (modifier == "protected "))
            return;
          this.write(this.__indent + modifier + staticClause + m.attributes.name + "(");
          this.writeParameters(m);
          this.write(")");
          this.writeReturnType(m);
          this.write("\n");
        }
      });
    },

    /**
     * Determine the return type of a method and write it
     */
    writeReturnType: function(d) {
      var returnType = "void";
      var a = this.findChildByType(Types.Return, d);
      a = this.findChildByType(Types.Types, a);
      a = this.findChildByType(Types.Entry, a);
      if (a && a.attributes.type) {
        var type = a.attributes.type;
        if (type === "var") {
          type = this.properties[this.fromProperty];
          console.log("Type determined for " + this.fromProperty + ":" + type);
        }
        returnType = this.getType(type);
        if (a.attributes.dimensions)
          returnType += "[]";
      }
      this.write(":" + returnType + ";");
    },

    /**
     * Write the specific type of one parameter.
     */
    writeParam: function(p, forceOptional) {
      var type = "any";
      this.write(p.attributes.name);
      if (p.attributes.name == "varargs")
        forceOptional = true;
      if (p.attributes.optional || forceOptional)
        this.write("?");
      this.write(":");
      var a = this.findChildByType(Types.Types, p);
      a = this.findChildByType(Types.Entry, a);
      if (a && a.attributes.type) {
        type = this.getType(a.attributes.type);
        if (a.attributes.dimensions)
          type += "[]";
      }
      this.write(type);
      return p.attributes.optional || forceOptional;
    },

    /**
     * Write out all the arguments of a method. Once one paramter is optional,
     * the remaining ones are also optional (is a TypeScript requirement)
     */
    writeParameters: function(d, optional = false) {
      var params = this.findChildByType("params", d);
      var first = true;
      if (params) {
        params.children.forEach((c) => {
          if (c.type === Types.Param) {
            if (!first)
              this.write(",");
            else
              first = false;
            optional = this.writeParam(c, optional);
          }
        });
      }
    },

    /**
     * Write all the properties of a class, interface or mixin
     */
    writeProperties: function(d) {
      // return; // lets not write properties
      d.forEach((p) => {
        if ((p.type == Types.Property) && p.attributes.check) {
          console.log("Setting property " + p.attributes.name + ":" + p.attributes.check);
          if (p.attributes.check !== "var")
            this.properties[p.attributes.name] = p.attributes.check;
        }
        if (1 == 1)
          return;
        if (p.type !== Types.Property)
          return;
        if (p.attributes.overriddenFrom)
          return; // property already defined in base class
        if (p.attributes.check === "var")
          return; // not a real property. use getter/setter
        if (p.attributes.event)
          return; // if there is a event defined, use getter/setter
        if ((!p.attributes.check))
          this.error("No type for attribute " + p.attributes.name);
        var modifier = "";
        if (p.attributes.access) {
          if (p.attributes.access === "private")
            modifier = "private";
          if (p.attributes.access === "protected")
            modifier = "protected";
        }
        var type = this.getType(p.attributes.check);
        this.write(modifier + " " + p.attributes.name + ":" + type + ";\n");
      });
    },

    /**
     * Write the mixin methods and properties, thereby mixin it into a class.
     * This method is used for including methods from both mixins and interfaces
     */
    includeMixin: async function(name) {
      name = name.trim();
      if (!name)
        return Promise.resolve();
      return this.loadAPIFile(name + ".json")
        .then((d) => {
          this.runChildrenOfType(d, Types.Properties, (c) => {
            this.writeProperties(c.children);
          });
          this.runChildrenOfType(d, Types.MethodsStatic, (c) => {
            this.writeMethods(c.children, true, true);
          });
          this.runChildrenOfType(d, Types.Methods, (c) => {
            this.writeMethods(c.children, false, true);
          });
        });
    },

    /**
     * Implements used
     */
    writeImplementsClause: async function(a) {
      var interfaces = a.interfaces || "";
      var mixins = a.mixins || "";
      if ((!interfaces) && (!mixins)) {
        this.write(" {\n");
        return;
      }
      // var impl = interfaces.split(",").concat(mixins.split(","));
      if (interfaces)
        this.write(" implements " + interfaces);
      this.write(" {\n");
      interfaces.split(",").forEach((name) => {
        await this.includeMixin(name);
      });
      mixins.split(",").forEach((name) => {
        await this.includeMixin(name);
      });
    },

    writeExtendsClause: function(a) {
      var extendsClause = "";
      if (a.superClass && (a.superClass !== "Object")) {
        extendsClause = " extends " + this.getType(a.superClass);
      }
      var type = "class "; // default for class and mixins
      if (a.type === "interface")
        type = "interface ";
      this.write(type + a.name + extendsClause);
    },

    runChildrenOfType: function(d, type, fn) {
      d.children.forEach((c) => {
        if (c.type === type)
          fn(c);
      });
    },

    /**
     * Write the class or interface declaration
     */
    writeClass: async function(d) {
      var a = d.attributes;
      this.info("Processing class " + d.attributes.packageName + "." + a.name);
      this.writeExtendsClause(a);
      await this.writeImplementsClause(a);
      this.runChildrenOfType(d, Types.Properties, (c) => {
          this.writeProperties(c.children);
      });
      this.runChildrenOfType(d, Types.Constructor, (c) => {
          this.writeConstructor(c.children);
      });
      this.runChildrenOfType(d, Types.MethodsStatic, (c) => {
          this.writeMethods(c.children, true);
      });
      this.runChildrenOfType(d, Types.Methods, (c) => {
          this.writeMethods(c.children);
      });
      this.write("\n}\n");    
    },
  
    /**
     * Write the module declaration if any.
     */
    writeModule: async function(d) {
      var moduleName = d.attributes.packageName;
      if (moduleName) {
        this.write("declare module " + moduleName + " {\n");
      }
      else {
        this.write("declare ");
      }
      await this.writeClass(d);
      if (moduleName)
          this.write("}\n");
    }
  },
  
  statics: {
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
