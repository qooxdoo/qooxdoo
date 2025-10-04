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

qx.Class.define("qx.tool.compiler.cli.commands.Config", {
  extend: qx.tool.compiler.cli.Command,
  statics: {
    /**
     * Creates the CLI command
     */
    async createCliCommand(clazz = this) {
      let cmd = await qx.tool.compiler.cli.Command.createCliCommand(clazz);
      cmd.set({
        name: "config",
        description: "gets/sets persistent configuration"
      });
      cmd.setRun(null);
      await qx.tool.compiler.cli.Command.addSubcommands(cmd, qx.tool.compiler.cli.commands.config);
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
    },

    _describe(key) {
      var data = qx.tool.compiler.cli.commands.Config.KNOWN_VALUES[key];
      return data && data.desc;
    },

    _checkKey(argv) {
      if (!argv.quiet) {
        let desc = this._describe(argv.key);
        if (!desc) {
          qx.tool.compiler.Console.warn(
            "Warning: Unrecognised configuration key " + argv.key
          );
        }
      }
    },

    _breakout(key) {
      let pos = key.lastIndexOf(".");
      let parentKey = pos > -1 ? key.substring(0, pos) : "";
      let childKey = key.substring(pos + 1);

      return {
        key: key,
        parentKey: parentKey,
        childKey: childKey
      };
    }
  }
});
