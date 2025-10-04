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
const { replaceInFile } = require("replace-in-file");

qx.Class.define("qx.tool.compiler.cli.commands.Lint", {
  extend: qx.tool.compiler.cli.Command,

  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.Command.createCliCommand(clazz);
      cmd.set({
        name: "lint",
        description: "runs eslint on the current application or as set of single files."
      });

      cmd.addArgument(
        new qx.tool.cli.Argument("files").set({
          description: "files to lint",
          array: true,
          type: "string"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("fix").set({
          description: "runs eslint with --fix",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("fix-jsdoc-params").set({
          description: "changes the order or @param name and {Type} to make it compatible for the generator ('name-first') or with JSDoc linting ('type-first').",
          type: ["off", "name-first", "type-first"],
          value: "off"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("use-eslintrc").set({
          description: "Use the .eslintrc file for configuration, if it exists",
          type: "boolean",
          value: true
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("cache").set({
          description: "operate only on changed files",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("warn-as-error").set({
          shortCode: "w",
          description: "handle warnings as error",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("print-config").set({
          shortCode: "p",
          description: "print the eslint configuration",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("format").set({
          shortCode: "f",
          description: "use a specific output format",
          type: "string",
          value: "codeframe"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("outputFile").set({
          shortCode: "o",
          description: "specify file to which the report will be written",
          type: "string"
        })
      );

      return cmd;
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

      let config = this.getCompilerApi().getConfiguration();
      let eslintConfig = config.eslintConfig || {};

      // Convert legacy format to flat format first
      let flatConfigInput = await this.__convertToFlatConfig(eslintConfig, config);

      // Process flat format configuration
      let flatConfig = await this.__processFlatConfig(flatConfigInput, helperFilePath, config);

      let linter = new ESLint({
        cwd: process.cwd(),
        cache: this.argv.cache || false,
        overrideConfig: flatConfig,
        fix: this.argv.fix,
        overrideConfigFile: true
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


    __resolveConfigPkg(name) {
      if (name.startsWith('@')) {
        // Scoped: @scope/foo/bar → @scope/eslint-config-foo/bar
        const parts = name.split('/');
        const scope = parts[0];
        const pkg = parts[1];
        const rest = parts.slice(2).join('/');
        const base = pkg.startsWith('eslint-config-') ? pkg : `eslint-config-${pkg}`;
        return rest ? `${scope}/${base}/${rest}` : `${scope}/${base}`;
      }
      // Unscoped: foo → eslint-config-foo
      return name.startsWith('eslint-config-') ? name : `eslint-config-${name}`;
    },
    /**
     * Convert legacy ESLint configuration to flat format
     * @param {Object|Array} eslintConfig - ESLint configuration
     * @param {Object} config - Full configuration object
     * @return {Promise<Array>} Flat configuration array
     */
    async __convertToFlatConfig(eslintConfig, config) {
      // If already flat format, return as-is
      if (Array.isArray(eslintConfig)) {
        return eslintConfig;
      }

      // Convert legacy format to flat format
      let flatConfig = [];
      let lintOptions = { ...eslintConfig };


      // Set defaults
      lintOptions.extends = lintOptions.extends || ["@qooxdoo/qx/browser"];
      // Patch for new syntax. Name resolution in Eslint 9 do not work any longer
      for (let i = 0; i < lintOptions.extends.length; i++) {
        lintOptions.extends[i] = this.__resolveConfigPkg(lintOptions.extends[i]);
      }

      lintOptions.globals = Object.assign(
        lintOptions.globals || {},
        await this.__addGlobals(config)
      );

      // Add ignores config object
      let standardIgnores = [
        "compiled/**",
        "node_modules/**",
        "source/boot/**",
        "source/resource/**",
        "source/translation/**"
      ];
      let customIgnores = lintOptions.ignorePatterns || [];
      let allIgnores = [...standardIgnores, ...customIgnores];

      if (allIgnores.length > 0) {
        flatConfig.push({
          ignores: allIgnores
        });
      }

      // Add main config object - use requires instead of extends for flat config
      let mainConfig = {
        requires: lintOptions.extends
      };

      if (lintOptions.globals && Object.keys(lintOptions.globals).length > 0) {
        mainConfig.languageOptions = {
          ...(lintOptions.ecmaVersion && { ecmaVersion: lintOptions.ecmaVersion }),
          globals: lintOptions.globals
        };
      }

      if (lintOptions.linterOptions) {
        mainConfig.linterOptions = lintOptions.linterOptions;
      }

      if (lintOptions.rules && Object.keys(lintOptions.rules).length > 0) {
        mainConfig.rules = lintOptions.rules;
      }

      flatConfig.push(mainConfig);

      return flatConfig;
    },

    /**
     * Process flat format ESLint configuration
     * @param {Array} flatConfigInput - Flat configuration array
     * @param {String} helperFilePath - Helper file path for Babel
     * @param {Object} config - Full configuration object
     * @return {Promise<Array>} Processed flat configuration
     */
    async __processFlatConfig(flatConfigInput, helperFilePath, config) {
      let flatConfig = [];
      for (let configItem of flatConfigInput) {
        // Handle both extends and requires (support both legacy and flat config syntax)
        if (configItem.requires) {
          for (let extendConfig of configItem.requires) {
            try {
              let importedConfig = require(extendConfig);
              if (Array.isArray(importedConfig)) {
                flatConfig.push(...importedConfig);
              } else {
                flatConfig.push(importedConfig);
              }
            } catch (err) {
              qx.tool.compiler.Console.warn(`Failed to load extends config '${extendConfig}': ${err.message}`);
            }
          }
        }
        // Create processed config without extends/requires
        let processedConfig = { ...configItem };
        delete processedConfig.extends;
        delete processedConfig.requires;

        // Add default parser settings if languageOptions exist or need to be created
        if (processedConfig.languageOptions || !configItem.ignores) {
          processedConfig.languageOptions = {
            parser: require("@babel/eslint-parser"),
            parserOptions: {
              requireConfigFile: false,
              babelOptions: {
                cwd: helperFilePath,
                plugins: ["@babel/plugin-syntax-jsx"],
                parserOpts: {
                  allowSuperOutsideMethod: true
                }
              },
              sourceType: "script",
              ...(processedConfig.languageOptions?.parserOptions || {})
            },
            ...(processedConfig.languageOptions?.ecmaVersion && { ecmaVersion: processedConfig.languageOptions.ecmaVersion }),
            globals: {
              ...await this.__addGlobals(config),
              ...(processedConfig.languageOptions?.globals || {})
            }
          };
        }

        flatConfig.push(processedConfig);
      }

      // Ensure we have ignores if none were provided
      let hasIgnores = flatConfig.some(config => config.ignores);
      if (!hasIgnores) {
        flatConfig.unshift({
          ignores: [
            "compiled/**",
            "node_modules/**",
            "source/boot/**",
            "source/resource/**",
            "source/translation/**"
          ]
        });
      }

      return flatConfig;
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
