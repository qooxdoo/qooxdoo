/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
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
require("qooxdoo");
var util = require("../util");

var log = util.createLog("app");

qx.Class.define("qx.tool.compiler.app.Application", {
  extend: qx.core.Object,

  /**
   * Constructor
   * @param classname[, classname...] {String|String[]}
   */
  construct: function (classname) {
    this.base(arguments);
    this.initType();
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
     * The type of application to generate; note that changing this will change the `loaderTemplate` 
     * and `theme` properties
     */
    type: {
      init: "browser",
      check: [ "browser", "rhino", "node" ],
      apply: "_applyType"
    },
    
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
     * The human readable, customer facing title of the application - it's used to customise the title
     * of the index.html page
     */
    title: {
      init: null,
      nullable: true,
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
    },
    
    /** 
     * Template file used to create boot.js; note that this is changed when the `type` property
     * is changed 
     */
    loaderTemplate: {
      nullable: false,
      check: "String"
    },

    /**
     * Writes the index.html into root instead of app dir
     */
    writeIndexHtmlToRoot: {
      init: false,
      check: "Boolean"
    },
  },

  members: {
    __loadDeps: null,
    __parts: null,
    __fatalCompileErrors: null,

    /**
     * Calculates the dependencies of the classes to create a load order
     *
     * @param classes
     */
    calcDependencies: function () {
      var t = this;
      var Console = qx.tool.compiler.Console.getInstance();
      var analyser = this.getAnalyser();
      var db = analyser.getDatabase();
      var allDeps = new qx.tool.compiler.utils.IndexedArray();
      var exclude = {};
      var fatalCompileErrors = [];

      this.__loadDeps = null;
      
      var partsByName = {};
      var parts = [];
      var bootPart = null;
      var classDataByClassname = {};
      
      if (this.__parts && this.__parts.length) {
        parts = [];
        t.__parts.forEach((part) => {
          if (partsByName[part.getName()])
            throw new Error(Console.decode("qx.tool.compiler.application.duplicatePartNames", part.getName()));
          var partData = {
              name: part.getName(),
              include: part.getInclude(),
              exclude: part.getExclude(),
              classes: [],
              dependsOn: {},
              combine: part.getCombine(),
              minify: part.getMinify()
          };
          var code = [];
          part.getExclude().forEach((spec) => {
            var pos;
            if ((pos = spec.indexOf('*')) > -1) {
              code.push("  if (value.startsWith(\"" + spec.substring(0, pos) + "\"))\n    return null; // " + spec);
            } else {
              code.push("  if (value === \"" + spec + "\")\n  return null;");
            }
          });
          part.getInclude().forEach((spec) => {
            var pos;
            pos = -1;
            var nsDepth = 0;
            while ((pos = spec.indexOf('.', pos + 1)) > -1)
              nsDepth++;
            if ((pos = spec.indexOf('*')) > -1) {
              code.push("  if (value.startsWith(\"" + spec.substring(0, pos) + "\"))\n    return " + nsDepth + "; // " + spec);
            } else {
              code.push("  if (value === \"" + spec + "\")\n  return \"exact\";");
            }
          });
          code.push("  return null;");
          partData.match = new Function("value", code.join("\n"));
          partsByName[part.getName()] = partData;
          parts.push(partData);
        });
        bootPart = partsByName.boot;
        if (!bootPart)
          throw new Error(Console.decode("qx.tool.compiler.application.noBootPart")); 
      } else {
        bootPart = {
            name: "boot",
            include:[ "*" ],
            exclude: [],
            classes: [],
            dependsOn: {},
            combine: false,
            minify: false,
            match: function() { return true; }
        };
        partsByName.boot = bootPart;
        parts.push(bootPart);
      }
      
      function createClassData(classname) {
        if (classDataByClassname[classname]) {
          return classDataByClassname[classname];
        }
        var classData = classDataByClassname[classname] = {
            classname: classname,
            parts: {},
            best: null,
            actual: null
        };
        parts.forEach((part) => {
          if (part === bootPart)
            return;
          var result = part.match(classname);
          if (result !== null) {
            classData.parts[part.name] = result;
          
            var lastMatch = classData.best && classData.parts[classData.best.name];
            if (lastMatch === undefined || lastMatch === null)
              classData.best = part;
            
            // Exact
            else if (lastMatch === "exact") {
              if (result === "exact")
                Console.print("qx.tool.compiler.application.conflictingExactPart", classname, part.name, classData.best.name);
            
            // Wildcard
            } else {
              qx.core.Assert.assertTrue(typeof lastMatch == "number");
              if (result === "exact") {
                classData.best = part;
                classData.exact = true;
              } else {
                qx.core.Assert.assertTrue(typeof result == "number");
                if (lastMatch === result)
                  Console.print("qx.tool.compiler.application.conflictingBestPart", classname, part.name, classData.best.name);
                else if (lastMatch < result)
                  classData.best = part;
              }
            }
          }
        });
        return classData;
      }
      
      var needed = new qx.tool.compiler.utils.IndexedArray();
      var neededIndex = 0;
      var stack = new qx.tool.compiler.utils.IndexedArray();
      
      
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
       * So the theory is that deferred calls tend to be about initialisation, so prioritising constructor dependencies
       * may be helpful
       */
      
      /*
       * Recursively finds all the dependencies for a class which have not already been added
       * to the list of classes to load.
       * 
       *  @param classname {String}
       *  @param deps {String[]} array to modify
       */
      function compileAllRemainingDeps(classname, deps) {
        var checked = {};
        var depNames = { };
        depNames[classname] = true;
        
        function search(classname) {
          if (checked[classname])
            return;
          checked[classname] = true;

          var info = db.classInfo[classname];
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
        
        search(classname);
        for (var depName in depNames)
          deps.push(depName);
      }

      var addDepDepth = 0;
      function addDep(classname) {
        if (exclude[classname])
          return;
        if (allDeps.contains(classname) || stack.contains(classname))
          return;
        if (classname.match(/CrudRouter/) || classname.match(/Communicator/))
          debugger;

        var info = db.classInfo[classname];
        if (!info)
          return;
        if (info.fatalCompileError)
          fatalCompileErrors.push(classname);
        
        addDepDepth++;
        
        var deferDeps = [];
        if (info.dependsOn) {
          stack.push(classname);
          for (var depName in info.dependsOn) {
            var dd = info.dependsOn[depName];
            if (dd.load || dd.require) {
              addDep(depName);
            } else if (dd.defer) {
              deferDeps.push(depName);
            } else if (!allDeps.contains(depName))
              needed.push(depName);
          }
          stack.remove(classname);
        }

        if (parts && !allDeps.contains(classname)) {
          var classData = createClassData(classname);
          var part = classData.best||bootPart;
          part.classes.push(classname);
          classData.actual = part;
        }
        allDeps.push(classname);
        deferDeps.forEach(function(depName) {
          var deps = [];
          compileAllRemainingDeps(depName, deps);
          deps.forEach(addDep);
        });
        if (addDepDepth === 1) {
          while (neededIndex < needed.getLength()) {
            var classname = needed.getItem(neededIndex++);
            addDep(classname);
          }
        }
        addDepDepth--;
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
      /*
      parts.forEach((part) => {
        if (part !== bootPart) {
          t.__expandClassnames(part.include).forEach((name) => addDep(name));
        }
      });
      */
      
      while (neededIndex < needed.length) {
        var classname = needed[neededIndex++];
        addDep(classname);
      }
      
      if (parts && parts.length > 1) {
        // Calculate inter-part dependencies
        parts.forEach((part) => {
          var checked = {};
          function check(classname) {
            if (checked[classname])
              return;
            checked[classname] = true;
            var classData = classDataByClassname[classname];
            if (classData.actual !== part)
              part.dependsOn[classData.actual.name] = true;
            for (var depName in db.classInfo.dependsOn)
              check(depName);
          }
          part.classes.forEach(check);
          part.dependsOn = Object.keys(part.dependsOn);
        });
        
        // Check for recursive dependencies 
        parts.forEach((part) => {
          var checked = {};
          function check(partname) {
            if (checked[partname])
              return false;
            checked[partname] = true;
            var checkPart = partsByName[partname];
            if (checkPart === part)
              return true;
            return part.dependsOn.some(check);
          }
          if (part.dependsOn.some(check))
            Console.print("qx.tool.compiler.application.partRecursive", part.name);
        });
      }
      
      /*
       * Done
       */

      this.__loadDeps = allDeps.toArray();
      this.__partsDeps = parts;
      this.__fatalCompileErrors = fatalCompileErrors.length ? fatalCompileErrors : null;
    },
    
    /**
     * Gets a list of class names that this Application requires which have fatal compile errors
     * 
     * @return {String[]}
     */
    getFatalCompileErrors: function() {
      return this.__fatalCompileErrors;
    },

    /**
     * Gets a list of URIs for classes that are required, in load order
     * 
     * @returns {String[]}
     */
    getUris: function () {
      var uris = [];
      var loadDeps = this.__loadDeps;
      var db = this.getAnalyser().getDatabase();

      function add(classname) {
        var def = db.classInfo[classname];
        uris.push(def.libraryName + ":" + classname.replace(/\./g, "/") + ".js");
      }
      this.__loadDeps.forEach(add);

      return uris;
    },
    
    /**
     * Gets a list of classnames that are required, in load order
     * 
     * @returns {String[]}
     */
    getDependencies: function() {
      return this.__loadDeps;
    },
    
    /**
     * Gets the parts dependencies structures
     * 
     * @returns {Object[]}
     */
    getPartsDependencies: function() {
      return this.__partsDeps;
    },

    /**
     * Returns a list of all of the assets required by all classes
     * @param resManager {qx.tool.compiler.resources.Manager} the resource manager
     * @param environment {Map} environment
     */
    getAssetUris: function (resManager, environment) {
      var assets = [];
      var analyser = this.getAnalyser();
      var db = analyser.getDatabase();
      
      // Compile theme resource aliases
      var aliases = {};
      function getAliases(classname) {
        var tmp = db.classInfo[classname];
        if (tmp) {
          if (tmp.aliases) {
            for (var alias in tmp.aliases)
              aliases[alias] = tmp.aliases[alias];
          }
          if (tmp.extends)
            getAliases(tmp.extends);
        }
      }
      var themeInfo = db.classInfo[this.getTheme()];
      if (themeInfo && themeInfo.themeMeta) {
        for (var name in themeInfo.themeMeta)
          getAliases(themeInfo.themeMeta[name]);
      }
      
      // Get a list of libraries used
      var libraryLookup = {};

      // Check all the classes
      var classNames = this.__loadDeps.slice();
      for (var i = 0; i < classNames.length; i++) {
        var classname = classNames[i];
        if (classname.match(/qx.theme.simple.Image/))
          debugger;
        var classInfo = db.classInfo[classname];
        var tmp = classInfo.assets;
        if (tmp) {
          tmp.forEach(function(uri) {
            var pos = uri.indexOf('/');
            if (pos > -1) {
              var prefix = uri.substring(0, pos);
              var mappedPrefix = aliases[prefix];
              if (mappedPrefix)
                uri = mappedPrefix + uri.substring(pos);
            }
            var library = resManager.findLibraryForResource(uri);
            if (library)
              assets.push(library.getNamespace() + ":" + uri);
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
     * @returns {String[]}
     */
    getRequiredClasses: function() {
      var result = {};
      this.__classes.forEach((name) => result[name] = true);
      this.__expandClassnames(this.getInclude()).forEach((name) => result[name] = true);
      this.__expandClassnames(this.getExclude()).forEach((name) => delete result[name]);
      
      // We sort the result so that we can get a consistent ordering for loading classes, otherwise the order in
      //  which the filing system returns the files can cause classes to be loaded in a lightly different sequence;
      //  that would not cause a problem, except that the build is not 100% repeatable.
      return Object.keys(result).sort();
    },
    
    /**
     * Adds a part
     * @param part {Part} the part to add
     */
    addPart: function(part) {
      if (!this.__parts)
        this.__parts = [];
      this.__parts.push(part);
    },
    
    /**
     * Returns the parts, or null if there are none defined
     * @return {Part[]}
     */
    getParts: function() {
      return this.__parts || [];
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
     * Apply for `type` property
     */
    _applyType: function(value, oldValue) {
      var loader = path.join(__dirname, "loader-" + (value === "browser" ? "browser" : "server") + ".tmpl.js");
      this.setLoaderTemplate(loader);
      this.setTheme(null);
    },

    /**
     * Transforms values to make sure that they are an array (and never null)
     */
    __transformArray: function(value) {
      return value||[];
    }

  }
});

module.exports = qx.tool.compiler.app.Application;
