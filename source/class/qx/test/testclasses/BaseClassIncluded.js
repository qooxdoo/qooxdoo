qx.Class.define("qx.test.testclasses.BaseClassIncluded", {
  extend: qx.test.testclasses.RootClass,
  include: [ qx.test.testclasses.MMixinOne, qx.test.testclasses.MMixinTwo ],
  
  construct: function() {
    this.base(arguments);
    this.state.push("base");
  }
  
});