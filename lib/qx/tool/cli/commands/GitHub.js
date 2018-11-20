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
const process = require('process');

require("./Command");
require("./MConfig");

/**
 * Handles connection to github
 */

qx.Class.define("qx.tool.cli.commands.GitHub", {
  extend: qx.tool.cli.commands.Command,
  include: [qx.tool.cli.commands.MConfig],

  statics: {
    
    getYargsCommand: function() {
      return {
        command   : "github <command>",
        describe  : "connects to github",
        builder   : function(yargs) {
          yargs
            .command("set-token <token>", "Sets the github token", () => {}, (argv) => {
              return new qx.tool.cli.commands.GitHub(argv)
                .cmdSetToken(argv)
                .catch(e => {
                  console.log(e.stack || e.message);
                  process.exit(1);
                });
            })
            .command("get-token", "Gets the github token", () => {}, (argv) => {
              return new qx.tool.cli.commands.GitHub(argv)
                .cmdGetToken(argv)
                .catch(e => {
                  console.log(e.stack || e.message);
                  process.exit(1);
                });
            });
        },
        handler   : function(argv){
        }
      };
    }
 
  },
    
  members: {
    cmdSetToken: async function(argv) {
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let github = cfg.db("github", {});
      if (argv.token)
        github.token = argv.token;
      else
        delete github.token;
      await cfg.save();
    },
    
    cmdGetToken: async function(argv) {
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let github = cfg.db("github");
      let token = github && github.token;
      if (token)
        console.log("Current GitHub token is " + token);
      else
        console.log("Github token is not configured");
    }
  }
});
