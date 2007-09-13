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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(event)

************************************************************************ */

/**
 * Event dispatcher for all bubbling events.
 *
 * @internal
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
   * @type constructor
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
     * @type member
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
      // TODO: I think we could optimize this. We don't really need
      // to collect all these data when any of the targets do a
      // stopPropagation(). Maybe we can process it incrementally instead.

      var parent = target;

      var manager = this._manager;

      var bubbleList = [];
      var bubbleTargets = [];

      var captureList = [];
      var captureTargets = [];

      // Walk up the tree and look for event listeners
      while (parent != null)
      {
        if (parent !== target)
        {
          var captureListeners = manager.getListeners(parent, type, true);

          if (captureListeners)
          {
            captureList.push(captureListeners);
            captureTargets.push(parent);
          }
        }

        var bubbleListeners = manager.getListeners(parent, type, false);
        if (bubbleListeners)
        {
          bubbleList.push(bubbleListeners);
          bubbleTargets.push(parent);
        }
      
        parent = this._getParent(parent);
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