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

qx.Class.define("testrunner.JsUnitTestResult",
{
  extend : testrunner.TestResult,



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
    /**
     * TODOC
     *
     * @type member
     * @param test {var} TODOC
     * @param testFunction {var} TODOC
     * @return {void}
     */
    run : function(test, testFunction)
    {
      var testFunctionName = "$test_" + test.getFullName().replace(/\W/g, "_");
      this._testFunctionNames.push(testFunctionName);
      window[testFunctionName] = testFunction;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
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
