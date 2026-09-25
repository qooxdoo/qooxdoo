/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2011-2025 Zenesis Limited, http://www.zenesis.com
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

const fs = require("fs");
const path = require("upath");

/**
 * MetaDatabase is used to store the metadata for all classes in a qooxdoo compilation;
 * it covers all classes in all libraries, and has scope to incorporate pre-compilers
 * in the future.
 *
 * @typedef {Object} Database
 * @property {string[]} classnames List of all class names in the database
 *
 * @ignore(TextEncoder)
 * @ignore(SharedArrayBuffer)
 * @ignore(TextDecoder)
 */
qx.Class.define("qx.tool.compiler.meta.MetaDatabase", {
  extend: qx.core.Object,

  construct(jobQueue) {
    super();
    this.__jobQueue = jobQueue;
    this.__classMetasByClassname = {};
    this.__metaByFilename = {};
    this.__packages = {};
    this.__dirtyClasses = {};
    this.__database = {};
  },

  properties: {
    /** Where the meta files for individual classes are stored */
    rootDir: {
      init: "compiled/meta",
      check: "String"
    }
  },

  events: {
    /** Fired when the meta database is loading up */
    starting: "qx.event.type.Event",

    /** Fired when the database has loaded and is ready for use */
    started: "qx.event.type.Event",

    /** Fired when a class meta has been parsed, data is `qx.tool.compiler.meta.ClassMeta` */
    classMetaParsed: "qx.event.type.Data"
  },

  members: {
    /** @type{qx.tool.worker.JobQueue} the job queue */
    __jobQueue: null,

    /** @type {Object<String,qx.tool.compiler.meta.ClassMeta>} list of meta indexed by classname */
    __classMetasByClassname: null,

    /**
     * @type {Object<String,boolean>} list of all packages
     */
    __packages: null,

    /** @type {Object<String,Boolean>} list of classes which need to have their second pass */
    __dirtyClasses: null,

    /**
     * @type {Database}
     * The database
     */
    __database: null,

    /**
     * Saves the database
     */
    async save() {
      await fs.promises.mkdir(this.getRootDir(), { recursive: true });
      this.__database.classnames = Object.keys(this.__classMetasByClassname);
      await qx.tool.utils.Json.saveJsonAsync(this.getRootDir() + "/db.json", this.__database);
    },

    /**
     * @returns {Database?}
     */
    getDatabase() {
      return this.__database;
    },

    /**
     * Loads the database and all of the meta data
     */
    async load() {
      /*
       * Performance testing and various trials of how to speed up the loading of the meta database indicate
       * that the greatest cost is multiple file i/o to load all of the meta datas for each class.  We are
       * loading them all here so that we can access them later without having to await for each one to load;
       * this is crucial because babel is synchronous only, and we must have the data available.
       *
       * My guess is that lots of small file i/o operations are expensive, and that this method is expensive
       * because of the latency of the file i/o operations, not the actual parsing of the files.
       *
       * I've tried various ways to speed this up, but it seems to come down to i/o each time.
       *
       * Keeping each class' meta data in individual files is really useful while developing the compiler, so
       * performance boost here is probably by creating a pluggable file i/o system so that we can configure at
       * rumtime whether to use a single huge file or multiple small files.
       *
       * Incidentally, that kind of virtual file system mechanism could be really useful if, for example, it
       * was designed so that we could have implementations for (a) pass through to the real file system, and
       * (b) go via a server / API so that browser code can be given file system access, and (c) a browser
       * can have a virtual disk stored in browser local storage, and (d) implementation backed by github / gists
       * etc.
       */
      this.fireEvent("starting");
      let filename = this.getRootDir() + "/db.json";
      if (fs.existsSync(filename)) {
        this.__classMetasByClassname = {};
        this.__metaByFilename = {};
        this.__packages = {};
        this.__dirtyClasses = {};
        let data = await qx.tool.utils.Json.loadJsonAsync(filename);
        this.__database = data;

        let classnamesToLoad = data.classnames || [];
        delete data.classnames;
        //2026-JAN-15 - I don't think we need to limit concurrency here? - NodeJs should be able to handle loads of parallel disk IO operations
        await Promise.all(
          classnamesToLoad.map(async classname => {
            let segs = classname.split(".");

            for (let i = 0; i < segs.length - 1; i++) {
              let seg = segs.slice(0, i + 1).join(".");
              this.__packages[seg] = true;
            }
            let filename = this.getRootDir() + "/" + classname.replace(/\./g, "/") + ".json";
            if (fs.existsSync(filename)) {
              let metaReader = new qx.tool.compiler.meta.ClassMeta(this.getRootDir());
              await metaReader.loadMeta(filename);
              if (!(await metaReader.isOutOfDate())) {
                this.__classMetasByClassname[classname] = metaReader;
                let classFilename = metaReader.getMetaData().classFilename;
                classFilename = path.resolve(path.join(this.getRootDir(), classFilename));
                this.__metaByFilename[classFilename] = metaReader;
              }
            }
          })
        );
      }
      this.fireEvent("started");
    },

    /**
     * Implementation of `qx.tool.compiler.jsdoc.ITypeResolver`
     *
     * @param {*} currentClassMeta
     * @param {String} type
     * @returns {String}
     */
    resolveType(currentClassMeta, type) {
      if (!type) {
        return type;
      }

      // in certain limited circumstances, the code at the end of this method will break usage of vanilla JS types
      // for example, usage of `String` within a class `qx.bom.*` will instead resolve to `qx.bom.String`
      // to prevent this, the following object traps the most common vanilla JS types
      const plainJsTypes = {
        string: "string",
        number: "number",
        boolean: "boolean",
        object: "Record<any, any>",
        array: "Array<any>",
        function: "((...args: any[]) => any)",
        map: "Map<any, any>",
        set: "Set<any>",
        regexp: "RegExp",
        date: "Date",
        error: "Error",
        promise: "Promise<any>"
      };

      if (plainJsTypes[type.toLowerCase()]) {
        return plainJsTypes[type.toLowerCase()];
      }

      let pos = currentClassMeta.className.lastIndexOf(".");
      let packageName = pos > -1 ? currentClassMeta.className.substring(0, pos) : null;

      if (packageName) {
        pos = type.indexOf(".");
        if (pos < 0 && this.__classMetasByClassname[packageName + "." + type]) {
          return packageName + "." + type;
        }
      }

      return type;
    },

    /**
     * Adds the files to the database,
     * but only for ones which are not cached.
     *
     * @param {string[]} files
     * @returns {Promise<boolean>} True if there were no syntax errors while adding the files, false otherwise
     */
    async addFiles(files) {
      let addMetaResults = await Promise.all(
        files.map(filename => {
          if (!this.__metaByFilename[filename]) {
            return this.addFile(filename);
          } else {
            return true;
          }
        })
      );

      await this.reparseAll();
      return addMetaResults.every(Boolean);
    },

    /**
     * Adds a file to the database
     *
     * @param {String} filename
     * @param {Boolean} force Always recompute the meta, even if it's up to date
     * @returns {Promise<boolean>} False if there were any fundamental user errors in the project code (e.g. syntax errors), true otherwise
     */
    async addFile(filename, force) {
      if (filename.match(/__init__/)) {
        return;
      }
      filename = await qx.tool.utils.files.Utils.correctCase(filename);
      filename = path.resolve(filename);
      let classMeta = this.__metaByFilename[filename];
      if (classMeta && !force && !(await classMeta.isOutOfDate())) {
        return true;
      }

      let libraries = Object.values(this.getDatabase().libraries || {}).map(l => l.sourceDir);
      let libraryPath = libraries.find(l => filename.startsWith(l));

      classMeta = new qx.tool.compiler.meta.ClassMeta(this.getRootDir(), libraryPath);
      let classFilename = await qx.tool.utils.files.Utils.correctCase(filename);

      try {
        let existingCompile = this.__jobQueue.addJob(
          qx.tool.compiler.meta.IStdClassParser,
          "parse",
          this.getRootDir(),
          libraryPath,
          classFilename
        );
        let metaData = await existingCompile.promiseComplete;
        classMeta.setMetaData(metaData);
        let classname = metaData.className;
        if (metaData.className === undefined) {
          //This may seem like an error, but we do have files which don't define classes, e.g. packages' __init__.js
          return true;
        }
        this.__classMetasByClassname[metaData.className] = classMeta;
        this.__metaByFilename[filename] = classMeta;
        this.__dirtyClasses[metaData.className] = true;

        let segs = classname.split(".");
        for (let i = 0; i < segs.length - 1; i++) {
          let seg = segs.slice(0, i + 1).join(".");
          this.__packages[seg] = true;
        }

        this.fireDataEvent("classMetaParsed", classMeta);
      } catch (ex) {
        qx.tool.compiler.Console.error("Failed to parse meta data for file " + filename + ": " + ex.message);
        return false;
      }

      return true;
    },

    /**
     * Removes a file from the database, because it has been deleted or renamed
     *
     * @param {String} filename
     */
    async removeFile(filename) {
      filename = await qx.tool.utils.files.Utils.correctCase(filename);
      filename = path.resolve(filename);
      let meta = this.__metaByFilename[filename];
      if (meta) {
        let classname = meta.getMetaData().className;
        delete this.__classMetasByClassname[classname];
        delete this.__metaByFilename[filename];
        delete this.__dirtyClasses[classname];
      }
    },

    /**
     * Returns a list of all class names
     *
     * @return {String[]}
     */
    getClassnames() {
      return Object.keys(this.__classMetasByClassname);
    },

    /**
     * Returns the meta data for a class
     *
     * @param {String} className
     * @returns {qx.tool.compiler.meta.StdClassParser.MetaData}
     */
    getMetaData(className) {
      return this.__classMetasByClassname[className]?.getMetaData() || null;
    },

    /**
     * Returns the ClassMeta for a class
     *
     * @param {String} className
     * @returns {qx.tool.compiler.meta.ClassMeta}
     */
    getClassMeta(className) {
      return this.__classMetasByClassname[className] || null;
    },

    /**
     * @typedef {Object} EnvironmentCheck
     * @property {String} matchString - the string to match against the environment
     * @property {Boolean?} startsWith - if true, then the matchString is a prefix otherwise it is an exact match
     * @property {String} className - the name of the class that the check is for
     *
     * @returns {Object<String, EnvironmentCheck>} the environment checks
     */
    getEnvironmentChecks() {
      return this.__database.environmentChecks || {};
    },

    /**
     * Detects the type of a symbol, eg whether it is a class, package, member, environment etc
     *
     * @typedef {Object} SymbolType
     * @property {String} symbolType - the type of the symbol, one of "class", "package", "member", "environment"
     * @property {String?} className - the name of the class that the symbol belongs to, if applicable
     * @property {String} name - the name of the symbol
     *
     * @property {String} name - the name of the symbol to detect
     * @returns {SymbolType}
     */
    getSymbolType(name) {
      var classInfo = this.__classMetasByClassname[name];
      var packageInfo = this.__packages[name];

      if (classInfo || packageInfo) {
        return {
          symbolType: classInfo ? "class" : "package",
          className: classInfo ? name : null,
          name
        };
      }

      function testEnvironment(check) {
        let match = false;
        if (check.startsWith) {
          match = name.startsWith(check.matchString);
        } else {
          match = name == check.matchString;
        }
        if (match) {
          return {
            symbolType: "environment",
            className: check.className,
            name
          };
        }
        return null;
      }

      let envCheck = this.getEnvironmentChecks()[name];
      if (envCheck) {
        let result = testEnvironment(envCheck);
        if (result) {
          return result;
        }
      }
      for (let envCheck of Object.values(this.getEnvironmentChecks())) {
        let result = testEnvironment(envCheck);
        if (result) {
          return result;
        }
      }

      let segs = name.split(".");
      while (segs.length > 1) {
        segs.pop();
        let tmpname = segs.join(".");
        classInfo = this.__classMetasByClassname[tmpname];
        if (classInfo) {
          return {
            symbolType: "member",
            className: tmpname,
            name: name
          };
        }
      }

      return null;
    },

    /**
     * @readonly
     * @returns {Object<String, qx.tool.compiler.meta.ClassMeta>} map of class name to ClassMeta
     */
    getMetaByClassname() {
      return this.__classMetasByClassname;
    },

    /**
     * Once all meta data has been loaded, this method traverses the database
     * to add information that can only be added once all classes are known,
     * eg which methods override other methods and where they were overridden from
     */
    async reparseAll() {
      let classnames = Object.keys(this.__dirtyClasses);
      this.__dirtyClasses = {};

      let derivedClassLookup = this.__createDerivedClassLookup();

      for (let i = 0; i < classnames.length; i++) {
        let className = classnames[i];
        let derived = derivedClassLookup[className];
        for (let derivedClass of derived.values()) {
          if (!classnames.includes(derivedClass)) {
            classnames.push(derivedClass);
          }
        }
      }

      await Promise.all(
        classnames.map(async className => {
          let metaReader = this.__classMetasByClassname[className];
          let metaData = metaReader.getMetaData();

          const typeResolver = {
            resolveType: this.resolveType.bind(this, metaData)
          };

          metaReader.fixupJsDoc(typeResolver);

          this.__fixupMembers(metaData);

          this.__fixupEntries(metaData, "members");
          this.__fixupEntries(metaData, "statics");
          this.__fixupEntries(metaData, "properties");

          let filename = this.getRootDir() + "/" + className.replace(/\./g, "/") + ".json";
          await metaReader.saveMeta(filename);
        })
      );
      await this.save();
    },

    /**
     * @returns {Object<String, Set<String>>} An object mapping names of classy objects (i.e. classes, mixins, interfaces) to names of their child (derived) classy objects.
     */
    __createDerivedClassLookup() {
      let lookup = {};

      const add = (key, item) => {
        lookup[key] ??= new Set();
        lookup[key].add(item);
      };

      for (let classname in this.__classMetasByClassname) {
        lookup[classname] ??= new Set(); // ensuring this makes operations with the lookup simpler
        let metaData = this.__classMetasByClassname[classname].getMetaData();
        if (metaData.superClass) {
          add(metaData.superClass, classname);
        }
        for (let mixin of metaData.mixins ?? []) {
          add(mixin, classname);
        }
        for (let iface of metaData.interfaces ?? []) {
          add(iface, classname);
        }
      }

      return lookup;
    },

    /**
     * Finds info about a method
     *
     * @param {*} metaData starting point
     * @param {String} methodName name of the method
     * @param {Boolean} firstPass
     * @returns {*} meta data values to add to the method
     */
    __findSuperMethod(metaData, methodName, firstPass) {
      if (!firstPass) {
        let method = metaData.members?.[methodName];
        if (method) {
          return {
            overriddenFrom: metaData.className
          };
        }
      }
      if (metaData.mixins) {
        for (let mixinName of metaData.mixins) {
          let mixinMeta = this.__classMetasByClassname[mixinName];
          if (mixinMeta) {
            let mixinMetaData = mixinMeta.getMetaData();
            let method = mixinMetaData.members?.[methodName];
            if (method) {
              return {
                mixin: mixinName
              };
            }
          }
        }
      }
      if (!metaData.superClass) {
        return null;
      }
      let superMetaReader = this.__classMetasByClassname[metaData.superClass];
      if (superMetaReader) {
        return this.__findSuperMethod(superMetaReader.getMetaData(), methodName, false);
      }
      return null;
    },

    /**
     * @param {*} metaData class metadata
     * @param {string} entryKind name of the entry type
     * @param {string} entryName name of the entry
     * @returns {string[]} list of classes where the entry appears
     */
    __findAppearances(metaData, entryKind, entryName) {
      const getSuperLikes = meta => [...(meta.mixins ?? []), ...(meta.superClass ? [meta.superClass] : []), ...(meta.interfaces ?? [])];

      const resolve = meta => {
        if (meta[entryKind]?.[entryName]) {
          appearances.push(meta.className);
        }
      };

      const appearances = [];
      const toResolve = getSuperLikes(metaData);
      while (toResolve.length) {
        const currentMeta = this.__classMetasByClassname[toResolve.shift()];
        if (currentMeta) {
          resolve(currentMeta.getMetaData());
          toResolve.push(...getSuperLikes(currentMeta.getMetaData()));
        }
      }

      return appearances;
    },

    /**
     * Discovers data about the members in the hierarchy, eg whether overridden etc
     *
     * @param {qx.tool.compiler.meta.StdClassParser.MetaData} metaData
     */
    __fixupMembers(metaData) {
      if (!metaData.members) {
        return;
      }
      if (metaData.abstract) {
        for (const itf of metaData.interfaces ?? []) {
          const itfMembers = this.__classMetasByClassname[itf]?.getMetaData().members;
          for (const memberName in itfMembers ?? {}) {
            const member = itfMembers[memberName];
            if (!metaData.members[memberName]) {
              metaData.members[memberName] = {
                ...member,
                abstract: true,
                fromInterface: itf
              };
            }
          }
        }
      }
      for (const methodName in metaData.members) {
        const methodMeta = metaData.members[methodName];
        const superMethod = this.__findSuperMethod(metaData, methodName, true);
        if (superMethod) {
          for (const key in superMethod) {
            methodMeta[key] = superMethod[key];
          }
        }
      }
    },

    /**
     * Detects the superlike (class/mixin/interface) appearances and includes the
     * mixin entries into the class metadata
     * @param {qx.tool.compiler.meta.StdClassParser.MetaData} metaData
     * @param {string} kind
     */
    __fixupEntries(metaData, kind) {
      metaData[kind] ??= {};
      for (const mixin of metaData.mixins ?? []) {
        const mixinMeta = this.__classMetasByClassname[mixin]?.getMetaData();
        for (const name in mixinMeta?.[kind] ?? {}) {
          const appearsIn = this.__findAppearances(metaData, kind, name);
          const meta = qx.lang.Object.clone(mixinMeta[kind][name]);
          meta.mixin = mixin;
          meta.appearsIn = appearsIn;
          metaData[kind][name] = meta;
        }
      }
      for (const name in metaData[kind] ?? {}) {
        const meta = metaData[kind][name];
        meta.appearsIn = this.__findAppearances(metaData, kind, name);
      }
    },

    /**
     * Gets a flattened type hierarchy for a class
     * @param {string|object} metaOrClassName - the classname or the meta data of the class to get the hierarchy for
     * @returns the type hierarchy
     *
     */
    getHierarchyFlat(metaOrClassName) {
      const meta = typeof metaOrClassName === "string" ? this.getMetaData(metaOrClassName) : metaOrClassName;

      const data = {
        className: meta.className,
        superClasses: {},
        mixins: {},
        interfaces: {}
      };

      let toResolve = [meta];

      while (toResolve.length) {
        let currentMeta = toResolve.shift();

        if (currentMeta.superClass) {
          let superClassMeta = this.getMetaData(currentMeta.superClass);
          if (superClassMeta) {
            data.superClasses[superClassMeta.className] = superClassMeta;
            toResolve.push(superClassMeta);
          }
        }
        if (currentMeta.mixins) {
          for (let mixin of currentMeta.mixins) {
            let mixinMeta = this.getMetaData(mixin);
            if (mixinMeta) {
              data.mixins[mixinMeta.className] = mixinMeta;
              toResolve.push(mixinMeta);
            }
          }
        }
        if (currentMeta.interfaces) {
          for (let iface of currentMeta.interfaces) {
            let ifaceMeta = this.getMetaData(iface);
            if (ifaceMeta) {
              data.interfaces[ifaceMeta.className] = ifaceMeta;
              toResolve.push(ifaceMeta);
            }
          }
        }
      }

      return data;
    },

    /**
     *
     * @param {qx.tool.compiler.meta.MetaDatabase} other
     * @returns {qx.tool.compiler.meta.MetaDatabase}
     */
    move(other) {
      this.__classMetasByClassname = other.__classMetasByClassname;
      this.__packages = other.__packages;
      this.__database = {
        environmentChecks: other.__database.environmentChecks
      };
      return this;
    },

    /**
     * Scans directories recursively for .js files and populates the database.
     * Calls addFile() for each discovered file, then reparseAll().
     *
     * @param {String[]} dirs directories to scan
     * @param {Object} [options]
     * @param {Boolean} [options.force] reparse even if up to date (default: false)
     * @param {Object}  [options.ignore] an `ignore` instance for exclude patterns
     * @param {Boolean} [options.verbose] log each processed file
     */
    async loadFromDirectories(dirs, options = {}) {
      const classFiles = [];

      const scanImpl = async filename => {
        let basename = path.basename(filename);

        if (options.ignore) {
          let relativePath = path.relative(process.cwd(), filename);
          if (options.ignore.ignores(relativePath)) {
            return;
          }
        }

        let stat = await fs.promises.stat(filename);
        if (stat.isFile() && basename.match(/\.js$/)) {
          classFiles.push(filename);
        } else if (stat.isDirectory() && (basename == "." || basename[0] != ".")) {
          let files = await fs.promises.readdir(filename);
          for (let file of files) {
            await scanImpl(path.join(filename, file));
          }
        }
      };

      for (let dir of dirs) {
        await scanImpl(dir);
      }

      for (let filename of classFiles) {
        if (options.verbose) {
          qx.tool.compiler.Console.info(`Processing ${filename} ...`);
        }
        await this.addFile(filename, options.force || false);
      }
      await this.reparseAll();

      // Remove any classes whose source file is excluded by the ignore patterns.
      // Scanning already skips excluded files, but classes parsed by a previous run
      // may have been reloaded from the persisted database (db.json) by load(), so
      // filter them out here to keep excluded classes out of the result.
      if (options.ignore) {
        for (let classname of this.getClassnames()) {
          let meta = this.getMetaData(classname);
          if (!meta || !meta.classFilename) {
            continue;
          }
          let sourcePath = path.resolve(path.join(this.getRootDir(), meta.classFilename));
          let relativePath = path.relative(process.cwd(), sourcePath);
          // Files outside the current working directory cannot be matched by the
          // relative ignore patterns (and the `ignore` package rejects "../" paths),
          // so they are never excluded.
          if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
            continue;
          }
          if (options.ignore.ignores(relativePath)) {
            delete this.__classMetasByClassname[classname];
            delete this.__metaByFilename[sourcePath];
            delete this.__dirtyClasses[classname];
          }
        }
      }
    }
  }
});
