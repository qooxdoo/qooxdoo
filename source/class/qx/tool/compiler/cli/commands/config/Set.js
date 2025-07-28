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
qx.Class.define("qx.tool.compiler.cli.commands.config.Set", {
  extend: qx.tool.compiler.cli.commands.Config,
  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.commands.Config.createCliCommand(clazz);
      cmd.set({
        name: "set",
        description: "Sets a configuration value"
      });

      cmd.addArgument(
        new qx.cli.Argument("key").set({
          description: "Configuration key to set",
          required: true,
          type: "string"
        })
      );

      cmd.addArgument(
        new qx.cli.Argument("value").set({
          description: "Configuration value to set",
          required: true,
          type: "string"
        })
      );

      return cmd;
    }
  },

  members: {
    async process() {
      await super.process();
      this._checkKey(this.argv);
      let cfg = await qx.tool.compiler.cli.ConfigDb.getInstance();
      let setting = qx.tool.compiler.cli.commands.Config.KNOWN_VALUES[this.argv.key];
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
