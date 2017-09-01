qx.Class.define("testapp.plugins.PluginTwo", {
  extend: testapp.pdk.AbstractPlugin,
  
  members: {
    sayHello: function() {
      this.assertEquals("testapp.Application", testapp.Application.classname);
      return this.classname + ": Plugin Two Hello\n";
    }
  }
});
