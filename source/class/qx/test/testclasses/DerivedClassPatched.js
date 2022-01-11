qx.Class.define("qx.test.testclasses.DerivedClassPatched", {
  extend: qx.test.testclasses.BaseClassPatched,

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
