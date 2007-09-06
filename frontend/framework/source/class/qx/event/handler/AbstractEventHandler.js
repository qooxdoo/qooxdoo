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

/* ************************************************************************

#module(event2)

************************************************************************ */


/**
 * Abstract base class for the special event handlers for mouse and key events.
 *
 * @internal
 */
qx.Class.define("qx.event.handler.AbstractEventHandler",
{
  extend : qx.core.Object,
  implement : qx.event.handler.IEventHandler,
  type : "abstract",





  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param manager {qx.event.Manager} reference to the event manager using
   *     this class.
   */
  construct : function(manager)
  {
    this.base(arguments);

    this._manager = manager;
    this.__registeredEvents = {};
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  // TODO: destruct() to bottom, please
  destruct : function()
  {
    this.removeAllListeners();

    this._disposeFields(
      "_manager",
      "__registeredEvents"
    );
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    // interface implementation
    canHandleEvent : function(target, type) {
      return false;
    },


    // interface implementation
    registerEvent : function(target, type) {
    },


    // interface implementation
    unregisterEvent : function(target, type) {
    },


    // interface implementation
    removeAllListeners : function()
    {
      for (var id in this.__registeredEvents)
      {
        var eventData = this.__registeredEvents[id];

        qx.event.Manager.removeNativeListener(
          eventData.element,
          eventData.type,
          eventData.listener
        );
      }

      this.__registeredEvents = {};
    },


    /**
     * Attach a collection of event handlers to the element.
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
     * Detach a collection of event handlers from the element.
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


    // TODO: Is the unmanaged event handling in qx.event.Manager still needed?
    // Just curious. We create wrappers around wrappers around wrappers which
    // slows down the whole thing. A small diet could work out wonders here.

    /**
     * Add an event listener from a DOM node a keep track of all events registered
     * using this class. This makes it easy to later cleanly remove all event
     * listeners. Derived classes should use this method in favour of
     * {@link qx.event.Manager#addNativeListener}.
     *
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     */
    _managedAddNativeListener : function(element, type, listener)
    {
      qx.event.Manager.addNativeListener(element, type, listener);

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
     * {@link qx.event.Manager#removeNativeListener}.
     *
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     */
    _managedRemoveNativeListener : function(element, type, listener)
    {
      qx.event.Manager.removeNativeListener(element, type, listener);

      var obj = qx.core.Object;
      var id = obj.toHashCode(element) + type + obj.toHashCode(listener);

      delete this.__registeredEvents[id];
    }
  }
});
