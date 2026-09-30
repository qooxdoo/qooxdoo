qx.Class.define("testlistenererror.compile.CompilerApi", {
  extend: qx.tool.compiler.cli.api.CompilerApi,

  members: {
    afterCommandLoaded(cmd) {
      if (cmd instanceof qx.tool.compiler.cli.commands.Test) {
        // A test that needs the web server, so that `qx test` runs `qx serve`
        cmd.addTest(new qx.tool.compiler.cli.api.Test("needs-server", async () => {}));
        cmd.addListener("runTests", async () => {
          throw new Error("runTests listener failed");
        });
      }
    }
  }
});

module.exports = {
  CompilerApi: testlistenererror.compile.CompilerApi
};
