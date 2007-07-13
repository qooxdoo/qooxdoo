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
 * This interface must be implemented by all special event handlers
 * like the key or mouse event handler.
 *
 * @internal
 */
qx.Interface.define("qx.html2.event.IEventHandler",
{
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
     * @param element {Element} DOM element to register an additional event for
     * @param type {String} event type
     */
    registerEvent : function(element, type) { return arguments.length == 2; },

    /**
     * Decrease the event count for this event type.
     *
     * @param element {Element} DOM element to register an additional event for
     * @param type {String} event type
     */
    unregisterEvent : function(element, type) { return arguments.length == 2; }

  }
});
