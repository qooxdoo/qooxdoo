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
qx.Class.define("qx.tool.cli.commands.config.Set", {
  extend: qx.tool.cli.commands.Config,
  statics: {
    /**
     * Returns the yargs command data
     * @return {Object}
     */
    getYargsCommand() {
      return {
        command: "set <key> <value>",
        describe: "Sets a configuration value",
        builder: {
          all: {
            type: "boolean",
            describe: "Shows all keys, including unset"
          }
        }
      };
    }
  },

  members: {
    async process() {
      await super.process();
      this._checkKey(this.argv);
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let setting = qx.tool.cli.commands.Config.KNOWN_VALUES[this.argv.key];
      let value = this.argv.value;
      if (setting && typeof setting.set == "function") {
        value = await setting.set(value);
      }

      let keyInfo = this._breakout(this.argv.key);
      let parent = cfg.db(keyInfo.parentKey, {});
      if (value === undefined) {
        delete parent[keyInfo.childKey];
      } else {
        parent[keyInfo.childKey] = value;
      }
      await cfg.save();
    }
  }
});
