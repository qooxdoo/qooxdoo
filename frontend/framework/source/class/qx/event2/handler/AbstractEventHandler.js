/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Abstract base class for the special event handlers for mouse and key events.
 *
 * @internal
 */
qx.Class.define("qx.event2.handler.AbstractEventHandler",
{
  extend : qx.core.Object,
  type : "abstract",





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

    this._manager = manager;
    this.__registeredEvents = {};
    this._eventPool = qx.event2.type.EventPool.getInstance();
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.removeAllListeners();

    this._disposeFields(
      "_manager",
      "__registeredEvents"
    );

    this._disposeObjects("_eventPool");
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Whether the event handler can handle events of the given type.
     *
     * @param element {Element} DOM element to, which the event handler should
     *     be attached
     * @param type {String} event type
     * @return {Boolean} Whether the event handler can handle events of the
     *     given type.
     */
    canHandleEvent : function(element, type) {
      return false;
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is added using {qx.event2.Manager#addListener}.
     *
     * @param element {Element} DOM element to, which the event handler should
     *     be attached
     * @param type {String} event type
     */
    registerEvent : function(element, type) {
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
    unregisterEvent : function(element, type) {
    },


    /**
     * Removes all event handlers handled by the class from the DOM. This
     * function is called on unload of the the document.
     */
    removeAllListeners : function()
    {
      for (var id in this.__registeredEvents)
      {
        var eventData = this.__registeredEvents[id];
        qx.event2.Manager.removeNativeListener(
          eventData.element,
          eventData.type,
          eventData.listener
        );
      }
      this.__registeredEvents = {};
    },


    /**
     * Attach a a collection of event handlers to the element.
     *
     * @param element {Element} DOM elemnt the event handlers should be
     *     attached to.
     * @param eventMap {Map} Mapping of event types to event handler
     */
    _attachEvents : function(element, eventMap)
    {
      for (var type in eventMap) {
        this._managedAddNativeListener(element, type, eventMap[type]);
      }
    },


    /**
     * Detach a a collection of event handlers from the element.
     *
     * @param element {Element} DOM elemnt the event handlers should be
     *     attached to.
     * @param eventMap {Map} Mapping of event types to event handler
     */
    _detachEvents : function(element, eventMap)
    {
      for (var type in this.__keyHandler) {
        this._managedRemoveNativeListener(element, type, eventMap[type]);
      }
    },


    /**
     * Add an event listener from a DOM node a keep track of all events registered
     * using this class. This makes it easy to later cleanly remove all event
     * listeners. Derived classes should use this method in favour of
     * {@link qx.event2.Manager#addNativeListener}.
     *
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     */
    _managedAddNativeListener : function(element, type, listener)
    {
      qx.event2.Manager.addNativeListener(element, type, listener);
      var obj = qx.core.Object;
      var id = obj.toHashCode(element) + type + obj.toHashCode(listener);
      this.__registeredEvents[id] =
      {
        element : element,
        type : type,
        listener : listener
      };
    },


    /**
     * Remove an event listener from a DOM node a keep track of all events registered
     * using this class. This makes it easy to later cleanly remove all event
     * listeners. Derived classes should use this method in favour of
     * {@link qx.event2.Manager#removeNativeListener}.
     *
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     */
    _managedRemoveNativeListener : function(element, type, listener)
    {
      qx.event2.Manager.removeNativeListener(element, type, listener);
      var obj = qx.core.Object;
      var id = obj.toHashCode(element) + type + obj.toHashCode(listener);
      delete(this.__registeredEvents[id]);
    }

  }

});
