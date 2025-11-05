/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2025 Henner Kollmann and others

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */

const fs = require("fs");
const path = require("upath");
const prettier = require("prettier");
const ignore = require("ignore");

/**
 * Formats code using Prettier
 */
qx.Class.define("qx.tool.compiler.cli.commands.Prettier", {
  extend: qx.tool.compiler.cli.Command,

  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.Command.createCliCommand(clazz);
      cmd.set({
        name: "prettier",
        description: "formats code using Prettier"
      });

      cmd.addArgument(
        new qx.tool.cli.Argument("files").set({
          description: "files to format",
          array: true,
          type: "string"
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("check").set({
          description: "Check if files are formatted (don't write)",
          type: "boolean",
          value: false
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("write").set({
          description: "Write formatted files",
          type: "boolean",
          value: true
        })
      );

      cmd.addFlag(
        new qx.tool.cli.Flag("gitPreCommit").set({
          description: "When used as a Git pre-commit hook",
          type: "boolean",
          value: false
        })
      );

      return cmd;
    }
  },

  members: {
    async process() {
      const ignoreFileName = ".prettierignore";
      const ig = ignore();

      // Load .prettierignore file if it exists
      try {
        const ignoreContent = await fs.promises.readFile(ignoreFileName, "utf8");
        ig.add(ignoreContent);
      } catch (err) {
        if (err.code !== "ENOENT") {
          throw err;
        }
      }

      // Track formatting results
      let totalFiles = 0;
      let formattedFiles = 0;
      let unformattedFiles = [];

      /**
       * Process a single file with Prettier
       */
      const processFile = async filename => {
        // Get relative path for ignore checking
        const relativePath = path.relative(process.cwd(), filename);

        // Check if file should be ignored (only for files within project)
        if (!relativePath.startsWith("..") && ig.ignores(relativePath)) {
          if (this.argv.verbose) {
            qx.tool.compiler.Console.info(`Ignoring ${relativePath}`);
          }
          return;
        }

        totalFiles++;

        try {
          // Read file content
          const content = await fs.promises.readFile(filename, "utf8");

          // Resolve prettier configuration
          let prettierConfig = await prettier.resolveConfig(filename, {
            editorConfig: true
          });

          if (!prettierConfig) {
            prettierConfig = {};
          }

          // Determine parser based on file extension
          const ext = path.extname(filename);
          if (ext === ".js") {
            prettierConfig.parser = "babel";
          } else if (ext === ".json") {
            prettierConfig.parser = "json";
          } else if (ext === ".md") {
            prettierConfig.parser = "markdown";
          }

          // Check if file is already formatted
          const isFormatted = await prettier.check(content, prettierConfig);

          if (!isFormatted) {
            unformattedFiles.push(filename);

            if (this.argv.check) {
              qx.tool.compiler.Console.warn(`${filename} is not formatted`);
            } else if (this.argv.write) {
              // Format and write the file
              const formatted = await prettier.format(content, prettierConfig);
              await fs.promises.writeFile(filename, formatted, "utf8");
              formattedFiles++;
              qx.tool.compiler.Console.info(`Formatted ${filename}`);
            }
          } else if (this.argv.verbose) {
            qx.tool.compiler.Console.info(`${filename} is already formatted`);
          }
        } catch (err) {
          qx.tool.compiler.Console.error(`Error processing ${filename}: ${err.message}`);
          throw err;
        }
      };

      /**
       * Recursively scan directories for JavaScript files
       */
      const scanImpl = async filename => {
        try {
          const stat = await fs.promises.stat(filename);
          const basename = path.basename(filename);

          if (stat.isFile() && basename.match(/\.js$/)) {
            await processFile(filename);
          } else if (
            stat.isDirectory() &&
            (basename === "." || basename[0] !== ".")
          ) {
            const files = await fs.promises.readdir(filename);
            for (let i = 0; i < files.length; i++) {
              const subname = path.join(filename, files[i]);
              await scanImpl(subname);
            }
          }
        } catch (err) {
          if (err.code !== "ENOENT") {
            throw err;
          }
        }
      };

      // Handle git pre-commit hook mode
      if (this.argv.gitPreCommit) {
        let result = await qx.tool.utils.Utils.runCommand(
          process.cwd(),
          "git",
          "diff",
          "--cached",
          "--name-only",
          "--diff-filter=ACMR"
        );

        if (result.exitCode !== 0) {
          qx.tool.compiler.Console.error(
            `Failed to run 'git diff': ${JSON.stringify(result, null, 2)}`
          );
          process.exit(1);
          return;
        }

        const lines = result.output
          .split(/\n/)
          .filter(str => !!str.match(/^source\/class\/.*\.js$/));

        for (let filename of lines) {
          await processFile(filename);

          if (!this.argv.check && this.argv.write) {
            // Add formatted file back to git staging
            result = await qx.tool.utils.Utils.runCommand(
              process.cwd(),
              "git",
              "add",
              filename
            );

            if (result.exitCode !== 0) {
              qx.tool.compiler.Console.error(
                `Failed to run 'git add ${filename}': ${JSON.stringify(
                  result,
                  null,
                  2
                )}`
              );
              process.exit(1);
              return;
            }
          }
        }

        // Exit with error if in check mode and files are unformatted
        if (this.argv.check && unformattedFiles.length > 0) {
          process.exit(1);
        } else {
          process.exit(0);
        }
      }

      // Process files from arguments or default to source directory
      let files = this.argv.files || [];
      if (files.length === 0) {
        files.push("source");
      }

      for (const file of files) {
        await scanImpl(file);
      }

      // Print summary
      qx.tool.compiler.Console.info(`\nProcessed ${totalFiles} file(s)`);

      if (this.argv.check) {
        if (unformattedFiles.length > 0) {
          qx.tool.compiler.Console.error(
            `${unformattedFiles.length} file(s) are not formatted:`
          );
          for (const file of unformattedFiles) {
            qx.tool.compiler.Console.error(`  - ${file}`);
          }
          throw new qx.tool.utils.Utils.UserError(
            `${unformattedFiles.length} file(s) need formatting`
          );
        } else {
          qx.tool.compiler.Console.info("All files are formatted!");
        }
      } else if (this.argv.write) {
        if (formattedFiles > 0) {
          qx.tool.compiler.Console.info(`Formatted ${formattedFiles} file(s)`);
        } else {
          qx.tool.compiler.Console.info("All files were already formatted!");
        }
      }
    }
  }
});
