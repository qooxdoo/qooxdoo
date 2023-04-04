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
qx.Class.define("qx.tool.cli.commands.config.Delete", {
  extend: qx.tool.cli.commands.Config,
  statics: {
    /**
     * Returns the yargs command data
     * @return {Object}
     */
    getYargsCommand() {
      return {
        command: "delete <key>",
        describe: "Deletes a configuration value"
      };
    }
  },

  members: {
    async process() {
      await super.process();
      this._checkKey(this.argv);
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let keyInfo = this._breakout(this.argv.key);
      let parent = cfg.db(keyInfo.parentKey);
      if (parent) {
        delete parent[keyInfo.childKey];
      }
      await cfg.save();
    }
  }
});
