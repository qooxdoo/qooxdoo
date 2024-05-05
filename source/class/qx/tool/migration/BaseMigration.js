/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2021 The authors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

const process = require("process");
const fs = qx.tool.utils.Promisify.fs;
const fsp = require("fs").promises;
const replaceInFile = require("replace-in-file");
const semver = require("semver");

/**
 * The base class for migrations, containing useful methods to
 * manipulate source files, and to update runtime information
 * on the individual migration class. It also holds a reference
 * to the runner which contains meta data for all migrations.
 */
qx.Class.define("qx.tool.migration.BaseMigration", {
  type: "abstract",
  extend: qx.core.Object,

  /**
   * Constructor
   * @param {qx.tool.migration.Runner} runner The runner instance
   */
  construct(runner) {
    super();
    this.setRunner(runner);
  },

  properties: {
    runner: {
      check: "qx.tool.migration.Runner"
    },

    applied: {
      check: "Number",
      init: 0
    },

    pending: {
      check: "Number",
      init: 0
    }
  },

  members: {
    /**
     * Returns the version of qooxdoo this migration applies to.
     */
    getVersion() {
      return this.classname.match(/\.M([0-9_]+)$/)[1].replace(/_/g, ".");
    },

    /**
     * Returns the qooxdoo version that has been passed to the Runner or the
     * one from the environment
     * @return {Promise<String>}
     */
    async getQxVersion() {
      return (
        (await this.getRunner().getQxVersion()) ||
        qx.tool.config.Utils.getQxVersion()
      );
    },

    /**
     * Output message that announces a migration. What this does is to mark it
     * visually
     * @param message
     */
    announce(message) {
      if (this.getRunner().getVerbose()) {
        qx.tool.compiler.Console.info("*** " + message);
      }
    },

    /**
     * Marks one or more migration steps as applied
     * @param {Number|String} param Optional. If number, number of migrations to mark
     * as applied, defaults to 1; if String, message to be `info()`ed if verbose=true
     */
    markAsApplied(param) {
      let numberOfMigrations = 1;
      if (typeof param == "string") {
        if (this.getRunner().getVerbose()) {
          qx.tool.compiler.Console.info(param);
        }
      } else if (typeof param == "number") {
        numberOfMigrations = param;
      } else if (typeof param != "undefined") {
        throw new TypeError("Argument must be string or number");
      }
      this.setApplied(this.getApplied() + numberOfMigrations);
    },

    /**
     * Marks one or more migration steps as pending
     * @param {Number|String} param Optional. If number, number of migrations to mark
     * as pending, defaults to 1; if String, message to be `announce()`ed
     */
    markAsPending(param) {
      let numberOfMigrations = 1;
      if (typeof param == "string") {
        if (this.getRunner().getVerbose()) {
          this.announce(param);
        }
      } else if (typeof param == "number") {
        numberOfMigrations = param;
      } else if (typeof param != "undefined") {
        throw new TypeError("Argument must be string or number");
      }
      this.setPending(this.getPending() + numberOfMigrations);
    },

    /**
     * Rename source files, unless this is a dry run, in which case
     * it will only annouce it and mark the migration step as pending.
     * @param {String[]} fileList Array containing arrays of [new name, old name]
     */
    async renameFilesUnlessDryRun(fileList) {
      let dryRun = this.getRunner().getDryRun();
      qx.core.Assert.assertArray(fileList);
      let filesToRename = await this.checkFilesToRename(fileList);
      if (filesToRename.length) {
        if (dryRun) {
          // announce migration
          this.announce(`The following files will be renamed:`);
          for (let [newPath, oldPath] of filesToRename) {
            this.announce(`'${oldPath}' => '${newPath}'.`);
          }
          this.markAsPending();
        } else {
          // apply migration
          for (let [newPath, oldPath] of filesToRename) {
            try {
              await fs.renameAsync(oldPath, newPath);
              this.debug(`Renamed '${oldPath}' to '${newPath}'.`);
            } catch (e) {
              qx.tool.compiler.Console.error(
                `Renaming '${oldPath}' to '${newPath}' failed: ${e.message}.`
              );

              process.exit(1);
            }
          }
          this.markAsApplied();
        }
      }
    },

    /**
     * Given an array of [newPath,oldPath], filter by those which exist
     * at oldPath and not at newPath
     * @param fileList {[]}
     * @return {Promise<[]>}
     */
    async checkFilesToRename(fileList) {
      let filesToRename = [];
      for (let [newPath, oldPath] of fileList) {
        if (
          !(await fs.existsAsync(newPath)) &&
          (await fs.existsAsync(oldPath))
        ) {
          filesToRename.push([newPath, oldPath]);
        }
      }
      return filesToRename;
    },

    /**
     * Checks if the given file or array of files contains a given text
     * @param {String|String[]} files
     * @param {String} text
     * @return {Promise<Boolean>}
     */
    async checkFilesContain(files, text) {
      files = Array.isArray(files) ? files : [files];
      for (let file of files) {
        if (
          (await fsp.stat(file)).isFile() &&
          (await fsp.readFile(file, "utf8")).includes(text)
        ) {
          return true;
        }
      }
      return false;
    },

    /**
     * Replace text in source files, unless this is a dry run, in which case
     * it will only annouce it and mark the migration step as pending.
     * @param {{files: string, from: string, to: string}[]} replaceInFilesArr
     *    Array containing objects compatible with https://github.com/adamreisnz/replace-in-file
     * @return {Promise<void>}
     */
    async replaceInFilesUnlessDryRun(replaceInFilesArr = []) {
      qx.core.Assert.assertArray(replaceInFilesArr);
      let dryRun = this.getRunner().getDryRun();
      for (let replaceInFiles of replaceInFilesArr) {
        if (
          await this.checkFilesContain(
            replaceInFiles.files,
            replaceInFiles.from
          )
        ) {
          if (dryRun) {
            this.announce(
              `In the file(s) ${replaceInFiles.files}, '${replaceInFiles.from}' will be changed to '${replaceInFiles.to}'.`
            );

            this.markAsPending();
            continue;
          }
          try {
            this.debug(
              `Replacing '${replaceInFiles.from}' with '${replaceInFiles.to}' in ${replaceInFiles.files}`
            );

            await replaceInFile(replaceInFiles);
            this.markAsApplied();
          } catch (e) {
            qx.tool.compiler.Console.error(
              `Error replacing in files: ${e.message}`
            );

            process.exit(1);
          }
        }
      }
    },

    /**
     * Updates a dependency in the given Manifest model, , unless this is a dry run, in which case
     * it will only annouce it and mark the migration step as pending.
     * @param {qx.tool.config.Manifest} manifestModel
     * @param {String} dependencyName The name of the dependency in the `require object
     * @param {String} semverRange A semver-compatible range string
     * @return {Promise<void>}
     * @private
     * @return {Promise<void>}
     */
    async updateDependencyUnlessDryRun(
      manifestModel,
      dependencyName,
      semverRange
    ) {
      const oldRange = manifestModel.getValue(`requires.${dependencyName}`);
      if (this.getRunner().getDryRun()) {
        this.announce(
          `Manifest version range for ${dependencyName} will be updated from ${oldRange} to ${semverRange}.`
        );

        this.markAsPending();
      } else {
        manifestModel.setValue(`requires.${dependencyName}`, semverRange);
        this.markAsApplied();
      }
    },

    /**
     * Updates the `@qooxdoo/framework` dependency in the given Manifest model, if
     * the current qooxdoo version is not covered by it. If this is a dry run, the
     * change will only be annouced and the migration step marked as pending.
     *
     * @param {qx.tool.config.Manifest} manifestModel
     * @return {Promise<void>}
     */
    async updateQxDependencyUnlessDryRun(manifestModel) {
      let qxVersion = await this.getQxVersion();
      let qxRange = manifestModel.getValue("requires.@qooxdoo/framework");
      if (!semver.satisfies(qxVersion, qxRange)) {
        qxRange = `^${qxVersion}`;
        await this.updateDependencyUnlessDryRun(
          manifestModel,
          "@qooxdoo/framework",
          qxRange
        );
      }
    },

    /**
     * Updates the json-schema in a configuration file, unless this is a dry run, in which case
     * it will only annouce it and mark the migration step as pending.
     * @param {qx.tool.config.Abstract} configModel
     * @param {String} schemaUri
     * @return {Promise<void>}
     */
    async updateSchemaUnlessDryRun(configModel, schemaUri) {
      qx.core.Assert.assertInstance(configModel, qx.tool.config.Abstract);
      if (configModel.getValue("$schema") !== schemaUri) {
        if (this.getRunner().getDryRun()) {
          this.markAsPending(
            `Schema version for ${configModel.getDataPath()} will be set to ${schemaUri}.`
          );
        } else {
          configModel.setValue("$schema", schemaUri);
          this.markAsApplied(
            `Schema version for ${configModel.getDataPath()} updated.`
          );
        }
      }
    },

    /**
     * Upgrades the applications's installed packages, unless this is a dry run, in which case
     * it will only annouce it and mark the migration step as pending.
     * @return {Promise<void>}
     */
    async upgradePackagesUnlessDryRun() {
      const runner = this.getRunner();
      if (runner.getDryRun()) {
        this.announce("Packages will be upgraded.");
        this.markAsPending();
      } else {
        let options = {
          verbose: runner.getVerbose(),
          qxVersion: runner.getQxVersion()
        };

        await new qx.tool.cli.commands.package.Upgrade(options).process();
        this.markAsApplied();
      }
    }
  }
});
