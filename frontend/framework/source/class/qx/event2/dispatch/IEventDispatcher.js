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

#module(event2)

************************************************************************ */

/**
 * All event dispatcher must implement this interface. Event dispatcher must
 * register themselves at the event Manager using
 * {@link qx.event2.Manager#registerEventDispatcher}.
 */
qx.Interface.define("qx.event2.dispatch.IEventDispatcher",
{
  members:
  {

    /**
     * Whether the dispatcher is responsible for the this event.
     *
     * @param event {qx.event2.type.Event} The event object
     */
    canDispatchEvent : function(event) {
      return true;
    },


    /**
     * This function dispatches the event to the event listeners.
     *
     * @param event {qx.event2.type.Event} event object to dispatch
     */
    dispatchEvent : function(event) {
      return true;
    }

  }
});