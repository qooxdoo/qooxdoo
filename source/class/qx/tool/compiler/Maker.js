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

var path = require("upath");

/**
 * Application maker; supports multiple applications to compile against a single
 * target
 */
qx.Class.define("qx.tool.compiler.Maker", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param className {String|String[]} classname(s) to generate
   * @param theme {String} the theme classname
   */
  construct(className, theme) {
    super();
    this.__compiledClasses = {};
    this.__applications = [];
    if (className) {
      var app = new qx.tool.compiler.app.Application(className);
      if (theme) {
        app.setTheme(theme);
      }
      this.addApplication(app);
    }
  },

  properties: {
    /** Database filename relative to the target's output directory; if null, defaults to db.json; absolute paths can be used */
    dbFilename: {
      init: null,
      nullable: true,
      check: "String",
      apply: "__applyDbFilename"
    },

    /** Map of environment settings */
    environment: {
      init: null,
      nullable: true
    },

    /** Blocks automatic deleting of the output directory */
    noErase: {
      init: false,
      check: "Boolean"
    },

    /** Whether the make has succeeded, null during/before make */
    success: {
      init: null,
      nullable: true,
      check: "Boolean"
    },

    /** Whether the make has any warnings, null during/before make */
    hasWarnings: {
      init: null,
      nullable: true,
      check: "Boolean"
    },

    /** Target for the compiled application */
    target: {
      nullable: false,
      check: "qx.tool.compiler.targets.Target",
      apply: "__applyTarget"
    },

    /** Supported Locales */
    locales: {
      nullable: false,
      init: ["en"],
      apply: "_applyLocales"
    },

    /** Whether to write all translation strings (as opposed to just those used by the classes) */
    writeAllTranslations: {
      init: false,
      nullable: false,
      check: "Boolean",
      apply: "__applyWriteAllTranslations"
    },

    /**
     * This class must implement the interface qx.tool.compiler.ISourceTransformer.
     *
     * If specified, the class name of the source transformer to use,
     * which will transform source code before transpilation.
     * Could be used to implement custom language features.
     */
    transformerClass: {
      check: "String",
      init: null,
      nullable: true
    }
  },

  events: {
    making: "qx.event.type.Event",
    made: "qx.event.type.Event",
    writingApplications: "qx.event.type.Data",
    writingApplication: "qx.event.type.Data",
    writtenApplication: "qx.event.type.Data",
    writtenApplications: "qx.event.type.Data"
  },

  members: {
    /** @type {qx.tool.compiler.ISourceTransformer?} instance of the source transformer */
    __transformer: undefined,

    /** @type {Boolean} whether the maker has been initialised */
    __initialised: false,

    /** @type {Object} */
    __appEnvironments: null,

    /** {Analyzer} current analyzer (created on demand) */
    _analyzer: null,

    /** @type{Object<String,Boolean>} Lookup of classes which have been compiled this session */
    __compiledClasses: null,

    /** @type {qx.tool.compiler.app.Application[]} */
    __applications: null,

    /**
     * Gets the source transformer, creating if necessary
     * @returns {qx.tool.compiler.ISourceTransformer?} instance of the source transformer
     */
    getTransformer() {
      if (this.__transformer === undefined) {
        let transformerClassname = this.getTransformerClass();
        if (!transformerClassname) {
          return (this.__transformer = null);
        }
        let TransformerClass = qx.Class.getByName(transformerClassname);
        if (qx.core.Environment.get("qx.debug")) {
          if (!TransformerClass) {
            throw new Error("Could not find transformer class: " + transformerClassname);
          }
        }
        this.__transformer = new TransformerClass();
      }
      return this.__transformer;
    },

    /**
     * Adds an Application to be made
     * @param {qx.tool.compiler.app.Application} app
     */
    addApplication(app) {
      this.__applications.push(app);
    },

    /**
     * Returns the array of applications
     * @returns {qx.tool.compiler.app.Application[]}
     */
    getApplications() {
      return this.__applications;
    },

    /**
     * This method is called per maker when the compiler starts up.
     * It must be called before we send the class file config to the workers
     */
    async init() {
      this.__initialised = true;
      // merge all environment settings for the analyzer
      let target = this.getTarget();
      let compileEnv = qx.tool.utils.Values.merge(
        {},
        qx.tool.compiler.ClassFile.ENVIRONMENT_CONSTANTS,
        {
          "qx.compiler": true,
          "qx.compiler.version": qx.tool.config.Utils.getCompilerVersion()
        },

        this.getEnvironment(),
        target.getDefaultEnvironment(),
        target.getEnvironment()
      );

      let preserve = target.getPreserveEnvironment();
      if (preserve) {
        let tmp = {};
        preserve.forEach(key => (tmp[key] = true));
        preserve = tmp;
      } else {
        preserve = {};
      }

      let appEnvironments = {};
      this.getApplications().forEach(app => {
        appEnvironments[app.toHashCode()] = qx.tool.utils.Values.merge({}, compileEnv, app.getCalculatedEnvironment());
      });
      this.__appEnvironments = appEnvironments;

      // Analyze the list of environment variables, detect which are shared between all apps
      let allAppEnv = {};
      this.getApplications().forEach(app => {
        let env = appEnvironments[app.toHashCode()];
        Object.keys(env).forEach(key => {
          if (!allAppEnv[key]) {
            allAppEnv[key] = {
              value: env[key],
              same: true
            };
          } else if (allAppEnv[key].value !== env[key]) {
            allAppEnv[key].same = false;
          }
        });
      });

      // If an env setting is the same for all apps, move it to the target for code elimination; similarly,
      //  if it varies between apps, then remove it from the target and make each app specify it individually
      this.getApplications().forEach(app => {
        let env = appEnvironments[app.toHashCode()];
        Object.keys(allAppEnv).forEach(key => {
          if (preserve[key]) {
            env[key] = compileEnv[key];
          } else if (allAppEnv[key].same) {
            delete env[key];
          } else if (env[key] === undefined) {
            env[key] = compileEnv[key];
          }
        });
      });

      // Cleanup to remove env that have been moved to the app
      Object.keys(allAppEnv).forEach(key => {
        if (!preserve[key] && allAppEnv[key].same) {
          compileEnv[key] = allAppEnv[key].value;
        } else {
          delete compileEnv[key];
        }
      });

      let analyzer = this.getAnalyzer();
      await analyzer.open();
      analyzer.setEnvironment(compileEnv);

      // Fonts must be loaded here, before Controller.start() serialises ClassFileConfig
      // and sends it to transpiler workers via callAll("setMakerInfo").
      // Loading them in make() is too late: workers receive the config before make() runs,
      // and setMakerInfo can only be called once per worker.
      for (let library of analyzer.getLibraries()) {
        let fontsData = library.getFontsData();
        for (let fontName in fontsData) {
          let fontData = fontsData[fontName];
          if (!analyzer.getFont(fontName)) {
            let font = analyzer.getFont(fontName, true);
            await font.updateFromManifest(fontData, library);
          }
        }
      }
    },

    /**
     * Makes the application
     *
     */
    async make() {
      if (this.__making) {
        return;
      }
      this.__making = true;
      if (qx.core.Environment.get("qx.debug")) {
        if (!this.__initialised) {
          throw new Error("Maker must be initialized by calling init() before make()");
        }
      }
      var analyzer = this.getAnalyzer();
      let target = this.getTarget();

      await this.fireEventAsync("making");

      this.setSuccess(null);
      this.setHasWarnings(null);
      let success = true;
      let hasWarnings = false;
      let compileEnv = analyzer.getEnvironment();

      if (!this.isNoErase() && analyzer.isContextChanged()) {
        this.error("enviroment changed - delete output dir");
        await this.eraseOutputDir();
        await qx.tool.utils.Utils.makeParentDir(this.getOutputDir());
        await analyzer.resetDatabase();
      }

      await analyzer.initialScan();
      await analyzer.updateEnvironmentData();

      target.setAnalyzer(analyzer);
      this.__applications.forEach(app => app.setAnalyzer(analyzer));
      await target.open();

      for (let library of analyzer.getLibraries()) {
        let fontsData = library.getFontsData();
        for (let fontName in fontsData) {
          let fontData = fontsData[fontName];
          let font = analyzer.getFont(fontName);
          if (!font) {
            font = analyzer.getFont(fontName, true);
            await font.updateFromManifest(fontData, library);
          }
        }
      }
      this.__applications.forEach(function (app) {
        app.getRequiredClasses().forEach(function (className) {
          analyzer.addClass(className);
        });
        if (app.getTheme()) {
          analyzer.addClass(app.getTheme());
        }
      });
      await analyzer.analyzeClasses();

      await analyzer.saveDatabase();

      // Detect which applications need to be recompiled by looking for classes recently compiled
      //  which is on the application's dependency list.  The first time `.make()` is called there
      //  will be no dependencies so we just compile anyway, but `qx compile --watch` will call it
      //  multiple times
      let compiledClasses = this.getRecentlyCompiledClasses(true);
      let db = analyzer.getDatabase();

      var appsThisTime = (
        await Promise.all(
          this.__applications.map(async app => {
            let loadDeps = app.getDependencies();
            if (!loadDeps || !loadDeps.length) {
              return { application: app, analyzer, maker: this };
            }
            let res = loadDeps.some(name => Boolean(compiledClasses[name]));
            let localModules = app.getLocalModules();
            for (let requireName in localModules) {
              let stat = await qx.tool.utils.files.Utils.safeStat(localModules[requireName]);

              res ||= stat.mtime.getTime() > (db?.modulesInfo?.localModules[requireName] || 0);
            }
            return res ? { application: app, analyzer, maker: this } : null;
          })
        )
      ).filter(Boolean);

      await this.fireDataEventAsync("writingApplications", appsThisTime);

      let allAppInfos = [];

      for (let i = 0; i < appsThisTime.length; i++) {
        let { application } = appsThisTime[i];
        if (application.getType() != "browser" && !compileEnv["qx.headless"]) {
          qx.tool.compiler.Console.print("qx.tool.compiler.maker.appNotHeadless", application.getName());
        }
        var appEnv = qx.tool.utils.Values.merge({}, compileEnv, this.__appEnvironments[application.toHashCode()]);

        application.calcDependencies();
        if (application.getFatalCompileErrors()) {
          qx.tool.compiler.Console.print("qx.tool.compiler.maker.appFatalError", application.getName());

          success = false;
          continue;
        }

        let appInfo = appsThisTime[i];

        allAppInfos.push(appInfo);
        await this.fireDataEventAsync("writingApplication", appInfo);
        await target.generateApplication(application, appEnv);
        await this.fireDataEventAsync("writtenApplication", appInfo);
      }

      await this.fireDataEventAsync("writtenApplications", allAppInfos);

      // Report markers (warnings/errors) for every class compiled in this make cycle,
      // and flag whether any warnings were produced (used for --warn-as-error). This is
      // done here - rather than per class as it is compiled - because a class can be
      // transpiled more than once per compile, which would duplicate the output. Using
      // the full list of compiled classes (rather than just an application's load
      // dependencies) ensures markers on classes that are only referenced at runtime
      // are still reported.
      let outputDir = this.getTarget().getOutputDir();
      let Console = qx.tool.compiler.Console.getInstance();
      for (let classname of analyzer.getCompiledClassnames()) {
        let dbClassInfo = analyzer.getDbClassInfo(classname);
        if (!dbClassInfo?.markers) {
          continue;
        }
        for (let marker of dbClassInfo.markers) {
          if (Console.getMessageType(marker.msgId) == "warning") {
            hasWarnings = true;
          }
          qx.tool.compiler.Console.warn(classname + ": " + qx.tool.compiler.Console.decodeMarker(marker) + ` (${outputDir})`);
        }
      }

      await analyzer.saveDatabase();
      this.setSuccess(success);
      this.setHasWarnings(hasWarnings);
      await this.fireEventAsync("made");
      this.__making = false;
    },

    /**
     * Erases the output directory
     */
    async eraseOutputDir() {
      var dir = path.resolve(this.getOutputDir());
      var pwd = path.resolve(process.cwd());
      if (pwd.startsWith(dir) && dir.length <= pwd.length) {
        throw new Error("Output directory (" + dir + ") is a parent directory of PWD");
      }
      await qx.tool.utils.files.Utils.deleteRecursive(dir);
    },

    /**
     * Apply for databaseName property
     * @param value
     * @param oldValue
     * @private
     */
    __applyDbFilename(value, oldValue) {
      if (this._analyzer) {
        throw new Error("Cannot change the database filename once an Analyzer has been created");
      }
    },

    /**
     * Gets the analyzer, creating it if necessary
     * @returns {Analyzer}
     */
    getAnalyzer() {
      if (this._analyzer) {
        return this._analyzer;
      }
      this._analyzer = this._createAnalyzer();
      return this._analyzer;
    },

    /**
     *
     * @param {string} classname
     */
    onClassCompiled(classname) {
      this.__compiledClasses[classname] = true;
    },

    /**
     * Returns a list of classes which have been compiled in this session
     *
     * @param eraseAfter {Boolean?} if true, the list is reset after returning
     * @return {Map} list of class names that have been compiled
     */
    getRecentlyCompiledClasses(eraseAfter) {
      let classes = this.__compiledClasses;
      if (eraseAfter) {
        this.__compiledClasses = {};
      }
      return classes;
    },

    /**
     * Creates the analyzer
     * @returns {Analyzer}
     * @protected
     */
    _createAnalyzer() {
      var analyzer = (this.__analyzer = new qx.tool.compiler.Analyzer(
        path.join(this.getOutputDir(), this.getDbFilename() || "db.json"),
        this
      ));

      analyzer.setOutputDir(this.getOutputDir());
      return analyzer;
    },

    /*
     * @Override
     */
    getOutputDir() {
      return this.getTarget().getOutputDir();
    },

    /**
     * Apply for target property
     * @param value
     * @param oldValue
     * @private
     */
    __applyTarget(value, oldValue) {
      if (this._analyzer) {
        this._analyzer.setOutputDir(value ? value.getOutputDir() : null);
      }
      if (value) {
        value.set({
          locales: this.getLocales(),
          writeAllTranslations: this.getWriteAllTranslations()
        });
      }
    },

    /**
     * Apply for writeAllTranslations
     * @param value
     * @param oldValue
     * @private
     */
    __applyWriteAllTranslations(value, oldValue) {
      if (this.getTarget()) {
        this.getTarget().setWriteAllTranslations(value);
      }
    },

    /**
     * Apply for locales property
     * @param value
     * @param oldValue
     * @private
     */
    _applyLocales(value, oldValue) {
      if (this.getTarget()) {
        this.getTarget().setLocales(value);
      }
    }
  }
});
