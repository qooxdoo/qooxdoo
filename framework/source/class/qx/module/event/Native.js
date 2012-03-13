qx.Bootstrap.define("qx.module.event.Native", {
  statics :
  {
    normalize : function(event) {
      event.getTarget = qx.lang.Function.curry(qx.bom.Event.getTarget, event);
      event.getRelatedTarget = qx.lang.Function.curry(qx.bom.Event.getRelatedTarget, event);
      
      return event;
    }
  },
  
  defer : function(statics) {
    q.registerEventNormalization("*", statics.normalize);
  }
});