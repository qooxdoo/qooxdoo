
qx.Class.define("qxunit.TestFunction", {

  extend : qx.core.Object,

  /**
   * @param clazz {Class?null}
   * @param methodName {String?null}
   * @param testFunction {Function?null}
   */
  construct : function(clazz, methodName, testFunction)
  {
    if (testFunction)
    {
      this.setTestFunction(testFunction);
    }
    else {
      this.setTestFunction( function() {
        var cls = new clazz;
        if (typeof(cls.setUp) == "function") {
          cls.setUp();
        }
        cls[methodName]();
        if (typeof(cls.tearDown) == "function") {
          cls.tearDown();
        }
      });
    }

    if (clazz) {
      this.setClassName(clazz.classname);
    }
    this.setName(methodName);
  },

  properties : {
    testFunction : { check : "Function"},
    name : { check : "String"},
    className : { check : "String", init : ""}
  },

  members :
  {
    run : function(testResult) {
      testResult.run(this, this.getTestFunction());
    },

    getFullName : function()
    {
      return [this.getClassName(), this.getName()].join(":");
    }
  }

});