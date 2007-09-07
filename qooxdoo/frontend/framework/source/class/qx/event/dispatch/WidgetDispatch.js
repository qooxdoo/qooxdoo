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
 * This class dispatches bubbling events, which have widgets as targets.
 * The events bubble up the widget hierarchy.
 *
 * @internal
 */
qx.Class.define("qx.event.dispatch.WidgetDispatch",
{
  extend : qx.core.Object,
  implement : qx.event.IEventDispatcher,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param manager {qx.event.Manager} reference to the event manager using
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

    // interface implementation
    canDispatchEvent : function(target, event, type) {
      return (event.getBubbles() && target instanceof qx.ui.core.Widget);
    },


    // interface implementation
    dispatchEvent : function(target, event, type)
    {
      event.setEventPhase(qx.event.type.Event.AT_TARGET);

      var currentTarget = target;

      while (currentTarget)
      {
        var listeners = this._manager.registryGetListeners(currentTarget, type, false, false);
        if (!listeners) {
          listeners = [];
        }

        for (var i=0; i<listeners.length; i++)
        {
          var context = listeners[i].context || currentTarget;
          listeners[i].handler.call(context, event);
        }

        if (event.getPropagationStopped()) {
          return;
        }

        currentTarget = currentTarget.getParent();
        event.setCurrentTarget(currentTarget);
        event.setEventPhase(qx.event.type.Event.BUBBLING_PHASE);
      }
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    var manager = qx.event.Manager;
    manager.registerEventDispatcher(statics, manager.PRIORITY_FIRST);
  }
});