/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2024 The authors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Migration Team

************************************************************************ */

const process = require("process");
const path = require("upath");
const semver = require("semver");
const fs = qx.tool.utils.Promisify.fs;

/**
 * Migration class for updating from v7 to v8
 */
qx.Class.define("qx.tool.migration.M8_0_0", {
  extend: qx.tool.migration.BaseMigration,
  members: {
    /**
     * Update Manifest.json files
     */
    async migrateManifest() {
      let dryRun = this.getRunner().getDryRun();
      let verbose = this.getRunner().getVerbose();

      // Update all Manifests
      for (const manifestModel of await qx.tool.config.Utils.getManifestModels()) {
        await manifestModel
          .set({
            warnOnly: true
          })
          .load();

        // Update schema to v8 schema (when available)
        // await this.updateSchemaUnlessDryRun(
        //   manifestModel,
        //   "https://qooxdoo.org/schema/Manifest-3-0-0.json"
        // );

        // Update qooxdoo version dependency
        await this.updateQxDependencyUnlessDryRun(manifestModel);

        // Save Manifest file
        if (!dryRun) {
          manifestModel.setValidate(false);
          await manifestModel.save();
        }
      }
    },

    /**
     * Migrate code that sets table model data during editing
     * This is now an error in v8, so we need to warn users
     */
    async migrateTableModelUsage() {
      // This is informational only - always announce this breaking change
      this.announce(
        "*** IMPORTANT: qx.ui.table.Table Breaking Change ***\n" +
        "Setting model data while the table is editing will now raise an error.\n" +
        "Please review your code to ensure that table edits are completed or\n" +
        "cancelled before refreshing table model data.\n" +
        "See: https://github.com/qooxdoo/qooxdoo/blob/master/CHANGELOG.md#breaking-changes"
      );
      this.markAsPending(
        "Manual review required for table model data updates"
      );
    },

    /**
     * Check for usage of deprecated APIs from v6 and v7 that have been removed in v8
     */
    async migrateDeprecatedAPIs() {
      // Inform about removed deprecated APIs
      this.announce(
        "*** INFO: Deprecated APIs Removed in v8 ***\n" +
        "The following deprecated APIs have been removed. Please update your code:\n\n" +
        "Entire Classes Removed:\n" +
        "- qx.dev.ObjectSummary (v6.0) - automatic memory management makes this unnecessary\n" +
        "- qx.log.appender.Util (v6.0) - use qx.log.appender.Formatter instead\n" +
        "- qx.ui.table.model.Filtered (v6.0) - use Array.filter() instead\n" +
        "- qx.lang.normalize.Date (v7.0) - use native Date methods\n\n" +
        "Methods Removed:\n" +
        "- qx.Promise.toPromise() - internal implementation subject to change\n" +
        "- qx.data.Array.contains() - use includes() instead\n" +
        "- qx.lang.Array.contains() - use arr.includes() instead\n" +
        "- qx.lang.Object.getValues() - use Object.values() instead\n" +
        "- qx.lang.String.startsWith/endsWith (v6.0) - use native String methods\n" +
        "- qx.ui.virtual.selection.Abstract.detatchPointerEvents() - use detachPointerEvents() instead\n" +
        "- qx.core.ObjectRegistry.shutdown() - automatic garbage collection preferred\n" +
        "- qx.log.appender.Formatter.toTextArray() - use toText() instead\n" +
        "- qx.html.Node._flush() - use flush() instead\n" +
        "- qx.html.Node._applyProperty() - use registerProperty() instead\n" +
        "- qx.ui.table.Table._onKeyPress() - use _onKeyDown() instead\n" +
        "- qx.event.Manager.getGlobalEventMonitor() - use addGlobalEventMonitor() instead\n" +
        "- qx.event.Manager.setGlobalEventMonitor() - use addGlobalEventMonitor() instead\n" +
        "- qx.html.Element.fromDomElement() (v6.1) - use qx.html.Node.fromDomNode() instead\n" +
        "- qx.html.Element.connectWidget() (v6.1) - use connectObject() instead\n" +
        "- qx.html.Element.disconnectWidget() (v6.1) - use disconnectObject() instead\n\n" +
        "Properties Removed:\n" +
        "- qx.core.ObjectRegistry.inShutDown - shutdown mechanism removed\n\n" +
        "Please review your code for usage of these removed APIs."
      );
    },

    /**
     * Update compile.json schema if needed
     */
    async migrateCompileJson() {
      const compileJsonModel = qx.tool.config.Compile.getInstance().set({
        warnOnly: true,
        validate: false
      });

      if (!(await fs.existsAsync(compileJsonModel.getDataPath()))) {
        return;
      }

      await compileJsonModel.load();

      // Update schema to v8 schema (when available)
      // await this.updateSchemaUnlessDryRun(
      //   compileJsonModel,
      //   "https://qooxdoo.org/schema/compile-2-0-0.json"
      // );

      if (!this.getRunner().getDryRun()) {
        await compileJsonModel.save();
      }
    },

    /**
     * Migrate compile.js from yargs to CLI classes
     * This is a major breaking change in v8
     */
    async migrateCompileJs() {
      const compileJsPath = path.join(process.cwd(), "compile.js");
      if (!(await fs.existsAsync(compileJsPath))) {
        return;
      }

      const content = await fs.readFileAsync(compileJsPath, "utf8");

      // Check if using old yargs API
      if (content.includes("getYargsCommand") || content.includes("yargs")) {
        this.announce(
          "*** IMPORTANT: CLI System Breaking Change ***\n" +
          "The CLI system has been migrated from yargs to custom CLI classes.\n" +
          "If your compile.js extends commands, you need to update the syntax.\n\n" +
          "Old syntax:\n" +
          "  let yargs = qx.tool.cli.commands.Test.getYargsCommand;\n" +
          "  qx.tool.cli.commands.Test.getYargsCommand = () => { ... };\n\n" +
          "New syntax:\n" +
          "  let originalCreateCliCommand = qx.tool.compiler.cli.commands.Test.createCliCommand;\n" +
          "  qx.tool.compiler.cli.commands.Test.createCliCommand = async function(clazz) {\n" +
          "    let cmd = await originalCreateCliCommand.call(this, clazz);\n" +
          "    cmd.addFlag(new qx.tool.cli.Flag(...));\n" +
          "  };\n\n" +
          "See CHANGELOG.md for detailed migration guide."
        );
        this.markAsPending("Manual migration of compile.js yargs API required");
      }

      // Automatically update old class names to new ones
      // Order matters! Most specific patterns first to avoid partial replacements
      const replacements = [
        {
          files: compileJsPath,
          from: /qx\.tool\.cli\.commands\.Package/g,
          to: "qx.tool.compiler.cli.commands.Package"
        },
        {
          files: compileJsPath,
          from: /qx\.tool\.cli\.ConfigDb/g,
          to: "qx.tool.compiler.cli.ConfigDb"
        },
        {
          files: compileJsPath,
          from: /qx\.tool\.cli\.commands\./g,
          to: "qx.tool.compiler.cli.commands."
        }
      ];

      // Check if any replacements are needed
      let needsReplacement = false;
      for (const replacement of replacements) {
        if (content.match(replacement.from)) {
          needsReplacement = true;
          break;
        }
      }

      if (needsReplacement) {
        await this.replaceInFilesUnlessDryRun(replacements);
      }
    },

    /**
     * Check for instance.name usage (no longer available in v8)
     * Should be replaced with instance.classname
     */
    async migrateInstanceName() {
      this.announce(
        "*** IMPORTANT: instance.name No Longer Available ***\n" +
        "The predefined instance.name variable is no longer available.\n" +
        "Please replace all uses of instance.name with instance.classname.\n\n" +
        "This change was necessary because with native properties,\n" +
        "instance.name conflicts with the commonly used property name 'name'."
      );
      this.markAsPending("Replace instance.name with instance.classname");
    },

    /**
     * Check for property and member namespace conflicts
     * Properties and members now share the same namespace
     */
    async migratePropertyMemberConflicts() {
      const sourceDir = path.join(process.cwd(), "source");
      if (!(await fs.existsAsync(sourceDir))) {
        return;
      }

      this.announce(
        "*** IMPORTANT: Property/Member Namespace Change ***\n" +
        "Properties and members are now in the same namespace.\n" +
        "If a class has both a property and a member with the same name,\n" +
        "this will cause a conflict. Please review your class definitions.\n\n" +
        "Also note: Refining a property in a subclass now adds it to the\n" +
        "subclass prototype instead of modifying it in place."
      );
      this.markAsPending("Manual review of property/member conflicts required");
    },

    /**
     * Warn about Node.js version requirement for ESLint 9
     */
    async migrateNodeVersion() {
      this.announce(
        "*** IMPORTANT: Node.js Version Requirement ***\n" +
        "qooxdoo v8 requires Node.js >= 20.0.0 for the compiler.\n" +
        "This is due to the migration from ESLint 8 to ESLint 9.\n\n" +
        "ESLint configuration in compile.json is automatically converted\n" +
        "from the old format to the new Flat Config format.\n\n" +
        "Plugin names must now be complete:\n" +
        "  Old: '@qooxdoo/qx'\n" +
        "  New: '@qooxdoo/eslint-plugin-qx' or full import"
      );
      this.markAsPending("Verify Node.js version >= 20.0.0");
    },

    /**
     * Warn about qx.locale changes (CLDR → Intl API)
     */
    async migrateLocaleAPI() {
      this.announce(
        "*** INFO: qx.locale Implementation Change ***\n" +
        "qx.locale classes now use the native Internationalization API\n" +
        "instead of the Common Locale Data Repository (CLDR) package.\n" +
        "This significantly reduces package size but may cause minor\n" +
        "differences in formatting for some locales.\n\n" +
        "Please test your locale-specific functionality if you use it."
      );
    },

    /**
     * Warn about Form.add() name parameter lowercase requirement
     * and try to find problematic patterns in user code
     */
    async migrateFormAddNames() {
      const sourceDir = path.join(process.cwd(), "source");
      if (!(await fs.existsAsync(sourceDir))) {
        // No source directory, just give general warning
        this.announce(
          "*** IMPORTANT: qx.ui.form.Form.add() Name Parameter ***\n" +
          "In v8, the name parameter of qx.ui.form.Form.add() MUST\n" +
          "start with a lowercase letter to avoid property binding errors.\n\n" +
          "Example:\n" +
          "  // Wrong:\n" +
          "  form.add(widget, 'Label', null, 'MyField');\n\n" +
          "  // Correct:\n" +
          "  form.add(widget, 'Label', null, 'myField');"
        );
        this.markAsPending("Review form.add() name parameters");
        return;
      }

      // Scan for form.add() calls
      let foundIssues = [];

      // Recursively find all .js files
      const findJsFiles = async dir => {
        let jsFiles = [];
        try {
          const entries = await fs.readdirAsync(dir);
          for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const stat = await fs.statAsync(fullPath);
            if (stat.isDirectory()) {
              jsFiles = jsFiles.concat(await findJsFiles(fullPath));
            } else if (entry.endsWith('.js')) {
              jsFiles.push(fullPath);
            }
          }
        } catch (e) {
          // Ignore errors reading directories
        }
        return jsFiles;
      };

      const jsFiles = await findJsFiles(sourceDir);

      // Pattern to match: .add(..., "NameStartingWithUppercase")
      // This will catch obvious cases like form.add(widget, "Label", null, "MyField")
      const uppercaseNamePattern = /\.add\s*\([^)]*['"]([A-Z][a-zA-Z0-9_]*)['"]\s*\)/g;

      for (const file of jsFiles) {
        try {
          const content = await fs.readFileAsync(file, 'utf8');

          // Check if file contains form.add() calls
          if (content.includes('.add(')) {
            // Look for uppercase name parameters
            const matches = [...content.matchAll(uppercaseNamePattern)];

            if (matches.length > 0) {
              const relativePath = path.relative(process.cwd(), file);
              const names = matches.map(m => m[1]).filter((v, i, a) => a.indexOf(v) === i);
              foundIssues.push({
                file: relativePath,
                names: names
              });
            }
          }
        } catch (e) {
          // Ignore errors reading individual files
        }
      }

      // Report findings
      if (foundIssues.length > 0) {
        let message = "*** IMPORTANT: Found Potential form.add() Issues ***\n" +
          "The following files contain .add() calls with uppercase names.\n" +
          "In v8, form.add() name parameters MUST start with lowercase!\n\n";

        for (const issue of foundIssues) {
          message += `  ${issue.file}:\n`;
          for (const name of issue.names) {
            message += `    - "${name}" should be "${name.charAt(0).toLowerCase() + name.slice(1)}"\n`;
          }
        }

        message += "\nExample fix:\n" +
          "  // Wrong:\n" +
          "  form.add(widget, 'Label', null, 'MyField');\n\n" +
          "  // Correct:\n" +
          "  form.add(widget, 'Label', null, 'myField');";

        this.announce(message);
        this.markAsPending("Fix uppercase form.add() name parameters");
      } else {
        // No issues found, but still warn as we might have missed some
        this.announce(
          "*** INFO: qx.ui.form.Form.add() Name Parameter ***\n" +
          "No obvious issues found, but please note:\n" +
          "In v8, the name parameter of form.add() MUST start with\n" +
          "a lowercase letter to avoid property binding errors."
        );
      }
    },

    /**
     * Upgrade packages to v8 compatible versions
     */
    async migratePackages() {
      await this.upgradePackagesUnlessDryRun();
    }
  }
});
