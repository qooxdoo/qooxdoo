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
/**
 * Adds scripts, classes, etc. to the projects
 */
qx.Class.define("qx.tool.cli.commands.Add", {
  extend: qx.tool.cli.commands.Command,

  statics: {
    getYargsCommand() {
      return {
        command: "add <command> [options]",
        desc: "adds new elements to an existing qooxdoo application/library",
        builder(yargs) {
          qx.tool.cli.Cli.addYargsCommands(
            yargs,
            ["Class", "Script"],
            "qx.tool.cli.commands.add"
          );

          return yargs.demandCommand().showHelpOnFail().help();
        },
        handler() {}
      };
    }
  },

  members: {
    // place for common methods.
  }
});
