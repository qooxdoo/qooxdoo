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

const process = require("process");
const Gauge = require("gauge");
const semver = require("semver");
const path = require("upath");
const consoleControl = require("console-control-strings");
const fs = qx.tool.utils.Promisify.fs;

require("app-module-path").addPath(process.cwd() + "/node_modules");

/**
 * Handles compilation of the project
 */
qx.Class.define("qx.tool.cli.commands.Compile", {
  extend: qx.tool.cli.commands.Command,

  statics: {
    YARGS_BUILDER: {
      target: {
        alias: "t",
        describe:
          "Set the target type: source or build or class name. Default is first target in config file",
        requiresArg: true,
        type: "string"
      },

      "output-path-prefix": {
        describe:
          "Sets a prefix for the output path of the target - used to compile a version into a non-standard directory",
        type: "string"
      },

      download: {
        alias: "d",
        describe: "Whether to automatically download missing libraries",
        type: "boolean",
        default: true
      },

      locale: {
        alias: "l",
        describe: "Compile for a given locale",
        nargs: 1,
        requiresArg: true,
        type: "string",
        array: true
      },

      "update-po-files": {
        alias: "u",
        describe:
          "enables detection of translations and writing them out into .po files",
        type: "boolean",
        default: false
      },

      "library-po": {
        describe: "The policy for updating translations in libraries",
        type: ["ignore", "untranslated", "all"],
        default: "ignore"
      },

      "write-all-translations": {
        describe:
          "enables output of all translations, not just those that are explicitly referenced",
        type: "boolean"
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

      "app-group": {
        describe: "which application groups to compile (defaults to all)",
        nargs: 1,
        requiresArg: true,
        type: "string"
      },

      watch: {
        describe: "enables watching for changes and continuous compilation",
        type: "boolean",
        alias: "w"
      },

      "watch-debug": {
        describe: "enables debug messages for watching",
        type: "boolean"
      },

      "machine-readable": {
        alias: "M",
        describe: "output compiler messages in machine-readable format",
        type: "boolean"
      },

      minify: {
        alias: "m",
        describe: "disables minification (build targets only)",
        choices: ["off", "minify", "mangle", "beautify"],
        default: "mangle"
      },

      "mangle-privates": {
        describe: "Whether to mangle private variables",
        default: true,
        type: "boolean"
      },

      "save-source-in-map": {
        describe: "Saves the source code in the map file (build target only)",
        type: "boolean",
        default: false
      },

      "source-map-relative-paths": {
        describe:
          "If true, the source file will be saved in the map file if the target supports it. Can be overridden on a per application basis.",
        type: "boolean",
        default: false
      },

      "save-unminified": {
        alias: "u",
        describe:
          "Saves a copy of the unminified version of output files (build target only)",
        type: "boolean",
        default: false
      },

      "inline-external-scripts": {
        describe: "Inlines external Javascript",
        type: "boolean"
      },

      erase: {
        alias: "e",
        describe:
          "Enabled automatic deletion of the output directory when compiler version or environment variables change",
        type: "boolean",
        default: true
      },

      feedback: {
        describe: "Shows gas-gauge feedback",
        type: "boolean",
        alias: "f"
      },

      typescript: {
        alias: "T",
        describe: "Outputs typescript definitions in qooxdoo.d.ts",
        type: "boolean"
      },

      "add-created-at": {
        describe: "Adds code to populate object's $$createdAt",
        type: "boolean"
      },

      clean: {
        alias: "D",
        describe: "Deletes the target dir before compile",
        type: "boolean"
      },

      "warn-as-error": {
        alias: "E",
        describe: "Handle compiler warnings as error",
        type: "boolean",
        default: false
      },

      "write-library-info": {
        alias: "I",
        describe: "Write library information to the script, for reflection",
        type: "boolean",
        default: true
      },

      "write-compile-info": {
        describe:
          "Write application summary information to the script, used mostly for unit tests",
        type: "boolean",
        default: false
      },

      bundling: {
        alias: "b",
        describe: "Whether bundling is enabled",
        type: "boolean",
        default: true
      }
    },

    getYargsCommand() {
      return {
        command: "compile",
        describe: "compiles the current application, using compile.json",
        builder: qx.tool.cli.commands.Compile.YARGS_BUILDER
      };
    }
  },

  events: {
    /**
     * Fired when application writing starts
     */
    writingApplications: "qx.event.type.Event",

    /**
     * Fired when writing of single application starts; data is an object containing:
     *   maker {qx.tool.compiler.makers.Maker}
     *   target {qx.tool.compiler.targets.Target}
     *   appMeta {qx.tool.compiler.targets.meta.ApplicationMeta}
     */
    writingApplication: "qx.event.type.Data",

    /**
     * Fired when writing of single application is complete; data is an object containing:
     *   maker {qx.tool.compiler.makers.Maker}
     *   target {qx.tool.compiler.targets.Target}
     *   appMeta {qx.tool.compiler.targets.meta.ApplicationMeta}
     *
     * Note that target.getAppMeta() will return null after this event has been fired
     */
    writtenApplication: "qx.event.type.Data",

    /**
     * Fired after writing of all applications; data is an object containing an array,
     * each of which has previously been passed with `writeApplication`:
     *   maker {qx.tool.compiler.makers.Maker}
     *   target {qx.tool.compiler.targets.Target}
     *   appMeta {qx.tool.compiler.targets.meta.ApplicationMeta}
     *
     * Note that target.getAppMeta() will return null after this event has been fired
     */

    writtenApplications: "qx.event.type.Data",

    /**
     * Fired when a class is about to be compiled.
     *
     * The event data is an object with the following properties:
     *
     * dbClassInfo: {Object} the newly populated class info
     * oldDbClassInfo: {Object} the previous populated class info
     * classFile - {ClassFile} the qx.tool.compiler.ClassFile instance
     */
    compilingClass: "qx.event.type.Data",

    /**
     * Fired when a class is compiled.
     *
     * The event data is an object with the following properties:
     * dbClassInfo: {Object} the newly populated class info
     * oldDbClassInfo: {Object} the previous populated class info
     * classFile - {ClassFile} the qx.tool.compiler.ClassFile instance
     */
    compiledClass: "qx.event.type.Data",

    /**
     * Fired when the database is been saved
     *
     *  data:
     * database: {Object} the database to save
     */
    saveDatabase: "qx.event.type.Data",

    /**
     * Fired after all enviroment data is collected
     *
     * The event data is an object with the following properties:
     *  application {qx.tool.compiler.app.Application} the app
     *  enviroment: {Object} enviroment data
     */
    checkEnvironment: "qx.event.type.Data",

    /**
     * Fired when making of apps begins
     */
    making: "qx.event.type.Event",

    /**
     * Fired when making of apps is done.
     */
    made: "qx.event.type.Event",

    /**
     * Fired when minification begins.
     *
     * The event data is an object with the following properties:
     *  application {qx.tool.compiler.app.Application} the app being minified
     *  part: {String} the part being minified
     *  filename: {String} the part filename
     */
    minifyingApplication: "qx.event.type.Data",

    /**
     * Fired when minification is done.
     *
     * The event data is an object with the following properties:
     *  application {qx.tool.compiler.app.Application} the app being minified
     *  part: {String} the part being minified
     *  filename: {String} the part filename
     */
    minifiedApplication: "qx.event.type.Data"
  },

  members: {
    __gauge: null,
    __makers: null,
    __config: null,
    __libraries: null,
    __outputDirWasCreated: false,

    /*
     * @Override
     */
    async process() {
      await super.process();

      let configDb = await qx.tool.cli.ConfigDb.getInstance();
      if (this.argv["feedback"] === null) {
        this.argv["feedback"] = configDb.db("qx.default.feedback", true);
      }

      if (this.argv.verbose) {
        console.log(`
Compiler:  v${this.getCompilerVersion()} in ${require.main.filename}
Framework: v${await this.getQxVersion()} in ${await this.getQxPath()}`);
      }

      if (this.argv["machine-readable"]) {
        qx.tool.compiler.Console.getInstance().setMachineReadable(true);
      } else {
        let configDb = await qx.tool.cli.ConfigDb.getInstance();
        let color = configDb.db("qx.default.color", null);
        if (color) {
          let colorOn = consoleControl.color(color.split(" "));
          process.stdout.write(colorOn + consoleControl.eraseLine());
          let colorReset = consoleControl.color("reset");
          process.on("exit", () =>
            process.stdout.write(colorReset + consoleControl.eraseLine())
          );

          let Console = qx.tool.compiler.Console.getInstance();
          Console.setColorOn(colorOn);
        }

        if (this.argv["feedback"]) {
          var themes = require("gauge/themes");
          var ourTheme = themes.newTheme(
            themes({ hasUnicode: true, hasColor: true })
          );

          let colorOn = qx.tool.compiler.Console.getInstance().getColorOn();
          ourTheme.preProgressbar = colorOn + ourTheme.preProgressbar;
          ourTheme.preSubsection = colorOn + ourTheme.preSubsection;
          ourTheme.progressbarTheme.postComplete += colorOn;
          ourTheme.progressbarTheme.postRemaining += colorOn;

          this.__gauge = new Gauge();
          this.__gauge.setTheme(ourTheme);
          this.__gauge.show("Compiling", 0);
          const TYPES = {
            error: "ERROR",
            warning: "Warning"
          };

          qx.tool.compiler.Console.getInstance().setWriter((str, msgId) => {
            msgId = qx.tool.compiler.Console.MESSAGE_IDS[msgId];
            if (!msgId || msgId.type !== "message") {
              this.__gauge.hide();
              qx.tool.compiler.Console.log(
                colorOn + TYPES[(msgId || {}).type || "error"] + ": " + str
              );

              this.__gauge.show();
            } else {
              this.__gauge.show(colorOn + str);
            }
          });
        }
      }

      if (this.__gauge) {
        this.addListener("writingApplications", () =>
          this.__gauge.show("Writing Applications", 0)
        );

        this.addListener("writtenApplications", () =>
          this.__gauge.show("Writing Applications", 1)
        );

        this.addListener("writingApplication", evt =>
          this.__gauge.pulse(
            "Writing Application " +
              evt.getData().appMeta.getApplication().getName()
          )
        );

        this.addListener("compilingClass", evt =>
          this.__gauge.pulse(
            "Compiling " + evt.getData().classFile.getClassName()
          )
        );

        this.addListener("minifyingApplication", evt =>
          this.__gauge.pulse(
            "Minifying " +
              evt.getData().application.getName() +
              " " +
              evt.getData().filename
          )
        );
      } else {
        this.addListener("writingApplication", evt => {
          let appInfo = evt.getData();
          qx.tool.compiler.Console.print(
            "qx.tool.cli.compile.writingApplication",
            appInfo.appMeta.getApplication().getName()
          );
        });
        this.addListener("minifyingApplication", evt =>
          qx.tool.compiler.Console.print(
            "qx.tool.cli.compile.minifyingApplication",
            evt.getData().application.getName(),
            evt.getData().filename
          )
        );
      }

      this.addListener("making", evt => {
        if (this.__gauge) {
          this.__gauge.show("Compiling", 1);
        } else {
          qx.tool.compiler.Console.print("qx.tool.cli.compile.makeBegins");
        }
      });

      this.addListener("made", evt => {
        if (this.__gauge) {
          this.__gauge.show("Compiling", 1);
        } else {
          qx.tool.compiler.Console.print("qx.tool.cli.compile.makeEnds");
        }
      });

      this.addListener("writtenApplications", e => {
        if (this.argv.verbose) {
          qx.tool.compiler.Console.log(
            "\nCompleted all applications, libraries used are:"
          );

          Object.values(this.__libraries).forEach(lib =>
            qx.tool.compiler.Console.log(
              `   ${lib.getNamespace()} (${lib.getRootDir()})`
            )
          );
        }
      });

      await this._loadConfigAndStartMaking();

      if (!this.argv.watch) {
        let success = this.__makers.every(maker => maker.getSuccess());
        let hasWarnings = this.__makers.every(maker => maker.getHasWarnings());
        if (success && hasWarnings && this.argv.warnAsError) {
          success = false;
        }
        if (
          !this.argv.deploying &&
          !this.argv["machine-readable"] &&
          this.argv["feedback"] &&
          this.__outputDirWasCreated &&
          this.argv.target === "build"
        ) {
          qx.tool.compiler.Console.warn(
            "   *******************************************************************************************\n" +
              "   **                                                                                       **\n" +
              "   **  Your compilation will include temporary files that are only necessary during         **\n" +
              "   **  development; these files speed up the compilation, but take up space that you would  **\n" +
              "   **  probably not want to put on a production server.                                     **\n" +
              "   **                                                                                       **\n" +
              "   **  When you are ready to deploy, try running `qx deploy` to get a minimised version     **\n" +
              "   **                                                                                       **\n" +
              "   *******************************************************************************************"
          );
        }
        process.exitCode = success ? 0 : 1;
      }
    },

    /**
     * Loads the configuration and starts the make
     *
     * @return {Boolean} true if all makers succeeded
     */
    async _loadConfigAndStartMaking() {
      var config = (this.__config =
        await qx.tool.cli.Cli.getInstance().getParsedArgs());
      if (!config) {
        throw new qx.tool.utils.Utils.UserError(
          "Error: Cannot find any configuration"
        );
      }
      var makers = (this.__makers = await this.createMakersFromConfig(config));
      if (!makers || !makers.length) {
        throw new qx.tool.utils.Utils.UserError(
          "Error: Cannot find anything to make"
        );
      }

      let countMaking = 0;
      const collateDispatchEvent = evt => {
        if (countMaking == 1) {
          this.dispatchEvent(evt.clone());
        }
      };

      await qx.Promise.all(
        makers.map(async maker => {
          var analyser = maker.getAnalyser();
          let cfg = await qx.tool.cli.ConfigDb.getInstance();
          analyser.setWritePoLineNumbers(
            cfg.db("qx.translation.strictPoCompatibility", false)
          );

          if (!(await fs.existsAsync(maker.getOutputDir()))) {
            this.__outputDirWasCreated = true;
          }
          if (this.argv["clean"]) {
            await maker.eraseOutputDir();
            await qx.tool.utils.files.Utils.safeUnlink(
              analyser.getDbFilename()
            );

            await qx.tool.utils.files.Utils.safeUnlink(
              analyser.getResDbFilename()
            );
          }
          if (config.ignores) {
            analyser.setIgnores(config.ignores);
          }

          var target = maker.getTarget();
          analyser.addListener("compilingClass", e =>
            this.dispatchEvent(e.clone())
          );

          analyser.addListener("compiledClass", e =>
            this.dispatchEvent(e.clone())
          );

          analyser.addListener("saveDatabase", e =>
            this.dispatchEvent(e.clone())
          );

          target.addListener("checkEnvironment", e =>
            this.dispatchEvent(e.clone())
          );

          let appInfos = [];
          target.addListener("writingApplication", async () => {
            let appInfo = {
              maker,
              target,
              appMeta: target.getAppMeta()
            };

            appInfos.push(appInfo);
            await this.fireDataEventAsync("writingApplication", appInfo);
          });
          target.addListener("writtenApplication", async () => {
            await this.fireDataEventAsync("writtenApplication", {
              maker,
              target,
              appMeta: target.getAppMeta()
            });
          });
          maker.addListener("writingApplications", collateDispatchEvent);
          maker.addListener("writtenApplications", async () => {
            await this.fireDataEventAsync("writtenApplications", appInfos);
          });

          if (target instanceof qx.tool.compiler.targets.BuildTarget) {
            target.addListener("minifyingApplication", e =>
              this.dispatchEvent(e.clone())
            );

            target.addListener("minifiedApplication", e =>
              this.dispatchEvent(e.clone())
            );
          }

          let stat = await qx.tool.utils.files.Utils.safeStat(
            "source/index.html"
          );

          if (stat) {
            qx.tool.compiler.Console.print(
              "qx.tool.cli.compile.legacyFiles",
              "source/index.html"
            );
          }

          // Simple one of make
          if (!this.argv.watch) {
            maker.addListener("making", () => {
              countMaking++;
              if (countMaking == 1) {
                this.fireEvent("making");
              }
            });
            maker.addListener("made", () => {
              countMaking--;
              if (countMaking == 0) {
                this.fireEvent("made");
              }
            });

            return await maker.make();
          }

          // Continuous make
          let watch = new qx.tool.cli.Watch(maker);
          config.applications.forEach(appConfig => {
            if (appConfig.runWhenWatching) {
              watch.setRunWhenWatching(
                appConfig.name,
                appConfig.runWhenWatching
              );
            }
          });
          if (this.argv["watch-debug"]) {
            watch.setDebug(true);
          }

          watch.addListener("making", () => {
            countMaking++;
            if (countMaking == 1) {
              this.fireEvent("making");
            }
          });
          watch.addListener("made", () => {
            countMaking--;
            if (countMaking == 0) {
              this.fireEvent("made");
            }
          });
          watch.addListener("configChanged", async () => {
            await watch.stop();
            setImmediate(() => this._loadConfigAndStartMaking());
          });
          let arr = [this._compileJsFilename, this._compileJsonFilename].filter(
            str => Boolean(str)
          );

          watch.setConfigFilenames(arr);
          return await watch.start();
        })
      );
    },

    /**
     * Processes the configuration from a JSON data structure and creates a Maker
     *
     * @param data {Map}
     * @return {Maker}
     */
    async createMakersFromConfig(data) {
      const Console = qx.tool.compiler.Console.getInstance();
      var t = this;
      if (data.babelOptions) {
        if (!data?.babel?.options) {
          data.babel = data.babel || {};
          data.babel.options = data.babelOptions;
          qx.tool.compiler.Console.print(
            "qx.tool.cli.compile.deprecatedBabelOptions"
          );
        } else {
          qx.tool.compiler.Console.print(
            "qx.tool.cli.compile.deprecatedBabelOptionsConflicting"
          );
        }
        delete data.babelOptions;
      }

      var argvAppNames = null;
      if (t.argv["app-name"]) {
        argvAppNames = {};
        t.argv["app-name"]
          .split(",")
          .forEach(name => (argvAppNames[name] = true));
      }
      var argvAppGroups = null;
      if (t.argv["app-group"]) {
        argvAppGroups = {};
        t.argv["app-group"]
          .split(",")
          .forEach(name => (argvAppGroups[name] = true));
      }

      /*
       * Calculate the the list of targets and applications; this is a many to many list, where an
       * application can be compiled for many targets, and each target has many applications.
       *
       * Each target configuration is updated to have `appConfigs[]` and each application configuration
       * is updated to have `targetConfigs[]`.
       */
      data.targets.forEach(
        (targetConfig, index) => (targetConfig.index = index)
      );

      let targetConfigs = [];
      let defaultTargetConfig = null;
      data.targets.forEach(targetConfig => {
        if (targetConfig.type === data.targetType) {
          if (
            !targetConfig["application-names"] &&
            !targetConfig["application-types"]
          ) {
            if (defaultTargetConfig) {
              qx.tool.compiler.Console.print(
                "qx.tool.cli.compile.multipleDefaultTargets"
              );
            } else {
              defaultTargetConfig = targetConfig;
            }
          } else {
            targetConfigs.push(targetConfig);
          }
        }
      });

      let allAppNames = {};
      data.applications.forEach((appConfig, index) => {
        if (appConfig.name) {
          if (allAppNames[appConfig.name]) {
            throw new qx.tool.utils.Utils.UserError(
              `Multiple applications with the same name '${appConfig.name}'`
            );
          }
          allAppNames[appConfig.name] = appConfig;
        }
        if (appConfig.group) {
          if (typeof appConfig.group == "string") {
            appConfig.group = [appConfig.group];
          }
        }
        appConfig.index = index;
        let appType = appConfig.type || "browser";
        let appTargetConfigs = targetConfigs.filter(targetConfig => {
          let appTypes = targetConfig["application-types"];
          if (appTypes && !qx.lang.Array.contains(appTypes, appType)) {
            return false;
          }

          let appNames = targetConfig["application-names"];
          if (
            appConfig.name &&
            appNames &&
            !qx.lang.Array.contains(appNames, appConfig.name)
          ) {
            return false;
          }
          return true;
        });

        if (appTargetConfigs.length == 0) {
          if (defaultTargetConfig) {
            appTargetConfigs = [defaultTargetConfig];
          } else {
            throw new qx.tool.utils.Utils.UserError(
              `Cannot find any suitable targets for application #${index} (named ${
                appConfig.name || "unnamed"
              })`
            );
          }
        }

        appTargetConfigs.forEach(targetConfig => {
          if (!targetConfig.appConfigs) {
            targetConfig.appConfigs = [];
          }
          targetConfig.appConfigs.push(appConfig);
          if (!appConfig.targetConfigs) {
            appConfig.targetConfigs = [];
          }
          appConfig.targetConfigs.push(targetConfig);
        });
      });
      if (defaultTargetConfig && defaultTargetConfig.appConfigs) {
        targetConfigs.push(defaultTargetConfig);
      }

      let libraries = (this.__libraries = {});
      await qx.Promise.all(
        data.libraries.map(async libPath => {
          var library = await qx.tool.compiler.app.Library.createLibrary(
            libPath
          );

          libraries[library.getNamespace()] = library;
        })
      );

      // Search for Qooxdoo library if not already provided
      var qxLib = libraries["qx"];
      if (!qxLib) {
        let qxPath = await qx.tool.config.Utils.getQxPath();
        var library = await qx.tool.compiler.app.Library.createLibrary(qxPath);
        libraries[library.getNamespace()] = library;
        qxLib = libraries["qx"];
      }
      if (this.argv.verbose) {
        Console.log("Qooxdoo found in " + qxLib.getRootDir());
      }
      let errors = await this.__checkDependencies(
        Object.values(libraries),
        data.packages
      );

      if (errors.length > 0) {
        if (this.argv.warnAsError) {
          throw new qx.tool.utils.Utils.UserError(errors.join("\n"));
        } else {
          qx.tool.compiler.Console.log(errors.join("\n"));
        }
      }

      /*
       * Figure out which will be the default application; this will need some work for situations
       * where there are multiple browser based targets
       */
      targetConfigs.forEach(targetConfig => {
        let hasExplicitDefaultApp = false;
        targetConfig.defaultAppConfig = null;
        if (targetConfig.appConfigs) {
          targetConfig.appConfigs.forEach(appConfig => {
            if (appConfig.type && appConfig.type != "browser") {
              return;
            }

            let setDefault;
            if (appConfig.writeIndexHtmlToRoot !== undefined) {
              qx.tool.compiler.Console.print(
                "qx.tool.cli.compile.deprecatedCompileSeeOther",
                "application.writeIndexHtmlToRoot",
                "application.default"
              );

              setDefault = appConfig.writeIndexHtmlToRoot;
            } else if (appConfig["default"] !== undefined) {
              setDefault = appConfig["default"];
            }

            if (setDefault !== undefined) {
              if (setDefault) {
                if (hasExplicitDefaultApp) {
                  throw new qx.tool.utils.Utils.UserError(
                    "Error: Can only set one application to be the default application!"
                  );
                }
                hasExplicitDefaultApp = true;
                targetConfig.defaultAppConfig = appConfig;
              }
            } else if (!targetConfig.defaultAppConfig) {
              targetConfig.defaultAppConfig = appConfig;
            }
          });
          if (!hasExplicitDefaultApp && targetConfig.appConfigs.length > 1) {
            targetConfig.defaultAppConfig = targetConfig.appConfigs[0];
          }
        }
      });

      /*
       * There is still only one target per maker, so convert our list of targetConfigs into an array of makers
       */
      let targetOutputPaths = {};
      let makers = [];

      targetConfigs.forEach(targetConfig => {
        if (!targetConfig.appConfigs) {
          qx.tool.compiler.Console.print(
            "qx.tool.cli.compile.unusedTarget",
            targetConfig.type,
            targetConfig.index
          );

          return;
        }
        let appConfigs = targetConfig.appConfigs.filter(appConfig => {
          if (argvAppGroups) {
            let groups = appConfig.group || [];
            if (!groups.find(groupName => !!argvAppGroups[groupName])) {
              return false;
            }
          }
          if (argvAppNames && appConfig.name) {
            if (!argvAppNames[appConfig.name]) {
              return false;
            }
          }
          return true;
        });
        if (!appConfigs.length) {
          return;
        }

        var outputPath = targetConfig.outputPath;
        if (this.argv.outputPathPrefix) {
          outputPath = path.join(this.argv.outputPathPrefix, outputPath);
        }
        if (!outputPath) {
          throw new qx.tool.utils.Utils.UserError(
            "Missing output-path for target " + targetConfig.type
          );
        }
        let absOutputPath = path.resolve(outputPath);
        if (targetOutputPaths[absOutputPath]) {
          throw new qx.tool.utils.Utils.UserError(
            `Multiple output targets share the same target directory ${outputPath} - each target output must be unique`
          );
        }
        targetOutputPaths[absOutputPath] = true;

        var maker = new qx.tool.compiler.makers.AppMaker();
        if (!this.argv["erase"]) {
          maker.setNoErase(true);
        }

        var targetClass = targetConfig.targetClass
          ? this.resolveTargetClass(targetConfig.targetClass)
          : null;
        if (!targetClass && targetConfig.type) {
          targetClass = this.resolveTargetClass(targetConfig.type);
        }
        if (!targetClass) {
          throw new qx.tool.utils.Utils.UserError(
            "Cannot find target class: " +
              (targetConfig.targetClass || targetConfig.type)
          );
        }
        /* eslint-disable new-cap */
        var target = new targetClass(outputPath);
        /* eslint-enable new-cap */
        if (targetConfig.uri) {
          qx.tool.compiler.Console.print(
            "qx.tool.cli.compile.deprecatedUri",
            "target.uri",
            targetConfig.uri
          );
        }
        if (targetConfig.addTimestampsToUrls !== undefined) {
          target.setAddTimestampsToUrls(targetConfig.addTimestampsToUrls);
        } else {
          target.setAddTimestampsToUrls(
            target instanceof qx.tool.compiler.targets.BuildTarget
          );
        }
        if (targetConfig.writeCompileInfo || this.argv.writeCompileInfo) {
          target.setWriteCompileInfo(true);
        }
        if (data.i18nAsParts) {
          target.setI18nAsParts(true);
        }
        target.setWriteLibraryInfo(this.argv.writeLibraryInfo);
        target.setUpdatePoFiles(this.argv.updatePoFiles);
        target.setLibraryPoPolicy(this.argv.libraryPo);

        // Take the command line for `minify` as most precedent only if provided
        var minify;
        if (process.argv.indexOf("--minify") > -1) {
          minify = t.argv["minify"];
        }
        minify = minify || targetConfig["minify"] || t.argv["minify"];
        if (typeof minify == "boolean") {
          minify = minify ? "minify" : "off";
        }
        if (!minify) {
          minify = "mangle";
        }
        if (typeof target.setMinify == "function") {
          target.setMinify(minify);
        }

        function chooseValue(...args) {
          for (let i = 0; i < args.length; i++) {
            if (args[i] !== undefined) {
              return args[i];
            }
          }
          return undefined;
        }

        // Take the command line for `saveSourceInMap` as most precedent only if provided
        var saveSourceInMap = chooseValue(
          targetConfig["save-source-in-map"],
          t.argv["saveSourceInMap"]
        );

        if (
          typeof saveSourceInMap == "boolean" &&
          typeof target.setSaveSourceInMap == "function"
        ) {
          target.setSaveSourceInMap(saveSourceInMap);
        }

        var sourceMapRelativePaths = chooseValue(
          targetConfig["source-map-relative-paths"],
          t.argv["sourceMapRelativePaths"]
        );

        if (
          typeof sourceMapRelativePaths == "boolean" &&
          typeof target.setSourceMapRelativePaths == "function"
        ) {
          target.setSourceMapRelativePaths(sourceMapRelativePaths);
        }

        var saveUnminified = chooseValue(
          targetConfig["save-unminified"],
          t.argv["save-unminified"]
        );

        if (
          typeof saveUnminified == "boolean" &&
          typeof target.setSaveUnminified == "function"
        ) {
          target.setSaveUnminified(saveUnminified);
        }

        var inlineExternal = chooseValue(
          targetConfig["inline-external-scripts"],
          t.argv["inline-external-scripts"]
        );

        if (typeof inlineExternal == "boolean") {
          target.setInlineExternalScripts(inlineExternal);
        } else if (target instanceof qx.tool.compiler.targets.BuildTarget) {
          target.setInlineExternalScripts(true);
        }

        var deployDir = targetConfig["deployPath"];
        if (deployDir && typeof target.setDeployDir == "function") {
          target.setDeployDir(deployDir);
        }

        var deployMap = targetConfig["deploy-source-maps"];
        if (
          typeof deployMap == "boolean" &&
          typeof target.setDeployDir == "function"
        ) {
          target.setDeployMap(deployMap);
        }

        maker.setTarget(target);

        var manglePrivates = chooseValue(
          targetConfig["mangle-privates"],
          t.argv["mangle-privates"]
        );

        if (typeof manglePrivates == "string") {
          maker.getAnalyser().setManglePrivates(manglePrivates);
        } else if (typeof manglePrivates == "boolean") {
          if (manglePrivates) {
            maker
              .getAnalyser()
              .setManglePrivates(
                target instanceof qx.tool.compiler.targets.BuildTarget
                  ? "unreadable"
                  : "readable"
              );
          } else {
            maker.getAnalyser().setManglePrivates("off");
          }
        }

        if (targetConfig["application-types"]) {
          maker
            .getAnalyser()
            .setApplicationTypes(targetConfig["application-types"]);
        }
        if (targetConfig["proxySourcePath"]) {
          maker
            .getAnalyser()
            .setProxySourcePath(targetConfig["proxySourcePath"]);
        }

        maker.setLocales(data.locales || ["en"]);
        if (data.writeAllTranslations) {
          maker.setWriteAllTranslations(data.writeAllTranslations);
        }

        if (typeof targetConfig.typescript == "string") {
          maker.set({
            outputTypescript: true,
            outputTypescriptTo: targetConfig.typescript
          });
        } else if (typeof targetConfig.typescript == "boolean") {
          maker.set({ outputTypescript: true });
        }
        if (this.argv["typescript"]) {
          maker.set({ outputTypescript: true });
        }

        if (data.environment) {
          maker.setEnvironment(data.environment);
        }
        if (targetConfig.environment) {
          target.setEnvironment(targetConfig.environment);
        }
        if (targetConfig.preserveEnvironment) {
          target.setPreserveEnvironment(targetConfig.preserveEnvironment);
        }

        if (data["path-mappings"]) {
          for (var from in data["path-mappings"]) {
            var to = data["path-mappings"][from];
            target.addPathMapping(from, to);
          }
        }

        function mergeArray(dest, ...srcs) {
          srcs.forEach(function (src) {
            if (src) {
              src.forEach(function (elem) {
                if (!qx.lang.Array.contains(dest, src)) {
                  dest.push(elem);
                }
              });
            }
          });
          return dest;
        }

        let babelConfig = qx.lang.Object.clone(data.babel || {}, true);
        babelConfig.options = babelConfig.options || {};
        qx.lang.Object.mergeWith(
          babelConfig.options,
          targetConfig.babelOptions || {}
        );

        maker.getAnalyser().setBabelConfig(babelConfig);

        var addCreatedAt =
          targetConfig["addCreatedAt"] || t.argv["addCreatedAt"];
        if (addCreatedAt) {
          maker.getAnalyser().setAddCreatedAt(true);
        }

        for (let ns in libraries) {
          maker.getAnalyser().addLibrary(libraries[ns]);
        }

        let allApplicationTypes = {};
        appConfigs.forEach(appConfig => {
          var app = (appConfig.app = new qx.tool.compiler.app.Application(
            appConfig["class"]
          ));

          app.setTemplatePath(qx.tool.utils.Utils.getTemplateDir());

          [
            "type",
            "theme",
            "name",
            "environment",
            "outputPath",
            "bootPath",
            "loaderTemplate",
            "publish",
            "deploy",
            "standalone",
            "localModules"
          ].forEach(name => {
            if (appConfig[name] !== undefined) {
              var fname = "set" + qx.lang.String.firstUp(name);
              app[fname](appConfig[name]);
            }
          });
          allApplicationTypes[app.getType()] = true;
          if (appConfig.uri) {
            qx.tool.compiler.Console.print(
              "qx.tool.cli.compile.deprecatedUri",
              "application.uri",
              appConfig.uri
            );
          }
          if (appConfig.title) {
            app.setTitle(appConfig.title);
          }
          if (appConfig.description) {
            app.setDescription(appConfig.description);
          }

          if (appConfig.localModules) {
            app.setLocalModules(appConfig.localModules);
          }

          var parts = appConfig.parts || targetConfig.parts || data.parts;
          if (parts) {
            if (!parts.boot) {
              throw new qx.tool.utils.Utils.UserError(
                "Cannot determine a boot part for application " +
                  (appConfig.index + 1) +
                  " " +
                  (appConfig.name || "")
              );
            }
            for (var partName in parts) {
              var partData = parts[partName];
              var include =
                typeof partData.include == "string"
                  ? [partData.include]
                  : partData.include;
              var exclude =
                typeof partData.exclude == "string"
                  ? [partData.exclude]
                  : partData.exclude;
              var part = new qx.tool.compiler.app.Part(
                partName,
                include,
                exclude
              ).set({
                combine: Boolean(partData.combine),
                minify: Boolean(partData.minify)
              });

              app.addPart(part);
            }
          }

          if (target.getType() == "source" && t.argv.bundling) {
            var bundle = appConfig.bundle || targetConfig.bundle || data.bundle;
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
            exclude: mergeArray(
              [],
              data.exclude,
              targetConfig.exclude,
              appConfig.exclude
            ),

            include: mergeArray(
              [],
              data.include,
              targetConfig.include,
              appConfig.include
            )
          });

          maker.addApplication(app);
        });

        const CF = qx.tool.compiler.ClassFile;
        let globalSymbols = [];
        qx.lang.Array.append(globalSymbols, CF.QX_GLOBALS);
        qx.lang.Array.append(globalSymbols, CF.COMMON_GLOBALS);
        if (allApplicationTypes["browser"]) {
          qx.lang.Array.append(globalSymbols, CF.BROWSER_GLOBALS);
        }
        if (allApplicationTypes["node"]) {
          qx.lang.Array.append(globalSymbols, CF.NODE_GLOBALS);
        }
        if (allApplicationTypes["rhino"]) {
          qx.lang.Array.append(globalSymbols, CF.RHINO_GLOBALS);
        }
        maker.getAnalyser().setGlobalSymbols(globalSymbols);

        if (
          targetConfig.defaultAppConfig &&
          targetConfig.defaultAppConfig.app &&
          (targetConfig.defaultAppConfig.type || "browser") === "browser"
        ) {
          targetConfig.defaultAppConfig.app.setWriteIndexHtmlToRoot(true);
        } else {
          qx.tool.utils.files.Utils.safeUnlink(
            target.getOutputDir() + "index.html"
          );
        }

        const showMarkers = (classname, markers) => {
          if (markers) {
            markers.forEach(function (marker) {
              var str = qx.tool.compiler.Console.decodeMarker(marker);
              Console.warn(classname + ": " + str);
            });
          }
        };

        // Note - this will cause output multiple times, once per maker/target; but this is largely unavoidable
        //  because different targets can cause different warnings for the same code due to different compilation
        //  options (eg node vs browser)
        maker.getAnalyser().addListener("compiledClass", evt => {
          var data = evt.getData();
          showMarkers(data.classFile.getClassName(), data.dbClassInfo.markers);
        });
        maker.getAnalyser().addListener("alreadyCompiledClass", evt => {
          var data = evt.getData();
          showMarkers(data.className, data.dbClassInfo.markers);
        });

        makers.push(maker);
      });

      return makers;
    },

    /**
     * Checks the dependencies of the current library
     * @param  {qx.tool.compiler.app.Library[]} libs
     *    The list of libraries to check
     * @param {Object|*} packages
     *    If given, an object mapping library uris to library paths
     * @return {Promise<Array>} Array of error messages
     * @private
     */
    async __checkDependencies(libs, packages) {
      const Console = qx.tool.compiler.Console.getInstance();
      let errors = [];
      // check all requires
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
            Console.warn(
              `${lib.getNamespace()}: The configuration setting "qooxdoo-range" in Manifest.json has been deprecated in favor of "requires.@qooxdoo/framework".`
            );
          }
          if (!requires["@qooxdoo/framework"]) {
            requires["@qooxdoo/framework"] = range;
          }
        }

        // Find the libraries that we need, not including the libraries which we have been given explicitly
        //  in the compile.json's `libraries` property
        let requires_uris = Object.getOwnPropertyNames(requires).filter(
          uri => !libs.find(lib => lib.getLibraryInfo().name === uri)
        );

        let urisToInstall = requires_uris.filter(
          name => name !== "@qooxdoo/framework" && name !== "@qooxdoo/compiler"
        );

        let pkg_libs = Object.getOwnPropertyNames(packages);
        if (urisToInstall.length > 0 && pkg_libs.length === 0) {
          // if we don't have package data
          if (this.argv.download) {
            if (!fs.existsSync(qx.tool.config.Manifest.config.fileName)) {
              Console.error(
                "Libraries are missing and there is no Manifest.json in the current directory so we cannot attempt to install them; the missing libraries are: \n     " +
                  urisToInstall.join("\n     ") +
                  "\nThe library which refers to the missing libraries is " +
                  lib.getNamespace() +
                  " in " +
                  lib.getRootDir()
              );

              process.exit(1);
            }
            // but we're instructed to download the libraries
            if (this.argv.verbose) {
              Console.info(
                `>>> Installing latest compatible version of libraries ${urisToInstall.join(
                  ", "
                )}...`
              );
            }
            const installer = new qx.tool.cli.commands.package.Install({
              verbose: this.argv.verbose,
              save: false // save to lockfile only, not to manifest
            });
            await installer.process();
            throw new qx.tool.utils.Utils.UserError(
              `Library ${lib.getNamespace()} requires ${urisToInstall.join(
                ","
              )} - we have tried to download and install these additional libraries, please restart the compilation.`
            );
          } else {
            throw new qx.tool.utils.Utils.UserError(
              "No library information available. Try 'qx compile --download'"
            );
          }
        }

        for (let reqUri of requires_uris) {
          let requiredRange = requires[reqUri];
          const rangeIsCommitHash = /^[0-9a-f]{40}$/.test(requiredRange);
          switch (reqUri) {
            case "@qooxdoo/compiler":
              // ignore
              break;
            case "@qooxdoo/framework": {
              let qxVersion = await this.getQxVersion();
              if (
                !semver.satisfies(qxVersion, requiredRange, { loose: true })
              ) {
                errors.push(
                  `${lib.getNamespace()}: Needs @qooxdoo/framework version ${requiredRange}, found ${qxVersion}`
                );
              }
              break;
            }
            // github repository release or commit-ish identifier
            default: {
              let l = libs.find(
                entry =>
                  path.relative("", entry.getRootDir()) === packages[reqUri]
              );

              if (!l) {
                errors.push(
                  `${lib.getNamespace()}: Cannot find required library '${reqUri}'`
                );

                break;
              }
              // github release of a package
              let libVersion = l.getLibraryInfo().version;
              if (!semver.valid(libVersion, { loose: true })) {
                if (!this.argv.quiet) {
                  Console.warn(
                    `${reqUri}: Version is not valid: ${libVersion}`
                  );
                }
              } else if (rangeIsCommitHash) {
                if (!this.argv.quiet) {
                  Console.warn(
                    `${reqUri}: Cannot check whether commit hash ${requiredRange} corresponds to version ${libVersion}`
                  );
                }
              } else if (
                !semver.satisfies(libVersion, requiredRange, { loose: true })
              ) {
                errors.push(
                  `${lib.getNamespace()}: Needs ${reqUri} version ${requiredRange}, found ${libVersion}`
                );
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
    resolveTargetClass(type) {
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
        throw new qx.tool.utils.Utils.UserError(
          "Typescript targets are no longer supported - please use `typescript: true` in source target instead"
        );
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
    },

    /**
     * Returns the list of makers to make
     *
     * @return  {Maker[]}
     */
    getMakers() {
      return this.__makers;
    },

    /**
     * Returns the one maker; this is for backwards compatibility with the compiler API, because it is
     * possible to define multiple targets and therefore have multiple makers.  This method will return
     * the one maker, when there is only one maker defined (ie one target), which is fine for any existing
     * configurations.
     *
     * @deprected
     * @return {Maker}
     */
    getMaker() {
      if (this.__makers.length == 1) {
        return this.__makers[0];
      }
      throw new Error(
        "Cannot get a single maker - there are " +
          this.__makers.length +
          " available"
      );
    },

    /**
     * Returns the makers for a given application name
     *
     * @param appName {String} the name of the application
     * @return {Maker}
     */
    getMakersForApp(appName) {
      return this.__makers.filter(maker => {
        let res = maker.getApplications().find(app => app.getName() == appName);
        return res;
      });
    },

    /**
     * Returns the configuration object being compiled
     */
    _getConfig() {
      return this.__config;
    },

    /**
     * Returns a list of libraries which are used
     *
     * @return {Library[]}
     */
    getLibraries() {
      return this.__libraries;
    }
  },

  defer(statics) {
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.cli.compile.writingApplication": "Writing application %1",
      "qx.tool.cli.compile.minifyingApplication": "Minifying %1 %2",
      "qx.tool.cli.compile.compilingClass": "Compiling class %1",
      "qx.tool.cli.compile.compiledClass": "Compiled class %1 in %2s",
      "qx.tool.cli.compile.makeBegins": "Making applications...",
      "qx.tool.cli.compile.makeEnds": "Applications are made"
    });

    qx.tool.compiler.Console.addMessageIds(
      {
        "qx.tool.cli.compile.multipleDefaultTargets":
          "Multiple default targets found!",
        "qx.tool.cli.compile.unusedTarget":
          "Target type %1, index %2 is unused",
        "qx.tool.cli.compile.selectingDefaultApp":
          "You have multiple applications, none of which are marked as 'default'; the first application named %1 has been chosen as the default application",
        "qx.tool.cli.compile.legacyFiles":
          "File %1 exists but is no longer used",
        "qx.tool.cli.compile.deprecatedCompile":
          "The configuration setting %1 in compile.json is deprecated",
        "qx.tool.cli.compile.deprecatedCompileSeeOther":
          "The configuration setting %1 in compile.json is deprecated (see %2)",
        "qx.tool.cli.compile.deprecatedUri":
          "URIs are no longer set in compile.json, the configuration setting %1=%2 in compile.json is ignored (it's auto detected)",
        "qx.tool.cli.compile.deprecatedProvidesBoot":
          "Manifest.Json no longer supports provides.boot - only Applications can have boot; specified in %1",
        "qx.tool.cli.compile.deprecatedBabelOptions":
          "Deprecated use of `babelOptions` - these should be moved to `babel.options`",
        "qx.tool.cli.compile.deprecatedBabelOptionsConflicting":
          "Conflicting use of `babel.options` and the deprecated `babelOptions` (ignored)"
      },

      "warning"
    );
  }
});
