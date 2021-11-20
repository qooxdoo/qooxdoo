const path = require("path");
const inquirer = require("inquirer");

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
          describe: "list of browsers to test against, currently supported chromium, firefox, webkit, none (=node tests only)",
          type: "string"
        };
        return args;
      }
      return this.base(arguments);
    },

    /**
     * runs after the whole process is finished
     * @param cmd {qx.tool.cli.commands.Command} current command
     * @param res {boolean} result of the just finished process
     */
    async afterProcessFinished(cmd, res) {
      if (res)
         return;
      if (cmd.classname !== "qx.tool.cli.commands.package.Publish")
         return;
      // token
      let cfg = await qx.tool.cli.ConfigDb.getInstance();
      let npm = cfg.db("npm", {});
      if (!npm.token) {
        let response = await inquirer.prompt([
          {
            type: "input",
            name: "token",
            message: "Publishing to npm requires an access token - visit https://www.npmjs.com/settings/tokens to obtain one " +
                "(you must assign permission to publish);\nWhat is your npm acess Token ? "
          }
        ]
        );
        if (!response.token) {
          qx.tool.compiler.Console.error("You have not provided a npm token.");
          return;
        }
        npm.token = response.token;
        cfg.save();
      }
      let token = npm.token;
      if (!token) {
        throw new qx.tool.utils.Utils.UserError(`npm access token required.`);
      }
      let args = [
        "publish"
        , " --access public"
      ];
      if (cmd.argv.dryrun) {
        args.push("--dry-run");
      }
      if (cmd.argv.prerelease) {
        args.push("--tag beta");
      }
      let env = process.env;
      env.NPM_ACCESS_TOKEN = token;
      if (cmd.argv.verbose) {
        this.info(`run npm with ${args}`);
      }
      await qx.tool.utils.Utils.runCommand({
        cwd: ".",
        cmd: "npm",
        args: args,
        shell: true,
        env: env,
        log: console.log,
        error: console.log
      });

    },

    /**
     * Register compiler tests
     * @param {qx.tool.cli.commands.Command} command
     * @return {Promise<void>}
     */
    async beforeTests(command) {
      const that = this;
      command.addTest(new qx.tool.cli.api.Test("lint", async function () {
        console.log("# ********* running lint ");
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
      if (command.argv["browsers"] != "none") {
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
      }
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
