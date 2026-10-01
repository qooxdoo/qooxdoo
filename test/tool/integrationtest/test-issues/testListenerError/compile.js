qx.Class.define("testlistenererror.compile.CompilerApi", {
  extend: qx.tool.compiler.cli.api.CompilerApi,

  members: {
    afterCommandLoaded(cmd) {
      // FAIL_IN selects the listener that fails: "runTests" (default) or "afterStart"
      let failIn = process.env.FAIL_IN || "runTests";
      if (failIn == "afterStart" && cmd instanceof qx.tool.compiler.cli.commands.Serve) {
        cmd.addListener("afterStart", async () => {
          throw new Error("afterStart listener failed");
        });
      }
      if (cmd instanceof qx.tool.compiler.cli.commands.Test) {
        // A test that needs the web server, so that `qx test` runs `qx serve`
        cmd.addTest(new qx.tool.compiler.cli.api.Test("needs-server", async () => {}));
        if (failIn == "runTests") {
          cmd.addListener("runTests", async () => {
            throw new Error("runTests listener failed");
          });
        }
      }
    }
  }
});

module.exports = {
  CompilerApi: testlistenererror.compile.CompilerApi
};
