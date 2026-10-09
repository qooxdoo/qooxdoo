/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2025 Zenesis Limited, http://www.zenesis.com
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
 *      * Patryk Malinowski (pmalinowski@vmn.digital, @patryk-m-malinowski)
 *
 * *********************************************************************** */

const fs = qx.tool.utils.Promisify.fs;
const path = require("upath");

/**
 * Operates the Qooxdoo compiler, including discovery of classes, compilation of classes, and making of applications.
 *
 * @use(qx.core.BaseInit)
 * @use(qx.tool.*)
 * @use(qx.tool.compiler.ClassTranspilerApi)
 * @use(qx.tool.compiler.cli.api.CompilerApi)
 * @use(qx.tool.compiler.meta.ShadowMetaDatabaseApi)
 * @use(qx.tool.worker.WorkerServerApi)
 * @use(qx.tool.compiler.ClassTranspilerApi)
 */

qx.Class.define("qx.tool.compiler.Compiler", {
  implement: [qx.tool.compiler.ICompilerInterface],
  extend: qx.core.Object,

  construct() {
    super();
    this.__makers = [];
    this.__libraries = {};

    this.__dbClassInfoCache = {};
    this.__changedFiles = {};
    this.__compilingClasses = {};
    this.__makerStateByHashCode = {};
    new qx.tool.compiler.feedback.ConsoleFeedback(this);
  },

  environment: {
    /** Name of the custom compiler class; null = standard compiler */
    "qx.tool.compiler.Compiler.compilerClass": null
  },

  events: {
    /** Fired when a maker is added, data is {qx.tool.compiler.Maker} */
    addMaker: "qx.event.type.Data",

    /** Fired when the compiler starts up */
    starting: "qx.event.type.Event",

    /** Fired when the initial compilation has completed */
    started: "qx.event.type.Event",

    /** Fired when the meta database is about to be configured with libraries and environment checks */
    metaDbConfiguring: "qx.event.type.Event",

    /** Fired when the meta database has been configured */
    metaDbConfigured: "qx.event.type.Event",

    /** Fired when the discovered classes have been added to the meta database */
    addedDiscoveredClasses: "qx.event.type.Event",

    /** Fired when the meta data has been written to disk, data is {qx.tool.compiler.meta.MetaDatabase} */
    writtenMetaData: "qx.event.type.Data",

    /** Fired when file changes have been detected and recompilation starts */
    changesDetected: "qx.event.type.Event",

    /** Fired when a class needs to be compiled, data is {maker, classname} */
    classNeedsToBeCompiled: "qx.event.type.Data",

    /** Fired when class discovery starts, data is {qx.tool.compiler.meta.Discovery} */
    discoveryStarted: "qx.event.type.Data",

    /** Fired when the meta database has been loaded, data is {qx.tool.compiler.meta.MetaDatabase} */
    metaDbLoaded: "qx.event.type.Data",

    /** @Override */
    writingApplications: "qx.event.type.Event",

    /** @Override */
    writingApplication: "qx.event.type.Data",

    /** @Override */
    writtenApplication: "qx.event.type.Data",

    /** @Override */
    writtenApplications: "qx.event.type.Data",

    /** @Override */
    compilingClass: "qx.event.type.Data",

    /** @Override */
    compiledClass: "qx.event.type.Data",

    /** @Override */
    saveDatabase: "qx.event.type.Data",

    /** @Override */
    checkEnvironment: "qx.event.type.Data",

    /** @Override */
    making: "qx.event.type.Data",

    /** @Override */
    made: "qx.event.type.Data",

    /** @Override */
    allDone: "qx.event.type.Event",

    /** @Override */
    minifyingApplication: "qx.event.type.Data",

    /** @Override */
    minifiedApplication: "qx.event.type.Data"
  },

  properties: {
    /** Root directory for the meta database */
    metaDir: {
      check: "String"
    },

    watch: {
      init: false,
      check: "Boolean"
    },

    maxWorkers: {
      check: "Integer"
    },

    typescriptEnabled: {
      init: false,
      check: "Boolean"
    },

    /** the name of the typescript file to generate, null = use default */
    typescriptFile: {
      init: null,
      nullable: true,
      check: "String"
    }
  },

  members: {
    /** @type{qx.tool.compiler.meta.Discovery} searches for class source files and watches for changes */
    __classDiscovery: null,

    /**
     * @type {Object.<string, '+' | '-'>} List of changed files, indexed by file name,
     * with value "+" for added/changed files and "-" for removed files
     * These are for the classes that have been queued up for compilation but are not yet being compiled
     */
    __changedFiles: null,

    /** @type{Object<String,String>} list of discovered class files, indexed by filename */
    __discoveredClassFiles: null,

    /**
     * @type {qx.tool.compiler.targets.TypeScriptWriter|null}
     * The TypeScript writer instance, responsible for generating TypeScript definitions
     */
    __typescriptWriter: null,

    /** @type {qx.tool.worker.JobQueue} The queue of jobs to be run in qx.tool.worker.WorkerClient workers */
    __jobQueue: null,

    /** @type {qx.tool.compiler.meta.MetaDatabase} Meta database for all classes in this target */
    __metaDb: null,

    /** @type {Object<String, qx.tool.compiler.app.Library>} all libraries indexed by namespace */
    __libraries: null,

    /** @type {qx.tool.compiler.resources.ResourceManager} The resource manager instance */
    __resourceManager: null,

    /** @type {Boolean} Whether the compiler is currently listening for asset changes */
    __isListeningForAssetChanges: false,

    /** @type {qx.tool.compiler.Maker[]} list of makers */
    __makers: null,

    /** @type {Object<string,qx.tool.compiler.ClassFile.DbClassInfo>} list of cached dbClassInfo, indexed by a hash key which is the target directory and classname, eg "source:mypkg.MyClass" */
    __dbClassInfoCache: null,

    /** @type {Object<String,Promise>} classes currently being compiled, index by hash of target directory and classname eg "source:mypkg.MyClass" */
    __compilingClasses: null,

    /**
     * @typedef MakerState
     * @property {qx.tool.compiler.Maker} maker The maker instance this state belongs to
     * @property {Boolean} dirty Whether the maker is dirty and needs to be re-made
     * @property {Boolean} restart Whether the maker needs to be restarted when it finished
     * @property {Promise?} promise The promise that resolves when the maker has finished making (after handling any restarts); if
     *  it is null, then it is not currently being made.
     *
     * @type{Object<String,MakerState>} List of MakerState objects, indexed by hash code of the Maker they are for
     */
    __makerStateByHashCode: null,

    /** @type {Object<String,Promise>} list of makers currently making, indexed by hash code */
    __makingMakers: null,

    /**
     * Adds a maker to the discovery process, which will then
     * add all libraries that the maker uses to the discovery.
     */
    addMaker(maker) {
      this.__makers.push(maker);
      this.__makerStateByHashCode[maker.toHashCode()] = {
        maker: maker,
        dirty: false,
        restart: false,
        promise: null
      };
      maker.getAnalyzer().setCompiler(this);
      for (let lib of maker.getAnalyzer().getLibraries()) {
        this.addLibrary(lib);
      }
      this.fireDataEvent("addMaker", maker);
    },

    /**
     * Adds a library to the discovery process.
     *
     * @param {qx.tool.compiler.app.Library} lib
     */
    addLibrary(lib) {
      if (this.__libraries[lib.getNamespace()]) {
        return;
      }

      let dir = path.join(lib.getRootDir(), lib.getSourcePath());
      let stat = qx.tool.utils.files.Utils.safeStatSync(dir);
      if (!stat?.isDirectory()) {
        qx.tool.compiler.Console.print("qx.tool.compiler.compiler.missingLibrary", lib.getNamespace(), lib.getSourcePath());
        return;
      }
      this.__libraries[lib.getNamespace()] = lib;
    },

    /**
     * Initializes the discovery process for classes
     */
    async __startClassDiscovery() {
      this.__discoveredClassFiles = {};

      /**
       * Figures out what the class name would be for a given filename, based on the root directory.
       *
       * @param {String} filename
       * @param {String} rootDir
       * @returns {String} classname
       */
      const calculateClassnameFromFilename = (filename, rootDir) => {
        filename = path.normalize(filename);
        let packageName = path.relative(rootDir, filename);
        packageName = packageName.split(path.sep);
        packageName.pop();
        packageName = packageName.join(".");
        let classname = path.basename(filename, ".js");
        if (packageName.length) {
          classname = packageName + "." + classname;
        }
        return classname;
      };

      /**
       * Handles class files being discovered
       *
       * @param {qx.event.type.Data} evt
       */
      const onClassFileAdded = evt => {
        let { filename, rootDir } = evt.getData();
        if (filename.endsWith(".js")) {
          this.__discoveredClassFiles[filename] = {
            classname: calculateClassnameFromFilename(filename, rootDir)
          };
          this.__changedFiles[filename] = "+";
          this.__debounceProcessChangedFiles?.trigger();
        }
      };

      /**
       * Handles discovered class files being changed
       *
       * @param {qx.event.type.Data} evt
       */
      const onClassFileChanged = evt => {
        let { filename } = evt.getData();
        if (filename.endsWith(".js")) {
          this.__changedFiles[filename] = "+";
          this.__debounceProcessChangedFiles?.trigger();
        }
      };

      /**
       * Handles discovered class files being removed
       *
       * @param {qx.event.type.Data} evt
       */
      const onClassFileRemoved = evt => {
        let { filename } = evt.getData();
        if (this.__discoveredClassFiles[filename]) {
          delete this.__discoveredClassFiles[filename];
          this.__changedFiles[filename] = "-";
          this.__debounceProcessChangedFiles?.trigger();
        }
      };

      if (qx.core.Environment.get("qx.debug")) {
        this.assertTrue(!this.__classDiscovery, "Class discovery already started");
      }
      this.__classDiscovery = new qx.tool.compiler.meta.Discovery();
      this.__classDiscovery.setWatch(this.getWatch());
      for (let lib of Object.values(this.__libraries)) {
        let dir = path.join(lib.getRootDir(), lib.getSourcePath());
        this.__classDiscovery.addPath(dir);
      }

      this.__classDiscovery.addListener("fileAdded", onClassFileAdded, this);
      this.__classDiscovery.addListener("fileChanged", onClassFileChanged, this);
      this.__classDiscovery.addListener("fileRemoved", onClassFileRemoved, this);
      await this.__classDiscovery.start();
      let allClassnames = {};
      for (let filename in this.__discoveredClassFiles) {
        let classname = this.__discoveredClassFiles[filename].classname;
        if (allClassnames[classname]) {
          qx.tool.compiler.Console.print("qx.tool.compiler.discovery.duplicateClassname", classname, filename, allClassnames[classname]);
        }
        allClassnames[classname] = filename;
      }
      this.fireDataEvent("discoveryStarted", this.__classDiscovery);
    },

    /**
     * Starts the resource manager, including discovery and watching if required
     */
    async __startResourceManager() {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertTrue(!this.__resourceManager, "Resource manager already started");
      }
      this.__resourceManager = new qx.tool.compiler.resources.Manager(path.join(this.getMetaDir(), "resource-db.json"));
      this.__resourceManager.setWatch(this.getWatch());
      for (let lib of Object.values(this.__libraries)) {
        this.__resourceManager.addLibrary(lib);
      }
      await this.__resourceManager.start();
    },

    /**
     * After the first successful make, we start watching for asset changes so that we copy changes
     * over automatically to the targets resource directory
     */
    async __startResourceManagerAutoSync() {
      if (this.__isListeningForAssetChanges) {
        return;
      }
      let hasHotDeploys = false;
      for (let maker of this.__makers) {
        if (maker.getTarget().getHotDeploy()) {
          hasHotDeploys = true;
          break;
        }
      }
      let debounceHotDeploy = null;
      if (hasHotDeploys) {
        debounceHotDeploy = new qx.util.Debounce(async () => {
          for (let maker of this.__makers) {
            let hotDeploy = maker.getTarget().getHotDeploy();
            if (hotDeploy) {
              await hotDeploy.syncDeploy();
            }
          }
        }, 100);
      }
      this.__isListeningForAssetChanges = true;
      this.__resourceManager.addListener("assetChanged", async evt => {
        let asset = evt.getData();
        for (let maker of this.__makers) {
          let target = maker.getTarget();
          for (let app of maker.getApplications()) {
            let appMeta = app.getAppMeta();
            if (appMeta.usesAsset(asset)) {
              await appMeta.syncOneAsset(asset);
              let hotDeploy = target.getHotDeploy();
              if (hotDeploy) {
                await hotDeploy.writtenFile(asset.getDestFilename(target));
              }
            }
          }
        }
        if (debounceHotDeploy) {
          debounceHotDeploy.trigger();
        }
      });
      this.__resourceManager.addListener("assetRemoved", async evt => {
        let asset = evt.getData();
        for (let maker of this.__makers) {
          let target = maker.getTarget();
          await asset.deleteAssetFromTarget(target);
        }
      });
    },

    /**
     * @Override
     */
    async start() {
      if (!this.__makers || !this.__makers.length) {
        throw new qx.tool.utils.Utils.UserError("Error: Cannot find anything to make");
      }

      let configDb = await qx.tool.compiler.cli.ConfigDb.getInstance();
      let compilerApi = qx.tool.compiler.cli.ConfigLoader.getInstance().getCompilerApi();

      let poolMaxSize = this.getMaxWorkers() ?? Math.round(require("os").cpus().length / 2);
      this.__jobQueue = new qx.tool.worker.JobQueue().set({
        maxConcurrentJobs: poolMaxSize
      });

      /*
       * Configure MetaDatabase
       */
      this.__metaDb = new qx.tool.compiler.meta.MetaDatabase(this.__jobQueue).set({
        rootDir: this.getMetaDir()
      });

      let metaDb = this.__metaDb;

      this.fireEvent("starting");
      await metaDb.load();
      this.fireDataEvent("metaDbLoaded", metaDb);

      // Class discovery
      await this.__startClassDiscovery();

      // Resources
      await this.__startResourceManager();

      // Store the libraries in the meta database
      this.fireEvent("metaDbConfiguring");
      metaDb.getDatabase().libraries = {};
      let environmentChecks = {};
      for (let lib of Object.values(this.__libraries)) {
        let dir = path.join(lib.getRootDir(), lib.getSourcePath());
        metaDb.getDatabase().libraries[lib.getNamespace()] = {
          sourceDir: dir
        };
        let libChecks = lib.getEnvironmentChecks();
        for (let checkName in libChecks) {
          environmentChecks[checkName] = libChecks[checkName];
        }
      }
      metaDb.getDatabase().environmentChecks = environmentChecks;
      this.fireEvent("metaDbConfigured");

      /*
       * Configure the worker pool
       */
      this.__jobQueue.addListener("workerClientReady", async evt => {
        let workerClient = evt.getData();
        let shadowMetaApi = await workerClient.getApi(qx.tool.compiler.meta.IShadowMetaDatabaseApi);
        await shadowMetaApi.setEnvironmentChecks(this.__metaDb.getEnvironmentChecks());
        this.__metaDb.addListener("classMetaParsed", async evt => {
          let classMeta = evt.getData();
          await shadowMetaApi.updateClassMeta(classMeta.getSharedBufferMetaData());
        });
        for (let classname of this.__metaDb.getClassnames()) {
          let classMeta = this.__metaDb.getClassMeta(classname);
          await shadowMetaApi.updateClassMeta(classMeta.getSharedBufferMetaData());
        }
      });
      await this.__jobQueue.start();

      // Discovery has a side effect where it lists every file it found as changed; they are all parsed by `addFiles` below, so
      // clear the queue
      this.__changedFiles = {};
      this.__debounceProcessChangedFiles = new qx.util.Debounce(() => this.__processChangedFiles(), 100);

      this.__startError ||= !(await metaDb.addFiles(Object.keys(this.__discoveredClassFiles)));
      this.fireEvent("addedDiscoveredClasses");

      if (this.getTypescriptEnabled()) {
        this.__typescriptWriter = new qx.tool.compiler.targets.TypeScriptWriter(this.__metaDb);
        this.__typescriptWriter.setOutputTo(this.getTypescriptFile() ?? path.join(this.getMetaDir(), "..", "qooxdoo.d.ts"));
      }

      /**
       * Updates the meta database and compiles the classes that have been queued up
       */

      // Process the meta data and save to disk
      await metaDb.save();
      await this.fireDataEventAsync("writtenMetaData", metaDb);

      if (this.getTypescriptEnabled()) {
        qx.tool.compiler.Console.info(`Generating typescript output ...`);
        await this.__typescriptWriter.process();
      }

      for (let maker of this.__makers) {
        var analyzer = maker.getAnalyzer();
        let cfg = await qx.tool.compiler.cli.ConfigDb.getInstance();
        analyzer.setWritePoLineNumbers(cfg.db("qx.translation.strictPoCompatibility", false));

        let stat = await qx.tool.utils.files.Utils.safeStat("source/index.html");

        if (stat) {
          qx.tool.compiler.Console.print("qx.tool.cli.compile.legacyFiles", "source/index.html");
        }

        var target = maker.getTarget();
        analyzer.addListener("compiledClass", e => this.dispatchEvent(e.clone()));
        analyzer.addListener("saveDatabase", e => this.dispatchEvent(e.clone()));
        target.addListener("checkEnvironment", e => this.dispatchEvent(e.clone()));

        maker.addListener("writingApplications", e => this.dispatchEvent(e.clone()));
        maker.addListener("writingApplication", e => this.dispatchEvent(e.clone()));
        maker.addListener("writtenApplication", e => this.dispatchEvent(e.clone()));
        maker.addListener("writtenApplications", e => this.dispatchEvent(e.clone()));

        if (target instanceof qx.tool.compiler.targets.BuildTarget) {
          target.addListener("minifyingApplication", e => this.dispatchEvent(e.clone()));
          target.addListener("minifiedApplication", e => this.dispatchEvent(e.clone()));
        }

        maker.addListener("making", async () => {
          await this.fireDataEventAsync("making", maker);
        });

        maker.addListener("made", async () => {
          await this.fireDataEventAsync("made", maker);
        });
      }

      try {
        // Route the initial make through __makeMaker so that __makingMakers is populated;
        // this de-duplicates the redundant make that _onClassCompiled would otherwise trigger
        // while this make is still running, which caused a premature "allDone" event.
        let promises = this.__makers.map(maker => this.__makeMaker(maker));
        await Promise.all(promises);
        this.fireEvent("started");
      } catch (ex) {
        console.error("Error during compilation: " + ex.stack);
        throw ex;
      }
    },

    /**
     * Regenerates the meta database with the file changes, generates the TypeScript file if TypeScript is enabled,
     * and triggers recompilation
     */
    async __processChangedFiles() {
      let metaDb = this.__metaDb;
      this.fireEvent("changesDetected");
      let changedFiles = this.__changedFiles;
      let added = [];
      this.__changedFiles = {};

      await Promise.all(
        Object.entries(changedFiles).map(async ([filename, changeType]) => {
          if (filename.match(/__init__/)) {
            return;
          }
          if (changeType === "+") {
            let classname = this.__discoveredClassFiles[filename]?.classname;
            if (!classname) {
              //No classname means that it is not a valid file for compilation
              return;
            }
            added.push(classname);
            await metaDb.addFile(filename, true);
          } else {
            await metaDb.removeFile(filename);
          }
        })
      );

      await metaDb.reparseAll();
      await metaDb.save();

      if (this.getTypescriptEnabled()) {
        qx.tool.compiler.Console.logVerbose(`Generating typescript output ...`);
        await this.__typescriptWriter.process();
      }

      let compilationRequired = false;
      for (let maker of this.__makers) {
        for (let app of maker.getApplications()) {
          let dependencies = app.getDependencies() || [];
          for (let classname of added) {
            if (dependencies.includes(classname) || app.getRequiredClasses().includes(classname) || app.getTheme() == classname) {
              compilationRequired = true;
              this.compileClass(maker.getAnalyzer(), classname, true);
              this.fireDataEvent("classNeedsToBeCompiled", { maker, classname });
              break;
            }
          }
        }
      }

      if (!compilationRequired) {
        await this.fireEventAsync("allDone");
      }
    },

    /**
     * Compiles a class for the given analyzer and classname.  If the class is already compiled,
     * it will return the cached information unless `force` is true.
     *
     * @param {qx.tool.compiler.Analyzer} analyzer
     * @param {String} classname
     * @param {Boolean} force
     * @returns {qx.tool.compiler.ClassFile.DbClassInfo | Promise<qx.tool.compiler.ClassFile.DbClassInfo>} the class information
     *
     */
    compileClass(analyzer, classname, force) {
      let hashKeyForClassname = analyzer.toHashCode() + ":" + classname;
      let meta = this.__metaDb.getMetaData(classname);
      if (!meta) {
        qx.tool.compiler.Console.error(`Compiler Error: Cannot find class ${classname} in project/libraries.`);
        return { fatalCompileError: true };
      }

      let sourceFilename = path.resolve(path.join(this.__metaDb.getRootDir(), meta.classFilename));
      let outputDir = analyzer.getMaker().getTarget().getOutputDir();
      let outputFilename = path.join(outputDir, "transpiled", classname.replace(/\./g, path.sep) + ".js");
      let jsonFilename = path.join(outputDir, "transpiled", classname.replace(/\./g, path.sep) + ".json");

      let sourceStat = qx.tool.utils.files.Utils.safeStatSync(sourceFilename);
      if (!sourceStat) {
        throw new Error(`Source file for class ${classname} not found: ${sourceFilename}`);
      }

      let dbClassInfo = this.__dbClassInfoCache[hashKeyForClassname] || null;
      if (!dbClassInfo && fs.existsSync(jsonFilename)) {
        dbClassInfo = qx.tool.utils.Json.loadJsonFast(jsonFilename);
      }

      if (!force) {
        let outputStat = qx.tool.utils.files.Utils.safeStatSync(outputFilename);

        if (dbClassInfo && outputStat) {
          var dbMtime = null;
          try {
            dbMtime = dbClassInfo.mtime && new Date(dbClassInfo.mtime);
          } catch (e) {}
          if (dbMtime && dbMtime.getTime() == sourceStat.mtime.getTime()) {
            if (outputStat.mtime.getTime() >= sourceStat.mtime.getTime()) {
              return dbClassInfo;
            }
          }
        }
      }

      let existingCompile = this.__compilingClasses[hashKeyForClassname];
      if (existingCompile) {
        if (!existingCompile.job) {
          return existingCompile.promise;
        } else if (existingCompile.job.status === "running") {
          existingCompile.restart = true;
          return existingCompile.promise;
        } else {
          return existingCompile.promise;
        }
      }

      const onClassCompiledError = err => {
        delete this.__compilingClasses[hashKeyForClassname];
        qx.tool.compiler.Console.error("Unhandled exception while compiling class " + classname + ": " + err.stack);
        let dbClassInfo = { fatalCompileError: true };
        this._onClassCompiled(analyzer, classname, dbClassInfo, false);
        existingCompile.promise.resolve(dbClassInfo);
        existingCompile.error = "Unhandled exception while compiling class " + classname + ": " + err.stack;
      };

      const onClassCompiled = result => {
        if (existingCompile.restart) {
          delete existingCompile.restart;
          compileClassImpl(analyzer, classname, force).then(onClassCompiled).catch(onClassCompiledError);
          return;
        }
        delete this.__compilingClasses[hashKeyForClassname];
        this._onClassCompiled(analyzer, classname, result.dbClassInfo, result.cached);
        existingCompile.promise.resolve(result.dbClassInfo);
        existingCompile.resolved = true;
      };

      const compileClassImpl = async () => {
        let meta = this.__metaDb.getMetaData(classname);
        if (!meta) {
          qx.tool.compiler.Console.error(`Compiler Error: Cannot find class ${classname} in project/libraries.`);
          return { dbClassInfo: { fatalCompileError: true } };
        }

        let sourceStat = await qx.tool.utils.files.Utils.safeStat(sourceFilename);
        if (!sourceStat) {
          throw new Error(`Source file for class ${classname} not found: ${sourceFilename}`);
        }

        let hashKey = outputDir + ":" + classname;
        let dbClassInfo = this.__dbClassInfoCache[hashKey] || null;
        if (!dbClassInfo && fs.existsSync(jsonFilename)) {
          dbClassInfo = await qx.tool.utils.Json.loadJsonAsync(jsonFilename);
        }

        if (!dbClassInfo) {
          dbClassInfo = {};
        }

        this.__dbClassInfoCache[hashKey] = dbClassInfo;

        if (!force) {
          let outputStat = await qx.tool.utils.files.Utils.safeStat(outputFilename);

          if (dbClassInfo && outputStat) {
            var dbMtime = null;
            try {
              dbMtime = dbClassInfo.mtime && new Date(dbClassInfo.mtime);
            } catch (e) {}
            if (dbMtime && dbMtime.getTime() == sourceStat.mtime.getTime()) {
              if (outputStat.mtime.getTime() >= sourceStat.mtime.getTime()) {
                return { dbClassInfo, cached: true };
              }
            }
          }
        }

        this.fireDataEvent("compilingClass", { classname, analyzer });

        let library = this.findLibraryForClassname(classname);
        Object.assign(dbClassInfo, {
          mtime: sourceStat.mtime,
          libraryName: library.getNamespace(),
          filename: sourceFilename
        });

        existingCompile.job = this.__jobQueue.addJob(qx.tool.compiler.IClassTranspilerApi, "transpileClass", {
          classname,
          sourceFilename: sourceFilename,
          outputFilename: outputFilename,
          manglePrefix: analyzer.getManglePrefix(classname),
          classFileConfig: analyzer.getClassFileConfig().serialize(),
          sourceTransformer: analyzer.getMaker().getTransformerClass()
        });

        let dbClassInfoNew = await existingCompile.job.promiseComplete;

        delete dbClassInfo.unresolved;
        delete dbClassInfo.dependsOn;
        delete dbClassInfo.assets;
        delete dbClassInfo.translations;
        delete dbClassInfo.markers;
        delete dbClassInfo.fatalCompileError;
        delete dbClassInfo.commonjsModules;

        for (var key in dbClassInfoNew) {
          dbClassInfo[key] = dbClassInfoNew[key];
        }

        await fs.promises.writeFile(jsonFilename, JSON.stringify(dbClassInfo, null, 2), "utf8");

        return { dbClassInfo, cached: false };
      };

      existingCompile = {
        promise: new qx.Promise(),
        job: null
      };
      this.__compilingClasses[hashKeyForClassname] = existingCompile;
      compileClassImpl(analyzer, classname, force).then(onClassCompiled).catch(onClassCompiledError);

      return existingCompile.promise;
    },

    /**
     * Handler for when a class has been compiled.
     *
     * @param {qx.tool.compiler.Analyzer} analyzer
     * @param {String} classname
     * @param {*} result Result of the compilation
     */
    _onClassCompiled(analyzer, classname, dbClassInfo, cached) {
      if (!cached) {
        this.fireDataEvent("compiledClass", { classname, analyzer });
        let maker = analyzer.getMaker();
        let makerState = this.__makerStateByHashCode[maker.toHashCode()];
        maker.onClassCompiled(classname);
        // Classes compiled on behalf of the maker's running analysis are included in the current make,
        //  so they must not trigger another make
        let awaited = analyzer.isAwaitingClass(classname);
        for (let app of awaited ? [] : maker.getApplications()) {
          let dependencies = app.getDependencies() || [];
          if (dependencies.includes(classname) || app.getRequiredClasses().includes(classname) || app.getTheme() == classname) {
            makerState.dirty = true;
            makerState.restart = true;
            break;
          }
        }
      }

      if (Object.keys(this.__compilingClasses).length != 0) {
        return;
      }

      let makersToMake = {};
      for (let makerHash in this.__makerStateByHashCode) {
        let makerState = this.__makerStateByHashCode[makerHash];
        if (makerState.restart && makerState.promise) {
          continue;
        }
        if (makerState.dirty && makerState.promise) {
          makerState.restart = true;
          continue;
        }
        if (makerState.dirty) {
          makersToMake[makerHash] = makerState.maker;
          makerState.dirty = false;
        }
      }

      for (let makerHash in makersToMake) {
        let maker = makersToMake[makerHash];
        this.__makeMaker(maker);
      }
    },

    __makeMaker(maker) {
      let hashKey = maker.toHashCode();
      let makerState = this.__makerStateByHashCode[hashKey];
      if (makerState.promise) {
        return makerState.promise;
      }
      makerState.promise = new qx.Promise();
      makerState.restart = false;

      const onMakerMade = async () => {
        if (makerState.restart) {
          makerState.restart = false;
          maker
            .make()
            .then(onMakerMade)
            .catch(err => {
              let promise = makerState.promise;
              makerState.promise = null;
              promise.reject(err);
            });
        } else {
          let promise = makerState.promise;
          makerState.promise = null;
          this.__startResourceManagerAutoSync();
          promise.resolve();
        }
      };

      makerState.promise.then(async () => {
        this.fireEventAsync("allDone");
      });

      maker
        .make()
        .then(onMakerMade)
        .catch(async err => {
          console.error("Error making maker " + maker.toHashCode() + ": " + err.stack);
          process.exit(1);
        });

      return makerState.promise;
    },

    /**
     * Find a library for a given classname
     *
     * @param {String} classname
     * @returns {qx.tool.compiler.app.Library?} the library for the given classname, or null if not found
     */
    findLibraryForClassname(classname) {
      let metaDb = this.getMetaDb();
      let classmeta = metaDb.getMetaData(classname);
      if (!classmeta) {
        return null;
      }
      let filename = classmeta.classFilename;
      filename = path.resolve(path.join(metaDb.getRootDir(), filename));
      let best = qx.tool.compiler.app.Library.findBestLibraryForFilename(filename, Object.values(this.__libraries));
      return best;
    },

    /**
     * @Override
     */
    async stop() {
      await this.__metaDb.save();
      if (this.__jobQueue) {
        await this.__jobQueue.stop();
      }
      await this.__classDiscovery.stop();
      await this.__resourceManager.stop();
      this.__isListeningForAssetChanges = false;
    },

    /**
     * @override
     * @returns {qx.tool.compiler.Maker[]}
     */
    getMakers() {
      return this.__makers;
    },

    /**
     * Returns the resource manager used by the compiler.
     *
     * @returns {qx.tool.compiler.resources.Manager}
     */
    getResourceManager() {
      return this.__resourceManager;
    },

    /**
     * Whether an error occurred during `start()` (e.g. discovered classes could not be added
     * to the meta database)
     *
     * @returns {Boolean}
     */
    hasStartError() {
      return Boolean(this.__startError);
    },

    /**
     * Returns the meta database used by the compiler.
     *
     * @returns {qx.tool.compiler.meta.MetaDatabase}
     */
    getMetaDb() {
      return this.__metaDb;
    },

    /**
     * Returns the discovery used by the compiler.
     *
     * @returns {qx.tool.compiler.meta.Discovery}
     */
    getDiscovery() {
      return this.__classDiscovery;
    }
  },

  defer(statics) {
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.compiler.cli.compile.minifyingApplication": "Minifying %1 %2",
      "qx.tool.compiler.cli.compile.compiledClass": "Compiled class %1 in %2s",
      "qx.tool.compiler.cli.compile.makeBegins": "Making applications...",
      "qx.tool.compiler.cli.compile.makeEnds": "Applications are made",
      "qx.tool.compiler.cli.compile.allDone": "All applications ready."
    });

    qx.tool.compiler.Console.addMessageIds(
      {
        "qx.tool.cli.compile.multipleDefaultTargets": "Multiple default targets found!",
        "qx.tool.cli.compile.unusedTarget": "Target type %1, index %2 is unused",
        "qx.tool.cli.compile.selectingDefaultApp":
          "You have multiple applications, none of which are marked as 'default'; the first application named %1 has been chosen as the default application",
        "qx.tool.cli.compile.legacyFiles": "File %1 exists but is no longer used",
        "qx.tool.cli.compile.deprecatedCompile": "The configuration setting %1 in compile.json is deprecated",
        "qx.tool.cli.compile.deprecatedCompileSeeOther": "The configuration setting %1 in compile.json is deprecated (see %2)",
        "qx.tool.cli.compile.deprecatedUri":
          "URIs are no longer set in compile.json, the configuration setting %1=%2 in compile.json is ignored (it's auto detected)",
        "qx.tool.compiler.cli.compile.deprecatedProvidesBoot":
          "Manifest.Json no longer supports provides.boot - only Applications can have boot; specified in %1",
        "qx.tool.cli.compile.deprecatedBabelOptions": "Deprecated use of `babelOptions` - these should be moved to `babel.options`",
        "qx.tool.cli.compile.deprecatedBabelOptionsConflicting":
          "Conflicting use of `babel.options` and the deprecated `babelOptions` (ignored)"
      },

      "warning"
    );
  }
});
