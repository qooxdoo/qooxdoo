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
const babylon = require("@babel/parser");
const traverse = require("@babel/traverse").default;

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
     * Check for usage of deprecated APIs from v6 and v7
     * that might be removed in v8
     */
    async migrateDeprecatedAPIs() {
      // Inform about deprecated APIs
      this.announce(
        "*** INFO: Deprecated APIs ***\n" +
        "The following APIs are deprecated and may be removed in future versions:\n" +
        "- qx.lang.normalize.Date (deprecated since v7.0) - Use native Date methods\n" +
        "- qx.lang.String.startsWith/endsWith (deprecated since v6.0) - Use native String methods\n\n" +
        "Please review your code for usage of these deprecated APIs."
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
      const sourceDir = path.join(process.cwd(), "source");
      if (!(await fs.existsAsync(sourceDir))) {
        this.announce(
          "*** IMPORTANT: instance.name No Longer Available ***\n" +
          "The predefined instance.name variable is no longer available.\n" +
          "Please replace all uses of instance.name with instance.classname."
        );
        return;
      }

      // Use unified scan (already done by migratePropertyMemberConflicts)
      // Results are cached in this.__scanResults
      if (!this.__scanResults) {
        await this.__scanSourceFilesForIssues(sourceDir);
      }

      const usages = this.__scanResults.nameFieldUsages;

      // Report findings
      if (usages.length > 0) {
        let message = "*** IMPORTANT: Instance .name Field Usage Detected ***\n" +
          "The automatic .name field on object instances is no longer available in v8.\n" +
          "The following usages were found:\n\n";

        for (const usage of usages) {
          message += `  ${usage.file}:\n`;
          for (const location of usage.locations) {
            message += `    Line ${location.line}: ${location.context}\n`;
          }
        }

        message += "\nPlease replace .name with .classname on all Qooxdoo object instances.\n" +
          "Examples:\n" +
          "  - this.name → this.classname\n" +
          "  - widget.name → widget.classname\n" +
          "  - obj.name → obj.classname\n\n" +
          "This change was necessary because with native properties in v8,\n" +
          "the .name field conflicts with property definitions named 'name'.\n\n" +
          "Note: Property getters like this.getName() are still valid.";

        this.announce(message);
        this.markAsPending(`Replace ${usages.length} .name field usage(s) with .classname`);
      } else {
        this.announce(
          "*** INFO: Instance .name Field Check ***\n" +
          "No uses of the .name field on instances detected in your codebase.\n\n" +
          "Note: The automatic .name field is no longer available in v8.\n" +
          "Use .classname instead to get the class name of an instance."
        );
      }
    },

    /**
     * Check for property and member namespace conflicts
     * Properties and members now share the same namespace
     */
    async migratePropertyMemberConflicts() {
      const sourceDir = path.join(process.cwd(), "source");
      if (!(await fs.existsAsync(sourceDir))) {
        this.announce(
          "*** INFO: Property/Member Namespace Change ***\n" +
          "In v8, properties and members now share the same namespace.\n" +
          "Refining a property in a subclass now adds it to the\n" +
          "subclass prototype instead of modifying it in place."
        );
        return;
      }

      // Scan source files once for all issues
      await this.__scanSourceFilesForIssues(sourceDir);

      const conflicts = this.__scanResults.propertyMemberConflicts;

      // Report findings
      if (conflicts.length > 0) {
        let message = "*** IMPORTANT: Property/Member Conflicts Detected ***\n" +
          "In v8, properties and members share the same namespace.\n" +
          "The following conflicts were found:\n\n";

        for (const conflict of conflicts) {
          message += `  ${conflict.file}`;
          if (conflict.className) {
            message += ` (${conflict.className})`;
          }
          message += ":\n";

          if (conflict.propMemberConflicts.length > 0) {
            message += `    Properties conflicting with members: ${conflict.propMemberConflicts.join(", ")}\n`;
          }

          if (conflict.propStaticConflicts.length > 0) {
            message += `    Properties conflicting with statics: ${conflict.propStaticConflicts.join(", ")}\n`;
          }
        }

        message += "\nYou must rename either the property or the member/static to resolve conflicts.\n" +
          "Typical solution: Rename the member method (e.g., 'name' → 'getName' or '_name')";

        this.announce(message);
        this.markAsPending(`Fix ${conflicts.length} property/member conflict(s)`);
      } else {
        this.announce(
          "*** INFO: Property/Member Namespace Check ***\n" +
          "No property/member conflicts detected in your codebase.\n\n" +
          "Note: In v8, properties and members now share the same namespace.\n" +
          "Refining a property in a subclass now adds it to the subclass\n" +
          "prototype instead of modifying it in place."
        );
      }
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
      // Check if contrib.json exists and has libraries before attempting upgrade
      const contribPath = "contrib.json";
      if (await fs.existsAsync(contribPath)) {
        try {
          const contribData = JSON.parse(await fs.readFileAsync(contribPath, "utf8"));
          if (contribData.libraries && contribData.libraries.length > 0) {
            await this.upgradePackagesUnlessDryRun();
          }
        } catch (e) {
          // contrib.json doesn't exist or is invalid, skip package upgrade
        }
      }
    },

    /**
     * Unified method to scan source files for multiple issues in one pass
     * This scans each file only once and performs all AST-based checks
     * @param {String} sourceDir - Source directory to scan
     * @return {Promise<void>} - Results are stored in this.__scanResults
     */
    async __scanSourceFilesForIssues(sourceDir) {
      // Initialize results structure
      this.__scanResults = {
        propertyMemberConflicts: [],
        nameFieldUsages: []
      };

      const jsFiles = await this.__findJsFiles(sourceDir);

      for (const file of jsFiles) {
        try {
          const content = await fs.readFileAsync(file, 'utf8');

          // Quick pre-filter: skip files that don't need analysis
          const needsQxDefineCheck = content.match(/qx\.(Class|Mixin)\.define/);
          const needsNameCheck = content.includes('.name');

          if (!needsQxDefineCheck && !needsNameCheck) {
            continue;
          }

          // Parse with Babel (only once per file!)
          const ast = babylon.parse(content, {
            sourceType: "module",
            errorRecovery: true
          });

          const relativePath = path.relative(process.cwd(), file);

          // Check 1: Property/Member conflicts (if file has qx definitions)
          if (needsQxDefineCheck) {
            const definitions = this.__findQxDefinitions(ast);

            for (const def of definitions) {
              const propertyNames = this.__extractPropertyNames(def.configObj);
              const memberNames = this.__extractMemberNames(def.configObj);
              const staticNames = this.__extractStaticNames(def.configObj);

              const propMemberConflicts = this.__findIntersection(propertyNames, memberNames);
              const propStaticConflicts = this.__findIntersection(propertyNames, staticNames);

              if (propMemberConflicts.length > 0 || propStaticConflicts.length > 0) {
                this.__scanResults.propertyMemberConflicts.push({
                  file: relativePath,
                  className: def.className,
                  propMemberConflicts,
                  propStaticConflicts
                });
              }
            }
          }

          // Check 2: .name field usage (if file has .name access)
          if (needsNameCheck) {
            const locations = this.__findInstanceNameUsages(ast);

            if (locations.length > 0) {
              this.__scanResults.nameFieldUsages.push({
                file: relativePath,
                locations
              });
            }
          }
        } catch (e) {
          // Log parse errors but continue with other files
          if (this.getRunner().getVerbose()) {
            qx.tool.compiler.Console.warn(
              `Could not parse ${path.relative(process.cwd(), file)}: ${e.message}`
            );
          }
        }
      }
    },

    /**
     * Helper method to recursively find all .js files in a directory
     * @param {String} dir - Directory to search
     * @return {Promise<String[]>} - Array of file paths
     */
    async __findJsFiles(dir) {
      let jsFiles = [];
      try {
        const entries = await fs.readdirAsync(dir);
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stat = await fs.statAsync(fullPath);
          if (stat.isDirectory()) {
            jsFiles = jsFiles.concat(await this.__findJsFiles(fullPath));
          } else if (entry.endsWith('.js')) {
            jsFiles.push(fullPath);
          }
        }
      } catch (e) {
        // Ignore errors reading directories
      }
      return jsFiles;
    },

    /**
     * Helper method to find intersection of two arrays
     * @param {Array} arr1 - First array
     * @param {Array} arr2 - Second array
     * @return {Array} - Array of common elements
     */
    __findIntersection(arr1, arr2) {
      return arr1.filter(name => arr2.includes(name));
    },

    /**
     * Helper method to get the name from an object key (Identifier or StringLiteral)
     * @param {Object} key - AST node representing object key
     * @return {String} - Key name
     */
    __getKeyName(key) {
      return key.name || key.value;
    },

    /**
     * Helper method to collapse MemberExpression into a string
     * (Adapted from ClassFile.js)
     * @param {Object} node - AST MemberExpression node
     * @return {String} - Collapsed string like "qx.Class.define"
     */
    __collapseMemberExpression(node) {
      if (!node) {
        return null;
      }
      if (node.type === "Identifier") {
        return node.name;
      }
      if (node.type !== "MemberExpression") {
        return null;
      }
      const object = this.__collapseMemberExpression(node.object);
      const property = node.property.name || node.property.value;
      if (object && property) {
        return object + "." + property;
      }
      return null;
    },

    /**
     * Helper method to find qx.Class.define and qx.Mixin.define calls in AST
     * @param {Object} ast - Babel AST
     * @return {Array} - Array of definition objects {type, className, configObj}
     */
    __findQxDefinitions(ast) {
      const definitions = [];
      const self = this;

      traverse(ast, {
        CallExpression(path) {
          const node = path.node;
          const callee = self.__collapseMemberExpression(node.callee);

          if (callee === "qx.Class.define" || callee === "qx.Mixin.define") {
            // Extract class name from first argument
            let className = null;
            if (node.arguments[0] && (node.arguments[0].type === "StringLiteral" || node.arguments[0].type === "Literal")) {
              className = node.arguments[0].value;
            }

            // Extract config object from second argument
            const configObj = node.arguments[1];
            if (configObj && configObj.type === "ObjectExpression") {
              definitions.push({
                type: callee === "qx.Class.define" ? "class" : "mixin",
                className,
                configObj
              });
            }
          }
        }
      });

      return definitions;
    },

    /**
     * Helper method to extract property names from a class definition config object
     * @param {Object} configObj - AST ObjectExpression node for class config
     * @return {Array} - Array of property names
     */
    __extractPropertyNames(configObj) {
      const names = [];
      if (!configObj || configObj.type !== "ObjectExpression") {
        return names;
      }

      const propertiesNode = configObj.properties.find(
        prop => this.__getKeyName(prop.key) === "properties"
      );

      if (propertiesNode && propertiesNode.value && propertiesNode.value.type === "ObjectExpression") {
        propertiesNode.value.properties.forEach(prop => {
          const keyName = this.__getKeyName(prop.key);
          if (keyName) {
            names.push(keyName);
          }
        });
      }

      return names;
    },

    /**
     * Helper method to extract member names from a class definition config object
     * @param {Object} configObj - AST ObjectExpression node for class config
     * @return {Array} - Array of member names
     */
    __extractMemberNames(configObj) {
      const names = [];
      if (!configObj || configObj.type !== "ObjectExpression") {
        return names;
      }

      const membersNode = configObj.properties.find(
        prop => this.__getKeyName(prop.key) === "members"
      );

      if (membersNode && membersNode.value && membersNode.value.type === "ObjectExpression") {
        membersNode.value.properties.forEach(prop => {
          // Handle both ObjectMethod and ObjectProperty
          if (prop.type === "ObjectMethod" || prop.type === "ObjectProperty") {
            const keyName = this.__getKeyName(prop.key);
            if (keyName) {
              names.push(keyName);
            }
          }
        });
      }

      return names;
    },

    /**
     * Helper method to extract static names from a class definition config object
     * @param {Object} configObj - AST ObjectExpression node for class config
     * @return {Array} - Array of static names
     */
    __extractStaticNames(configObj) {
      const names = [];
      if (!configObj || configObj.type !== "ObjectExpression") {
        return names;
      }

      const staticsNode = configObj.properties.find(
        prop => this.__getKeyName(prop.key) === "statics"
      );

      if (staticsNode && staticsNode.value && staticsNode.value.type === "ObjectExpression") {
        staticsNode.value.properties.forEach(prop => {
          // Handle both ObjectMethod and ObjectProperty
          if (prop.type === "ObjectMethod" || prop.type === "ObjectProperty") {
            const keyName = this.__getKeyName(prop.key);
            if (keyName) {
              names.push(keyName);
            }
          }
        });
      }

      return names;
    },

    /**
     * Helper method to find .name usages on object instances in AST
     * This detects the old pattern where instances had a .name field
     * @param {Object} ast - Babel AST
     * @return {Array} - Array of usage locations {line, context}
     */
    __findInstanceNameUsages(ast) {
      const usages = [];
      const self = this;

      traverse(ast, {
        MemberExpression(path) {
          const node = path.node;

          // Check if it's accessing .name property (not computed like obj["name"])
          if (node.property &&
              !node.computed &&
              (node.property.name === "name" || node.property.value === "name")) {

            // Get the object being accessed
            const objectName = node.object.name || self.__collapseMemberExpression(node.object);

            // Skip common false positives
            if (self.__isLikelyQooxdooInstanceNameUsage(path, objectName)) {
              usages.push({
                line: node.loc ? node.loc.start.line : "unknown",
                context: objectName ? `${objectName}.name` : ".name"
              });
            }
          }
        }
      });

      return usages;
    },

    /**
     * Helper to determine if a .name access is likely the old instance.name pattern
     * @param {Object} path - AST path
     * @param {String} objectName - Name of the object being accessed
     * @return {Boolean} - True if this looks like qooxdoo instance.name usage
     */
    __isLikelyQooxdooInstanceNameUsage(path, objectName) {
      const node = path.node;

      // Common patterns that suggest this is the old instance.name field:

      // 1. this.name (very common in qooxdoo classes)
      if (objectName === "this") {
        // But exclude if it's actually a property getter call (this.getName())
        const parent = path.parent;
        if (parent && parent.type === "CallExpression") {
          return false; // It's this.name() which is a method call
        }
        return true;
      }

      // 2. Common variable names for instances: instance, obj, object, item, element
      const instanceVarNames = ["instance", "obj", "object", "item", "element", "widget", "control"];
      if (instanceVarNames.includes(objectName)) {
        return true;
      }

      // 3. Skip known JavaScript built-in objects that have .name
      const builtInObjects = ["window", "document", "console", "Function", "Error",
                              "constructor", "arguments", "event"];
      if (builtInObjects.includes(objectName)) {
        return false;
      }

      // 4. If it's within a qx.Class.define or qx.Mixin.define, it's more likely
      // to be qooxdoo code (this is a heuristic)
      // For now, we'll return false for unknown patterns to avoid too many false positives

      return false;
    }
  }
});
