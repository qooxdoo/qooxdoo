/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Common base class for TestRunner views.
 */
qx.Class.define("testrunner.view.Abstract", {

  type : "abstract",

  extend : qx.core.Object,


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Event fired to instruct the TestRunner to start running the test suite */
    runTests : "qx.event.type.Event",

    /** Event fired to instruct the TestRunner to stop running the test suite */
    stopTests : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    /** Status message to be displayed in the view */
    status :
    {
      init : "",
      check : "String",
      apply : "_applyStatus"
    },

    /** The test suite's current state, synchronized with
      {@link testrunner.runner.TestRunner#testSuiteState} */
    testSuiteState :
    {
      init : "init",
      apply : "_applyTestSuiteState",
      event : "changeTestSuiteState"
    },

    /** Number of configured tests that haven't run yet. */
    testCount :
    {
      init : null,
      nullable : true,
      apply : "_applyTestCount",
      event : "changeTestCount"
    },

    /** Model object representing the test namespace. */
    testModel :
    {
      init : null,
      nullable : true,
      apply : "_applyTestModel"
    },

    /** List of tests selected by the user */
    selectedTests :
    {
      init : null,
      nullable : true,
      event : "changeSelectedTests"
    },

    /** URI of the application containing the test classes */
    autUri :
    {
      check : "String",
      nullable : true,
      event : "changeAutUri",
      apply : "_applyAutUri"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {
    /**
     * Add a listener to a TestResultData object to be informed of state changes.
     * @param testResultData {testrunner.unit.TestResultData}
     * Test result data object
     */
    addTestResult : function(testResultData)
    {
      testResultData.addListener("changeState", function(ev) {
        this._onTestChangeState(testResultData);
      }, this);
    },


    /**
     * Visualize TestResultData state changes.
     * @param testResultData {testrunner.unit.TestResultData}
     * Test result data object
     */
    _onTestChangeState : function(testResultData)
    {
      this.error("Missing implementation of _onTestChangeState!");
    },


    /**
     * Displays a status message.
     *
     * @param value {String} The message to be displayed
     * @param old {String} Previous value
     */
    _applyStatus : function(value, old)
    {
      this.info(value);
    },


    /**
     * Visualizes the current state of the test suite.
     *
     * @param value {String} The test suite's state, one of "init", "loading",
     * "ready", "running", "finished", "aborted", "error"
     * @param old {String} Previous value
     */
    _applyTestSuiteState : function(value, old)
    {
      this.info("Test suite state: " + value);
    },


    /**
     * Visualizes the amount of tests remaining.
     *
     * @param value {Integer} Number of pending tests
     * @param old {Integer} Previous value
     */
    _applyTestCount : function(value, old)
    {
      this.info(value + " tests pending.")
    },


    /**
     * Apply the test model: Build a list of tests in the GUI etc.
     *
     * @param value {Object} Test model object
     * @param old {Object} Previous value
     */
    _applyTestModel : function(value, old)
    {
      this.error("Missing implementation of _applyTestModel!");
    },


    /**
     * Applies the AUT's URI, e.g. by setting an Iframe's source
     *
     * @param value {String} AUT URI
     * @param old {String} Previous value
     */
    _applyAutUri : function(value, old)
    {}
  },

  destruct : function()
  {
    this.removeAllBindings();
  }

});
