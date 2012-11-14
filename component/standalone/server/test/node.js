// node.js-specific tests for qx-oo

require('./script/testrunner.js');
var qx = require('../script/qx-oo-2.1.1.js');
require('./tests-common.js');

testrunner.define({

  classname : "NodeJs",

  setUp : function()
  {
    var envName = qx.core.Environment.get("runtime.name");
    if (envName !== "node.js") {
      this.skip("Skipping test: Expected runtime.name to be 'node.js' but found " + envName);
    }
  },

  testFoo : function()
  {
    console.log("Hello node.js");
  }
});


testrunner.runner.TestRunnerBasic.start();