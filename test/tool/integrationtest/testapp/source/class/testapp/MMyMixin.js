qx.Mixin.define("testapp.MMyMixin", qx.core.Environment.select("test.isTrue", {
  "true" : {
    members: {
      mixedInFunction: function() {
        return "mixedInIsTrue";
      }
    }
  },
  "false" : {
    members: {
      mixedInFunction: function() {
        return "mixedInIsFalse";
      }
    }
  }
}));