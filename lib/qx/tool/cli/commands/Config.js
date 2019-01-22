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

************************************************************************ */

require("qooxdoo");
const process = require("process");
const path = require("path");
const columnify = require("columnify");
const fs = qx.tool.compiler.utils.Promisify.fs;

require("./Command");
require("./MConfig");

/**
 * Handles persistent configuration
 */

qx.Class.define("qx.tool.cli.commands.Config", {
  extend: qx.tool.cli.commands.Command,
  include: [qx.tool.cli.commands.MConfig],

  statics: {

    getYargsCommand: function() {
      function run(argv, name) {
        var cmd = new qx.tool.cli.commands.Config(argv);
        return cmd[name](argv)
          .catch(e => {
            console.log(e.stack || e.message);
            process.exit(1);
          });
      }
      return {
        command   : "config <key> [value]",
        describe  : "gets/sets persistent configuration",
        builder   : function(yargs) {
          yargs
            .option("quiet", {
              alias: "q",
              describe: "Suppresses warnings (eg about unknown configuration keys)",
              type: "boolean"
            })
            .command("set <key> <value>", "Sets a configuration value", () => {}, argv => run(argv, "cmdSet"))
            .command("get <key> [options]", "Gets a configuration value", {
              "bare": {
                type: "boolean",
                describe: "Restricts output to just the value"
              }
            }, argv => run(argv, "cmdGet"))
            .command("delete <key>", "Deletes a configuration value", () => {}, argv => run(argv, "cmdDelete"))
            .command("list", "Lists all known configuration values", {
              "all": {
                type: "boolean",
                describe: "Shows all keys, including unset"
              }
            }, argv => run(argv, "cmdList"));
        },
        handler   : function(argv) {
        }
      };
    },

    KNOWN_VALUES: {
      "github.token": {
        desc: "The API token used to connect to GitHub"
      },
      "qx.library": {
        desc: "The directory where qooxdoo library is installed",
        set: async function(value) {
          if (!value) {
            return undefined;
          }
          if (!await fs.existsAsync(path.join(value, "Manifest.json"))) {
            if (await fs.existsAsync(path.join(value, "framework/Manifest.json"))) {
              value = path.join(value, "framework");
            } else {
              console.error(`Cannot set qx.library to ${value} because there is no Manifest.json`);
              return undefined;
            }
          }
          return path.resolve(value);
        }
      }
    }

  },

  members: {
    __describe: function(key) {
      var data = qx.tool.cli.commands.Config.KNOWN_VALUES[key];
      return data && data.desc;
    },

    __checkKey: function(argv) {
      if (!argv.quiet) {
        let desc = this.__describe(argv.key);
        if (!desc) {
          console.warn("Warning: Unrecognised configuration key " + argv.key);
        }
      }
    },

    __breakout: function(key) {
      let pos = key.lastIndexOf(".");
      let parentKey = pos > -1 ? key.substring(0, pos) : "";
      let childKey = key.substring(pos + 1);

      return {
        key: key,
        parentKey: parentKey,
        childKey: childKey
      };
    },

    cmdSet: async function(argv) {
      this.__checkKey(argv);
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let setting = qx.tool.cli.commands.Config.KNOWN_VALUES[argv.key];
      let value = argv.value;
      if (setting && typeof setting.set == "function") {
        value = await setting.set(value);
      }

      let keyInfo = this.__breakout(argv.key);
      let parent = cfg.db(keyInfo.parentKey, {});
      if (value === undefined) {
        delete parent[keyInfo.childKey];
      } else {
        parent[keyInfo.childKey] = value;
      }
      await cfg.save();
    },

    cmdDelete: async function(argv) {
      this.__checkKey(argv);
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let keyInfo = this.__breakout(argv.key);
      let parent = cfg.db(keyInfo.parentKey);
      if (parent) {
        delete parent[keyInfo.childKey];
      }
      await cfg.save();
    },

    cmdGet: async function(argv) {
      this.__checkKey(argv);
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let value = cfg.db(argv.key);
      if (argv.bare) {
        console.log(value||"");
      } else if (value !== undefined) {
        console.log(argv.key + "=" + value);
      } else {
        console.log(argv.key + " is not set");
      }
    },

    cmdList: async function(argv) {
      let cfg = await qx.tool.cli.ConfigDb.getInstance();

      let keys = {};
      function scan(obj, parentKey) {
        for (let key in obj) {
          let value = obj[key];
          let fullKey = parentKey + (parentKey.length ? "." : "") + key;
          if (qx.tool.cli.Utils.isPlainObject(value)) {
            scan(value, fullKey);
            continue;
          }
          keys[fullKey] = true;
        }
      }
      if (argv.all) {
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
        description: this.__describe(key)||"Unrecognised key"
      }));

      // Display each value
      console.log(columnify(keys));
    }
  }
});
