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
var path = require("path");
var async = require('async');
var qx = require("qooxdoo");
var util = require("../util");
var babelCore = require("babel-core");
var jsonlint = require("jsonlint");

require("./ClassFile");
require("./app/Library");
require("./resources/Manager");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

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
    this.__libraryLookup = {};
    this.__initialClassesToScan = new qxcompiler.utils.IndexedArray();
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

  events: {
    /** Fired when a class is compiled; data is the the qxcompiler.ClassFile instance */
    "classCompiled": "qx.event.type.Data"
  },

  members: {
    __opened: false,
    __resManager: null,
    __dbFilename: null,
    __db: null,
    __libraries: null,
    __libraryLookup: null,
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
        resManager = new qxcompiler.resources.Manager(resDb);
        this.__libraries.forEach(function (library) {
          resManager.addLibrary(library);
        });
      }
      this.__resManager = resManager;

      Promise.all(
          [ 
            util.promisifyThis(t.loadDatabase, t),
            new Promise((resolve, reject) => {
              if (resManager) {
                log.debug("Loading resource database");
                return util.promisifyThis(resManager.loadDatabase, resManager)
                  .then(resolve)
                  .catch(reject);
              }
              resolve();
            })
          ])
        .then(() => {
          log.debug("Scanning source code");
          return util.promisifyThis(t.initialScan, t);
        })
        .then(() => {
          log.debug("Saving database");
          return util.promisifyThis(t.saveDatabase, t);
        })
        .then(() => cb())
        .catch((err) => cb(err));
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
                    library.scanForClasses((err) => {
                      log.debug("Finished scanning for " + library.getNamespace());
                      cb(err);
                    });
                  },
                  (err) => {
                    log.debug("Finished scanning for all libraries");
                    cb(err);
                  });
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
                t.__db = jsonlint.parse(data);
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
      var metaWrittenLog = {};
      
      var compiledClasses = {};
      var metaFixupDescendants = {};
      var listenerId = this.addListener("classCompiled", function(evt) {
        var data = evt.getData();
        if (data.oldDbClassInfo) {
          if (data.oldDbClassInfo.extends)
            metaFixupDescendants[data.oldDbClassInfo.extends] = true;
          if (data.oldDbClassInfo.implement)
            data.oldDbClassInfo.implement.forEach((name) => metaFixupDescendants[name] = true);
          if (data.oldDbClassInfo.include)
            data.oldDbClassInfo.include.forEach((name) => metaFixupDescendants[name] = true);
        }
        
        if (data.dbClassInfo.extends)
          metaFixupDescendants[data.dbClassInfo.extends] = true;
        if (data.dbClassInfo.implement)
          data.dbClassInfo.implement.forEach((name) => metaFixupDescendants[name] = true);
        if (data.dbClassInfo.include)
          data.dbClassInfo.include.forEach((name) => metaFixupDescendants[name] = true);

        compiledClasses[data.classFile.getClassName()] = data;
      });
      
      // Note that it is important to pre-load the classes in all libraries - this is because
      //  Babel plugins MUST be synchronous (ie cannot afford an async lookup of files on disk
      //  in mid parse)
      async.each(this.__libraries, function(library, cb) {
        library.scanForClasses(cb);
        
      }, function() {
        var classIndex = 0;
        var classes = t.__classes = t.__initialClassesToScan.toArray();

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
            /* While */
            function() {
              return classIndex < classes.length;
            },
            /* Do */
            function(cb) {
              t.getClassInfo(classes[classIndex++], cb);
            },
            /* Done */
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
              t.removeListenerById(listenerId);
              analyzeMeta()
                .then(() => cb())
                .catch((err) => cb(err));
            }
        );
      });
      
      async function fixupMetaData(classname, meta) {
        function fixupEntry(obj) {
          if (obj && obj.jsdoc)
            qxcompiler.jsdoc.Parser.parseJsDoc(obj.jsdoc, classname, t);
        }
        function fixupSection(sectionName) {
          var section = meta[sectionName];
          if (section) {
            for (var name in section)
              fixupEntry(section[name]);
          }
        }

        fixupSection("properties");
        fixupSection("events");
        fixupSection("members");
        fixupSection("statics");
        fixupEntry(meta.clazz);
        fixupEntry(meta.construct);
        fixupEntry(meta.destruct);
        fixupEntry(meta.defer);
      }

      async function updateMetaData(classname, meta) {

        var classEntities = {
            members: {},
            properties: {}
        };
        
        async function analyseClassEntities() {
          
          async function visit(meta, first) {
            if (typeof meta == "string")
              meta = await loadMetaData(meta);
            if (!meta)
              return null;
            
            [ "members", "properties" ].forEach((entityTypeName) => {
              if (!meta[entityTypeName])
                return;
              
              for (var entityName in meta[entityTypeName]) {
                var entityMeta = meta[entityTypeName][entityName];
                if (entityMeta.type === "function" || entityTypeName === "properties") {
                  var entityInfo = classEntities[entityTypeName][entityName];
                  if (!entityInfo) {
                    entityInfo = classEntities[entityTypeName][entityName] = {
                      appearsIn: {},
                      overriddenFrom: null,
                      jsdoc: null,
                      abstract: meta.type === "interface",
                      mixin: meta.type === "mixin",
                      inherited: !first,
                      access: entityName.startsWith("__") ? "private" : entityName.startsWith("_") ? "protected" : "public"
                    };
                  }
                  if (meta.type === "mixin" && entityInfo.abstract)
                    entityInfo.mixin = true;
                  if (meta.type !== "interface")
                    entityInfo.abstract = false;
                  else
                    entityInfo["interface"] = true;

                  if (!first)
                    entityInfo.appearsIn[meta.className] = meta.type;
                  if (!first && !entityInfo.overriddenFrom)
                    entityInfo.overriddenFrom = meta.className;
                  
                  if (!entityInfo.jsdoc && hasSignature(entityMeta.jsdoc))
                    entityInfo.jsdoc = entityMeta.jsdoc;
                }
              }
            });
            
            if (meta.interfaces) {
              for (var i = 0; i < meta.interfaces.length; i++)
                await visit(meta.interfaces[i]);
            }
            if (meta.mixins) {
              for (var i = 0; i < meta.mixins.length; i++)
                await visit(meta.mixins[i]);
            }
            if (meta.superClass) 
              await visit(meta.superClass);
            
            if (meta.properties) {
              function addPropertyAccessor(propertyMeta, methodName, accessorType, returnType, valueType) {
                var entityInfo = classEntities.members[methodName];
                if (!entityInfo || entityInfo.abstract) {
                  var newInfo = classEntities.members[methodName] = {
                      appearsIn: entityInfo ? entityInfo.appearsIn : {},
                      overriddenFrom: (entityInfo && entityInfo.appearsIn[0]) || null,
                      jsdoc: {},
                      property: accessorType,
                      inherited: !first,
                      mixin: propertyMeta.mixin,
                      access: "public"
                    };
                  if (returnType) {
                    newInfo.jsdoc["@return"] = [
                        {
                          "name": "@return",
                          "type": returnType,
                          "desc": "Returns the value for " + propertyMeta.name
                        }
                      ];
                  }
                  if (valueType) {
                    newInfo.jsdoc["@param"] = [
                      {
                        "name": "@param",
                        "type": valueType,
                        "paramName": "value",
                        "desc": "Value for " + propertyMeta.name
                      }
                    ];
                  }
                }
              }
              for (var propertyName in meta.properties) {
                var propertyMeta = meta.properties[propertyName];
                var upname = qx.lang.String.firstUp(propertyName);
                var type = propertyMeta.check || "any";
                addPropertyAccessor(propertyName, "get" + upname, "get", type, null);
                if (type == "Boolean")
                  addPropertyAccessor(propertyName, "is" + upname, "is", type, null);
                addPropertyAccessor(propertyName, "set" + upname, "set", null, type);
                addPropertyAccessor(propertyName, "reset" + upname, "reset", null, null);
                if (propertyMeta.async) {
                  addPropertyAccessor(propertyName, "get" + upname + "Async", "getAsync", "Promise", null);
                  if (type == "Boolean")
                    addPropertyAccessor(propertyName, "is" + upname + "Async", "isAsync", "Promise", null);
                  addPropertyAccessor(propertyName, "set" + upname + "Async", "setAsync", "Promise", type);
                }
              }
            }
            
          }
          
          await visit(meta, true);
        }
        
        function hasSignature(jsdoc) {
          return jsdoc &&
            ((jsdoc["@param"] && jsdoc["@param"].length) || 
            (jsdoc["@return"] && jsdoc["@return"].length));
        }
        
        function mergeSignature(src, meta) {
          if (!src)
            return;
          // src has nothing?  ignore it.  meta already has a signature?  preserve it
          if (!hasSignature(src) || hasSignature(meta.jsdoc))
            return;
          if (!meta.jsdoc)
            meta.jsdoc = {};
          if (src["@param"])
            meta.jsdoc["@param"] = qx.lang.Array.clone(src["@param"]);
          if (src["@return"])
            meta.jsdoc["@return"] = qx.lang.Array.clone(src["@return"]);
        }

        await analyseClassEntities();
        
        if (meta.properties) {
          for (var propertyName in meta.properties) {
            var propertyMeta = meta.properties[propertyName];
            if (propertyMeta.refine) {
              var result = classEntities.properties[propertyName];
              if (result) {
                propertyMeta.overriddenFrom = result.overriddenFrom;
                propertyMeta.appearsIn = result.appearsIn;
                mergeSignature(result.jsdoc, propertyMeta);
              }
            }
          }
          
          for (var propertyName in classEntities.properties) {
            var propertyInfo = classEntities.properties[propertyName];
            if ((propertyInfo.abstract || propertyInfo.mixin) && !meta.properties[propertyInfo]) {
              var propertyMeta = meta.properties[propertyName] = {
                  type: "property",
                  name: propertyName,
                  abstract: !!propertyInfo.abstract,
                  mixin: !!propertyInfo.mixin,
                  access: propertyInfo.access,
                  overriddenFrom: propertyInfo.overriddenFrom
                };
              if (propertyInfo.appearsIn.length)
                propertyMeta.appearsIn = Object.keys(propertyInfo.appearsIn);
              if(propertyMeta.appearsIn && !propertyMeta.appearsIn.length)
                delete propertyMeta.appearsIn;
              if (propertyInfo.jsdoc)
                propertyMeta.jsdoc = propertyInfo.jsdoc;
              if (propertyInfo.overriddenFrom)
                propertyMeta.overriddenFrom = propertyInfo.overriddenFrom;
              if (!propertyMeta.overriddenFrom)
                delete propertyMeta.overriddenFrom;
              if (meta.type != "interface")
                meta.abstract = true;
            }
          }
        }
        
        if (!meta.members)
          meta.members = {};
        for (var memberName in meta.members) {
          var memberMeta = meta.members[memberName];
          if (memberMeta.type === "function") {
            var result = classEntities.members[memberName];
            if (result) {
              memberMeta.overriddenFrom = result.overriddenFrom;
              memberMeta.appearsIn = Object.keys(result.appearsIn);
              mergeSignature(result.jsdoc, memberMeta);
            }
          }
        }
        for (var memberName in classEntities.members) {
          var memberInfo = classEntities.members[memberName];
          var memberMeta = meta.members[memberName];
          if (memberMeta && memberMeta.type === "variable" && memberInfo)
            memberMeta.type = "function";
          if ((memberInfo.abstract || memberInfo.mixin || memberInfo.property) && !memberMeta) {
            var memberMeta = meta.members[memberName] = {
                type: "function",
                name: memberName,
                abstract: !!memberInfo.abstract,
                mixin: !!memberInfo.mixin,
                inherited: !!memberInfo.inherited,
                access: memberInfo.access,
                overriddenFrom: memberInfo.overriddenFrom
              };
            if (memberInfo.property)
              memberMeta.property = memberInfo.property;
            if (memberInfo.appearsIn.length)
              memberMeta.appearsIn = Object.keys(memberInfo.appearsIn);
            if (memberInfo.jsdoc)
              memberMeta.jsdoc = memberInfo.jsdoc;
            if (memberInfo.overriddenFrom)
              memberMeta.overriddenFrom = memberInfo.overriddenFrom;
            meta.abstract = true;
          }
        }
        for (var memberName in meta.members) {
          var memberMeta = meta.members[memberName];
          if(memberMeta.appearsIn && !memberMeta.appearsIn.length)
            delete memberMeta.appearsIn;
          if (!memberMeta.overriddenFrom)
            delete memberMeta.overriddenFrom;
        }
        if (Object.keys(meta.members).length == 0)
          delete meta.members;
      }
      
      var cachedMeta = {};
      
      async function saveMetaData(classname, meta) {
        if (metaWrittenLog[classname]) {
          console.log(" *** ERRROR *** Writing " + classname + " more than once");
          throw new Error(" *** ERRROR *** Writing " + classname + " more than once");
        }
        metaWrittenLog[classname] = true;
        var filename = qxcompiler.ClassFile.getOutputPath(t, classname) + "on";
        return writeFile(filename, JSON.stringify(meta, null, 2), {encoding: "utf-8"});
      }
      
      async function loadMetaData(classname) {
        if (classname == "Object" || classname == "Array" || classname == "Error")
          return Promise.resolve(null);
        if (cachedMeta[classname])
          return Promise.resolve(cachedMeta[classname]);
        var filename = qxcompiler.ClassFile.getOutputPath(t, classname) + "on";
        return readFile(filename, {encoding: "utf-8"})
          .then((str) => jsonlint.parse(str))
          .then((meta) => cachedMeta[classname] = meta)
          .catch((err) => {
            console.error("Failed to load meta for " + classname + ": " + err);
          });
      }
      
      function calcDescendants(classname, meta) {
        meta.descendants = [];
        for (var name in db.classInfo) {
          var tmp = db.classInfo[name];
          if (tmp.extends == classname)
            meta.descendants.push(name);
        }
      }
      
      async function analyzeMeta() {
        var toSave = {};
        for (var classname in compiledClasses) {
          var meta = cachedMeta[classname] = compiledClasses[classname].classFile.getMeta();
          fixupMetaData(classname, meta);
        }
        
        for (var classname in compiledClasses) {
          var data = compiledClasses[classname];
          var meta = cachedMeta[classname];
          await updateMetaData(classname, meta);
          calcDescendants(classname, meta);
          toSave[classname] = meta;
        }
        
        var p = Promise.resolve();
        for (var classname in metaFixupDescendants) {
          if (!compiledClasses[classname] && db.classInfo[classname]) {
            p = p.then(() => {
              return loadMetaData(classname)
                .then((meta) => {
                  if (meta) {
                    calcDescendants(classname, meta);
                    toSave[classname] = meta;
                  }
                })
            });
          }
        }

        return p.then(() => Promise.all(Object.keys(toSave).map((classname) => saveMetaData(classname, toSave[classname]))));
      }
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
     * Returns cached class info - returns null if not loaded or not in the database
     * @returb DbClassInfo
     */
    getCachedClassInfo: function(className) {
      return this.__db ? this.__db.classInfo[className] : null;
    },

    /**
     * Loads a class
     * @param className {String} the name of the class
     * @param forceScan {Boolean?} true if the class is to be compiled whether it needs it or not (default false)
     * @param cb(err, DbClassInfo)
     */
    getClassInfo: function(className, forceScan, cb) {
      var t = this;
      if (!this.__db)
        this.__db = {};
      var db = this.__db;
      
      if (typeof forceScan == "function") {
        cb = forceScan;
        forceScan = false;
      }

      if (!db.classInfo)
        db.classInfo = {};

      var library = t.getLibraryFromClassname(className);
      if (!library)
        return cb && cb(new Error("Cannot find class file " + className));
      var sourceClassFilename = qxcompiler.ClassFile.getSourcePath(library, className);
      var outputClassFilename = qxcompiler.ClassFile.getOutputPath(this, className);
      var dbClassInfo = db.classInfo[className];
      
      // Detect whether we need to rescan the file
      fs.stat(sourceClassFilename, function (err, stat) {
        if (err)
          return cb && cb(err);

        fs.exists(outputClassFilename, function(exists) {
          if (!exists || forceScan)
            return scanFile(stat);
          fs.exists(outputClassFilename + "on", function(exists) {
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
          });
        })
      });

      function scanFile(stat) {
        // Add database entry
        var oldDbClassInfo = db.classInfo[className] ? Object.assign({}, db.classInfo[className]) : null;
        dbClassInfo = db.classInfo[className] = {
          mtime: stat.mtime,
          libraryName: library.getNamespace()
        };

        // Analyse it and collect unresolved symbols and dependencies
        var classFile = new qxcompiler.ClassFile(t, className, library);
        classFile.load(function (err) {
          if (err)
            return cb && cb(err);

          // Collect the dependencies on other classes
          var deps = classFile.getRequiredClasses();
          for (var name in deps) {
            if (!deps[name].ignore)
              t._addRequiredClass(name);
          }

          // Save it
          classFile.writeDbInfo(dbClassInfo);

          t.fireDataEvent("classCompiled", { dbClassInfo: dbClassInfo, oldDbClassInfo: oldDbClassInfo, classFile: classFile });

          // Next!
          return cb && cb(null, dbClassInfo);
        });
      }
    },

    /**
     * Returns the CLDR data for a given locale
     * @param locale {String} the locale string
     * @returns Promise({cldr})
     */
    getCldr: async function(locale) {
      var t = this;
      var cldr = this.__cldrs[locale];
      if (cldr)
        return cldr;
      return qxcompiler.app.Cldr.loadCLDR(t.getQooxdooPath(), locale)
        .then((cldr) => {
          return t.__cldrs[locale] = cldr;
        });
    },

    /**
     * Gets the translation for the locale and library, caching teh result.
     * @param library
     * @param locale
     * @returns {Promise(translation)}
     */
    getTranslation: async function(library, locale) {
      var t = this;
      var id = locale + ":" + library.getNamespace();
      var translation = t.__translations[id];
      if (!translation) {
        translation = t.__translations[id] = new qxcompiler.app.Translation(library, locale);
        return translation.checkRead().then(() => translation);
      } else
        return translation;
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
        var translation = new qxcompiler.app.Translation(library, locale);
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
      var lib = this.findLibrary("qx");
      if (lib != null)
        return lib.getRootDir();
      return null;
    },

    /**
     * Finds the library with a name(space)
     */
    findLibrary: function (name) {
      var lib = this.__libraryLookup[name];
      return lib;
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
      this.__libraryLookup[library.getNamespace()] = library;
    },

    /**
     * Adds a required class to be analysed by analyseClasses()
     *
     * @param classname
     */
    addClass: function (classname) {
      this.__initialClassesToScan.push(classname);
    },

    /**
     * Removes a class from the list of required classes to analyse
     * @param className
     */
    removeClass: function(classname) {
      this.__initialClassesToScan.remove(classname);
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
     * @returns {{symbolType,name,clasName?}}
     */
    getSymbolType: function(name) {
      var t = this;
      for (var j = 0; j < t.__libraries.length; j++) {
        var library = t.__libraries[j];
        var info = library.getSymbolType(name);
        if (info) {
          return info;
        }
      }
      return null;
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
      
      for (var j = 0; j < t.__libraries.length; j++) {
        var library = t.__libraries[j];
        var info = library.getSymbolType(className);
        if (info && (info.symbolType == "class" || info.symbolType == "member")) {
          return library;
        }
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
