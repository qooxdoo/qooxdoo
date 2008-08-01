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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Event dispatcher for all bubbling events.
 */
qx.Class.define("qx.event.dispatch.AbstractBubbling",
{
  extend : qx.core.Object,
  implement : qx.event.IEventDispatcher,
  type : "abstract",





  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @param manager {qx.event.Manager} Event manager for the window to use
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
    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the parent of the given target
     *
     * @abstract
     * @param target {var} The target which parent should be found
     * @return {var} The parent of the given target
     */
    _getParent : function(target) {
      throw new Error("Missing implementation");
    },




    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canDispatchEvent : function(target, event, type) {
      return event.getBubbles();
    },


    // interface implementation
    dispatchEvent : function(target, event, type)
    {
      var parent = target;
      var manager = this._manager;
      var captureListeners, bubbleListeners;
      var localList;
      var listener, context;
      var currentTarget;

      // Cache list for AT_TARGET
      var targetList = [];

      captureListeners = manager.getListeners(target, type, true);
      bubbleListeners = manager.getListeners(target, type, false);

      if (captureListeners) {
        targetList.push(captureListeners);
      }

      if (bubbleListeners) {
        targetList.push(bubbleListeners);
      }

      // Cache list for CAPTURING_PHASE and BUBBLING_PHASE
      var parent = this._getParent(target);

      var bubbleList = [];
      var bubbleTargets = [];

      var captureList = [];
      var captureTargets = [];

      // Walk up the tree and look for event listeners
      while (parent != null)
      {
        // Attention:
        // We do not follow the DOM2 events specifications here
        // http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html#Events-flow-capture
        // Opera is the only browser which conforms to the spec.
        // Safari and Mozilla do it the same way like qooxdoo does
        // and add the capture events of the target to the execution list.
        captureListeners = manager.getListeners(parent, type, true);
        if (captureListeners)
        {
          captureList.push(captureListeners);
          captureTargets.push(parent);
        }

        bubbleListeners = manager.getListeners(parent, type, false);

        if (bubbleListeners)
        {
          bubbleList.push(bubbleListeners);
          bubbleTargets.push(parent);
        }

        parent = this._getParent(parent);
      }


      // capturing phase
      // loop through the hierarchy in reverted order (from root)
      event.setEventPhase(qx.event.type.Event.CAPTURING_PHASE);
      for (var i=captureList.length-1; i>=0; i--)
      {
        currentTarget = captureTargets[i]
        event.setCurrentTarget(currentTarget);

        localList = captureList[i];
        for (var j=0, jl=localList.length; j<jl; j++)
        {
          listener = localList[j];
          context = listener.context || currentTarget;

          listener.handler.call(context, event);
        }

        if (event.getPropagationStopped()) {
          return;
        }
      }


      // at target
      event.setEventPhase(qx.event.type.Event.AT_TARGET);
      event.setCurrentTarget(target);
      for (var i=0, il=targetList.length; i<il; i++)
      {
        localList = targetList[i];
        for (var j=0, jl=localList.length; j<jl; j++)
        {
          listener = localList[j];
          context = listener.context || target;

          listener.handler.call(context, event);
        }

        if (event.getPropagationStopped()) {
          return;
        }
      }


      // bubbling phase
      // loop through the hierarchy in normal order (to root)
      event.setEventPhase(qx.event.type.Event.BUBBLING_PHASE);
      for (var i=0, il=bubbleList.length; i<il; i++)
      {
        currentTarget = bubbleTargets[i];
        event.setCurrentTarget(currentTarget);

        localList = bubbleList[i];
        for (var j=0, jl=localList.length; j<jl; j++)
        {
          listener = localList[j];
          context = listener.context || currentTarget;

          listener.handler.call(context, event);
        }

        if (event.getPropagationStopped()) {
          return;
        }
      }
    }
  }
});
