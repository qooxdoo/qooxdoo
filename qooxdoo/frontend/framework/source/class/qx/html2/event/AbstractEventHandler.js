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
qx.Class.define("qx.html2.event.AbstractEventHandler",
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
   * @param domDocument {Document} DOm document the events should be attached to
   */
  construct : function(eventCallBack, domDocument)
  {
    this.base(arguments);
    this._callback = eventCallBack;

    this._documentElement = domDocument ?
      domDocument.documentElement :
      window.document.documentElement;
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
    canHandleEvent : function(type) { return true; },


    /**
     * Increase the event count for this event type.
     *
     * @param type {String} event type
     */
    registerEvent : function(type) { return true },


    /**
     * Decrease the event count for this event type.
     *
     * @param type {String} event type
     */
    unregisterEvent : function(type) { return true; },


    /**
     * Attach a a collection of event handlers to the element.
     *
     * @param element {Element} DOM elemnt the event handlers should be
     *     attached to.
     * @param eventMap {Map} Mapping of event types to event handler
     */
    _attachEvents : function(element, eventMap)
    {
      var addEvent = qx.html2.Event.nativeAddEventListener;
      for (var type in eventMap)
      {
        addEvent(
          element,
          type,
          eventMap[type]
        );
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
      var removeEvent = qx.html2.Event.nativeRemoveEventListener
      for (var type in this.__keyHandler)
      {
        removeEvent(
          element,
          type,
          eventMap[type]
        );
      }
    }


  }
});
