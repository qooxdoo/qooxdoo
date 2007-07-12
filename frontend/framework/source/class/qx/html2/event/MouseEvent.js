
/**
 * Mouse event object.
 *
 * the interface of this class is based on the DOM Level 2 mouse event
 * interface: http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-mouseevents
 */
qx.Class.define("qx.html2.event.MouseEvent",
{
  extend : qx.html2.event.Event,

  statics :
  {
    /**
     * TODOC
     *
     * @type static
     * @param domEvent {var} TODOC
     * @param eventType {var} TODOC
     * @param target {var} TODOC
     * @return {var} TODOC
     */
    getInstance : function(domEvent)
    {
      if (this.__instance == undefined) {
        this.__instance = new qx.html2.event.MouseEvent();
      }

      this.__instance.__initEvent(domEvent);
      return this.__instance;
    }
  },

  members :
  {

  }
});
