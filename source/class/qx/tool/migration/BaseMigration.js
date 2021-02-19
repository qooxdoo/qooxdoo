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
const fsp = require('fs').promises;
const replaceInFile = require("replace-in-file");
const semver = require("semver");

/**
 * The base class for migrations, containing useful methods to manipulate source
 * files. It also holds a reference to the runner which contains some meta data
 * for all migrations.
 */
qx.Class.define("qx.tool.migration.BaseMigration",{
  type: "abstract",
  extend: qx.core.Object,

  /**
   * Constructor
   * @param {qx.tool.migration.Runner} runner The runner instance
   */
  construct: function(runner) {
    this.base(arguments);
    this.setRunner(runner);
  },

  properties: {
    runner: {
      check: "qx.tool.migration.Runner"
    }
  },

  members: {

    /**
     * @see {@link qx.tool.config.Utils#getQxPath}
     */
    getQxPath: qx.tool.config.Utils.getQxPath.bind(qx.tool.config.Utils),

    /**
     * @see {@link qx.tool.config.Utils#getQxVersion}
     */
    getQxVersion: qx.tool.config.Utils.getQxVersion.bind(qx.tool.config.Utils),

    /**
     * @see {@link qx.tool.config.Utils#getQxAppVersion}
     */
    getAppQxPath: qx.tool.config.Utils.getAppQxPath.bind(qx.tool.config.Utils),

    /**
     * Returns the version of qooxdoo this migration applies to.
     */
    getVersion() {
      return this.classname.match(/\.M([0-9_]+)$/)[1].replace(/_/g,".");
    },

    /**
     * Output message that announces a migration. What this does is to mark it
     * visually
     * @param message
     */
    announce(message) {
      if (this.getRunner().getVerbose()) {
        this.info("*** " + message);
      }
    },

    /**
     * Rename source files
     * @param {String[]} fileList Array containing arrays of [new name, old name]
     * @return {Promise<Boolean>} Whether this migration still has to be applied
     */
    async renameFiles(fileList) {
      let migrationInfo = this.getRunner().createMigrationInfo();
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
          migrationInfo.pending++;
        } else {
          // apply migration
          for (let [newPath, oldPath] of filesToRename) {
            try {
              await fs.renameAsync(oldPath, newPath);
              this.debug(`Renamed '${oldPath}' to '${newPath}'.`);
            } catch (e) {
              this.error(`Renaming '${oldPath}' to '${newPath}' failed: ${e.message}.`);
              process.exit(1);
            }
          }
          migrationInfo.applied++;
        }
      }
      return migrationInfo;
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
        if (! await fs.existsAsync(newPath) && await fs.existsAsync(oldPath)) {
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
        if ((await fsp.stat(file)).isFile() && (await fsp.readFile(file, "utf8")).includes(text)) {
          return true;
        }
      }
      return false;
    },

    /**
     * Replace text in source files
     * @param {{files: string, from: string, to: string}[]} replaceInFilesArr
     *    Array containing objects compatible with https://github.com/adamreisnz/replace-in-file
     * @return {Promise<{applied: number, pending: number}>}
     */
    async replaceInFiles(replaceInFilesArr=[]) {
      qx.core.Assert.assertArray(replaceInFilesArr);
      let migrationInfo = this.getRunner().createMigrationInfo();
      let dryRun = this.getRunner().getDryRun();
      for (let replaceInFiles of replaceInFilesArr) {
        if (await this.checkFilesContain(replaceInFiles.files, replaceInFiles.from)) {
          if (dryRun) {
            this.announce(`In the file(s) ${replaceInFiles.files}, '${replaceInFiles.from}' will be changed to '${replaceInFiles.to}'.`);
            migrationInfo.pending++;
            continue;
          }
          try {
            this.debug(`Replacing '${replaceInFiles.from}' with '${replaceInFiles.to}' in ${replaceInFiles.files}`);
            await replaceInFile(replaceInFiles);
            migrationInfo.applied++;
          } catch (e) {
            this.error(`Error replacing in files: ${e.message}`);
            process.exit(1);
          }
        }
      }
      return migrationInfo;
    },


    /**
     * Updates a dependency in the given Manifest model
     * @param {qx.tool.config.Manifest} manifestModel
     * @param {String} dependencyName The name of the dependency in the `require object
     * @param {String} semverRange A semver-compatible range string
     * @return {Promise<void>}
     * @private
     * @return {Promise<{applied: number, pending: number}>}
     */
    async updateManfestDependency(manifestModel, dependencyName, semverRange) {
      let migrationInfo = this.getRunner().createMigrationInfo();
      const oldRange = manifestModel.getValue(`requires.${dependencyName}`);
      if (this.getRunner().getDryRun()) {
        this.announce(`Manifest version range for ${dependencyName} will be updated from ${oldRange} to ${semverRange}.`);
        migrationInfo.pending++;
      } else {
        manifestModel.setValue(`requires.${dependencyName}`, semverRange);
        migrationInfo.applied++;
      }
      return migrationInfo;
    },

    /**
     * Updates the json-schema in a configuration file
     * @param {qx.tool.config.Abstract} configModel
     * @param {String} schemaUri
     * @return {Promise<{applied: number, pending: number}>}
     */
    async updateSchemaVersion(configModel, schemaUri) {
      qx.core.Assert.assertInstance(configModel, qx.tool.config.Abstract);
      let migrationInfo = this.getRunner().createMigrationInfo();
      if (configModel.getValue("$schema") !== schemaUri) {
        if (this.getRunner().getDryRun()) {
          this.announce(`Schema version for ${configModel.getDataPath()} will be set to ${schemaUri}.`);
          migrationInfo.pending++;
        } else {
          configModel.setValue("$schema", schemaUri);
          migrationInfo.applied++;
        }
      }
      return migrationInfo;
    }
  }
});
