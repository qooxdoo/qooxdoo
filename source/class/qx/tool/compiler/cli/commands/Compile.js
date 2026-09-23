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
     * Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */

const process = require("process");
const fs = require("fs");
const path = require("upath");
const consoleControl = require("console-control-strings");

require("app-module-path").addPath(process.cwd() + "/node_modules");

/**
 * Handles compilation of the project
 * @ignore(setImmediate)
 */
qx.Class.define("qx.tool.compiler.cli.commands.Compile", {
  extend: qx.tool.compiler.cli.Command,

  statics: {
    /**
     * Creates and configures the CLI command for the compile subcommand
     * @param clazz {new () => qx.core.Object} the class to instantiate as the command handler
     * @return {Promise<qx.tool.cli.Command>} the configured command
     */
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.Command.createCliCommand(clazz);
      cmd.set({
        name: "compile",
        description: "compiles the current application, using compile.json"
      });

      cmd.addFlag(
        new qx.tool.cli.Flag("download").set({
          shortCode: "d",
          description: "Whether to automatically download missing libraries",
          type: "boolean",
          value: true
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("update-po-files").set({
          shortCode: "u",
          description: "enables detection of translations and writing them out into .po files",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("library-po").set({
          description: "The policy for updating translations in libraries",
          type: ["ignore", "untranslated", "all"],
          value: "ignore"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("write-all-translations").set({
          description: "enables output of all translations, not just those that are explicitly referenced",
          type: "boolean"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("target").set({
          shortCode: "t",
          description: "Set the target type: source or build or class name. Default is first target in config file",
          required: true,
          type: "string",
          value: "source"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("output-path-prefix").set({
          description: "Sets a prefix for the output path of the target - used to compile a version into a non-standard directory",
          type: "string"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("locale").set({
          shortCode: "l",
          description: "Compile for a given locale",
          array: true,
          type: "string",
          value: ["en"]
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("app-class").set({
          description: "sets the application class",
          array: true,
          type: "string"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("app-theme").set({
          description: "sets the theme class for the current application",
          array: true,
          type: "string"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("app-name").set({
          description: "sets the name of the current application",
          array: true,
          type: "string"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("app-group").set({
          description: "which application groups to compile (defaults to all)",
          type: "string"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("watch").set({
          description: "enables watching for changes and continuous compilation",
          type: "boolean",
          shortCode: "w",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("watch-debug").set({
          description: "enables debug messages for watching",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("machine-readable").set({
          shortCode: "M",
          description: "output compiler messages in machine-readable format",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("minify").set({
          shortCode: "m",
          description: "disables minification (build targets only)",
          type: ["off", "minify", "mangle", "beautify"],
          value: "mangle"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("mangle-privates").set({
          description: "Whether to mangle private variables",
          type: "boolean"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("save-source-in-map").set({
          description: "Saves the source code in the map file (build target only)",
          type: "boolean"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("source-map-relative-paths").set({
          description:
            "If true, the source file will be saved in the map file if the target supports it. Can be overridden on a per application basis.",
          type: "boolean"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("save-unminified").set({
          shortCode: "u",
          description: "Saves a copy of the unminified version of output files (build target only)",
          type: "boolean"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("inline-external-scripts").set({
          description: "Inlines external Javascript",
          type: "boolean"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("erase").set({
          shortCode: "e",
          description: "Enabled automatic deletion of the output directory when compiler version or environment variables change",
          type: "boolean",
          value: true
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("feedback").set({
          description: "Shows progress bar feedback",
          type: "boolean",
          shortCode: "f",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("typescript").set({
          shortCode: "T",
          description: "Outputs typescript definitions in qooxdoo.d.ts",
          type: "boolean"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("add-created-at").set({
          description: "Adds code to populate object's $$createdAt",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("clean").set({
          shortCode: "D",
          description: "Deletes the target dir before compile",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("warn-as-error").set({
          shortCode: "w",
          description: "Handle compiler warnings as error",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("write-library-info").set({
          shortCode: "I",
          description: "Write library information to the script, for reflection",
          type: "boolean",
          value: true
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("write-compile-info").set({
          description: "Write application summary information to the script, used mostly for unit tests",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("bundling").set({
          shortCode: "b",
          description: "Whether bundling is enabled",
          type: "boolean",
          value: true
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("max-workers").set({
          description: "Number of workers to use for compilation, 1 means to use the main thread only (which is better for small projects)",
          type: "integer",
          value: 1,
          required: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("set").set({
          description: "sets an environment value for the compiler",
          type: "string",
          array: true
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("set-env").set({
          description: "sets an environment value for the application",
          type: "string",
          array: true
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("custom-inspect").set({
          description:
            "The inspect or inspect-brk flag to use when running a custom compiler in debug mode; this should be [inspect[-brk]=][0.0.0.0:]port",
          type: "string",
          value: null
        })
      );

      return cmd;
    },

    /**
     * Filters CLI arguments before forwarding them to a spawned custom compiler.
     * --clean must not be forwarded: the outer compiler already cleaned its output
     * directory, and forwarding --clean to the inner compiler would cause it to
     * delete that same directory while it is still in use by the outer process.
     *
     * @param {string[]} args - the raw argv slice to filter
     * @return {string[]} filtered args safe to pass to the inner compiler
     */
    filterArgsForCustomCompiler(args) {
      return args.filter(
        arg =>
          // prettier-ignore
          !arg.startsWith("--custom-inspect") &&
          !arg.startsWith("--customInspect") &&
          arg !== "--clean" &&
          arg !== "--no-clean"
      );
    }
  },

  properties: {},
  events: {
    /**
     * Fired when application writing starts; data is an array of objects, each containing:
     *   application {qx.tool.compiler.app.Application}
     *   analyzer {qx.tool.compiler.Analyzer}
     *   maker {qx.tool.compiler.makers.Maker}
     */
    writingApplications: "qx.event.type.Data",

    /**
     * Fired when writing of single application starts; data is an object containing:
     *   application {qx.tool.compiler.app.Application}
     *   analyzer {qx.tool.compiler.Analyzer}
     *   maker {qx.tool.compiler.makers.Maker}
     */
    writingApplication: "qx.event.type.Data",

    /**
     * Fired when writing of single application is complete; data is an object containing:
     *   application {qx.tool.compiler.app.Application}
     *   analyzer {qx.tool.compiler.Analyzer}
     *   maker {qx.tool.compiler.makers.Maker}
     */
    writtenApplication: "qx.event.type.Data",

    /**
     * Fired after writing of all applications; data is an array of objects, each containing:
     *   application {qx.tool.compiler.app.Application}
     *   analyzer {qx.tool.compiler.Analyzer}
     *   maker {qx.tool.compiler.makers.Maker}
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
     * Fired when making of apps begins. Data: the Maker instance.
     */
    making: "qx.event.type.Data",

    /**
     * Fired when making of apps is done. Data: the Maker instance.
     */
    made: "qx.event.type.Data",

    /**
     * Fired once when all makers have finished — after the last `made` event.
     */
    allDone: "qx.event.type.Event",

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
    /** @type {qx.tool.compiler.Compiler} the Compiler instance that will run the compile */
    __compiler: null,

    /**
     * @Override
     */
    async process() {
      if (this.argv.maxThreads != null && this.argv.maxThreads < 0) {
        qx.tool.compiler.Console.error("Number of threads (--max-threads) must be >= 0");
        process.exitCode = 1;
        return;
      }

      let configDb = await qx.tool.compiler.cli.ConfigDb.getInstance();
      if (this.argv.set) {
        this.argv.set.forEach(function (kv) {
          var m = kv.match(/^([^=\s]+)(=(.+))?$/);
          if (m) {
            var key = m[1];
            var value = m[3];
            configDb.setOverride(key, value);
          } else {
            throw new qx.tool.utils.Utils.UserError(`Failed to parse environment setting commandline option '--set ${kv}'`);
          }
        });
      }

      let compileConfig = this.getCompilerApi().getConfiguration();
      let hasCustomCompiler = compileConfig.applications.find(app => app.type === "compiler");

      let compilerClassName = qx.core.Environment.get("qx.tool.compiler.Compiler.compilerClass");
      let isCustomCompiler = !!compilerClassName;
      let CompilerClass = qx.tool.compiler.Compiler;
      if (isCustomCompiler) {
        if (!hasCustomCompiler) {
          qx.tool.compiler.Console.error("This is a custom compiler but the configuration does not require a custom compiler");
          process.exitCode = 1;
          return;
        }

        if (!compilerClassName) {
          qx.tool.compiler.Console.error(
            "This application is a custom compiler which is intended to be created, compiled, and run solely by the qx application. " +
              "The environment setting qx.tool.compiler.Compiler.compilerClass is not set which suggests that you're not running the custom compiler correctly. " +
              "The most likely cause of this is that you are manually compiling and running the custom compiler instead of letting the qx application do it.  Don't :)"
          );
          process.exitCode = 1;
          return;
        }

        CompilerClass = qx.Class.getByName(compilerClassName);
        if (!CompilerClass) {
          qx.tool.compiler.Console.error("Could not find compiler class: " + compilerClassName);
          process.exitCode = 1;
          return;
        }
        if (!qx.Class.hasInterface(CompilerClass, qx.tool.compiler.ICompilerInterface)) {
          qx.tool.compiler.Console.error(
            `This is a custom compiler built using the class ${compilerClassName} but that class does not implement qx.tool.compiler.ICompilerInterface`
          );
          process.exitCode = 1;
          return;
        }
      }
      let compilerTargetOnly = !!(hasCustomCompiler && !isCustomCompiler);

      let qxVersion = await this.getQxVersion();
      if (this.argv.verbose) {
        console.log(`
Compiler:  v${this.getCompilerVersion()} in ${require.main.filename}
Framework: v${qxVersion} in ${await this.getQxPath()}`);
      }

      if (compileConfig.sass && compileConfig.sass.compiler !== undefined) {
        qx.tool.compiler.resources.ScssConverter.USE_V6_COMPILER = compileConfig.sass.compiler == "latest";
      } else {
        qx.tool.compiler.resources.ScssConverter.USE_V6_COMPILER = null;
      }
      if (compileConfig.sass && compileConfig.sass.copyOriginal) {
        qx.tool.compiler.resources.ScssConverter.COPY_ORIGINAL_FILES = true;
      }

      if (!this.argv["machine-readable"]) {
        let color = configDb.db("qx.default.color", null);
        if (color) {
          let colorOn = consoleControl.color(color.split(" "));
          process.stdout.write(colorOn + consoleControl.eraseLine());
          let colorReset = consoleControl.color("reset");
          process.on("exit", () => process.stdout.write(colorReset + consoleControl.eraseLine()));

          let Console = qx.tool.compiler.Console.getInstance();
          Console.setColorOn(colorOn);
        }
      }

      if (this.argv["machine-readable"]) {
        qx.tool.compiler.Console.getInstance().setMachineReadable(true);
      }

      let compilerOptions = {
        watch: this.argv.watch ?? false,
        maxWorkers: this.argv.maxWorkers,
        typescriptEnabled: qx.lang.Type.isBoolean(this.argv.typescript)
      };

      if (qx.lang.Type.isBoolean(compileConfig?.meta?.typescript)) {
        compilerOptions.typescriptEnabled = compileConfig.meta.typescript;
      } else if (qx.lang.Type.isString(compileConfig?.meta?.typescript)) {
        compilerOptions.typescriptEnabled = true;
        compilerOptions.typescriptFile = path.relative(process.cwd(), path.resolve(compileConfig?.meta?.typescript));
      }

      /*
       * Auto detect an output path for targets that do not specify one, and ensure that no two
       * targets have the same output path
       */
      (function () {
        let outputPathsByTargetType = {
          source: {},
          build: {}
        };
        let targetsByType = {
          source: [],
          build: []
        };
        for (let targetConfig of compileConfig.targets) {
          if (targetConfig.outputPath) {
            outputPathsByTargetType[targetConfig.type][targetConfig.outputPath] = true;
          }
          targetsByType[targetConfig.type].push(targetConfig);
        }
        for (let targetConfig of compileConfig.targets) {
          if (!targetConfig.outputPath) {
            if (targetsByType[targetConfig.type].length == 1) {
              targetConfig.outputPath = "compiled/" + targetConfig.type;
            } else {
              let appType = targetConfig["application-types"] ? targetConfig["application-types"].join("-") : "all";
              let outputPath = "compiled/" + targetConfig.type;
              if (appType != "browser") {
                outputPath += "-" + appType;
              }
              targetConfig.outputPath = outputPath;
            }
            if (outputPathsByTargetType[targetConfig.type][targetConfig.outputPath]) {
              throw new qx.tool.utils.Utils.UserError(`Multiple targets with the same output path '${targetConfig.outputPath}'`);
            }
            outputPathsByTargetType[targetConfig.type][targetConfig.outputPath] = true;
          }
        }
      })();

      /*
       * Calculate the the list of targets and applications; this is a many to many list, where an
       * application can be compiled for many targets, and each target has many applications.
       *
       * Each target configuration is updated to have `appConfigs[]` and each application configuration
       * is updated to have `targetConfigs[]`.
       */

      //Ensure we only consider the compiler target if we are in compilerOnly mode, and the opposite if we're not
      compileConfig.targets = compileConfig.targets.filter(targetConfig => {
        let isCompilerTarget = !!(targetConfig["application-types"] && targetConfig["application-types"].includes("compiler"));
        return compilerTargetOnly === isCompilerTarget;
      });
      compileConfig.targets.forEach((targetConfig, index) => (targetConfig.index = index));

      let targetConfigs = [];
      let defaultTargetConfig = null;
      compileConfig.targets.forEach(targetConfig => {
        if (targetConfig.type === this.getTargetType()) {
          if (!targetConfig["application-names"] && !targetConfig["application-types"]) {
            if (defaultTargetConfig) {
              qx.tool.compiler.Console.print("qx.tool.cli.compile.multipleDefaultTargets");
            } else {
              defaultTargetConfig = targetConfig;
            }
          } else {
            targetConfigs.push(targetConfig);
          }
        }
      });

      var argvAppNames = null;
      if (this.argv["app-name"]) {
        argvAppNames = {};
        String(this.argv["app-name"])
          .split(",")
          .forEach(name => (argvAppNames[name] = true));
      }
      var argvAppGroups = null;
      if (this.argv["app-group"]) {
        argvAppGroups = {};
        String(this.argv["app-group"])
          .split(",")
          .forEach(name => (argvAppGroups[name] = true));
      }

      let allAppNames = {};
      for (let index = 0; index < compileConfig.applications.length; index++) {
        let appConfig = compileConfig.applications[index];
        if (compilerTargetOnly && appConfig.type != "compiler") {
          continue;
        }
        if (!compilerTargetOnly && appConfig.type == "compiler") {
          continue;
        }

        if (appConfig.name) {
          if (allAppNames[appConfig.name]) {
            throw new qx.tool.utils.Utils.UserError(`Multiple applications with the same name '${appConfig.name}'`);
          }
          allAppNames[appConfig.name] = appConfig;
        }
        if (appConfig.group) {
          if (typeof appConfig.group == "string") {
            appConfig.group = [appConfig.group];
          }
        }
        appConfig.index = index;
        let appType;
        if (appConfig.type == "compiler") {
          appType = "node";
          if (!appConfig.class) {
            appConfig.class = "qx.tool.compiler.cli.Application";
          }
          if (!appConfig.name) {
            appConfig.name = "custom-compiler";
          }
        } else {
          appType = appConfig.type || "browser";
          if (!appConfig.class) {
            throw new qx.tool.utils.Utils.UserError(
              `Applications require a class to be specified, but application #${index} (named ${
                appConfig.name || "unnamed"
              }) does not have one`
            );
          }
          if (!appConfig.name) {
            throw new qx.tool.utils.Utils.UserError(
              `Applications require a name to be specified, but application #${index} (class ${appConfig.class}) does not have one`
            );
          }
        }
        let appTargetConfigs = targetConfigs.filter(targetConfig => {
          let isCompilerTarget = !!(targetConfig["application-types"] && targetConfig["application-types"].includes("compiler"));
          if (appConfig.type == "compiler" && !isCompilerTarget) {
            return false;
          }
          if (appConfig.type != "compiler" && isCompilerTarget) {
            return false;
          }
          let appTypes = targetConfig["application-types"];
          if (appTypes && !isCompilerTarget && !qx.lang.Array.contains(appTypes, appType)) {
            return false;
          }

          let appNames = targetConfig["application-names"];
          if (appConfig.name && appNames && !qx.lang.Array.contains(appNames, appConfig.name)) {
            return false;
          }
          return true;
        });

        if (appTargetConfigs.length == 0) {
          if (defaultTargetConfig) {
            appTargetConfigs = [defaultTargetConfig];
          } else {
            throw new qx.tool.utils.Utils.UserError(
              `Cannot find any suitable targets for application #${index} (named ${appConfig.name || "unnamed"})`
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
      }
      if (defaultTargetConfig && defaultTargetConfig.appConfigs) {
        targetConfigs.push(defaultTargetConfig);
      }

      let metaDir = compileConfig.meta?.output;
      if (!metaDir) {
        metaDir = path.relative(process.cwd(), path.resolve(targetConfigs[0].outputPath, "../meta"));
      }
      compilerOptions.metaDir = metaDir;

      // create compiler
      let compiler = new CompilerClass(compileConfig).set(compilerOptions);
      this.__compiler = compiler;

      let libraries = {};
      let compilerApi = qx.tool.compiler.cli.ConfigLoader.getInstance().getCompilerApi();
      let libraryPaths = compilerApi.getLibraryApis().map(lib => lib.getRootDir());
      for await (const lib of libraryPaths) {
        var library = await qx.tool.compiler.app.Library.createLibrary(lib);
        libraries[library.getNamespace()] = library;
      }

      // Search for Qooxdoo library if not already provided
      var qxLib = libraries["qx"];
      if (!qxLib) {
        let qxPath = await qx.tool.config.Utils.getQxPath();
        var library = await qx.tool.compiler.app.Library.createLibrary(qxPath);
        libraries[library.getNamespace()] = library;
        qxLib = libraries["qx"];
      }
      if (this.argv.verbose) {
        qx.tool.compiler.Console.getInstance().log("Qooxdoo found in " + qxLib.getRootDir());
      }
      let errors = await this.__checkDependencies(Object.values(libraries), compileConfig.packages);

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
                  throw new qx.tool.utils.Utils.UserError("Error: Can only set one application to be the default application!");
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

        let targetDefaults = null;
        if (compileConfig?.targetDefaults && compileConfig?.targetDefaults[targetConfig.type]) {
          targetDefaults = compileConfig.targetDefaults[targetConfig.type];
        }

        if (targetDefaults) {
          for (let key in targetDefaults) {
            if (key == "environment") {
              if (!targetConfig.environment) {
                targetConfig.environment = {};
              }
              for (let envKey in targetDefaults.environment) {
                if (targetConfig.environment[envKey] === undefined) {
                  targetConfig.environment[envKey] = targetDefaults.environment[envKey];
                }
              }
            } else if (targetConfig[key] === undefined) {
              targetConfig[key] = targetDefaults[key];
            }
          }
        }
      });

      /*
       * There is still only one target per maker, so convert our list of targetConfigs into an array of makers
       */
      let targetOutputPaths = {};
      let makers = [];

      for (let targetConfig of targetConfigs) {
        if (!targetConfig.appConfigs) {
          if (targetConfig.type != "compiler") {
            qx.tool.compiler.Console.print("qx.tool.cli.compile.unusedTarget", targetConfig.type, targetConfig.index);
          }
          continue;
        }
        let appConfigs = targetConfig.appConfigs.filter(appConfig => {
          if (argvAppGroups && appConfig.group) {
            if (!appConfig.group.find(groupName => !!argvAppGroups[groupName])) {
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
          continue;
        }

        var outputPath = targetConfig.outputPath;
        if (this.argv["output-path-prefix"]) {
          outputPath = path.join(this.argv["output-path-prefix"], outputPath);
        }
        if (!outputPath) {
          throw new qx.tool.utils.Utils.UserError("Missing output-path for target " + targetConfig.type);
        }
        let absOutputPath = path.resolve(outputPath);
        if (targetOutputPaths[absOutputPath]) {
          throw new qx.tool.utils.Utils.UserError(
            `Multiple output targets share the same target directory ${outputPath} - each target output must be unique`
          );
        }
        targetOutputPaths[absOutputPath] = true;

        var maker = new qx.tool.compiler.Maker();
        if (!this.argv.erase) {
          maker.setNoErase(true);
        }

        var TargetClass = targetConfig.targetClass ? this.__resolveTargetClass(targetConfig.targetClass) : null;
        if (!TargetClass && targetConfig.type) {
          TargetClass = this.__resolveTargetClass(targetConfig.type);
        }
        if (!TargetClass) {
          throw new qx.tool.utils.Utils.UserError("Cannot find target class: " + (targetConfig.targetClass || targetConfig.type));
        }
        /* eslint-disable new-cap */
        var target = new TargetClass(outputPath);
        /* eslint-enable new-cap */
        if (targetConfig.uri) {
          qx.tool.compiler.Console.print("qx.tool.cli.compile.deprecatedUri", "target.uri", targetConfig.uri);
        }
        if (targetConfig.addTimestampsToUrls !== undefined) {
          target.setAddTimestampsToUrls(targetConfig.addTimestampsToUrls);
        } else {
          target.setAddTimestampsToUrls(target instanceof qx.tool.compiler.targets.BuildTarget);
        }
        if (targetConfig.writeCompileInfo || this.argv["write-compile-info"]) {
          target.setWriteCompileInfo(true);
        }
        if (compileConfig.i18nAsParts) {
          target.setI18nAsParts(true);
        }
        if (targetConfig.writeLibraryInfo || this.argv["write-library-info"]) {
          target.setWriteLibraryInfo(true);
        }
        if (targetConfig.updatePoFiles || this.argv["update-po-files"]) {
          target.setUpdatePoFiles(true);
        }
        if (targetConfig.libraryPo || this.argv["library-po"]) {
          target.setLibraryPoPolicy(targetConfig.libraryPo || this.argv["library-po"]);
        }

        let fontsConfig = targetConfig.fonts || {};
        let preferLocalFonts = true;

        if (this.argv["local-fonts"]) {
          preferLocalFonts = this.argv["local-fonts"];
        } else if (fontsConfig.local !== undefined) {
          preferLocalFonts = fontsConfig.local;
        }
        target.setPreferLocalFonts(preferLocalFonts);
        if (fontsConfig.fontTypes !== undefined) {
          target.setFontTypes(fontsConfig.fontTypes);
        }

        if (typeof target.setMinify == "function") {
          // Take the command line for `minify` as most precedent only if provided
          var minify;
          if (process.argv.indexOf("--minify") > -1) {
            minify = this.argv["minify"];
          }
          minify = minify || targetConfig["minify"] || this.argv["minify"];
          if (typeof minify == "boolean") {
            minify = minify ? "minify" : "off";
          }
          if (!minify) {
            minify = "mangle";
          }
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
        var saveSourceInMap = chooseValue(targetConfig["save-source-in-map"], this.argv["save-source-in-map"]);
        if (typeof saveSourceInMap == "boolean" && typeof target.setSaveSourceInMap == "function") {
          target.setSaveSourceInMap(saveSourceInMap);
        }

        var sourceMapRelativePaths = chooseValue(targetConfig["source-map-relative-paths"], this.argv["source-map-relative-paths"]);
        if (typeof sourceMapRelativePaths == "boolean" && typeof target.setSourceMapRelativePaths == "function") {
          target.setSourceMapRelativePaths(sourceMapRelativePaths);
        }

        var saveUnminified = chooseValue(targetConfig["save-unminified"], this.argv["save-unminified"]);
        if (typeof saveUnminified == "boolean" && typeof target.setSaveUnminified == "function") {
          target.setSaveUnminified(saveUnminified);
        }

        var inlineExternal = chooseValue(targetConfig["inline-external-scripts"], this.argv["inline-external-scripts"]);
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
        if (typeof deployMap == "boolean" && typeof target.setDeployDir == "function") {
          target.setDeployMap(deployMap);
        }

        maker.setTarget(target);

        // Cannot access the analyzer until the target is set
        let analyzer = maker.getAnalyzer();
        if (this.argv["clean"]) {
          await maker.eraseOutputDir();
          await qx.tool.utils.files.Utils.safeUnlink(analyzer.getDbFilename());
          await qx.tool.utils.files.Utils.safeUnlink(analyzer.getResDbFilename());
        }
        if (this.argv.ignores) {
          analyzer.setIgnores(this.argv.ignores);
        }

        var manglePrivates = chooseValue(targetConfig["mangle-privates"], this.argv["mangle-privates"]);

        if (typeof manglePrivates == "string") {
          maker.getAnalyzer().setManglePrivates(manglePrivates);
        } else if (typeof manglePrivates == "boolean") {
          if (manglePrivates) {
            maker.getAnalyzer().setManglePrivates(target instanceof qx.tool.compiler.targets.BuildTarget ? "unreadable" : "readable");
          } else {
            maker.getAnalyzer().setManglePrivates("off");
          }
        }

        if (targetConfig["application-types"]) {
          maker.getAnalyzer().setApplicationTypes(targetConfig["application-types"]);
        }

        maker.setLocales(compileConfig.locales || ["en"]);
        if (compileConfig.writeAllTranslations) {
          maker.setWriteAllTranslations(compileConfig.writeAllTranslations);
        }

        if (typeof targetConfig.typescript == "string") {
          qx.tool.compiler.Console.getInstance().warn(
            "The 'typescript' property inside a target definition is deprecated - please see top level 'meta.typescript' property"
          );

          if (this.__typescriptFile) {
            qx.tool.compiler.Console.getInstance().warn(
              "Multiple conflicting locations for the Typescript output - choosing to write to " +
                this.__typescriptFile +
                " and NOT " +
                targetConfig.typescript
            );
          } else {
            this.__typescriptEnabled = true;
            this.__typescriptFile = path.relative(process.cwd(), path.resolve(targetConfig.typescript));
          }
        }

        if (compileConfig.environment) {
          maker.setEnvironment(compileConfig.environment);
        }
        if (targetConfig.environment) {
          target.setEnvironment(targetConfig.environment);
        }

        for (let ns in libraries) {
          maker.getAnalyzer().addLibrary(libraries[ns]);
        }

        let targetEnvironment = {
          "qx.version": maker.getAnalyzer().getQooxdooVersion(),
          "qx.compiler.targetType": target.getType(),
          "qx.compiler.outputDir": target.getOutputDir(),
          "qx.target.privateArtifacts": !!compileConfig["private-artifacts"]
        };
        if (compileConfig["private-artifacts"]) {
          target.setPrivateArtifacts(true);
        }

        qx.lang.Object.mergeWith(targetEnvironment, targetConfig.environment, false);
        target.setEnvironment(targetEnvironment);

        if (targetConfig.preserveEnvironment) {
          target.setPreserveEnvironment(targetConfig.preserveEnvironment);
        }

        if (compileConfig["path-mappings"]) {
          for (var from in compileConfig["path-mappings"]) {
            var to = compileConfig["path-mappings"][from];
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

        let babelConfig = {};
        if (compileConfig.babelOptions) {
          if (!compileConfig?.babel?.options) {
            babelConfig = compileConfig.babel || {};
            babelConfig.options = compileConfig.babelOptions;
            qx.tool.compiler.Console.print("qx.tool.cli.compile.deprecatedBabelOptions");
          } else {
            qx.tool.compiler.Console.print("qx.tool.cli.compile.deprecatedBabelOptionsConflicting");
          }
          delete compileConfig.babelOptions;
        } else {
          babelConfig = compileConfig.babel || {};
        }

        babelConfig.options = babelConfig.options || {};
        qx.lang.Object.mergeWith(babelConfig.options, targetConfig.babelOptions || {});

        maker.getAnalyzer().setBabelConfig(babelConfig);

        let browserifyConfig = qx.lang.Object.clone(compileConfig.browserify || {}, true);
        browserifyConfig.options = browserifyConfig.options || {};
        qx.lang.Object.mergeWith(browserifyConfig.options, targetConfig.browserifyOptions || {});
        maker.getAnalyzer().setBrowserifyConfig(browserifyConfig);

        var addCreatedAt = targetConfig["addCreatedAt"] || this.argv["add-created-at"];
        if (addCreatedAt) {
          maker.getAnalyzer().setAddCreatedAt(true);
        }
        const verboseCreatedAt = targetConfig["verboseCreatedAt"] || this.argv["verbose-created-at"];
        if (verboseCreatedAt) {
          maker.getAnalyzer().setVerboseCreatedAt(true);
        }

        let allApplicationTypes = {};
        appConfigs.forEach(appConfig => {
          var app = (appConfig.app = new qx.tool.compiler.app.Application(appConfig["class"]));

          app.setTemplatePath(qx.tool.utils.Utils.getTemplateDir());

          if (appConfig["type"] === "compiler") {
            app.setType("node");
          } else if (appConfig["type"]) {
            app.setType(appConfig["type"]);
          }
          let environment = qx.lang.Object.mergeWith({}, appConfig.environment || {}, true);
          if (appConfig.type === "compiler") {
            if (!appConfig.compilerClass) {
              qx.tool.compiler.Console.error(
                "This is a custom compiler but the configuration does not specify a compilerClass for the application"
              );
              process.exitCode = 1;
              return;
            }
            environment["qx.tool.compiler.Compiler.compilerClass"] = appConfig.compilerClass;
          }
          app.setEnvironment(environment);

          [
            "theme",
            "name",
            "outputPath",
            "bootPath",
            "loaderTemplate",
            "publish",
            "deploy",
            "standalone",
            "localModules",
            "title",
            "description",
            "group"
          ].forEach(name => {
            if (appConfig[name] !== undefined) {
              app.set(name, appConfig[name]);
            }
          });
          allApplicationTypes[app.getType()] = true;
          if (appConfig.uri) {
            qx.tool.compiler.Console.print("qx.tool.cli.compile.deprecatedUri", "application.uri", appConfig.uri);
          }
          appConfig.localModules = appConfig.localModules || {};
          qx.lang.Object.mergeWith(appConfig.localModules, compileConfig.localModules || {}, false);

          if (!qx.lang.Object.isEmpty(appConfig.localModules)) {
            app.setLocalModules(appConfig.localModules);
          }

          var parts = appConfig.parts || targetConfig.parts || compileConfig.parts;
          if (parts) {
            if (!parts.boot) {
              throw new qx.tool.utils.Utils.UserError(
                "Cannot determine a boot part for application " + (appConfig.index + 1) + " " + (appConfig.name || "")
              );
            }
            for (var partName in parts) {
              var partData = parts[partName];
              var include = typeof partData.include == "string" ? [partData.include] : partData.include;
              var exclude = typeof partData.exclude == "string" ? [partData.exclude] : partData.exclude;
              var part = new qx.tool.compiler.app.Part(partName, include, exclude).set({
                combine: Boolean(partData.combine),
                minify: Boolean(partData.minify)
              });

              app.addPart(part);
            }
          }

          if (target.getType() == "source" && this.argv.bundling) {
            var bundle = appConfig.bundle || targetConfig.bundle || compileConfig.bundle;
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
            exclude: mergeArray([], compileConfig.exclude, targetConfig.exclude, appConfig.exclude)
          });

          let appInclude = mergeArray([], compileConfig.include, targetConfig.include, appConfig.include);
          if (appConfig.type == "compiler") {
            appInclude.push(appConfig.compilerClass);
          }
          app.setInclude(appInclude);

          maker.addApplication(app);
        });

        const ClassFile = qx.tool.compiler.ClassFile;
        let globalSymbols = [];
        qx.lang.Array.append(globalSymbols, ClassFile.QX_GLOBALS);
        qx.lang.Array.append(globalSymbols, ClassFile.COMMON_GLOBALS);
        if (allApplicationTypes["browser"]) {
          qx.lang.Array.append(globalSymbols, ClassFile.BROWSER_GLOBALS);
        }
        if (allApplicationTypes["node"]) {
          qx.lang.Array.append(globalSymbols, ClassFile.NODE_GLOBALS);
        }
        if (allApplicationTypes["rhino"]) {
          qx.lang.Array.append(globalSymbols, ClassFile.RHINO_GLOBALS);
          if (babelConfig.options?.targets && Object.keys(allApplicationTypes).length > 1) {
            qx.tool.compiler.Console.warn(
              `There is an application type of 'rhino' and Babel option targets are specified.  Due to lack of standards support, Rhino typically ` +
                `requires maximum transpilation, so Babel targets will be ignored; however, as you are using the same target for multiple application types, ` +
                `this will over transpile the other application types.  It is recommended to use a separate target for Rhino applications.`
            );
          }
          delete babelConfig.options?.targets;
        }
        maker.getAnalyzer().setGlobalSymbols(globalSymbols);

        if (
          targetConfig.defaultAppConfig &&
          targetConfig.defaultAppConfig.app &&
          (targetConfig.defaultAppConfig.type || "browser") === "browser"
        ) {
          targetConfig.defaultAppConfig.app.setWriteIndexHtmlToRoot(true);
        } else {
          qx.tool.utils.files.Utils.safeUnlink(target.getOutputDir() + "index.html");
        }

        await maker.init();
        makers.push(maker);
        compiler.addMaker(maker);
      }

      if (hasCustomCompiler && !isCustomCompiler) {
        qx.tool.compiler.Console.log(">>>Custom compiler detected - compiling custom compiler first...");
        await compiler.start();

        if (qx.core.Environment.get("qx.debug")) {
          this.assertTrue(makers.length == 1, "There should only be one target when using a custom compiler");
          this.assertTrue(makers[0].getApplications().length == 1, "There should only be one application when using a custom compiler");
        }
        let target = makers[0].target;
        let app = makers[0].getApplications()[0];

        let nodeCmdArgs = [];

        if (this.argv.customInspect) {
          // customInspect should be in the format [inspect[-brk]=][ip:]port, e.g. "inspect=9229" or "inspect-brk=0.0.0.0:9231"
          let customInspect = this.argv.customInspect;
          let pos = customInspect.indexOf("=");
          let inspectType = "inspect";
          if (pos >= 0) {
            inspectType = this.argv.customInspect.substring(0, pos);
            if (inspectType !== "inspect" && inspectType !== "inspect-brk") {
              qx.tool.compiler.Console.error("Invalid inspect type in --custom-inspect: " + inspectType);
              process.exitCode = 1;
              return;
            }
            customInspect = this.argv.customInspect.substring(pos + 1);
          }
          pos = customInspect.indexOf(":");
          let host = null;
          let port = null;
          if (pos >= 0) {
            host = customInspect.substring(0, pos);
            port = customInspect.substring(pos + 1);
          } else {
            port = customInspect;
          }
          if (port) {
            port = parseInt(port, 10);
            if (isNaN(port) || port <= 0 || port > 65535) {
              qx.tool.compiler.Console.error("Invalid port in --custom-inspect: " + port);
              process.exitCode = 1;
              return;
            }
          }
          nodeCmdArgs.push(`--${inspectType}=${host ? host + ":" : ""}${port}`);
        }

        let compilerPath = path.join(target.getOutputDir(), app.getProjectDir(), "index.js");
        await compiler.stop();
        compiler.dispose();

        nodeCmdArgs.push(compilerPath);
        nodeCmdArgs = nodeCmdArgs.concat(
          qx.tool.compiler.cli.commands.Compile.filterArgsForCustomCompiler(process.argv.slice(2))
        );
        await new Promise(resolve => {
          if (this.argv.verbose) {
            qx.tool.compiler.Console.log(">>>Running custom compiler with command: " + process.execPath + " " + nodeCmdArgs.join(" "));
          }
          qx.tool.utils.Utils.spawnProcess(process.execPath, nodeCmdArgs, {
            env: {
              ...process.env,
              QOOXDOO_PARENT_COMPILER_PATH: require.main.filename
            },
            onClose: code => {
              resolve();
              process.exitCode = code;
              // exit process. The whole work is done by the custom compiler,
              // so we just need to exit with the correct code here.
              process.exit();
            }
          });
        });
        return;
      }

      //relay the events
      let events = Object.keys(qx.tool.compiler.ICompilerInterface.$$events);
      for (let event of events) {
        compiler.addListener(event, evt => this.dispatchEvent(evt.clone()));
      }

      qx.tool.compiler.Console.log(">>> Starting compilation of project...");
      await compiler.start();
      if (this.argv.watch) {
        await new qx.Promise();
      } else {
        return await this._exit();
      }
    },

    /**
     * Checks the dependencies of the current library
     *
     * @param  {qx.tool.compiler.app.Library[]} libs
     *    The list of libraries to check
     * @param {Object|*} packages
     *    If given, an object mapping library uris to library paths
     * @return {Promise<Array>} Array of error messages
     */
    async __checkDependencies(libs, packages) {
      let Console = qx.tool.compiler.Console.getInstance();
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
        let requires_uris = Object.getOwnPropertyNames(requires).filter(uri => !libs.find(lib => lib.getLibraryInfo().name === uri));

        let urisToInstall = requires_uris.filter(name => name !== "@qooxdoo/framework" && name !== "@qooxdoo/compiler");

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
              Console.info(`>>> Installing latest compatible version of libraries ${urisToInstall.join(", ")}...`);
            }
            const installer = new qx.tool.compiler.cli.commands.package.Install({
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
            throw new qx.tool.utils.Utils.UserError("No library information available. Try 'qx compile --download'");
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
              if (!qx.tool.utils.Utils.versionSatisfies(qxVersion, requiredRange)) {
                errors.push(`${lib.getNamespace()}: Needs @qooxdoo/framework version ${requiredRange}, found ${qxVersion}`);
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
              if (!qx.tool.utils.Utils.versionValid(libVersion)) {
                if (!this.argv.quiet) {
                  Console.warn(`${reqUri}: Version is not valid: ${libVersion}`);
                }
              } else if (rangeIsCommitHash) {
                if (!this.argv.quiet) {
                  Console.warn(`${reqUri}: Cannot check whether commit hash ${requiredRange} corresponds to version ${libVersion}`);
                }
              } else if (!qx.tool.utils.Utils.versionSatisfies(libVersion, requiredRange)) {
                errors.push(`${lib.getNamespace()}: Needs ${reqUri} version ${requiredRange}, found ${libVersion}`);
              }
              break;
            }
          }
        }
      }
      return errors;
    },

    /**
     * Resolves the target class from the type name; accepts "source", "build", or a class
     * a class name
     * @param type {String}
     * @returns {new () => qx.core.Object}
     */
    __resolveTargetClass(type) {
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
        var TargetClass;
        if (type.indexOf(".") < 0) {
          TargetClass = qx.Class.getByName("qx.tool.compiler.targets." + type);
        } else {
          TargetClass = qx.Class.getByName(type);
        }
        return TargetClass;
      }
      return null;
    },

    /**
     * Returns the list of makers to make, as POJO objects
     *
     * @return {qx.tool.compiler.Maker[]}
     */
    getMakers() {
      return this.__compiler.getMakers();
    },

    /**
     * Runs the finalization code ran on exit
     * @returns {integer} the process exit code
     */
    async _exit() {
      // getMakers() is declared async in ICompilerInterface, so custom compilers may
      // implement it asynchronously - await it to support both sync and async variants.
      let makers = await this.getMakers();
      let success = makers.every(maker => maker.success) && !this.__compiler.hasStartError();
      let hasWarnings = makers.some(maker => maker.hasWarnings);
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
      await this.__compiler.stop();
      return success ? 0 : 1;
    }
  },

  defer(statics) {
    qx.tool.compiler.Console.addMessageIds({
      "qx.tool.compiler.cli.compile.writingApplication": "Writing application %1",
      "qx.tool.compiler.cli.compile.minifyingApplication": "Minifying %1 %2",
      "qx.tool.compiler.cli.compile.compilingClass": "Compiling class %1",
      "qx.tool.compiler.cli.compile.compiledClass": "Compiled class %1 in %2s",
      "qx.tool.compiler.cli.compile.makeBegins": "Making applications...",
      "qx.tool.compiler.cli.compile.makeEnds": "Applications are made"
    });

    qx.tool.compiler.Console.addMessageIds(
      {
        "qx.tool.compiler.cli.compile.multipleDefaultTargets": "Multiple default targets found!",
        "qx.tool.compiler.cli.compile.unusedTarget": "Target type %1, index %2 is unused",
        "qx.tool.compiler.cli.compile.selectingDefaultApp":
          "You have multiple applications, none of which are marked as 'default'; the first application named %1 has been chosen as the default application",
        "qx.tool.compiler.cli.compile.legacyFiles": "File %1 exists but is no longer used",
        "qx.tool.compiler.cli.compile.deprecatedCompile": "The configuration setting %1 in compile.json is deprecated",
        "qx.tool.compiler.cli.compile.deprecatedCompileSeeOther": "The configuration setting %1 in compile.json is deprecated (see %2)",
        "qx.tool.compiler.cli.compile.deprecatedUri":
          "URIs are no longer set in compile.json, the configuration setting %1=%2 in compile.json is ignored (it's auto detected)",
        "qx.tool.compiler.cli.compile.deprecatedProvidesBoot":
          "Manifest.Json no longer supports provides.boot - only Applications can have boot; specified in %1",
        "qx.tool.compiler.cli.compile.deprecatedBabelOptions":
          "Deprecated use of `babelOptions` - these should be moved to `babel.options`",
        "qx.tool.compiler.cli.compile.deprecatedBabelOptionsConflicting":
          "Conflicting use of `babel.options` and the deprecated `babelOptions` (ignored)"
      },

      "warning"
    );
  }
});
