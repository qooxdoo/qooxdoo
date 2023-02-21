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

const { ESLint } = require("eslint");
const fs = qx.tool.utils.Promisify.fs;
const path = require("path");
const replaceInFile = require("replace-in-file");

qx.Class.define("qx.tool.cli.commands.Lint", {
  extend: qx.tool.cli.commands.Command,

  statics: {
    getYargsCommand() {
      return {
        command: "lint [files...]",
        describe:
          "runs eslint on the current application or as set of single files.",
        builder: {
          fix: {
            describe: "runs eslint with --fix"
          },

          "fix-jsdoc-params": {
            describe:
              "changes the order or @param name and {Type} to make it compatible for the generator ('name-first') or with JSDoc linting ('type-first').",
            choices: ["off", "name-first", "type-first"],
            default: "off"
          },

          "use-eslintrc": {
            describe: "Use the .eslintrc file for configuration, if it exists",
            type: "boolean",
            default: true
          },

          cache: {
            describe: "operate only on changed files",
            type: "boolean",
            default: false
          },

          warnAsError: {
            alias: "w",
            describe: "handle warnings as error"
          },

          "print-config": {
            alias: "p",
            describe: "print the eslint configuration"
          },

          format: {
            alias: "f",
            describe: "use a specific output format",
            default: "codeframe"
          },

          outputFile: {
            alias: "o",
            describe: "specify file to which the report will be written",
            nargs: 1,
            requiresArg: true,
            type: "string"
          },

          verbose: {
            alias: "v",
            describe: "enables additional progress output to console",
            type: "boolean"
          },

          quiet: {
            alias: "q",
            describe: "No output"
          }
        }
      };
    }
  },

  members: {
    async process() {
      let files = this.argv.files || [];
      if (files.length === 0) {
        files.push("source/class/**/*.js");
      }
      for (let i = 0; i < files.length; i++) {
        files[i] = path.join(process.cwd(), files[i]);
      }

      await this.__applyFixes(files);

      let helperFilePath = require.main.path;
      while (true) {
        if (await fs.existsAsync(path.join(helperFilePath, "node_modules"))) {
          break;
        }
        helperFilePath = path.dirname(helperFilePath);
      }

      let config = qx.tool.cli.Cli.getInstance().getParsedArgs();
      let lintOptions = config.eslintConfig || {};
      lintOptions.extends = lintOptions.extends || ["@qooxdoo/qx/browser"];
      lintOptions.globals = Object.assign(
        lintOptions.globals || {},
        await this.__addGlobals(config)
      );

      lintOptions.parser = "@babel/eslint-parser";
      lintOptions.parserOptions = lintOptions.parserOptions || {};
      lintOptions.parserOptions.requireConfigFile = false;
      lintOptions.parserOptions.babelOptions = {
        cwd: helperFilePath,
        plugins: ["@babel/plugin-syntax-jsx"],

        parserOpts: {
          allowSuperOutsideMethod: true
        }
      };

      lintOptions.parserOptions.sourceType = "script";
      let linter = new ESLint({
        cwd: helperFilePath,
        cache: this.argv.cache || false,
        baseConfig: lintOptions,
        useEslintrc: this.argv.useEslintrc,
        fix: this.argv.fix
      });

      if (this.argv.printConfig) {
        const fileConfig = await linter.calculateConfigForFile(files[0]);
        qx.tool.compiler.Console.info(JSON.stringify(fileConfig, null, "  "));
      } else {
        let report = await linter.lintFiles(files);
        report.errorCount = 0;
        report.warningCount = 0;
        for (const r of report) {
          report.errorCount += r.errorCount;
          report.warningCount += r.warningCount;
        }
        if (this.argv.fix) {
          await ESLint.outputFixes(report);
        }
        if (report.errorCount > 0 || report.warningCount > 0) {
          let outputFormat = this.argv.format || "codeframe";
          const formatter = await linter.loadFormatter(outputFormat);
          const s = formatter.format(report);
          // If there are too many errors, the pretty formatter is appallingly slow so if the
          // user has not specified a format, change to compact mode
          const maxDefaultFormatErrorCount = 150;
          if (
            report.errorCount + report.warningCount >
            maxDefaultFormatErrorCount
          ) {
            if (!this.argv.format) {
              qx.tool.compiler.Console.info(
                `Total errors and warnings exceed ${maxDefaultFormatErrorCount}, switching to "compact" style report`
              );

              outputFormat = "compact";
            } else {
              qx.tool.compiler.Console.info(
                `Total errors and warnings exceed ${maxDefaultFormatErrorCount}, the report may take some time to generate.`
              );
            }
          }
          if (this.argv.outputFile) {
            if (this.argv.verbose) {
              qx.tool.compiler.Console.info(
                `Report to be written to ${this.argv.outputFile}`
              );
            }
            await fs
              .writeFileAsync(this.argv.outputFile, s, "UTF-8")
              .then(() => {
                if (this.argv.verbose) {
                  qx.tool.compiler.Console.info(
                    `Report written to ${this.argv.outputFile}`
                  );
                }
              })
              .catch(e =>
                qx.tool.compiler.Console.error(
                  `Error writing report to ${this.argv.outputFile}:` + e.message
                )
              );
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
        await qx.Promise.all(
          data.libraries.map(async dir => {
            let lib = await qx.tool.compiler.app.Library.createLibrary(dir);
            let s = lib.getNamespace();
            let libs = s.split(".");
            result[libs[0]] = false;
          })
        );
      }
      return result;
    },

    /**
     * Apply fixes before linting code
     * @return {Promise<void>}
     * @private
     */
    async __applyFixes(files) {
      const fixParams = this.argv.fixJsdocParams;
      if (fixParams && fixParams !== "off") {
        const regex =
          fixParams === "type-first"
            ? /@param\s+([\w$]+)\s+({[\w|[\]{}<>?. ]+})/g
            : /@param\s+({[\w|[\]{}<>?. ]+})\s+([\w$]+)/g;
        let replaceInFiles = {
          files: files,
          from: regex,
          to: "@param $2 $1"
        };

        await replaceInFile(replaceInFiles);
      }
    }
  }
});
