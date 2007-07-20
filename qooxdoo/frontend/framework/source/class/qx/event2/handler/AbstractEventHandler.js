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
    this._window = manager.getWindow();
    this._documentElement = this._window.document.documentElement;
    this._elementRegistry = new qx.util.manager.Object();
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
     * This method is called each time the an event listener for one of the
     * supported events is added using {qx.event2.Manager#addListener}.
     *
     * @param type {String} event type
     */
    registerEvent : function(type) {
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is removed using {qx.event2.Manager#removeListener}.
     *
     * @param type {String} event type
     */
    unregisterEvent : function(type) {
    },


    /**
     * Removes all event handlers handles by the class from the DOM. This
     * function is called onunload of the the document.
     */
    removeAllListeners : function() {
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
    this._disposeFields("_callback", "_manager");
    this._disposeObjects("_elementRegistry");
  }

});
