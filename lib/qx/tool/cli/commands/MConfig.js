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
     * Henner Kollmann(Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */


require("qooxdoo");
const path = require("upath");
const fs = qx.tool.compiler.utils.Promisify.fs;
const JsonToAst = require("json-to-ast");
const semver = require("semver");

qx.Mixin.define("qx.tool.cli.commands.MConfig", {

  members: {

    /**
     * Parses the command line and produces configuration data
     *
     * Loads a configuration file from a .js or .json file; if you provide a .js
     * file the file MUST return a function.
     * If there is also a .json, then it is loaded and parsed first.
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
     */
    parse: async function() {
      var parsedArgs = await this.__parseImpl();
      var config = {};
      var contribConfig = {
        version: qx.tool.cli.ConfigSchemas.lockfile.version
      };

      if (parsedArgs.config) {
        config = await this.__loadJson(parsedArgs.config);
        let lockfile = qx.tool.cli.ConfigSchemas.lockfile.filename;
        try {
          var name = path.join(path.dirname(parsedArgs.config), lockfile);
          contribConfig = await this.__loadJson(name);
        } catch (ex) {
          // Nothing
        }
        // check semver-type compatibility (i.e. compatible as long as major version stays the same)
        let schemaVersion = semver.coerce(qx.tool.cli.ConfigSchemas.lockfile.version, true).raw;
        let fileVersion = contribConfig.version ? semver.coerce(contribConfig.version, true).raw : "1.0.0";
        if (semver.major(schemaVersion) > semver.major(fileVersion)) {
          if (this.argv.force) {
            let config = {
              verbose: this.argv.verbose,
              quite: this.argv.quiet,
              save: false
            };
            const installer = new qx.tool.cli.commands.contrib.Install(config);
            let filepath = installer.getContribFileName();
            let backup = filepath + ".old";
            await fs.copyFileAsync(filepath, backup);
            if (!this.argv.quiet) {
              console.info(`A backup of ${lockfile} has been saved to ${backup}.`);
            }
            await installer.deleteContribData();
            for (let lib of contribConfig.libraries) {
              if (!await installer.isInstalled(lib.uri, lib.repo_tag)) {
                if (lib.repo_tag) {
                  await installer.install(lib.uri, lib.repo_tag);
                } else if (lib.path && fs.existsSync(lib.path)) {
                  await installer.installFromLocaPath(lib.path, lib.uri);
                }
              } else if (this.argv.verbose) {
                console.info(`>>> ${lib.uri}@${lib.repo_tag} is already installed.`);
              }
            }
            contribConfig = await installer.getContribData();
          } else {
            throw new qx.tool.cli.Utils.UserError(
              `*** Warning ***\n` +
              `The schema of '${lockfile}' has changed. Execute 'qx clean && qx compile --force' to delete and regenerate it.\n` +
              `You might have to re-apply manual modifications to '${lockfile}'.`
            );
          }
        }
      }
      this._mergeArguments(parsedArgs, config, contribConfig);
      if (config.libraries) {
        for (const aPath of config.libraries) {
          if (typeof aPath === "object" && typeof aPath.path === "string") {
            throw new Error("Configuration for libraries has changed - it is now an array of strings, each of which is a path to the directory containing Manifest.json.  Please run 'qx upgrade'");
          }
          await this.__loadJs(path.join(aPath, "compile.js"), config);
        }
      }
      return config;
    },

    /*
     * Merges the argv into the config data
     *
     */
    _mergeArguments: function(parsedArgs, config, contribConfig) {
      if (parsedArgs.config) {
        var defaultTarget = parsedArgs.target||config.defaultTarget;
        if (defaultTarget) {
          for (var i = 0; i < config.targets.length; i++) {
            if (config.targets[i].type === defaultTarget) {
              config.target = config.targets[i];
              break;
            }
          }
        }
        if (!config.target) {
          if (config.targets && (config.targets.length > 0)) {
            config.target = config.targets[0];
          }
        }
      } else {
        var target = config.target = {};
        if (parsedArgs.target) {
          target.type = parsedArgs.target;
        }
        if (parsedArgs.outputPath) {
          target.outputPath = parsedArgs.outputPath;
        }
      }

      if (!config.locales) {
        config.locales = [];
      }
      if (parsedArgs.locales) {
        parsedArgs.locales.forEach(function(locale) {
          if (config.locales.indexOf(locale) < 0) {
            config.locales.push(locale);
          }
        });
      }
      if (typeof parsedArgs.writeAllTranslations == "boolean") {
        config.writeAllTranslations = parsedArgs.writeAllTranslations;
      }

      if (parsedArgs.environment) {
        if (!config.environment) {
          config.environment = {};
        }
        /* eslint-disable guard-for-in */
        for (var key in parsedArgs.environment) {
          config.environment[key] = parsedArgs.environment[key];
        }
        /* eslint-enable guard-for-in */
      }

      if (!config.applications) {
        config.applications = [];
      }
      parsedArgs.applications.forEach(function(app) {
        if (!app.appClass) {
          throw new Error("Missing --app-class <classname> argument");
        }
        var configApp = {
          class: app.appClass
        };
        if (app.theme) {
          configApp.theme = app.theme;
        }
        if (app.name) {
          configApp.name = app.name;
        }
        config.applications.push(configApp);
      });

      if (parsedArgs.libraries) {
        if (!config.libraries) {
          config.libraries = [];
        }
        parsedArgs.libraries.forEach(function(aPath) {
          config.libraries.push(aPath);
        });
      }

      // Add default library for this project
      if (!config.libraries.length) {
        config.libraries.push(".");
      }

      if (contribConfig.libraries) {
        config.contribs = {};
        contribConfig.libraries.forEach(function(library) {
          config.libraries.push(library.path);
          config.contribs[library.uri] = library.path;
        });
      }

      if (!config.serve) {
        config.serve = {};
      }
      if (this.isExplicitArg("listen-port")) {
        config.serve.listenPort = this.argv.listenPort;
      } else {
        config.serve.listenPort = config.serve.listenPort || this.argv.listenPort;
      }
    },

    /**
     * Parses the command line, and produces a normalised configuration;
     *
     * @return {Object}
     */
    __parseImpl: async function() {
      let apps = [];
      let argv = this.argv;
      let result = {
        target: argv.target,
        outputPath: argv.outputPath||null,
        locales: null,
        writeAllTranslations: argv.writeAllTranslations,
        environment: {},
        applications: apps,
        libraries: argv.library||[],
        config: argv.configFile||"compile.json",
        continuous: argv.continuous,
        verbose: argv.verbose
      };
      if (argv.set) {
        argv.set.forEach(function(kv) {
          var m = kv.match(/^([^=\s]+)(=(.+))?$/);
          if (m) {
            var key = m[1];
            var value = m[3];
            try {
              result.environment[key] = Function("\"use strict\";return (" + value + ")")();
            } catch (error) {
              throw new Error("Failed to translate environment value '"+value+"' to a js datatype - "+error);
            }
          } else {
            throw new Error("Failed to parse environment setting commandline option '"+kv+"'");
          }
        });
      }

      if (argv.locale && argv.locale.length) {
        result.locales = argv.locale;
      }
      return result;
    },


    __loadJs: async function(aPath, inputData) {
      if (!await qx.tool.compiler.files.Utils.safeStat(aPath)) {
        return false;
      }
      var src = await fs.readFileAsync(aPath, {encoding: "utf8"});
      /* eslint-disable no-eval */
      var code = eval("(function() { return " + src + " ; })()");
      /* eslint-enable no-eval */
      return new Promise((resolve, reject) => {
        code.call(this, inputData, function(err, data) {
          if (err) {
            reject(err);
          }
          resolve(data);
        });
      });
    },


    __loadJson: async function(aPath) {
      var data = await fs.readFileAsync(aPath, {encoding: "utf8"});
      try {
        var ast = JsonToAst.parseToAst(data);
        var json = JsonToAst.astToObject(ast);
        return json;
      } catch (ex) {
        throw new Error("Failed to load " + path + ": " + ex);
      }
    }

  }

});
