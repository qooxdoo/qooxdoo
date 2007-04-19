
qx.Class.define("qxunit.TestLoader", {

  extend: qx.application.Gui,

  statics :
  {
    getInstance : function()
    {
      return this.instance;
    }
  },

  members :
  {
    main : function()
    {
      this.base(arguments);
      qxunit.TestLoader.instance = this;

      var suite = new qxunit.TestSuite();
      suite.add(this.getClassNameFromUrl());
      //suite.addPollutionCheck();

      if (window.top.jsUnitTestSuite) {
        var testResult = new qxunit.JsUnitTestResult();
				suite.run(testResult);
        testResult.exportToJsUnit();
      } else {
        var testResult = new qxunit.TestResult();
        testResult.addEventListener("failure", function(e) {
        	var ex = e.getData().exception;
        	var test = e.getData().test;
        	this.error("Test '"+test.getName()+"' failed: " +  ex.getMessage() + " - " + ex.getComment());
        });
        testResult.addEventListener("error", function(e) {
        	var ex = e.getData().exception
        	this.error("The test '"+e.getData().test.getName()+"' had an error: " + ex, ex);
        });
        suite.run(testResult);
      }
    },

    getClassNameFromUrl : function()
    {
      var params = window.location.search;
      var className = params.match(/[\?&]testclass=([A-Za-z0-9_\.]+)/);
      if (className) {
        className = className[1]
      } else {
        className = "__unknown_class__";
      }
      return className;
    }

  }

});