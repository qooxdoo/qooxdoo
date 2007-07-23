qx.Class.define("qx.event2.AbstractEventManager",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    this.__eventHandlers = [];
  },

  members :
  {

    addEventHandler : function(handler) {
      this.__eventHandlers.push(handler);
    },



    /**
     * This method is called each time the an event listener for one of the
     * supported events is added using {qx.event2.Manager#addListener}.
     *
     * @param type {String} event type
     */
    _registerEventAtHandler : function(element, type) {
      // iterate over all event handlers and check whether they are responsible
      // for this event type
      for (var i=0; i<this.__eventHandlers.length; i++)
      {
        if (this.__eventHandlers[i].canHandleEvent(type))
        {
          this.__eventHandlers[i].registerEvent(element, type);
          break;
        }
      }
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is removed by using {qx.event2.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @param type {String} event type
     */
    _unregisterEventAtHandler : function(element, type)
    {
      for (var i=0; i<this.__eventHandlers.length; i++) {
        this.__eventHandlers[i].unregisterEvent(this._documentElement, type);
      }
    },


    /**
     * Removes all event handlers handles by the class from the DOM. This
     * function is called onunload of the the document.
     */
    removeAllListeners : function(doc)
    {
      for (var i=0; i<this.__eventHandlers.length; i++) {
        this.__eventHandlers[i].removeAllListeners();
      }
    }

  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.removeAllListeners();

    for (var i=0, a=this.__eventHandlers, l=a.length; i<l; i++) {
      this.__eventHandlers[i].dispose();
    }
  }

})