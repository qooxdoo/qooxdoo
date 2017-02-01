qx.Class.define("qx.test.performance.Property",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMeasure,

  members :
  {
    SET_ITERATIONS : 10000,


    testPropertySet : function()
    {
      var Clazz = qx.Class.define("demo.MyClass", {
        extend: qx.core.Object,
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
      obj.addListener("changeAlpha", function() {}, this);
      var self = this;
      this.measure(
        "property set",
        function() {
          for (var i=0; i<self.SET_ITERATIONS; i++) {
            obj.setAlpha("value #" + i);
          }
        },
        function() {
          obj.dispose();
          qx.Class.undefine("demo.MyClass");
        },
        this.SET_ITERATIONS
      );
    }
  }
});
