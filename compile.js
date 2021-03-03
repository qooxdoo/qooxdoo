const path = require("upath");

qx.Class.define("qx.compiler.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,

  members: {
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
//      res.push("--terse");
      for (const arg of ["colorize", "verbose", "quiet", "fail-fast"]) {
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
