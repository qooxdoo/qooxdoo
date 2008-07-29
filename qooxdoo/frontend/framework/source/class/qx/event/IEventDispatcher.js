/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * All event dispatcher must implement this interface. Event dispatcher must
 * register themselves at the event Manager using
 * {@link qx.event.Manager#addDispatcher}.
 */
qx.Interface.define("qx.event.IEventDispatcher",
{
  members:
  {
    /**
     * Whether the dispatcher is responsible for the this event.
     *
     * @param target {Element|qx.core.Event} The event dispatch target
     * @param event {qx.event.type.Event} The event object
     * @param type {String} the event type
     * @return {Boolean} Whether the event dispatcher is responsible for the this event
     */
    canDispatchEvent : function(target, event, type)
    {
      this.assertInstance(event, qx.event.type.Event);
      this.assertString(type);
    },


    /**
     * This function dispatches the event to the event listeners.
     *
     * @param target {Element|qx.core.Event} The event dispatch target
     * @param event {qx.event.type.Event} event object to dispatch
     * @param type {String} the event type
     */
    dispatchEvent : function(target, event, type)
    {
      this.assertInstance(event, qx.event.type.Event);
      this.assertString(type);
    }
  }
});
