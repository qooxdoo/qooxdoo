
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
     * @param elementHash {var} TODOC
     * @param domEvent {var} TODOC
     * @param eventType {var} TODOC
     * @param target {var} TODOC
     * @return {var} TODOC
     */
    getInstance : function(elementHash, domEvent, eventType, target)
    {
      if (this.__instance == undefined) {
        this.__instance = new qx.html2.event.MouseEvent();
      }

      this.__instance.__initEvent(elementHash, domEvent, eventType, target);
      return this.__instance;
    }
  },

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param elementHash {var} TODOC
     * @param domEvent {var} TODOC
     * @param eventType {var} TODOC
     * @param target {var} TODOC
     * @return {void}
     */
    __initEvent : function(elementHash, domEvent, eventType, target)
    {
      this.base(arguments, elementHash, domEvent);
      this._type = eventType;
      this._target = target;
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getType : function() {
      return this._type;
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getTarget : function() {
      return this._target || this.base(arguments);
    }
  }
});
