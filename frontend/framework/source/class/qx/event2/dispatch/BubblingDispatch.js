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
 * Event dispatcher for all bubbling events.
 *
 * @internal
 */
qx.Class.define("qx.event2.dispatch.BubblingDispatch",
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
      return event.getBubbles();
    },


    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCH
    ---------------------------------------------------------------------------
    */

    /**
     * This function dispatches the event to the event handlers and emulates
     * the capturing and bubbling phase.
     *
     * @type member
     * @param event {qx.event2.type.Event} event object to dispatch
     */
    dispatchEvent : function(event)
    {
      var target = event.getTarget();
      var node = target;
      var type = event.getType();

      var manager = this._manager;

      var bubbleList = [];
      var bubbleTargets = [];

      var captureList = [];
      var captureTargets = [];

      // Walk up the tree and look for event listeners
      var arrayCopy = qx.lang.Array.copy;
      while (node != null)
      {
        if (node !== target)
        {
          var captureListeners = manager.registryGetListeners(node, type, true, false);

          if (captureListeners)
          {
            captureList.push(arrayCopy(captureListeners));
            //captureList.push((captureListeners));
            captureTargets.push(node);
          }
        }

        var bubbleListeners = manager.registryGetListeners(node, type, false, false);
        if (bubbleListeners)
        {
          bubbleList.push(arrayCopy(bubbleListeners));
          //bubbleList.push((bubbleListeners));
          bubbleTargets.push(node);
        }

        try {
          node = node.parentNode;
        } catch (vDomEvent) {
          node = null;
        }
      }

      // capturing phase
      event.setEventPhase(qx.event2.type.Event.CAPTURING_PHASE);

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

        if (event.getStopPropagation()) {
          return;
        }
      }


      // bubbling phase
      var BUBBLE_PHASE = qx.event2.type.Event.BUBBLING_PHASE;
      var AT_TARGET = qx.event2.type.Event.AT_TARGET;

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

        if (event.getStopPropagation()) {
          return;
        }
      }
    }

  }

});