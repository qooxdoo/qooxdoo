qx.Bootstrap.define("qx.module.util.Type", {
  statics : {
    get : qx.Bootstrap.getClass
  },


  defer : function(statics) {
    q.attachStatic({
      type : {
        get : statics.get
      }
    });
  }
});
