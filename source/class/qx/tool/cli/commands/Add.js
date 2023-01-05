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
     * Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */
/**
 * Adds scripts, classes, etc. to the projects
 *
 * @use(qx.tool.cli.commands.add)
 */
qx.Class.define("qx.tool.cli.commands.Add", {
  extend: qx.tool.cli.Command,

  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.cli.Command.createCliCommand(clazz);
      cmd.set({
        name: "add",
        description:
          "adds new elements to an existing qooxdoo application/library."
      });

      await qx.tool.cli.Command.addSubcommands(cmd, qx.tool.cli.commands.add);
      return cmd;
    }
  },

  members: {
    // place for common methods.
  }
});
