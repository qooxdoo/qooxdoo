qx.Class.define("qx.test.testclasses.RootClass", {
  extend: qx.core.Object,

  construct() {
    super();
    qx.core.Assert.assertTrue(this.state === null);
    this.state = ["root"];
  },

  members: {
    state: null,

    getSomething() {
      return "root";
    }
  }
});
