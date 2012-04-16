qx.Bootstrap.define("qx.module.Environment", {
  statics :
  {
    get : function(key) {
      return qx.core.Environment.get(key);
    },

    add : function(key, value) {
      return qx.core.Environment.add(key, value);
    }
  },


  defer : function(statics) {
    // make sure the desired keys are available (browser.* and engine.*)
    qx.core.Environment.get("browser.name");
    qx.core.Environment.get("browser.version");
    qx.core.Environment.get("browser.quirksmode");
    qx.core.Environment.get("browser.documentmode");

    qx.core.Environment.get("engine.name");
    qx.core.Environment.get("engine.version");

    q.attachStatic({
      "env" : {get: statics.get, add: statics.add}
    });
  }
});