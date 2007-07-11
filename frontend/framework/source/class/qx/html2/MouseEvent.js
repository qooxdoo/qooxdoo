/**
 * Mouse event object.
 *
 * the interface of this class is based on the DOM Level 2 mouse event
 * interface: http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-mouseevents
 */
qx.Class.define("qx.html2.MouseEvent",
{
  extend : qx.html2.Event,

  statics :
  {
    getInstance : function(elementHash, domEvent, eventType, target)
    {
      if (this.__instance == undefined) {
        this.__instance = new qx.html2.MouseEvent();
      }
      this.__instance.__initEvent(elementHash, domEvent, eventType, target);
      return this.__instance;
    }
  },

  members :
  {
    __initEvent : function(elementHash, domEvent, eventType, target)
    {
      this.base(arguments, elementHash, domEvent);
      this._type = eventType;
      this._target = target;
    },


    // overridden
    getType : function() {
      return this._type;
    },

    // overridden
    getTarget : function() {
      return this._target || this.base(arguments);
    }
  }
});