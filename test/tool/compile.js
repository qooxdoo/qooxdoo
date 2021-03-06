const fs = require("fs");
const path = require("upath");
const process = require("process");
const { performance } = require('perf_hooks');

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
      const that = this;
      this.__argv = command.argv;
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
          that.__notOk = 0;
          that.__Ok = 0;
          that.__skipped = 0;
          let startTime = performance.now();
          result = await qx.tool.utils.Utils.runCommand({
            cwd: COMPILER_TEST_PATH,
            cmd: "node",
            args: args,
            shell: false,
            env: {
              QX_JS: require.main.filename,
              IGNORE_MIGRATION_WARNING: true
            },
            log: that.__log.bind(that),
            error: that.__log.bind(that)
          });
          let endTime = performance.now();
          let timeDiff = endTime - startTime;
          qx.tool.compiler.Console.info(`DONE testing ${test}: ${that.__Ok} ok, ${that.__notOk} not ok, ${that.__skipped} skipped - [${timeDiff.toFixed(0)} ms]`);
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
          this.__notOk++;
          qx.tool.compiler.Console.log(val);
        } else if (val.includes("# SKIP")) {
          this.__skipped++;
          if (!this.__argv.terse) {
            qx.tool.compiler.Console.log(val);
          }
        } else if (val.match(/^ok\s/)) {
          this.__Ok++;
          if (!this.__argv.terse) {
            qx.tool.compiler.Console.log(val);
          }
        } else if (val.match(/^#/) && this.__argv.diag) {
          qx.tool.compiler.Console.log(val);
        } else if (this.__argv.verbose) {
          qx.tool.compiler.Console.log(val);
        }
      });
    },

    __argv: null,
    __notOk: null,
    __Ok: null,
    __skipped: null

  }
});

module.exports = {
  CompilerApi: qx.compiler.CompilerApi
};
