/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2016 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

var fs = require("fs");
var path = require("path");
var async = require('async');
var qx = require("qooxdoo");
var util = require("../util");
var babelCore = require("babel-core");

require("./ClassFile");
require("./Library");
require("./ResourceManager");

var log = util.createLog("analyser");

/**
 * Entry point for analysing source files; maintains a list of known libraries
 * (eg Qx app, contrib, Qx framework etc), known classes (and the files and
 * library in which the class is defined, and environment checks which have been
 * used (env checks imply a dependency).
 */
module.exports = qx.Class.define("qxcompiler.Analyser", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param dbFilename
   *          {String} the name of the database, defaults to "db.json"
   */
  construct: function (dbFilename) {
    this.base(arguments);

    this.__dbFilename = dbFilename || "db.json";
    this.__libraries = [];
    this.__initialClassesToScan = [];
    this.__locales = ["en"];
    this.__cldrs = {};
    this.__translations = {};
    this.__classFiles = {};
    this.__environmentChecks = {};
  },

  properties: {
    /** Output directory for the compiled application */
    outputDir: {
      nullable: true,
      check: "String"
    },

    /** Whether to preserve line numbers */
    trackLineNumbers: {
      check: "Boolean",
      init: false,
      nullable: false
    },

    /** Whether to process resources */
    processResources: {
      init: true,
      nullable: false,
      check: "Boolean"
    }
  },

  members: {
    __opened: false,
    __resManager: null,
    __dbFilename: null,
    __db: null,
    __libraries: null,
    __classes: null,
    __initialClassesToScan: null,
    __locales: null,
    __cldrs: null,
    __translations: null,

    __classFiles: null,
    __environmentChecks: null,
    __inDefer: false,
    __qooxdooVersion: null,

    open: function(cb) {
      var t = this;

      if (this.__opened)
        return cb();
      this.__opened = true;

      var resManager = null;
      if (this.isProcessResources()) {
        var m = this.__dbFilename.match(/(^.*)\/([^/]+)$/);
        var resDb;
        if (m && m.length == 3)
          resDb = m[1] + "/resource-db.json";
        else
          resDb = "resource-db.json";
        resManager = new qxcompiler.ResourceManager(resDb);
        this.__libraries.forEach(function (library) {
          resManager.addLibrary(library);
        });
      }
      this.__resManager = resManager;

      async.series([
          // Load the databases
          function (cb) {
            async.parallel([
              function (cb) {
                t.loadDatabase(cb);
              },

              function (cb) {
                log.debug("Loading resource database");
                if (resManager)
                  resManager.loadDatabase(cb);
                else
                  return cb(null);
              }], cb);
          },

          // Scan the files
          function (cb) {
            log.debug("Scanning source code");
            t.initialScan(cb);
          },

          // Save
          function (cb) {
            log.debug("Saving database");
            t.saveDatabase(cb);
          }
        ],
        cb);
    },

    /**
     * Scans the source files for javascript class and resource references and
     * calculates the dependency tree
     *
     * @param cb
     */
    initialScan: function (cb) {
      var t = this;
      if (!this.__db)
        this.__db = {};
      async.parallel(
          [
            // Load Resources
            function (cb) {
              if (!t.__resManager)
                return cb(null);

              t.__resManager.findAllResources(function (err) {
                if (err)
                  return cb(err);
                log.debug("found all resources");
                cb(null);
              });
            },

            // Find all classes
            function (cb) {
              async.each(t.__libraries, 
                  function(library, cb) {
                    library.scanForClasses(cb);
                  }, 
                  cb);
            }
          ],
          function (err) {
            log.debug("processed source and resources");
            cb(err);
          });
    },

    /**
     * Loads the database if available
     *
     * @param cb
     */
    loadDatabase: function(cb) {
      var t = this;
      async.waterfall(
          [
            /**
             * Reads the db.json, if it exists
             *
             * @param cb
             */
            function readDb(cb) {
              fs.exists(t.__dbFilename, function (exists) {
                if (exists)
                  fs.readFile(t.__dbFilename, {encoding: "utf-8"}, cb);
                else
                  cb(null, null);
              });
            },

            /**
             * Parses the db.json into db
             *
             * @param data
             * @param cb
             */
            function parseDb(data, cb) {
              if (data && data.trim().length) {
                log.debug("Parsing database");
                t.__db = JSON.parse(data);
              } else {
                log.debug("No database to parse");
                t.__db = {};
              }
              cb(null, t.__db);
            }
          ],

          /**
           * Done
           * @param err
           * @param result
           */
          function (err, result) {
            log.debug("loaded database: err=" + err);
            cb();
          });
    },

    /**
     * Saves the database
     *
     * @param cb
     */
    saveDatabase: function (cb) {
      var t = this;
      log.debug("saving generator database");
      fs.writeFile(this.__dbFilename, JSON.stringify(t.__db, null, 2), function (err) {
        if (err)
          return cb(err);
        if (t.__resManager)
          t.__resManager.saveDatabase(cb);
        else
          cb(null);
      });
    },

    /**
     * Returns the loaded database
     *
     * @returns
     */
    getDatabase: function () {
      return this.__db;
    },

    /**
     * Parses all the source files recursively until all classes and all
     * dependent classes are loaded
     *
     * @param cb
     */
    analyseClasses: function (cb) {
      var t = this;
      if (!this.__db)
        this.__db = {};
      var db = this.__db;

      var classIndex = 0;
      var classes = t.__classes = t.__initialClassesToScan.slice();

      function getConstructDependencies(className) {
        var deps = [];
        var info = t.__db.classInfo[className];
        if (info.dependsOn) {
          for (var depName in info.dependsOn) {
            if (info.dependsOn[depName].construct)
              deps.push(depName);
          }
        }
        return deps;
      }

      function getIndirectLoadDependencies(className) {
        var deps = [];
        var info = t.__db.classInfo[className];
        if (info.dependsOn) {
          for (var depName in info.dependsOn) {
            if (info.dependsOn[depName].load) {
              getConstructDependencies(depName).forEach(function(className) {
                deps.push(className);
              });
            }
          }
        }
        return deps;
      }

      async.whilst(
          function() {
            return classIndex < classes.length;
          },
          function(cb) {
            t.getClassInfo(classes[classIndex++], cb);
          },
          function(err) {
            if (err)
              return cb && cb(err);
            classes.forEach(function(className) {
              var info = t.__db.classInfo[className];
              var deps = getIndirectLoadDependencies(className);
              deps.forEach(function(depName) {
                if (!info.dependsOn)
                  info.dependsOn = {};
                if (!info.dependsOn[depName])
                  info.dependsOn[depName] = {};
                info.dependsOn[depName].load = true;
              });
            });
            return cb && cb(err);
          }
      )
    },

    /**
     * Called when a reference to a class is made
     * @param className
     * @private
     */
    _addRequiredClass: function(className) {
      var t = this;

      // __classes will be null if analyseClasses has not formally been called; this would be if the
      //  analyser is only called externally for getClass()
      if (!t.__classes)
        t.__classes = [];

      // Add it
      if (t.__classes.indexOf(className) == -1)
        t.__classes.push(className);
    },

    /**
     * Returns the full list of required classes
     * @returns {null}
     */
    getDependentClasses: function() {
      return this.__classes;
    },

    /**
     * Loads a class
     * @param className {String} the name of the class
     * @param cb(err, DbClassInfo)
     */
    getClassInfo: function(className, cb) {
      var t = this;
      if (!this.__db)
        this.__db = {};
      var db = this.__db;

      if (!db.classInfo)
        db.classInfo = {};

      var library = t.getLibraryFromClassname(className);
      var sourceClassFilename = qxcompiler.ClassFile.getSourcePath(library, className);
      var outputClassFilename = qxcompiler.ClassFile.getOutputPath(this, className);
      var dbClassInfo = db.classInfo[className];

      // Detect whether we need to rescan the file
      fs.stat(sourceClassFilename, function (err, stat) {
        if (err)
          return cb && cb(err);

        fs.exists(outputClassFilename, function(exists) {
          if (!exists)
            return scanFile(stat);
          fs.stat(outputClassFilename, function (err, outputStat) {
            if (err)
              return cb && cb(err);

            if (dbClassInfo) {
              var dbMtime = null;
              try {
                dbMtime = dbClassInfo.mtime && new Date(dbClassInfo.mtime);
              } catch (e) {
              }
              if (dbMtime && dbMtime.getTime() == stat.mtime.getTime()) {
                if (outputStat.mtime.getTime() >= stat.mtime.getTime()) {
                  var deps = dbClassInfo.dependsOn;
                  for (var depName in deps)
                    t._addRequiredClass(depName);
                  return cb && cb(null, dbClassInfo);
                }
              }
            }

            scanFile(stat);
          });
        })
      });

      function scanFile(stat) {
        // Add database entry
        dbClassInfo = db.classInfo[className] = {
          mtime: stat.mtime,
          libraryName: library.getNamespace()
        };

        // Analyse it and collect unresolved symbols and dependencies
        var classDef = new qxcompiler.ClassFile(t, className, library);
        classDef.load(function (err) {
          if (err)
            return cb && cb(err);

          // Collect the dependencies on other classes
          var deps = classDef.getRequiredClasses();
          for (var name in deps) {
            if (!deps[name].ignore)
              t._addRequiredClass(name);
          }

          // Save it
          classDef.writeDbInfo(dbClassInfo);

          // Next!
          return cb && cb(null, dbClassInfo);
        });
      }
    },

    /**
     * Returns the CLDR data for a given locale
     * @param locale {String} the locale string
     * @param cb(err, cldr)
     * @returns {*}
     */
    getCldr: function(locale, cb) {
      var t = this;
      var cldr = this.__cldrs[locale];
      if (cldr)
        return cb(null, cldr);
      qxcompiler.Cldr.loadCLDR(t.getQooxdooPath(), locale, function (err, cldr) {
        if (err)
          return cb && cb(err);
        t.__cldrs[locale] = cldr;
        cb && cb(null, cldr);
      });
    },

    /**
     * Gets the translation for the locale and library, caching teh result.
     * @param library
     * @param locale
     * @param cb
     * @returns {*}
     */
    getTranslation: function(library, locale, cb) {
      var t = this;
      var id = locale + ":" + library.getNamespace();
      var translation = t.__translations[id];
      if (!translation)
        translation = t.__translations[id] = new qxcompiler.Translation(library, locale);
      translation.checkRead(function(err) {
        cb(err, translation);
      });
    },

    /**
     * Updates all translations to include all msgids found in code
     * @param the library to update
     * @param locales
     * @param cb
     */
    updateTranslations: function(library, locales, cb) {
      var t = this;

      async.each(locales, function(locale, cb) {
        var translation = new qxcompiler.Translation(library, locale);
        translation.read(function(err) {
          if (err)
            return cb && cb(err);

          t.__classes.forEach(function(classname) {
            if (!classname.startsWith(library.getNamespace()))
              return;
            t.getClassInfo(classname, function(err, dbClassInfo) {
              if (dbClassInfo.messageIds) {
                dbClassInfo.messageIds.forEach(function(src) {
                  var entry = translation.getOrCreateEntry(src.msgid);
                  if (src.msgid_plural)
                    entry.msgid_plural = src.msgid_plural;
                  if (src.comment)
                    entry.comment = src.comment;
                  if (qx.lang.Type.isArray(src.lineNo)) {
                    var reference = "";
                    src.lineNo.forEach(function(lineNo) {
                      if (reference)
                        reference += ", ";
                      reference += classname + ":" + lineNo;
                    });
                    entry.comments.reference = reference;
                  } else
                    entry.comments.reference = classname + ":" + lineNo;
                });
              }
            });
          });
          translation.write(cb);
        });
      }, cb);
    },

    /**
     * Returns the path to the qooxdoo library
     *
     * @returns
     */
    getQooxdooPath: function () {
      for (var i = 0; i < this.__libraries.length; i++) {
        var library = this.__libraries[i];
        if (library.getNamespace() == "qx")
          return library.getRootDir();
      }
      return null;
    },

    /**
     * Finds the library with a name(space)
     */
    findLibrary: function (name) {
      for (var i = 0; i < this.__libraries.length; i++)
        if (this.__libraries[i].getNamespace() == name)
          return this.__libraries[i];
      return null;
    },

    /**
     * Returns all libraries
     * @returns {null}
     */
    getLibraries: function() {
      return this.__libraries;
    },

    /**
     * Adds a library definition
     *
     * @param library
     */
    addLibrary: function (library) {
      this.__libraries.push(library);
    },

    /**
     * Adds a required class to be analysed by analyseClasses()
     *
     * @param classname
     */
    addClass: function (classname) {
      if (this.__initialClassesToScan.indexOf(classname) < 0)
        this.__initialClassesToScan.push(classname);
    },

    /**
     * Removes a class from the list of required classes to analyse
     * @param className
     */
    removeClass: function(className) {
      qx.lang.Array.remove(this.__initialClassesToScan, className);
    },

    /**
     * Adds a required Locale
     *
     * @param locale
     */
    addLocale: function (locale) {
      if (this.__locales.indexOf(locale) < 0)
       this.__locales.push(locale);
    },

    /**
     * Returns the list of locale IDs
     */
    getLocales: function () {
      return this.__locales;
    },

    /**
     * Detects the symbol type, ie class, package, member, etc
     * @param name
     * @param cb
     * @returns {*}
     */
    getSymbolType: function(name, cb) {
      var t = this;
      if (name.indexOf('.') > -1) {
        var library = t.getLibraryFromClassname(name);
        if (library)
          return library.getSymbolType(name, cb);
      }
      cb(null, null);
    },

    /**
     * Detects the class that a symbol belongs to
     * @param name
     * @param cb
     * @returns {*}
     */
    getSymbolClass: function(name, cb) {
      var t = this;
      if (name.indexOf('.') > -1) {
        var library = t.getLibraryFromClassname(name);
        if (library)
          return library.getSymbolClass(name, cb);
      }
      cb(null, null);
    },

    /**
     * Returns the library for a given classname, supports private files
     * @param className
     * @returns {*}
     */
    getLibraryFromClassname: function(className) {
      var t = this;
      var info = this.__classFiles[className];
      if (info)
        return info.library;
      var segs = className.split('.');
      var str = "";
      for (var i = 0; i < segs.length; i++) {
        if (i > 0)
          str += ".";
        str += segs[i];
        var library = findLibrary(str);
        if (library) {
          this.__classFiles[className] = { library: library };
          return library;
        }
      }

      function findLibrary(className) {
        for (var j = 0; j < t.__libraries.length; j++) {
          var library = t.__libraries[j];
          if (library.getNamespace() == className || library.hasFoundSymbol(className))
            return library;
        }
        return null;
      }

      return null;
    },

    /**
     * Returns the classname
     * @param className
     * @returns {string}
     */
    getClassFilename: function(className) {
      var library = this.getLibraryFromClassname(className);
      if (!library)
        return null;
      var path = library.getRootDir() + "/" + library.getSourcePath() + "/" + className.replace(/\./g, '/') + ".js";
      return path;
    },

    /**
     * Sets an environment value as being checked for
     *
     * @param key
     * @param value
     */
    setEnvironmentCheck: function (key, value) {
      if (typeof key == "object") {
        var map = key;
        for (key in map)
          this.__environmentChecks[key] = map[key];
      } else if (value === undefined)
        delete this.__environmentChecks[key];
      else
        this.__environmentChecks[key] = value;
    },

    /**
     * Tests whether an environment value is checked for
     *
     * @param key
     * @returns
     */
    getEnvironmentCheck: function (key) {
      return this.__environmentChecks[key];
    },

    /**
     * Returns the resource manager
     */
    getResourceManager: function () {
      return this.__resManager;
    },

    /**
     * Returns the version of Qooxdoo
     * @returns {String}
     */
    getQooxdooVersion: function() {
      if (this.__qooxdooVersion)
        return this.__qooxdooVersion;
      var data = fs.readFileSync(this.getQooxdooPath() + "/../version.txt", { encoding: "utf-8" });
      if (data)
        this.__qooxdooVersion = data.match(/^([^\s]+)/)[0]||null;
      return this.__qooxdooVersion;
    },

    /**
     * Returns the database filename
     * @returns {null}
     */
    getDbFilename: function() {
      return this.__dbFilename;
    }
  }
});
