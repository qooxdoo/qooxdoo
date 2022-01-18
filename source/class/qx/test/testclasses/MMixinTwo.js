qx.Mixin.define("qx.test.testclasses.MMixinTwo", {
  construct() {
    qx.core.Assert.assertTrue(this.state !== null);
    this.state.push("mixin-two");
  }
});
