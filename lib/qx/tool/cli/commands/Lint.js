/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Christian Boulanger and others

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project"s top-level directory for details.

   Authors:
     * Henner Kollmann (hkollmann)

************************************************************************ */

require("qooxdoo");

const CLIEngine = require("eslint").CLIEngine;
const async = require("async");

require("./Command");
require("./MConfig");

/* global qxcli */

qx.Class.define("qx.tool.cli.commands.Lint", {
  extend: qx.tool.cli.commands.Command,
  include: [qx.tool.cli.commands.MConfig],

  statics: {
    getYargsCommand: function() {
      return {
        "command"   : "lint [files...]",
        "describe": "runs eslint on the current application or as set of single files.",
        "builder": {
          "fix": {
            describe: "runs eslint with --fix"
          },
          "cache": {
            describe: "operate only on changed files (default: `false`)."
          },
          "warnAsError": {
             alias: "w",
             describe: "handle warnings as error"
          },
          "config": {
            alias : "c",
            describe: "prints the eslint configuration"
          }                    
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.Lint(argv)
            .process()
            .catch(e => {
              console.log(e.stack || e.message);
              process.exit(1);
            });
        }
      };
    }
  },

  members: {

    process: async function() {
      let config;
      let useEslintrc = false;
      try {
        config = await this.parse(this.argv);
      } catch (ex) {
        useEslintrc = true;
        config = {};
      }
      let lintOptions = config.eslintConfig || {};
      if (!useEslintrc) {
        lintOptions.extends = lintOptions.extends || ["qx/browser"];
      }  
      lintOptions.globals = Object.assign(lintOptions.globals || {},  await this.__addGlobals(config));
      let linter = new CLIEngine({
        cache: this.argv.cache || false,
        baseConfig: lintOptions,
        useEslintrc: useEslintrc
      });
      linter.options.fix = this.argv.fix;
      let files = this.argv.files || [];
      if (files.length === 0) {
        files.push("source/class/");
      }
      if (this.argv.config) {
        const fileConfig = linter.getConfigForFile(files[0]);
        console.info(JSON.stringify(fileConfig, null, "  "));
      } else {
        let report = linter.executeOnFiles(files);
        if (this.argv.fix) {
          CLIEngine.outputFixes(report);
        }
        if (report.errorCount > 0  || report.warningCount > 0) {
            const formatter = linter.getFormatter("codeframe");
          const s = formatter(report.results);
          if (report.errorCount > 0  || this.argv.warnAsError) {
            throw new qx.tool.cli.Utils.UserError(s);
          }  else  {
            console.info(s);
          }
        } else {
          console.info("No errors found!");
        }
      }
    },

    /**
     * Scan all libraries and add the namespace to globals
     */
    __addGlobals: async function(data) {
      let t = this;
      let result = {};
      return new Promise((resolve, reject) => {
        async.forEach(data.libraries,
          function(path, cb) {
            t.__addLibrary(path, result, cb);
          },
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
      });
      
    },

    /**
     * Load library and add namespace to result
     */
    __addLibrary: function(rootDir, result, cb) {
      var lib = new qx.tool.compiler.app.Library();
      lib.loadManifest(rootDir, function(err) {
        if (!err) {
          let s = lib.getNamespace();
          let libs = s.split('.');
          result[libs[0]] = false;       
        }  
        return cb && cb(err, lib);
      });
    }  
  
  }
});

