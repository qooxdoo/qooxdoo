qx.Class.define("qx.test.testclasses.DerivedClassIncluded", {
  extend: qx.test.testclasses.BaseClassIncluded,
  
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