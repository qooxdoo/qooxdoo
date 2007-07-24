/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

************************************************************************ */

/**
 * Abstract base class for the specialized event manager {@link InlineEventManager}
 * and {@link DocumentEventManager}.
 */
qx.Class.define("qx.event2.AbstractEventManager",
{
  extend : qx.core.Object,
  type : "abstract",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.__eventHandlers = [];
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjectDeep("__eventHandlers");
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Add an event handler to this event manager.
     *
     * @param handler {qx.event2.handler.AbstractEventHandler} handler to add.
     */
    addEventHandler : function(handler) {
      this.__eventHandlers.push(handler);
    },



    /**
     * This method is called each time the an event listener for one of the
     * supported events is added using {qx.event2.Manager#addListener}.
     *
     * @param element {Element} DOM element to, which the event handler should
     *     be attached
     * @param type {String} event type
     */
    _registerEventAtHandler : function(element, type) {
      // iterate over all event handlers and check whether they are responsible
      // for this event type
      for (var i=0; i<this.__eventHandlers.length; i++)
      {
        if (this.__eventHandlers[i].canHandleEvent(element, type))
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
     * @param element {Element} DOM element from, which the event handler should
     *     be removed
     * @param type {String} event type
     */
    _unregisterEventAtHandler : function(element, type)
    {
      for (var i=0; i<this.__eventHandlers.length; i++)
      {
        if (this.__eventHandlers[i].canHandleEvent(element, type)) {
          this.__eventHandlers[i].unregisterEvent(element, type);
          break;
        }
      }
    }

  }

})