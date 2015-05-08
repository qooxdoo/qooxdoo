/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2015 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */

'use strict';

var fs = require("fs");

class Data {
  constructor (ast) {
    this.__data = {};
    this.__desc = "";
    this.__polyfillClasses = [];
    this.__loadedClasses = [];

    this._processAst(ast);
  }

  static getByType(ast, type) {
    if (ast.children) {
      for (var i=0; i < ast.children.length; i++) {
        var item = ast.children[i];
        if (item.type == type) {
          return item;
        }
      }
    }
    return {attributes: {}, children: []};
  }

  static getModuleName(attach) {
    if (!attach) {
      return "Core";
    }

    Data.MODULE_NAME_REPLACEMENTS.forEach(function(map) {
     attach = attach.replace(map.regExp, map.replacement);
    });
    return attach;
  }

  static getModuleNameFromClassName(name) {
    name = name.split(".");
    return name[name.length -1];
  }

  static getMethodName(item, prefix) {
    if (item.attributes.prefixedMethodName) {
      return item.attributes.prefixedMethodName;
    }
    var attachData = Data.getByType(item, "attachStatic");
    if (prefix) {
      if (item.attributes.prefix) {
        prefix = item.attributes.prefix;
      }
      if (!item.attributes.isStatic) {
        prefix = prefix.toLowerCase();
      }
      return prefix + item.attributes.name;
    } else if (item.attributes.name == "ctor") {
      return "q";
    } else if (item.attributes.isStatic) {
      return "q." + (attachData.attributes.targetMethod || item.attributes.name);
    } else {
      return "." + item.attributes.name;
    }
  }

  static isFactory(methodAst, moduleName) {
    var type;
    var returnType = Data.getByType(methodAst, "return");
    returnType && Data.getByType(returnType, "types").children.forEach(function(item) {
      type = item.attributes.type;
    });
    if (type) {
      var returnModuleName = Data.getModuleNameFromClassName(type);
      var attach = Data.getByType(methodAst, "attach");
      if (!attach.attributes.targetClass) {
        attach = Data.getByType(methodAst, "attachStatic");
      }
      return returnModuleName == moduleName && attach.attributes.targetClass == "qxWeb";
    }
    return false;
  }

  static __isInternal(item) {
    return item.attributes.isInternal ||
      item.attributes.access == "private" ||
      item.attributes.access == "protected";
  }

  static __sortMethods(a, b) {
    return Data.getMethodName(a) > Data.getMethodName(b) ? 1 : -1;
  }

  _processAst(ast) {
    // constructor
    var construct = Data.getByType(ast, "constructor");
    this.__data["Core"] = {"static" : [], "member": []};
    this.__data["Core"]["static"].push(Data.getByType(construct, "method"));
    this.__data["Core"]["desc"] = Data.getByType(ast, "desc").attributes.text;

    this._saveIndex(ast);

    for (var module in this.__data) {
      var fileName = this.__data[module].fileName;
      if (fileName) {
        this._loadModuleDoc(fileName, module);
      }
    }

    this._loadEventNorm();
    this._loadPolyfills();
    this._checkReady();

    // console.log(this.__data);
  }

  _saveIndex(ast) {
    this.__desc = Data.getByType(ast, "desc").attributes.text;

    var filterInternals = function(method) {
      return !Data.__isInternal(method);
    };

    var statics = Data.getByType(ast, "methods-static");
    statics.children = statics.children.filter(filterInternals);
    this._attachMethodsToModules(statics, "static");
    var members = Data.getByType(ast, "methods");
    members.children = members.children.filter(filterInternals);
    this._attachMethodsToModules(members, "member");
    // sort all methods
    for (var module in this.__data) {
      this.__data[module]["static"].sort(Data.__sortMethods);
      this.__data[module]["member"].sort(Data.__sortMethods);
      this.__data[module]["static"].forEach(this._loadReturnTypes.bind(this));
      this.__data[module]["member"].forEach(this._loadReturnTypes.bind(this));
    }

    var setGroup = function(method) {
      method.attributes.group = "Core";
    };

    this.__data["Core"]["static"].forEach(setGroup);
    this.__data["Core"]["member"].forEach(setGroup);

    for (var moduleName in this.__data) {
      var group = this.__data[moduleName].group;
      if (!group && this.__data[moduleName].member.length > 0) {
        group = this.__data[moduleName].member[0].attributes.group;
      }
      if (!group && this.__data[moduleName].static.length > 0) {
        group = this.__data[moduleName].static[0].attributes.group;
      }
      if (!group) {
        group = "Extras";
      }
      this.__data[moduleName].group = group;
    }
  }


  _attachMethodsToModules(ast, type) {
    ast && ast.children && ast.children.forEach(function(item) {
      var module = Data.getModuleName(item.attributes.sourceClass);
      if (!this.__data[module]) {
        this.__data[module] = {"static": [], "member": [], fileName: item.attributes.sourceClass};
      }
      this.__data[module][type].push(item);
    }.bind(this));
  }

  __loadSimpleClass(type, name) {
    var ast = JSON.parse(fs.readFileSync('api/script/' + name + '.json', {encoding: 'utf8'}));
    var moduleName = ast.attributes.name;
    this._saveClassData(moduleName, ast);
    this.__data[moduleName].prefix = type + ".";
  }


  _loadEventNorm() {
    var norm = Data.EVENT_TYPES;
    if (norm) {
      norm.forEach(this.__loadSimpleClass.bind(this, "Event"));
    }
  }


  _loadPolyfills() {
    var qxLangNormalize = {
      "Array":{"$$type":"Class","classname":"qx.lang.normalize.Array","name":"qx.lang.normalize.Array","basename":"Array"},
      "Date":{"$$type":"Class","classname":"qx.lang.normalize.Date","name":"qx.lang.normalize.Date","basename":"Date"},
      "String":{"$$type":"Class","classname":"qx.lang.normalize.String","name":"qx.lang.normalize.String","basename":"String"},
      "Object":{"$$type":"Class","classname":"qx.lang.normalize.Object","name":"qx.lang.normalize.Object","basename":"Object"},
      "Function":{"$$type":"Class","classname":"qx.lang.normalize.Function","name":"qx.lang.normalize.Function","basename":"Function"},
      "Error":{"$$type":"Class","classname":"qx.lang.normalize.Error","name":"qx.lang.normalize.Error","basename":"Error"}
    };

    this.__polyfillClasses = Object.keys(qxLangNormalize);

    for (var clazz in qxLangNormalize) {
      this.__loadSimpleClass(clazz, "qx.lang.normalize." + clazz);
    }

    // old implementation
    // ==================
    // if (!(q.$$qx.module.Polyfill && q.$$qx.lang.normalize) ) {
    //   return;
    // }

    // this.__polyfillClasses = Object.keys(q.$$qx.lang.normalize);

    // for (var clazz in q.$$qx.lang.normalize) {
    //   this.__loadSimpleClass(clazz, "qx.lang.normalize." + clazz);
    // }
  }


  _loadClass(className) {
    if (this.__loadedClasses.indexOf(className) != -1) {
      return;
    }
    // ignore the q class
    if (className == "q") {
      return;
    }

    this.__loadedClasses.push(className);
    var ast = JSON.parse(fs.readFileSync('api/script/' + className + '.json', {encoding: 'utf8'}));
    var moduleName = ast.attributes.name;
    Data.getByType(ast, "methods-static").children = [];
    if (this.__data[moduleName]) {
      this.__data[moduleName].member.forEach(function(method) {
        var attach = Data.getByType(method, "attach");
        var prefix = attach.attributes.targetClass == "qxWeb" ? "" : attach.attributes.targetClass;
        prefix += "." + method.attributes.name;
        method.attributes.prefixedMethodName = prefix;
        Data.getByType(ast, "methods").children.unshift(method);
      });
    }

    Data.getByType(ast, "methods").children.forEach(function(method) {
      if (!method.attributes.prefixedMethodName) {
        method.attributes.prefixedMethodName = moduleName.toLowerCase() + "." + method.attributes.name;
      }
    });

    this._saveClassData(moduleName, ast);

    var superClass = ast.attributes.superClass;
    if (superClass) {
      var newName = superClass.split(".");
      newName = newName[newName.length -1];
      this.__data[moduleName].superClass = superClass;
      var ignore = Data.IGNORE_TYPES.indexOf(newName) != -1 ||
                   Data.MDC_LINKS[superClass] !== undefined;
      if (!ignore) {
        this._loadClass(superClass);
      }
    }

    // add deprecated status
    var deprecatedStatus = Data.getByType(ast, "deprecated");
    if (deprecatedStatus.children.length > 0) {
      var deprecatedDescription = Data.getByType(deprecatedStatus, "desc");
      var deprecatedMessage = deprecatedDescription.attributes.text;
      this.__data[moduleName].deprecated = true;
      this.__data[moduleName].deprecatedMessage = deprecatedMessage.length > 0 ? deprecatedMessage : 'Deprecated';
    }
  }

  _loadReturnTypes(method) {
    var returnType = Data.getByType(method, "return");
    if (returnType) {
      Data.getByType(returnType, "types").children.forEach(function(item) {
        var type = item.attributes.type;
        if (Data.IGNORE_TYPES.indexOf(type) == -1 && Data.MDC_LINKS[type] === undefined) {
          this._loadClass(type);
        }
      }.bind(this));
    }
  }

  _loadModuleDoc(className, moduleName) {
    var ast = JSON.parse(fs.readFileSync('api/script/' + className + '.json', {encoding: 'utf8'}));
    // class doc
    var desc = Data.getByType(ast, "desc");
    if (desc && desc.attributes && desc.attributes.text) {
      this.__data[moduleName].desc = desc.attributes.text;
    }
    this.__data[moduleName].events = this._getEvents(ast);
  }

  _containsItem(list, item) {
    for (var i=0, l=list.length; i<l; i++) {
      if (list[i].name === item.name) {
        return true;
      }
    }
    return false;
  }

  _addNewItems(list, items) {
    items.forEach(function(item) {
      if (!this._containsItem(list, item)) {
        list.push(item);
      }
    }.bind(this));
  }

  _saveClassData(moduleName, ast) {
    if (!this.__data[moduleName]) {
      this.__data[moduleName] = {
        desc : "",
        events : [],
        fileName : ast.attributes.fullName,
        group : ast.attributes.group || "Extras",
        member : [],
        static : [],
        deprecated: false
      };
    }

    if (!this.__data[moduleName].events) {
      this.__data[moduleName].events = [];
    }
    this._addNewItems(this.__data[moduleName].events, this._getEvents(ast));

    var members = Data.getByType(ast, "methods").children.filter(function(method) {
      // ignore internal and already listed methods e.g. factory methods
      return !Data.__isInternal(method) && this.__data[moduleName].member.indexOf(method) == -1;
    }.bind(this));

    this.__data[moduleName].member = this.__data[moduleName].member.concat(members);

    this.__data[moduleName].static = this.__data[moduleName].static.concat(Data.getByType(ast, "methods-static").children.filter(function(method) {
      // ignore internal and already listed methods
      return !Data.__isInternal(method) && this.__data[moduleName].static.indexOf(method) == -1;
    }.bind(this)));

    if (!this.__data[moduleName].desc) {
      var desc = Data.getByType(ast, "desc");
      if (desc && desc.attributes && desc.attributes.text) {
        this.__data[moduleName].desc = desc.attributes.text;
      }
    }

    var constants = Data.getByType(ast, "constants");
    for (var i=0; i < constants.children.length; i++) {
      var constant = constants.children[i];
      var constName = constant.attributes.name;
      if (constName == "TYPES") {
        this.__data[moduleName].types = constant.attributes.value;
        continue;
      } else {
        if (constName == "_templates" || constName == "_config") {
          var descr = Data.getByType(constant, "desc");
          this.__data[moduleName][constName.replace("_", "")] = descr.attributes.text;
        }
      }
    }

    var deprecatedStates = Data.getByType(ast, "deprecated");
    for (var j = 0; j < deprecatedStates.children.length; j++) {
      var deprecatedStatus = deprecatedStates.children[j];
      if (deprecatedStatus.type === "desc") {
        this.__data[moduleName].deprecated = deprecatedStatus.attributes;
      }
    }
  }

  _extractPluginApi() {
    for (var moduleName in this.__data) {
      var moduleData = this.__data[moduleName];
      ["static", "member"].forEach(function(type) {
        if (moduleData[type]) {
          var pluginModuleName;
          for (var i=moduleData[type].length - 1; i>=0; i--) {
            var method = moduleData[type][i];
            if (method.attributes.name.indexOf("$") === 0) {
              method.attributes.plugin = true;
              // pluginModuleName = moduleName + "_Plugin_API";
              if (!this.__data[pluginModuleName]) {
                this.__data[pluginModuleName] = {
                  member: [],
                  static: [],
                  group: "Plugin_API"
                };
              }
              method.attributes.group = "Plugin_API";
              this.__data[pluginModuleName][type].push(method);
              moduleData[type].splice(i, 1);
            }
          }
          if (pluginModuleName) {
            this.__data[pluginModuleName][type].sort(Data.__sortMethods);
          }
        }
      }.bind(this));
    }
  }

  _removeOverridden() {
    for (var moduleName in this.__data) {
      var moduleData = this.__data[moduleName];
      ["static", "member"].forEach(function(type) {
        if (moduleData[type]) {
          var pluginModuleName;
          for (var i=moduleData[type].length - 1; i>=0; i--) {
            var method = moduleData[type][i];
            if (method.attributes.overriddenFrom) {
              // if no desc is given
              if (Data.getByType(method, "desc").children) {
                moduleData[type].splice(i, 1);
              }
            }
          }
        }
      }.bind(this));
    }
  }

   // Move methods that return a class instance to the documentation of that class
  _moveMethodsToReturnTypes() {
    var removeMethods = [];
    this.forEachMethodList(function(methods, groupName, moduleName) {
      methods.forEach(function(method) {
        if (!method.attributes.sourceClass) {
          return;
        }
        var returnType = Data.getByType(method, "return");
        if (returnType) {
          var type;
          Data.getByType(returnType, "types").children.forEach(function(item) {
            type = item.attributes.type;
          });
          // if we have a return type
          if (type) {
            var module = Data.getModuleNameFromClassName(type);
            // if we have docs for the return type
            if (this.__data[module] &&
                type == this.__data[module].fileName) {

              var attach = Data.getByType(method, "attach");
              var attachStatic = Data.getByType(method, "attachStatic");
              var isAttachStatic = attachStatic.type == "attachStatic";
              var returnTypeMethods = this.__data[module].member;

              // ignore attached methods of returned types
              // also ignore methods that return a different module
              if (returnTypeMethods.indexOf(method) == -1 && moduleName.indexOf(module) != -1) {
                var prefix;
                if (isAttachStatic) {
                  prefix = attachStatic.attributes.targetClass == "qxWeb" ? "q" : attachStatic.attributes.targetClass;
                  prefix += "." + attachStatic.attributes.targetMethod;
                } else {
                  prefix = attach.attributes.targetClass == "qxWeb" ? "" : attach.attributes.targetClass;
                  prefix += "." + method.attributes.name;
                }
                method.attributes.prefixedMethodName = prefix;

                returnTypeMethods.unshift(method);
                removeMethods.push({method: method, parent: methods});
              }
            }
          }
        }
      }.bind(this));
    }.bind(this));

    removeMethods.forEach(function(obj) {
      // remove the methods from the former parents
      obj.parent.splice(obj.parent.indexOf(obj.method), 1);
      // get the name for the old module / class
      var sourceModuleName = Data.getModuleName(obj.method.attributes.sourceClass);
      var sourceModule = this.__data[sourceModuleName];
      // if the old module / class is empty, remove it
      if (sourceModule.static.length == 0 && sourceModule.member.length == 0) {
        delete this.__data[sourceModuleName];
      }
    }.bind(this));
  }

  forEachMethodList(callback) {
    for (var moduleName in this.__data) {
      var moduleData = this.__data[moduleName];
      if (moduleData.member) {
        callback(moduleData.member, moduleData.group, moduleName);
      }
      if (moduleData.static) {
        callback(moduleData.static, moduleData.group, moduleName);
      }
      if (moduleData.ast && moduleData.ast.children) {
        for (var i=0, l=moduleData.ast.children.length; i<l; i++) {
          var childNode = moduleData.ast.children[i];
          if (childNode.type &&
              childNode.type.indexOf("methods") === 0 &&
              childNode.children)
          {
            callback(childNode.children, moduleData.ast.attributes.group, moduleName);
          }
        }
      }
    }
  }

  getKeys() {
    var keys = [];
    for (var key in this.__data) {
      keys.push(key);
    }
    keys.sort(function(a, b) {
      if (a == "Core") {
        return -1;
      }
      if (b == "Core") {
        return 1;
      }
      return a < b ? -1 : +1;
    });
    return keys;
  }

  /**
   *  Returns the API data for one module
   *  @param moduleName {String} The module name
   *  @return {Map} A map containing the following keys:
   *    * superClass (optional) The fully qualified name of the module's super class
   *    * desc The module's class documentation
   *    * events Array of event documentation nodes
   *    * fileName (optional) The fully qualified name of the module's origin class
   *    * group (optional) The module's group name, e.g. IO, Core, ...
   *    * member list of member method nodes
   *    * static list of static method nodes
   *    * prefix (optional) prefix for method names, e.g. "event."
   *    * types (optional) list of event type nodes (for event normalizations)
   *    * templates (optional) rendering templates documentation (for Widgets)
   *    * config (optional) config option documentation (for Widgets)
   *    * deprecated (optional) Either module is deprecated or not
   */
  getModule(moduleName) {
    return this.__data[moduleName];
  }

  getRawData() {
    return this.__data;
  }

  _getEvents(ast) {
    var events = Data.getByType(ast, "events");
    var data = [];
    events.children.forEach(function(event) {
      var name = event.attributes.name;
      var desc = Data.getByType(event, "desc").attributes.text;
      var type = Data.getByType(event, "types").children[0].attributes.type;
      // ignore undefined as type
      type = type == "undefined" ? "" : type;
      data.push({name: name, type: type, desc: desc});
    });
    return data;
  }

  _checkReady() {
    this._extractPluginApi();
    this._removeOverridden();
    this._moveMethodsToReturnTypes();
  }
}

Data.IGNORE_TYPES = [
  "qxWeb",
  "var",
  "null",
  "Emitter",
  "Class"
];
Data.MDC_LINKS = {
  "Event" : "https://developer.mozilla.org/en/DOM/event",
  "Window" : "https://developer.mozilla.org/en/DOM/window",
  "Document" : "https://developer.mozilla.org/en/DOM/document",
  "Element" : "https://developer.mozilla.org/en/DOM/element",
  "Node" : "https://developer.mozilla.org/en/DOM/node",
  "Date" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date",
  "Function" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function",
  "Array" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array",
  "Object" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object",
  "Map" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object",
  "RegExp" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/RegExp",
  "Error" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error",
  "Number" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Number",
  "Integer" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Number",
  "Boolean" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Boolean",
  "String" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String",
  "undefined" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/undefined",
  "arguments" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/arguments",
  "Font" : "https://developer.mozilla.org/en/CSS/font",
  "Color" : "https://developer.mozilla.org/en/CSS/color"
};
Data.MODULE_NAME_REPLACEMENTS = [
  { regExp: new RegExp(/qx\.module\./), replacement: "" },
  { regExp: new RegExp(/qx\.ui\.website\./), replacement: "" }
];
Data.EVENT_TYPES = [
  "qx.module.event.Mouse",
  "qx.module.event.Keyboard",
  "qx.module.event.Native",
  "qx.module.event.Orientation",
  "qx.module.event.Touch",
  "qx.module.event.Pointer",
  "qx.module.event.Swipe",
  "qx.module.event.Track",
  "qx.module.event.Pinch",
  "qx.module.event.Rotate",
  "qx.module.event.Tap"
];

module.exports = Data;
