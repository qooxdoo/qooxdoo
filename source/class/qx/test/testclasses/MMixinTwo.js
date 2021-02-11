qx.Mixin.define("qx.test.testclasses.MMixinTwo", {
  construct: function() {
    qx.core.Assert.assertTrue(this.state !== null);
    this.state.push("mixin-two");
  }
});