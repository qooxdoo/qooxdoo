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
  extend : qx.event2.AbstractEventManager,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param manager {qx.event2.Manager} reference to the event manager using
   *     this class.
   */
  construct : function(manager)
  {
    this.base(arguments);

    this.addEventHandler(new qx.event2.handler.ObjectEventHandler(this.dispatchEvent, this));
    this.addEventHandler(new qx.event2.handler.InlineEventHandler(this.dispatchEvent, this));

    // registry for inline events
    // structure: elementId -> type
    this.__inlineRegistry = {};
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__inlineRegistry");
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
      // create event listener entry for the element if needed.
      var eventListeners = this.__getEventListeners(element, type, true);

      // this is the first event handler for this type and element
      if (eventListeners.length == 0)
      {
        // inform the event handler about the new event
        // they perform the event registration at DOM level
        this._registerEventAtHandler(element, type);
      }

      // store event listener
      eventListeners.push({
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
      // get event listeners
      var listeners = this.__getEventListeners(element, type, false);
      if (!listeners) {
        return;
      }

      // find listener
      var removeIndex = -1;
      for (var i=0; i<listeners.length; i++)
      {
        if (listeners[i].handler == listener)
        {
          removeIndex = i;
          break;
        }
      }

      // remove listener if found
      if (removeIndex != -1)
      {
        qx.lang.Array.removeAt(listeners, removeIndex);

        if (listeners.length == 0)
        {
          this._unregisterEventAtHandler(element, type);
          this.__registryRemoveType(element, type);
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
      event.setEventPhase(qx.event2.type.Event.AT_TARGET);
      event.setBubbles(false);

      var currentTarget = event.getCurrentTarget();

      var listeners = this.__getEventListeners(currentTarget, event.getType(), false);
      if (!listeners) {
        return;
      }

      // work on a copy of the event listener array to allow calls to removeListener
      // in custom event handlers.
      listeners = qx.lang.Array.copy(listeners);

      for (var i=0; i<listeners.length; i++)
      {
        var context = listeners[i].context || currentTarget;
        listeners[i].handler.call(context, event);
      }
    },


    /*
    ---------------------------------------------------------------------------
      REGISTRY HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * Get all event listeners for the given element and event type. If no
     * registray data is available for this element and type and the
     * third parameter <code>buildRegistry</code> is true the registry is build
     * up and an empty array is returned.
     *
     * @param element {Element} DOM element.
     * @param type {String} DOM event type
     * @param buildRegistry {Boolean?false} Whether to build up the registry if
     *     no entry is found
     * @return {Function[]|null} Array of registered event handlers for this event
     *     and type. Will return null if <code>buildRegistry</code> and no entry
     *     is found.
     */
    __getEventListeners : function(element, type, buildRegistry)
    {
      var elementId = qx.core.Object.toHashCode(element);
      var reg = this.__inlineRegistry;

      if (!reg[elementId])
      {
        if (buildRegistry) {
          reg[elementId] = {};
        } else {
          return null;
        }
      }

      // create entry for the event type
      var elementEvents = reg[elementId];

      if (!elementEvents[type]) {
        if (buildRegistry) {
          elementEvents[type] = [];
        } else {
          return null;
        }
      }

      return elementEvents[type];
    },


    /**
     * Remove the registry entry for the given event type from the event data of
     * the given element.
     *
     * @param element {Element} DOM element
     * @param type {String} DOM event type
     */
    __registryRemoveType : function(element, type)
    {
      var elementId = qx.core.Object.toHashCode(element);
      var reg = this.__inlineRegistry;

      if (!reg[elementId]) {
        return;
      }

      delete (reg[type]);
    }

  }

})