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
 * "qx pkg" is an alias for "qx package"
 */
qx.Class.define("qx.tool.compiler.cli.commands.Pkg", {
  extend: qx.tool.compiler.cli.commands.Package,
  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.Command.createCliCommand(clazz);
      cmd.set({
        name: "pkg",
        description: "alias for 'qx package'"
      });

      await qx.tool.compiler.cli.Command.addSubcommands(cmd, qx.tool.compiler.cli.commands.package);

      return cmd;
    }
  }
});
