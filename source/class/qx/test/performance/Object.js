qx.Class.define("qx.test.performance.Object",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMeasure,

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
    },


    testToHashCode : function()
    {
      var objects = [];
      var self = this;
      this.measure(
        "toHashCode qx.core.Object",
        function() {
          for (var i=0; i<self.CREATE_ITERATIONS; i++) {
            var object = {};
            qx.core.ObjectRegistry.toHashCode(object);
            objects.push(object);
          }
        },
        function() {
          for (var i=0; i<objects.length; i++) {
            qx.core.ObjectRegistry.clearHashCode(objects[i]);
          }
        },
        this.CREATE_ITERATIONS
      );
    }
  }
});