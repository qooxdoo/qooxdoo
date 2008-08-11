/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Test result class, which can export the results to JSUnit
 */
qx.Class.define("qx.dev.unit.JsUnitTestResult",
{
  extend : qx.dev.unit.TestResult,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this._testFunctionNames = [];
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    run : function(test, testFunction)
    {
      var testFunctionName = "$test_" + test.getFullName().replace(/\W/g, "_");
      this._testFunctionNames.push(testFunctionName);
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
        return self._testFunctionNames;
      };

      // global
      window.isTestPageLoaded = true;
    }
  }
});
