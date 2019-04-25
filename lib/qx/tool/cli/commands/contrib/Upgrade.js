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
require("../Contrib");
require("qooxdoo");

/**
 * Lists compatible contrib libraries
 */
qx.Class.define("qx.tool.cli.commands.contrib.Upgrade", {
  extend: qx.tool.cli.commands.Contrib,
  statics: {
    getYargsCommand: function () {
      return {
        command: "upgrade [library_uri]",
        describe:
          "if no library URI is given, upgrades all available contribs to the latest compatible version, otherwise upgrade only the contrib identified by the URI.",
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
          return new qx.tool.cli.commands.contrib.Upgrade(argv)
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
      await (new qx.tool.cli.commands.contrib.Update({quiet:this.argv.quiet, verbose:this.argv.verbose})).process();
      let data = await this.getContribData();
      let found = false;
      const installer = new qx.tool.cli.commands.contrib.Install({
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
        if (this.argv.releasesOnly && (!library.repo_tag || !library.repo_tag.beginsWith("v"))) {
          if (this.argv.verbose) {
            console.info(`Skipping ${library.library_name} (${library.uri}) since it is not a release.`);
          }
        }
        try {
          if (this.argv.dryrun) {
            console.info(`Dry run. Not upgrading ${library.library_name} (${library.uri}.`);
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
