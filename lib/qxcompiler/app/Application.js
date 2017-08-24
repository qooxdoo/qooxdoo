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
var async = require("async");
var path = require("path");
var qx = require("qooxdoo");
var util = require("../../util");

var log = util.createLog("app");

qx.Class.define("qxcompiler.app.Application", {
  extend: qx.core.Object,

  /**
   * Constructor
   * @param className[, className...] {String|String[]}
   */
  construct: function (className) {
    this.base(arguments);
    var args = qx.lang.Array.fromArguments(arguments);
    var t = this;
    this.__classes = [];
    args.forEach(function(arg) {
      if (qx.lang.Type.isArray(arg))
        qx.lang.Array.append(t.__classes, arg);
      else
        t.__classes.push(arg);
    });
    this.set({ include: [], exclude: [] });
  },

  properties: {
    /**
     * Environment property map
     */
    environment: {
      init: null,
      nullable: true
    },

    /**
     * The Analyser instance
     */
    analyser: {
      init: null,
      nullable: true
    },

    /**
     * Application theme (class name)
     */
    theme: {
      init: "qx.theme.Simple",
      check: "String"
    },

    /**
     * The name of the application, used for script directory file unless outputPath is set
     */
    name: {
      init: "index",
      nullable: false,
      check: "String"
    },
    
    /**
     * Output path, relative to the target's output path
     */
    outputPath: {
      init: null,
      nullable: true,
      check: "String"
    },
    
    /**
     * URI used to load application source files, if null then "." is used (ie same directory
     * as boot.js) 
     */
    sourceUri: {
      init: null,
      nullable: true,
      check: "String"
    },

    /**
     * Classes to exclude when building
     */
    exclude: {
      nullable: false,
      check: "Array",
      transform: "__transformArray"
    },
    
    /**
     * Classes to include with the build
     */
    include: {
      nullable: false,
      check: "Array",
      transform: "__transformArray"
    }
  },

  members: {
    __loadDeps: null,

    /**
     * Returns the application boot loader template to use
     */
    getLoaderTemplate: function() {
      return path.join(__dirname, "Application-loader.tmpl.js");
    },

    /**
     * Calculates the dependencies of the classes to create a load order
     *
     * @param classes
     */
    calcDependencies: function (cb) {
      var t = this;
      var analyser = this.getAnalyser();
      var db = analyser.getDatabase();
      var allDeps = new qxcompiler.utils.IndexedArray();
      var exclude = {};

      var notYetDependedOn = [];
      var i = 0;

      this.__loadDeps = null;
      
      // Copy all of the class definitions into notYetDependedOn;
      // notYetDependedOn is depleted as the load order is determined
      for (var className in db.classInfo) {
        var info = notYetDependedOn[i++] = {
          className: className,
          neededFor: {}
        };
        var src = db.classInfo[className];
        if (src)
          for (var name in src)
            info[name] = src[name];
      }

      notYetDependedOn = notYetDependedOn.sort(function (left, right) {
        return left.className < right.className ? -1 : left.className > right.className ? 1 : 0;
      });

      /*
       * Finds the class definition in notYetDependedOn
       *
       * @param className
       * @returns
       */
      function getNYDO(className) {
        for (var i = 0; i < notYetDependedOn.length; i++) {
          var info = notYetDependedOn[i];
          if (info.className == className) {
            return info;
          }
        }
        return null;
      }

      var needed = [];
      var neededIndex = 0;
      var stack = new qxcompiler.utils.IndexedArray();
      
      
      /*
       * We could say that when a class is `.require`d, then we treat any of it's `construct:true` dependencies as `require:true`
       * The problem is given this example:
       *    qx.core.Init.defer()
       *      qx.event.Registration.addListener
       *        qx.event.Registration.getManager
       *          qx.event.Manager.construct
       *            new qx.util.DeferredCall
       *            
       *    new qx.util.DeferredCall is a runtime only dependency so is not available.
       *    
       * So the thesis is that deferred calls tend to be about initialisation, so prioritising constructor dependencies
       * may be helpful
       */
      
      function compileAllRemainingDeps(className, deps) {
        var checked = {};
        var depNames = { };
        depNames[className] = true;
        
        function search(className) {
          if (checked[className])
            return;
          checked[className] = true;

          var info = getNYDO(className);
          if (info && info.dependsOn) {
            for (var depName in info.dependsOn) {
              var dd = info.dependsOn[depName];
              if (dd.load || dd.require || dd.defer || dd.construct) {
                if (!allDeps.contains(depName))
                  depNames[depName] = true;
                search(depName);
              }
            }
          }
        }
        
        search(className);
        for (var depName in depNames)
          deps.push(depName);
      }

      function addDep(className) {
        if (exclude[className])
          return;
        if (allDeps.contains(className) || stack.contains(className))
          return;

        var info = getNYDO(className);
        if (!info)
          return;
        
        var deps = info.dependsOn;
        var deferDeps = [];
        if (deps) {
          stack.push(className);
          for (var depName in deps) {
            var dd = deps[depName];
            if (dd.load || dd.require) {
              addDep(depName);
            } else if (dd.defer) {
              deferDeps.push(depName);
            } else if (!allDeps.contains(depName) && needed.indexOf(depName) == -1)
              needed.push(depName);
          }
          stack.remove(className);
        }

        allDeps.push(className);
        deferDeps.forEach(function(depName) {
          var deps = [];
          compileAllRemainingDeps(depName, deps);
          deps.forEach(addDep);
        });
      }

      exclude = {};
      t.__expandClassnames(t.getExclude()).forEach((name) => exclude[name] = true);
      
      // Start the ball rolling
      addDep("qx.core.Object");
      t.getRequiredClasses().forEach(function(classname) {
        addDep(classname);
      });
      if (t.getTheme())
        addDep(t.getTheme());
      
      while (neededIndex < needed.length) {
        var className = needed[neededIndex++];
        addDep(className);
      }

      this.__loadDeps = allDeps.toArray();
      
      if (cb)
        cb();
    },

    getUris: function () {
      var uris = [];
      var loadDeps = this.__loadDeps;
      var db = this.getAnalyser().getDatabase();

      function add(className) {
        var def = db.classInfo[className];
        uris.push(def.libraryName + ":" + className.replace(/\./g, "/") + ".js");
      }
      this.__loadDeps.forEach(add);

      return uris;
    },
    
    getDependencies: function() {
      return this.__loadDeps;
    },

    /**
     * Returns a list of all of the assets required by all classes
     * @param environment {Map} environment
     */
    getAssets: function (environment) {
      var assets = [];
      var analyser = this.getAnalyser();
      var db = analyser.getDatabase();
      
      // Get a list of libraries used
      var libraryLookup = {};

      // Check all the classes
      var classNames = this.__loadDeps.slice();
      for (var i = 0; i < classNames.length; i++) {
        var classInfo = db.classInfo[classNames[i]];
        var tmp = classInfo.assets;
        if (tmp) {
          tmp.forEach(function(str) {
            var pos = str.indexOf(':');
            if (pos > -1)
              assets.push(str);
            else {
              pos = str.indexOf('/');
              if (pos > -1) {
                var namespace = str.substring(0, pos);
                var lib = analyser.findLibrary(namespace);
                if (lib)
                  assets.push(namespace + ":" + str);
              }
            }
          });
        }
        if (!libraryLookup[classInfo.libraryName]) {
          libraryLookup[classInfo.libraryName] = analyser.findLibrary(classInfo.libraryName);
        }
      }
      
      for (var name in libraryLookup) {
        var lib = libraryLookup[name];
        if (lib) {
          if (lib.getAddScript()) {
            lib.getAddScript().forEach(function(path) {
              assets.push(lib.getNamespace() + ":" + path);
            });
          }
          if (lib.getAddCss()) {
            lib.getAddCss().forEach(function(path) {
              assets.push(lib.getNamespace() + ":"  + path);
            });
          }
        }
      }

      // Expand variables
      for (var i = 0; i < assets.length; i++) {
        var asset = assets[i];
        var matched = false;

        var m = asset.match(/\$\{([^}]+)\}/);
        if (m) {
          var match = m[0];
          var capture = m[1];
          var pos = asset.indexOf(match);
          var left = asset.substring(0, pos);
          var right = asset.substring(pos + match.length);
          var value = environment[capture];
          if (value !== undefined) {
            if (qx.lang.Type.isArray(value)) {
              value.forEach(function(value) {
                assets.push(left + value + right);
              });
            } else {
              assets.push(left + value + right);
            }
          }
          qx.lang.Array.removeAt(assets, i--);
        }
      }

      // Remove duplicates and overlapping path wildcards
      assets.sort();
      for (var i = 1; i < assets.length; i++) {
        var asset = assets[i];
        var lastAsset = assets[i - 1];

        if (asset == lastAsset) {
          assets.splice(i--, 1);
          continue;
        }

        if (lastAsset[lastAsset.length - 1] == '*') {
          var path = lastAsset.substring(0, lastAsset.length - 1);
          if (asset.substring(0, path.length) == path) {
            assets.splice(i--, 1);
            continue;
          }
        }
      }

      return assets;
    },

    /**
     * Returns the class name for the application
     * @returns {String}
     */
    getClassName: function() {
      return this.__classes[0];
    },

    /**
     * Returns the classes required for the application
     * @returns {Array}
     */
    getRequiredClasses: function() {
      var result = {};
      this.__classes.forEach((name) => result[name] = true);
      this.__expandClassnames(this.getInclude()).forEach((name) => result[name] = true);
      this.__expandClassnames(this.getExclude()).forEach((name) => delete result[name]);
      return Object.keys(result);
    },
    
    /**
     * Expands a list of class names including wildcards (eg "qx.ui.*") into an
     * exhaustive list without wildcards
     * @param names {String[]}
     * @return String[]
     */
    __expandClassnames: function(names) {
      var t = this;
      var result = {};
      names.forEach(function(name) {
        var pos = name.indexOf('*');
        if (pos < 0) {
          result[name] = true;
        } else {
          var prefix = name.substring(0, pos);
          t.getAnalyser().getLibraries().forEach(function(lib) {
            var symbols = lib.getKnownSymbols();
            for (var symbol in symbols) {
              if (symbols[symbol] == "class" && symbol.startsWith(prefix)) 
                result[symbol] = true;
            }
          });
        }
      });
      return Object.keys(result);
    },

    /**
     * Transforms values to make sure that they are an array (and never null)
     */
    __transformArray: function(value) {
      return value||[];
    }

  }
});

module.exports = qxcompiler.app.Application;
