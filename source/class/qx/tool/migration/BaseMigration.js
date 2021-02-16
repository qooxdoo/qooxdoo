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
          qx.tool.compiler.Console.warn(`*** Warning: The following files will be renamed:`);
          for (let [newPath, oldPath] of filesToRename) {
            qx.tool.compiler.Console.warn(`    '${oldPath}' => '${newPath}'.`);
          }
          return true;
        }
        // apply migration
        for (let [newPath, oldPath] of filesToRename) {
          try {
            await fs.renameAsync(oldPath, newPath);
            qx.tool.compiler.Console.info(`Renamed '${oldPath}' to '${newPath}'.`);
          } catch (e) {
            qx.tool.compiler.Console.error(`Renaming '${oldPath}' to '${newPath}' failed: ${e.message}.`);
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
     * Replace text in source files
     * @param {{files: string, from: string, to: string}[]} replaceInFilesArr
     *    Array containing objects compatible with https://github.com/adamreisnz/replace-in-file
     * @return {Array} An array with files which have been modified
     */
    async replaceInFiles(replaceInFilesArr=[]) {
      qx.core.Assert.assertArray(replaceInFilesArr);
      let dryRun = this.getRunner().getDryRun();
      let modified = [];
      for (let replaceInFiles of replaceInFilesArr) {
        if (dryRun && !this.getRunner().getQuiet()) {
          qx.tool.compiler.Console.warn(`*** In the file(s) ${replaceInFiles.files}, '${replaceInFiles.from}' will be changed to '${replaceInFiles.to}'.`);
          continue;
        }
        try {
          if (!this.getRunner().getQuiet()) {
            qx.tool.compiler.Console.warn(` - Replacing '${replaceInFiles.from}' with '${replaceInFiles.to}' in ${replaceInFiles.files}`);
          }
          let results = await replaceInFile(replaceInFiles);
          modified = modified.concat(results.filter(result => result.hasChanged).map(result => result.file));
        } catch (e) {
          qx.tool.compiler.Console.error(`Error replacing in files: ${e.message}`);
          process.exit(1);
        }
      }
      return modified;
    }
  }
});
