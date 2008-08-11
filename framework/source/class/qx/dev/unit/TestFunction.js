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
 * Wrapper object for a method containing unit test code.
 */
qx.Class.define("qx.dev.unit.TestFunction",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * There are two ways to define a test function. First by passing a class
   * and a method name to the contructor or second by giving a the method
   * directly.
   *
   * @param clazz {Class?null} The test class, which contains the test method
   * @param methodName {String?null} The name of the method
   * @param testFunction {Function?null} A reference to a test function. If this
   *    parameter is set the other parameters are ignored.
   */
  construct : function(clazz, methodName, testFunction)
  {
    if (testFunction) {
      this.setTestFunction(testFunction);
    }
    else
    {
      this.setTestFunction(function()
      {
        var cls = new clazz;

        if (typeof (cls.setUp) == "function") {
          cls.setUp();
        }

        try {
            cls[methodName]();
        } catch (e) {
            throw e;
        } finally {
            // tearDown should always be called.
            if (typeof (cls.tearDown) == "function") {
              cls.tearDown();
            }
        }

      });
    }

    if (clazz) {
      this.setClassName(clazz.classname);
    }

    this.setName(methodName);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The test function */
    testFunction : { check : "Function" },

    /** Name of the test */
    name : { check : "String" },

    /** Name of the class containing the test */
    className :
    {
      check : "String",
      init  : ""
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
     * Runs the test and logs the test result to a {@link TestResult} instance,
     *
     * @param testResult {TestResult} The class used to log the test result.
     */
    run : function(testResult) {
      testResult.run(this, this.getTestFunction());
    },


    /**
     * Get the full name of the test.
     *
     * @return {String} The test's full name
     */
    getFullName : function() {
      return [ this.getClassName(), this.getName() ].join(":");
    }
  }
});
