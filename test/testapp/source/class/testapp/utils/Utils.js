qx.Class.define("testapp.utils.Utils", {
  extend: qx.core.Object,
  
  members: {
    sayHello: function() {
      return this.classname + ": Utils Hello";
    }
  }
});
