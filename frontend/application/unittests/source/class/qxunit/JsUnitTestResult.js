
qx.Class.define("qxunit.JsUnitTestResult", {

  extend : qxunit.TestResult,

  construct : function()
  {
    this.base(arguments);
    this._testFunctionNames = [];
  },

  members :
  {
    run : function(test, testFunction)
    {
      var testFunctionName = "$test_" + test.getName().replace(/\W/g, "_");
      this._testFunctionNames.push(testFunctionName);
      window[testFunctionName] = testFunction;
    },

    exportToJsUnit : function()
    {
      var self = this;

      // global
      window.exposeTestFunctionNames = function() {
        return self._testFunctionNames;
      }

      // global
      window.isTestPageLoaded = true;
    }
  }

});