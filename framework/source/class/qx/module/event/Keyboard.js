qx.Bootstrap.define("qx.module.event.Keyboard", {
  statics :
  {
    TYPES : ["keydown", "keypress", "keyup"],
    
    BIND_METHODS : ["getKeyIdentifier"],
    
    getKeyIdentifier : function()
    {
      return qx.event.util.Keyboard.keyCodeToIdentifier(this.keyCode);
    },
    
    normalize : function(event, element) {
      if (!event) {
        return event;
      }
      var bindMethods = qx.module.event.Keyboard.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") { 
          event[bindMethods[i]] = qx.module.event.Keyboard[bindMethods[i]].bind(event);
        }
      }
      
      return event;
    }
  },
  
  defer : function(statics) {
    q.registerEventNormalization(qx.module.event.Keyboard.TYPES, statics.normalize);
  }
});