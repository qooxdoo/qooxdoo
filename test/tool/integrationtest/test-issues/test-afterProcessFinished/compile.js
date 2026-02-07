const fs = require("fs");
const path = require("path");

qx.Class.define("testAfterProcessFinished.CompilerApi", {
  extend: qx.tool.compiler.cli.api.CompilerApi,

  members: {
    async afterProcessFinished(cmd) {
      // Write marker file to confirm that the hook was called
      const markerPath = path.join(__dirname, "afterProcessFinished.marker");
      fs.writeFileSync(markerPath, `afterProcessFinished called with: ${cmd.classname}\n`);
      return this.base(arguments, cmd);
    }
  }
});

module.exports = {
  CompilerApi: testAfterProcessFinished.CompilerApi
};
