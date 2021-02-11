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
      const COMPILER_TEST_PATH = path.join("test", "compiler");
      function addTest(test) {
        command.addTest(new qx.tool.cli.api.Test(test, async function() {
          console.log("****");
          console.log("**** Running " + test);
          console.log("****");
          result = await qx.tool.utils.Utils.runCommand({
            cwd: COMPILER_TEST_PATH, 
            cmd: "node",
            args: [ test + ".js" ],
            shell: false,
            env: {
              QX_JS: require.main.filename
            }
          });
          this.setExitCode(result.exitCode);
        })).setNeedsServer(false);
      }
      try {
        try {
          fs.unlinkSync("test/qx");
        }catch(ex) {
          // Nothing
        }
        
        let files = fs.readdirSync(COMPILER_TEST_PATH);
        files.forEach(file => {
          if (fs.statSync(path.join(COMPILER_TEST_PATH, file)).isFile() && file.endsWith(".js")) {
            addTest(path.changeExt(path.basename(file), ""));
          }
        });
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    }
  }
});

module.exports = {
  CompilerApi: qx.compiler.CompilerApi
};
