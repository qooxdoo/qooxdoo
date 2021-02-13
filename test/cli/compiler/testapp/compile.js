const fs = require("fs");
const path = require("path");
const runscript = require('runscript');
const util = require('util');

qx.Class.define("qxl.compilertests.testapp.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,
  
  members: {
    async load() {
      let data = await this.base(arguments);
      if (!data.environment)
        data.environment = {};
      data.environment.testappCompilerApi = "two";
      return data;
    }
  }
});

qx.Class.define("qxl.compilertests.testapp.LibraryApi", {
  extend: qx.tool.cli.api.LibraryApi,
  
  members: {
    __startedSassWatch: false,
    
    async load() {
      let command = this.getCompilerApi().getCommand();
      command.addListener("making", () => this._onMaking());
      command.addListener("checkEnvironment", e => this._appCompiling(e.getData().application, e.getData().environment));
    },
    
    _onMaking() {
    },
    
    __diySassCompilerExample() {
      // The "making" event can be fired more than once (eg when watching) so we want to start our own
      //  sass watch once
      if (this.__startedSassWatch)
        return;
      let command = this.getCompilerApi().getCommand();
      
      // Figure out the command line to execute
      let sassType = "update";
      if (command.argv.watch) {
        this.__startedSassWatch = true;
        sassType = "watch";
      }
      
      let qxLibrary = command.getLibraries()["qx"];
      let qxPath = qxLibrary.getRootDir();
      let cmd = `sass -C -t compressed -I ${qxPath}/source/resource/qx/mobile/scss -I ${qxPath}/source/resource/qx/scss --${sassType}`;
      Object.values(command.getLibraries()).forEach(library => {
        let name = library.getNamespace();
        if (fs.existsSync(`source/theme/${name}/scss`))
          cmd += ` source/theme/${name}/scss:source/resource/${name}/css` 
      });
      
      // Helper method to output from the sass command to the console
      const writeOutput = stdio => {
        if (stdio.stdout)
          console.log(stdio.stdout.toString());
        if (stdio.stderr)
          console.log(stdio.stderr.toString());
      };
      
      // Run Sass; we don't wait for the process to end because it won't if we're using watching
      runscript(cmd, {
          stdio: 'pipe'
        })
        .then(stdio => {
          console.log('Run "%s"', cmd);
          writeOutput(stdio);
        })
        .catch(err => {
          console.error(err.toString());
          writeOutput(err.stdio);
        });

      // Return null to suppress warning about promise created but not waited for
      return null;
    },
    
    _appCompiling(application, environment) {
      environment.testappLibraryApi = "one";
    }
  }
});

module.exports = {
    LibraryApi: qxl.compilertests.testapp.LibraryApi,
    CompilerApi: qxl.compilertests.testapp.CompilerApi
};
