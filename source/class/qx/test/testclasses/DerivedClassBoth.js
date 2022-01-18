qx.Class.define("qx.test.testclasses.DerivedClassBoth", {
  extend: qx.test.testclasses.BaseClassBoth,

  construct() {
    super();
    this.state.push("derived");
  },

  members: {
    getSomething() {
      return super.getSomething() + ":derived";
    }
  }
});
