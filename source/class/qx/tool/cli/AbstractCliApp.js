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
qx.Class.define("qx.tool.cli.AbstractCliApp", {
  type: "abstract",
  extend: qx.application.Basic,

  members: {
    async main() {
      let rootCmd = await this._createRoot();
      await this._addCommands(rootCmd);
      let cmd = null;
      try {
        cmd = rootCmd.parseRoot();
      } catch (ex) {
        console.error("ERROR:\n" + (ex.stack ?? ex.message) + "\n");
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
        process.exit((!cmd || errors) ? 1 : 0);
      }
      let exitCode = 0;
      try {
        exitCode = await run.call(cmd, cmd) ?? 0;
      } catch (ex) {
        console.error("ERROR:\n" + (ex.stack ?? ex.message) + "\n");
        exitCode = 1;
      }
      // Close undici's global connection pool before exiting.
      // Native fetch (undici) keeps HTTP keep-alive connections open which would prevent
      // natural process exit. node:undici is available as a built-in from Node.js 22+.
      try {
        const { getGlobalDispatcher } = require("node:undici");
        await getGlobalDispatcher().close();
      } catch (e) {
        // node:undici not available on this Node.js version — proceed
      }
      // Use process.exitCode instead of process.exit() to avoid a libuv race on Windows + Node 24:
      // close() resolves, but undici's internal uv_async_t handles are still tearing down; calling
      // process.exit() immediately marks them UV_HANDLE_CLOSING, then a background task fires
      // uv_async_send() on one → assertion fails (libuv 1.50.x made this a hard crash, not a no-op).
      // Setting exitCode and returning lets the event loop drain naturally instead.
      process.exitCode = exitCode;
    },

    /**
     * creates the root command
     * @returns qx.tool.cli.Command
     *
     */
    async _createRoot() {
      return new qx.tool.cli.Command("*");
    },

    /**
     * add all the commands to the root.
     * by sub classes.
     *
     * @param {qx.tool.cli.Command} rootCmd command to add sub commands.
     *
     */
    _addCommands(rootCmd) {
      throw new Error("Abstract method call");
    }
  }
});
