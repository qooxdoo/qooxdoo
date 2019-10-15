qx.Class.define("qx.test.testclasses.BaseClassBoth", {
  extend: qx.test.testclasses.RootClass,
  include: [ qx.test.testclasses.MMixinOne ],
  
  construct: function() {
    this.base(arguments);
    this.state.push("base");
  },
  
  defer: function() {
    qx.Class.patch(qx.test.testclasses.BaseClassBoth, qx.test.testclasses.MMixinTwo);
  }
});