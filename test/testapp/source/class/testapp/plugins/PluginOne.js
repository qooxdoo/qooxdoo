qx.Class.define("testapp.plugins.PluginOne", {
  extend: testapp.pdk.AbstractPlugin,
  
  members: {
    sayHello: function() {
      this.assertEquals("testapp.Application", testapp.Application.classname);
      return this.classname + ": Plugin One Hello\n";
    }
  }
});
