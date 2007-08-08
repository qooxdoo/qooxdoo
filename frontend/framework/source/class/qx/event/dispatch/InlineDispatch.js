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
 * Event dispatcher for non bubbling events.
 *
 * @internal
 */
qx.Class.define("qx.event2.dispatch.InlineDispatch",
{

  extend : qx.core.Object,
  implement : qx.event2.dispatch.IEventDispatcher,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param manager {qx.event2.Manager} reference to the event manager using
   *     this class.
   */
  construct : function(manager) {
    this._manager = manager;
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Whether the dispatcher is responsible for the this event.
     *
     * @param event {qx.event2.type.Event} The event object
     * @param type {String} the event type
     * @return {Boolean} Whether the event dispatcher is responsible for the this event
     */
    canDispatchEvent : function(event, type) {
      return !event.getBubbles();
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
     * @param type {String} the event type
     */
    dispatchEvent : function(event, type)
    {
      event.setEventPhase(qx.event2.type.Event.AT_TARGET);

      var currentTarget = event.getCurrentTarget();

      var listeners = this._manager.registryGetListeners(currentTarget, type, false, false);
      if (!listeners) {
        return;
      }

      for (var i=0; i<listeners.length; i++)
      {
        var context = listeners[i].context || currentTarget;
        listeners[i].handler.call(context, event);
      }
    }

  }

});