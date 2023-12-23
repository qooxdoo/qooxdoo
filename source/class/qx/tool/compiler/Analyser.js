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

/* eslint no-nested-ternary: 0 */
/* eslint no-inner-declarations: 0 */

var fs = require("fs");
const path = require("path");
var async = require("async");

var hash = require("object-hash");

const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

var log = qx.tool.utils.LogManager.createLog("analyser");

/**
 * Entry point for analysing source files; maintains a list of known libraries
 * (eg a qooxdoo application, packages, qooxdoo framework etc.), known classes
 * (and the files and library in which the class is defined, and environment
 * checks which have been used (env checks imply a dependency).
 */
qx.Class.define("qx.tool.compiler.Analyser", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param dbFilename
   *          {String} the name of the database, defaults to "db.json"
   */
  construct(dbFilename) {
    super();

    this.__dbFilename = dbFilename || "db.json";
    this.__libraries = [];
    this.__librariesByNamespace = {};
    this.__initialClassesToScan = new qx.tool.utils.IndexedArray();
    this.__cldrs = {};
    this.__translations = {};
    this.__classFiles = {};
    this.__environmentChecks = {};
    this.__fonts = {};
  },

  properties: {
    /** Output directory for the compiled application */
    outputDir: {
      nullable: true,
      check: "String"
    },

    /** Directory for proxy source files, if they are to be used */
    proxySourcePath: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** Supported application types */
    applicationTypes: {
      init: ["node", "browser"],
      check: "Array"
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
    },

    /** Whether to add `$$createdAt` to new objects */
    addCreatedAt: {
      init: false,
      nullable: false,
      check: "Boolean"
    },

    /** Environment during compile time */
    environment: {
      init: null,
      check: "Map",
      apply: "_applyEnvironment"
    },

    /** configuration of babel */
    babelConfig: {
      init: null,
      nullable: true,
      check: "Object"
    },

    /** list of global ignores */
    ignores: {
      init: [],
      nullable: false,
      check: "Array"
    },

    /** list of global symbols */
    globalSymbols: {
      init: [],
      nullable: false,
      check: "Array"
    },

    /** Whether and how to mangle private identifiers */
    manglePrivates: {
      init: "readable",
      check: ["off", "readable", "unreadable"]
    },

    /** Whether to write line numbers to .po files */
    writePoLineNumbers: {
      init: false,
      check: "Boolean"
    }
  },

  events: {
    /**
     * Fired when a class is about to be compiled; data is a map:
     *
     * dbClassInfo: {Object} the newly populated class info
     * oldDbClassInfo: {Object} the previous populated class info
     * classFile - {ClassFile} the qx.tool.compiler.ClassFile instance
     */
    compilingClass: "qx.event.type.Data",

    /**
     * Fired when a class is compiled; data is a map:
     * dbClassInfo: {Object} the newly populated class info
     * oldDbClassInfo: {Object} the previous populated class info
     * classFile - {ClassFile} the qx.tool.compiler.ClassFile instance
     */
    compiledClass: "qx.event.type.Data",

    /**
     * Fired when a class is already compiled (but needed for compilation); data is a map:
     * className: {String}
     * dbClassInfo: {Object} the newly populated class info
     */
    alreadyCompiledClass: "qx.event.type.Data",

    /**
     * Fired when the database is been saved
     * database: {Object} the database to save
     */
    saveDatabase: "qx.event.type.Data"
  },

  members: {
    __opened: false,
    __resManager: null,
    __dbFilename: null,
    __db: null,

    /** {Library[]} All libraries */
    __libraries: null,

    /** {Map{String,Library}} Lookup of libraries, indexed by namespace */
    __librariesByNamespace: null,

    __classes: null,
    __initialClassesToScan: null,
    __cldrs: null,
    __translations: null,

    /** @type{qx.tool.compiler.app.ManifestFont[]} list of fonts in provides.fonts */
    __fonts: null,

    __classFiles: null,
    __environmentChecks: null,
    __inDefer: false,
    __qooxdooVersion: null,
    __environmentHash: null,

    /**
     * Opens the analyser, loads database etc
     *
     * @async
     */
    open() {
      var p;
      if (!this.__opened) {
        this.__opened = true;

        var resManager = null;
        if (this.isProcessResources()) {
          resManager = new qx.tool.compiler.resources.Manager(this);
        }
        this.__resManager = resManager;
        p = Promise.all([
          this.loadDatabase(),
          resManager && resManager.loadDatabase()
        ]);
      } else {
        p = Promise.resolve();
      }

      return p;
    },

    /**
     * Scans the source files for javascript class and resource references and
     * calculates the dependency tree
     *
     * @param cb
     */
    initialScan(cb) {
      var t = this;

      if (!this.__db) {
        this.__db = {};
      }

      log.debug("Scanning source code");
      async.parallel(
        [
          // Load Resources
          function (cb) {
            if (!t.__resManager) {
              cb(null);
              return;
            }

            t.__resManager
              .findAllResources()
              .then(() => cb())
              .catch(cb);
          },

          // Find all classes
          function (cb) {
            async.each(
              t.__libraries,
              function (library, cb) {
                library.scanForClasses(err => {
                  log.debug("Finished scanning for " + library.getNamespace());
                  cb(err);
                });
              },
              err => {
                log.debug("Finished scanning for all libraries");
                cb(err);
              }
            );
          }
        ],

        function (err) {
          log.debug("processed source and resources");
          cb(err);
        }
      );
    },

    /**
     * Loads the database if available
     */
    async loadDatabase() {
      this.__db =
        (await qx.tool.utils.Json.loadJsonAsync(this.getDbFilename())) || {};
    },

    /**
     * Resets the database
     *
     * @return {Promise}
     */
    resetDatabase() {
      this.__db = null;

      if (this.__resManager) {
        this.__resManager.dispose();
        this.__resManager = null;
      }

      this.__opened = false;
      return this.open();
    },

    /**
     * Saves the database
     */
    async saveDatabase() {
      log.debug("saving generator database");
      await this.fireDataEventAsync("saveDatabase", this.__db);
      await qx.tool.utils.Json.saveJsonAsync(
        this.getDbFilename(),
        this.__db
      ).then(() => this.__resManager && this.__resManager.saveDatabase());
    },

    /**
     * Returns the loaded database
     *
     * @returns
     */
    getDatabase() {
      return this.__db;
    },

    /**
     * Parses all the source files recursively until all classes and all
     * dependent classes are loaded
     */
    async analyseClasses() {
      var t = this;
      if (!this.__db) {
        this.__db = {};
      }
      var db = this.__db;
      var metaWrittenLog = {};

      var compiledClasses = {};
      var metaFixupDescendants = {};
      var listenerId = this.addListener("compiledClass", function (evt) {
        var data = evt.getData();
        if (data.oldDbClassInfo) {
          if (data.oldDbClassInfo.extends) {
            metaFixupDescendants[data.oldDbClassInfo.extends] = true;
          }
          if (data.oldDbClassInfo.implement) {
            data.oldDbClassInfo.implement.forEach(
              name => (metaFixupDescendants[name] = true)
            );
          }
          if (data.oldDbClassInfo.include) {
            data.oldDbClassInfo.include.forEach(
              name => (metaFixupDescendants[name] = true)
            );
          }
        }

        if (data.dbClassInfo.extends) {
          metaFixupDescendants[data.dbClassInfo.extends] = true;
        }
        if (data.dbClassInfo.implement) {
          data.dbClassInfo.implement.forEach(
            name => (metaFixupDescendants[name] = true)
          );
        }
        if (data.dbClassInfo.include) {
          data.dbClassInfo.include.forEach(
            name => (metaFixupDescendants[name] = true)
          );
        }

        compiledClasses[data.classFile.getClassName()] = data;
      });

      // Note that it is important to pre-load the classes in all libraries - this is because
      //  Babel plugins MUST be synchronous (ie cannot afford an async lookup of files on disk
      //  in mid parse)
      await qx.tool.utils.Promisify.map(this.__libraries, async library =>
        qx.tool.utils.Promisify.call(cb => library.scanForClasses(cb))
      );

      var classes = (t.__classes = t.__initialClassesToScan.toArray());

      function getConstructDependencies(className) {
        var deps = [];
        var info = t.__db.classInfo[className];
        if (info.dependsOn) {
          for (var depName in info.dependsOn) {
            if (info.dependsOn[depName].construct) {
              deps.push(depName);
            }
          }
        }
        return deps;
      }

      function getIndirectLoadDependencies(className) {
        var deps = [];
        var info = t.__db.classInfo[className];
        if (info && info.dependsOn) {
          for (var depName in info.dependsOn) {
            if (info.dependsOn[depName].load) {
              getConstructDependencies(depName).forEach(function (className) {
                deps.push(className);
              });
            }
          }
        }
        return deps;
      }

      for (var classIndex = 0; classIndex < classes.length; classIndex++) {
        try {
          let dbClassInfo = await qx.tool.utils.Promisify.call(cb =>
            t.getClassInfo(classes[classIndex], cb)
          );

          if (dbClassInfo) {
            var deps = dbClassInfo.dependsOn;
            for (var depName in deps) {
              t._addRequiredClass(depName);
            }
          }
        } catch (err) {
          if (err.code === "ENOCLASSFILE") {
            qx.tool.compiler.Console.error(err.message);
          } else {
            throw err;
          }
        }
      }

      classes.forEach(function (className) {
        var info = t.__db.classInfo[className];
        var deps = getIndirectLoadDependencies(className);
        deps.forEach(function (depName) {
          if (!info.dependsOn) {
            info.dependsOn = {};
          }
          if (!info.dependsOn[depName]) {
            info.dependsOn[depName] = {};
          }
          info.dependsOn[depName].load = true;
        });
      });
      t.removeListenerById(listenerId);
    },

    /**
     * Called when a reference to a class is made
     * @param className
     * @private
     */
    _addRequiredClass(className) {
      let t = this;

      // __classes will be null if analyseClasses has not formally been called; this would be if the
      //  analyser is only called externally for getClass()
      if (!t.__classes) {
        t.__classes = [];
      }

      // Add it
      if (t.__classes.indexOf(className) == -1) {
        t.__classes.push(className);
      }
    },

    /**
     * Returns the full list of required classes
     * @returns {null}
     */
    getDependentClasses() {
      return this.__classes;
    },

    /**
     * Returns cached class info - returns null if not loaded or not in the database
     * @returb DbClassInfo
     */
    getCachedClassInfo(className) {
      return this.__db ? this.__db.classInfo[className] : null;
    },

    /**
     * Loads a class
     * @param className {String} the name of the class
     * @param forceScan {Boolean?} true if the class is to be compiled whether it needs it or not (default false)
     * @param cb {Function} (err, DbClassInfo)
     */
    getClassInfo(className, forceScan, cb) {
      var t = this;
      if (!this.__db) {
        this.__db = {};
      }
      var db = this.__db;

      if (typeof forceScan == "function") {
        cb = forceScan;
        forceScan = false;
      }

      if (!db.classInfo) {
        db.classInfo = {};
      }

      var library = t.getLibraryFromClassname(className);
      if (!library) {
        let err = new Error("Cannot find class file " + className);
        err.code = "ENOCLASSFILE";
        cb && cb(err);
        return;
      }

      var sourceClassFilename = this.getClassSourcePath(library, className);

      var outputClassFilename = this.getClassOutputPath(className);

      const scanFile = async () => {
        let sourceStat = await qx.tool.utils.files.Utils.safeStat(
          sourceClassFilename
        );

        if (!sourceStat) {
          throw new Error("Cannot find " + sourceClassFilename);
        }

        var dbClassInfo = db.classInfo[className];
        if (
          !dbClassInfo ||
          (!forceScan && dbClassInfo.filename != sourceClassFilename)
        ) {
          forceScan = true;
        }

        if (!forceScan) {
          let outputStat = await qx.tool.utils.files.Utils.safeStat(
            outputClassFilename
          );

          if (dbClassInfo && outputStat) {
            var dbMtime = null;
            try {
              dbMtime = dbClassInfo.mtime && new Date(dbClassInfo.mtime);
            } catch (e) {}
            if (dbMtime && dbMtime.getTime() == sourceStat.mtime.getTime()) {
              if (outputStat.mtime.getTime() >= sourceStat.mtime.getTime()) {
                await t.fireDataEventAsync("alreadyCompiledClass", {
                  className: className,
                  dbClassInfo: dbClassInfo
                });

                return dbClassInfo;
              }
            }
          }
        }

        // Add database entry
        var oldDbClassInfo = db.classInfo[className]
          ? Object.assign({}, db.classInfo[className])
          : null;
        dbClassInfo = db.classInfo[className] = {
          mtime: sourceStat.mtime,
          libraryName: library.getNamespace(),
          filename: sourceClassFilename
        };

        // Analyse it and collect unresolved symbols and dependencies
        var classFile = new qx.tool.compiler.ClassFile(t, className, library);
        await t.fireDataEventAsync("compilingClass", {
          dbClassInfo: dbClassInfo,
          oldDbClassInfo: oldDbClassInfo,
          classFile: classFile
        });

        await qx.tool.utils.Promisify.call(cb => classFile.load(cb));

        // Save it
        classFile.writeDbInfo(dbClassInfo);
        await t.fireDataEventAsync("compiledClass", {
          dbClassInfo: dbClassInfo,
          oldDbClassInfo: oldDbClassInfo,
          classFile: classFile
        });

        // Next!
        return dbClassInfo;
      };

      qx.tool.utils.Promisify.callback(scanFile(), cb);
    },

    /**
     * Returns the absolute path to the class file
     *
     * @param library  {qx.tool.compiler.app.Library}
     * @param className {String}
     * @returns {String}
     */
    getClassSourcePath(library, className) {
      let filename =
        className.replace(/\./g, path.sep) +
        library.getSourceFileExtension(className);
      if (this.getProxySourcePath()) {
        let test = path.join(this.getProxySourcePath(), filename);
        if (fs.existsSync(test)) {
          return path.resolve(test);
        }
      }

      return path.join(
        library.getRootDir(),
        library.getSourcePath(),
        className.replace(/\./g, path.sep) +
          library.getSourceFileExtension(className)
      );
    },

    /**
     * Returns the path to the rewritten class file
     *
     * @param className {String}
     * @returns {String}
     */
    getClassOutputPath(className) {
      var filename = path.join(
        this.getOutputDir(),
        "transpiled",
        className.replace(/\./g, path.sep) + ".js"
      );

      return filename;
    },

    /**
     * Returns the CLDR data for a given locale
     * @param locale {String} the locale string
     * @returns Promise({cldr})
     */
    async getCldr(locale) {
      var t = this;
      var cldr = this.__cldrs[locale];
      if (cldr) {
        return cldr;
      }
      return qx.tool.compiler.app.Cldr.loadCLDR(locale).then(
        cldr => (t.__cldrs[locale] = cldr)
      );
    },

    /**
     * Gets the translation for the locale and library, caching the result.
     * @param library
     * @param locale
     * @returns {translation}
     */
    async getTranslation(library, locale) {
      var t = this;
      var id = locale + ":" + library.getNamespace();
      var translation = t.__translations[id];
      if (!translation) {
        translation = t.__translations[id] =
          new qx.tool.compiler.app.Translation(library, locale);
        translation.setWriteLineNumbers(this.isWritePoLineNumbers());
        await translation.checkRead();
      }
      return translation;
    },

    /**
     * Updates all translations to include all msgids found in code
     * @param appLibrary {qx.tool.compiler.app.Library} the library to update
     * @param locales {String[]} locales
     * @param libraries {qx.tool.compiler.app.Library[]} all libraries
     * @param copyAllMsgs {Boolean} whether to copy everything, or just those that are required
     */
    async updateTranslations(appLibrary, locales, libraries, copyAllMsgs) {
      if (!libraries) {
        libraries = [];
      }
      libraries = libraries.filter(lib => lib != appLibrary);

      await qx.Promise.all(
        locales.map(async locale => {
          let libTranslations = {};
          await qx.Promise.all(
            libraries.map(async lib => {
              var translation = new qx.tool.compiler.app.Translation(
                lib,
                locale
              );

              await translation.read();
              libTranslations[lib.toHashCode()] = translation;
            })
          );

          var translation = new qx.tool.compiler.app.Translation(
            appLibrary,
            locale
          );

          translation.setWriteLineNumbers(this.isWritePoLineNumbers());
          await translation.read();

          let unusedEntries = {};
          for (let msgid in translation.getEntries()) {
            unusedEntries[msgid] = true;
          }

          await qx.Promise.all(
            this.__classes.map(async classname => {
              let isAppClass = appLibrary.isClass(classname);
              let classLibrary =
                (!isAppClass &&
                  libraries.find(lib => lib.isClass(classname))) ||
                null;
              if (!isAppClass && !classLibrary) {
                return;
              }

              let dbClassInfo = await qx.tool.utils.Promisify.call(cb =>
                this.getClassInfo(classname, cb)
              );

              if (!dbClassInfo.translations) {
                return;
              }

              function isEmpty(entry) {
                if (!entry) {
                  return true;
                }
                if (qx.lang.Type.isArray(entry.msgstr)) {
                  return entry.msgstr.every(value => !value);
                }
                return !entry.msgstr;
              }

              dbClassInfo.translations.forEach(function (src) {
                delete unusedEntries[src.msgid];

                if (classLibrary) {
                  let entry = translation.getEntry(src.msgid);
                  if (!isEmpty(entry)) {
                    return;
                  }
                  let libTranslation =
                    libTranslations[classLibrary.toHashCode()];
                  let libEntry = libTranslation.getEntry(src.msgid);
                  if (isEmpty(libEntry) || copyAllMsgs) {
                    if (!entry) {
                      entry = translation.getOrCreateEntry(src.msgid);
                    }
                    if (libEntry !== null) {
                      Object.assign(entry, libEntry);
                    }
                  }
                  return;
                }

                let entry = translation.getOrCreateEntry(src.msgid);
                if (src.msgid_plural) {
                  entry.msgid_plural = src.msgid_plural;
                }
                if (!entry.comments) {
                  entry.comments = {};
                }
                entry.comments.extracted = src.comment;
                entry.comments.reference = {};
                let ref = entry.comments.reference;
                const fileName = classname.replace(/\./g, "/") + ".js";
                const fnAddReference = lineNo => {
                  let arr = ref[fileName];
                  if (!arr) {
                    arr = ref[fileName] = [];
                  }

                  if (!arr.includes(src.lineNo)) {
                    arr.push(lineNo);
                  }
                };
                if (qx.lang.Type.isArray(src.lineNo)) {
                  src.lineNo.forEach(fnAddReference);
                } else {
                  fnAddReference(src.lineNo);
                }
              });
            })
          );

          Object.keys(unusedEntries).forEach(msgid => {
            var entry = translation.getEntry(msgid);
            if (entry) {
              if (!entry.comments) {
                entry.comments = {};
              }
              if (
                Object.keys(entry.comments).length == 0 &&
                entry.msgstr === ""
              ) {
                translation.deleteEntry(msgid);
              } else {
                entry.comments.extracted = "NO LONGER USED";
                entry.comments.reference = {};
              }
            }
          });

          await translation.write();
        })
      );
    },

    /**
     * Returns the path to the qooxdoo library
     *
     * @returns
     */
    getQooxdooPath() {
      var lib = this.findLibrary("qx");
      if (lib !== null) {
        return lib.getRootDir();
      }
      return null;
    },

    /**
     * Finds the library with a name(space)
     */
    findLibrary(name) {
      var lib = this.__librariesByNamespace[name];
      return lib;
    },

    /**
     * Returns all libraries
     * @returns {null}
     */
    getLibraries() {
      return this.__libraries;
    },

    /**
     * Adds a library definition
     *
     * @param library
     */
    addLibrary(library) {
      this.__libraries.push(library);
      this.__librariesByNamespace[library.getNamespace()] = library;
    },

    /**
     * Returns a font by name
     *
     * @param {String} name
     * @param {Boolean?} create whether to create the font if it does not exist (default is false)
     * @returns {qx.tool.app.ManifestFont?} null if it does not exist and `create` is falsey
     */
    getFont(name, create) {
      let font = this.__fonts[name] || null;
      if (!font && create) {
        font = this.__fonts[name] = new qx.tool.compiler.app.ManifestFont(name);
      }
      return font;
    },

    /**
     * Detects whether the filename is one of the fonts
     *
     * @param {String} filename
     * @returns {Boolean} whether the filename is a font asset
     */
    isFontAsset(filename) {
      let isFont = false;
      if (filename.endsWith("svg")) {
        for (let fontName in this.__fonts) {
          let font = this.__fonts[fontName];
          let sources = font.getSources() || [];
          isFont = sources.find(source => source == filename);
        }
      }
      return isFont;
    },
    /**
     * Returns the map of all fonts, indexed by name
     *
     * @returns {Map<String,qx.tool.app.ManifestFont>}
     */
    getFonts() {
      return this.__fonts;
    },

    /**
     * Adds a required class to be analysed by analyseClasses()
     *
     * @param classname
     */
    addClass(classname) {
      this.__initialClassesToScan.push(classname);
    },

    /**
     * Removes a class from the list of required classes to analyse
     * @param classname {String}
     */
    removeClass(classname) {
      this.__initialClassesToScan.remove(classname);
    },

    /**
     * Detects the symbol type, ie class, package, member, etc
     * @param name
     * @returns {{symbolType,name,className}?}
     */
    getSymbolType(name) {
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
    getLibraryFromClassname(className) {
      var t = this;
      var info = this.__classFiles[className];
      if (info) {
        return info.library;
      }

      for (var j = 0; j < t.__libraries.length; j++) {
        var library = t.__libraries[j];
        info = library.getSymbolType(className);
        if (
          info &&
          (info.symbolType == "class" || info.symbolType == "member")
        ) {
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
    getClassFilename(className) {
      var library = this.getLibraryFromClassname(className);
      if (!library) {
        return null;
      }
      var path =
        library.getRootDir() +
        "/" +
        library.getSourcePath() +
        "/" +
        className.replace(/\./g, "/") +
        ".js";
      return path;
    },

    /**
     * Sets an environment value as being checked for
     *
     * @param key
     * @param value
     */
    setEnvironmentCheck(key, value) {
      if (typeof key == "object") {
        var map = key;
        for (key in map) {
          this.__environmentChecks[key] = map[key];
        }
      } else if (value === undefined) {
        delete this.__environmentChecks[key];
      } else {
        this.__environmentChecks[key] = value;
      }
    },

    /**
     * Tests whether an environment value is checked for
     *
     * @param key
     * @returns
     */
    getEnvironmentCheck(key) {
      return this.__environmentChecks[key];
    },

    /**
     * Returns the resource manager
     */
    getResourceManager() {
      return this.__resManager;
    },

    /**
     * Returns the version of Qooxdoo
     * @returns {String}
     */
    getQooxdooVersion() {
      if (this.__qooxdooVersion) {
        return this.__qooxdooVersion;
      }
      if (!this.__qooxdooVersion) {
        let lib = this.findLibrary("qx");
        if (lib) {
          this.__qooxdooVersion = lib.getVersion();
        }
      }
      return this.__qooxdooVersion;
    },

    /**
     * Returns the database filename
     * @returns {null}
     */
    getDbFilename() {
      return this.__dbFilename;
    },

    /**
     * Returns the resource database filename
     * @returns {null}
     */
    getResDbFilename() {
      var m = this.__dbFilename.match(/(^.*)\/([^/]+)$/);
      var resDb;
      if (m && m.length == 3) {
        resDb = m[1] + "/resource-db.json";
      } else {
        resDb = "resource-db.json";
      }
      return resDb;
    },

    // property apply
    _applyEnvironment(value) {
      // Cache the hash because we will need it later
      this.__environmentHash = hash(value);
    },

    /**
     * Whether the compilation context has changed since last analysis
     * e.g. compiler version, environment variables
     *
     * @return {Boolean}
     */
    isContextChanged() {
      var db = this.getDatabase();

      // Check if environment is the same as the last time
      // If the environment hash is null, environment variables have
      // not been loaded yet. In that case don't consider the environment
      // changed
      if (
        this.__environmentHash &&
        this.__environmentHash !== db.environmentHash
      ) {
        return true;
      }

      // then check if compiler version is the same
      if (db.compilerVersion !== qx.tool.config.Utils.getCompilerVersion()) {
        return true;
      }

      return false;
    },

    /**
     * Sets the environment data in the __db.
     * The data beeing set are:
     *  * a hash of the current environment values
     *  * the compiler version
     *  * a list of the libraries used
     *
     */
    updateEnvironmentData() {
      const libraries = this.getLibraries().reduce((acc, library) => {
        acc[library.getNamespace()] = library.getVersion();
        return acc;
      }, {});

      const db = this.getDatabase();

      db.libraries = libraries;
      db.environmentHash = this.__environmentHash;
      db.compilerVersion = qx.tool.config.Utils.getCompilerVersion();
    }
  }
});
