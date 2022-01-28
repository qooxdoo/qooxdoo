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
  members: {
    /**
     * Check for legacy compile.js - needs manual intervention
     */
    async migrateCompileJs() {
      let compileJsFilename = path.join(process.cwd(), "compile.js");
      if (await fs.existsAsync(compileJsFilename)) {
        let data = await fs.readFileAsync(compileJsFilename, "utf8");
        if (data.indexOf("module.exports") < 0) {
          this.announce(
            `Your compile.js appears to be missing a module.exports statement and must be manually updated - please see https://git.io/fjBqU for more details`
          );

          this.markAsPending();
        }
      }
    },

    async migrateQooxdooJs() {
      let compileJsFilename = path.join(process.cwd(), "qooxdoo.json");
      if (await fs.existsAsync(compileJsFilename)) {
        let model = await qx.tool.config.Registry.getInstance()
          .set({
            warnOnly: true,
            validate: false
          })
          .load();
        if (model.getValue("$schema") !== model.getSchemaUri()) {
          if (this.getRunner().getDryRun()) {
            this.markAsPending("Add schema to qooxdoo.json");
          } else {
            model.setValue("$schema", model.getSchemaUri());
            model.save();
            this.markAsApplied();
          }
        }
      }
    },

    async migrateConfigFiles() {
      let dryRun = this.getRunner().getDryRun();
      let pkg = qx.tool.cli.commands.Package;
      let cwd = process.cwd();
      // rename configuration files from initial names
      // replace those static variables with verbatims
      let migrateFiles = [
        [path.join(cwd, pkg.lockfile.filename), path.join(cwd, "contrib.json")],
        [path.join(cwd, pkg.cache_dir), path.join(cwd, "contrib")],
        [
          path.join(
            qx.tool.cli.ConfigDb.getDirectory(),
            pkg.package_cache_name
          ),

          path.join(qx.tool.cli.ConfigDb.getDirectory(), "contrib-cache.json")
        ]
      ];

      // change names in .gitignore
      if ((await this.checkFilesToRename(migrateFiles)).length) {
        await this.renameFilesUnlessDryRun(migrateFiles);
        if (dryRun) {
          this.announce(".gitignore needs to be updated.");
          this.markAsPending(3);
        } else {
          await this.replaceInFilesUnlessDryRun([
            {
              files: path.join(cwd, ".gitignore"),
              from: "contrib/",
              to: "qx_packages/"
            },

            {
              files: path.join(cwd, ".gitignore"),
              from: "contrib.json",
              to: "qx-lock.json"
            }
          ]);

          this.markAsApplied();
        }
      }
    },

    async migrateManifest() {
      let dryRun = this.getRunner().getDryRun();
      let verbose = this.getRunner().getVerbose();
      // Update all Manifests
      let updateManifest = false;
      for (const manifestModel of await qx.tool.config.Utils.getManifestModels()) {
        await manifestModel
          .set({
            warnOnly: true,
            validate: false
          })
          .load();
        if (!qx.lang.Type.isArray(manifestModel.getValue("info.authors"))) {
          updateManifest = true;
        }
        if (!semver.valid(manifestModel.getValue("info.version"))) {
          updateManifest = true;
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
        }
        if (updateManifest) {
          if (dryRun) {
            this.markAsPending(2);
          } else {
            manifestModel
              .transform("info.authors", authors => {
                if (authors === "") {
                  return [];
                } else if (qx.lang.Type.isString(authors)) {
                  return [
                    {
                      name: authors
                    }
                  ];
                } else if (qx.lang.Type.isObject(authors)) {
                  return [
                    {
                      name: authors.name,
                      email: authors.email
                    }
                  ];
                } else if (qx.lang.Type.isArray(authors)) {
                  return authors.map(r =>
                    qx.lang.Type.isObject(r)
                      ? {
                          name: r.name,
                          email: r.email
                        }
                      : {
                          name: r
                        }
                  );
                }
                return [];
              })
              .transform("info.version", version => {
                let coerced = semver.coerce(version);
                if (coerced === null) {
                  qx.tool.compiler.Console.warn(
                    `Version string '${version}' in ${manifestModel.getDataPath()} is not a valid semver version, will be set to 1.0.0`
                  );

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
            verbose &&
              qx.tool.compiler.Console.info(
                `Updated settings in ${manifestModel.getRelativeDataPath()}.`
              );

            await manifestModel.save();
            this.markAsApplied();
            await this.updateDependencyUnlessDryRun(
              manifestModel,
              "@qooxdoo/compiler",
              "^1.0.0"
            );

            verbose &&
              qx.tool.compiler.Console.info(
                `Updated dependencies in ${manifestModel.getRelativeDataPath()}.`
              );
          }
        }
        // update schema
        await this.updateSchemaUnlessDryRun(
          manifestModel,
          "https://qooxdoo.org/schema/Manifest-1-0-0.json"
        );

        // update qooxdoo version
        await this.updateQxDependencyUnlessDryRun(manifestModel);

        // save Manifest file
        if (!this.getRunner().getDryRun()) {
          manifestModel.setValidate(false); // shouldn't be necessary
          await manifestModel.save();
        }
      }
    },

    async migrateCompileJson() {
      let compileJsonModel = qx.tool.config.Compile.getInstance().set({
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
          this.announce("eslintConfig.extends will be updated.");
          this.markAsPending();
        } else {
          compileJsonModel.setValue("eslintConfig.extends", newEsLintExtends);
          this.markAsApplied();
        }
      }
      await this.updateSchemaUnlessDryRun(
        compileJsonModel,
        "https://qooxdoo.org/schema/compile-1-0-0.json"
      );

      if (!this.getRunner().getDryRun()) {
        await compileJsonModel.save();
        compileJsonModel.set({ validate: true });
        await compileJsonModel.load();
      }
    }
  }
});
