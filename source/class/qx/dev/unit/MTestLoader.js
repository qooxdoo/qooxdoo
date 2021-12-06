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
 * This mixin contains the methods needed to implement a loader that will
 * create a suite of unit tests from a given namespace and run it directly or
 * provide the necessary information to a more advanced runner application
 */
qx.Mixin.define("qx.dev.unit.MTestLoader", {

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The test suite */
    suite : {
      check    : "qx.dev.unit.TestSuite",
      nullable : true,
      init : null
    }
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  members :
  {
    /**
     * Parses the url parameters and tries to find the classes to test.
     * The pattern is like <code>index.html?testclass=qx.test</code>
     *
     * @return {String} the class/namespace to test
     */
    _getClassNameFromUrl : function()
    {
      var params = window.location.search;
      var className = params.match(/[\?&]testclass=([A-Za-z0-9_\.]+)/);

      if (className) {
        className = className[1];
      } else {
        className = "__unknown_class__";
      }

      return className;
    },


    /**
     * Sets the top level namespace of the test cases to test. All classes
     * below this namespace extending {@link TestCase} will be tested.
     *
     * @param namespace {Object} Namespace to add
     */
    setTestNamespace : function(namespace)
    {
      var suite = new qx.dev.unit.TestSuite();
      suite.add(namespace);
      this.setSuite(suite);
    },


    /**
     * Run all tests and export the results to JSUnit
     */
    runJsUnit : function()
    {
      var testResult = new qx.dev.unit.JsUnitTestResult();
      this.getSuite().run(testResult);
      testResult.exportToJsUnit();
    },


    /**
     * Run tests as standalone application
     */
    runStandAlone : function()
    {
      var testResult = new qx.dev.unit.TestResult();

      testResult.addListener("failure", function(e)
      {
        var ex = e.getData()[0].exception;
        var test = e.getData()[0].test;
        this.error("Test '" + test.getFullName() + "' failed: " + ex.message + " - " + ex.getComment());
        if (ex.getStackTrace) {
          this.error("Stack trace: " + ex.getStackTrace().join("\n"));
        }
      }, this);

      testResult.addListener("error", function(e)
      {
        var ex = e.getData()[0].exception;
        var test = e.getData()[0].test;
        this.error("The test '" + test.getFullName() + "' had an error: " + ex, ex);
      }, this);

      this.getSuite().run(testResult);
    },


    /**
     * Get a list of test descriptions
     *
     * @return {String} A description of all tests.
     */
    getTestDescriptions : function()
    {
      var desc = [];
      var classes = this.getSuite().getTestClasses();

      for (var i=0; i<classes.length; i++)
      {
        var cls = classes[i];
        var clsDesc = {};
        clsDesc.classname = cls.getName();
        clsDesc.tests = [];
        var methods = cls.getTestMethods();

        for (var j=0; j<methods.length; j++) {
          clsDesc.tests.push(methods[j].getName());
        }

        desc.push(clsDesc);
      }

      return qx.lang.Json.stringify(desc);
    },


    /**
     * Runs exactly one test from the test suite
     *
     * @param testResult {qx.dev.unit.TestResult} the result logger
     * @param className {String} Name of the test class
     * @param methodName {String} Name of the test method
     */
    runTests : function(testResult, className, methodName)
    {
      var classes = this.getSuite().getTestClasses();

      for (var i=0; i<classes.length; i++)
      {
        if (className == classes[i].getName())
        {
          var methods = classes[i].getTestMethods();

          for (var j=0; j<methods.length; j++)
          {
            if (methodName && methods[j].getName() != methodName) {
              continue;
            }

            methods[j].run(testResult);
          }

          return;
        }
      }
    },


    /**
     * Runs all tests inside of the given namespace
     *
     * @param testResult {qx.dev.unit.TestResult} the result logger
     * @param namespaceName {String} Namespace of the tests to run
     */
    runTestsFromNamespace : function(testResult, namespaceName)
    {
      var classes = this.getSuite().getTestClasses();

      for (var i=0; i<classes.length; i++)
      {
        if (classes[i].getName().indexOf(namespaceName) == 0) {
          classes[i].run(testResult);
        }
      }
    }
  }
});
