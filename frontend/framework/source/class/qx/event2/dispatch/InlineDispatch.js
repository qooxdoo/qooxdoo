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

    canDispatchEvent : function(event) {
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
     */
    dispatchEvent : function(event)
    {
      event.setEventPhase(qx.event2.type.Event.AT_TARGET);

      var currentTarget = event.getCurrentTarget();

      var listeners = this._manager.registryGetListeners(currentTarget, event.getType(), false, false);
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
    }

  }

});