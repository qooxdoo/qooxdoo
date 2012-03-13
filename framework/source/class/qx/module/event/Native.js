qx.Bootstrap.define("qx.module.event.Native", {
  statics :
  {
    METHODS : ["getTarget", "getRelatedTarget", "preventDefault", "stopPropagation"],
    
    normalize : function(event) {
      var methods = qx.module.event.Native.METHODS;
      for (var i=0, l=methods.length; i<l; i++) {
        event[methods[i]] = qx.lang.Function.curry(qx.bom.Event[methods[i]], event);
      }
      
      return event;
    }
  },
  
  defer : function(statics) {
    q.registerEventNormalization("*", statics.normalize);
  }
});