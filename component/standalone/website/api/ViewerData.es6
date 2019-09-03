/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2015 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */

'use strict';

// NOTE: class used only in node env (via Grunt) so use require()!

var fs = require("fs");
var ViewerDataUtil = require('./ViewerDataUtil.es5');

class ViewerData {
  constructor() {
    this.__data = {};
    this.__desc = "";
    this.__polyfillClasses = [];
    this.__loadedClasses = [];
  }

  _saveIndex(ast) {
    this.__desc = ViewerDataUtil.getByType(ast, "desc").attributes.text;

    var filterInternals = function(method) {
      return !ViewerDataUtil.__isInternal(method);
    };

    var statics = ViewerDataUtil.getByType(ast, "methods-static");
    statics.children = statics.children.filter(filterInternals);
    this._attachMethodsToModules(statics, "static");
    var members = ViewerDataUtil.getByType(ast, "methods");
    members.children = members.children.filter(filterInternals);
    this._attachMethodsToModules(members, "member");
    // sort all methods
    for (var module in this.__data) {
      this.__data[module]["static"].sort(ViewerDataUtil.__sortMethods);
      this.__data[module]["member"].sort(ViewerDataUtil.__sortMethods);
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
      var module = ViewerDataUtil.getModuleName(item.attributes.sourceClass);
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
    var norm = ViewerDataUtil.EVENT_TYPES;
    if (norm) {
      norm.forEach(this.__loadSimpleClass.bind(this, "Event"));
    }
  }


  _loadPolyfills() {
    var qxLangNormalize = ViewerDataUtil.NORMALIZE_CLASSES;
    this.__polyfillClasses = Object.keys(qxLangNormalize);

    for (var clazz in qxLangNormalize) {
      this.__loadSimpleClass(clazz, qxLangNormalize[clazz]);
    }
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
    ViewerDataUtil.getByType(ast, "methods-static").children = [];
    if (this.__data[moduleName]) {
      this.__data[moduleName].member.forEach(function(method) {
        var attach = ViewerDataUtil.getByType(method, "attach");
        var prefix = attach.attributes.targetClass == "qxWeb" ? "" : attach.attributes.targetClass;
        prefix += "." + method.attributes.name;
        method.attributes.prefixedMethodName = prefix;
        ViewerDataUtil.getByType(ast, "methods").children.unshift(method);
      });
    }

    ViewerDataUtil.getByType(ast, "methods").children.forEach(function(method) {
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
      var ignore = ViewerDataUtil.IGNORE_TYPES.indexOf(newName) != -1 ||
                   ViewerDataUtil.MDC_LINKS[superClass] !== undefined;
      if (!ignore) {
        this._loadClass(superClass);
      }
    }

    // add deprecated status
    var deprecatedStatus = ViewerDataUtil.getByType(ast, "deprecated");
    if (deprecatedStatus.children.length > 0) {
      var deprecatedDescription = ViewerDataUtil.getByType(deprecatedStatus, "desc");
      var deprecatedMessage = deprecatedDescription.attributes.text;
      this.__data[moduleName].deprecated = true;
      this.__data[moduleName].deprecatedMessage = deprecatedMessage.length > 0 ? deprecatedMessage : 'Deprecated';
    }
  }

  _loadReturnTypes(method) {
    var returnType = ViewerDataUtil.getByType(method, "return");
    if (returnType) {
      ViewerDataUtil.getByType(returnType, "types").children.forEach(function(item) {
        var type = item.attributes.type;
        if (ViewerDataUtil.IGNORE_TYPES.indexOf(type) == -1 && ViewerDataUtil.MDC_LINKS[type] === undefined) {
          this._loadClass(type);
        }
      }.bind(this));
    }
  }

  _loadModuleDoc(className, moduleName) {
    var ast = JSON.parse(fs.readFileSync('api/script/' + className + '.json', {encoding: 'utf8'}));
    // class doc
    var desc = ViewerDataUtil.getByType(ast, "desc");
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

    var members = ViewerDataUtil.getByType(ast, "methods").children.filter(function(method) {
      // ignore internal and already listed methods e.g. factory methods
      return !ViewerDataUtil.__isInternal(method) && this.__data[moduleName].member.indexOf(method) == -1;
    }.bind(this));

    this.__data[moduleName].member = this.__data[moduleName].member.concat(members);

    this.__data[moduleName].static = this.__data[moduleName].static.concat(ViewerDataUtil.getByType(ast, "methods-static").children.filter(function(method) {
      // ignore internal and already listed methods
      return !ViewerDataUtil.__isInternal(method) && this.__data[moduleName].static.indexOf(method) == -1;
    }.bind(this)));

    if (!this.__data[moduleName].desc) {
      var desc = ViewerDataUtil.getByType(ast, "desc");
      if (desc && desc.attributes && desc.attributes.text) {
        this.__data[moduleName].desc = desc.attributes.text;
      }
    }

    var constants = ViewerDataUtil.getByType(ast, "constants");
    for (var i=0; i < constants.children.length; i++) {
      var constant = constants.children[i];
      var constName = constant.attributes.name;
      if (constName == "TYPES") {
        this.__data[moduleName].types = constant.attributes.value;
        continue;
      } else {
        if (constName == "_templates" || constName == "_config") {
          var descr = ViewerDataUtil.getByType(constant, "desc");
          this.__data[moduleName][constName.replace("_", "")] = descr.attributes.text;
        }
      }
    }

    var deprecatedStates = ViewerDataUtil.getByType(ast, "deprecated");
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
              pluginModuleName = moduleName + "_Plugin_API";
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
            this.__data[pluginModuleName][type].sort(ViewerDataUtil.__sortMethods);
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
              if (ViewerDataUtil.getByType(method, "desc").children) {
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
        var returnType = ViewerDataUtil.getByType(method, "return");
        if (returnType) {
          var type;
          ViewerDataUtil.getByType(returnType, "types").children.forEach(function(item) {
            type = item.attributes.type;
          });
          // if we have a return type
          if (type) {
            var module = ViewerDataUtil.getModuleNameFromClassName(type);
            // if we have docs for the return type
            if (this.__data[module] &&
                type == this.__data[module].fileName) {

              var attach = ViewerDataUtil.getByType(method, "attach");
              var attachStatic = ViewerDataUtil.getByType(method, "attachStatic");
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
      var sourceModuleName = ViewerDataUtil.getModuleName(obj.method.attributes.sourceClass);
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

  _getEvents(ast) {
    var events = ViewerDataUtil.getByType(ast, "events");
    var data = [];
    events.children.forEach(function(event) {
      var name = event.attributes.name;
      var desc = ViewerDataUtil.getByType(event, "desc").attributes.text;
      var type = ViewerDataUtil.getByType(event, "types").children[0].attributes.type;
      // ignore undefined as type
      type = type == "undefined" ? "" : type;
      data.push({name: name, type: type, desc: desc});
    });
    return data;
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

  processAst(ast) {
    // constructor
    var construct = ViewerDataUtil.getByType(ast, "constructor");
    this.__data["Core"] = {"static" : [], "member": []};
    this.__data["Core"]["static"].push(ViewerDataUtil.getByType(construct, "method"));
    this.__data["Core"]["desc"] = ViewerDataUtil.getByType(ast, "desc").attributes.text;

    this._saveIndex(ast);

    for (var module in this.__data) {
      var fileName = this.__data[module].fileName;
      if (fileName) {
        this._loadModuleDoc(fileName, module);
      }
    }

    this._loadEventNorm();
    this._loadPolyfills();
    this._extractPluginApi();
    this._removeOverridden();
    this._moveMethodsToReturnTypes();

    // console.log(this.__data);
  }
}

module.exports = ViewerData;
