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
   * @param eventCallBack {Function} general event handler for all events
   *   handled by this event handler
   * @param manager {qx.event2.Manager} Reference to the event manager instance,
   *   which uses this EventHandler. The callback will be dispatched on this
   *   manager.
   */
  construct : function(eventCallBack, manager)
  {
    this.base(arguments);
    this._callback = eventCallBack;
    this._manager = manager;
    this._elementRegistry = new qx.event2.ObjectRegistry();
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
     * @param type {String} event type
     * @return {Boolean} Whether the event handler can handle events of the
     *     given type.
     */
    canHandleEvent : function(type) { 
      return false; 
    },


    /**
     * Increase the event count for this event type.
     *
     * @param element {Element} DOM element to register an additional event for
     * @param type {String} event type
     */
    registerEvent : function(element, type) { 
    },


    /**
     * Decrease the event count for this event type.
     *
     * @param element {Element} DOM element to register an additional event for
     * @param type {String} event type
     */
    unregisterEvent : function(element, type) {
    },


    /**
     * Removes all event handlers handles by the class from the DOM of the given
     * DOM document. This function is called onunload of the the document.
     *
     * @param documentElement {Element} The DOM documentelement of the document
     *     to remove the listeners from.
     */
    removeAllListenersFromDocument : function(documentElement) {
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
      var addEvent = qx.event2.Manager.addNativeListener;
      
      for (var type in eventMap) {
        addEvent(element, type, eventMap[type]);
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
      var removeEvent = qx.event2.Manager.removeNativeListener
      
      for (var type in this.__keyHandler) {
        removeEvent(element, type, eventMap[type]);
      }
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_callback", "_elementRegistry", "_manager");
  }

});
