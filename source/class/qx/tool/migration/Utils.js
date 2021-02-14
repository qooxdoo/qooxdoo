/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017-2021 The authors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

const process = require("process");
const fs = qx.tool.utils.Promisify.fs;
const replace_in_file = require("replace-in-file");

qx.Class.define("qx.tool.migration.Utils", {
  type: "static",
  statics: {

    /**
     * Runs all migration classes in the `qx.tool.migration` namespace,
     * even those which have lower version numbers than the application
     * which is to be migrated, since the previous migration might have
     * have had bugs that were later fixed. This is safe because all
     * migration files must be written in a way that they can be safely
     * run several times without unwanted side effects. see {@link
     * qx.tool.migration.IMigration#migrate}
     * @param {Boolean} announceOnly Only announce what is going to be changed, no code changes
     * @param {Object?} argv Optional: The command-line arguments as parsed by Yargs
     * @return {Promise<void>}
     */
    async runMigrations(announceOnly=false, argv={}) {
      if (!argv.quiet) {
        qx.tool.utils.Logger.info(`>>> Running migrations...`);
      }
      argv.announceOnly = announceOnly;
      let migrationClasses = Object
        .getOwnPropertyNames(qx.tool.migration)
        .filter(clazz => clazz.match(/^M[0-9]/));
      for (let clazz of migrationClasses) {
        let migration = new qx.Class.getByName(clazz)();
        if (argv.verbose) {
          qx.tool.utils.Logger.info(` - Running migration ${clazz}`);
        }
        try {
          migration.migrate(argv);
        } catch (e) {
          qx.tool.utils.Logger.error(e);
          process.exit(1);
        }
      }
    },

    /**
     * Rename source files
     * @param {String[]} fileList Array containing arrays of [new name, old name]
     * @param {Boolean} dryRun If true, annouce the migration only. If false (default), apply it.
     */
    async renameFiles(fileList, dryRun=false) {
      qx.core.Assert.assertArray(fileList);
      let filesToRename = this.checkFilesToRename(fileList);
      if (filesToRename.length) {
        if (dryRun) {
          // announce migration
          qx.tool.compiler.Console.warn(`*** Warning: The following files will be renamed:`);
          for (let [newPath, oldPath] of filesToRename) {
            qx.tool.compiler.Console.warn(`    '${oldPath}' => '${newPath}'.`);
          }
        } else {
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
      }
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
     * @param {{files: string, from: string, to: string}[]} replaceInFilesArr Array containing objects compatible with https://github.com/adamreisnz/replace-in-file
     * @param {Boolean} annouceOnly If true, annouce the migration only. If false (default), apply it.
     * @return {array} Returns an array of files that have been modified
     */
    async replaceInFiles(replaceInFilesArr=[], annouceOnly=false) {
      let modified = [];
      if (qx.lang.Type.isArray(replaceInFilesArr) && replaceInFilesArr.length) {
        for (let replaceInFiles of replaceInFilesArr) {
          qx.tool.compiler.Console.warn(`*** In the file(s) ${replaceInFiles.files}, '${replaceInFiles.from}' will be changed to '${replaceInFiles.to}'.`);
          if (annouceOnly) {
            continue;
          }
          try {
            let results = await replace_in_file(replaceInFiles);
            modified = modified.concat(results.filter(result => result.hasChanged).map(result => result.file));
          } catch (e) {
            qx.tool.compiler.Console.error(`Error replacing in files: ${e.message}`);
            process.exit(1);
          }
        }
        return modified;
      }
    }
  }
})
