qx.Bootstrap.define("qx.module.event.Native", {
  statics :
  {
    FORWARD_METHODS : ["getTarget", "getRelatedTarget"],
    
    BIND_METHODS : ["preventDefault", "stopPropagation"],
    
    preventDefault : function()
    {
      try {
        // this allows us to prevent some key press events in IE.
        // See bug #1049
        this.keyCode = 0;
      } catch(ex) {}

      this.returnValue = false;
    },
    
    stopPropagation : function()
    {
      this.cancelBubble = true;
    },
    
    normalize : function(event, element) {
      if (!event) {
        return event;
      }
      var fwdMethods = qx.module.event.Native.FORWARD_METHODS;
      for (var i=0, l=fwdMethods.length; i<l; i++) {
        event[fwdMethods[i]] = qx.lang.Function.curry(qx.bom.Event[fwdMethods[i]], event);
      }
      
      var bindMethods = qx.module.event.Native.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") { 
          event[bindMethods[i]] = qx.module.event.Native[bindMethods[i]].bind(event);
        }
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