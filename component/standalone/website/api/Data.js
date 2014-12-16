/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

var Data = q.define({
  // TODO: Attach Emitter to qxWeb
  extend : q.$$qx.event.Emitter,

  construct : function() {
    this.__data = {};
    this.__polyfillClasses = [];
    this.__loadedClasses = [];
    this._loadIndex();
  },

  statics : {

    MODULE_NAME_REPLACEMENTS : [],


    IGNORE_TYPES : ["qxWeb", "var", "null", "Emitter", "Class"],


    MDC_LINKS : {
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
    },


    getByType : function(ast, type) {
      if (ast.children) {
        for (var i=0; i < ast.children.length; i++) {
          var item = ast.children[i];
          if (item.type == type) {
            return item;
          }
        }
      }
      return {attributes: {}, children: []};
    },


    getModuleName : function(attach) {
      if (!attach) {
        return "Core";
      }

      Data.MODULE_NAME_REPLACEMENTS.forEach(function(map) {
       attach = attach.replace(map.regExp, map.replacement);
      });
      return attach;
    },


    getModuleNameFromClassName : function(name) {
      name = name.split(".");
      return name[name.length -1];
    },


    getMethodName : function(item, prefix) {
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
    },

    isFactory : function(methodAst, moduleName) {
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
    },


    __isInternal : function(item) {
      return item.attributes.isInternal ||
        item.attributes.access == "private" ||
        item.attributes.access == "protected";
    },


    __sortMethods : function(a, b) {
      return Data.getMethodName(a) > Data.getMethodName(b) ? 1 : -1;
    }
  },


  members : {

    __data : null,
    __desc : "",
    __polyfillClasses : null,
    __loading : 0,
    __loadedClasses : null,


    _loadIndex : function() {
      // load API data of q
      q.io.xhr("script/qxWeb.json").on("loadend", function(xhr) {
        var isFileProtocol = function() {
          return (location.protocol.indexOf("file") === 0);
        };

        if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
          var ast = JSON.parse(xhr.responseText);
          if (q.env.get("engine.name") == "mshtml" && isFileProtocol()) {
            // postpone data processing in IE when using file protocol
            // to prevent rendering no module doc at all
            window.setTimeout(this._handleSuccess.bind(this, ast), 0);
          } else {
            this._handleSuccess(ast);
          }
        } else {
          this.emit("loadingFailed");
        }
      }, this).send();
    },


    _handleSuccess : function(ast) {
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
    },


    _saveIndex : function(ast) {
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
    },


    _attachMethodsToModules : function(ast, type) {
      ast && ast.children.forEach(function(item) {
        var module = Data.getModuleName(item.attributes.sourceClass);
        if (!this.__data[module]) {
          this.__data[module] = {"static": [], "member": [], fileName: item.attributes.sourceClass};
        }
        this.__data[module][type].push(item);
      }.bind(this));
    },


    __loadSimpleClass : function(type, name) {
      this.__loading++;
      q.io.xhr("script/" + name + ".json").on("loadend", function(xhr) {
        this.__loading--;
        if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
          var ast = JSON.parse(xhr.responseText);
          var moduleName = ast.attributes.name;
          this._saveClassData(moduleName, ast);
          this.__data[moduleName].prefix = type + ".";
        } else {
          console && console.error(name + "' could not be loaded.");
        }
        this._checkReady();
      }, this).send();
    },


    _loadEventNorm : function() {
      var norm = q.env.get("q.eventtypes");
      if (norm) {
        norm = norm.split(",");
        norm.forEach(this.__loadSimpleClass.bind(this, "Event"));
      }
    },


    _loadPolyfills : function() {
      if (!(q.$$qx.module.Polyfill && q.$$qx.lang.normalize) ) {
        return;
      }

      this.__polyfillClasses = Object.keys(q.$$qx.lang.normalize);

      for (var clazz in q.$$qx.lang.normalize) {
        this.__loadSimpleClass(clazz, "qx.lang.normalize." + clazz);
      }
    },


    _loadClass : function(className) {
      if (this.__loadedClasses.indexOf(className) != -1) {
        return;
      }
      // ignore the q class
      if (className == "q") {
        return;
      }

      this.__loadedClasses.push(className);
      this.__loading++;
      q.io.xhr("script/" + className + ".json").on("loadend", function(xhr) {
        this.__loading--;
        if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
          var ast = JSON.parse(xhr.responseText);
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
        } else {
          console && console.error("Couldn't load class doc for ", className);
        }
        this._checkReady();
      }, this).send();
    },


    _loadReturnTypes : function(method) {
      var returnType = Data.getByType(method, "return");
      if (returnType) {
        Data.getByType(returnType, "types").children.forEach(function(item) {
          var type = item.attributes.type;
          if (Data.IGNORE_TYPES.indexOf(type) == -1 && Data.MDC_LINKS[type] === undefined) {
            this._loadClass(type);
          }
        }.bind(this));
      }
    },


    _loadModuleDoc : function(className, moduleName) {
      this.__loading++;
      q.io.xhr("script/" + className + ".json").on("loadend", function(xhr) {
        this.__loading--;
        if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
          var ast = JSON.parse(xhr.responseText);
          // class doc
          var desc = Data.getByType(ast, "desc");
          if (desc && desc.attributes && desc.attributes.text) {
            this.__data[moduleName].desc = desc.attributes.text;
          }
          this.__data[moduleName].events = this._getEvents(ast);
        } else {
          console && console.error("Couldn't load class doc for ", className);
        }
        this._checkReady();
      }, this).send();
    },

    _containsItem : function(list, item) {
      for (var i=0, l=list.length; i<l; i++) {
        if (list[i].name === item.name) {
          return true;
        }
      }
      return false;
    },

    _addNewItems : function(list, items) {
      items.forEach(function(item) {
        if (!this._containsItem(list, item)) {
          list.push(item);
        }
      }.bind(this));
    },


    _saveClassData : function(moduleName, ast) {
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
    },


    _extractPluginApi : function() {
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
              this.__data[pluginModuleName][type].sort(Data.__sortMethods);
            }
          }
        }.bind(this));
      }
    },


    _removeOverridden : function() {
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
    },


    /**
     * Move methods that return a class instance to the documentation
     * of that class
     */
    _moveMethodsToReturnTypes : function() {
      var removeMethods = [];
      this.forEachMethodList(function(methods, groupName) {
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
                if (returnTypeMethods.indexOf(method) == -1) {
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
    },


    getKeys : function() {
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
    },


    /**
     * Returns the API data for one module
     * @param moduleName {String} The module name
     * @return {Map} A map containing the following keys:
     *   * superClass (optional) The fully qualified name of the module's super class
     *   * desc The module's class documentation
     *   * events Array of event documentation nodes
     *   * fileName (optional) The fully qualified name of the module's origin class
     *   * group (optional) The module's group name, e.g. IO, Core, ...
     *   * member list of member method nodes
     *   * static list of static method nodes
     *   * prefix (optional) prefix for method names, e.g. "event."
     *   * types (optional) list of event type nodes (for event normalizations)
     *   * templates (optional) rendering templates documentation (for Widgets)
     *   * config (optional) config option documentation (for Widgets)
     *   * deprecated (optional) Either module is deprecated or not
     */
    getModule : function(moduleName) {
      return this.__data[moduleName];
    },


    forEachMethodList : function(callback) {
      for (var moduleName in this.__data) {
        var moduleData = this.__data[moduleName];
        if (moduleData.member) {
          callback(moduleData.member, moduleData.group);
        }
        if (moduleData.static) {
          callback(moduleData.static, moduleData.group);
        }
        if (moduleData.ast && moduleData.ast.children) {
          for (var i=0, l=moduleData.ast.children.length; i<l; i++) {
            var childNode = moduleData.ast.children[i];
            if (childNode.type &&
                childNode.type.indexOf("methods") === 0 &&
                childNode.children)
            {
              callback(childNode.children, moduleData.ast.attributes.group);
            }
          }
        }
      }
    },


    _getEvents : function(ast) {
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
    },


    _checkReady : function() {
      if (this.__loading === 0) {
        this._extractPluginApi();
        this._removeOverridden();
        this._moveMethodsToReturnTypes();
        this.emit("ready");
      }
    }

  }
});
