
qx.Class.define("qxunit.TestLoader", {

  extend: qx.application.Gui,

  statics :
  {
    getInstance : function()
    {
      return this.instance;
    }
  },


  properties :
  {
    suite : { check : "qxunit.TestSuite" }
  },


  members :
  {
    main : function()
    {
      this.base(arguments);
      qxunit.TestLoader.instance = this;

      var suite = new qxunit.TestSuite();
      suite.add(this.__getClassNameFromUrl());
      this.setSuite(suite);
      //suite.addPollutionCheck();

      if (window.top.jsUnitTestSuite) {
        this.runJsUnit();
        return;
      }

      if (window == window.top)
      {
        this.runStandAlone();
        return;
      }

    },


    __getClassNameFromUrl : function()
    {
      var params = window.location.search;
      var className = params.match(/[\?&]testclass=([A-Za-z0-9_\.]+)/);
      if (className) {
        className = className[1]
      } else {
        className = "__unknown_class__";
      }
      return className;
    },


    runJsUnit : function()
    {
      var testResult = new qxunit.JsUnitTestResult();
			this.getSuite().run(testResult);
      testResult.exportToJsUnit();
    },


    runStandAlone : function()
    {
      var testResult = new qxunit.TestResult();
      testResult.addEventListener("failure", function(e) {
      	var ex = e.getData().exception;
      	var test = e.getData().test;
      	this.error("Test '"+test.getFullName()+"' failed: " +  ex.getMessage() + " - " + ex.getComment());
      });
      testResult.addEventListener("error", function(e) {
      	var ex = e.getData().exception
      	this.error("The test '"+e.getData().test.getFullName()+"' had an error: " + ex, ex);
      });
      this.getSuite().run(testResult);
    },


    getTestDescriptions : function()
    {
    },

    runTests : function(testResult, className, methodName)
    {
    }


  }

});