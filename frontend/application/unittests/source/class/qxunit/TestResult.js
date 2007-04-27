
qx.Class.define("qxunit.TestResult", {

  extend : qx.core.Target,

  construct : function()
  {
    this.setFailures([]);
    this.setErrors([]);
  },

  events :
  {
    startTest : "qx.event.type.DataEvent",
    endTest : "qx.event.type.DataEvent",
    error : "qx.event.type.DataEvent",
    failure : "qx.event.type.DataEvent"
  },

  properties :
  {
    failures : { check : "Array" },
    errors : { check : "Array" }
  },

  members :
  {
    run : function(test, testFunction) {
      this.createDispatchDataEvent("startTest", test);
      try
      {
        testFunction();
      } catch (e) {
        if (e.classname == "qxunit.AssertionError") {
          var failure = { exception : e, test : test};
          this.getFailures().push(failure);
          this.createDispatchDataEvent("failure", failure);
        } else {
          var error = { exception : e, test : test};
          this.getErrors().push(error);
          this.createDispatchDataEvent("error", error);
        }
      }
      this.createDispatchDataEvent("endTest", test);
    }
  }

});