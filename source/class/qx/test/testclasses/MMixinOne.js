qx.Mixin.define("qx.test.testclasses.MMixinOne", {
  construct: function() {
    qx.core.Assert.assertTrue(this.state !== null);
    this.state.push("mixin-one");
  },
  
  members: {
    getSomething: function() {
      return "mixin-one";
    }
  }
});