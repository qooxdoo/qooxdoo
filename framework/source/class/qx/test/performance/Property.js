qx.Class.define("qx.test.performance.Property",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMeasure,

  members :
  {
    SET_ITERATIONS : 1000000,


    testPropertySet : function()
    {
      var Clazz = qx.Class.define(null, {
        properties: {
          alpha: {
            init: null,
            nullable: true,
            check: "String",
            event: "changeAlpha"
          }
        }
      });
      var obj = new Clazz();
      var self = this;
      this.measure(
        "create qx.core.Object",
        function() {
          for (var i=0; i<self.SET_ITERATIONS; i++) {
            obj.setAlpha("value #" + i);
          }
        },
        function() {
          obj.dispose();
        },
        this.SET_ITERATIONS
      );
    }
  }
});