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

/**
 * Event manager for all non bubbling events like scroll, focus, etc
 *
 * @internal
 */
qx.Class.define("qx.event2.InlineEventManager",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(manager)
  {
    this._manager = manager;

    // registry for inline events
    // structure: elementId -> type
    this.__inlineRegistry = {};

    // maps elementIDs to DOM elements
    this.__elementRegistry = new qx.util.manager.Object();
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /*
    ---------------------------------------------------------------------------
      ADD EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Handles adding of event listeners of non bubbling events by attaching the
     * event handler directly to the element.
     *
     * @type member
     * @param element {Element} DOM element to attach the event on.
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *       the event listener.
     * @return {void}
     */
    addListener : function(element, type, listener, self)
    {
      var elementId = this.__elementRegistry.add(element);

      // create event listener entry for the element if needed.
      var reg = this.__inlineRegistry;

      if (!reg[elementId]) {
        reg[elementId] = {};
      }

      // create entry for the event type
      var elementEvents = reg[elementId];

      if (!elementEvents[type]) {
        elementEvents[type] = [];
      }

      // attach event handler if needed
      if (elementEvents[type].length == 0)
      {
        // inform the event handler about the new event
        // they perform the event registration at DOM level
        this._manager.registerEventAtHandler(element, type);
      }

      // store event listener
      elementEvents[type].push({
        handler: listener,
        context: self
      });
    },



    /*
    ---------------------------------------------------------------------------
      REMOVE EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Handles removal of non bubbling events.
     *
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     * @return {void}
     */
    removeListener : function(element, type, listener, useCapture)
    {
      var elementId = qx.core.Object.toHashCode(element);

      var elementData = this.__inlineRegistry[elementId];

      if (!elementData || !elementData[type]) {
        return;
      }

      var listeners = elementData[type];

      var removeIndex = -1;

      for (var i=0; i<listeners.length; i++)
      {
        if (listeners[i].$$original == listener)
        {
          removeIndex = i;
          break;
        }
      }

      if (removeIndex != -1)
      {
        qx.lang.Array.removeAt(listeners, removeIndex);

        if (listeners.length == 0)
        {
          this._manager.unregisterEventAtHandler(element, type);
          delete (elementData[type]);
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCH
    ---------------------------------------------------------------------------
    */

    /**
     * This function dispatches an  inline event to the event handlers.
     *
     * @type member
     * @param event {qx.event2.type.Event} event object to dispatch
     */
    dispatchEvent : function(event)
    {
      var target = event.getTarget();
      var elementId = qx.core.Object.toHashCode(target);

      var elementData = this.__inlineRegistry[elementId];
      if (!elementData || !elementData[event.getType()]) {
        return;
      }

      event.setEventPhase(qx.event2.type.Event.AT_TARGET);
      event.setCurrentTarget(target);

      var listeners = qx.lang.Array.copy(this.__inlineRegistry[elementId][event.getType()]);

      for (var i=0; i<listeners.length; i++) {
        var context = listeners[i].context || event.getCurrentTarget();
        listeners[i].handler.call(context, event);
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
    this._disposeFields("__inlineRegistry");
    this._disposeObjects("__elementRegistry");
  }

})