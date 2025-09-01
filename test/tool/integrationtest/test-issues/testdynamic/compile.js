const fs = require("fs");
const path = require("path");

qx.Class.define("qxl.compilertests.testlib.CompilerApi", {
  extend: qx.tool.compiler.cli.api.CompilerApi,
  
  members: {
    async load() {
      await this.base(arguments);
      let data = this.getConfiguration();
      if (!data.environment)
        data.environment = {};
      data.environment.testlibCompilerApi = "two";
    }
  }
});

qx.Class.define("qxl.compilertests.testlib.LibraryApi", {
  extend: qx.tool.compiler.cli.api.LibraryApi,
  
  members: {
    /*
     * @Override
     */
    async initialize(rootCmd) {
      let cmd = new qx.tool.cli.Command("testlib");
      cmd.addArgument(
        new qx.tool.cli.Argument("message").set({
          description: "The message to repeat",
          type: "string",
          required: true
        })
      );
      cmd.addFlag(
        new qx.tool.cli.Flag("type").set({
          shortCode: "t",
          description: "A parameter",
          type: "string"
        })
      );
      cmd.setRun(function(cmd) {
        let { argv } = cmd.getValues();
        console.log(`The commmand testlib; message=${argv.message}, type=${argv.type}`);
      });
      rootCmd.addSubcommand(cmd);
    },
    
    /*
     * @Override
     */
    async load() {
      let command = this.getCompilerApi().getCommand();
      if (command)
        command.addListener("checkEnvironment", e => this._appCompiling(e.getData().application, e.getData().environment));
    },
    
    _appCompiling(application, environment) {
      environment.testlibLibraryApi = "one";
    }
  }
});

module.exports = {
    LibraryApi: qxl.compilertests.testlib.LibraryApi,
    CompilerApi: qxl.compilertests.testlib.CompilerApi
};
