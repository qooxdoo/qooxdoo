const fs = require("fs");
const path = require("path");

qx.Class.define("qxl.compilertests.testlib.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,
  
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
  extend: qx.tool.cli.api.LibraryApi,
  
  members: {
    /*
     * @Override
     */
    async initialize() {
      let cli = qx.tool.cli.Cli.getInstance();
      cli.yargs.command({
        command: "testlib <message> [options]",
        describe: "repeats a message to the console",
        builder: {
          "type": {
            alias : "t",
            describe : "A parameter",
            nargs: 1,
            requiresArg: true,
            type: "string"
          }
        },
        handler: function(argv) {
          console.log(`The commmand testlib; message=${argv.message}, type=${argv.type}`);
        }
      });
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
