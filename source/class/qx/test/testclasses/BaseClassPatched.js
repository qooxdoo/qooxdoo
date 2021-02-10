qx.Class.define("qx.test.testclasses.BaseClassPatched", {
  extend: qx.test.testclasses.RootClass,
  
  construct: function() {
    this.base(arguments);
    this.state.push("base");
  },
  
  defer: function() {
    qx.Class.patch(qx.test.testclasses.BaseClassPatched, qx.test.testclasses.MMixinOne);
    qx.Class.patch(qx.test.testclasses.BaseClassPatched, qx.test.testclasses.MMixinTwo);
  }
});