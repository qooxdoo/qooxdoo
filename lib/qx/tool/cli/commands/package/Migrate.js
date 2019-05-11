/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */
require("../Package");

require("@qooxdoo/framework");
const process = require("process");
const path = require("upath");

/**
 * Installs a package
 */
qx.Class.define("qx.tool.cli.commands.package.Migrate", {
  extend: qx.tool.cli.commands.Package,

  statics: {
    getYargsCommand: function() {
      return {
        command: "migrate",
        describe: "migrates the package system to a newer version.",
        builder: {
          "verbose": {
            alias: "v",
            describe: "Verbose logging"
          },
          "quiet": {
            alias: "q",
            describe: "No output"
          }
        },
        handler: function(argv) {
          return new qx.tool.cli.commands.package.Migrate(argv)
            .process()
            .catch(e => {
              console.error(e.stack || e.message);
              process.exit(1);
            });
        }
      };
    }
  },

  members: {

    /**
     * Announces or applies a migration
     * @param {Boolean} announceOnly If true, announce the migration without
     * applying it.
     */
    process: async function(announceOnly=false) {
      // do not call this.base(arguments) here!
      let self = qx.tool.cli.commands.Package;
      let cwd = process.cwd();
      let migrateFiles = [
        [
          path.join(cwd, qx.tool.cli.ConfigSchemas.lockfile.filename),
          path.join(cwd, qx.tool.cli.ConfigSchemas.lockfile.legacy_filename)
        ],
        [
          path.join(cwd, self.cache_dir),
          path.join(cwd, self.legacy_cache_dir)
        ],
        [
          path.join(qx.tool.cli.ConfigDb.getDirectory(), self.package_cache_name),
          path.join(qx.tool.cli.ConfigDb.getDirectory(), self.legacy_package_cache_name)
        ]
      ];
      if (this.checkFilesToRename(migrateFiles).length) {
        let replaceInFiles = {
          files: path.join(cwd, ".gitignore"),
          from: self.legacy_cache_dir + "/",
          to: self.cache_dir + "/"
        };
        await this.migrate(migrateFiles, replaceInFiles, announceOnly);
        if (announceOnly) {
          console.error(`*** Please run 'qx package migrate' to apply the changes. If you don't want this, downgrade to a previous version of the compiler.`);
          process.exit(1);
        }
        if (!this.argv.quiet) {
          console.info("Fixing path names in the lockfile...");
          this.argv.reinstall = true;
          await (new qx.tool.cli.commands.package.Upgrade(this.argv)).process();
        }
        let manifest_file = qx.tool.cli.ConfigSchemas.library.filename;
        let manifest = await qx.tool.compiler.utils.Json.loadJsonAsync(manifest_file);
        manifest.requires["@qooxdoo/compiler"] = qx.tool.compiler.Version.VERSION;
        delete manifest.requires.qxcompiler;
        manifest.requires["@qooxdoo/framework"] = "^" + await this.getLibraryVersion(await this.getGlobalQxPath());
        delete manifest.requires["qooxdoo-sdk"];
        delete manifest.requires["qooxdoo"];
        delete manifest.requires["qooxdoo-compiler"];
        await qx.tool.compiler.utils.Json.saveJsonAsync(manifest_file, manifest);
        if (!this.argv.quiet) {
          console.info("Updated dependencies in Manifest.");
          console.info("Migration is completed.");
        }
      }
    }
  }
});
