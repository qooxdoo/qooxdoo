qx.Class.define("qx.test.testclasses.DerivedClassIncluded", {
  extend: qx.test.testclasses.BaseClassIncluded,

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
