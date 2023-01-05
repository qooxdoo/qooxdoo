/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Christian Boulanger and others

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Henner Kollmann (hkollmann)

************************************************************************ */

/**
 * The main command
 */
qx.Class.define("qx.tool.cli.RootCommand", {
  extend: qx.tool.cli.Command,
  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.cli.Command.createCliCommand(clazz);
      cmd.addFlag(
        new qx.cli.Flag("version").set({
          description: " Show version number",
          type: "boolean",
          value: false
        })
      );

      return cmd;
    }
  },

  members: {
    async process() {
      if (this.argv.version) {
        let title = `
Version: v${await qx.tool.config.Utils.getQxVersion()}
        `;
        console.log(title);
        return;
      }

      let title = "qooxdoo command line interface";
      title = "\n" + title + "\n" + "=".repeat(title.length);

      title += `
Version: v${await qx.tool.config.Utils.getQxVersion()}
`;
      title += "\n";
      title += `Typical usage:
        qx <commands> [options]

      Type qx <command> --help for options and subcommands.`;
      console.log(title);
    }
  }
});
