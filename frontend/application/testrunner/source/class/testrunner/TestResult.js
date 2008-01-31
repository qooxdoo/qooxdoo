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

qx.Class.define("testrunner.TestResult",
{
  extend : qx.core.Target,



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    startTest : "qx.event.type.DataEvent",
    endTest   : "qx.event.type.DataEvent",
    error     : "qx.event.type.DataEvent",
    failure   : "qx.event.type.DataEvent"
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * TODOC
     *
     * @type static
     * @param testResult {var} TODOC
     * @param test {var} TODOC
     * @param testFunction {var} TODOC
     * @return {void}
     */
    run : function(testResult, test, testFunction) {
      testResult.run(test, testFunction);
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
     * TODOC
     *
     * @type member
     * @param test {var} TODOC
     * @param testFunction {var} TODOC
     * @return {void}
     */
    run : function(test, testFunction)
    {
      this.createDispatchDataEvent("startTest", test);

      try {
        testFunction();
      }
      catch(e)
      {
        var error = true;

        if (e.classname == "testrunner.AssertionError") {
          this.__createError("failure", e, test);
        } else {
          this.__createError("error", e, test);
        }
      }

      if (!error) {
        this.createDispatchDataEvent("endTest", test);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param eventName {var} TODOC
     * @param exception {var} TODOC
     * @param test {var} TODOC
     * @return {void}
     */
    __createError : function(eventName, exception, test)
    {
      // WebKit and Opera
      var error =
      {
        exception : exception,
        test      : test
      };

      this.createDispatchDataEvent(eventName, error);
      this.createDispatchDataEvent("endTest", test);
    }
  }
});
