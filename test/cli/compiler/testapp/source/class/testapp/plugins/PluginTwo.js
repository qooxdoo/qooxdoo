qx.Class.define("testapp.plugins.PluginTwo", {
  extend: testapp.pdk.AbstractPlugin,
  
  members: {
    sayHello: function() {
      this.assertEquals("testapp.Application", testapp.Application.classname);
      testapp.plugins.TwoAlpha;
      testapp.plugins.TwoBravo;
      testapp.plugins.TwoCharlie;
      return this.classname + ": Plugin Two Hello\n";
    }
  }
});
