qx.Class.define("qx.event2.handler.ObjectEventHandler",
{
  extend : qx.event2.handler.AbstractEventHandler,

  members :
  {
    // overridden
    canHandleEvent : function(element, type) {
      return element instanceof qx.core.Object;
    },

    // overridden
    registerEvent : function(element, type) {},

    // overridden
    unregisterEvent : function(element, type) {},

    // overridden
    removeAllListeners : function() {}

  }

});