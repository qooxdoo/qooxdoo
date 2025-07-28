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
qx.Class.define("qx.tool.compiler.cli.commands.config.Delete", {
  extend: qx.tool.compiler.cli.commands.Config,
  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.commands.Config.createCliCommand(clazz);
      cmd.set({
        name: "delete",
        description: "Deletes a configuration value"
      });

      cmd.addArgument(
        new qx.cli.Argument("key").set({
          description: "Configuration key to delete",
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
      let keyInfo = this._breakout(this.argv.key);
      let parent = cfg.db(keyInfo.parentKey);
      if (parent) {
        delete parent[keyInfo.childKey];
      }
      await cfg.save();
    }
  }
});
