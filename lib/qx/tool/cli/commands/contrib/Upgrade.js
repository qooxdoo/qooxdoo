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
require("@qooxdoo/framework");

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
      let data = await this.getContribData();
      let found = false;
      const installer = new qx.tool.cli.commands.contrib.Install({
        quiet: this.argv.quiet,
        verbose: this.argv.verbose
      });
      for (const library of data.libraries) {
        if (this.argv.library_uri && library.uri !== this.argv.library_uri) {
          continue;
        }
        found = true;
        try {
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
