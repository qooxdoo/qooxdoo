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
var qx = require("qooxdoo");
var async = require("async");
var util = require("../../util");
var commander = require('commander');

var log = util.createLog("cli");

function collect(val, memo) {
  memo.push(val);
  return memo;
}

var apps = null;
var app = null;

function ensureApp() {
  if (!app) {
    app = { };
    apps.push(app);
  }
  return app;
}

commander
    .version("0.2")
    .usage("[options] <configfile>")
    .option("--all-targets", "Compile all targets in configfile")
    .option("--target <type>", "Set the target type: source, build, hybrid or class name")
    .option("--output-path <path>", "Base path for output")
    .option("--locale <locale>", "Add a locale, default is 'en'; can be used more than once for multiple locales", collect, [])
    .option("--write-all-translations", "enables output of all translations, not just those that are explicitly referenced")
    .option("--set <key=value>", "sets an environment value", function(key, memo) {
      var m = key.match(/^([^=]+)(=(.*))?$/);
      var value=null;
      if (m) {
        key = m[1];
        value = m[3]||null;
      }
      memo[key] = value;
    }, {})
    .option("--app-class <classname>", "sets the application class", function(classname) {
      if (!app || app.appClass)
        apps.push(app = {});
      app.appClass = classname;
    })
    .option("--app-theme <classname>", "sets the theme class for the current application", function(classname) {
      ensureApp().theme = classname;
    })
    .option("--app-name <name>", "sets the name of the current application", function(name) {
      ensureApp().name = name;
    })
    .option("--library <path>", "adds a library", collect, [])
    .option("--continuous", "enables continuous compilation")
    .option("--verbose", "enables additional progress output to console");

/**
 * Provides various methods for parsing the command line and configuration files
 *
 */
qx.Class.define("qxcompiler.cli.CommandLine", {
  extend: qx.core.Object,

  statics: {

    /**
     * This is the main function for the CLI
     */
    run: function() {
      function error(err) {
        console.error(err);
        console.error(commander.helpInformation());
        process.exit(1);
      }
      this.parse(process.argv, function(err, config) {
        if (err)
          return error("Error: " + err);
        if (!config)
          return error("Error: Cannot find any configuration");
        qxcompiler.cli.CommandLine.createMakerFromConfig(config, function(err, maker) {
          if (err)
            return error("Error: " + err);

          if (!maker)
            return error("Error: Cannot find anything to make");
          maker.make(function() {});
        });
      });
    },

    /**
     * Parses the command line and produces configuration data
     *
     * @param argv {String[]} arguments
     * @param cb(err, data {Map}) {Function}
     */
    parse: function(argv, cb) {
      /* Merges the parsed argv into the config data */
      function mergeArguments() {
        if (parsedArgs.config) {
          var defaultTarget = parsedArgs.target||config.defaultTarget;
          if (defaultTarget) {
            for (var i = 0; i < config.targets.length; i++) {
              if (config.targets[i].type == defaultTarget) {
                config.target = config.targets[i];
                break;
              }
            }
          }
          if (!config.target) {
            if (config.targets.length == 1)
              config.target = config.targets[0];
          }

        } else {
          var target = config.target = {};
          if (parsedArgs.target)
            target.type = parsedArgs.target;
          if (parsedArgs.outputPath)
            target.outputPath = parsedArgs.outputPath;
        }

        if (!config.locales)
          config.locales = [];
        if (parsedArgs.locales) {
          parsedArgs.locales.forEach(function (locale) {
            if (config.locales.indexOf(locale) < 0)
              config.locales.push(locale);
          });
        }
        if (typeof parsedArgs.writeAllTranslations == "boolean")
          config.writeAllTranslations = parsedArgs.writeAllTranslations;

        if (parsedArgs.environment) {
          if (!config.environment)
            config.environment = {};
          for (var key in parsedArgs.environment)
            config.environment[key] = parsedArgs.environment[key];
        }

        if (!config.applications)
          config.applications = [];
        var appIndex = 0;
        parsedArgs.applications.forEach(function(app) {
          appIndex++;
          if (!app.appClass)
            return cb("Missing --app-class <classname> argument");
          var configApp = {
            "class": app.appClass
          };
          if (app.theme)
            configApp.theme = theme;
          if (app.name)
            configApp.name = name;
          config.applications.push(configApp);
        });

        if (parsedArgs.libraries) {
          if (!config.libraries)
            config.libraries = [];
          parsedArgs.libraries.forEach(function(path) {
            config.libraries.push(path);
          });
        }
      }

      var parsedArgs = this.parseImpl(argv);
      var config = {};
      if (parsedArgs.config) {
        qxcompiler.cli.CommandLine.loadConfig(parsedArgs.config, function(err, data) {
          if (err)
            return cb(err);
          config = data;
          mergeArguments();
          cb(null, config);
        });
      } else {
        mergeArguments();
        cb(null, config);
      }
    },

    /**
     * Parses the command line, and produces a normalised configuration; this is intended for use
     * by the parse method and unit tests only; while this method is public, expect the data
     * structure to change without warning.
     *
     * @param argv
     * @return {Obj}
     */
    parseImpl: function(argv) {
      apps = [];
      app = null;
      commander.parse(argv);
      var result = {
        target: commander.target,
        outputPath: commander.outputPath||null,
        locales: null,
        writeAllTranslations: null,
        environment: commander.set,
        applications: apps,
        libraries: commander.library,
        config: commander.args[0]||null,
        continuous: !!commander.continuous,
        verbose: !!commander.verbose
      };

      if (commander.locale.length)
        result.locales = commander.locale;
      return result;
    },

    /**
     * Loads a configuration file from a .js or .json file; if you provide a .js
     * file ane there is also a .json, then it is loaded and parsed first, and if
     * the .js file returns a Function then the function is called with the parsed
     * data from the .json file as a parameter.
     *
     * The Function returned from a .js file MUST accept two arguments, one for the
     * data (which will be null if there is no .json) and the second is the callback
     * to call when complete; the callback takes an error object and the output
     * configuration data.
     *
     * Configuration files do not support processes, job executions, or even
     * macros - if you want to add basic processing (eg for macros), use a .js file to
     * manipulate the data.  If you want to customise the Maker that is produced, you
     * need to use the API directly.
     *
     * @param path {String}
     * @param cb(err, data {Map})
     */
    loadConfig: function(path, cb) {
      function loadJson(path, cb) {
        fs.readFile(path, { encoding: "utf8" }, function(err, data) {
          if (err)
            return cb(err);
          try {
            data = JSON.parse(data);
          } catch(ex) {
            if (ex)
              return cb("Failed to load " + path + ": " + ex);
          }
          cb(null, data);
        });
      }

      function loadJs(path, inputData, cb) {
        fs.readFile(path, { encoding: "utf8" }, function(err, src) {
          if (err)
            return cb(err);
          var code = eval("(function() { return " + src + " ; })()");

          if (typeof code == "function") {
            code(inputData, function (err, data) {
              if (err)
                return cb(err);
              cb(null, data);
            });
          } else {
            cb(null, code || null);
          }
        });
      }

      // If there is a .json file, load and parse that first so that it can be given to the .js file
      //  as source data (assuming the .js file returns a function)
      if (path.match(/\.js$/)) {
        fs.exists(path + "on", function (exists) {
          if (exists) {
            loadJson(path + "on", function (err, data) {
              if (err)
                return cb(err);
              loadJs(path, data, cb);
            });
          } else {
            loadJs(path, null, cb);
          }
        });
      } else {
        loadJson(path, cb);
      }
    },

    /**
     * Uses loadConfig to load the configuration and produce a Maker
     * @param path {String}
     * @param cb(err, maker {Maker})
     */
    configure: function(path, cb) {
      qxcompiler.cli.CommandLine.loadConfig(path, function(err, data) {
        if (err)
          return cb(err);
        qxcompiler.cli.CommandLine.createMakerFromConfig(data, cb);
      });
    },

    /**
     * Processes the configuration from a JSON data structure and creates a Maker
     *
     * @param data {Map}
     * @param cb(err, maker {Maker})
     */
    createMakerFromConfig: function(data, cb) {
      var maker = new qxcompiler.makers.AppMaker();
      if (!data.target)
        return cb("No target specified");

      var outputPath = data.target.outputPath||".";
      var targetClass = qxcompiler.cli.CommandLine.resolveTargetClass(data.target.type);
      if (!targetClass)
        return cb("Cannot find target class: " + data.target.type);
      maker.setTarget(new targetClass(outputPath));

      maker.setLocales(data.locales||[ "en" ]);
      if (data.writeAllTranslations)
        maker.setWriteAllTranslations(data.writeAllTranslations);

      if (data.environment)
        maker.setEnvironment(data.environment);

      data.applications.forEach(function(appData) {
        var app = new qxcompiler.Application(appData["class"]);
        if (appData.theme)
          app.setTheme(appData.theme);
        if (appData.name)
          app.setName(appData.name);
        if (appData.environment)
          app.setEnvironment(appData.environment);
        maker.addApplication(app);
      });

      async.forEach(data.libraries,
          function(libData, cb) {
            maker.addLibrary(libData.path, cb);
          },
          function(err) {
            return cb(err, err ? null : maker);
          });

      maker.getAnalyser().addListener("classCompiled", function(evt) {
        var data = evt.getData();
        var unresolved = data.dbClassInfo.unresolved;
        if (unresolved) {
          unresolved.forEach(function(info) {
            var strLocs = "";
            info.locations.forEach(function(loc) {
              if (strLocs.length)
                strLocs += ", ";
              strLocs += loc.start.line + " (+" + loc.start.column + ")";
              if (loc.start.line != loc.end.line)
                strLocs += " to " + loc.end.line + "(+" + loc.end.column + ")";
            });
            console.log(data.classFile.getClassName() + ": Unresolved symbol " + info.name + " at line " + strLocs);
          });
        }
      });
    },

    /**
     * Resolves the target class instance from the type name; accepts "source", "build", "hybrid" or
     * a class name
     * @param type {String}
     * @returns {Maker}
     */
    resolveTargetClass: function(type) {
      if (!type)
        return null;
      if (type.$$type == "Class")
        return type;
      if (type == "build")
        return qxcompiler.targets.BuildTarget;
      if (type == "source")
        return qxcompiler.targets.SourceTarget;
      if (type == "hybrid")
        return qxcompiler.targets.HybridTarget;
      if (type) {
        var targetClass;
        if (data.target.type.indexOf('.') < 0)
          targetClass = qx.Class.getByName("qxcompiler.targets." + type);
        else
          targetClass = qx.Class.getByName(type);
        return targetClass;
      }
      return null;
    }
  }
});

module.exports = qxcompiler.cli.CommandLine;