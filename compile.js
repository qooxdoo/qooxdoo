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
          shell: true,
          log: console.log,
          error: console.log
        });
        if (result.exitCode === 0) {
          qx.tool.compiler.Console.log("ok");
        } else {
          qx.tool.compiler.Console.log("not ok");
        }
        this.setExitCode(result.exitCode);
      }));
      let argList = ["colorize", "verbose", "quiet", "fail-fast", "diag", "terse"];
      command.addTest(new qx.tool.cli.api.Test("compiler test", async function () {
        qx.tool.compiler.Console.log("# ******** running compiler test");
        result = await qx.tool.utils.Utils.runCommand({
          cwd: "test/tool",
          cmd: "node",
          args: that.__getArgs(command, argList),
          shell: true
        });
        this.setExitCode(result.exitCode);
      }));
      command.addTest(new qx.tool.cli.api.Test("framework test", async function () {
        console.log("# ******** running framework test");
        let args = argList.slice();
        args.push("browsers");
        result = await qx.tool.utils.Utils.runCommand({
          cwd: "test/framework",
          cmd: "node",
          args: that.__getArgs(command, args),
          shell: true
        });
        this.setExitCode(result.exitCode);
      }));
    },

    __getArgs(command, argList) {
      let res = [];
      res.push(path.join(__dirname, "bin", command._getConfig().targetType, "qx"));
      res.push("test");
      for (const arg of argList) {
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
