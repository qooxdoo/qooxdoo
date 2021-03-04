const fs = require("fs");
const path = require("upath");
const process = require("process");

qx.Class.define("qx.compiler.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,

  members: {
    /**
     * Register compiler tests
     * @param {qx.tool.cli.commands.Command} command
     * @return {Promise<void>}
     */
    async beforeTests(command) {
      const COMPILER_TEST_PATH = "integrationtest";
      function addTest(test) {
        let args = [];
        args.push(test + ".js");
        for (const arg of ["colorize", "verbose", "quiet", "fail-fast"]) {
          if (command.argv[arg]) {
            args.push(` --${arg}=${command.argv[arg]}`);
          }
        }
        command.addTest(new qx.tool.cli.api.Test(test, async function () {
          this.info("*********************************************************************************************************");
          this.info("# Running " + test);
          this.info("**********************************************************************************************************");

          result = await qx.tool.utils.Utils.runCommand({
            cwd: COMPILER_TEST_PATH,
            cmd: "node",
            args: args,
            shell: false,
            env: {
              QX_JS: require.main.filename,
              IGNORE_MIGRATION_WARNING: true
            },
            log: this.__log.bind(this)
          });
          if (result.exitCode === 0) {
            qx.tool.compiler.Console.log("ok");
          } else {
            qx.tool.compiler.Console.log("not ok");
          }
          this.setExitCode(result.exitCode);
        })).setNeedsServer(false);
      }
      try {
        let files = fs.readdirSync(COMPILER_TEST_PATH);
        files.forEach(file => {
          if (fs.statSync(path.join(COMPILER_TEST_PATH, file)).isFile() && file.endsWith(".js")) {
            addTest(path.changeExt(path.basename(file), ""));
          }
        });
      } catch (e) {
        qx.tool.compiler.Console.error(e);
        process.exit(1);
      }
    },

    __log(msg) {
      let arr = msg.split("\n");
      // value is serializable
      arr.forEach(val => {
        if (val.match(/^not ok /)) {
          qx.tool.compiler.Console.log(val);
        } else if (val.includes("# SKIP")) {
          if (!app.argv.terse) {
            qx.tool.compiler.Console.log(val);
          }
        } else if (val.match(/^ok\s/)) {
          if (!app.argv.terse) {
          }
        } else if (val.match(/^#/) && app.argv.diag) {
          qx.tool.compiler.Console.log(val);
        } else if (app.argv.verbose) {
          qx.tool.compiler.Console.log(val);
        }
      });

    }
  }
});

module.exports = {
  CompilerApi: qx.compiler.CompilerApi
};
