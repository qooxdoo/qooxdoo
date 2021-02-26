qx.Class.define("testapp.test.TestInnerClasses", {
  extend: qx.dev.unit.TestCase,
  
  members: {
    funcOne: function() {
      return this.base(arguments);
    },
    funcTwo() {
      return this.base(arguments);
    },
    testInnerClasses() {
      var clazz = qx.Class.define("demo.MyClass", {
        extend: qx.core.Object,
        members: {
          toHashCode: function() {
            return this.base(arguments) + "";
          }
        }
      });
      
      var obj = new clazz();
      obj.toHashCode();
      qx.core.Assert.assertTrue(true);
    }
  }
});
