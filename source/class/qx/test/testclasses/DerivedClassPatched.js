qx.Class.define("qx.test.testclasses.DerivedClassPatched", {
  extend: qx.test.testclasses.BaseClassPatched,
  
  construct: function() {
    this.base(arguments);
    this.state.push("derived");
  },
  
  members: {
    getSomething: function() {
      return this.base(arguments) + ":derived";
    }
  }
});