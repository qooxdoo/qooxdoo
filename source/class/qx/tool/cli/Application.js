/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Henner Kollmann

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */
/**
 * This is the main application class of the compiler.
 *
 * @asset(qx/tool/*)
 * @use(qx.tool.cli.commands)
 *
 */
qx.Class.define("qx.tool.cli.Application", {
  extend: qx.cli.AbstractCliApp,
  members: {
    async main() {
      await qx.tool.cli.ConfigLoader.getInstance().load();
      super();
    },

    /**
     * @overridden
     */
    _createRoot() {
      return qx.tool.cli.RootCommand.createCliCommand();
    },

    /**
     * @overridden
     */
    async _addCommands(rootCmd) {
      await qx.tool.cli.Command.addSubcommands(rootCmd, qx.tool.cli.commands);
    }
  },

  defer(statics) {
    qx.log.Logger.setLevel("error");
  }
});
