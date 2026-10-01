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
qx.Class.define("qx.dev.unit.TestFunction", {
  extend: qx.core.Object,

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
  construct(testCase, methodName, testFunction) {
    super();
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

  properties: {
    /** The test function */
    testFunction: { check: "Function" },

    /** Name of the test */
    name: { check: "String" },

    /** Name of the class containing the test */
    className: {
      check: "String",
      init: ""
    },

    /** The test class */
    testClass: {
      check: "qx.dev.unit.TestCase",
      init: null
    }
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics: {
    /**
     * Turn the reason of a rejected promise into something that can be
     * thrown: objects are returned unchanged, other values are wrapped in
     * an <code>Error</code>.
     *
     * @param reason {var} The rejection reason
     * @return {Object} The value to throw
     */
    toError(reason) {
      if (reason !== null && typeof reason === "object") {
        return reason;
      }
      return new Error("Promise rejected: " + String(reason));
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /**
     * Runs the test and logs the test result to a {@link TestResult} instance,
     *
     * @param testResult {qx.dev.unit.TestResult} The class used to log the test result.
     */
    run(testResult) {
      var inst = this.getTestClass();
      var method = this.getName();

      inst.set({
        testFunc: this,
        testResult: testResult
      });

      testResult.run(this, () => this.callTestMethod());
    },

    /**
     * Call the test method on the test class. If the method returns a
     * promise (or any other thenable), the test waits until it settles: a
     * rejection is reported like an exception thrown by a synchronous test.
     * This works for native and for transpiled <code>async</code> methods.
     *
     * @return {var} The return value of the test method
     */
    callTestMethod() {
      var inst = this.getTestClass();
      var result = inst[this.getName()]();
      if (qx.lang.Type.isPromise(result)) {
        // a promise that settles after this test has timed out must not
        // resume the test that runs then
        var isCurrent = () => inst.getTestFunc() === this;
        result.then(
          function () {
            if (isCurrent()) {
              inst.resume();
            }
          },
          function (ex) {
            if (!isCurrent()) {
              return;
            }
            inst.resume(function () {
              // An AsyncWrapper (wait() called after an await) must pass
              // unchanged, so that TestResult starts a new wait
              throw qx.dev.unit.TestFunction.toError(ex);
            });
          }
        );

        inst.wait();
      }
      return result;
    },

    /**
     * Call the test class' <code>setUp</code> method.
     *
     * @return {var} The return value of <code>setUp</code>, e.g. a promise
     */
    setUp() {
      var inst = this.getTestClass();
      if (qx.lang.Type.isFunction(inst.setUp)) {
        return inst.setUp();
      }
      return undefined;
    },

    /**
     * Call the test class' <code>tearDown</code> method.
     *
     * @return {var} The return value of <code>tearDown</code>, e.g. a promise
     */
    tearDown() {
      var inst = this.getTestClass();
      if (qx.lang.Type.isFunction(inst.tearDown)) {
        return inst.tearDown();
      }
      return undefined;
    },

    /**
     * Get the full name of the test.
     *
     * @return {String} The test's full name
     */
    getFullName() {
      return [this.getClassName(), this.getName()].join(":");
    }
  }
});
