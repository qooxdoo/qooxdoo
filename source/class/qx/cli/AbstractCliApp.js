/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019-2022 Zenesis Ltd, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */
qx.Class.define("qx.cli.AbstractCliApp", {
  type: "abstract",
  extend: qx.application.Basic,

  members: {
    async main() {
      qx.log.appender.Native;
      let rootCmd = await this._createRoot();
      await this._addCommands(rootCmd);
      let cmd = null;
      try {
        cmd = rootCmd.parseRoot();
      } catch (ex) {
        console.error("ERROR:\n" + ex.message + "\n");
      }
      let errors = (cmd && cmd.getErrors()) || null;
      if (errors) {
        console.error("ERROR:");
        console.error(errors.join("\n"));
        console.error("\n");
      }

      let run = (cmd && cmd.getRun()) || null;
      if (!cmd || run === null || errors || cmd.getFlag("help").getValue()) {
        console.log((cmd || rootCmd).usage());
        process.exit(0);
      }
      let exitCode = await run.call(cmd, cmd);
      if (typeof exitCode == "number") process.exit(exitCode);
    },

    /**
     * creates the root command
     * @returns qx.cli.Command
     *
     */
    async _createRoot() {
      return new qx.cli.Command("*");
    },

    /**
     * add all the commands to the root.
     * by sub classes.
     *
     * @param {qx.cli.Command} rootCmd command to add sub commands.
     *
     */
    _addCommands(rootCmd) {
      throw new Error("Abstract method call");
    }
  }
});
