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
 * @asset(qx/tool/compiler/*)
 * @use(qx.tool.compiler.cli.commands)
 *
 */
qx.Class.define("qx.tool.compiler.cli.Application", {
  extend: qx.tool.cli.AbstractCliApp,
  members: {
    async main() {
      super();
    },

    /**
     * @override
     */
    _createRoot() {
      return qx.tool.compiler.cli.RootCommand.createCliCommand();
    },

    /**
     * @Override
     */
    async _addCommands(rootCmd) {
      await qx.tool.compiler.cli.ConfigLoader.getInstance().load();
      await qx.tool.compiler.cli.Command.addSubcommands(rootCmd, qx.tool.compiler.cli.commands);
      let compiler = qx.tool.compiler.cli.ConfigLoader.getInstance().getCompilerApi();
      let cmds = [rootCmd, ...rootCmd.getSubcommands()];
      for (let cmd of cmds) {
        for (let lib of compiler.getLibraryApis()) {
          lib.initialize(cmd);
        }
      }
    }
  },

  defer(statics) {
    qx.log.Logger.setLevel("error");
  }
});
