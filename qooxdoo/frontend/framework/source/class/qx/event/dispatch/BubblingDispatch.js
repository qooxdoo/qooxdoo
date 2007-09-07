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
 * Event dispatcher for all bubbling events.
 *
 * @internal
 */
qx.Class.define("qx.event.dispatch.BubblingDispatch",
{
  extend : qx.core.Object,
  implement : qx.event.dispatch.IEventDispatcher,





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
    canDispatchEvent : function(target, event, type)
    {
      return event.getBubbles();
    },




    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCH
    ---------------------------------------------------------------------------
    */

    // interface implementation
    dispatchEvent : function(target, event, type)
    {
      var node = target;

      var manager = this._manager;

      var bubbleList = [];
      var bubbleTargets = [];

      var captureList = [];
      var captureTargets = [];

      // Walk up the tree and look for event listeners
      while (node != null)
      {
        if (node !== target)
        {
          var captureListeners = manager.registryGetListeners(node, type, true, false);

          if (captureListeners)
          {
            captureList.push(captureListeners);
            captureTargets.push(node);
          }
        }

        var bubbleListeners = manager.registryGetListeners(node, type, false, false);
        if (bubbleListeners)
        {
          bubbleList.push(bubbleListeners);
          bubbleTargets.push(node);
        }

        node = node.parentNode;
      }

      // capturing phase
      event.setEventPhase(qx.event.type.Event.CAPTURING_PHASE);

      for (var i=(captureList.length-1); i>=0; i--)
      {
        var currentTarget = captureTargets[i]
        event.setCurrentTarget(currentTarget);

        var captureListLength = captureList[i].length;
        for (var j=0; j<captureListLength; j++)
        {
          var callbackData = captureList[i][j];
          var context = callbackData.context || currentTarget;
          callbackData.handler.call(context, event);
        }

        if (event.getPropagationStopped()) {
          return;
        }
      }


      // bubbling phase
      var BUBBLE_PHASE = qx.event.type.Event.BUBBLING_PHASE;
      var AT_TARGET = qx.event.type.Event.AT_TARGET;

      for (var i=0, l=bubbleList.length; i<l; i++)
      {
        var currentTarget = bubbleTargets[i];
        event.setCurrentTarget(currentTarget);

        if (bubbleTargets[i] == target) {
          event.setEventPhase(AT_TARGET);
        } else {
          event.setEventPhase(BUBBLE_PHASE);
        }

        var bubbleListLength = bubbleList[i].length;
        for (var j=0; j<bubbleListLength; j++)
        {
          var callbackData = bubbleList[i][j];
          var context = callbackData.context || currentTarget;
          callbackData.handler.call(context, event);
        }

        if (event.getPropagationStopped()) {
          return;
        }
      }
    }
  }
});