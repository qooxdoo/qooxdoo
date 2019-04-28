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

************************************************************************ */

require("./Command");
require("qooxdoo");

const process = require("process");

/**
 * Deprecated name for package system
 */
qx.Class.define("qx.tool.cli.commands.Contrib", {
  extend: qx.tool.cli.commands.Command,

  statics: {
    /**
     * The yargs command data
     * @return {{}}
     */
    getYargsCommand: function() {
      return {
        command : "contrib <command> [options]",
        desc : "deprecated. Use 'qx package' instead.",
        builder : function(yargs) {
          qx.tool.cli.Cli.addYargsCommands(yargs, [
            "Install",
            "List",
            "Publish",
            "Remove",
            "Update",
            "Upgrade"
          ], "qx.tool.cli.commands.package");
          let cmd = process.argv[process.argv.indexOf("contrib")+1];
          console.warn(`*** 'qx contrib ${cmd}' is deprecated, use 'qx package ${cmd}' instead. ***`);
          qx.tool.cli.commands.Package.migrate();
          return yargs
            .demandCommand()
            .showHelpOnFail()
            .help();
        },
        handler : function(argv) {
        }
      };
    }
  }
});
