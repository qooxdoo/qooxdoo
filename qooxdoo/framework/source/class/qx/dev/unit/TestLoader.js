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
 * The test loader is the base class of a native application, which can be used
 * to run tests from a non-GUI application or from within JSUnit.
 */
qx.Class.define("qx.dev.unit.TestLoader",
{
  extend : qx.application.Native,

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The test suite */
    suite :
    {
      check    : "qx.dev.unit.TestSuite",
      nullable : true
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    main : function()
    {
      this.base(arguments);

      this.setTestNamespace(this.__getClassNameFromUrl());

      if (window.top.jsUnitTestSuite)
      {
        this.runJsUnit();
        return;
      }

      if (window == window.top)
      {
        this.runStandAlone();
        return;
      }
    },


    /**
     * Parses the url parameters and tries to find the classes to test.
     * The pattern is like <code>index.html?testclass=qx.test</code>
     *
     * @return {String} the class/namespae to test
     */
    __getClassNameFromUrl : function()
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
      this.warn(this.getTestDescriptions());

      var testResult = new qx.dev.unit.TestResult();

      testResult.addListener("failure", function(e)
      {
        var ex = e.getData().exception;
        var test = e.getData().test;
        this.error("Test '" + test.getFullName() + "' failed: " + ex.getMessage() + " - " + ex.getComment());
        this.error("Stack trace: " + ex.getStackTrace().join("\n"));
      });

      testResult.addListener("error", function(e)
      {
        var ex = e.getData().exception;
        this.error("The test '" + e.getData().test.getFullName() + "' had an error: " + ex, ex);
      });

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

      return qx.util.Json.stringify(desc);
    },


    /**
     * Runs exactly one test from the test suite
     *
     * @param testResult {TestResult} the result logger
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
     * @param testResult {TestResult} the result logger
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
