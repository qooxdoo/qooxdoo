qx.Class.define("testapp.TestThat2", {
  extend: qx.core.Object,
  
  members: {
    toHashCode: function() {
      var that = this;
      var other = that;
      var args = arguments;
      let fn = function() {
        other.base(arguments);
      };
      fn();
    }
  }
});


