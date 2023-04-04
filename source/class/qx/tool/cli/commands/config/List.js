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
const columnify = require("columnify");

/**
 * Lists compatible packages
 */
qx.Class.define("qx.tool.cli.commands.config.List", {
  extend: qx.tool.cli.commands.Config,
  statics: {
    /**
     * Returns the yargs command data
     * @return {Object}
     */
    getYargsCommand() {
      return {
        command: "list",
        describe: "Lists all known configuration values",
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
      let cfg = await qx.tool.cli.ConfigDb.getInstance();

      let keys = {};
      function scan(obj, parentKey) {
        for (let [key, value] of Object.entries(obj)) {
          let fullKey = parentKey + (parentKey.length ? "." : "") + key;
          if (qx.tool.utils.Utils.isPlainObject(value)) {
            scan(value, fullKey);
            continue;
          }
          keys[fullKey] = true;
        }
      }
      if (this.argv.all) {
        for (let key in qx.tool.cli.commands.Config.KNOWN_VALUES) {
          keys[key] = true;
        }
      }

      // Recursively get a list of all known keys
      scan(cfg.db(), "");
      keys = Object.keys(keys);
      keys.sort();
      keys = keys.map(key => ({
        key: key,
        value: cfg.db(key),
        description: this._describe(key) || "Unrecognised key"
      }));

      // Display each value
      qx.tool.compiler.Console.info(columnify(keys));
    }
  }
});
