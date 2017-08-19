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
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * ************************************************************************/

var fs = require("fs");
var babelCore = require("babel-core");
var qx = require("qooxdoo");
var util = require("../util");
var types = require("babel-types");
var babylon = require("babylon");
var async = require("async");
var pathModule = require("path");
require("./jsdoc/Parser");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

var log = util.createLog("analyser");

var GLOBAL_SYMS = ["Math", "Array", "document", "window", "Error", "Object", "String", "navigator", "arguments",
  "RegExp", "JSON", "eval", "Date", "console", "qx.$$resources", "qx.$$libraries", "qx.$$domReady", "qx.$$loader",
  "qx.$$translations", "qx.$$locales", "qx.$$start", "qx.$$environment", "qx.$$domReady", "XPathResult"];

/**
 * Helper method that collapses the MemberExpression into a string
 * @param node
 * @returns {string}
 */
function collapseMemberExpression(node) {
  if (!node)
    debugger;
  if (node.type == "ThisExpression")
    return "this";
  if (node.type == "Identifier")
    return node.name;
  if (node.type != "MemberExpression")
    return "(" + node.type + ")";
  if (node.object === undefined)
    debugger;
  if (types.isIdentifier(node.object)) {
    var str = node.object.name;
    if (node.property.name)
      str += "." + node.property.name;
    return str;
  }
  return collapseMemberExpression(node.object) + "." + node.property.name;
}

/**
 * Helper method that expands a dotted string into MemberExpression
 * @param str
 * @returns {*}
 */
function expandMemberExpression(str) {
  var segs = str.split('.');
  var expr = types.memberExpression(types.identifier(segs[0]), types.identifier(segs[1]));
  for (var i = 2; i < segs.length; i++) {
    expr = types.memberExpression(expr, types.identifier(segs[i]));
  }
  return expr;
}

function literalValueToExpression(value) {
  if (value === null || value === undefined)
    return types.nullLiteral();
  if (typeof value == "boolean")
    return types.booleanLiteral(value);
  if (typeof value == "number")
    return types.numericLiteral(value);
  if (typeof value == "string")
    return types.stringLiteral(value);
  if (qx.lang.Type.isRegExp(value))
    return types.regExpLiteral(value.toString());
  if (qx.lang.Type.isDate(value))
    return types.stringLiteral(value.toString());

  if (qx.lang.Type.isArray(value)) {
    var arr = [];
    value.forEach(function(item) {
      arr.push(literalValueToExpression(item));
    });
    return types.arrayExpression(arr);
  }

  if (typeof value != "object") {
    log.error("Cannot serialise value " + value + " into AST");
    return types.nullLiteral();
  }

  var properties = [];
  for (var key in value) {
    var expr = literalValueToExpression(value[key]);
    var prop = types.objectProperty(types.stringLiteral(key), expr);
    properties.push(prop);
  }
  return types.objectExpression(properties);
}

/**
 * A class file is parsed and anaysed into an instance of ClassFile; it is
 * connected to the Analyser that found the class so that dependencies can be
 * identified.
 */
qx.Class.define("qxcompiler.ClassFile", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param analyser {Analyser} the Analyser that found the file
   * @param className {String} the full name of the class
   * @param library {Library} the Library the class belongs to (note that the class name is
   *  not always enough to identify the library, eg private source files such as qxWeb.js)
   */
  construct: function (analyser, className, library) {
    this.base(arguments);
    
    this.__analyser = analyser;
    this.__className = className;
    this.__library = library;

    this.__requiredClasses = {};
    this.__environmentChecks = {
      provided: {},
      required: {}
    };
    this.__requiredAssets = [];
    this.__translations = [];
    this.__markers = [];
    this.__haveMarkersFor = {};

    this.__scope = {
      parent: null,
      vars: {},
      unresolved: {}
    };

    this.__taskQueueDrains = [];
    this.__taskQueue = async.queue(function(task, cb) {
      task(cb);
    });
    this.__taskQueue.drain = this._onTaskQueueDrain;
    this.__taskQueue.error = function(err) {
      t.error(err.stack||err);
    };
  },

  members: {

    __analyser: null,
    __className: null,
    __library: null,
    __requiredClasses: null,
    __environmentChecks: null,
    __requiredAssets: null,
    __translateMessageIds: null,
    __scope: null,
    __inDefer: false,
    __inConstruct: false,
    __taskQueue: null,
    __taskQueueDrains: null,
    __functionName: null,
    __markers: null,
    __haveMarkersFor: null,
    __meta: null,

    _onTaskQueueDrain: function() {
      var cbs = this.__taskQueueDrain;
      this.this.__taskQueueDrain = [];
      cbs.forEach(function(cb) {
        cb();
      });
    },

    _waitForTaskQueueDrain: function(cb) {
      if (this.__taskQueue.length() == 0)
        cb();
      else
        this.__taskQueueDrains.push(cb);
    },

    _queueTask: function(cb) {
      this.__taskQueue.push(cb);
    },

    /**
     * Returns the absolute path to the class file
     * @returns {string}
     */
    getSourcePath: function() {
      return qxcompiler.ClassFile.getSourcePath(this.__library, this.__className);
    },

    /**
     * Returns the path to the rewritten class file
     * @returns {string}
     */
    getOutputPath: function() {
      return qxcompiler.ClassFile.getOutputPath(this.__analyser, this.__className);
    },

    /**
     * Loads the source, transpiles and analyses the code, storing the result in outputPath
     *
     * @param callback
     *          {Function} callback for when the load is completed
     */
    load: function (callback) {
      var t = this;
      var analyser = this.__analyser;

      fs.readFile(this.getSourcePath(), {encoding: "utf-8"}, function (err, src) {
        if (err)
          return callback(err);

        var pos = t.__className.lastIndexOf('.'); 
        t.__meta = {
            className: t.__className,
            packageName: pos > -1 ? t.__className.substring(0, pos) : null,
            name: pos > -1 ? t.__className.substring(pos + 1) : t.__className,
            superClass: null,
            interfaces: [],
            mixins: []
        };
        
        var result = babelCore.transform(src, {
          babelrc: false,
          filename: t.getSourcePath(),
          sourceMaps: "both",
          plugins: [
            t._babelClassPlugin(),
            require("babel-plugin-transform-es2015-template-literals"),
            require("babel-plugin-transform-es2015-literals"),
            require("babel-plugin-transform-es2015-function-name"),
            require("babel-plugin-transform-es2015-arrow-functions"),
            require("babel-plugin-transform-es2015-block-scoped-functions"),
            require("babel-plugin-transform-es2015-classes"),
            require("babel-plugin-transform-es2015-object-super"),
            require("babel-plugin-transform-es2015-shorthand-properties"),
            require("babel-plugin-transform-es2015-computed-properties"),
            require("babel-plugin-transform-es2015-for-of"),
            require("babel-plugin-transform-es2015-sticky-regex"),
            require("babel-plugin-transform-es2015-unicode-regex"),
            require("babel-plugin-check-es2015-constants"),
            require("babel-plugin-transform-es2015-spread"),
            require("babel-plugin-transform-es2015-parameters"),
            require("babel-plugin-transform-es2015-destructuring"),
            require("babel-plugin-transform-es2015-block-scoping"),
            require("babel-plugin-transform-es2015-typeof-symbol"),
            require("babel-plugin-transform-es2015-modules-commonjs"),
            [require("babel-plugin-transform-regenerator"), { async: false, asyncGenerators: false }]
          ]
        });

        var outputPath = t.getOutputPath();
        util.mkParentPath(outputPath, function(err) {
          if (err)
            return callback(err);
          fs.writeFile(outputPath, result.code, {encoding: "utf-8"}, function(err) {
            if (err)
              return callback(err);
            fs.writeFile(outputPath + ".map", JSON.stringify(result.map, null, 2), {encoding: "utf-8"}, function(err) {
              t._waitForTaskQueueDrain(function() {
                callback();
              });
            });
          });
        });
      });
    },

    /**
     * Writes the data for the database; updates the record, which may have been previously
     * used (so needs to be zero'd out)
     * @param dbClassInfo {Map}
     */
    writeDbInfo: function(dbClassInfo) {
      delete dbClassInfo.unresolved;
      delete dbClassInfo.dependsOn;
      delete dbClassInfo.assets;
      delete dbClassInfo.translations;
      delete dbClassInfo.markers;
      for (var key in this.__dbClassInfo)
        dbClassInfo[key] = this.__dbClassInfo[key];
    },

    /**
     * Compiles the DbInfo POJO to be stored in the database about this class
     **/
    _compileDbClassInfo: function() {
      var t = this;
      var dbClassInfo = this.__dbClassInfo = {};

      // Collect the dependencies on other classes
      var deps = this.getRequiredClasses();
      for (var name in deps) {
        var dep = deps[name];
        if (!dep.ignore) {
          if (!dbClassInfo.dependsOn)
            dbClassInfo.dependsOn = {};
          dbClassInfo.dependsOn[name] = dep;
        }
      }
      
      function fixAnnos(section) {
        if (!section)
          return;
        Object.keys(section).forEach(function(name) {
          if (name[0] == '@') {
            var value = section[name];
            delete section[name];
            name = name.substring(1);
            var meta = section[name];
            if (meta) {
              if (!meta.annotations)
                meta.annotations = [];
              meta.annotations.push(value);
            }
          }
        });
      }
      
      var meta = this.__meta;
      fixAnnos(meta.events);
      fixAnnos(meta.members);
      fixAnnos(meta.statics);

      // Class heirararchy
      dbClassInfo.extends = meta.superClass;
      dbClassInfo.include = meta.mixins.slice(0);
      dbClassInfo.implement = meta.interfaces.slice(0);
      if (Object.keys(this.__environmentChecks.provided).length || Object.keys(this.__environmentChecks.required).length) {
        dbClassInfo.environment = { provided: [], required: {} };
        for (var key in this.__environmentChecks.provided)
          dbClassInfo.environment.provided.push(key);
        for (var key in this.__environmentChecks.required)
          dbClassInfo.environment.required[key] = this.__environmentChecks.required[key];
      }

      // Save whether the class has a defer method
      dbClassInfo.hasDefer = this.hasDefer();

      // Unresolved symbols
      dbClassInfo.unresolved = [];
      for (var name in this.__scope.unresolved) {
        var item = this.__scope.unresolved[name];
        // item is undefined if it has already been removed from the list
        if (item === undefined)
          continue;
        var info = t.__analyser.getSymbolType(name);
        if (info && info.className)
          t._requireClass(info.className, { load: item.load, defer: item.defer });
        else if (info && info.symbolType == "package")
          t.deleteReference(name);
        else {
          dbClassInfo.unresolved.push(item);
          for (var j = 0; j < item.locations.length; j++) {
            t.addMarker("symbol.unresolved", item.locations[j].start, name);
          }
        }
      }
      if (!dbClassInfo.unresolved.length)
        delete dbClassInfo.unresolved;
      
      // Assets
      var assets = this.getAssets();
      if (assets.length)
        dbClassInfo.assets = assets;

      // Translation
      if (this.__translations.length)
        dbClassInfo.translations = this.__translations.slice(0);
      
      // Markers
      if (this.__markers.length)
        dbClassInfo.markers = qx.lang.Array.clone(this.__markers);

      return dbClassInfo;
    },
    
    /**
     * Returns the loaded meta data
     */
    getMeta: function() {
      return this.__meta;
    },
    
    /**
     * Babel plugin
     */
    _babelClassPlugin: function() {
      var t = this;
      
      function getKeyName(key) {
        var keyName = key.type == "StringLiteral" ? key.value : key.name;
        return keyName;
      }

      var functionDeclOrExpr = {
        enter(path) {
          var node = path.node;
          if (node.id)
            t.addDeclaration(node.id.name);
          t.pushScope(node.id ? node.id.name : null, node);
          for (var i = 0; i < node.params.length; i++)
            t.addDeclaration(node.params[i].name);
        },

        exit(path) {
          var node = path.node;
          t.popScope(node);
        }
      };

      function getClassNames(node) {
        if (types.isMemberExpression(node))
          return [ collapseMemberExpression(node) ];

        if (!types.isArrayExpression(node)) {
          return null;
        }
        var result = [];
        node.elements.forEach(function (node) {
          result.push(collapseMemberExpression(node));
        });
        return result;
      }
      
      function getJsDoc(comment) {
        if (!comment)
          return null;
        if (!qx.lang.Type.isArray(comment))
          comment = [comment];
        var result = {};
        comment.forEach((comment) => {
          var tmp = qxcompiler.jsdoc.Parser.parseComment(comment.value);
          for (var key in tmp) {
            var value = tmp[key];
            if (!result[key])
              result[key] = value;
            else
              qx.lang.Array.append(result[key], value);
          }
        });
        
        return result;
      }
      
      function makeMeta(sectionName, functionName, node) {
        if (!node)
          debugger;
        var meta;
        if (functionName) {
          var section = t.__meta[sectionName];
          if (section === undefined)
            section = t.__meta[sectionName] = {};
          meta = section[functionName];
          if (meta === undefined)
            meta = section[functionName] = {};
        } else {
          meta = t.__meta[sectionName];
          if (meta === undefined)
            meta = t.__meta[sectionName] = {};
        }
        meta.location = node.loc;
        
        if (node.leadingComments) {
          var jsdoc = getJsDoc(node.leadingComments);
          if (jsdoc) {
            if (jsdoc["@ignore"]) {
              jsdoc["@ignore"].forEach(function(elem) {
                t.addIgnore(elem.body);
              });
            }
            meta.jsdoc = jsdoc;
          }
        }
        
        if (sectionName === "members" || sectionName === "statics") {
          if (node.value.type === "FunctionExpression")
            meta.type = "function";
          else
            meta.type = "variable";
          if (functionName.startsWith("__"))
            meta.access = "private";
          else if (functionName.startsWith("_"))
            meta.access = "protected";
          else 
            meta.access = "public";
        } 
        return meta;
      }

      var COLLECT_CLASS_NAMES_VISITOR = {
        MemberExpression(path) {
          var self = this;
          var str = collapseMemberExpression(path.node);
          t._requireClass(str, { location: path.node.loc });
          var info = t.__analyser.getSymbolType(str);
          if (info && info.symbolType == "class") {
            self.collectedClasses.push(info.className);
          }
        }
      };
      
      function collectJson(node) {
        var result;
        if (node.type == "ObjectExpression") {
          result = {};
          node.properties.forEach(function(prop) {
            var key = prop.key.name;
            var value = collectJson(prop.value);
            result[key] = value;
          });
          
        } else if (node.type == "Literal" || 
            node.type == "StringLiteral" || 
            node.type == "BooleanLiteral" || 
            node.type == "NumericLiteral" || 
            node.type == "NullLiteral") {
          result = node.value;
          
        } else if (node.type == "ArrayExpression") {
          result = [];
          node.elements.forEach(function(elem) {
            result.push(collectJson(elem));
          });
          
        } else if (node.type == "Identifier") {
          result = node.name;
          
        } else if (node.type == "CallExpression" || node.type == "FunctionExpression") {
          result = "[[ Function ]]";
          
        } else {
          t.warn("Cannot interpret AST " + node.type + " at " + t.__className + " [" + node.loc.start.line + "," + node.loc.start.column + "]");
          result = null;
        }
        return result;
      }

      var CLASS_DEF_VISITOR = {
        Property(path) {
          if (path.parentPath.parentPath != this.classDefPath)
            return;
          var prop = path.node;
          var keyName = getKeyName(prop.key);

          if (keyName == "extend") {
            t.__meta.superClass = collapseMemberExpression(prop.value);
            t._requireClass(t.__meta.superClass, { location: path.node.loc });

          } else if (keyName == "implement") {
            path.skip();
            path.traverse(COLLECT_CLASS_NAMES_VISITOR, { collectedClasses: t.__meta.interfaces });

          } else if (keyName == "include") {
            path.skip();
            path.traverse(COLLECT_CLASS_NAMES_VISITOR, { collectedClasses: t.__meta.mixins });

          } else if (keyName == "defer") {
            t.__hasDefer = true;
            t.__inDefer = true;
            makeMeta("defer", null, path.node);
            path.skip();
            path.traverse(VISITOR);
            t.__inDefer = false;

          } else if (keyName == "statics") {
            if (this.__className == "qx.core.Environment") {
              var checks = this.__findProperty(prop.value.properties, "_checksMap");
              var props = checks.value.properties;
              for (var j = 0; j < props.length; j++) {
                this.__analyser.setEnvironmentCheck(props[j].key.value, props[j].value.value);
              }
            }
            path.skip();
            path.traverse({
              Property(path) {
                path.skip();
                if (path.parentPath.parentPath != membersPath) {
                  return path.traverse(VISITOR);
                }
                t.__functionName = getKeyName(path.node.key);
                var meta = makeMeta("statics", t.__functionName, path.node);
                if (path.node.value.type === "FunctionExpression")
                  meta.type = "function";
                else
                  meta.type = "variable";
                path.traverse(VISITOR);
                t.__functionName = null;
              },
              FunctionDeclaration: functionDeclOrExpr,
              FunctionExpression: functionDeclOrExpr,
              ArrowFunctionExpression: functionDeclOrExpr
            });

          } else if (keyName == "construct") {
            t.__functionName = "$$constructor";
            makeMeta("construct", null, path.node);
            path.skip();
            path.traverse(VISITOR);
            t.__functionName = null;

          } else if (keyName == "destruct") {
            t.__functionName = "$$destructor";
            makeMeta("destruct", null, path.node);
            path.skip();
            path.traverse(VISITOR);
            t.__functionName = null;

          } else if (keyName == "members") {
            var membersPath = path;
            path.skip();
            path.traverse({
              Property(path) {
                path.skip();
                if (path.parentPath.parentPath != membersPath) {
                  return path.traverse(VISITOR);
                }
                t.__functionName = getKeyName(path.node.key);
                var meta = makeMeta("members", t.__functionName, path.node);
                path.traverse(VISITOR);
                t.__functionName = null;
              },
              FunctionDeclaration: functionDeclOrExpr,
              FunctionExpression: functionDeclOrExpr,
              ArrowFunctionExpression: functionDeclOrExpr
            });
            
          } else if (keyName == "properties") {
            path.skip();
            if (!prop.value.properties) {
              t.addMarker("class.invalidProperties", prop.loc||null);
            } else {
              prop.value.properties.forEach(function(pdNode) {
                var propName = getKeyName(pdNode.key);
                var meta = makeMeta("properties", propName, pdNode);
                var data = collectJson(pdNode.value);
                meta.name = propName;
                meta.propertyType = "new";
                [ "refine", "themeable", "event", "inheritable", "apply", "async" ]
                  .forEach((name) => meta[name] = data[name]);
                if (data.nullable !== undefined)
                  meta.allowNull = data.nullable;
                if (data.check !== undefined) {
                  if (qx.lang.Type.isArray(data.check))
                    meta.possibleValues = data.check;
                  else
                    meta.check = data.check;
                }
                if (data.init !== undefined)
                  meta.defaultValue = data.init;
              });
            }

          } else {
            path.skip();
            path.traverse(VISITOR);
          }
        }
      };

      var VISITOR = {
        NewExpression(path) {
          var str = collapseMemberExpression(path.node.callee);
          t._requireClass(str, { usage: "dynamic", location: path.node.loc });
        },

        CallExpression: {
          enter: function(path) {
            function getStringArg(index) {
              if (index >= path.node.arguments.length)
                return null;
              var arg = path.node.arguments[index];
              if (arg.type == "StringLiteral")
                return arg.value;
              return null;
            }

            function addTranslation(entry) {
              var lineNo = path.node.loc.start.line;
              var cur = t.__translations[entry.msgid];
              if (cur) {
                if (!qx.lang.Type.isArray(cur.lineNo))
                  cur.lineNo = [cur.lineNo];
                cur.lineNo.push(lineNo);
              } else {
                entry.lineNo = lineNo;
                t.__translations.push(entry);
              }
            }

            if (types.isMemberExpression(path.node.callee)) {
              var name = collapseMemberExpression(path.node.callee);

              const TYPE = {
                  "qx.Class.define": "class",
                  "qx.Mixin.define": "mixin",
                  "qx.Theme.define": "theme",
                  "qx.Interface.define": "interface",
                  "qx.Bootstrap.define": "class"
              };
              
              if (TYPE[name]) {
                t.__definingType = name.match(/\.([a-zA-Z]+)\./)[1];
                var node = path.node;
                var className = node.arguments[0].value;
                var classDef = node.arguments[1];
  
                // We can only parse objects (eg qx.data.marshal.Json.__toClass creates objects on the fly that we cannot scan)
                if (classDef.type != "ObjectExpression") {
                  return;
                }
  
                var meta = makeMeta("clazz", null, path.parent);
                t.__meta.type = TYPE[name];
                var jsdoc = meta.jsdoc;
                if (jsdoc) {
                  if (jsdoc["@use"]) {
                    jsdoc["@use"].forEach(function(elem) {
                      t._requireClass(elem.body, { where: "use", load: false, location: path.parent.loc });
                    });
                  }
                  if (jsdoc["@require"]) {
                    jsdoc["@require"].forEach(function(elem) {
                      t._requireClass(elem.body, { where: "require", load: false, location: path.parent.loc });
                    });
                  }
                  if (jsdoc["@optional"]) {
                    jsdoc["@optional"].forEach(function(elem) {
                      t.addIgnore(elem.body);
                    });
                  }
                  if (jsdoc["@ignore"]) {
                    jsdoc["@ignore"].forEach(function(elem) {
                      t.addIgnore(elem.body);
                    });
                  }
                  if (jsdoc["@asset"]) {
                    jsdoc["@asset"].forEach(function(elem) {
                      t._requireAsset(elem.body);
                    });
                  }
                }
  
                t._requireClass(name, { usage: "dynamic", location: path.node.loc });
                //path.skip();
                path.traverse(CLASS_DEF_VISITOR, {classDefPath: path});
  
              } else if (name == "qx.core.Environment.add") {
                var arg = path.node.arguments[0];
                if (types.isLiteral(arg)) {
                  if (typeof arg.value != "string")
                    log.error("Invalid argument to qx.core.Environment.add: " + arg.value);
                  else
                    t.__environmentChecks.provided[arg.value] = true;
                }
                t._requireClass("qx.core.Environment", { usage: "dynamic", location: path.node.loc });

              } else if (name == "qx.core.Environment.get") {
                var arg = path.node.arguments[0];
                if (types.isLiteral(arg)) {
                  if (typeof arg.value != "string")
                    log.error("Invalid argument to qx.core.Environment.get: " + arg.value);
                  else {
                    t.addEnvCheck(arg.value, path.node.loc);
                  }
                }
                t._requireClass("qx.core.Environment", { usage: "dynamic", location: path.node.loc });
                path.skip();
                path.traverse(CLASS_DEF_VISITOR, {classDefPath: path});

              } else if (name == "qx.core.Environment.select") {
                var arg = path.node.arguments[0];
                if (types.isLiteral(arg)) {
                  if (typeof arg.value != "string")
                    log.error("Invalid argument to qx.core.Environment.select: " + arg.value);
                  else {
                    t.addEnvCheck(arg.value, path.node.loc);
                  }
                }
                // todo ----

                t._requireClass("qx.core.Environment", { usage: "dynamic", location: path.node.loc });
                path.skip();
                path.traverse(CLASS_DEF_VISITOR, {classDefPath: path});

              } else if (name == "this.base") {
                var expr;
                
                // For mixins, there is never a valid time to call this.base() in the constructor; but it is
                //  OK in methods - but we have to refer to superclass.methodName directly.  For ordinary
                //  classes, we need to use constructor.methodName.base.
                if (t.__definingType == "Mixin") {
                  expr = expandMemberExpression("this.constructor.superclass.prototype." + t.__functionName + ".call");
                } else {
                  if (t.__functionName == "$$constructor")
                    expr = expandMemberExpression(t.__meta.superClass + ".constructor.call");
                  else
                    expr = expandMemberExpression(t.__className + ".prototype." + t.__functionName + ".base.call");
                }
                path.node.arguments[0] = types.thisExpression();
                var callExpr = types.callExpression(expr, path.node.arguments);
                path.replaceWith(callExpr);

              } else if (name == "this.base.apply" || name == "this.base.call") {
                var methodName = name == "this.base.apply" ? "apply" : "call";

                var expr;
                if (t.__definingType == "Mixin") {
                  expr = expandMemberExpression("this.constructor.superclass.prototype." + t.__functionName + ".call");
                } else {
                  if (t.__functionName == "$$constructor")
                    expr = expandMemberExpression(t.__meta.superClass + ".constructor." + methodName);
                  else
                    expr = expandMemberExpression(t.__className + ".prototype." + t.__functionName + ".base." + methodName);
                }
                
                // Original call to this.base.apply would have included arguments in the first element of the array
                //  here we remove that because it's not needed, specifically changing 
                //    `this.base.apply(this, args)` to
                //    `this.base.apply(this, args.slice().shift())`
                var exprSplice = types.callExpression(types.memberExpression(path.node.arguments[1], types.identifier("slice")), []);
                var exprUnshift = types.callExpression(types.memberExpression(exprSplice, types.identifier("shift")), []);
                var callExpr = types.callExpression(expr, [ path.node.arguments[0], exprUnshift ]);
                path.replaceWith(callExpr);

              } else if (name == "this.self") {
                var expr = expandMemberExpression(t.__className);
                path.replaceWith(expr);

              } else if (name == "this.tr" || name == "this.marktr" || name == "qx.locale.Manager.tr" || name == "qx.locale.Manager.marktr") {
                var arg0 = getStringArg(0);
                if (!arg0)
                  t.addMarker("translate.invalidMessageId", path.node.loc, arg0);
                else
                  addTranslation({ msgid: arg0 });

              } else if (name == "this.trn" || name == "qx.locale.Manager.trn") {
                var arg0 = getStringArg(0);
                var arg1 = getStringArg(1);
                if (!arg0 || !arg1)
                  t.addMarker("translate.invalidMessageIds", path.node.loc, arg0, arg1);
                else
                  addTranslation({ msgid: arg0, msgid_plural: arg1 });

              } else if (name == "this.trc" || name == "qx.locale.Manager.trc") {
                var arg0 = getStringArg(0);
                var arg1 = getStringArg(1);
                if (!arg0 || !arg1)
                  t.addMarker("translate.invalidMessageIds", path.node.loc, arg0, arg1);
                else
                  addTranslation({ msgid: arg1, comment: arg0 });

              } else if (name == "this.trnc" || name == "qx.locale.Manager.trnc") {
                var arg0 = getStringArg(0);
                var arg1 = getStringArg(1);
                var arg2 = getStringArg(2);
                if (!arg0 || !arg1 || !arg2)
                  t.addMarker("translate.invalidMessageIds3", path.node.loc, arg0, arg1, arg2);
                else
                  addTranslation({ msgid: arg1, msgid_plural: arg2, comment: arg0 });

              } else {
                var pos = name.lastIndexOf('.');
                if (pos > -1) {
                  var str = name.substring(0, pos);
                  if (!t.hasDeclaration(str))
                    t._requireClass(str, { usage: "dynamic", location: path.node.loc });
                }
              }
            }
          },
          
          exit: function(path) {
            if (types.isMemberExpression(path.node.callee)) {
              var name = collapseMemberExpression(path.node.callee);

              if (name == "qx.Class.define" || name == "qx.Mixin.define" || name == "qx.Theme.define"
                  || name == "qx.Interface.define" || name == "qx.Bootstrap.define") {
                
                // Must be a conventional define 
                if (path.node.arguments.length != 2 || 
                    path.node.arguments[0].type != "StringLiteral" ||
                    path.node.arguments[1].type != "ObjectExpression") {
                  return;
                }
                
                var dbClassInfo = t._compileDbClassInfo();
                var tmp = types.variableDeclaration("var", [ types.variableDeclarator(types.identifier("$$dbClassInfo"), literalValueToExpression(dbClassInfo)) ]);
                var inject = [tmp];
                var hasLoadDeps = (function() {
                  if (dbClassInfo.dependsOn)
                    for (var key in dbClassInfo.dependsOn)
                      if (dbClassInfo.dependsOn[key].load)
                        return true;
                  if (dbClassInfo.environment) {
                    var required = dbClassInfo.environment.required;
                    if (required)
                      for (var key in required)
                        if (required[key].load)
                          return true;
                  }
                  return false;
                })();
                if (hasLoadDeps) {
                  tmp = babylon.parse("qx.Bootstrap.executePendingDefers($$dbClassInfo);").program.body;
                  inject.push(tmp[0]);
                }
                inject.push(types.expressionStatement(path.node));
                tmp = babylon.parse(t.__className + ".$$dbClassInfo = $$dbClassInfo;").program.body;
                inject.push(tmp[0]);
                var block = types.blockStatement(inject);
                
                var index = -1;
                for (var i = 0; index === -1 && i < path.parentPath.container.length; i++) {
                  if (path.parentPath.container[i].expression === path.node)
                    index = i;
                }
                // If you can't find index it's because it is not a real class definition (eg unit tests or other mockups)
                if (index > -1)
                  path.parentPath.container[index] = types.expressionStatement(types.callExpression(types.functionExpression(null, [], block), []));
              }
            }
          }
        },

        MemberExpression(path) {
          // regular expression or string property (eg "aa".charCodeAt())
          if (path.node.object.type == "Literal")
            return;

          var name = collapseMemberExpression(path.node);
          if (name.startsWith("("))
            return;
          var members = name.split('.');
          //if (name == "qx.ui.form.Button")
          //  console.log("VISITOR: name=" + name + ", inDefer=" + t.__inDefer);

          // Ignore 'this' references
          if (members[0] === "this")
            return;

          // Global variable or a local variable?
          if (GLOBAL_SYMS.indexOf(members[0]) > -1 || t.hasDeclaration(members[0]))
            return;

          var info = t._requireClass(name, { location: path.node.loc });
          if (!info || !info.className)
            t.addReference(members, path.node.loc);
        },

        FunctionDeclaration: functionDeclOrExpr,
        FunctionExpression: functionDeclOrExpr,
        ArrowFunctionExpression: functionDeclOrExpr,

        VariableDeclaration(path) {
          var lst = path.node.declarations;
          for (var i = 0; i < lst.length; i++)
            t.addDeclaration(lst[i].id.name);
        },

        CatchClause: {
          enter(path) {
            t.pushScope(null, path.node);
            t.addDeclaration(path.node.param.name);
          },
          exit(path) {
            t.popScope(path.node);
          }
        },

        IfStatement: {
          exit(path) {
            var node = path.node;

            function apply(value) {
              if (!value) {
                if (!node.alternate)
                  path.remove();
                else
                  path.replaceWithMultiple(node.alternate.body);

              } else if (value) {
                path.replaceWithMultiple(node.consequent.body);
              }
            }

            if (types.isLiteral(node.test)) {
              apply(node.test.value);

            } else if (types.isUnaryExpression(node.test, { operator: "!" }) && types.isLiteral(node.test.argument)) {
              var value = node.test.argument.value;
              apply(!value);
            }
          }
        },

        LogicalExpression: {
          exit(path) {
            var node = path.node;
            if (types.isLiteral(node.left) && types.isLiteral(node.right)) {
              var result = (node.operator == "&&" && node.left.value && node.right.value) ||
                  (node.operator == "||" && (node.left.value || node.right.value));
              path.replaceWith(types.booleanLiteral(result));
            }
          }
        },

        BinaryExpression: {
          exit(path) {
            var node = path.node;
            if (types.isLiteral(node.left) && types.isLiteral(node.right)) {
              var result;
              switch(node.operator) {
                case "==":
                  result = node.left.value == node.right.value;
                  break;
                case "===":
                  result = node.left.value === node.right.value;
                  break;
                case "!=":
                  result = node.left.value != node.right.value;
                  break;
                case "!==":
                  result = node.left.value !== node.right.value;
                  break;
              }
              if (result !== undefined) {
                path.replaceWith(types.booleanLiteral(!!result));
              }
            }
          }
        },

        UnaryExpression: {
          exit(path) {
            if (path.node.operator === "!" && types.isLiteral(path.node.argument)) {
              path.replaceWith(types.booleanLiteral(!path.node.argument.value));
            }
          }
        }
      };

      return { visitor: VISITOR };
    },

    /**
     * Pushes a new scope on the stack
     */
    pushScope: function (functionName, node) {
      this.__scope = {
        functionName: functionName,
        parent: this.__scope,
        vars: {},
        unresolved: {}
      };
    },

    /**
     * Pops a scope from the stack
     */
    popScope: function (node) {
      var old = this.__scope;
      var scope = this.__scope = this.__scope.parent;
      var unresolved = scope.unresolved;

      for (var name in old.unresolved) {
        var entry = unresolved[name];
        if (!entry)
          entry = unresolved[name] = {
            name: name,
            locations: []
          };
        entry.locations.push.apply(entry.locations, old.unresolved[name].locations);
      }
    },

    /**
     * Tests whether the current scope is load-time scope
     *
     * @returns {Boolean}
     */
    isLoadScope: function () {
      return !this.__scope.parent;
    },

    /**
     * Tests whether this class has a defer method
     *
     * @returns {Boolean}
     */
    hasDefer: function () {
      return this.__hasDefer;
    },

    /**
     * Adds a variable declaration to the current scope; if the symbol was
     * previously "unresolved" it is removed from the unresolved list
     *
     * @param name
     */
    addDeclaration: function (name) {
      if (this.__scope.vars[name] === undefined) {
        this.__scope.vars[name] = true;
        var unresolved = this.__scope.unresolved;
        delete unresolved[name];
        var re = new RegExp(name + "\\.");
        for (var tmp in unresolved)
          if (re.test(tmp))
            delete unresolved[tmp];
      }
    },

    /**
     * Tests whether there is a variable declaration accessible to the current
     * scope, ie including parent scope
     *
     * @param name
     * @returns {Boolean}
     */
    hasDeclaration: function (name) {
      var pos = name.indexOf('.');
      if (pos > -1)
        name = name.substring(0, pos);
      for (var tmp = this.__scope; tmp; tmp = tmp.parent)
        if (tmp.vars[name] !== undefined)
          return true;
      return false;
    },

    /**
     * Adds a reference to a symbol; unknown symbols are marked as unresolved
     * @param name
     * @param loc
     */
    addReference: function (name, loc) {
      var str = "";
      for (var i = 0; i < name.length; i++) {
        if (i)
          str += ".";
        str += name[i];
        if (qxcompiler.ClassFile.GLOBAL_SYMBOLS[str] || this.isIgnored(str))
          return;
      }
      name = name.join(".");
      if (name == this.__className || name.startsWith(this.__className + ".") || name.startsWith("("))
        return;
      var scope = this.__scope;
      if (scope.vars[name] !== undefined)
        return;

      if (!scope.unresolved[name])
        scope.unresolved[name] = {
          name: name,
          locations: loc ? [loc] : [],
          load: this.isLoadScope(),
          defer: this.__inDefer
        };
      else if (loc)
        scope.unresolved[name].locations.push(loc);
    },

    /**
     * Removes a reference from scope; this should only really be used after scanning is complete
     * @param name
     */
    deleteReference: function(name) {
      delete this.__scope.unresolved[name];
      var stub = name + ".";
      for (var id in this.__scope.unresolved)
        if (id.startsWith(stub))
          delete this.__scope.unresolved[id];
    },

    /**
     * Adds an ignored symbol
     * @param name {String} name of the symbol
     */
    addIgnore: function(name) {
      var scope = this.__scope;
      if (!scope.ignore)
        scope.ignore = {};
      var segs = name.split(',');
      segs.forEach((name) => {
        var m = name.match(/^([^*]+)\*/);
        if (m)
          scope.ignore[name] = m[1];
        else
          scope.ignore[name] = true;
      });
    },

    /**
     * Tests whether a symbol has already been marked as ignore
     * @param name {String} symbol name
     * @param {Boolean} true if ignored
     */
    isIgnored: function(name) {
      for (var tmp = this.__scope; tmp; tmp = tmp.parent)
        if (tmp.ignore) {
          if (tmp.ignore[name])
            return true;
          for (var key in tmp.ignore)
            if (tmp.ignore[key] !== true) {
              if (name.startsWith(tmp.ignore[key]))
                return true;
            }
        }
      return false;
    },

    /**
     * Adds an environment check made by the class
     * 
     * @param name
     * @param opts {Object?} see _requireClass
     */
    addEnvCheck: function(name, location) {
      var t = this;
      var requiredOpts = {
        load: t.isLoadScope(),
        defer: t.__inDefer,
        construct: t.__functionName == "$$constructor",
        location: location
      };
      var dest = t.__environmentChecks.required[name];
      if (!dest)
        dest = t.__environmentChecks.required[name] = {};
      if (requiredOpts.load)
        dest.load = true;
      if (requiredOpts.defer)
        dest.defer = true;
      if (requiredOpts.construct)
        dest.construct = true;
      t._requireClass("qx.core.Environment", { location: location });
      if (qxcompiler.ClassFile.ENVIRONMENT_CONSTANTS[name] === undefined) {
        var entry = qxcompiler.ClassFile.ENVIRONMENT_CHECKS[name];
        if (entry && entry.className) {
          t._requireClass(entry.className, { load: requiredOpts.load, location: location });
          dest.className = entry.className;
        } else if (!entry) {
          t._requireClass(name, { load: requiredOpts.load, location: location });
        }
      }
    },

    /**
     * Adds a marker (eg warning or error)
     * 
     * @param msgId {String} the marker message ID (@see qxcompiler.Marker)
     * @param pos {Object||null} position map; may contain a Map containing 
     *  {line,column?}, or a Map {start:{line,column}, end: {line,column}}.
     * @param arguments? {Object...} variable argument list, specific to the msgId
     */
    addMarker: function(msgId, pos) {
      // Give each marker a unique key based on msgId and the line; use this to suppress
      //  multiple markers
      var key = msgId + "#";
      if (pos) {
        if (pos.line)
          key += pos.line;
        else if (pos.start && pos.start.line)
          key += pos.start.line;
      }
      if (this.__haveMarkersFor[key])
        return;
      this.__haveMarkersFor[key] = true;
      
      var marker = {
        msgId: msgId,
      };
      
      // Extract position
      if (pos) {
        if (pos.line) {
          pos = { start: pos };
        }
        if (pos.start) {
          var tmp = { line: pos.start.line };
          if (pos.start.column)
            tmp.column = pos.start.column;
          marker.pos = { start: tmp };
          if (pos.end && pos.end.line) {
            var tmp = { line: pos.end.line };
            if (pos.end.column)
              tmp.column = pos.end.column;
            marker.pos.end = tmp;
          }
        }
      }
      var args = qx.lang.Array.fromArguments(arguments, 2);
      if (args.length)
        marker.args = args;
      this.__markers.push(marker);
    },

    /**
     * Adds a required class
     *
     * @param name {String} the name of the class
     * @param opts {Map?} which is:
     *
     * @param where {"ignore"|"require"|"use"|null} where it's mentioned
     * @param load {Boolean?} whether it is a load-time dependency or not
     * @param defer {Boolean?} whether the dependency is in defer or not
     */
    _requireClass: function (name, opts) {
      var t = this;
      if (name == this.__className)
        return;
      if (!name) {
        debugger;
        throw new Error("No classname");
      }
      if (this.isIgnored(name))
        return;
      
      if (typeof opts == "function") {
        cb = opts;
        opts = null;
      }
      var requireOpts = {
        load: t.isLoadScope(),
        defer: t.__inDefer,
        construct: t.__functionName == "$$constructor"
      };
      if (opts)
        for (var key in opts)
          requireOpts[key] = opts[key];

      var info = t.__analyser.getSymbolType(name);
      var symbolType = info ? info.symbolType : null;
      var className = info ? info.className : null;
      if (symbolType != "package" && className && className != t.__className) {
        // Re-check the class name as ignored if this is a member
        if (symbolType == "member" && t.isIgnored(className))
          return;
        var data = t.__requiredClasses[className];
        if (!data)
          data = t.__requiredClasses[className] = {};

        if (requireOpts.where !== undefined) {
          if (requireOpts.where == "ignore")
            data.ignore = true;
          else if (requireOpts.where == "require")
            data.require = true;
        }
        if (requireOpts.load) {
          data.load = true;
          if (requireOpts.usage === "dynamic") {
            if (data.usage !== "static")
              data.usage = "dynamic";
            data.load = true;
          } else if (!data.load) {
            data.load = true;
            data.usage = "static";
          }
        }
        if (requireOpts.defer) {
          if (requireOpts.load)
            data.defer = "load";
          else if (data.defer !== "load")
            data.defer = "runtime";
          
          if (!name.startsWith(t.__className)) {
            if (!qxcompiler.ClassFile.DEFER_SAFE_SYMBOLS.some(function(symbol) {
              return name.startsWith(symbol);
            })) {
              t.addMarker("defer.unsafe", (opts && opts.location)||null, name);
            }
          }
        }
        if (requireOpts.construct)
          data.construct = true;
        t.deleteReference(className);
      }
      return info;
    },

    /**
     * Adds a required asset
     * @param path
     */
    _requireAsset: function (path) {
      if (!qx.lang.Array.contains(this.__requiredAssets, path))
        this.__requiredAssets.push(path);
    },

    /**
     * Returns the assets required by the class
     * @returns
     */
    getAssets: function () {
      return this.__requiredAssets;
    },

    /**
     * Finds an object property in a node tree (not a Qooxdoo property, an
     * object property)
     *
     * @param props
     * @param name
     * @returns
     */
    __findProperty: function (props, name) {
      for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (prop.type == "Property") {
          if (prop.key.type == "Identifier" && prop.key.name == name)
            return prop;
          if (prop.key.type == "StringLiteral" && prop.key.value == name)
            return prop;
        }
      }
      return null;
    },

    /**
     * Returns the list of required classes (dependencies)
     *
     * @returns
     */
    getRequiredClasses: function () {
      return this.__requiredClasses;
    },

    /**
     * Returns a list of unresolved symbols
     *
     * @returns
     */
    getUnresolvedSymbols: function () {
      return this.__scope.unresolved;
    },

    /**
     * Returns the name of the class being compiled
     * @returns {null}
     */
    getClassName: function() {
      return this.__className;
    }

  },

  statics: {
    /**
     * Returns the absolute path to the class file
     * 
     * @param library {qxcompiler.Library}
     * @param className {String}
     * @returns {String}
     */
    getSourcePath: function(library, className) {
      return pathModule.join(library.getRootDir(), library.getSourcePath(), className.replace(/\./g, pathModule.sep) + ".js");
    },

    /**
     * Returns the path to the rewritten class file
     * 
     * @param library {qxcompiler.Library}
     * @param className {String}
     * @returns {String}
     */
    getOutputPath: function(analyser, className) {
      var filename = pathModule.join(analyser.getOutputDir(), "transpiled", className.replace(/\./g, pathModule.sep) + ".js");
      return filename;
    },

    /**
     * Returns the root namespace from the classname, or null if it cannot be determined
     * @param className
     * @returns {*|null}
     */
    getNamespace: function(className) {
      var m = className.match(/^([^.]+)\./);
      return (m && m[1])||null;
    },

    /**
     * Decodes a marker into a String description
     * @param maker {Map} containing:
     *    msgId {String}
     *    start {Map} containing:
     *        line {Integer}
     *        column? {Integer}
     *    end? {Map} containing:
     *        line {Integer}
     *        column? {Integer}
     *    args? {Object[]}
     * @param showPosition {Boolean?} whether to include line/column info (default is true)
     */
    decodeMarker: function(marker, showPosition) {
      var msg = qxcompiler.ClassFile.MARKERS[marker.msgId]||marker.msgId;
      var str = "";
      var pos = marker.pos;
      if (showPosition !== false && pos.start && pos.start.line) {
        str += "[" + pos.start.line;
        if (pos.start.column)
          str += "," + pos.start.column;
        if (pos.end && pos.end.line && pos.end.line !== pos.start.line && pos.end.column !== pos.end.column) {
          str += " to " + pos.end.line;
          if (pos.end.column)
            str += "," + pos.end.column;
        }
        str += "] ";
      }
      str += qx.lang.String.format(msg, marker.args||[]);
      return str;
    },
    
    /**
     * Message strings for markers, ie errors and warnings.  The strings are stored as statics 
     * here, but that's because qxcompile is currently assembled by hand and therefore does not 
     * support translations.  When qxcompiler is itself compiled by qxcompiler, these strings 
     * will move into translation files.
     */
    MARKERS: {
      "symbol.unresolved": "Unresolved use of symbol %1",
      "defer.unsafe": "Unsafe use of 'defer' method to access external class: %1",
      "class.invalidProperties": "Invalid 'properties' key in class definition",
      "translate.invalidMessageId": "Cannot interpret message ID %1",
      "translate.invalidMessageIds": "Cannot interpret message ID %1, %2",
      "translate.invalidMessageIds3": "Cannot interpret message ID %1, %2, %3"
    },
    
    /**
     * Classes which are safe to access from defer methods (in addition to the class being defined)
     */
    DEFER_SAFE_SYMBOLS: [
      "qx.core.Environment",
      "qx.Bootstrap",
      "qx.core.Aspect"
    ],
    
    /**
     * List of global symbols to be ignored
     */
    GLOBAL_SYMBOLS: {
      "qx.$$environment": true,
      "qx.$$translations": true,
      "qx.$$locales": true,
      "qx.$$namespaceRoot": true,
      "qx.$$start": true,
      "qx.$$loader": true,
      "qx.$$resources": true,
      "qx.$$libraries": true,
      "Function": true,
      "Number": true,
      "String": true,
      "Array": true
    },
    
    /**
     * These are the constants which are answered by Qooxdoo qx.core.Environment; we use out own copy here and
     * not the one available in qx.core.Environment._defaults because we need to use the version which is appropriate
     * for the version of Qooxdoo being compiled, not the one that qxcompiler is compiled with
     */
    ENVIRONMENT_CONSTANTS:     {
      // an always-true key (e.g. for use in qx.core.Environment.filter() calls)
      "true": true,
      // old settings retTrue
      "qx.allowUrlSettings": false,
      "qx.allowUrlVariants": false,
      "qx.debug.property.level": 0,
      // old variants
      // make sure to reflect all changes to qx.debug here in the bootstrap class!
      "qx.debug": true,
      "qx.debug.ui.queue": true,
      "qx.debug.touchpad.detection": false,
      "qx.aspects": false,
      "qx.dynlocale": true,
      "qx.dyntheme": true,
      "qx.blankpage": "qx/static/blank.html",
      "qx.debug.databinding": false,
      "qx.debug.dispose": false,
      // generator optimization vectors
      "qx.optimization.basecalls": false,
      "qx.optimization.comments": false,
      "qx.optimization.privates": false,
      "qx.optimization.strings": false,
      "qx.optimization.variables": false,
      "qx.optimization.variants": false,
      // qooxdoo modules
      "module.databinding": true,
      "module.logger": true,
      "module.property": true,
      "module.events": true,
      "qx.nativeScrollBars": false,
      "qx.automaticMemoryManagement": true,
      "qx.promise": true,
      "qx.promise.warnings": true,
      "qx.promise.longStackTraces": true
    },


    /**
     * These are the standard environment checks made by Qooxdoo classes; this list allows us to map between
     * the short names (eg "os.version") and the actual implementation, which is essential in order to calculate
     * dependency information.  I have not found anywhere this is listed except in the comments for qx.core.Environment,
     * and that table is converted into this list by ~/test/get-environment-defaults.html
     *
     * Note that our parser does try to observe the environment checks which are provided by each class and
     * in theory this could be used to generate this list but that requires parsing absolutely every class
     * in every library every time we compile, including test classes.  So if we have to have a lookup list, this
     * is it!
     */
    ENVIRONMENT_CHECKS: {
      "browser.documentmode": {
        "key": "browser.documentmode",
        "type": "Integer",
        "className": "qx.bom.client.Browser",
        "method": "getDocumentMode"
      },
      "browser.name": {
        "key": "browser.name",
        "type": "String",
        "className": "qx.bom.client.Browser",
        "method": "getName"
      },
      "browser.quirksmode": {
        "key": "browser.quirksmode",
        "type": "Boolean",
        "className": "qx.bom.client.Browser",
        "method": "getQuirksMode"
      },
      "browser.version": {
        "key": "browser.version",
        "type": "String",
        "className": "qx.bom.client.Browser",
        "method": "getVersion"
      },
      "runtime.name": {
        "key": "runtime.name",
        "type": " String ",
        "className": "qx.bom.client.Runtime",
        "method": "getName"
      },
      "css.borderradius": {
        "key": "css.borderradius",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getBorderRadius"
      },
      "css.borderimage": {
        "key": "css.borderimage",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getBorderImage"
      },
      "css.borderimage.standardsyntax": {
        "key": "css.borderimage.standardsyntax",
        "type": "Boolean or null",
        "className": "qx.bom.client.Css",
        "method": "getBorderImageSyntax"
      },
      "css.boxmodel": {
        "key": "css.boxmodel",
        "type": "String",
        "className": "qx.bom.client.Css",
        "method": "getBoxModel"
      },
      "css.boxshadow": {
        "key": "css.boxshadow",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getBoxShadow"
      },
      "css.gradient.linear": {
        "key": "css.gradient.linear",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getLinearGradient"
      },
      "css.gradient.filter": {
        "key": "css.gradient.filter",
        "type": "Boolean",
        "className": "qx.bom.client.Css",
        "method": "getFilterGradient"
      },
      "css.gradient.radial": {
        "key": "css.gradient.radial",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getRadialGradient"
      },
      "css.gradient.legacywebkit": {
        "key": "css.gradient.legacywebkit",
        "type": "Boolean",
        "className": "qx.bom.client.Css",
        "method": "getLegacyWebkitGradient"
      },
      "css.placeholder": {
        "key": "css.placeholder",
        "type": "Boolean",
        "className": "qx.bom.client.Css",
        "method": "getPlaceholder"
      },
      "css.textoverflow": {
        "key": "css.textoverflow",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getTextOverflow"
      },
      "css.rgba": {
        "key": "css.rgba",
        "type": "Boolean",
        "className": "qx.bom.client.Css",
        "method": "getRgba"
      },
      "css.usermodify": {
        "key": "css.usermodify",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getUserModify"
      },
      "css.appearance": {
        "key": "css.appearance",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getAppearance"
      },
      "css.float": {
        "key": "css.float",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getFloat"
      },
      "css.userselect": {
        "key": "css.userselect",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getUserSelect"
      },
      "css.userselect.none": {
        "key": "css.userselect.none",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getUserSelectNone"
      },
      "css.boxsizing": {
        "key": "css.boxsizing",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getBoxSizing"
      },
      "css.animation": {
        "key": "css.animation",
        "type": "Object or null",
        "className": "qx.bom.client.CssAnimation",
        "method": "getSupport"
      },
      "css.animation.requestframe": {
        "key": "css.animation.requestframe",
        "type": "String or null",
        "className": "qx.bom.client.CssAnimation",
        "method": "getRequestAnimationFrame"
      },
      "css.transform": {
        "key": "css.transform",
        "type": "Object or null",
        "className": "qx.bom.client.CssTransform",
        "method": "getSupport"
      },
      "css.transform.3d": {
        "key": "css.transform.3d",
        "type": "Boolean",
        "className": "qx.bom.client.CssTransform",
        "method": "get3D"
      },
      "css.transition": {
        "key": "css.transition",
        "type": "Object or null",
        "className": "qx.bom.client.CssTransition",
        "method": "getSupport"
      },
      "css.inlineblock": {
        "key": "css.inlineblock",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getInlineBlock"
      },
      "css.opacity": {
        "key": "css.opacity",
        "type": "Boolean",
        "className": "qx.bom.client.Css",
        "method": "getOpacity"
      },
      "css.textShadow": {
        "key": "css.textShadow",
        "type": "Boolean",
        "className": "qx.bom.client.Css",
        "method": "getTextShadow"
      },
      "css.textShadow.filter": {
        "key": "css.textShadow.filter",
        "type": "Boolean",
        "className": "qx.bom.client.Css",
        "method": "getFilterTextShadow"
      },
      "css.alphaimageloaderneeded": {
        "key": "css.alphaimageloaderneeded",
        "type": "Boolean",
        "className": "qx.bom.client.Css",
        "method": "getAlphaImageLoaderNeeded"
      },
      "css.pointerevents": {
        "key": "css.pointerevents",
        "type": "Boolean",
        "className": "qx.bom.client.Css",
        "method": "getPointerEvents"
      },
      "css.flexboxSyntax": {
        "key": "css.flexboxSyntax",
        "type": "String or null",
        "className": "qx.bom.client.Css",
        "method": "getFlexboxSyntax"
      },
      "device.name": {
        "key": "device.name",
        "type": "String",
        "className": "qx.bom.client.Device",
        "method": "getName"
      },
      "device.type": {
        "key": "device.type",
        "type": "String",
        "className": "qx.bom.client.Device",
        "method": "getType"
      },
      "device.pixelRatio": {
        "key": "device.pixelRatio",
        "type": "Number",
        "className": "qx.bom.client.Device",
        "method": "getDevicePixelRatio"
      },
      "device.touch": {
        "key": "device.touch",
        "type": "String",
        "className": "qx.bom.client.Device",
        "method": "getTouch"
      },
      "ecmascript.error.stacktrace": {
        "key": "ecmascript.error.stacktrace",
        "type": "String or null",
        "className": "qx.bom.client.EcmaScript",
        "method": "getStackTrace"
      },
      "ecmascript.mutationobserver": {
        "key": "ecmascript.mutationobserver",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getMutationObserver"
      },
      "ecmascript.array.indexof": {
        "key": "ecmascript.array.indexof",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getArrayIndexOf"
      },
      "ecmascript.array.lastindexof": {
        "key": "ecmascript.array.lastindexof",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getArrayLastIndexOf"
      },
      "ecmascript.array.foreach": {
        "key": "ecmascript.array.foreach",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getArrayForEach"
      },
      "ecmascript.array.filter": {
        "key": "ecmascript.array.filter",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getArrayFilter"
      },
      "ecmascript.array.map": {
        "key": "ecmascript.array.map",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getArrayMap"
      },
      "ecmascript.array.some": {
        "key": "ecmascript.array.some",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getArraySome"
      },
      "ecmascript.array.find": {
        "key": "ecmascript.array.find",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getArrayFind"
      },
      "ecmascript.array.findIndex": {
        "key": "ecmascript.array.findIndex",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getArrayFindIndex"
      },
      "ecmascript.array.every": {
        "key": "ecmascript.array.every",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getArrayEvery"
      },
      "ecmascript.array.reduce": {
        "key": "ecmascript.array.reduce",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getArrayReduce"
      },
      "ecmascript.array.reduceright": {
        "key": "ecmascript.array.reduceright",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getArrayReduceRight"
      },
      "ecmascript.function.bind": {
        "key": "ecmascript.function.bind",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getFunctionBind"
      },
      "ecmascript.object.keys": {
        "key": "ecmascript.object.keys",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getObjectKeys"
      },
      "ecmascript.date.now": {
        "key": "ecmascript.date.now",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getDateNow"
      },
      "ecmascript.date.parse": {
        "key": "ecmascript.date.parse",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getDateParse"
      },
      "ecmascript.error.toString": {
        "key": "ecmascript.error.toString",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getErrorToString"
      },
      "ecmascript.string.trim": {
        "key": "ecmascript.string.trim",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getStringTrim"
      },
      "ecmascript.string.startsWith": {
        "key": "ecmascript.string.startsWith",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getStringStartsWith"
      },
      "ecmascript.string.endsWith": {
        "key": "ecmascript.string.endsWith",
        "type": "Boolean",
        "className": "qx.bom.client.EcmaScript",
        "method": "getStringEndsWith"
      },
      "engine.name": {
        "key": "engine.name",
        "type": "String",
        "className": "qx.bom.client.Engine",
        "method": "getName"
      },
      "engine.version": {
        "key": "engine.version",
        "type": "String",
        "className": "qx.bom.client.Engine",
        "method": "getVersion"
      },
      "event.mspointer": {
        "key": "event.mspointer",
        "type": "Boolean",
        "className": "qx.bom.client.Event",
        "method": "getMsPointer"
      },
      "event.touch": {
        "key": "event.touch",
        "type": "Boolean",
        "className": "qx.bom.client.Event",
        "method": "getTouch"
      },
      "event.help": {
        "key": "event.help",
        "type": "Boolean",
        "className": "qx.bom.client.Event",
        "method": "getHelp"
      },
      "event.hashchange": {
        "key": "event.hashchange",
        "type": "Boolean",
        "className": "qx.bom.client.Event",
        "method": "getHashChange"
      },
      "event.dispatchevent": {
        "key": "event.dispatchevent",
        "type": "Boolean",
        "className": "qx.bom.client.Event",
        "method": "getDispatchEvent"
      },
      "event.customevent": {
        "key": "event.customevent",
        "type": "Boolean",
        "className": "qx.bom.client.Event",
        "method": "getCustomEvent"
      },
      "event.mouseevent": {
        "key": "event.mouseevent",
        "type": "Boolean",
        "className": "qx.bom.client.Event",
        "method": "getMouseEvent"
      },
      "event.mousecreateevent": {
        "key": "event.mousecreateevent",
        "type": "String",
        "className": "qx.bom.client.Event",
        "method": "getMouseCreateEvent"
      },
      "event.mousewheel": {
        "key": "event.mousewheel",
        "type": "Map",
        "className": "qx.bom.client.Event",
        "method": "getMouseWheel"
      },
      "event.auxclick": {
        "key": "event.auxclick",
        "type": "Boolean",
        "className": "qx.bom.client.Event",
        "method": "getAuxclickEvent"
      },
      "html.audio": {
        "key": "html.audio",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getAudio"
      },
      "html.audio.mp3": {
        "key": "html.audio.mp3",
        "type": "String",
        "className": "qx.bom.client.Html",
        "method": "getAudioMp3"
      },
      "html.audio.ogg": {
        "key": "html.audio.ogg",
        "type": "String",
        "className": "qx.bom.client.Html",
        "method": "getAudioOgg"
      },
      "html.audio.wav": {
        "key": "html.audio.wav",
        "type": "String",
        "className": "qx.bom.client.Html",
        "method": "getAudioWav"
      },
      "html.audio.au": {
        "key": "html.audio.au",
        "type": "String",
        "className": "qx.bom.client.Html",
        "method": "getAudioAu"
      },
      "html.audio.aif": {
        "key": "html.audio.aif",
        "type": "String",
        "className": "qx.bom.client.Html",
        "method": "getAudioAif"
      },
      "html.canvas": {
        "key": "html.canvas",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getCanvas"
      },
      "html.classlist": {
        "key": "html.classlist",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getClassList"
      },
      "html.fullscreen": {
        "key": "html.fullscreen",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getFullScreen"
      },
      "html.geolocation": {
        "key": "html.geolocation",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getGeoLocation"
      },
      "html.storage.local": {
        "key": "html.storage.local",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getLocalStorage"
      },
      "html.storage.session": {
        "key": "html.storage.session",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getSessionStorage"
      },
      "html.storage.userdata": {
        "key": "html.storage.userdata",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getUserDataStorage"
      },
      "html.svg": {
        "key": "html.svg",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getSvg"
      },
      "html.video": {
        "key": "html.video",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getVideo"
      },
      "html.video.h264": {
        "key": "html.video.h264",
        "type": "String",
        "className": "qx.bom.client.Html",
        "method": "getVideoH264"
      },
      "html.video.ogg": {
        "key": "html.video.ogg",
        "type": "String",
        "className": "qx.bom.client.Html",
        "method": "getVideoOgg"
      },
      "html.video.webm": {
        "key": "html.video.webm",
        "type": "String",
        "className": "qx.bom.client.Html",
        "method": "getVideoWebm"
      },
      "html.vml": {
        "key": "html.vml",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getVml"
      },
      "html.webworker": {
        "key": "html.webworker",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getWebWorker"
      },
      "html.filereader": {
        "key": "html.filereader",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getFileReader"
      },
      "html.xpath": {
        "key": "html.xpath",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getXPath"
      },
      "html.xul": {
        "key": "html.xul",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getXul"
      },
      "html.console": {
        "key": "html.console",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getConsole"
      },
      "html.element.contains": {
        "key": "html.element.contains",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getContains"
      },
      "html.element.compareDocumentPosition": {
        "key": "html.element.compareDocumentPosition",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getCompareDocumentPosition"
      },
      "html.element.textContent": {
        "key": "html.element.textContent",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getTextContent"
      },
      "html.image.naturaldimensions": {
        "key": "html.image.naturaldimensions",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getNaturalDimensions"
      },
      "html.history.state": {
        "key": "html.history.state",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getHistoryState"
      },
      "html.selection": {
        "key": "html.selection",
        "type": "String",
        "className": "qx.bom.client.Html",
        "method": "getSelection"
      },
      "html.node.isequalnode": {
        "key": "html.node.isequalnode",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getIsEqualNode"
      },
      "xml.implementation": {
        "key": "xml.implementation",
        "type": "Boolean",
        "className": "qx.bom.client.Xml",
        "method": "getImplementation"
      },
      "xml.domparser": {
        "key": "xml.domparser",
        "type": "Boolean",
        "className": "qx.bom.client.Xml",
        "method": "getDomParser"
      },
      "xml.selectsinglenode": {
        "key": "xml.selectsinglenode",
        "type": "Boolean",
        "className": "qx.bom.client.Xml",
        "method": "getSelectSingleNode"
      },
      "xml.selectnodes": {
        "key": "xml.selectnodes",
        "type": "Boolean",
        "className": "qx.bom.client.Xml",
        "method": "getSelectNodes"
      },
      "xml.getelementsbytagnamens": {
        "key": "xml.getelementsbytagnamens",
        "type": "Boolean",
        "className": "qx.bom.client.Xml",
        "method": "getElementsByTagNameNS"
      },
      "xml.domproperties": {
        "key": "xml.domproperties",
        "type": "Boolean",
        "className": "qx.bom.client.Xml",
        "method": "getDomProperties"
      },
      "xml.attributens": {
        "key": "xml.attributens",
        "type": "Boolean",
        "className": "qx.bom.client.Xml",
        "method": "getAttributeNS"
      },
      "xml.createelementns": {
        "key": "xml.createelementns",
        "type": "Boolean",
        "className": "qx.bom.client.Xml",
        "method": "getCreateElementNS"
      },
      "xml.createnode": {
        "key": "xml.createnode",
        "type": "Boolean",
        "className": "qx.bom.client.Xml",
        "method": "getCreateNode"
      },
      "xml.getqualifieditem": {
        "key": "xml.getqualifieditem",
        "type": "Boolean",
        "className": "qx.bom.client.Xml",
        "method": "getQualifiedItem"
      },
      "html.stylesheet.createstylesheet": {
        "key": "html.stylesheet.createstylesheet",
        "type": "Boolean",
        "className": "qx.bom.client.Stylesheet",
        "method": "getCreateStyleSheet"
      },
      "html.stylesheet.insertrule": {
        "key": "html.stylesheet.insertrule",
        "type": "Boolean",
        "className": "qx.bom.client.Stylesheet",
        "method": "getInsertRule"
      },
      "html.stylesheet.deleterule": {
        "key": "html.stylesheet.deleterule",
        "type": "Boolean",
        "className": "qx.bom.client.Stylesheet",
        "method": "getDeleteRule"
      },
      "html.stylesheet.addimport": {
        "key": "html.stylesheet.addimport",
        "type": "Boolean",
        "className": "qx.bom.client.Stylesheet",
        "method": "getAddImport"
      },
      "html.stylesheet.removeimport": {
        "key": "html.stylesheet.removeimport",
        "type": "Boolean",
        "className": "qx.bom.client.Stylesheet",
        "method": "getRemoveImport"
      },
      "io.maxrequests": {
        "key": "io.maxrequests",
        "type": "Integer",
        "className": "qx.bom.client.Transport",
        "method": "getMaxConcurrentRequestCount"
      },
      "io.ssl": {
        "key": "io.ssl",
        "type": "Boolean",
        "className": "qx.bom.client.Transport",
        "method": "getSsl"
      },
      "io.xhr": {
        "key": "io.xhr",
        "type": "String",
        "className": "qx.bom.client.Transport",
        "method": "getXmlHttpRequest"
      },
      "locale": {
        "key": "locale",
        "type": "String",
        "className": "qx.bom.client.Locale",
        "method": "getLocale"
      },
      "locale.variant": {
        "key": "locale.variant",
        "type": "String",
        "className": "qx.bom.client.Locale",
        "method": "getVariant"
      },
      "locale.default": {
        "key": "locale.default",
        "type": "String",
        "className": "qx.bom.client.Locale",
        "method": null
      },
      "os.name": {
        "key": "os.name",
        "type": "String",
        "className": "qx.bom.client.OperatingSystem",
        "method": "getName"
      },
      "os.version": {
        "key": "os.version",
        "type": "String",
        "className": "qx.bom.client.OperatingSystem",
        "method": "getVersion"
      },
      "os.scrollBarOverlayed": {
        "key": "os.scrollBarOverlayed",
        "type": "Boolean",
        "className": "qx.bom.client.Scroll",
        "method": "scrollBarOverlayed"
      },
      "phonegap": {
        "key": "phonegap",
        "type": "Boolean",
        "className": "qx.bom.client.PhoneGap",
        "method": "getPhoneGap"
      },
      "phonegap.notification": {
        "key": "phonegap.notification",
        "type": "Boolean",
        "className": "qx.bom.client.PhoneGap",
        "method": "getNotification"
      },
      "plugin.divx": {
        "key": "plugin.divx",
        "type": "Boolean",
        "className": "qx.bom.client.Plugin",
        "method": "getDivX"
      },
      "plugin.divx.version": {
        "key": "plugin.divx.version",
        "type": "String",
        "className": "qx.bom.client.Plugin",
        "method": "getDivXVersion"
      },
      "plugin.flash": {
        "key": "plugin.flash",
        "type": "Boolean",
        "className": "qx.bom.client.Flash",
        "method": "isAvailable"
      },
      "plugin.flash.express": {
        "key": "plugin.flash.express",
        "type": "Boolean",
        "className": "qx.bom.client.Flash",
        "method": "getExpressInstall"
      },
      "plugin.flash.strictsecurity": {
        "key": "plugin.flash.strictsecurity",
        "type": "Boolean",
        "className": "qx.bom.client.Flash",
        "method": "getStrictSecurityModel"
      },
      "plugin.flash.version": {
        "key": "plugin.flash.version",
        "type": "String",
        "className": "qx.bom.client.Flash",
        "method": "getVersion"
      },
      "plugin.gears": {
        "key": "plugin.gears",
        "type": "Boolean",
        "className": "qx.bom.client.Plugin",
        "method": "getGears"
      },
      "plugin.activex": {
        "key": "plugin.activex",
        "type": "Boolean",
        "className": "qx.bom.client.Plugin",
        "method": "getActiveX"
      },
      "plugin.skype": {
        "key": "plugin.skype",
        "type": "Boolean",
        "className": "qx.bom.client.Plugin",
        "method": "getSkype"
      },
      "plugin.pdf": {
        "key": "plugin.pdf",
        "type": "Boolean",
        "className": "qx.bom.client.Plugin",
        "method": "getPdf"
      },
      "plugin.pdf.version": {
        "key": "plugin.pdf.version",
        "type": "String",
        "className": "qx.bom.client.Plugin",
        "method": "getPdfVersion"
      },
      "plugin.quicktime": {
        "key": "plugin.quicktime",
        "type": "Boolean",
        "className": "qx.bom.client.Plugin",
        "method": "getQuicktime"
      },
      "plugin.quicktime.version": {
        "key": "plugin.quicktime.version",
        "type": "String",
        "className": "qx.bom.client.Plugin",
        "method": "getQuicktimeVersion"
      },
      "plugin.silverlight": {
        "key": "plugin.silverlight",
        "type": "Boolean",
        "className": "qx.bom.client.Plugin",
        "method": "getSilverlight"
      },
      "plugin.silverlight.version": {
        "key": "plugin.silverlight.version",
        "type": "String",
        "className": "qx.bom.client.Plugin",
        "method": "getSilverlightVersion"
      },
      "plugin.windowsmedia": {
        "key": "plugin.windowsmedia",
        "type": "Boolean",
        "className": "qx.bom.client.Plugin",
        "method": "getWindowsMedia"
      },
      "plugin.windowsmedia.version": {
        "key": "plugin.windowsmedia.version",
        "type": "String",
        "className": "qx.bom.client.Plugin",
        "method": "getWindowsMediaVersion"
      },
      "qx.allowUrlSettings": {
        "key": "qx.allowUrlSettings",
        "type": "Boolean",
        "default": "false"
      },
      "qx.allowUrlVariants": {
        "key": "qx.allowUrlVariants",
        "type": "Boolean",
        "default": "false"
      },
      "qx.application": {
        "key": "qx.application",
        "type": "String"
      },
      "qx.aspects": {
        "key": "qx.aspects",
        "type": "Boolean",
        "default": "false"
      },
      "qx.debug": {
        "key": "qx.debug",
        "type": "Boolean",
        "default": "true"
      },
      "qx.debug.databinding": {
        "key": "qx.debug.databinding",
        "type": "Boolean",
        "default": "false"
      },
      "qx.debug.dispose": {
        "key": "qx.debug.dispose",
        "type": "Boolean",
        "default": "false"
      },
      "qx.debug.dispose.level": {
        "key": "qx.debug.dispose.level",
        "type": "Integer",
        "default": "0"
      },
      "qx.debug.io": {
        "key": "qx.debug.io",
        "type": "Boolean",
        "default": "false"
      },
      "qx.debug.io.remote": {
        "key": "qx.debug.io.remote",
        "type": "Boolean",
        "default": "false"
      },
      "qx.debug.io.remote.data": {
        "key": "qx.debug.io.remote.data",
        "type": "Boolean",
        "default": "false"
      },
      "qx.debug.property.level": {
        "key": "qx.debug.property.level",
        "type": "Integer",
        "default": "0"
      },
      "qx.debug.ui.queue": {
        "key": "qx.debug.ui.queue",
        "type": "Boolean",
        "default": "true"
      },
      "qx.dynlocale": {
        "key": "qx.dynlocale",
        "type": "Boolean",
        "default": "true"
      },
      "qx.dyntheme": {
        "key": "qx.dyntheme",
        "type": "Boolean",
        "default": "true"
      },
      "qx.globalErrorHandling": {
        "key": "qx.globalErrorHandling",
        "type": "Boolean",
        "className": "qx.event.GlobalError",
        "method": null,
        "default": "true {@link qx.event.GlobalError}"
      },
      "qx.mobile.nativescroll": {
        "key": "qx.mobile.nativescroll",
        "type": "Boolean",
        "className": "qx.bom.client.Scroll",
        "method": "getNativeScroll"
      },
      "qx.promise.warnings": {
        "key": "qx.promise.warnings",
        "type": "Boolean",
        "className": "qx.Promise",
        "method": null
      },
      "qx.promise.longStackTraces": {
        "key": "qx.promise.longStackTraces",
        "type": "Boolean",
        "className": "qx.Promise",
        "method": null
      },
      "qx.optimization.basecalls": {
        "key": "qx.optimization.basecalls",
        "type": "Boolean"
      },
      "qx.optimization.comments": {
        "key": "qx.optimization.comments",
        "type": "Boolean"
      },
      "qx.optimization.privates": {
        "key": "qx.optimization.privates",
        "type": "Boolean"
      },
      "qx.optimization.strings": {
        "key": "qx.optimization.strings",
        "type": "Boolean"
      },
      "qx.optimization.variables": {
        "key": "qx.optimization.variables",
        "type": "Boolean"
      },
      "qx.optimization.variants": {
        "key": "qx.optimization.variants",
        "type": "Boolean"
      },
      "qx.revision": {
        "key": "qx.revision",
        "type": "String"
      },
      "qx.theme": {
        "key": "qx.theme",
        "type": "String"
      },
      "qx.version": {
        "key": "qx.version",
        "type": "String"
      },
      "qx.blankpage": {
        "key": "qx.blankpage",
        "type": "String"
      },
      "module.databinding": {
        "key": "module.databinding",
        "type": "Boolean",
        "default": "true"
      },
      "module.logger": {
        "key": "module.logger",
        "type": "Boolean",
        "default": "true"
      },
      "module.property": {
        "key": "module.property",
        "type": "Boolean",
        "default": "true"
      },
      "module.events": {
        "key": "module.events",
        "type": "Boolean",
        "default": "true"
      },
      "html.dataurl": {
        "key": "html.dataurl",
        "type": "Boolean",
        "className": "qx.bom.client.Html",
        "method": "getDataUrl"
      },
      "plugin.pdfjs": {
        "key": "plugin.pdfjs",
        "type": "Boolean",
        "className": "qx.bom.client.Pdfjs",
        "method": "getPdfjs"
      }
    }
  }

});

module.exports = qxcompiler.ClassFile;
