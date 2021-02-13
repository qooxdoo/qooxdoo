/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017-2021 The authors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

const child_process = require("child_process");

qx.Class.define("qx.tool.cli.Utils", {
  type: "static",
  members: {
    /**
     * Awaitable wrapper around child_process.spawn.
     * Runs a command in a separate process. The output of the command
     * is ignored. Throws when the exit code is not 0.
     * @param  {String} cmd Name of the command
     * @param  {Array} args Array of arguments to the command
     * @return {Promise<Number>} A promise that resolves with the exit code
     */
    run(cmd, args) {
      let opts = {env: process.env};
      return new Promise((resolve, reject) => {
        let exe = child_process.spawn(cmd, args, opts);
        // suppress all output unless in verbose mode
        exe.stdout.on("data", data => {
          if (this.argv.verbose) {
            qx.tool.compiler.Console.log(data.toString());
          }
        });
        exe.stderr.on("data", data => {
          if (this.argv.verbose) {
            qx.tool.compiler.Console.error(data.toString());
          }
        });
        exe.on("close", code => {
          if (code !== 0) {
            let message = `Error executing '${cmd} ${args.join(" ")}'. Use --verbose to see what went wrong.`;
            reject(new qx.tool.utils.Utils.UserError(message));
          } else {
            resolve(0);
          }
        });
        exe.on("error", reject);
      });
    },

    /**
     * Awaitable wrapper around child_process.exec
     * Executes a command and return its result wrapped in a Promise.
     * @param cmd {String} Command with all parameters
     * @return {Promise<String>} Promise that resolves with the result
     */
    exec(cmd) {
      return new Promise((resolve, reject) => {
        child_process.exec(cmd, (err, stdout, stderr) => {
          if (err) {
            reject(err);
          }
          if (stderr) {
            reject(new Error(stderr));
          }
          resolve(stdout);
        });
      });
    },

    /**
     * Returns the absolute path to the template directory
     * @return {String}
     */
    getTemplateDir() {
      let dir = qx.util.ResourceManager.getInstance().toUri("qx/tool/cli/templates/template_vars.js");
      dir = path.dirname(dir);
      return dir;
    },

    /**
     * Detects whether the command line explicit set an option (as opposed to yargs
     * providing a default value).  Note that this does not handle aliases, use the
     * actual, full option name.
     *
     * @param option {String} the name of the option, eg "listen-port"
     * @return {Boolean}
     */
    isExplicitArg(option) {
      function searchForOption(option) {
        return process.argv.indexOf(option) > -1;
      }
      return searchForOption(`-${option}`) || searchForOption(`--${option}`);
    }
  }
});
