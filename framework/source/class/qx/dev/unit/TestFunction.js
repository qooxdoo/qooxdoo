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
     * Daniel Wagner (d_wagner)

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
   * and a method name to the constructor or second by giving a the method
   * directly.
   *
   * @param testCase {qx.dev.unit.TestCase?null} The test class, which contains the test method
   * @param methodName {String?null} The name of the method
   * @param testFunction {Function?null} A reference to a test function. If this
   *    parameter is set the other parameters are ignored.
   */
  construct : function(testCase, methodName, testFunction)
  {
    if (testFunction) {
      this.setTestFunction(testFunction);
    }

    if (testCase) {
      this.setClassName(testCase.classname);
      this.setTestClass(testCase);
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
    },

    /** The test class */
    testClass :
    {
      check : "qx.dev.unit.TestCase",
      init : null
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
     * @param testResult {qx.dev.unit.TestResult} The class used to log the test result.
     */
    run : function(testResult)
    {
      var inst = this.getTestClass();
      var method = this.getName();

      inst.set({
        testFunc: this,
        testResult: testResult
      });

      testResult.run(this, function() {
        switch (inst[method].constructor.name) {
          case "Function":
            try {
              inst[method]();
            } catch (ex) {
              throw ex;
            }
            break;
          case "AsyncFunction":
            inst[method]()
            .then(
              function(){
                inst.resume()
              }
            )
            .catch(
              function(ex){
                inst.resume(function(){ throw ex });
              }
            );
            inst.wait();
        }
      });

    },

    /**
     * Call the test class' <code>setUp</code> method.
     */
    setUp : function()
    {
      var inst = this.getTestClass();
      if (qx.lang.Type.isFunction(inst.setUp)) {
        inst.setUp();
      }
    },

    /**
     * Call the test class' <code>tearDown</code> method.
     */
    tearDown : function()
    {
      var inst = this.getTestClass();
      if (qx.lang.Type.isFunction(inst.tearDown)) {
        inst.tearDown();
      }
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
