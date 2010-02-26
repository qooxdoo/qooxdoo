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

qx.Class.define("performance.Application",
{
  extend : qx.application.Standalone,

  properties :
  {
    /** The test suite */
    suite :
    {
      check    : "qx.dev.unit.TestSuite",
      nullable : true
    }
  },


  members :
  {
    // overridden
    main : function()
    {
      this.base(arguments);

      // Dependencies to loggers
      qx.log.appender.Native;
      qx.log.appender.Console;

      this.setTestNamespace(this.__getClassNameFromUrl());
      this.runStandAlone();
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
     * Run tests as standalone application
     */
    runStandAlone : function()
    {
      //this.info(this.getTestDescriptions());
      var testResult = new qx.dev.unit.TestResult();

      testResult.addListener("failure", function(e)
      {
        var ex = e.getData().exception;
        var test = e.getData().test;
        this.error("Test '" + test.getFullName() + "' failed: " + ex.message + " - " + ex.getComment());
        this.error("Stack trace: " + ex.getStackTrace().join("\n"));
      });

      testResult.addListener("error", function(e)
      {
        var ex = e.getData().exception;
        this.error("The test '" + e.getData().test.getFullName() + "' had an error: " + ex, ex);
      });

      testResult.addListener("startTest", function(e)
      {
        var test = e.getData();
//        this.info("Running: " + test.getFullName());
      });

      testResult.addListener("endTest", function(e) {
        runNextTest();
      });

      var tests = [];
      
      var classes = this.getSuite().getTestClasses();
      for (var i=0; i<classes.length; i++) {
        qx.lang.Array.append(tests, classes[i].getTestMethods());
      }
      
      var self = this;
      function runNextTest()
      {
        if (tests.length == 0) {
          self.info("--- DONE " + (new Date() - start) + "ms");
          return;
        }
        var test = tests.shift();
        test.run(testResult);
      }
      
      var start = new Date();
      runNextTest();
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
    }    
  }
});
