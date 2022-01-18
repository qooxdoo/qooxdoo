qx.Mixin.define("qx.test.testclasses.MMixinOne", {
  construct() {
    qx.core.Assert.assertTrue(this.state !== null);
    this.state.push("mixin-one");
  },

  members: {
    getSomething() {
      return "mixin-one";
    }
  }
});
