qx.Class.define("testapp.pdk.AbstractPlugin", {
  extend: qx.core.Object,
  
  members: {
    sayHello: function() {
      this.assertEquals("testapp.Application", testapp.Application.classname);
      return this.classname + ": Abstract Hello";
    }
  }
});
