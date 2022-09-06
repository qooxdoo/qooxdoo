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
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * *********************************************************************** */

/* eslint-disable padded-blocks */

var fs = require("fs");
var babelCore = require("@babel/core");

var types = require("@babel/types");
var babylon = require("@babel/parser");
var async = require("async");
var pathModule = require("upath");

var log = qx.tool.utils.LogManager.createLog("analyser");

/**
 * Helper method that collapses the MemberExpression into a string
 * @param node
 * @returns {string}
 */
function collapseMemberExpression(node) {
  var done = false;
  function doCollapse(node) {
    if (node.type == "ThisExpression") {
      return "this";
    }
    if (node.type == "Super") {
      return "super";
    }
    if (node.type == "Identifier") {
      return node.name;
    }
    if (node.type == "ArrayExpression") {
      var result = [];
      node.elements.forEach(element => result.push(doCollapse(element)));
      return result;
    }
    if (node.type != "MemberExpression") {
      return "(" + node.type + ")";
    }
    if (types.isIdentifier(node.object)) {
      let str = node.object.name;
      if (node.property.name) {
        str += "." + node.property.name;
      } else {
        done = true;
      }
      return str;
    }
    var str;
    if (node.object.type == "ArrayExpression") {
      str = "[]";
    } else {
      str = doCollapse(node.object);
    }
    if (done) {
      return str;
    }
    // `computed` is set if the expression is a subscript, eg `abc[def]`
    if (node.computed) {
      done = true;
    } else if (node.property.name) {
      str += "." + node.property.name;
    } else {
      done = true;
    }
    return str;
  }

  return doCollapse(node);
}

function isCollapsibleLiteral(node) {
  let nodeType = node.type;
  return (
    nodeType === "Literal" ||
    nodeType === "StringLiteral" ||
    nodeType === "NumericLiteral" ||
    nodeType === "BooleanLiteral" ||
    nodeType === "BigIntLiteral"
  );
}

/**
 * Helper method that expands a dotted string into MemberExpression
 * @param str
 * @returns {*}
 */
function expandMemberExpression(str) {
  var segs = str.split(".");
  var expr = types.memberExpression(
    types.identifier(segs[0]),
    types.identifier(segs[1])
  );

  for (var i = 2; i < segs.length; i++) {
    expr = types.memberExpression(expr, types.identifier(segs[i]));
  }
  return expr;
}

function literalValueToExpression(value) {
  if (value === null || value === undefined) {
    return types.nullLiteral();
  }
  if (typeof value == "boolean") {
    return types.booleanLiteral(value);
  }
  if (typeof value == "number") {
    return types.numericLiteral(value);
  }
  if (typeof value == "string") {
    return types.stringLiteral(value);
  }
  if (qx.lang.Type.isRegExp(value)) {
    return types.regExpLiteral(value.toString());
  }
  if (qx.lang.Type.isDate(value)) {
    return types.stringLiteral(value.toString());
  }

  if (qx.lang.Type.isArray(value)) {
    var arr = [];
    value.forEach(function (item) {
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

function formatValueAsCode(value) {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "object" && value instanceof Date) {
    return "new Date(" + value.getTime() + ")";
  }
  return value.toString();
}

/**
 * A class file is parsed and anaysed into an instance of ClassFile; it is
 * connected to the Analyser that found the class so that dependencies can be
 * identified.
 */
qx.Class.define("qx.tool.compiler.ClassFile", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param analyser {Analyser} the Analyser that found the file
   * @param className {String} the full name of the class
   * @param library {Library} the Library the class belongs to (note that the class name is
   *  not always enough to identify the library, eg private source files such as qxWeb.js)
   */
  construct(analyser, className, library) {
    super();

    this.__analyser = analyser;
    this.__className = className;
    this.__metaStack = [];
    this.__metaDefinitions = {};
    this.__library = library;
    this.__sourceFilename = analyser.getClassSourcePath(library, className);

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

    this.__externals = [];
    this.__commonjsModules = {};

    this.__taskQueueDrains = [];
    this.__taskQueue = async.queue(function (task, cb) {
      task(cb);
    });
    this.__taskQueue.drain = this._onTaskQueueDrain;
    this.__taskQueue.error = err => {
      qx.tool.compiler.Console.error(err.stack || err);
    };

    analyser.getIgnores().forEach(s => this.addIgnore(s));
    this.__globalSymbols = {};
    this.__privates = {};
    this.__blockedPrivates = {};
    this.__privateMangling = analyser.getManglePrivates();

    const CF = qx.tool.compiler.ClassFile;
    const addSymbols = arr =>
      arr.forEach(s => (this.__globalSymbols[s] = true));
    if (analyser.getGlobalSymbols().length) {
      addSymbols(analyser.getGlobalSymbols());
    } else {
      addSymbols(CF.QX_GLOBALS);
      addSymbols(CF.COMMON_GLOBALS);
      addSymbols(CF.BROWSER_GLOBALS);
    }
  },

  members: {
    __analyser: null,
    __className: null,
    __numClassesDefined: 0,
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
    __markers: null,
    __haveMarkersFor: null,
    __classMeta: null,
    __metaStack: null,
    __metaDefinitions: null,
    __fatalCompileError: false,
    __translations: null,
    __dbClassInfo: null,
    __hasDefer: null,
    __definingType: null,
    __sourceFilename: null,
    __taskQueueDrain: null,
    __globalSymbols: null,
    __privates: null,
    __blockedPrivates: null,
    __externals: null,
    __commonjsModules: null,

    _onTaskQueueDrain() {
      var cbs = this.__taskQueueDrain;
      this.__taskQueueDrain = [];
      cbs.forEach(function (cb) {
        cb();
      });
    },

    _waitForTaskQueueDrain(cb) {
      if (this.__taskQueue.length() == 0) {
        cb();
      } else {
        this.__taskQueueDrains.push(cb);
      }
    },

    _queueTask(cb) {
      this.__taskQueue.push(cb);
    },

    /**
     * Returns the absolute path to the class file
     * @returns {string}
     */
    getSourcePath() {
      return this.__sourceFilename;
    },

    /**
     * Returns the path to the rewritten class file
     * @returns {string}
     */
    getOutputPath() {
      return this.__analyser.getClassOutputPath(this.__className);
    },

    /**
     * Loads the source, transpiles and analyses the code, storing the result in outputPath
     *
     * @param callback
     *          {Function} callback for when the load is completed
     */
    load(callback) {
      var t = this;
      var className = this.__className;
      t.__fatalCompileError = false;
      t.__numClassesDefined = 0;

      fs.readFile(
        this.getSourcePath(),
        { encoding: "utf-8" },
        function (err, src) {
          if (err) {
            callback(err);
            return;
          }
          var result;
          try {
            let babelConfig = t.__analyser.getBabelConfig() || {};
            let options = qx.lang.Object.clone(babelConfig.options || {}, true);
            options.modules = false;
            let extraPreset = [
              {
                plugins: []
              }
            ];

            if (babelConfig.plugins) {
              for (let key in babelConfig.plugins) {
                if (babelConfig.plugins[key] === true) {
                  extraPreset[0].plugins.push(require.resolve(key));
                } else if (babelConfig.plugins[key]) {
                  extraPreset[0].plugins.push([
                    require.resolve(key),
                    babelConfig.plugins[key]
                  ]);
                }
              }
            }
            let myPlugins = t._babelClassPlugins();
            var config = {
              babelrc: false,
              sourceFileName: t.getSourcePath(),
              filename: t.getSourcePath(),
              sourceMaps: true,
              presets: [
                [
                  {
                    plugins: [myPlugins.CodeElimination]
                  }
                ],

                [
                  {
                    plugins: [myPlugins.Compiler]
                  }
                ],

                [require.resolve("@babel/preset-env"), options],
                [require.resolve("@babel/preset-typescript")],
                [
                  require.resolve("@babel/preset-react"),
                  qx.tool.compiler.ClassFile.JSX_OPTIONS
                ]
              ],

              generatorOpts: {
                compact: false
              },

              parserOpts: {
                allowSuperOutsideMethod: true,
                sourceType: "script"
              },

              passPerPreset: true
            };

            if (extraPreset[0].plugins.length) {
              config.presets.push(extraPreset);
            }
            if (this.__privateMangling == "unreadable") {
              config.blacklist = ["spec.functionName"];
            }
            result = babelCore.transform(src, config);
          } catch (ex) {
            qx.tool.compiler.Console.log(ex);
            t.addMarker("compiler.syntaxError", ex.loc, ex.message);
            t.__fatalCompileError = true;
            t._compileDbClassInfo();
            callback();
            return;
          }

          if (!t.__numClassesDefined) {
            t.addMarker("compiler.missingClassDef");
            t.__fatalCompileError = true;
            t._compileDbClassInfo();
            callback();
            return;
          }

          if (!t.__metaDefinitions[className]) {
            t.addMarker(
              "compiler.wrongClassName",
              null,
              className,
              Object.keys(t.__metaDefinitions).join(", ")
            );

            t._compileDbClassInfo();
          }

          var pos = className.lastIndexOf(".");
          var name = pos > -1 ? className.substring(pos + 1) : className;
          var outputPath = t.getOutputPath();
          qx.tool.utils.Utils.mkParentPath(outputPath, function (err) {
            if (err) {
              callback(err);
              return;
            }
            let mappingUrl = name + ".js.map";
            if (
              qx.lang.Array.contains(
                t.__analyser.getApplicationTypes(),
                "browser"
              )
            ) {
              mappingUrl += "?dt=" + new Date().getTime();
            }
            fs.writeFile(
              outputPath,
              result.code + "\n\n//# sourceMappingURL=" + mappingUrl,
              { encoding: "utf-8" },
              function (err) {
                if (err) {
                  callback(err);
                  return;
                }
                fs.writeFile(
                  outputPath + ".map",
                  JSON.stringify(result.map, null, 2),
                  { encoding: "utf-8" },
                  function (err) {
                    if (err) {
                      callback(err);
                      return;
                    }
                    t._waitForTaskQueueDrain(function () {
                      callback();
                    });
                  }
                );
              }
            );
          });
        }
      );
    },

    /**
     * Writes the data for the database; updates the record, which may have been previously
     * used (so needs to be zero'd out)
     * @param dbClassInfo {Map}
     */
    writeDbInfo(dbClassInfo) {
      delete dbClassInfo.unresolved;
      delete dbClassInfo.dependsOn;
      delete dbClassInfo.assets;
      delete dbClassInfo.translations;
      delete dbClassInfo.markers;
      delete dbClassInfo.fatalCompileError;
      delete dbClassInfo.commonjsModules;
      for (var key in this.__dbClassInfo) {
        dbClassInfo[key] = this.__dbClassInfo[key];
      }
    },

    /**
     * Compiles the DbInfo POJO to be stored in the database about this class
     * */
    _compileDbClassInfo() {
      var t = this;
      var dbClassInfo = (this.__dbClassInfo = {});

      // Collect the dependencies on other classes
      var deps = this.getRequiredClasses();
      if (t.__usesJsx) {
        let JSX = qx.tool.compiler.ClassFile.JSX_OPTIONS;
        let classname = JSX.pragma;
        let pos = classname.lastIndexOf(".");
        classname = classname.substring(0, pos);
        if (!deps[classname]) {
          deps[classname] = {};
        }
      }
      for (var name in deps) {
        var dep = deps[name];
        if (!dep.ignore) {
          if (!dbClassInfo.dependsOn) {
            dbClassInfo.dependsOn = {};
          }
          dbClassInfo.dependsOn[name] = dep;
        }
      }

      function fixAnnos(section) {
        if (!section) {
          return;
        }
        Object.keys(section).forEach(name => {
          if (name[0] == "@") {
            var value = section[name];
            delete section[name];
            name = name.substring(1);
            var meta = section[name];
            if (meta) {
              if (!meta.annotations) {
                meta.annotations = [];
              }
              meta.annotations.push(value);
            }
          }
        });
      }

      var meta = this.getOuterClassMeta();
      if (meta) {
        fixAnnos(meta.events);
        fixAnnos(meta.members);
        fixAnnos(meta.statics);

        if (meta.properties && meta.members) {
          Object.keys(meta.properties).forEach(name => {
            let pm = meta.properties[name];
            if (pm.apply) {
              let fm = meta.members[pm.apply];
              if (fm) {
                if (!fm.applyFor) {
                  fm.applyFor = [];
                }
                fm.applyFor.push(name);
              }
            }
          });
        }

        // Class heirararchy
        dbClassInfo.extends = meta.superClass;
        dbClassInfo.include = meta.mixins.slice(0);
        dbClassInfo.implement = meta.interfaces.slice(0);
      }

      // Environment Checks
      if (
        Object.keys(this.__environmentChecks.provided).length ||
        Object.keys(this.__environmentChecks.required).length
      ) {
        dbClassInfo.environment = { provided: [], required: {} };
        for (let key in this.__environmentChecks.provided) {
          dbClassInfo.environment.provided.push(key);
        }
        for (let key in this.__environmentChecks.required) {
          dbClassInfo.environment.required[key] =
            this.__environmentChecks.required[key];
        }
      }

      // Save whether the class has a defer method
      dbClassInfo.hasDefer = this.hasDefer();

      // Unresolved symbols
      dbClassInfo.unresolved = [];
      for (let name in this.__scope.unresolved) {
        let item = this.__scope.unresolved[name];
        // item is undefined if it has already been removed from the list
        if (item === undefined) {
          continue;
        }
        // One of multiple classes defined in this file
        if (this.__metaDefinitions[name]) {
          continue;
        }
        var info = t.__analyser.getSymbolType(name);
        if (info && info.className) {
          t._requireClass(info.className, {
            load: item.load,
            defer: item.defer
          });
        } else if (info && info.symbolType == "package") {
          t.deleteReference(name);
        } else {
          dbClassInfo.unresolved.push(item);
          for (var j = 0; j < item.locations.length; j++) {
            t.addMarker(
              "symbol.unresolved#" + name,
              item.locations[j].start,
              name
            );
          }
        }
      }
      if (!dbClassInfo.unresolved.length) {
        delete dbClassInfo.unresolved;
      }

      // Assets
      var assets = this.getAssets();
      if (assets.length) {
        dbClassInfo.assets = assets;
      }
      if (meta) {
        if (meta.aliases) {
          dbClassInfo.aliases = {};
          for (let name in meta.aliases.aliasMap) {
            dbClassInfo.aliases[name] = meta.aliases.aliasMap[name];
          }
        }
        if (meta.themeMeta) {
          dbClassInfo.themeMeta = {};
          for (let name in meta.themeMeta.themeMetaMap) {
            dbClassInfo.themeMeta[name] = meta.themeMeta.themeMetaMap[name];
          }
        }
      }
      if (this.__externals.length) {
        dbClassInfo.externals = this.__externals;
      }

      // Translation
      if (this.__translations.length) {
        dbClassInfo.translations = this.__translations.slice(0);
      }

      // Markers
      if (this.__markers.length) {
        dbClassInfo.markers = qx.lang.Array.clone(this.__markers);
      }

      // Errors
      if (this.__fatalCompileError) {
        dbClassInfo.fatalCompileError = true;
      }

      // CommonJS modules
      if (Object.keys(this.__commonjsModules).length > 0) {
        dbClassInfo.commonjsModules = {};
        for (let moduleName in this.__commonjsModules) {
          dbClassInfo.commonjsModules[moduleName] = [
            ...this.__commonjsModules[moduleName]
          ];
        }
      }

      return dbClassInfo;
    },

    /**
     * Returns the loaded meta data
     */
    getOuterClassMeta() {
      let src = this.__metaDefinitions[this.__className] || null;
      if (!src) {
        return src;
      }
      let dest = {};
      Object.keys(src)
        .filter(key => key[0] != "_")
        .forEach(key => (dest[key] = src[key]));
      return dest;
    },

    /**
     * Babel plugin
     */
    _babelClassPlugins() {
      var t = this;

      function getKeyName(key) {
        var keyName = key.type == "StringLiteral" ? key.value : key.name;
        return keyName;
      }

      function checkNodeJsDocDirectives(node) {
        var jsdoc = getJsDoc(node.leadingComments);
        if (jsdoc) {
          checkJsDocDirectives(jsdoc, node.loc);
        }
        return jsdoc;
      }

      function checkJsDocDirectives(jsdoc, loc) {
        if (!jsdoc) {
          return jsdoc;
        }
        if (jsdoc["@use"]) {
          jsdoc["@use"].forEach(function (elem) {
            t._requireClass(elem.body, {
              where: "use",
              load: false,
              location: loc
            });
          });
        }
        if (jsdoc["@require"]) {
          jsdoc["@require"].forEach(function (elem) {
            t._requireClass(elem.body, {
              where: "require",
              load: false,
              location: loc
            });
          });
        }
        if (jsdoc["@optional"]) {
          jsdoc["@optional"].forEach(function (elem) {
            t.addIgnore(elem.body);
          });
        }
        if (jsdoc["@ignore"]) {
          jsdoc["@ignore"].forEach(function (elem) {
            t.addIgnore(elem.body);
          });
        }
        if (jsdoc["@external"]) {
          jsdoc["@external"].forEach(function (elem) {
            t.addExternal(elem.body);
            t._requireAsset(elem.body);
          });
        }
        if (jsdoc["@asset"]) {
          jsdoc["@asset"].forEach(function (elem) {
            t._requireAsset(elem.body);
          });
        }
        return jsdoc;
      }

      function enterFunction(path, node, idNode) {
        node = node || path.node;
        idNode = idNode || node.id || null;

        let isClassMember =
          t.__classMeta &&
          t.__classMeta._topLevel &&
          t.__classMeta._topLevel.keyName == "members" &&
          path.parentPath.parentPath.parentPath == t.__classMeta._topLevel.path;
        if (idNode) {
          t.addDeclaration(idNode.name);
        }
        t.pushScope(idNode ? idNode.name : null, node, isClassMember);

        function addDecl(param) {
          if (param.type == "AssignmentPattern") {
            addDecl(param.left);
          } else if (param.type == "RestElement") {
            t.addDeclaration(param.argument.name);
          } else if (param.type == "Identifier") {
            t.addDeclaration(param.name);
          } else if (param.type == "ArrayPattern") {
            param.elements.forEach(elem => addDecl(elem));
          } else if (param.type == "ObjectPattern") {
            param.properties.forEach(prop => addDecl(prop.value));
          } else {
            t.addMarker("testForFunctionParameterType", node.loc, param.type);
          }
        }
        node.params.forEach(param => {
          addDecl(param);
        });
        checkNodeJsDocDirectives(node);
      }

      function exitFunction(path, node) {
        node = node || path.node;
        t.popScope(node);
      }

      var FUNCTION_DECL_OR_EXPR = {
        enter: path => enterFunction(path),
        exit: path => exitFunction(path)
      };

      function getJsDoc(comment) {
        if (!comment) {
          return null;
        }
        if (!qx.lang.Type.isArray(comment)) {
          comment = [comment];
        }
        var result = {};
        comment.forEach(comment => {
          var tmp = qx.tool.compiler.jsdoc.Parser.parseComment(comment.value);
          for (var key in tmp) {
            var value = tmp[key];
            if (!result[key]) {
              result[key] = value;
            } else {
              qx.lang.Array.append(result[key], value);
            }
          }
        });

        return result;
      }

      function makeMeta(sectionName, functionName, node) {
        var meta;
        if (functionName) {
          var section = t.__classMeta[sectionName];
          if (section === undefined) {
            section = t.__classMeta[sectionName] = {};
          }
          meta = section[functionName];
          if (meta === undefined) {
            meta = section[functionName] = {};
          }
        } else {
          meta = t.__classMeta[sectionName];
          if (meta === undefined) {
            meta = t.__classMeta[sectionName] = {};
          }
        }
        meta.location = node.loc;

        if (node.leadingComments) {
          let jsdoc = checkNodeJsDocDirectives(node);
          if (jsdoc) {
            meta.jsdoc = jsdoc;
          }
        }

        if (sectionName === "members" || sectionName === "statics") {
          if (
            node.type == "ObjectMethod" ||
            node.value.type === "FunctionExpression"
          ) {
            meta.type = "function";
          } else {
            meta.type = "variable";
          }
          if (functionName.startsWith("__")) {
            meta.access = "private";
          } else if (functionName.startsWith("_")) {
            meta.access = "protected";
          } else {
            meta.access = "public";
          }
        }
        return meta;
      }

      var es6ClassDeclarations = 0;
      var needsQxCoreEnvironment = false;

      var COLLECT_CLASS_NAMES_VISITOR = {
        MemberExpression(path) {
          var self = this;
          var str = collapseMemberExpression(path.node);
          t._requireClass(str, { location: path.node.loc });
          var info = t.__analyser.getSymbolType(str);
          if (info && info.symbolType == "class") {
            self.collectedClasses.push(str);
          }
        }
      };

      const CODE_ELIMINATION_VISITOR = {
        ClassBody: {
          enter(path) {
            es6ClassDeclarations++;
          },
          exit(path) {
            es6ClassDeclarations--;
          }
        },

        CallExpression(path) {
          const name = collapseMemberExpression(path.node.callee);

          if (
            (name === "qx.core.Environment.select" ||
              name === "qx.core.Environment.get") &&
            types.isLiteral(path.node.arguments[0])
          ) {
            const arg = path.node.arguments[0];
            const env = t.__analyser.getEnvironment();
            const envValue = env[arg.value];

            if (envValue !== undefined) {
              if (name === "qx.core.Environment.get") {
                path.skip();
                path.replaceWithSourceString(formatValueAsCode(envValue));
                return;
              } else if (name === "qx.core.Environment.select") {
                const subPath = path.get("arguments.1");
                let option = subPath.node.properties.find(
                  prop => prop.key.value === envValue.toString()
                );

                if (!option) {
                  // try to find default value
                  option = subPath.node.properties.find(
                    prop => prop.key.value === "default"
                  );
                }

                if (option) {
                  // path.skip();
                  path.replaceWith(option.value);
                  return;
                }
              }
            }
            needsQxCoreEnvironment = path.node.loc;
          }
        },

        IfStatement: {
          exit(path) {
            let node = path.node;

            // If it's a literal value, we can eliminate code because we can resolve it now.  This
            //  is really important for anything wrapped in `if (qx.core.Environment.get("qx.debug")) ...`
            //  because the `qx.core.Environment.get` is replaced with a literal value and we need to
            //  use this to remove the unwanted code.
            if (types.isLiteral(node.test)) {
              if (node.test.value) {
                path.replaceWith(node.consequent);
              } else if (node.alternate) {
                path.replaceWith(node.alternate);
              } else {
                path.remove();
              }
            }
          }
        },

        LogicalExpression: {
          exit(path) {
            let node = path.node;
            if (types.isLiteral(node.left) && types.isLiteral(node.right)) {
              let result =
                (node.operator == "&&" &&
                  node.left.value &&
                  node.right.value) ||
                (node.operator == "||" &&
                  (node.left.value || node.right.value));
              path.replaceWith(literalValueToExpression(result));
            }
          }
        },

        BinaryExpression: {
          exit(path) {
            let node = path.node;
            if (
              isCollapsibleLiteral(node.left) &&
              isCollapsibleLiteral(node.right)
            ) {
              if ("+-*/".indexOf(node.operator) > -1) {
                let result;
                switch (node.operator) {
                  case "+":
                    result = node.left.value + node.right.value;
                    break;
                  case "-":
                    result = node.left.value - node.right.value;
                    break;
                  case "/":
                    result = node.left.value / node.right.value;
                    break;
                  case "*":
                    result = node.left.value * node.right.value;
                    break;
                }

                path.skip();
                path.replaceWithSourceString(formatValueAsCode(result));
              } else {
                let result;
                switch (node.operator) {
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
                  path.replaceWith(types.booleanLiteral(Boolean(result)));
                }
              }
            }
          }
        },

        UnaryExpression: {
          exit(path) {
            if (
              path.node.operator === "!" &&
              types.isLiteral(path.node.argument)
            ) {
              path.replaceWith(types.booleanLiteral(!path.node.argument.value));
            }
          }
        }
      };

      function collectJson(node, isProperties, jsonPath) {
        var result;

        if (node.type == "ObjectExpression") {
          result = {};
          let nextJsonPath = jsonPath ? jsonPath + "." : "";
          node.properties.forEach(function (prop) {
            var key = prop.key.name;
            if (prop.type == "ObjectMethod") {
              result[key] = "[[ ObjectMethod Function ]]";
            } else {
              var value = collectJson(
                prop.value,
                isProperties,
                nextJsonPath + key
              );

              result[key] = value;
            }
          });
        } else if (
          node.type == "Literal" ||
          node.type == "StringLiteral" ||
          node.type == "BooleanLiteral" ||
          node.type == "NumericLiteral" ||
          node.type == "NullLiteral"
        ) {
          if (typeof node.value == "string") {
            let isIdentifier = false;
            if (
              isProperties &&
              (jsonPath === "apply" ||
                jsonPath === "transform" ||
                jsonPath === "isEqual")
            ) {
              isIdentifier = true;
            }
            node.value = t.encodePrivate(node.value, isIdentifier, node.loc);
          }
          result = node.value;
        } else if (node.type == "ArrayExpression") {
          result = [];
          node.elements.forEach(function (elem) {
            result.push(collectJson(elem, isProperties));
          });
        } else if (node.type == "Identifier") {
          node.name = t.encodePrivate(node.name, true, node.loc);
          result = node.name;
        } else if (
          node.type == "CallExpression" ||
          node.type == "FunctionExpression" ||
          node.type == "ArrowFunctionExpression"
        ) {
          result = new Function("[[ Function ]]");
        } else if (node.type == "MemberExpression") {
          result = collapseMemberExpression(node);
        } else if (node.type == "UnaryExpression") {
          if (node.operator == "-") {
            let tmp = collectJson(node.argument, isProperties);
            if (typeof tmp == "number") {
              return tmp * -1;
            }
          } else if (node.operator == "!") {
            let tmp = collectJson(node.argument, isProperties);
            if (typeof tmp == "boolean") {
              return !tmp;
            }
          }
          result = "[[ UnaryExpression ]]";
        } else if (
          node.type == "NewExpression" ||
          node.type == "BinaryExpression"
        ) {
          result = "[[ " + node.type + " ]]";
        } else {
          t.warn(
            "Cannot interpret AST " +
              node.type +
              " at " +
              t.__className +
              (node.loc
                ? " [" + node.loc.start.line + "," + node.loc.start.column + "]"
                : "")
          );

          result = null;
        }
        return result;
      }

      const ALLOWED_KEYS = {
        class: {
          static: {
            "@": "object",
            type: "string", // String
            statics: "object", // Map
            environment: "object", // Map
            defer: "function" // Function
          },
          normal: {
            "@": "object",
            "@construct": "object",
            "@destruct": "object",
            type: "string", // String
            extend: "function", // Function
            implement: "object", // Interface[]
            include: "object", // Mixin[]
            construct: "function", // Function
            statics: "object", // Map
            properties: "object", // Map
            members: "object", // Map
            environment: "object", // Map
            events: "object", // Map
            defer: "function", // Function
            destruct: "function" // Function
          }
        },

        interface: {
          extend: "object", // Interface | Interface[]
          statics: "object", // Map
          members: "object", // Map
          properties: "object", // Map
          events: "object" // Map
        },
        mixin: {
          include: "object", // Mixin | Mixin[]
          statics: "object", // Map
          members: "object", // Map
          properties: "object", // Map
          events: "object", // Map
          destruct: "function", // Function
          construct: "function" // Function
        },
        theme: {
          title: "string", // String
          aliases: "object", // Map
          type: "string", // String
          extend: "object", // Theme
          colors: "object", // Map
          borders: "object", // Map
          decorations: "object", // Map
          fonts: "object", // Map
          icons: "object", // Map
          widgets: "object", // Map
          appearances: "object", // Map
          meta: "object", // Map
          include: "object", // Array
          patch: "object", // Array
          boot: "function" // Function
        }
      };

      function isValidExtendClause(prop) {
        if (
          prop.value.type == "MemberExpression" ||
          prop.value.type == "Identifier" ||
          prop.value.type == "NullLiteral"
        ) {
          return true;
        }
        if (t.__classMeta.type === "class") {
          return false;
        }
        if (prop.value.type == "ArrayExpression") {
          return prop.value.elements.every(
            elem => elem.type == "MemberExpression" || elem.type == "Identifier"
          );
        }
        return false;
      }

      const FUNCTION_NAMES = {
        construct: "$$constructor",
        destruct: "$$destructor",
        defer: null
      };

      function checkValidTopLevel(path) {
        var prop = path.node;
        var keyName = getKeyName(prop.key);
        let allowedKeys = ALLOWED_KEYS[t.__classMeta.type];
        if (t.__classMeta.type === "class") {
          allowedKeys =
            allowedKeys[t.__classMeta.isStatic ? "static" : "normal"];
        }
        if (allowedKeys[keyName] === undefined) {
          t.addMarker(
            "compiler.invalidClassDefinitionEntry",
            prop.loc,
            t.__classMeta.type,
            keyName
          );
        }
      }
      function handleTopLevelMethods(path, keyName, functionNode) {
        if (keyName == "defer") {
          t.__hasDefer = true;
          t.__inDefer = true;
        }
        t.__classMeta.functionName = FUNCTION_NAMES[keyName] || keyName;
        if (FUNCTION_NAMES[keyName] !== undefined) {
          makeMeta(keyName, null, functionNode);
        }
        enterFunction(path, functionNode);
        path.traverse(VISITOR);
        exitFunction(path, functionNode);
        path.skip();
        t.__classMeta.functionName = null;
      }

      var CLASS_DEF_VISITOR = {
        ClassBody: {
          enter(path) {
            es6ClassDeclarations++;
          },
          exit(path) {
            es6ClassDeclarations--;
          }
        },

        ObjectMethod(path) {
          if (path.parentPath.parentPath != this.classDefPath) {
            path.skip();
            path.traverse(VISITOR);
            return;
          }
          var keyName = getKeyName(path.node.key);
          checkValidTopLevel(path);
          handleTopLevelMethods(path, keyName, path.node);
        },

        ObjectProperty(path) {
          if (path.parentPath.parentPath != this.classDefPath) {
            path.skip();
            path.traverse(VISITOR);
            return;
          }
          var prop = path.node;
          var keyName = getKeyName(prop.key);
          checkValidTopLevel(path);

          if (FUNCTION_NAMES[keyName] !== undefined) {
            let val = path.node.value;
            val.leadingComments = (path.node.leadingComments || []).concat(
              val.leadingComments || []
            );

            handleTopLevelMethods(path, keyName, val);
            return;
          }

          if (keyName == "extend") {
            if (!isValidExtendClause(prop)) {
              t.addMarker("compiler.invalidExtendClause", prop.value.loc);
              t.__fatalCompileError = true;
            } else {
              t.__classMeta.superClass = collapseMemberExpression(prop.value);
              t._requireClass(t.__classMeta.superClass, {
                location: path.node.loc
              });
            }
          } else if (keyName == "type") {
            var type = prop.value.value;
            t.__classMeta.isAbstract = type === "abstract";
            t.__classMeta.isStatic = type === "static";
            t.__classMeta.isSingleton = type === "singleton";
          } else if (keyName == "implement") {
            path.skip();
            path.traverse(COLLECT_CLASS_NAMES_VISITOR, {
              collectedClasses: t.__classMeta.interfaces
            });
          } else if (keyName == "include" || keyName == "patch") {
            path.skip();
            path.traverse(COLLECT_CLASS_NAMES_VISITOR, {
              collectedClasses: t.__classMeta.mixins
            });
          } else if (
            keyName == "members" ||
            keyName == "statics" ||
            keyName == "@"
          ) {
            t.__classMeta._topLevel = {
              path,
              keyName
            };

            path.skip();
            path.traverse(VISITOR);
            t.__classMeta._topLevel = null;
          } else if (keyName == "properties") {
            path.skip();
            if (!prop.value.properties) {
              t.addMarker("class.invalidProperties", prop.loc || null);
            } else {
              prop.value.properties.forEach(function (pdNode) {
                var propName = getKeyName(pdNode.key);
                var meta = makeMeta("properties", propName, pdNode);
                var data = collectJson(pdNode.value, true);
                meta.name = propName;
                meta.propertyType = "new";
                [
                  "refine",
                  "themeable",
                  "event",
                  "inheritable",
                  "apply",
                  "async",
                  "group",
                  "nullable",
                  "init",
                  "transform"
                ].forEach(name => (meta[name] = data[name]));
                if (data.nullable !== undefined) {
                  meta.allowNull = data.nullable;
                }
                if (data.check !== undefined) {
                  let checks;
                  if (qx.lang.Type.isArray(data.check)) {
                    checks = meta.possibleValues = data.check;
                  } else {
                    meta.check = data.check;
                    checks = [data.check];
                  }
                  checks.forEach(check => {
                    if (!qx.tool.compiler.ClassFile.SYSTEM_CHECKS[check]) {
                      let symbolData = t.__analyser.getSymbolType(check);
                      if (symbolData?.symbolType == "class") {
                        t._requireClass(check, {
                          load: false,
                          usage: "dynamic",
                          location: path.node.loc
                        });
                      }
                    }
                  });
                }
                if (data.init !== undefined) {
                  meta.defaultValue = data.init;
                }
              });
            }
            path.traverse(VISITOR);
          } else if (keyName == "events") {
            path.skip();
            if (prop.value.properties) {
              prop.value.properties.forEach(function (eventNode) {
                var eventName = getKeyName(eventNode.key);
                var meta = makeMeta("events", eventName, eventNode);
                meta.name = eventName;
                meta.type = collectJson(eventNode.value);
              });
            }
            path.traverse(VISITOR);
          } else if (keyName == "aliases") {
            path.skip();
            if (!prop.value.properties) {
              t.addMarker("class.invalidAliases", prop.loc || null);
            } else {
              var meta = makeMeta("aliases", null, prop);
              meta.aliasMap = {};
              prop.value.properties.forEach(function (aliasNode) {
                var aliasName = getKeyName(aliasNode.key);
                var aliasValue = getKeyName(aliasNode.value);
                meta.aliasMap[aliasName] = aliasValue;
              });
            }
          } else if (keyName == "meta") {
            path.skip();
            if (!prop.value.properties) {
              t.addMarker("class.invalidThemeMeta", prop.loc || null);
            } else {
              let meta = makeMeta("themeMeta", null, prop);
              meta.themeMetaMap = {};
              prop.value.properties.forEach(function (node) {
                var key = getKeyName(node.key);
                var value = collapseMemberExpression(node.value);
                meta.themeMetaMap[key] = value;
              });
            }
            path.traverse(VISITOR);
          }
        }
      };

      const TYPE = {
        "qx.Class.define": "class",
        "qx.Mixin.define": "mixin",
        "qx.Theme.define": "theme",
        "qx.Interface.define": "interface",
        "qx.Bootstrap.define": "class"
      };

      var VISITOR = {
        NewExpression: {
          enter(path) {
            var str = collapseMemberExpression(path.node.callee);
            t._requireClass(str, { usage: "dynamic", location: path.node.loc });
          },
          exit(path) {
            if (t.__analyser.isAddCreatedAt()) {
              var fn = types.memberExpression(
                types.identifier("qx"),
                types.identifier("$$createdAt")
              );

              var tmp = types.callExpression(fn, [
                path.node,
                types.stringLiteral(t.__className.replace(/\./g, "/") + ".js"),
                types.numericLiteral(
                  path.node.loc ? path.node.loc.start.line : 0
                ),

                types.numericLiteral(
                  path.node.loc ? path.node.loc.start.column : 0
                )
              ]);

              path.replaceWith(tmp);
              path.skip();
            }
          }
        },

        ExpressionStatement: {
          enter: path => {
            checkNodeJsDocDirectives(path.node);
          },
          exit: path => {
            checkNodeJsDocDirectives(path.node);
          }
        },

        EmptyStatement: path => {
          checkNodeJsDocDirectives(path.node);
        },

        JSXElement(path) {
          t.__usesJsx = true;
        },

        Program: {
          exit(path) {
            let dbClassInfo = t._compileDbClassInfo();
            let copyInfo = {};
            let hasLoadDeps = false;
            if (dbClassInfo.dependsOn) {
              copyInfo.dependsOn = {};
              Object.keys(dbClassInfo.dependsOn).forEach(key => {
                let tmp = (copyInfo.dependsOn[key] = Object.assign(
                  {},
                  dbClassInfo.dependsOn[key]
                ));

                if (tmp.load) {
                  delete tmp.load;
                  tmp.require = true;
                  hasLoadDeps = true;
                }
              });
            }
            if (dbClassInfo.environment) {
              copyInfo.environment = dbClassInfo.environment;
              let required = dbClassInfo.environment.required;
              if (required) {
                for (let key in required) {
                  if (required[key].load) {
                    hasLoadDeps = true;
                    break;
                  }
                }
              }
            }
            let tmp = types.variableDeclaration("var", [
              types.variableDeclarator(
                types.identifier("$$dbClassInfo"),
                literalValueToExpression(copyInfo)
              )
            ]);

            let inject = [tmp];
            if (hasLoadDeps) {
              tmp = babylon.parse(
                "qx.Bootstrap.executePendingDefers($$dbClassInfo);"
              ).program.body;
              inject.push(tmp[0]);
            }
            path.node.body.forEach(node => inject.push(node));
            tmp = babylon.parse(
              t.__className + ".$$dbClassInfo = $$dbClassInfo;"
            ).program.body;
            inject.push(tmp[0]);
            let block = types.blockStatement(inject);
            let rootFn = types.expressionStatement(
              types.callExpression(
                types.functionExpression(null, [], block),
                []
              )
            );

            path.node.body.splice(0, path.node.body.length, rootFn);
          }
        },

        // Babel seems to be suppressing ClassDeclarations...
        ClassBody: {
          enter(path) {
            es6ClassDeclarations++;
          },
          exit(path) {
            es6ClassDeclarations--;
          }
        },

        Literal(path) {
          if (typeof path.node.value == "string") {
            path.node.value = t.encodePrivate(path.node.value, false, path.loc);
          }
        },

        Identifier(path) {
          path.node.name = t.encodePrivate(path.node.name, true, path.loc);

          // These are AST node types which do not cause undefined references for the identifier,
          // eg ObjectProperty could be `{ abc: 1 }`, and `abc` is not undefined, it is an identifier
          const CHECK_FOR_UNDEFINED = {
            ObjectProperty: 1,
            ObjectMethod: 1,
            FunctionExpression: 1,
            FunctionStatement: 1,
            ArrowFunctionExpression: 1,
            VariableDeclarator: 1,
            FunctionDeclaration: 1,
            CatchClause: 1,
            AssignmentPattern: 1,
            RestElement: 1,
            ArrayPattern: 1,
            SpreadElement: 1,
            ClassDeclaration: 1,
            ClassMethod: 1,
            LabeledStatement: 1,
            BreakStatement: 1
          };

          // These are AST node types we expect to find at the root of the identifier, and which will
          //  not trigger a warning.  The idea is that all of the types in CHECK_FOR_UNDEFINED are types
          //  that cause references to variables, everything else is in DO_NOT_WARN_TYPES.  But, if anything
          //  has been missed and is not in either of these lists, throw a warning so that it can be checked
          const DO_NOT_WARN_TYPES = {
            AssignmentExpression: 1,
            BooleanExpression: 1,
            CallExpression: 1,
            BinaryExpression: 1,
            UnaryExpression: 1,
            WhileStatement: 1,
            IfStatement: 1,
            NewExpression: 1,
            ReturnStatement: 1,
            ConditionalExpression: 1,
            LogicalExpression: 1,
            ForInStatement: 1,
            ArrayExpression: 1,
            SwitchStatement: 1,
            SwitchCase: 1,
            ThrowStatement: 1,
            ExpressionStatement: 1,
            UpdateExpression: 1,
            SequenceExpression: 1,
            ContinueStatement: 1,
            ForStatement: 1,
            TemplateLiteral: 1,
            AwaitExpression: 1,
            DoWhileStatement: 1,
            ForOfStatement: 1,
            TaggedTemplateExpression: 1,
            ClassExpression: 1,
            OptionalCallExpression: 1,
            JSXExpressionContainer: 1
          };

          let root = path;
          while (root) {
            let parentType = root.parentPath.node.type;
            if (
              parentType == "MemberExpression" ||
              parentType == "OptionalMemberExpression"
            ) {
              root = root.parentPath;
              continue;
            }
            if (CHECK_FOR_UNDEFINED[parentType]) {
              return;
            }
            if (!DO_NOT_WARN_TYPES[parentType]) {
              t.addMarker("testForUnresolved", path.node.loc, parentType);
            }
            break;
          }

          let name = collapseMemberExpression(root.node);
          if (name.startsWith("(")) {
            return;
          }
          let members = name.split(".");
          t.addReference(members, root.node.loc);
        },

        CallExpression: {
          enter(path) {
            function getStringArg(index) {
              if (index >= path.node.arguments.length) {
                return null;
              }
              let arg = path.node.arguments[index];
              if (arg.type == "StringLiteral") {
                return arg.value;
              }
              return null;
            }

            function addTranslation(entry) {
              let lineNo = path.node.loc ? path.node.loc.start.line : 0;
              let cur = t.__translations[entry.msgid];
              if (cur) {
                if (!qx.lang.Type.isArray(cur.lineNo)) {
                  cur.lineNo = [cur.lineNo];
                }
                cur.lineNo.push(lineNo);
              } else {
                entry.lineNo = lineNo;
                t.__translations.push(entry);
              }
            }

            // Are we looking at the Identifier `require`, and is it a
            // function call (identified by having
            // `path.node.arguments`? If so, we'll add the discovered
            // module to the list of modules that must be browserified
            // if the application is destined for the browser.
            let scope;
            let applicationTypes = t.__analyser.getApplicationTypes();

            if (
              path.node.callee.type == "Identifier" &&
              path.node?.callee?.name == "require" &&
              path.node.arguments?.length == 1 &&
              applicationTypes.includes("browser")
            ) {
              // See if this is a reference to global `require` or
              // something in the scope chain
              for (scope = t.__scope; scope; scope = scope.parent) {
                if (scope.vars["require"]) {
                  // It's in the scope chain. Ignore it.
                  break;
                }
              }
              // Did we reach top level without finding it in a local scope?
              if (!scope) {
                // Yup. It's the global one we're looking for. Ensure the argument is valid.
                let arg = path.node.arguments[0];
                if (types.isLiteral(arg)) {
                  if (typeof arg.value != "string") {
                    t.addMarker(
                      "compiler.requireLiteralArguments",
                      path.node.loc,
                      arg.value
                    );
                  } else {
                    qx.tool.compiler.Console.log(
                      `${t.__className}:${path.node.loc.start.line}:` +
                        ` automatically detected \'require(${arg.value})\``
                    );

                    t.addCommonjsModule(
                      arg.value,
                      t.__className,
                      path.node.loc.start.line
                    );

                    // Don't show "unresolved" error for `require` since the
                    // browserified code defines it as a global
                    t.addIgnore("require");
                  }
                }
              }
            }

            if (
              types.isMemberExpression(path.node.callee) ||
              (es6ClassDeclarations == 0 &&
                (path.node.callee.object?.type == "Super" ||
                  path.node.callee.type == "Super"))
            ) {
              let name = collapseMemberExpression(path.node.callee);
              let thisAlias = null;

              // Try and translate aliases for "this"; this is a really simplistic implementation
              //  because static code path analysis is way out of scope for the compiler, so we're
              //  only trying to handle code like:
              //    ```
              //    var that = this, args = arguments;
              //    (function() { that.base(args); })();
              //    ```
              if (path.node.callee.object?.type == "Identifier") {
                let originalAlias = path.node.callee.object.name;
                let alias = originalAlias;
                let aliasIsThis = false;
                for (let scope = t.__scope; scope; scope = scope.parent) {
                  while (!aliasIsThis) {
                    let tmp = scope.vars[alias];
                    if (tmp === "this") {
                      aliasIsThis = true;
                      break;
                    }
                    if (typeof tmp == "string") {
                      alias = tmp;
                    } else {
                      break;
                    }
                  }
                  if (aliasIsThis || scope.isClassMember) {
                    break;
                  }
                }
                if (aliasIsThis) {
                  name = "this" + name.substring(originalAlias.length);
                  thisAlias = originalAlias;
                }
              }

              // Class definition?  EG `qx.Class.define(...`
              if (TYPE[name]) {
                t.__definingType = name.match(/\.([a-zA-Z]+)\./)[1];
                let node = path.node;
                let className = node.arguments[0].value;
                let classDef = node.arguments[1];

                // We can only parse objects (eg qx.data.marshal.Json.__toClass creates objects on the fly that we cannot scan)
                if (classDef.type != "ObjectExpression") {
                  return;
                }

                // Create new meta
                t.__pushMeta(className);
                if (needsQxCoreEnvironment) {
                  t._requireClass("qx.core.Environment", {
                    location: needsQxCoreEnvironment,
                    defer: true
                  });
                }

                let meta = makeMeta("clazz", null, path.parent);
                t.__classMeta.type = TYPE[name];
                if (
                  t.__definingType == "Class" ||
                  t.__definingType == "Bootstrap"
                ) {
                  let typeProp = classDef.properties.find(
                    prop =>
                      prop.key.type == "Identifier" && prop.key.value == "type"
                  );

                  if (typeProp) {
                    (t.__classMeta.isStatic == typeProp.value.type) ==
                      "Literal" && typeProp.value.value === "static";
                  }
                }
                checkJsDocDirectives(meta.jsdoc, path.node.loc);

                t._requireClass(name, {
                  usage: "dynamic",
                  location: path.node.loc
                });

                path.skip();
                path.traverse(CLASS_DEF_VISITOR, { classDefPath: path });
                t.__popMeta(className);
              } else if (name == "qx.core.Environment.add") {
                let arg = path.node.arguments[0];
                if (types.isLiteral(arg)) {
                  if (typeof arg.value != "string") {
                    log.error(
                      "Invalid argument to qx.core.Environment.add: " +
                        arg.value
                    );
                  } else {
                    t.__environmentChecks.provided[arg.value] = true;
                    if (
                      !arg.value.startsWith(t.__className) &&
                      !Object.prototype.hasOwnProperty.call(
                        qx.tool.compiler.ClassFile.ENVIRONMENT_CONSTANTS,
                        arg.value
                      )
                    ) {
                      let symbol = t.__library.getSymbolType(arg.value);
                      if (!symbol || symbol.symbolType != "environment") {
                        t.addMarker(
                          "environment.unreachable",
                          path.node.loc,
                          arg.value
                        );
                      }
                    }
                  }
                }
                t._requireClass("qx.core.Environment", {
                  usage: "dynamic",
                  location: path.node.loc
                });
              } else if (name == "qx.core.Environment.get") {
                let arg = path.node.arguments[0];
                if (types.isLiteral(arg)) {
                  if (typeof arg.value != "string") {
                    log.error(
                      "Invalid argument to qx.core.Environment.get: " +
                        arg.value
                    );
                  } else {
                    t.addEnvCheck(arg.value, path.node.loc);
                  }
                }
                t._requireClass("qx.core.Environment", {
                  usage: "dynamic",
                  location: path.node.loc
                });

                path.skip();
                path.traverse(VISITOR);
              } else if (name == "qx.core.Environment.select") {
                let arg = path.node.arguments[0];
                if (types.isLiteral(arg)) {
                  if (typeof arg.value != "string") {
                    log.error(
                      "Invalid argument to qx.core.Environment.select: " +
                        arg.value
                    );
                  } else {
                    t.addEnvCheck(arg.value, path.node.loc);
                  }
                }

                t._requireClass("qx.core.Environment", {
                  usage: "dynamic",
                  location: path.node.loc
                });

                path.skip();
                path.traverse(VISITOR);
              } else if (
                name == "this.base" ||
                (es6ClassDeclarations == 0 &&
                  (name == "super" || name.startsWith("super.")))
              ) {
                let expr;

                // For mixins, there is never a valid time to call this.base() in the constructor; but it is
                //  OK in methods - but we have to refer to superclass.methodName directly.  For ordinary
                //  classes, we need to use constructor.methodName.base.
                if (t.__definingType == "Mixin") {
                  expr = types.callExpression(
                    expandMemberExpression("qx.Mixin.baseClassMethod"),
                    [
                      expandMemberExpression("this.constructor"),
                      types.identifier(t.__classMeta.className),
                      types.stringLiteral(t.__classMeta.functionName)
                    ]
                  );

                  expr = types.memberExpression(expr, types.identifier("call"));
                } else if (t.__classMeta.functionName == "$$constructor") {
                  expr = expandMemberExpression(
                    t.__classMeta.superClass + ".constructor.call"
                  );
                } else if (t.__classMeta.className) {
                  expr = expandMemberExpression(
                    t.__classMeta.className +
                      ".superclass" +
                      ".prototype." +
                      t.__classMeta.functionName +
                      ".call"
                  );
                } else {
                  expr = expandMemberExpression(
                    t.__classMeta.superClass +
                      ".prototype." +
                      t.__classMeta.functionName +
                      ".call"
                  );
                }
                let thisArgument = thisAlias
                  ? types.identifier(thisAlias)
                  : types.thisExpression();
                if (name.startsWith("super")) {
                  path.node.arguments.unshift(thisArgument);
                } else {
                  path.node.arguments[0] = thisArgument;
                }
                let callExpr = types.callExpression(expr, path.node.arguments);
                path.replaceWith(callExpr);
              } else if (
                name == "this.base.apply" ||
                name == "this.base.call"
              ) {
                let methodName = name == "this.base.apply" ? "apply" : "call";

                let expr;
                if (t.__definingType == "Mixin") {
                  expr = expandMemberExpression(
                    "this.constructor.superclass.prototype." +
                      t.__classMeta.functionName +
                      ".call"
                  );
                } else if (t.__classMeta.functionName == "$$constructor") {
                  expr = expandMemberExpression(
                    t.__classMeta.superClass + ".constructor." + methodName
                  );
                } else {
                  expr = expandMemberExpression(
                    t.__className +
                      ".prototype." +
                      t.__classMeta.functionName +
                      ".base." +
                      methodName
                  );
                }

                // Original call to this.base.apply would have included arguments in the first element of the array
                //  here we remove that because it's not needed, specifically changing
                //    `this.base.apply(this, args)` to
                //    `this.base.apply(this, args.slice().shift())`
                let exprSplice = types.callExpression(
                  types.memberExpression(
                    path.node.arguments[1],
                    types.identifier("slice")
                  ),

                  []
                );

                let exprUnshift = types.callExpression(
                  types.memberExpression(exprSplice, types.identifier("shift")),
                  []
                );

                let callExpr = types.callExpression(expr, [
                  path.node.arguments[0],
                  exprUnshift
                ]);

                path.replaceWith(callExpr);
              } else if (name == "this.self") {
                let expr = expandMemberExpression(t.__classMeta.className);
                path.replaceWith(expr);
              } else if (
                name == "this.tr" ||
                name == "this.marktr" ||
                name == "qx.locale.Manager.tr" ||
                name == "qx.locale.Manager.marktr"
              ) {
                let arg0 = getStringArg(0);
                if (!arg0) {
                  t.addMarker(
                    "translate.invalidMessageId",
                    path.node.loc,
                    arg0
                  );
                } else {
                  addTranslation({ msgid: arg0 });
                }
              } else if (
                name == "this.trn" ||
                name == "qx.locale.Manager.trn"
              ) {
                let arg0 = getStringArg(0);
                let arg1 = getStringArg(1);
                if (!arg0 || !arg1) {
                  t.addMarker(
                    "translate.invalidMessageIds",
                    path.node.loc,
                    arg0,
                    arg1
                  );
                } else {
                  addTranslation({ msgid: arg0, msgid_plural: arg1 });
                }
              } else if (
                name == "this.trc" ||
                name == "qx.locale.Manager.trc"
              ) {
                let arg0 = getStringArg(0);
                let arg1 = getStringArg(1);
                if (!arg0 || !arg1) {
                  t.addMarker(
                    "translate.invalidMessageIds",
                    path.node.loc,
                    arg0,
                    arg1
                  );
                } else {
                  addTranslation({ msgid: arg1, comment: arg0 });
                }
              } else if (
                name == "this.trnc" ||
                name == "qx.locale.Manager.trnc"
              ) {
                let arg0 = getStringArg(0);
                let arg1 = getStringArg(1);
                let arg2 = getStringArg(2);
                if (!arg0 || !arg1 || !arg2) {
                  t.addMarker(
                    "translate.invalidMessageIds3",
                    path.node.loc,
                    arg0,
                    arg1,
                    arg2
                  );
                } else {
                  addTranslation({
                    msgid: arg1,
                    msgid_plural: arg2,
                    comment: arg0
                  });
                }
              } else {
                let pos = name.lastIndexOf(".");
                // name can be ".concat" when used with "[].concat"
                if (pos > 0) {
                  let str = name.substring(0, pos);
                  if (!t.hasDeclaration(str)) {
                    t._requireClass(str, {
                      usage: "dynamic",
                      location: path.node.loc
                    });
                  }
                }
              }
            }
          }
        },

        MemberExpression: {
          exit(path) {
            // regular expression or string property (eg "aa".charCodeAt())
            if (path.node.object.type == "Literal") {
              return;
            }

            // Handle `[ 123 ].blah()` by visiting
            if (path.node.object.type == "ArrayExpression") {
              return;
            }

            // Handle `[ 123 ].blah()` by visiting
            if (
              path.node.object.type == "MemberExpression" &&
              path.node.object.object.type == "ArrayExpression"
            ) {
              return;
            }

            let name = collapseMemberExpression(path.node);
            if (name.startsWith("(")) {
              return;
            }
            let members = name.split(".");

            // Ignore 'this' references
            if (members[0] === "this") {
              return;
            }

            // Global variable or a local variable?
            if (t.__globalSymbols[members[0]] || t.hasDeclaration(members[0])) {
              return;
            }

            let info = t._requireClass(name, { location: path.node.loc });
            if (!info || !info.className) {
              // The code `abc.def.ghi()` will produce a member expression for both `abc.def` (two Identifier's)
              //  and another for `abc.def` and `.ghi` (MemberExpression + Identifier).  Our logic for detecting
              //  references and unresolved symbols expects the full `abc.def.ghi` so by excluding MemberExpression's
              //  where the container is also a MemberExpression means that we skip the incomplete `abc.def`
              if (path.container.type == "MemberExpression") {
                return;
              }
              t.addReference(members, path.node.loc);
            }
          }
        },

        ObjectProperty: {
          exit(path) {
            if (this.__privateMangling == "readable") {
              if (
                path.node.value.type == "FunctionExpression" &&
                path.node.value.id === null
              ) {
                let functionName =
                  typeof path.node.key.value == "string"
                    ? path.node.key.value
                    : path.node.key.name;
                if (!qx.tool.compiler.ClassFile.RESERVED_WORDS[functionName]) {
                  path.node.value.id = types.identifier(functionName);
                }
              }
            }
          }
        },

        Property(path) {
          if (
            t.__classMeta &&
            t.__classMeta._topLevel &&
            t.__classMeta._topLevel.path == path.parentPath.parentPath
          ) {
            t.__classMeta.functionName = getKeyName(path.node.key);
            makeMeta(
              t.__classMeta._topLevel.keyName,
              t.__classMeta.functionName,
              path.node
            );

            path.skip();
            let functionId = null;
            if (this.__privateMangling == "readable") {
              if (
                path.node.value.type == "FunctionExpression" &&
                path.node.value.id === null
              ) {
                let functionName =
                  typeof path.node.key.value == "string"
                    ? path.node.key.value
                    : path.node.key.name;
                if (!qx.tool.compiler.ClassFile.RESERVED_WORDS[functionName]) {
                  functionId = types.identifier(functionName);
                }
              }
            }
            path.traverse(VISITOR);
            if (functionId) {
              path.node.value.id = functionId;
            }
            t.__classMeta.functionName = null;
          }
        },

        ObjectMethod(path) {
          // Methods within a top level object (ie "members" or "statics"), record the method name and meta data
          if (
            t.__classMeta &&
            t.__classMeta._topLevel &&
            t.__classMeta._topLevel.path == path.parentPath.parentPath
          ) {
            t.__classMeta.functionName = getKeyName(path.node.key);
            makeMeta(
              t.__classMeta._topLevel.keyName,
              t.__classMeta.functionName,
              path.node
            );

            path.skip();
            enterFunction(path);
            path.traverse(VISITOR);
            exitFunction(path);
            t.__classMeta.functionName = null;

            // Otherwise traverse method as normal
          } else {
            path.skip();
            enterFunction(path);
            path.traverse(VISITOR);
            exitFunction(path);
          }
        },

        FunctionDeclaration: FUNCTION_DECL_OR_EXPR,
        FunctionExpression: FUNCTION_DECL_OR_EXPR,
        ArrowFunctionExpression: FUNCTION_DECL_OR_EXPR,

        VariableDeclaration: {
          exit(path) {
            checkNodeJsDocDirectives(path.node);
            path.node.declarations.forEach(decl => {
              // Simple `var x` form
              if (decl.id.type == "Identifier") {
                let value = null;
                //decl.id.name = t.encodePrivate(decl.id.name, true, decl.loc);
                if (decl.init) {
                  if (decl.init.type == "Identifier") {
                    value = decl.init.name;
                  } else if (decl.init.type == "ThisExpression") {
                    value = "this";
                  }
                }
                t.addDeclaration(decl.id.name, value);

                // Object destructuring `var {a,b} = {...}`
              } else if (decl.id.type == "ObjectPattern") {
                decl.id.properties.forEach(prop => {
                  if (prop.value.type == "AssignmentPattern") {
                    t.addDeclaration(prop.value.left.name);
                  } else {
                    t.addDeclaration(prop.value.name);
                  }
                });

                // Array destructuring `var [a,b] = [...]`
              } else if (decl.id.type == "ArrayPattern") {
                decl.id.elements.forEach(prop => {
                  if (prop) {
                    if (prop.type == "AssignmentPattern") {
                      t.addDeclaration(prop.left.name);
                    } else if (prop.type == "RestElement") {
                      t.addDeclaration(prop.argument.name);
                    } else {
                      t.addDeclaration(prop.name);
                    }
                  }
                });
              }
            });
          }
        },

        ClassDeclaration(path) {
          t.addDeclaration(path.node.id.name);
        },

        // Note that AST Explorer calls this MethodDefinition, not ClassMethod
        ClassMethod: {
          enter(path) {
            enterFunction(path, path.node.value, path.node.key);
          },
          exit(path) {
            exitFunction(path, path.node.value, path.node.key);
          }
        },

        CatchClause: {
          enter(path) {
            t.pushScope(null, path.node);
            t.addDeclaration(path.node.param.name);
          },
          exit(path) {
            t.popScope(path.node);
          }
        }
      };

      return {
        CodeElimination: { visitor: CODE_ELIMINATION_VISITOR },
        Compiler: { visitor: VISITOR }
      };
    },

    /**
     * Pushes new meta data onto the stack - each meta represents a class being defined,
     * we operate a stack so that we can handle inner classes
     *
     * @param className {String} name of the class being defined
     */
    __pushMeta(className) {
      var pos = (className || "").lastIndexOf(".");
      var meta = {
        className: className,
        packageName: pos > -1 ? className.substring(0, pos) : null,
        name: pos > -1 ? className.substring(pos + 1) : className,
        superClass: null,
        interfaces: [],
        mixins: [],
        functionName: null
      };

      this.__metaStack.push(meta);
      this.__classMeta = meta;
      this.__metaDefinitions[className] = meta;
      this.__numClassesDefined++;
    },

    /**
     * Pops the current meta off the stack, optionally checking that the classname is correct
     */
    __popMeta(className) {
      if (!this.__metaStack.length) {
        throw new Error("No __metaStack entries to pop");
      }
      let meta = this.__metaStack[this.__metaStack.length - 1];
      if (className && meta.className != className) {
        throw new Error(
          "Wrong __metaStack entries to pop, expected " +
            className +
            " found " +
            meta.className
        );
      }
      this.__metaStack.pop();
      meta = this.__metaStack[this.__metaStack.length - 1] || null;
      this.__classMeta = meta;
    },

    /**
     * Pushes a new scope on the stack
     */
    pushScope(functionName, node, isClassMember) {
      this.__scope = {
        functionName: functionName,
        parent: this.__scope,
        loc: node.loc,
        vars: {},
        unresolved: {},
        isClassMember: Boolean(isClassMember)
      };
    },

    /**
     * Pops a scope from the stack
     */
    popScope(node) {
      var old = this.__scope;
      var scope = (this.__scope = this.__scope.parent);
      var unresolved = scope.unresolved;

      for (var name in old.unresolved) {
        if (scope.vars[name]) {
          continue;
        }
        var entry = unresolved[name];
        if (!entry) {
          entry = unresolved[name] = {
            name: name,
            locations: []
          };
        }
        entry.locations.push.apply(
          entry.locations,
          old.unresolved[name].locations
        );
      }
    },

    /**
     * Tests whether the current scope is load-time scope
     *
     * @returns {Boolean}
     */
    isLoadScope() {
      return !this.__scope.parent;
    },

    /**
     * Tests whether this class has a defer method
     *
     * @returns {Boolean}
     */
    hasDefer() {
      return this.__hasDefer;
    },

    /**
     * Adds a variable declaration to the current scope; if the symbol was
     * previously "unresolved" it is removed from the unresolved list
     *
     * @param name {String} the name of the variabvle being declared
     * @param valueName {String} the value to assign to the variable
     */
    addDeclaration(name, valueName) {
      if (this.__scope.vars[name] === undefined) {
        this.__scope.vars[name] = valueName || true;
        var unresolved = this.__scope.unresolved;
        delete unresolved[name];
        var re = new RegExp(name + "\\.");
        for (var tmp in unresolved) {
          if (re.test(tmp)) {
            delete unresolved[tmp];
          }
        }
      }
    },

    /**
     * Tests whether there is a variable declaration accessible to the current
     * scope, ie including parent scope
     *
     * @param name
     * @returns {Boolean}
     */
    hasDeclaration(name) {
      var pos = name.indexOf(".");
      if (pos > -1) {
        name = name.substring(0, pos);
      }
      for (var tmp = this.__scope; tmp; tmp = tmp.parent) {
        if (tmp.vars[name] !== undefined) {
          return true;
        }
      }
      return false;
    },

    /**
     * Adds a reference to a symbol; unknown symbols are marked as unresolved
     * @param name
     * @param loc
     */
    addReference(name, loc) {
      if (!qx.lang.Type.isArray(name)) {
        name = name.split(".");
      }
      var scope = this.__scope;
      if (scope.vars[name[0]] !== undefined) {
        return;
      }

      // Global variable or a local variable?
      if (
        name[0] === "this" ||
        name[0] === "[]" ||
        this.__globalSymbols[name[0]] ||
        this.hasDeclaration(name[0])
      ) {
        return;
      }

      let str = "";
      for (var i = 0; i < name.length; i++) {
        if (i) {
          str += ".";
        }
        str += name[i];
        if (this.__globalSymbols[str] || this.isIgnored(str)) {
          return;
        }
      }
      name = str;
      if (
        name == this.__className ||
        name.startsWith(this.__className + ".") ||
        name.startsWith("(")
      ) {
        return;
      }

      if (!scope.unresolved[name]) {
        scope.unresolved[name] = {
          name: name,
          locations: loc ? [loc] : [],
          load: this.isLoadScope(),
          defer: this.__inDefer
        };
      } else if (loc) {
        scope.unresolved[name].locations.push(loc);
      }
    },

    /**
     * Repeatably encodes a private symbol name, caching the result; ignores non-private symbols
     *
     * @param name {String} symbol name
     * @param isIdentifier {boolean} whether this is usage as an identifier (and not in a string literal)
     * @param location {Location} the location of the symbol
     * @return {String} the encoded name if private, the original name if not private
     */
    encodePrivate(name, isIdentifier, location) {
      const DO_NOT_ENCODE = {
        __proto__: 1,
        __iterator__: 1,
        __dirname: 1,
        __filename: 1
      };

      if (
        DO_NOT_ENCODE[name] ||
        this.__privateMangling == "off" ||
        !name.startsWith("__") ||
        !name.match(/^[0-9a-z_$]+$/i)
      ) {
        return name;
      }

      if (name.indexOf("__P_") > -1) {
        return name;
      }

      let coded = this.__privates[name];
      if (!coded) {
        // Strings have to be handled differently - we need to mangle them, but only if we
        //  know for sure that they are private members; to do this, we need to see a symbol
        //  (identifier) first, to know that the string needs to be mangled
        if (!isIdentifier) {
          this.__blockedPrivates[name] = true;
          return name;
        }
        if (this.__blockedPrivates[name]) {
          this.addMarker("class.blockedMangle", location, name);
          return name;
        }
        let db = this.__analyser.getDatabase();
        if (!db.manglePrefixes) {
          db.manglePrefixes = {
            nextPrefix: 1,
            classPrefixes: {}
          };
        }
        let prefixes = db.manglePrefixes;
        let prefix = prefixes.classPrefixes[this.__className];
        if (!prefix) {
          prefix = "__P_" + ++prefixes.nextPrefix + "_";
          prefixes.classPrefixes[this.__className] = prefix;
        }

        if (this.__privateMangling == "readable") {
          coded = this.__privates[name] =
            name + prefix + Object.keys(this.__privates).length;
        } else {
          coded = this.__privates[name] =
            prefix + Object.keys(this.__privates).length;
        }
      }
      return coded;
    },

    /**
     * Removes a reference from scope; this should only really be used after scanning is complete
     * @param name
     */
    deleteReference(name) {
      delete this.__scope.unresolved[name];
      var stub = name + ".";
      for (var id in this.__scope.unresolved) {
        if (id.startsWith(stub)) {
          delete this.__scope.unresolved[id];
        }
      }
    },

    /**
     * Adds an external resource which needs to be loaded early
     *
     * @param name {String} name of the symbol
     */
    addExternal(name) {
      if (this.__externals.indexOf(name) < 0) {
        this.__externals.push(name);
      }
    },

    /**
     * Adds a CommonJS module to be browserified
     *
     * @param name {String} name of the module
     */
    addCommonjsModule(moduleName, className, linenum) {
      if (!this.__commonjsModules[moduleName]) {
        this.__commonjsModules[moduleName] = new Set();
      }

      this.__commonjsModules[moduleName].add(`${className}:${linenum}`);
    },

    /**
     * Adds an ignored symbol
     * @param name {String} name of the symbol
     */
    addIgnore(name) {
      var scope = this.__scope;
      if (!scope.ignore) {
        scope.ignore = {};
      }
      var segs = name.split(",");
      segs.forEach(name => {
        name = name.trim();
        if (name.length) {
          if (name.endsWith(".*")) {
            scope.ignore[name] = name.substring(0, name.length - 2);
          } else if (name.endsWith("*")) {
            scope.ignore[name] = name.substring(0, name.length - 1);
          } else {
            scope.ignore[name] = true;
          }
        }
      });
    },

    /**
     * Tests whether a symbol has already been marked as ignore
     * @param name {String} symbol name
     * @return {Boolean} true if ignored
     */
    isIgnored(name) {
      for (var tmp = this.__scope; tmp; tmp = tmp.parent) {
        if (tmp.ignore) {
          if (tmp.ignore[name]) {
            return true;
          }
          for (var key in tmp.ignore) {
            if (tmp.ignore[key] !== true) {
              if (name.startsWith(tmp.ignore[key])) {
                return true;
              }
            }
          }
        }
      }
      return false;
    },

    /**
     * Removes an ignored symbol
     * @param name {String} name of the symbol
     */
    removeIgnore(name) {
      var scope = this.__scope;
      if (!scope) {
        return;
      }
      var segs = name.split(",");
      segs.forEach(name => delete scope.ignore[name]);
    },

    /**
     * Adds an environment check made by the class
     *
     * @param name
     * @param location {Object?} see _requireClass
     */
    addEnvCheck(name, location) {
      var t = this;
      var requiredOpts = {
        load: t.isLoadScope(),
        defer: t.__inDefer,
        construct:
          t.__classMeta && t.__classMeta.functionName == "$$constructor",
        location: location
      };

      var dest = t.__environmentChecks.required[name];
      if (!dest) {
        dest = t.__environmentChecks.required[name] = {};
      }
      if (requiredOpts.load) {
        dest.load = true;
      }
      if (requiredOpts.defer) {
        dest.defer = true;
      }
      if (requiredOpts.construct) {
        dest.construct = true;
      }
      t._requireClass("qx.core.Environment", { location: location });
      let info = t.__analyser.getSymbolType(name);
      if (
        !Object.prototype.hasOwnProperty.call(
          qx.tool.compiler.ClassFile.ENVIRONMENT_CONSTANTS,
          name
        )
      ) {
        // Generally speaking, we try to have as few load dependencies as possible, and this
        // means that in a class' `.defer()` we will still allow for runtime loading.  However,
        // we pull environment checks up as this is a common use case; the problem this is trying
        // to solve is instances where the feature detection class is loaded after the class which
        // implements the polyfill, and the polyfill's defer method is then installing a polyfill
        // when it does not need to (and should not do so).  For example, `qx.bom.client.EcmaScript`
        // *must* load and have its defer called before the `qx.lang.normalize.Object` class has
        // it's defer called.
        let load = dest.load;
        if (info && info.symbolType == "environment") {
          load = true;
        }
        t._requireClass(name, { load: load, location: location });
        if (info && info.symbolType == "environment") {
          dest.className = info.className;
        }
      }
    },

    /**
     * Adds a marker (eg warning or error)
     *
     * @param msgId {String} the marker message ID (@see qx.tool.compiler.Marker)
     * @param pos {Object||null} position map; may contain a Map containing
     *  {line,column?}, or a Map {start:{line,column}, end: {line,column}}.
     */
    addMarker(msgId, pos) {
      msgId = "qx.tool.compiler." + msgId;

      let key = msgId;
      let fragment = msgId.indexOf("#");
      if (fragment > -1) {
        msgId = msgId.substring(0, fragment);
      } else {
        // Give each marker a unique key based on msgId and the line; use this to suppress
        //  multiple markers
        key += "#";
        if (pos) {
          if (pos.line) {
            key += pos.line;
          } else if (pos.start && pos.start.line) {
            key += pos.start.line;
          }
        }
      }

      if (this.__haveMarkersFor[key]) {
        return;
      }
      this.__haveMarkersFor[key] = true;

      let marker = {
        msgId: msgId
      };

      // Extract position
      if (pos) {
        if (pos.line) {
          pos = { start: pos };
        }
        if (pos.start) {
          let tmp = { line: pos.start.line };
          if (pos.start.column) {
            tmp.column = pos.start.column;
          }
          marker.pos = { start: tmp };
          if (pos.end && pos.end.line) {
            let tmp = { line: pos.end.line };
            if (pos.end.column) {
              tmp.column = pos.end.column;
            }
            marker.pos.end = tmp;
          }
        }
      }
      let args = qx.lang.Array.fromArguments(arguments, 2);
      if (args.length) {
        marker.args = args;
      }
      this.__markers.push(marker);
    },

    /**
     * Adds a required class
     *
     * @param name {String} the name of the class
     * @param opts {Map?} which is:
     *  where {"ignore"|"require"|"use"|null} where it's mentioned
     *  load {Boolean?} whether it is a load-time dependency or not
     *  defer {Boolean?} whether the dependency is in defer or not
     *  location {Map?} location of the token that caused the reference
     * @return {Map?} info about the symbol type of the named class, @see {Analyser.getSymbolType}
     */
    _requireClass(name, opts) {
      if (qx.lang.Type.isArray(name)) {
        name.forEach(name => this._requireClass(name));
        return null;
      }
      let t = this;
      if (name == this.__className) {
        return null;
      }
      if (!name) {
        throw new Error("No classname");
      }
      if (this.isIgnored(name)) {
        return null;
      }

      let requireOpts = {
        load: t.isLoadScope(),
        defer: t.__inDefer,
        construct:
          t.__classMeta && t.__classMeta.functionName == "$$constructor"
      };

      if (opts) {
        for (let key in opts) {
          requireOpts[key] = opts[key];
        }
      }

      let info = t.__analyser.getSymbolType(name);
      let symbolType = info ? info.symbolType : null;
      let className = info ? info.className : null;
      if (symbolType != "package" && className && className != t.__className) {
        // Re-check the class name as ignored if this is a member
        if (symbolType == "member" && t.isIgnored(className)) {
          return null;
        }
        let data = t.__requiredClasses[className];
        if (!data) {
          data = t.__requiredClasses[className] = {};
        }

        if (requireOpts.where !== undefined) {
          if (requireOpts.where == "ignore") {
            data.ignore = true;
          } else if (requireOpts.where == "require") {
            data.require = true;
          }
        }
        if (requireOpts.load) {
          data.load = true;
          if (requireOpts.usage === "dynamic") {
            if (data.usage !== "static") {
              data.usage = "dynamic";
            }
            data.load = true;
          } else if (!data.load) {
            data.load = true;
            data.usage = "static";
          }
        }
        if (requireOpts.defer) {
          if (requireOpts.load) {
            data.defer = "load";
          } else if (data.defer !== "load") {
            data.defer = "runtime";
          }

          if (!name.startsWith(t.__className)) {
            if (
              !qx.tool.compiler.ClassFile.DEFER_SAFE_SYMBOLS.some(function (
                symbol
              ) {
                return name.startsWith(symbol);
              })
            ) {
              // Temporarily disabled until Qooxdoo framework catches up
              // t.addMarker("defer.unsafe", (opts && opts.location)||null, name);
            }
          }
        }
        if (requireOpts.construct) {
          data.construct = true;
        }
        t.deleteReference(className);
      }
      return info;
    },

    /**
     * Adds a required asset
     * @param path
     */
    _requireAsset(path) {
      if (path.indexOf("/") < 0 && path.indexOf(".") > -1) {
        path = path.replace(/\./g, "/");
      }
      if (!qx.lang.Array.contains(this.__requiredAssets, path)) {
        this.__requiredAssets.push(path);
      }
    },

    /**
     * Returns the assets required by the class
     * @returns
     */
    getAssets() {
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
    __findProperty(props, name) {
      for (let i = 0; i < props.length; i++) {
        let prop = props[i];
        if (prop.type == "Property") {
          if (prop.key.type == "Identifier" && prop.key.name == name) {
            return prop;
          }
          if (prop.key.type == "StringLiteral" && prop.key.value == name) {
            return prop;
          }
        }
      }
      return null;
    },

    /**
     * Returns the list of required classes (dependencies)
     *
     * @returns
     */
    getRequiredClasses() {
      return this.__requiredClasses;
    },

    /**
     * Returns a list of unresolved symbols
     *
     * @returns
     */
    getUnresolvedSymbols() {
      return this.__scope.unresolved;
    },

    /**
     * Returns the name of the class being compiled
     * @returns {null}
     */
    getClassName() {
      return this.__className;
    }
  },

  defer(statics) {
    statics.RESERVED_WORDS = {};
    let str =
      "abstract  arguments await  boolean break byte  case  catch char  class  const continue debugger  default delete  do " +
      "double  else  enum eval export extends  false final finally float for function goto  if  implements  import " +
      "in  instanceof  int interface let  long  native  new null  package private protected public  return  short static " +
      "super  switch  synchronized  this throw throws  transient true try typeof  var void volatile  while with  yield";
    str.split(/\s+/).forEach(word => (statics.RESERVED_WORDS[word] = true));
    statics.SYSTEM_CHECKS = {};
    "Boolean,String,Number,Integer,PositiveNumber,PositiveInteger,Error,RegExp,Object,Array,Map,Function,Date,Node,Element,Document,Window,Event,Class,Mixin,Interface,Theme,Color,Decorator,Font"
      .split(",")
      .forEach(word => (statics.SYSTEM_CHECKS[word] = true));
  },

  statics: {
    /**
     * Returns the root namespace from the classname, or null if it cannot be determined
     * @param className
     * @returns {*|null}
     */
    getNamespace(className) {
      var m = className.match(/^([^.]+)\./);
      return (m && m[1]) || null;
    },

    /**
     * These options are passed to Babel for JSX compilation; they can be changed by the CLI etc
     * as needed.
     *
     * Note that at the moment they use a class that does not exist!  `qx.html.Jsx` is coming soon
     * to a PR near you, but in the mean time you could use the compile.json `jsx` setting to
     * change these to something else, eg `{ pragma: "jsx.dom", pragmaFrag: "jsx.Fragment }` and
     * use https://github.com/alecsgone/jsx-render in your application's code.
     */
    JSX_OPTIONS: {
      pragma: "qx.html.Jsx.createElement",
      pragmaFrag: "qx.html.Jsx.FRAGMENT"
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
    QX_GLOBALS: [
      "qx.$$domReady",
      "qx.$$environment",
      "qx.$$libraries",
      "qx.$$loader",
      "qx.$$locales",
      "qx.$$namespaceRoot",
      "qx.$$resources",
      "qx.$$packageData",
      "qx.$$start",
      "qx.$$translations"
    ],

    COMMON_GLOBALS: [
      "Array",
      "ArrayBuffer",
      "Boolean",
      "Date",
      "DataView",
      "EvalError",
      "Error",
      "Float32Array",
      "Float64Array",
      "Function",
      "GeneratorFunction",
      "Generator",
      "Infinity",
      "Int8Array",
      "Int16Array",
      "Int32Array",
      "JSON",
      "Map",
      "Math",
      "NaN",
      "Number",
      "Object",
      "Proxy",
      "Promise",
      "RangeError",
      "ReferenceError",
      "Reflect",
      "RegExp",
      "Set",
      "String",
      "Symbol",
      "SyntaxError",
      "TypedArray",
      "TypeError",
      "Uint8Array",
      "Uint8ClampedArray",
      "Uint16Array",
      "Uint32Array",
      "URIError",
      "WeakMap",
      "WeakSet",
      "arguments",
      "atob",
      "btoa",
      "console",
      "clearInterval",
      "clearTimeout",
      "decodeURI",
      "decodeURIComponent",
      "document",
      "encodeURI",
      "encodeURIComponent",
      "escape",
      "error",
      "eval",
      "isNaN",
      "isFinite",
      "navigator",
      "parseInt",
      "parseFloat",
      "setInterval",
      "setTimeout",
      "undefined",
      "unescape",
      "window"
    ],

    BROWSER_GLOBALS: [
      "ActiveXObject",
      "Blob",
      "CustomEvent",
      "DOMParser",
      "DOMException",
      "Event",
      "FileReader",
      "FormData",
      "Image",
      "MutationObserver",
      "XPathResult",
      "XMLHttpRequest",
      "XMLSerializer",
      "XPathEvaluator",
      "alert",
      "document",
      "history",
      "location",
      "navigator",
      "performance",
      "getComputedStyle",
      "localStorage"
    ],

    NODE_GLOBALS: [
      "Module",
      "require",
      "module",
      "process",
      "setImmediate",
      "__dirname",
      "__filename"
    ],

    RHINO_GLOBALS: ["Packages", "java"],

    RESERVED_WORDS: null,

    /**
     * These are the constants which are answered by Qooxdoo qx.core.Environment; we use out own copy here and
     * not the one available in qx.core.Environment._defaults because we need to use the version which is appropriate
     * for the version of Qooxdoo being compiled, not the one that this CLI is compiled with
     */
    ENVIRONMENT_CONSTANTS: {
      // an always-true key (e.g. for use in qx.core.Environment.filter() calls)
      true: true,
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

    SYSTEM_CHECKS: null
  }
});
