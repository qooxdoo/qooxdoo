qx.Class.define("qx.test.testclasses.DerivedClassBoth", {
  extend: qx.test.testclasses.BaseClassBoth,
  
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