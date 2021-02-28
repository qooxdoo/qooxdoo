const fs = require("fs");
const path = require("path");

qx.Class.define("qxl.compilertests.testlib.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,
  
  members: {
    async load() {
      let data = await this.base(arguments);
      if (!data.environment)
        data.environment = {};
      data.environment.testlibCompilerApi = "two";
      return data;
    }
  }
});

qx.Class.define("qxl.compilertests.testlib.LibraryApi", {
  extend: qx.tool.cli.api.LibraryApi,
  
  members: {
    async load() {
      let command = this.getCompilerApi().getCommand();
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
