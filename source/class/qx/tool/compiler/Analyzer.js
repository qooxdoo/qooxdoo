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

var hash = require("object-hash");

var log = qx.tool.utils.LogManager.createLog("analyzer");

/**
 * Entry point for analyzing source files; maintains a list of known libraries
 * (eg a qooxdoo application, packages, qooxdoo framework etc.), known classes
 * (and the files and library in which the class is defined, and environment
 * checks which have been used (env checks imply a dependency).
 *
 * In practice, each instance of an Analyzer is used specific to a given target; this
 * is not necessarily true, because you could in theory have multiple Makers (each of
 * which is definitely for a specific target and set of applications), which share an
 * Analyzer.  Whether that has any actual use is debatable, and is not supported by the
 * CLI and compile.json.
 */
qx.Class.define("qx.tool.compiler.Analyzer", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param dbFilename
   *          {String} the name of the database, defaults to "db.json"
   */
  construct(dbFilename, maker) {
    super();

    this.__dbFilename = dbFilename || "db.json";
    this.__maker = maker;
    this.__libraries = [];
    this.__librariesByNamespace = {};
    this.__initialClassesToScan = new qx.tool.utils.IndexedArray();
    this.__locales = {};
    this.__translations = {};
    this.__classFiles = {};
    this.__environmentChecks = {};
    this.__fonts = {};
    this.__cachedClassInfo = {};
    this.__classFileConfig = null;
  },

  properties: {
    /** Output directory for the compiled application */
    outputDir: {
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

    /** Whether to add verbose tracking to `$$createdAt`. Has no effect if `addCreatedAt=false` */
    verboseCreatedAt: {
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

    /** configuration of browserify */
    browserifyConfig: {
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
     * Fired when a class is compiled; data is a map:
     * dbClassInfo: {Object} the newly populated class info
     * oldDbClassInfo: {Object} the previous populated class info
     * classFile - {ClassFile} the qx.tool.compiler.ClassFile instance
     */
    compiledClass: "qx.event.type.Data",

    /**
     * Fired when the database is been saved
     * database: {Object} the database to save
     */
    saveDatabase: "qx.event.type.Data"
  },

  members: {
    /** @type{qx.tool.compiler.Maker} */
    __maker: null,

    /** @type{qx.tool.compiler.Compiler} */
    __compiler: null,

    __opened: false,
    __resManager: null,
    __dbFilename: null,
    __db: null,

    /**
     * Key is class name, value is DbClassInfo
     * @type {Object<string, qx.tool.compiler.Compiler.DbClassInfo>}
     */
    __cachedClassInfo: null,

    /** @type {Library[]} All libraries */
    __libraries: null,

    /** @type {Map<String,Library>} Lookup of libraries, indexed by namespace */
    __librariesByNamespace: null,

    /**
     * @type {String[]}
     */
    __classes: null,

    /**
     * @type {qx.tool.utils.IndexedArray}
     */
    __initialClassesToScan: null,
    __locales: null,
    __translations: null,

    /** @type{qx.tool.compiler.app.ManifestFont[]} list of fonts in provides.fonts */
    __fonts: null,

    __classFiles: null,
    __environmentChecks: null,
    __inDefer: false,
    __qooxdooVersion: null,
    __environmentHash: null,
    __classFileConfig: null,

    /**
     *
     * @returns {qx.tool.compiler.ClassFileConfig}
     */
    getClassFileConfig() {
      if (!this.__classFileConfig) {
        this.__classFileConfig = qx.tool.compiler.ClassFileConfig.createFromAnalyzer(this);
      }
      return this.__classFileConfig;
    },

    /**
     * Opens the analyzer, loads database etc
     *
     * @async
     */
    async open() {
      if (!this.__opened) {
        this.__opened = true;

        await this.loadDatabase();
      }
    },

    /**
     * Returns a prefix that is unique to a particular class,
     * used for mangling privates.
     *
     * @param {string} classname
     * @returns {string}
     */
    getManglePrefix(classname) {
      let db = this.__db;
      if (!db.manglePrefixes) {
        db.manglePrefixes = {
          nextPrefix: 1,
          classPrefixes: {}
        };
      }

      let prefixes = db.manglePrefixes;
      let prefix = prefixes.classPrefixes[classname];
      if (!prefix) {
        prefix = "__P_" + ++prefixes.nextPrefix + "_";
        prefixes.classPrefixes[classname] = prefix;
      }
      return prefix;
    },

    /**
     * Scans the source files for javascript class and resource references and
     * calculates the dependency tree
     *
     * @param cb
     */
    async initialScan() {
      if (!this.__db) {
        this.__db = {};
      }
    },

    /**
     * Loads the database if available
     */
    async loadDatabase() {
      this.__db = (await qx.tool.utils.Json.loadJsonAsync(this.getDbFilename())) || {};
    },

    /**
     * Resets the database
     *
     * @return {Promise}
     */
    resetDatabase() {
      this.__db = null;
      this.__opened = false;
      return this.open();
    },

    /**
     * Saves the database
     */
    async saveDatabase() {
      log.debug("saving generator database");
      if (this.__cachedClassInfo) {
        this.__db.classInfo = {};
        for (let classname in this.__cachedClassInfo) {
          let info = this.__cachedClassInfo[classname];
          if (info !== null) {
            this.__db.classInfo[classname] = info;
          }
        }
      }
      await qx.tool.utils.Json.saveJsonAsync(this.getDbFilename(), this.__db);
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
     * Returns the DbClassInfo for a given classname, this is only valid after `analyzeClasses()` has been called
     *
     * @param {String} classname
     * @returns {qx.tool.compiler.Compiler.DbClassInfo} the DbClassInfo for the given classname, or null if not found
     */
    getDbClassInfo(classname) {
      return this.__cachedClassInfo[classname] || null;
    },

    /**
     * The list of all classnames compiled by `analyzeClasses()`
     * Note: 08-01-2026: this filters out classes that failed to compile
     *
     * @returns {String[]} a list of all classnames
     */
    getCompiledClassnames() {
      return Object.keys(this.__cachedClassInfo).filter(classname => {
        let info = this.__cachedClassInfo[classname];
        return info !== null && !info?.fatalCompileError;
      });
    },

    /**
     * This does a fast (and incomplete) analysis of the classes and their dependencies
     * to determine the minimal set of classes that must be compiled.  The list of classes
     * is taken from the meta data, but the meta data does not (and cannot) provide a complete
     * list because it does not read the code inside methods.  The full set of dependencies
     * can only be determined by compiling the classes, but this method allows the compiler to
     * get started with multiple threads and then
     */
    getInitialDependentClasses() {
      let metaDb = this.__compiler.getMetaDb();
      let classes = [];
      let classesByClassname = {};

      const requireClass = classname => {
        if (classesByClassname[classname]) {
          return;
        }
        classesByClassname[classname] = true;
        classes.push(classname);
      };

      let stackDepth = 0;
      const addType = str => {
        if (qx.lang.Type.isArray(str)) {
          str.forEach(addType);
          return;
        }
        if (!str || typeof str != "string") {
          return;
        }
        stackDepth++;
        if (stackDepth > 100) {
          throw new Error("Maximum stack depth exceeded");
        }
        try {
          let pos = str.indexOf("|");
          if (pos != -1) {
            let parts = str.split("|");
            parts.forEach(addType);
            return;
          }
          pos = str.indexOf("<");
          if (pos == -1) {
            requireClass(str);
            return;
          }
          let base = str.substring(0, pos);
          let lastPos = str.lastIndexOf(">");
          let generic = str.substring(pos + 1, lastPos < 0 ? str.length : lastPos);
          requireClass(base);
          addType(generic);
        } finally {
          stackDepth--;
        }
      };

      const scanMethods = methods => {
        for (let memberName in methods) {
          let member = methods[memberName];
          if (member.params) {
            for (let param of member.params) {
              if (param.type) {
                addType(param.type);
              }
            }
          }
          if (member.returnType && member.returnType.type) {
            addType(member.returnType.type);
          }
          if (member.jsdoc && member.jsdoc["@type"]) {
            let str = member.jsdoc["@type"];
            let pos = str.indexOf("{");
            let endPos = str.indexOf("}");
            if (pos != -1 && endPos != -1 && endPos > pos) {
              let typeStr = str.substring(pos + 1, endPos);
              addType(typeStr);
            }
          }
        }
      };

      // List of classes to compile; this will extend as we analyze
      for (let classname of this.__initialClassesToScan.toArray()) {
        requireClass(classname);
      }

      for (let i = 0; i < classes.length; i++) {
        let classMeta = metaDb.getClassMeta(classes[i]);
        if (!classMeta) {
          qx.lang.Array.removeAt(classes, i--);
          continue;
        }
        let meta = classMeta.getMetaData();
        if (meta.superClass) {
          requireClass(meta.superClass);
        }
        if (meta.interfaces) {
          for (let iface of meta.interfaces) {
            requireClass(iface);
          }
        }
        if (meta.mixins) {
          for (let mixin of meta.mixins) {
            requireClass(mixin);
          }
        }
        if (meta.members) {
          scanMethods(meta.members);
        }
        if (meta.statics) {
          scanMethods(meta.statics);
        }
        if (meta.uses) {
          for (let use of meta.uses) {
            requireClass(use);
          }
        }
      }

      return classes;
    },

    /**
     * Parses all the source files recursively until all classes and all
     * dependent classes are loaded
     */
    async analyzeClasses() {
      this.__db ??= {};

      // Bootstrap the list of classes to compile with the initial set of classes, and then
      let initialDependentClasses = this.getInitialDependentClasses();
      for (let classname of initialDependentClasses) {
        this.__compiler.compileClass(this, classname);
      }

      // Cache of compiled classes info
      this.__cachedClassInfo = {};

      /**
       * @param {String} classname
       * @return {Promise<qx.tool.compiler.Compiler.DbClassInfo>}
       * @param {Boolean} sync Forces to return synchronously. Class must have been compiled already.
       * Compiles a class and caches it
       */
      const compileClass = (classname, sync) => {
        let value = this.__cachedClassInfo[classname];
        if (value === undefined) {
          value = this.__compiler.compileClass(this, classname).then(v => (this.__cachedClassInfo[classname] = v));
          this.__cachedClassInfo[classname] = value;
        }
        if (qx.core.Environment.get("qx.debug")) {
          if (sync && value instanceof Promise) {
            throw new Error(`Class ${classname} has not been compiled yet`);
          }
        }
        return value;
      };

      // List of classes to compile; this will extend as we analyze
      this.__classes = this.__initialClassesToScan.toArray();

      /**
       * Checks the constructor dependencies of a class
       * @param {String} classname
       */
      const getConstructDependencies = async classname => {
        var deps = [];
        var info = await compileClass(classname);
        if (info.dependsOn) {
          for (var depName in info.dependsOn) {
            if (info.dependsOn[depName].construct) {
              deps.push(depName);
            }
          }
        }
        return deps;
      };

      /**
       * Gets the indirect load dependencies of a class
       * @param {String} classname
       */
      const getIndirectLoadDependencies = async classname => {
        var deps = [];
        let info = compileClass(classname, true);
        if (info && info.dependsOn) {
          for (var depName in info.dependsOn) {
            if (info.dependsOn[depName].load) {
              let constructDeps = await getConstructDependencies(depName);
              for (let constructDep of constructDeps) {
                deps.push(constructDep);
              }
            }
          }
        }
        return deps;
      };

      /**
       * @type {Object<string, Promise>}
       * Classes currently being processed
       */
      let processingClasses = {};

      /**
       * Compiles a class and ensures its dependencies are processed as well.
       *
       * This function is faster and more efficient than the previous implementation because
       * as soon as a class is compiled, its begins to process its dependencies straight away.
       * Previously, we compiled classes in batches, so we've had to wait for the entire batch to finish
       * before starting the next.
       * @param {string} classname
       */
      const processClass = async classname => {
        let dbClassInfo = await compileClass(classname);
        if (!dbClassInfo) {
          return; //This means class failed to compile. Assume the error has already been handled.
        }
        if (dbClassInfo?.dependsOn) {
          Object.keys(dbClassInfo.dependsOn).forEach(depName => ensureProcessed(depName));
        }
        let dependsOnClassnames = await getIndirectLoadDependencies(classname);
        for (let dependsOnClassname of dependsOnClassnames) {
          dbClassInfo.dependsOn ??= {};
          dbClassInfo.dependsOn[dependsOnClassname] ??= {};
          dbClassInfo.dependsOn[dependsOnClassname].load = true;
        }
        await Promise.all(dependsOnClassnames.map(cn => compileClass(cn)));
      };

      /**
       * Ensures a class is processed if it's not already
       * @param {string} classname
       */
      const ensureProcessed = classname => {
        if (processingClasses[classname] === undefined) {
          this.__classes.push(classname);
          processingClasses[classname] = processClass(classname);
        }
      };

      this.__initialClassesToScan.toArray().forEach(cn => ensureProcessed(cn));

      //Wait until all classes are processed
      //All the classes are already compiling
      //This just waits until they are done
      for (var classIndex = 0; classIndex < this.__classes.length; classIndex++) {
        let classname = this.__classes[classIndex];
        if (qx.core.Environment.get("qx.debug")) {
          this.assertNotUndefined(processingClasses[classname], `Internal error: class ${classname} is not being processed`);
        }
        //We have to await them in series.
        //We can't use Promise.all because this.__classes grows as we compile
        await processingClasses[classname];
      }
    },

    /**
     * Returns the full list of required classes
     * @returns {string[]}
     */
    getDependentClasses() {
      return this.__classes;
    },

    /**
     * Returns the locale data for a given locale
     * @param locale {String} the locale string
     * @returns Promise({options})
     */
    async getLocale(locale) {
      var options = this.__locales[locale];
      if (options) {
        return options;
      }
      this.__locales[locale] = {};
      return options;
    },

    /**
     * Gets the translation for the locale and library, caching the result.
     * @param library
     * @param locale
     * @returns {qx.tool.compiler.app.Translation}
     */
    async getTranslation(library, locale) {
      var t = this;
      var id = locale + ":" + library.getNamespace();
      var translation = t.__translations[id];
      if (!translation) {
        translation = t.__translations[id] = new qx.tool.compiler.app.Translation(library, locale);
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
              var translation = new qx.tool.compiler.app.Translation(lib, locale);

              await translation.read();
              libTranslations[lib.toHashCode()] = translation;
            })
          );

          var translation = new qx.tool.compiler.app.Translation(appLibrary, locale);

          translation.setWriteLineNumbers(this.isWritePoLineNumbers());
          await translation.read();

          let unusedEntries = {};
          for (let msgid in translation.getEntries()) {
            unusedEntries[msgid] = true;
          }

          for (let classname of this.__classes) {
            let isAppClass = appLibrary.isClass(classname);
            let classLibrary = (!isAppClass && libraries.find(lib => lib.isClass(classname))) || null;
            if (!isAppClass && !classLibrary) {
              continue;
            }

            let dbClassInfo = this.__cachedClassInfo[classname];
            if (!dbClassInfo) {
              throw new Error(`Class ${classname} not found in cache by Analyzer.updateTranslations`);
            }

            if (!dbClassInfo.translations) {
              continue;
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
                let libTranslation = libTranslations[classLibrary.toHashCode()];
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
          }

          Object.keys(unusedEntries).forEach(msgid => {
            var entry = translation.getEntry(msgid);
            if (entry) {
              if (!entry.comments) {
                entry.comments = {};
              }
              if (Object.keys(entry.comments).length == 0 && entry.msgstr === "") {
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
      const existingLibrary = this.__librariesByNamespace[library.getNamespace()];
      if (existingLibrary) {
        throw new Error(
          "Multiple libraries with namespace " +
            library.getNamespace() +
            " found " +
            library.getRootDir() +
            " and " +
            existingLibrary.getRootDir()
        );
      }
      this.__libraries.push(library);
      this.__librariesByNamespace[library.getNamespace()] = library;
    },

    /**
     * Returns a font by name
     *
     * @param {String} name
     * @param {Boolean?} create whether to create the font if it does not exist (default is false)
     * @returns {qx.tool.compiler.app.ManifestFont?} null if it does not exist and `create` is falsey
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
     * @returns {Map<String, qx.tool.compiler.app.ManifestFont>}
     */
    getFonts() {
      return this.__fonts;
    },

    /**
     * Adds a required class to be analyzed by analyzeClasses()
     *
     * @param classname
     */
    addClass(classname) {
      this.__initialClassesToScan.push(classname);
    },

    /**
     * Removes a class from the list of required classes to analyze
     * @param classname {String}
     */
    removeClass(classname) {
      this.__initialClassesToScan.remove(classname);
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
     * e.g. compiler version, environment variables, or available libraries
     *
     * @return {Boolean}
     */
    isContextChanged() {
      var db = this.getDatabase();

      // Check if environment is the same as the last time
      // If the environment hash is null, environment variables have
      // not been loaded yet. In that case don't consider the environment
      // changed
      if (this.__environmentHash && this.__environmentHash !== db.environmentHash) {
        return true;
      }

      // then check if compiler version is the same
      let qxVersion = qx.core.Environment.get("qx.version");
      if (db.compilerVersion !== qxVersion) {
        return true;
      }

      // And Qooxdoo version (this can differ from the compiler version when cross compiling)
      if (db.libraries.qx !== this.findLibrary("qx").getVersion()) {
        return true;
      }

      // Check if the list of available libraries has changed (issue #10194)
      // This ensures that newly added packages are detected without requiring --clean
      if (db.libraries) {
        const currentLibraries = this.getLibraries().reduce((acc, library) => {
          acc[library.getNamespace()] = library.getVersion();
          return acc;
        }, {});

        const dbLibraryKeys = Object.keys(db.libraries).sort();
        const currentLibraryKeys = Object.keys(currentLibraries).sort();

        // Check if a library was added or removed
        if (dbLibraryKeys.length !== currentLibraryKeys.length || !dbLibraryKeys.every((key, index) => key === currentLibraryKeys[index])) {
          return true;
        }

        // Check if any library version changed
        for (let ns in currentLibraries) {
          if (db.libraries[ns] !== currentLibraries[ns]) {
            return true;
          }
        }
      }

      return false;
    },

    /**
     * Sets the environment data in the __db.
     *
     * The data being set is:
     *  * a hash of the current environment values
     *  * the compiler version
     *  * a list of the libraries used
     *
     */
    updateEnvironmentData() {
      let libraries = this.getLibraries().reduce((acc, library) => {
        acc[library.getNamespace()] = library.getVersion();
        return acc;
      }, {});

      let db = this.getDatabase();

      db.libraries = libraries;
      db.environmentHash = this.__environmentHash;
      db.compilerVersion = qx.core.Environment.get("qx.version");
    },

    /**
     * The Maker for this application
     *
     * @returns {qx.tool.compiler.Maker}
     */
    getMaker() {
      return this.__maker;
    },

    /**
     * The Compiler that is running the show
     *
     * @param {qx.tool.compiler.Compiler} compiler
     */
    setCompiler(compiler) {
      this.__compiler = compiler;
    },

    /**
     * Returns the Compiler that is running the show
     *
     * @returns {qx.tool.compiler.Compiler}
     */
    getCompiler() {
      return this.__compiler;
    }
  }
});
