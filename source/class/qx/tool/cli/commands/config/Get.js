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
qx.Class.define("qx.tool.cli.commands.config.Get", {
  extend: qx.tool.cli.commands.Config,
  statics: {
    /**
     * Returns the yargs command data
     * @return {Object}
     */
    getYargsCommand() {
      return {
        command: "get <key> [options]",
        describe: "Gets a configuration value"
      };
    }
  },

  members: {
    /**
     * Lists library packages compatible with the current project
     */
    async process() {
      await super.process();
      this._checkKey(this.argv);
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let value = cfg.db(this.argv.key);
      if (this.argv.bare) {
        qx.tool.compiler.Console.info(value || "");
      } else if (value !== undefined) {
        qx.tool.compiler.Console.info(this.argv.key + "=" + value);
      } else {
        qx.tool.compiler.Console.info(this.argv.key + " is not set");
      }
    }
  }
});
