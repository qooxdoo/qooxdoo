qx.Class.define("testapp.TestThat1", {
  extend: qx.core.Object,
  
  members: {
    toHashCode() {
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


