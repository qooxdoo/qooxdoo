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
const path = require("upath");
const semver = require("semver");
const fs = qx.tool.utils.Promisify.fs;

/**
 * Migration class for updating from v5 to v6
 */
qx.Class.define("qx.tool.migration.M6_0_0", {
  extend: qx.core.Object,
  implement: qx.tool.migration.IMigration,
  members: {
    /**
     * @inheritDoc
     * @see {qx.tool.migration.IMigration#migrate()}
     */
    migrate: async function (options = {}) {
      let {announceOnly} = options;
      let needFix = false;
      let pkg = qx.tool.cli.commands.Package;
      let cwd = process.cwd();
      let migrateFiles = [[path.join(cwd, pkg.lockfile.filename), path.join(cwd, pkg.lockfile.legacy_filename)], [path.join(cwd, pkg.cache_dir), path.join(cwd, pkg.legacy_cache_dir)], [path.join(qx.tool.cli.ConfigDb.getDirectory(), pkg.package_cache_name), path.join(qx.tool.cli.ConfigDb.getDirectory(), pkg.legacy_package_cache_name)]];
      if (qx.tool.migration.Utils.checkFilesToRename(migrateFiles).length) {
        let replaceInFiles = [{
          files: path.join(cwd, ".gitignore"),
          from: pkg.legacy_cache_dir + "/",
          to: pkg.cache_dir + "/"
        }];
        await qx.tool.migration.Utils.renameFiles(migrateFiles, announceOnly);
        await qx.tool.migration.Utils.replaceInFiles(replaceInFiles, announceOnly);
        if (announceOnly) {
          needFix = true;
        } else {
          qx.tool.compiler.Console.info("Fixing path names in the lockfile...");
          await new qx.tool.cli.commands.package.Upgrade({reinstall: true}).process();
        }
      }
      // Migrate all Manifests in a package
      const registryModel = qx.tool.config.Registry.getInstance();
      let manifestModels = [];
      if (await registryModel.exists()) {
        // we have a qooxdoo.json index file containing the paths of libraries in the repository
        await registryModel.load();
        let libraries = registryModel.getLibraries();
        for (let library of libraries) {
          manifestModels.push(new qx.tool.config.Abstract(qx.tool.config.Manifest.config).set({
            baseDir: path.join(cwd, library.path)
          }));
        }
      } else if (fs.existsSync(qx.tool.config.Manifest.config.fileName)) {
        manifestModels.push(qx.tool.config.Manifest.getInstance());
      }
      for (const manifestModel of manifestModels) {
        await manifestModel.set({
          warnOnly: true
        }).load();
        manifestModel.setValidate(false);
        needFix = false;
        let s = "";
        if (!qx.lang.Type.isArray(manifestModel.getValue("info.authors"))) {
          needFix = true;
          s += "   missing info.authors\n";
        }
        if (!semver.valid(manifestModel.getValue("info.version"))) {
          needFix = true;
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
          needFix = true;
          s += "   obsolete entry:\n";
          for (let key in obj) {
            if (obj[key]) {
              s += "      " + key + "\n";
            }
          }
        }
        if (needFix) {
          if (announceOnly) {
            qx.tool.compiler.Console.warn("*** Manifest(s) need to be updated:\n" + s);
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
                  qx.tool.compiler.Console.warn(`*** Version string '${version}' could not be interpreted as semver, changing to 1.0.0`);
                  return "1.0.0";
                }
                return String(coerced);
              })
              .unset("info.qooxdoo-versions").unset("info.qooxdoo-range").unset("provides.type").unset("requires.qxcompiler").unset("requires.qooxdoo-compiler").unset("requires.qooxdoo-sdk");
            await manifestModel.save();
            qx.tool.compiler.Console.info(`Updated settings in ${manifestModel.getRelativeDataPath()}.`);
          }
        }

        // check framework and compiler dependencies
        // if none are given in the Manifest, use the present framework and compiler
        const frameworkDir = await qx.tool.config.Utils.getQxPath();
        const framework_version = await this.getLibraryVersion(frameworkDir);
        const framework_range = manifestModel.getValue("requires.@qooxdoo/framework") || framework_version;

        if (!semver.satisfies(framework_version, framework_range)) {
          needFix = true;
          if (announceOnly) {
            qx.tool.compiler.Console.warn(`*** Mismatch between used framework version (${framework_version} in ${frameworkDir}) and the declared dependencies in the Manifest.`);
          } else {
            manifestModel.setValue("requires.@qooxdoo/framework", "^" + framework_version);
            manifestModel.setWarnOnly(false); // now model should validate
            await manifestModel.save();
            qx.tool.compiler.Console.info(`Updated dependencies in ${manifestModel.getRelativeDataPath()}.`);
          }
        }
        manifestModel.setValidate(true);
      }

      let compileJsonFilename = path.join(process.cwd(), "compile.json");
      await qx.tool.migration.Utils.replaceInFiles([{
        files: compileJsonFilename,
        from: "\"qx/browser\"",
        to: "\"@qooxdoo/qx/browser\""
      }], announceOnly);

      let compileJsFilename = path.join(process.cwd(), "compile.js");

      if (await fs.existsAsync(compileJsFilename)) {
        let data = await fs.readFileAsync(compileJsFilename, "utf8");

        if (data.indexOf("module.exports") < 0) {
          qx.tool.compiler.Console.warn(`
*** Your compile.js appears to be missing a module.exports statement -
please see https://git.io/fjBqU for more details`);
        }
      }
      return needFix;
    }
  }
});
