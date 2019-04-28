/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

require("@qooxdoo/framework");
const process = require("process");
const Gauge = require("gauge");
const fs = qx.tool.compiler.utils.Promisify.fs;
const semver = require("semver");
const path = require("upath");

require("app-module-path").addPath(process.cwd() + "/node_modules");

require("./Command");
require("./MConfig");

/**
 * Handles compilation of the project by qxcompiler
 */
qx.Class.define("qx.tool.cli.commands.Compile", {
  extend: qx.tool.cli.commands.Command,
  include: [qx.tool.cli.commands.MConfig],

  statics: {

    getYargsCommand: function() {
      return {
        command   : "compile [configFile]",
        describe  : "compiles the current application, using compile.json",
        builder   : {
          "target": {
            describe: "Set the target type: source or build or class name. Default is first target in config file",
            requiresArg: true,
            type: "string"
          },
          "download": {
            alias: "d",
            describe: "Whether to automatically download missing libraries",
            type: "boolean",
            default: true
          },
          "output-path": {
            describe: "Base path for output",
            nargs: 1,
            requiresArg: true,
            type: "string",
            alias: "o"
          },
          "locale": {
            describe: "Compile for a given locale",
            nargs: 1,
            requiresArg: true,
            type: "string",
            array: true
          },
          "update-po-files": {
            describe: "enables detection of translations and writing them out into .po files",
            type: "boolean",
            default: false,
            alias: "u"
          },
          "write-all-translations": {
            describe: "enables output of all translations, not just those that are explicitly referenced",
            type: "boolean"
          },
          "set": {
            describe: "sets an environment value",
            nargs: 1,
            requiresArg: true,
            type: "string",
            array: true
          },
          "app-class": {
            describe: "sets the application class",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "app-theme": {
            describe: "sets the theme class for the current application",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "app-name": {
            describe: "sets the name of the current application",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "library": {
            describe: "adds a library",
            nargs: 1,
            requiresArg: true,
            type: "string",
            array: true
          },
          "watch": {
            describe: "enables watching for changes and continuous compilation",
            type: "boolean",
            alias: "w"
          },
          "machine-readable": {
            describe: "output compiler messages in machine-readable format",
            type: "boolean"
          },
          "verbose": {
            alias: "v",
            describe: "enables additional progress output to console",
            type: "boolean"
          },
          "minify": {
            describe: "disables minification (for build targets only)",
            choices: [ "off", "minify", "mangle", "beautify" ],
            default: "mangle"
          },
          "save-unminified": {
            describe: "Saves a copy of the unminified version of output files (build target only)",
            type: "boolean",
            default: false
          },
          "erase": {
            describe: "Enabled automatic deletion of the output directory when compiler version changes",
            type: "boolean",
            default: true
          },
          "feedback": {
            describe: "Shows gas-gauge feedback",
            type: "boolean",
            default: true,
            alias: "f"
          },
          "typescript": {
            describe: "Outputs typescript definitions in qooxdoo.d.ts",
            type: "boolean"
          },
          "add-created-at": {
            describe: "Adds code to populate object's $$createdAt",
            type: "boolean"
          },
          "clean": {
            describe: "Deletes the target dir before compile",
            type: "boolean"
          },
          "warnAsError": {
            alias: "e",
            default: false,
            describe: "Handle compiler warnings as error"
          },
          "write-library-info": {
            describe: "Write library information to the script, for reflection",
            type: "boolean",
            default: true
          },
          "bundling": {
            describe: "Whether bundling is enabled",
            type: "boolean",
            default: true
          },
          "force": {
            describe: "Override warnings",
            type: "boolean",
            default: false,
            alias: "F"
          }
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.Compile(argv)
            .process()
            .catch(e => {
              console.error("Error: " + (e.stack || e.message));
              process.exit(1);
            });
        }
      };
    }

  },

  events: {

    /*** fired when application writing starts */
    "writingApplications": "qx.event.type.Event",
    /** fired when writing of single application starts
     *  data: app {Application}
     */
    "writingApplication": "qx.event.type.Data",
    /** fired when writing of single application is written
     *  data: app {Application}
     */
    "writtenApplication": "qx.event.type.Data",
    /*** fired after writing of all applications */
    "writtenApplications" :"qx.event.type.Event",

    /**
     * Fired when a class is about to be compiled; data is a map:
     *
     * dbClassInfo: {Object} the newly populated class info
     * oldDbClassInfo: {Object} the previous populated class info
     * classFile - {ClassFile} the qx.tool.compiler.ClassFile instance
     */
    "compilingClass": "qx.event.type.Data",

    /**
     * Fired when a class is compiled; data is a map:
     * dbClassInfo: {Object} the newly populated class info
     * oldDbClassInfo: {Object} the previous populated class info
     * classFile - {ClassFile} the qx.tool.compiler.ClassFile instance
     */
    "compiledClass": "qx.event.type.Data",

    /**
     * Fired when the database is been saved
     * database: {Object} the database to save
     */
    "saveDatabase": "qx.event.type.Data",

    /**
     * Fired after all enviroment data is collected
     *  application {qx.tool.compiler.app.Application} the app
     *  enviroment: {Object} enviroment data
     */
    "checkEnvironment": "qx.event.type.Data",

    /**
     * Fired when making of apps begins
    */
    "making": "qx.event.type.Event",

    /**
     * Fired when making of apps restarts because of
     * changes
    */
    "remaking": "qx.event.type.Event",

    /**
     * Fired when making of apps is done.
    */
    "made": "qx.event.type.Event"

  },


  members: {
    __gauge: null,
    __maker: null,
    __config: null,

    _getMaker: function() {
      return this.__maker;
    },
    _getConfig: function() {
      return this.__config;
    },
    /*
     * @Override
     */
    process: async function() {
      if (this.argv["machine-readable"]) {
        qx.tool.compiler.Console.getInstance().setMachineReadable(true);
      } else if (this.argv["feedback"]) {
        this.__gauge = new Gauge();
        this.__gauge.show("Compiling", 0);
        const TYPES = {
          "error": "ERROR",
          "warning": "Warning"
        };
        qx.tool.compiler.Console.getInstance().setWriter((str, msgId) => {
          msgId = qx.tool.compiler.Console.MESSAGE_IDS[msgId];
          if (msgId.type !== "message") {
            this.__gauge.hide();
            console.log(TYPES[msgId.type] + ": " + str);
            this.__gauge.show();
          } else {
            this.__gauge.show(str);
          }
        });
      }

      var config = this.__config = await this.parse(this.argv);
      if (!config) {
        throw new qx.tool.cli.Utils.UserError("Error: Cannot find any configuration");
      }
      var maker = this.__maker = await this.createMakerFromConfig(config);
      if (!maker) {
        throw new qx.tool.cli.Utils.UserError("Error: Cannot find anything to make");
      }

      let errors = await this.__checkDependencies(maker, config.packages);
      if (errors.length > 0) {
        if (this.argv.warnAsError) {
          throw new qx.tool.cli.Utils.UserError(errors.join("\n"));
        } else {
          console.log(errors.join("\n"));
        }
      }

      if (this.argv["clean"]) {
        await maker.eraseOutputDir();
        await qx.tool.compiler.files.Utils.safeUnlink(maker.getAnalyser().getDbFilename());
        await qx.tool.compiler.files.Utils.safeUnlink(maker.getAnalyser().getResDbFilename());
      }
      var analyser = maker.getAnalyser();
      var target = maker.getTarget();
      if (this.__gauge) {
        maker.addListener("writingApplications", () => this.__gauge.show("Writing Applications", 0));
        maker.addListener("writtenApplications", () => this.__gauge.show("Writing Applications", 1));
        maker.addListener("writingApplication", evt => this.__gauge.pulse("Writing Application " + evt.getData().getName()));
        analyser.addListener("compilingClass", evt => this.__gauge.pulse("Compiling " + evt.getData().classFile.getClassName()));
        if (target instanceof qx.tool.compiler.targets.BuildTarget) {
          target.addListener("minifyingApplication", evt => this.__gauge.pulse("Minifying " + evt.getData().application.getName() + " " + evt.getData().filename));
        }
      } else {
        maker.addListener("writingApplication", evt => qx.tool.compiler.Console.print("qx.tool.cli.compile.writingApplication", evt.getData().getName()));
        if (target instanceof qx.tool.compiler.targets.BuildTarget) {
          target.addListener("minifyingApplication", evt => qx.tool.compiler.Console.print("qx.tool.cli.compile.minifyingApplication", evt.getData().application.getName(), evt.getData().filename));
        }
        if (this.argv.verbose) {
          var startTimes = {};
          analyser.addListener("compilingClass", evt => {
            var classname = evt.getData().classFile.getClassName();
            startTimes[classname] = new Date();
            qx.tool.compiler.Console.print("qx.tool.cli.compile.compilingClass", classname);
          });
          analyser.addListener("compiledClass", evt => {
            var classname = evt.getData().classFile.getClassName();
            var startTime = startTimes[classname];
            var endTime = new Date();
            var diff = endTime.getTime() - startTime.getTime();
            qx.tool.compiler.Console.print("qx.tool.cli.compile.compiledClass", classname, qx.tool.cli.Utils.formatTime(diff));
          });
        }
      }
      maker.addListener("writingApplications", e => this.dispatchEvent(e.clone()));
      maker.addListener("writtenApplications", e => {
        this.dispatchEvent(e.clone());
        if (this.argv.verbose) {
          console.log("\nCompleted all applications, libraries used are:");
          maker.getAnalyser().getLibraries().forEach(lib => {
            console.log(`   ${lib.getNamespace()} (${lib.getRootDir()})`);
          });
        }
      });
      maker.addListener("writingApplication", e => this.dispatchEvent(e.clone()));
      maker.addListener("writtenApplication", e => this.dispatchEvent(e.clone()));
      analyser.addListener("compilingClass", e => this.dispatchEvent(e.clone()));
      analyser.addListener("compiledClass", e => this.dispatchEvent(e.clone()));
      analyser.addListener("saveDatabase", e => this.dispatchEvent(e.clone()));
      target.addListener("checkEnvironment", e => this.dispatchEvent(e.clone()));

      var p = qx.tool.compiler.files.Utils.safeStat("source/index.html")
        .then(stat => stat && qx.tool.compiler.Console.print("qx.tool.cli.compile.legacyFiles", "source/index.html"));

      // Simple one of make
      if (!this.argv.watch) {
        return p.then(() => {
          this.fireEvent("making");
          maker.addListener("writtenApplications", e => this.fireEvent("made"));
          return maker.make()
            .then(() => {
              if (this.__gauge) {
                this.__gauge.show("Compiling", 1);
              }
            });
        });
      }

      // Continuous make
      let watch = new qx.tool.cli.Watch(maker);
      watch.addListener("making", e => this.dispatchEvent(e.clone()));
      watch.addListener("remaking", e => this.dispatchEvent(e.clone()));
      watch.addListener("made", e => this.dispatchEvent(e.clone()));
      return p.then(() => watch.start());
    },


    /**
     * Processes the configuration from a JSON data structure and creates a Maker
     *
     * @param data {Map}
     * @return {Maker}
     */
    createMakerFromConfig: async function(data) {
      var t = this;
      var maker = null;

      var outputPath = data.target.outputPath;
      if (!outputPath) {
        throw new qx.tool.cli.Utils.UserError("Missing output-path for target " + data.target.type);
      }

      maker = new qx.tool.compiler.makers.AppMaker();
      if (!this.argv["erase"]) {
        maker.setNoErase(true);
      }

      if (!data.target) {
        throw new qx.tool.cli.Utils.UserError("No target specified");
      }
      var targetClass = data.target.targetClass ? this.resolveTargetClass(data.target.targetClass): null;
      if (!targetClass && data.target.type) {
        targetClass = this.resolveTargetClass(data.target.type);
      }
      if (!targetClass) {
        throw new qx.tool.cli.Utils.UserError("Cannot find target class: " + (data.target.targetClass||data.target.type));
      }
      /* eslint-disable new-cap */
      var target = new targetClass(outputPath);
      /* eslint-enable new-cap */
      if (data.target.uri) {
        qx.tool.compiler.Console.print("qx.tool.cli.compile.deprecatedUri", "target.uri", data.target.uri);
      }
      if (data.target.writeCompileInfo) {
        target.setWriteCompileInfo(true);
      }
      target.setWriteLibraryInfo(this.argv.writeLibraryInfo);
      target.setUpdatePoFiles(this.argv.updatePoFiles);
      maker.setTarget(target);

      maker.setLocales(data.locales||[ "en" ]);
      if (data.writeAllTranslations) {
        maker.setWriteAllTranslations(data.writeAllTranslations);
      }

      if (typeof data.target.typescript == "string") {
        maker.set({ outputTypescript: true, outputTypescriptTo: data.target.typescript });
      } else if (typeof data.target.typescript == "boolean") {
        maker.set({ outputTypescript: true });
      }
      if (this.argv["typescript"]) {
        maker.set({ outputTypescript: true });
      }

      if (data.environment) {
        maker.setEnvironment(data.environment);
      }
      if (data.target.environment) {
        target.setEnvironment(data.target.environment);
      }

      if (data["path-mappings"]) {
        for (var from in data["path-mappings"]) {
          var to = data["path-mappings"][from];
          target.addPathMapping(from, to);
        }
      }

      function mergeArray(dest, ...srcs) {
        srcs.forEach(function(src) {
          if (src) {
            src.forEach(function(elem) {
              if (!qx.lang.Array.contains(dest, src)) {
                dest.push(elem);
              }
            });
          }
        });
        return dest;
      }
      let babelOptions = data.babelOptions || {};
      qx.lang.Object.mergeWith(babelOptions, data.target.babelOptions || {});
      maker.getAnalyser().setBabelOptions(babelOptions);

      var addCreatedAt = data.target["addCreatedAt"] || t.argv["addCreatedAt"];
      if (addCreatedAt) {
        maker.getAnalyser().setAddCreatedAt(true);
      }

      var appNames = null;
      if (t.argv["app-name"]) {
        appNames = t.argv["app-name"].split(",");
      }

      let hasExplicitDefaultApp = false;
      let defaultApp = null;
      data.applications.forEach(function(appData, appIndex) {
        if (appNames && appNames.indexOf(appData.name) === -1) {
          return;
        }
        var app = new qx.tool.compiler.app.Application(appData["class"]);
        [ "type", "theme", "name", "environment", "outputPath", "bootPath", "loaderTemplate"].forEach(name => {
          if (appData[name] !== undefined) {
            var fname = "set" + qx.lang.String.firstUp(name);
            app[fname](appData[name]);
          }
        });
        if (app.isBrowserApp()) {
          var setDefault;
          if (appData.writeIndexHtmlToRoot !== undefined) {
            qx.tool.compiler.Console.print("qx.tool.cli.compile.deprecatedCompileSeeOther", "application.writeIndexHtmlToRoot", "application.default");
            setDefault = appData.writeIndexHtmlToRoot;
          } else if (appData["default"] !== undefined) {
            setDefault = appData["default"];
          }

          if (setDefault !== undefined) {
            if (setDefault) {
              if (hasExplicitDefaultApp) {
                throw new qx.tool.cli.Utils.UserError("Error: Can only set one application to be the default application!");
              }
              hasExplicitDefaultApp = true;
              defaultApp = app;
            }
          } else if (!defaultApp) {
            defaultApp = app;
          }
        }
        if (appData.uri) {
          qx.tool.compiler.Console.print("qx.tool.cli.compile.deprecatedUri", "application.uri", appData.uri);
        }
        if (appData.title) {
          app.setTitle(appData.title);
        }

        // Take the command line for `minify` as most precedent only if provided
        var minify;
        if ((process.argv.indexOf("--minify") > -1)) {
          minify = t.argv["minify"];
        }
        minify = minify || appData["minify"] || data.target["minify"] || t.argv["minify"];
        if (typeof minify == "boolean") {
          minify = minify ? "minify" : "off";
        }
        if (!minify) {
          minify = "mangle";
        }
        if (typeof target.setMinify == "function") {
          target.setMinify(minify);
        }
        var saveUnminified = appData["save-unminified"] || data.target["save-unminified"] || t.argv["save-unminified"];
        if (typeof saveUnminified == "boolean" && typeof target.setSaveUnminified == "function") {
          target.setSaveUnminified(saveUnminified);
        }

        var parts = appData.parts || data.target.parts || data.parts;
        if (parts) {
          if (!parts.boot) {
            throw new qx.tool.cli.Utils.UserError("Cannot determine a boot part for application " + (appIndex + 1) + " " + (appData.name||""));
          }
          for (var partName in parts) {
            var partData = parts[partName];
            var include = typeof partData.include == "string" ? [ partData.include ] : partData.include;
            var exclude = typeof partData.exclude == "string" ? [ partData.exclude ] : partData.exclude;
            var part = new qx.tool.compiler.app.Part(partName, include, exclude).set({
              combine: Boolean(partData.combine),
              minify: Boolean(partData.minify)
            });
            app.addPart(part);
          }
        }

        if (target.getType() == "source" && t.argv.bundling) {
          var bundle = appData.bundle || data.target.bundle || data.bundle;
          if (bundle) {
            if (bundle.include) {
              app.setBundleInclude(bundle.include);
            }
            if (bundle.exclude) {
              app.setBundleExclude(bundle.exclude);
            }
          }
        }

        app.set({
          exclude: mergeArray([], data.exclude, data.target.exclude, appData.exclude),
          include: mergeArray([], data.include, data.target.include, appData.include)
        });
        maker.addApplication(app);
      });

      if (defaultApp) {
        defaultApp.setWriteIndexHtmlToRoot(true);
      } else {
        qx.tool.compiler.files.Utils.safeUnlink(target.getOutputDir() + target.getScriptPrefix() + "index.html");
      }

      maker.getAnalyser().addListener("compiledClass", function(evt) {
        var data = evt.getData();
        var markers = data.dbClassInfo.markers;
        if (markers) {
          markers.forEach(function(marker) {
            var str = qx.tool.compiler.Console.decodeMarker(marker);
            console.warn(data.classFile.getClassName() + ": " + str);
          });
        }
      });

      if (!data.libraries.every(libData => fs.existsSync(libData + "/Manifest.json"))) {
        console.log("One or more libraries not found - trying to install them from library repository...");
        const installer = new qx.tool.cli.commands.package.Install({
          quiet: true,
          save: false
        });
        await installer.process();
      }

      const addLibraryAsync = qx.tool.compiler.utils.Promisify.promisify(maker.addLibrary, maker);
      await qx.Promise.all(data.libraries.map(libData => addLibraryAsync(libData)));

      // Search for Qooxdoo library if not already provided
      var qxLib = maker.getAnalyser().findLibrary("qx");
      if (!qxLib) {
        await addLibraryAsync(await this.getGlobalQxPath());
      }
      if (this.argv.verbose) {
        qxLib = maker.getAnalyser().findLibrary("qx");
        console.log("QooxDoo found in " + qxLib.getRootDir());
      }
      return maker;
    },

    /**
     * Checks the dependencies of the current library
     * @param {qx.tool.compiler.makers.Maker} maker
     *    The maker object
     * @param {Object|*} packages
     *    If given, an object mapping library uris to library paths
     * @return {Promise<Array>} Array of error messages
     * @private
     */
    __checkDependencies: async function(maker, packages) {
      let errors = [];
      let libs = maker.getAnalyser().getLibraries();
      const SDK_VERSION = await this.getUserQxVersion();
      // check all requieres
      for (let lib of libs) {
        let requires = lib.getRequires();
        if (!requires) {
          requires = {};
        }
        if (!packages) {
          packages = {};
        }
        // check for qooxdoo-range
        let range = lib.getLibraryInfo()["qooxdoo-range"];
        if (range) {
          if (this.argv.verbose) {
            console.warn(`${lib.getNamespace()}: The configuration setting "qooxdoo-range" in Manifest.json has been deprecated in favor of "requires.@qooxdoo/framework")`);
          }
          if (!requires["@qooxdoo/framework"]) {
            requires["@qooxdoo/framework"] = range;
          }
        }
        let requires_uris = Object.getOwnPropertyNames(requires).filter(name => !name.startsWith("qooxdoo-") && name !== "@qooxdoo/framework" && name !== "@qooxdoo/compiler");
        let pkg_libs = Object.getOwnPropertyNames(packages);
        if (requires_uris.length > 0 && pkg_libs.length === 0) {
            // if we don't have package data
            if (this.argv.download) {
              // but we're instructed to download the libraries
              if (this.argv.verbose) {
                console.info(`>>> Installing latest compatible version of required libraries...`);
              }
              const installer = new qx.tool.cli.commands.package.Install({
                verbose: this.argv.verbose,
                save: false // save to lockfile only, not to manifest
              });
              await installer.process();
              throw new qx.tool.cli.Utils.UserError("Added missing library information from Manifest. Please restart the compilation.");
            } else {
              throw new qx.tool.cli.Utils.UserError("No library information available. Try 'qx compile --download'");
            }
          }

          for (let reqUri of Object.getOwnPropertyNames(requires)) {
            let reqVersion = requires[reqUri];
            switch (reqUri) {
              // npm release only
              case "qooxdoo-compiler":
              case "@qooxdoo/compiler": {
                let qxVer = qx.tool.compiler.Version.VERSION;
                if (!semver.satisfies(qxVer, reqVersion, {loose: true})) {
                  errors.push(`${lib.getNamespace()}: Needs @qooxdoo/compiler version ${reqVersion}, found ${qxVer}`);
                }
                break;
              }
              // npm release only
              case "qooxdoo-sdk":
              case "@qooxdoo/framework": {
                let qxVer = SDK_VERSION;
                if (!semver.satisfies(qxVer, reqVersion, {loose: true})) {
                  errors.push(`${lib.getNamespace()}: Needs @qooxdoo/framework version ${reqVersion}, found ${qxVer}`);
                }
                break;
              }
              // github repository release or commit-ish identifier
              default: {
                let l = libs.find(entry => path.relative("", entry.getRootDir()) === packages[reqUri]);
                if (!l) {
                  errors.push(`${lib.getNamespace()}: Cannot find required library '${reqUri}'`);
                  break;
                }
                // github release of a package
                let libVersion = l.getLibraryInfo().version;
                if (!semver.valid(libVersion, {loose: true})) {
                  console.warn(`${reqUri}: Version is not valid: ${libVersion}`);
                } else if (!semver.satisfies(libVersion, reqVersion, {loose: true})) {
                  errors.push(`${lib.getNamespace()}: Needs ${reqUri} version ${reqVersion}, found ${libVersion}`);
                }
                break;
            }
          }
        }
      }
      return errors;
    },

    /**
     * Resolves the target class instance from the type name; accepts "source" or "build" or
     * a class name
     * @param type {String}
     * @returns {Maker}
     */
    resolveTargetClass: function(type) {
      if (!type) {
        return null;
      }
      if (type.$$type == "Class") {
        return type;
      }
      if (type == "build") {
        return qx.tool.compiler.targets.BuildTarget;
      }
      if (type == "source") {
        return qx.tool.compiler.targets.SourceTarget;
      }
      if (type == "typescript") {
        throw new qx.tool.cli.Utils.UserError("Typescript targets are no longer supported - please use `typescript: true` in source target instead");
      }
      if (type) {
        var targetClass;
        if (type.indexOf(".") < 0) {
          targetClass = qx.Class.getByName("qx.tool.compiler.targets." + type);
        } else {
          targetClass = qx.Class.getByName(type);
        }
        return targetClass;
      }
      return null;
    }
  },

  defer: function(statics) {
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.cli.compile.writingApplication": "Writing application %1",
      "qx.tool.cli.compile.minifyingApplication": "Minifying %1 %2",
      "qx.tool.cli.compile.compilingClass": "Compiling class %1",
      "qx.tool.cli.compile.compiledClass": "Compiled class %1 in %2s"
    });
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.cli.compile.legacyFiles": "File %1 exists but is no longer used",
      "qx.tool.cli.compile.deprecatedCompile": "The configuration setting %1 in compile.json is deprecated",
      "qx.tool.cli.compile.deprecatedCompileSeeOther": "The configuration setting %1 in compile.json is deprecated (see %2)",
      "qx.tool.cli.compile.deprecatedUri": "URIs are no longer set in compile.json, the configuration setting %1=%2 in compile.json is ignored (it's auto detected)",
      "qx.tool.cli.compile.deprecatedProvidesBoot": "Manifest.Json no longer supports provides.boot - only Applications can have boot; specified in %1"
    }, "warning");
  }
});
