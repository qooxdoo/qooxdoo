qx.Bootstrap.define("qx.module.event.Native", {
  statics :
  {
    FORWARD_METHODS : ["getTarget", "getRelatedTarget", "preventDefault", "stopPropagation"],
    
    normalize : function(event, element) {
      var methods = qx.module.event.Native.FORWARD_METHODS;
      for (var i=0, l=methods.length; i<l; i++) {
        event[methods[i]] = qx.lang.Function.curry(qx.bom.Event[methods[i]], event);
      }
      
      event.getCurrentTarget = function()
      {
        return event.currentTarget || element;
      };
      
      return event;
    }
  },
  
  defer : function(statics) {
    q.registerEventNormalization("*", statics.normalize);
  }
});