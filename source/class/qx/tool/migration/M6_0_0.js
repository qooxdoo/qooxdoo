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

**********************************************************************/

const process = require("process");
const path = require("upath");
const semver = require("semver");
const fs = qx.tool.utils.Promisify.fs;

/**
 * Migration class for updating from v5 to v6
 */
qx.Class.define("qx.tool.migration.M6_0_0", {
  extend: qx.tool.migration.BaseMigration,
  implement: qx.tool.migration.IMigration,
  members: {

    /**
     * @see {qx.tool.migration.IMigration#run()}
     * @return {Promise<{applied: number, pending: number}>}
     */
    async run() {
      let migrationInfo = this.getRunner().createMigrationInfo();
      let dryRun = this.getRunner().getDryRun();
      let verbose = this.getRunner().getVerbose();
      let pkg = qx.tool.cli.commands.Package;
      let cwd = process.cwd();
      // rename configuration files from initial names
      // replace those static variables with verbatims
      let migrateFiles = [
        [path.join(cwd, pkg.lockfile.filename), path.join(cwd, pkg.lockfile.legacy_filename)],
        [path.join(cwd, pkg.cache_dir), path.join(cwd, pkg.legacy_cache_dir)],
        [path.join(qx.tool.cli.ConfigDb.getDirectory(), pkg.package_cache_name), path.join(qx.tool.cli.ConfigDb.getDirectory(), pkg.legacy_package_cache_name)]
      ];
      // change names in .gitignore
      if (await this.checkFilesToRename(migrateFiles).length) {
        if (await this.renameFiles(migrateFiles)) {
          if (dryRun){
            this.warn("Legacy configuration file names need to be fixed.");
            migrationInfo.pending++;
          } else {
            await this.replaceInFiles([{
              files: path.join(cwd, ".gitignore"),
              from: pkg.legacy_cache_dir + "/",
              to: pkg.cache_dir + "/"
            }]);
            this.info("- Fixing path names in the lockfile...");
            await new qx.tool.cli.commands.package.Upgrade({reinstall: true}).process();
            migrationInfo.applied++;
          }
        }
      }
      // Update all Manifests
      let updateManifest = false;
      for (const manifestModel of await qx.tool.config.Utils.getManifestModels()) {
        await manifestModel.set({
          warnOnly: true
        }).load();
        manifestModel.setValidate(false);
        let s = "";
        if (!qx.lang.Type.isArray(manifestModel.getValue("info.authors"))) {
          updateManifest = true;
          s += "   missing info.authors\n";
        }
        if (!semver.valid(manifestModel.getValue("info.version"))) {
          updateManifest = true;
          s += "   missing or invalid info.version\n";
        }
        let obj = {
          "info.qooxdoo-versions": null,
          "info.qooxdoo-range": null,
          "provides.type": null,
          "requires.qxcompiler": null,
          "requires.qooxdoo-sdk": null,
          "requires.qooxdoo-compiler": null
        };
        if (manifestModel.keyExists(obj)) {
          updateManifest = true;
          s += "   obsolete entry:\n";
          for (let key in obj) {
            if (obj[key]) {
              s += "      " + key + "\n";
            }
          }
        }
        if (updateManifest) {
          if (dryRun) {
            this.warn("Manifest(s) need to be updated:\n" + s);
            migrationInfo.pending++;
          } else {
            manifestModel
              .transform("info.authors", authors => {
                if (authors === "") {
                  return [];
                } else if (qx.lang.Type.isString(authors)) {
                  return [{
                    name: authors
                  }];
                } else if (qx.lang.Type.isObject(authors)) {
                  return [{
                    name: authors.name, email: authors.email
                  }];
                } else if (qx.lang.Type.isArray(authors)) {
                  return authors.map(r => qx.lang.Type.isObject(r) ? {
                    name: r.name, email: r.email
                  } : {
                    name: r
                  });
                }
                return [];
              })
              .transform("info.version", version => {
                let coerced = semver.coerce(version);
                if (coerced === null) {
                  this.warn(`Version string '${version}' could not be interpreted as semver, will be changed to 1.0.0`);
                  return "1.0.0";
                }
                return String(coerced);
              })
              .unset("info.qooxdoo-versions")
              .unset("info.qooxdoo-range")
              .unset("provides.type")
              .unset("requires.qxcompiler")
              .unset("requires.qooxdoo-compiler")
              .unset("requires.qooxdoo-sdk");
            verbose || this.info(`Updated settings in ${manifestModel.getRelativeDataPath()}.`);
            migrationInfo.applied++;
          }
          await manifestModel.save();
          // update dependencies in Manifest
          let updateManifest = {
            "@qooxdoo/framework": "^6.0.0",
            "@qooxdoo/compiler": "^1.0.0"
          }
          for (let [dependencyName, range] of Object.entries(updateManifest)) {
            let result = await this.updateManfestDependency(manifestModel, dependencyName, range);
            migrationInfo = this.getRunner().updateMigrationInfo(migrationInfo, result);
          }
          verbose || this.info(`Updated dependencies in ${manifestModel.getRelativeDataPath()}.`);
        }
        // update schema
        let result = await this.updateSchemaVersion(manifestModel,  "https://qooxdoo.org/schema/Manifest-1-0-0.json")
        migrationInfo = this.getRunner().updateMigrationInfo(migrationInfo, result);
        // save Manifest file
        if (!this.getRunner().getDryRun()) {
          manifestModel.setValidate(false); // shouldn't be necessary
          await manifestModel.save();
        }
      }

      // Update compile.json
      let compileJsonModel = qx.tool.config.Compile.getInstance()
        .set({
          warnOnly: true,
          validate: false
        });
      await compileJsonModel.load();
      let eslintExtends = compileJsonModel.getValue("eslintConfig.extends");
      let newEsLintExtends = [
        "@qooxdoo/qx/browser",
        "@qooxdoo/qx",
        "@qooxdoo/jsdoc-disable"
      ];
      if (eslintExtends !== newEsLintExtends) {
        if (this.getRunner().getDryRun()) {
          this.warn("eslintConfig.extends will be updated.");
          migrationInfo.pending++;
        } else {
          compileJsonModel.setValue("eslintConfig.extends", newEsLintExtends);
          migrationInfo.applied++;
        }
      }
      let result = await this.updateSchemaVersion(compileJsonModel,"https://qooxdoo.org/schema/compile-1-0-0.json")
      migrationInfo = this.getRunner().updateMigrationInfo(migrationInfo, result);
      if (!this.getRunner().getDryRun()) {
        //compileJsonModel.set({validate:true});
        await compileJsonModel.save();
      }

      // Check for legacy compile.js - needs manual intervention
      let compileJsFilename = path.join(process.cwd(), "compile.js");
      if (await fs.existsAsync(compileJsFilename)) {
        let data = await fs.readFileAsync(compileJsFilename, "utf8");
        if (data.indexOf("module.exports") < 0) {
          this.error(`Your compile.js appears to be missing a module.exports statement and must be updated - please see https://git.io/fjBqU for more details`);
          process.exit(1);
        }
      }
      return migrationInfo;
    }
  }
});
