qx.Class.define("qx.html2.event.AbstractEventHandler",
{
  extend : qx.core.Object,

  type : "abstract",

  construct : function(eventCallBack)
  {
    this.base(arguments);
    this._callback = eventCallBack;
  },

  members :
  {

    /**
     * @internal
     * @param element {Element}
     * @param eventMap {Map}
     */
    attachEvents : function(element, eventMap)
    {
      var addEvent = qx.html2.Event.nativeAddEventListener;
      for (var type in eventMap)
      {
        addEvent(
          element,
          type,
          eventMap[type]
        );
      }
    },


    /**
     * @internal
     * @param element {Element}
     * @param eventMap {Map}
     */
    detachEvents : function(element, eventMap)
    {
      var removeEvent = qx.html2.Event.nativeRemoveEventListener
      for (var type in this.__keyHandler)
      {
        removeEvent(
          element,
          type,
          eventMap[type]
        );
      }
    }


  }
});
