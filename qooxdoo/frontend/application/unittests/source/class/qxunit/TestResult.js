
qx.Class.define("qxunit.TestResult", {

  extend : qx.core.Target,

  events :
  {
    startTest : "qx.event.type.DataEvent",
    endTest : "qx.event.type.DataEvent",
    error : "qx.event.type.DataEvent",
    failure : "qx.event.type.DataEvent"
  },

  members :
  {
    run : function(test, testFunction)
    {
      this.createDispatchDataEvent("startTest", test);
      try
      {
        testFunction();
      }
      catch (e)
      {
        var error = true;
        if (e.classname == "qxunit.AssertionError") {
          this.__createError("failure", e, test);
        }
        else {
          this.__createError("error", e, test);
        }
      }
      if (!error) {
        this.createDispatchDataEvent("endTest", test);
      }
    },


    __createError : function(eventName, exception, test)
    {
      // WebKit and Opera
      var error = {
        exception: exception,
        test: test
      };
      this.createDispatchDataEvent(eventName, error);
      this.createDispatchDataEvent("endTest", test);
    }

  },

  statics :
  {
    run : function(testResult, test, testFunction)
    {
      testResult.run(test, testFunction);
    }
  }

});