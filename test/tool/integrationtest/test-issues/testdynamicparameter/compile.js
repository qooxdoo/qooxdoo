const fs = require("fs");
const path = require("path");


qx.Class.define("testsimplecmd.SimpleCompilerApi", {
  extend: qx.tool.compiler.cli.api.CompilerApi,

  members: {
    async load() {
      let originalCreateCliCommand = qx.tool.compiler.cli.commands.Compile.createCliCommand;
      qx.tool.compiler.cli.commands.Compile.createCliCommand = async function(clazz) {
        let cmd = await originalCreateCliCommand.call(this, clazz);
        cmd.addFlag(
          new qx.tool.cli.Flag("simple").set({
            description: "A simple compiler flag",
            type: "boolean",
            value: false
          })
        );
        return cmd;
      }
      return this.base(arguments);
    }
  }
});      
          

qx.Class.define("testsimplecmd.SimpleLibraryApi", {
  extend: qx.tool.compiler.cli.api.LibraryApi,
  
  members: {
    /*
     * @Override
     */
    async initialize(rootCmd) {
      // Create a simple dynamic command with just one parameter
      rootCmd.addFlag(
        new qx.tool.cli.Flag("simple").set({
          description: "A simple library flag",
          type: "boolean"
        })
      );
    }
  }
});

module.exports = {
  CompilerApi: testsimplecmd.SimpleCompilerApi,
  LibraryApi: testsimplecmd.SimpleLibraryApi
};