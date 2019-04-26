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

/**
 * Lists compatible library packages
 */
qx.Class.define("qx.tool.cli.commands.package.Upgrade", {
  extend: qx.tool.cli.commands.Package,
  statics: {
    getYargsCommand: function () {
      return {
        command: "upgrade [library_uri]",
        describe:
          "if no library URI is given, upgrades all available libraries to the latest compatible version, otherwise upgrade only the package identified by the URI.",
        builder: {
          quiet: {
            alias: "q",
            describe: "No output"
          },
          "verbose": {
            alias: "v",
            describe: "Verbose logging"
          },
          "releases-only": {
            alias: "r",
            describe: "Upgrade regular releases only"
          },
          "dryrun":{
            alias: "d",
            describe: "Show result only, do not actually upgrade"
          }
        },
        handler: function (argv) {
          return new qx.tool.cli.commands.package.Upgrade(argv)
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
    async process() {
      await (new qx.tool.cli.commands.package.Update({quiet:this.argv.quiet, verbose:this.argv.verbose})).process();
      if (!this.argv.quiet) {
        console.info("Upgrading project dependencies to their latest available releases...");
      }
      let data = await this.getPackageData();
      let found = false;
      const installer = new qx.tool.cli.commands.package.Install({
        quiet: this.argv.quiet,
        verbose: this.argv.verbose
      });
      for (const library of data.libraries) {
        // do not upggrade libraries that are not from a repository
        if (!library.repo_name || !library.repo_tag) {
          continue;
        }
        // if a library to upgrade has been provided, skip non-matching ones
        if (this.argv.library_uri && library.uri !== this.argv.library_uri) {
          continue;
        }
        found = true;
        if (this.argv.releasesOnly && (!qx.lang.Type.isString(library.repo_tag) || !library.repo_tag.startsWith("v"))) {
          if (!this.argv.quiet) {
            console.info(`Skipping ${library.library_name} (${library.uri}@${library.repo_tag}) since it is not a release.`);
          }
          continue;
        }
        try {
          if (this.argv.dryrun) {
            console.info(`Dry run. Not upgrading ${library.library_name} (${library.uri}@${library.repo_tag}).`);
            continue;
          }
          await installer.install(library.uri);
        } catch (e) {
          console.warn(e.message);
        }
      }
      if (!found) {
        throw new qx.tool.cli.Utils.UserError(`Library '${this.argv.library_uri}' is not installed.`);
      }
    }
  }
});
