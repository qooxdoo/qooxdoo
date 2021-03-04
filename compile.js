const path = require("upath");

qx.Class.define("qx.compiler.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,

  members: {
    load() {
      let yargs = qx.tool.cli.commands.Test.getYargsCommand;
      qx.tool.cli.commands.Test.getYargsCommand = () => {
        let args = yargs();
        args.builder.diag = {
          describe: "show diagnostic output",
          type: "boolean",
          default: false
        };
        args.builder.terse = {
          describe: "show only summary and errors",
          type: "boolean",
          default: false
        };
        args.builder.browsers = {
          describe: "list of browsers to test against, currently supported chromium, firefox, webkit",
          type: "string"
        };
        return args;
      }
      return this.base(arguments);
    },
    /**
     * Register compiler tests
     * @param {qx.tool.cli.commands.Command} command
     * @return {Promise<void>}
     */
    async beforeTests(command) {
      const that = this;
      command.addTest(new qx.tool.cli.api.Test("lint", async function () {
        console.log("# ******** running lint ");
        result = await qx.tool.utils.Utils.runCommand({
          cwd: ".",
          cmd: "node",
          args: [
            path.join(__dirname, "bin", command._getConfig().targetType, "qx"),
            "lint",
            "--warnAsError"
          ],
          shell: true
        });
        if (result.exitCode === 0) {
          console.log("ok");
        } else {
          console.log("not ok");
        }
        this.setExitCode(result.exitCode);
      }));
      command.addTest(new qx.tool.cli.api.Test("compiler test", async function () {
        console.log("# ******** running compiler test");
        result = await qx.tool.utils.Utils.runCommand({
          cwd: "test/tool",
          cmd: "node",
          args: that.__getArgs(command),
          shell: true
        });
        this.setExitCode(result.exitCode);
      }));
      command.addTest(new qx.tool.cli.api.Test("framework test", async function () {
        console.log("# ******** running framework test");
        result = await qx.tool.utils.Utils.runCommand({
          cwd: "test/framework",
          cmd: "node",
          args: that.__getArgs(command),
          shell: true
        });
        this.setExitCode(result.exitCode);
      }));
    },

    __getArgs(command) {
      let res = [];
      res.push(path.join(__dirname, "bin", command._getConfig().targetType, "qx"));
      res.push("test");
      for (const arg of ["colorize", "verbose", "quiet", "fail-fast", "diag", "terse", "browsers"]) {
        if (command.argv[arg]) {
          res.push(` --${arg}=${command.argv[arg]}`);
        }
      }
      return res;
    }
  }
});

module.exports = {
  CompilerApi: qx.compiler.CompilerApi
};
