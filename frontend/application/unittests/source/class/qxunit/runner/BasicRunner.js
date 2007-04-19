
qx.Class.define("qxunit.runner.BasicRunner", {

  extend : qx.ui.layout.VerticalBoxLayout,

  construct : function()
  {
    this.base(arguments);

    this.set({
      height : "100%",
      width : "100%"
    });

    /*
    var iframe = new qx.ui.embed.Iframe("html/QooxdooTest.html?testclass=qxunit.test");
    iframe.set({
      height: 100,
      width: 300
    });
    this.add(iframe);
    */

    var loader = qxunit.runner.TestLoaderStub.getInstance();
    this.debug(qx.io.Json.stringify(loader.getTestDescriptions()));

    var testResult = new qxunit.TestResult();
    testResult.addEventListener("startTest", function(e) {
    	var test = e.getData();
    	this.debug("Test '"+test.getFullName()+"' started.");
    });
    testResult.addEventListener("failure", function(e) {
    	var ex = e.getData().exception;
    	var test = e.getData().test;
    	this.error("Test '"+test.getFullName()+"' failed: " +  ex.getMessage() + " - " + ex.getComment());
    });
    testResult.addEventListener("error", function(e) {
    	var ex = e.getData().exception
    	this.error("The test '"+e.getData().test.getFullName()+"' had an error: " + ex, ex);
    });

    loader.runTests(testResult, "qxunit.test.Lang");
    loader.runTests(testResult, "qxunit.test.Xml", "testParseSerializeXml");

  }

});