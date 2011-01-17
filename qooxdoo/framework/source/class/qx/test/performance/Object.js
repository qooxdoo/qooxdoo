qx.Class.define("qx.test.performance.Object",
{
  extend : qx.dev.unit.TestCase,
  include : qx.test.performance.MMeasure,

  members :
  {
    CREATE_ITERATIONS : 100000,


    testObjectCreate : function()
    {
      var objects = this.__objects = [];
      var self = this;
      this.measure(
        "create qx.core.Object",
        function() {
          for (var i=0; i<self.CREATE_ITERATIONS; i++) {
            objects.push(new qx.core.Object());
          }
        },
        function() {
          self._disposeArray("__objects");
        },
        this.CREATE_ITERATIONS
      );
    }
  }
});