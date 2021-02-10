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



const CLIEngine = require("eslint").CLIEngine;
const fs = qx.tool.utils.Promisify.fs;

qx.Class.define("qx.tool.cli.commands.Lint", {
  extend: qx.tool.cli.commands.Command,

  statics: {
    getYargsCommand: function() {
      return {
        "command"   : "lint [files...]",
        "describe": "runs eslint on the current application or as set of single files.",
        "builder": {
          "fix": {
            describe: "runs eslint with --fix"
          },
          "fix-jsdoc-params": {
            describe: "changes the order or @param name and {Type} to make it compatible for the generator ('name-first') or with JSDoc linting ('type-first').",
            choices: ["off", "name-first", "type-first"],
            default: "off"
          },
          "use-eslintrc": {
            describe: "Use the .eslintrc file for configuration, if it exists",
            default: true
          },
          "cache": {
            describe: "operate only on changed files",
            default: false
          },
          "warnAsError": {
            alias: "w",
            describe: "handle warnings as error"
          },
          "print-config": {
            alias : "p",
            describe: "print the eslint configuration"
          },
          "format": {
            alias : "f",
            describe: "use a specific output format",
            default: "codeframe"
          },
          "outputFile": {
            alias: "o",
            describe: "specify file to which the report will be written",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },
          "verbose": {
            alias: "v",
            describe: "enables additional progress output to console",
            type: "boolean"
          },
          "quiet": {
            alias: "q",
            describe: "No output"
          }
        }
      };
    }
  },

  members: {

    process: async function() {
      await this.__applyFixes();
      let config;
      config = await qx.tool.cli.Cli.getInstance().getParsedArgs();
      let lintOptions = config.eslintConfig || {};
      lintOptions.extends = lintOptions.extends || ["@qooxdoo/qx/browser"];
      lintOptions.globals = Object.assign(lintOptions.globals || {}, await this.__addGlobals(config));
      let linter = new CLIEngine({
        cache: this.argv.cache || false,
        baseConfig: lintOptions,
        useEslintrc: this.argv.useEslintrc,
        fix: this.argv.fix
      });
      let files = this.argv.files || [];
      if (files.length === 0) {
        files.push("source/class/");
      }
      if (this.argv.config) {
        const fileConfig = linter.getConfigForFile(files[0]);
        qx.tool.compiler.Console.info(JSON.stringify(fileConfig, null, "  "));
      } else {
        let report = linter.executeOnFiles(files);
        if (this.argv.fix) {
          CLIEngine.outputFixes(report);
        }
        if (report.errorCount > 0 || report.warningCount > 0) {
          let outputFormat = this.argv.format || "codeframe";
          const formatter = linter.getFormatter(outputFormat);
          const s = formatter(report.results);
          if (this.argv.outputFile) {
            if (this.argv.verbose) {
              qx.tool.compiler.Console.info(`Report to be written to ${this.argv.outputFile}`);
            }
            await fs.writeFileAsync(this.argv.outputFile, s, "UTF-8")
              .then(() => {
                if (this.argv.verbose) {
                  qx.tool.compiler.Console.info(`Report written to ${this.argv.outputFile}`);
                }
              })
              .catch(e => qx.tool.compiler.Console.error(`Error writing report to ${this.argv.outputFile}:` + e.message));
          } else if (report.errorCount > 0 || this.argv.warnAsError) {
            throw new qx.tool.utils.Utils.UserError(s);
          } else {
            qx.tool.compiler.Console.info(s);
          }
        } else {
          qx.tool.compiler.Console.info("No errors found!");
        }
      }
    },

    /**
     * Scan all libraries and add the namespace to globals
     * @param {Object} data
     * @return {Promise<void>}
     */
    async __addGlobals(data) {
      let result = {};
      if (data.libraries) {
        await qx.Promise.all(data.libraries.map(async dir => {
          let lib = await qx.tool.compiler.app.Library.createLibrary(dir);
          let s = lib.getNamespace();
          let libs = s.split(".");
          result[libs[0]] = false;
        }));
      }
      return result;
    },

    /**
     * Apply fixes before linting code
     * @return {Promise<void>}
     * @private
     */
    async __applyFixes() {
      let replaceInFiles = [];
      const fixParams = this.argv.fixJsdocParams;
      if (fixParams && fixParams !== "off") {
        const regex = fixParams === "type-first" ?
          /@param\s+([\w$]+)\s+({[\w|[\]{}<>?. ]+})/g :
          /@param\s+({[\w|[\]{}<>?. ]+})\s+([\w$]+)/g;
        replaceInFiles.push({
          files: "source/class/**/*.js",
          from: regex,
          to: "@param $2 $1"
        });
      }
      await this.migrate(null, replaceInFiles);
    }
  }
});

