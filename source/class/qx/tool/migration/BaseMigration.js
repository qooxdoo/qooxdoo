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
     * @see {@link qx.tool.cli.commands.Command#getQxPath}
     */
    getQxPath: qx.tool.cli.commands.Command.prototype.getQxPath,

    /**
     * @see {@link qx.tool.cli.commands.Command#getQxVersion}
     */
    getQxVersion: qx.tool.cli.commands.Command.prototype.getQxVersion,

    /**
     * Rename source files
     * @param {String[]} fileList Array containing arrays of [new name, old name]
     * @return {Boolean} Whether this migration still has to be applied
     */
    async renameFiles(fileList) {
      let dryRun = this.getRunner().getDryRun();
      qx.core.Assert.assertArray(fileList);
      let filesToRename = this.checkFilesToRename(fileList);
      if (filesToRename.length) {
        if (dryRun) {
          // announce migration
          this.Console.warn(`*** Warning: The following files will be renamed:`);
          for (let [newPath, oldPath] of filesToRename) {
            this.warn(`    '${oldPath}' => '${newPath}'.`);
          }
          return true;
        }
        // apply migration
        for (let [newPath, oldPath] of filesToRename) {
          try {
            await fs.renameAsync(oldPath, newPath);
            this.info(`Renamed '${oldPath}' to '${newPath}'.`);
          } catch (e) {
            this.error(`Renaming '${oldPath}' to '${newPath}' failed: ${e.message}.`);
            process.exit(1);
          }
        }
      }
      return false; // already renamed or no files
    },

    /**
     * Given an array of [newPath,oldPath], filter by those which exist
     * at oldPath and not at newPath
     * @param fileList {[]}
     * @return []
     */
    checkFilesToRename(fileList) {
      let filesToRename = [];
      for (let [newPath, oldPath] of fileList) {
        if (!fs.existsSync(newPath) && fs.existsSync(oldPath)) {
          filesToRename.push([newPath, oldPath]);
        }
      }
      return filesToRename;
    },

    /**
     * Checks if the given file or array of files contains a given text
     * @param {String|String[]} files
     * @param {String} text
     * @return {Boolean}
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
     * @return {Boolean} If the migration is still necessary
     */
    async replaceInFiles(replaceInFilesArr=[]) {
      qx.core.Assert.assertArray(replaceInFilesArr);
      let dryRun = this.getRunner().getDryRun();
      let mustBeMigrated = false;
      for (let replaceInFiles of replaceInFilesArr) {
        if (await this.checkFilesContain(replaceInFiles.files, replaceInFiles.from)) {
          if (dryRun) {
            this.warn(`*** In the file(s) ${replaceInFiles.files}, '${replaceInFiles.from}' will be changed to '${replaceInFiles.to}'.`);
            mustBeMigrated = true;
            continue;
          }
          try {
            this.debug(` - Replacing '${replaceInFiles.from}' with '${replaceInFiles.to}' in ${replaceInFiles.files}`);
            await replaceInFile(replaceInFiles);
            mustBeMigrated = false;
          } catch (e) {
            this.error(`Error replacing in files: ${e.message}`);
            process.exit(1);
          }
        }
      }
      return mustBeMigrated;
    }
  }
});
