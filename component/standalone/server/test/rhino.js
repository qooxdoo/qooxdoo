// Rhino-specific tests for qx-oo

load(['script/testrunner.js']);
load(['../script/qx-oo-2.1.1.js']);
load(['tests-common.js']);

testrunner.define({

  classname : "Rhino",

  setUp : function()
  {
    var envName = qx.core.Environment.get("runtime.name");
    if (envName !== "rhino") {
      this.skip("Skipping test: Expected runtime.name to be 'rhino' but found " + envName);
    }
  },

  testFoo : function()
  {
    print("Hello Rhino");
  }
});


testrunner.runner.TestRunnerBasic.start();