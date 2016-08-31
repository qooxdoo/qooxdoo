/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Test result class, which can export the results to JSUnit
 */
qx.Class.define("qx.dev.unit.JsUnitTestResult", {
  extend : qx.dev.unit.TestResult,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.__testFunctionNames = [];
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __testFunctionNames : null,

    /**
     * Run the test
     * @param test {TestFunction} The test.
     * @param testFunction {Function} A reference to a test function.
     */
    run : function(test, testFunction)
    {
      var testFunctionName = "$test_" + test.getFullName().replace(/\W/g, "_");
      this.__testFunctionNames.push(testFunctionName);
      window[testFunctionName] = testFunction;
    },


    /**
     * Export the test functions to JSUnit
     */
    exportToJsUnit : function()
    {
      var self = this;

      // global
      window.exposeTestFunctionNames = function() {
        return self.__testFunctionNames;
      };

      // global
      window.isTestPageLoaded = true;
    }
  }
});
