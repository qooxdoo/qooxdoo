/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2018 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */
const columnify = require("columnify");
/**
 * Handles persistent configuration
 */

qx.Class.define("qx.tool.cli.commands.Config", {
  extend: qx.tool.cli.Command,
  statics: {
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.cli.Command.createCliCommand(clazz);
      cmd.set({
        name: "config",
        description: "gets/sets persistent configuration"
      });

      cmd.addSubcommand(
        new qx.cli.Command("").set({
          name: "set",
          description: "Sets a configuration value",
          run() {
            cmd.getRun()(this);
          }
        })
      );

      cmd.addSubcommand(
        new qx.cli.Command("")
          .set({
            name: "get",
            description: "Gets a configuration value",
            run() {
              cmd.getRun()(this);
            }
          })
          .addFlag(
            new qx.cli.Flag("bare").set({
              description: "Restricts output to just the value",
              type: "boolean"
            })
          )
      );

      cmd.addSubcommand(
        new qx.cli.Command("").set({
          name: "delete",
          description: "Deletes a configuration value",
          run() {
            cmd.getRun()(this);
          }
        })
      );

      cmd.addSubcommand(
        new qx.cli.Command("")
          .set({
            name: "list",
            description: "Lists all known configuration values",
            run() {
              cmd.getRun()(this);
            }
          })
          .addFlag(
            new qx.cli.Flag("all").set({
              description: "Shows all keys, including unset",
              type: "boolean"
            })
          )
      );

      return cmd;
    },

    KNOWN_VALUES: {
      "github.token": {
        desc: "The API token used to connect to GitHub"
      },

      "qx.translation.strictPoCompatibility": {
        desc: "Whether to write PO files with strict compatibility, i.e. include line numbers in output",
        async set(value) {
          return value === "true"
            ? true
            : value === "false"
            ? false
            : Boolean(value);
        }
      },

      "qx.default.color": {
        desc: 'The default color for console output (eg "white bgRed bold")'
      },

      "qx.default.feedback": {
        desc: "Default value for compiler feedback (override with --[no-]feedback)",
        async set(value) {
          return value === "true"
            ? true
            : value === "false"
            ? false
            : undefined;
        }
      }
    }
  },

  members: {
    /*
     * @Override
     */
    async process() {
      return this[this.argv.$cmd]();
    },

    __describe(key) {
      var data = qx.tool.cli.commands.Config.KNOWN_VALUES[key];
      return data && data.desc;
    },

    _checkKey(argv) {
      if (!argv.quiet) {
        let desc = this.__describe(argv.key);
        if (!desc) {
          qx.tool.compiler.Console.warn(
            "Warning: Unrecognised configuration key " + argv.key
          );
        }
      }
    },

    __breakout(key) {
      let pos = key.lastIndexOf(".");
      let parentKey = pos > -1 ? key.substring(0, pos) : "";
      let childKey = key.substring(pos + 1);

      return {
        key: key,
        parentKey: parentKey,
        childKey: childKey
      };
    },

    async set() {
      this.__checkKey(this.argv);
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let setting = qx.tool.cli.commands.Config.KNOWN_VALUES[this.argv.key];
      let value = this.argv.value;
      if (setting && typeof setting.set == "function") {
        value = await setting.set(value);
      }

      let keyInfo = this.__breakout(this.argv.key);
      let parent = cfg.db(keyInfo.parentKey, {});
      if (value === undefined) {
        delete parent[keyInfo.childKey];
      } else {
        parent[keyInfo.childKey] = value;
      }
      await cfg.save();
    },

    async delete() {
      this.__checkKey(this.argv);
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let keyInfo = this.__breakout(this.argv.key);
      let parent = cfg.db(keyInfo.parentKey);
      if (parent) {
        delete parent[keyInfo.childKey];
      }
      await cfg.save();
    },

    async get() {
      this.__checkKey(this.argv);
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let value = cfg.db(this.argv.key);
      if (this.argv.bare) {
        qx.tool.compiler.Console.info(value || "");
      } else if (value !== undefined) {
        qx.tool.compiler.Console.info(this.argv.key + "=" + value);
      } else {
        qx.tool.compiler.Console.info(this.argv.key + " is not set");
      }
    },

    async list() {
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
        description: this.__describe(key) || "Unrecognised key"
      }));

      // Display each value
      qx.tool.compiler.Console.info(columnify(keys));
    }
  }
});
