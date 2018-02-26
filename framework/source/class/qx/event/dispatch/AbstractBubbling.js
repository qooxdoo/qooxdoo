/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
      var context;

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

      var self = this;
      var tracker = {};

      var __TRACE_LOGGING = false;//(event._type == "pointerup" && event._target.className === "qx-toolbar-button-checked");
      var __TRACE = function(){};
      if (__TRACE_LOGGING) {
        var serial = (this.SERIAL||0)+1;
        this.SERIAL=serial + 1;
        __TRACE = function() {
          var args = [].slice.apply(arguments);
          args.unshift("serial #" + serial + ": ");
          console.log.apply(this, args);
        }
      }

      qx.event.Utils.catch(tracker, function() {
        // This function must exist to suppress "unhandled rejection" messages from promises
        __TRACE("Aborted serial=" + serial + ", type=" + event.getType());
      });

      // capturing phase
      qx.event.Utils.then(tracker, function() {
        // loop through the hierarchy in reverted order (from root)
        event.setEventPhase(qx.event.type.Event.CAPTURING_PHASE);

        __TRACE("captureList=" + captureList.length);
        return qx.event.Utils.series(captureList, function(localList, i) {

          __TRACE("captureList[" + i + "]: localList.length=" + localList.length);

          var currentTarget = captureTargets[i];
          event.setCurrentTarget(currentTarget);

          var result = qx.event.Utils.series(localList, function(listener, listenerIndex) {
            context = listener.context || currentTarget;

            if (qx.core.Environment.get("qx.debug")) {
              // warn if the context is disposed
              if (context && context.isDisposed && context.isDisposed()) {
                self.warn(
                  "The context object '" + context + "' for the event '" +
                  type + "' of '" + currentTarget + "'is already disposed."
                );
              }
            }

            if (!self._manager.isBlacklisted(listener.unique)) {
              __TRACE("captureList[" + i + "] => localList[" + listenerIndex + "] callListener");
              return listener.handler.call(context, event);
            } else {
              __TRACE("captureList[" + i + "] => localList[" + listenerIndex + "] is blacklisted");
            }
          }, true);
          if (result === qx.event.Utils.ABORT) {
            return qx.event.Utils.reject(tracker);
          }
          if (event.getPropagationStopped()) {
            return qx.event.Utils.reject(tracker);
          }
          return result;
        });
      });


      // at target
      qx.event.Utils.then(tracker, function() {
        event.setEventPhase(qx.event.type.Event.AT_TARGET);
        event.setCurrentTarget(target);

        __TRACE("targetList=" + targetList.length);
        return qx.event.Utils.series(targetList, function(localList, i) {
          __TRACE("targetList[" + i + "] localList.length=" + localList.length);

          var result = qx.event.Utils.series(localList, function(listener, listenerIndex) {
            __TRACE("targetList[" + i + "] -> localList[" + listenerIndex + "] callListener");
            context = listener.context || target;

            if (qx.core.Environment.get("qx.debug")) {
              // warn if the context is disposed
              if (context && context.isDisposed && context.isDisposed()) {
                self.warn(
                  "The context object '" + context + "' for the event '" +
                  type + "' of '" + target + "'is already disposed."
                );
              }
            }

            __TRACE("Calling target serial=" + serial + ", type=" + event.getType());
            return listener.handler.call(context, event);
          }, true);
          if (result === qx.event.Utils.ABORT) {
            return qx.event.Utils.reject(tracker);
          }
          if (event.getPropagationStopped()) {
            return qx.event.Utils.reject(tracker);
          }
          return result;
        });
      });


      // bubbling phase
      // loop through the hierarchy in normal order (to root)
      qx.event.Utils.then(tracker, function() {
        event.setEventPhase(qx.event.type.Event.BUBBLING_PHASE);

        __TRACE("bubbleList=" + bubbleList.length);
        return qx.event.Utils.series(bubbleList, function(localList, i) {
          __TRACE("bubbleList[" + i + "] localList.length=" + localList.length);
          var currentTarget = bubbleTargets[i];
          event.setCurrentTarget(currentTarget);

          var result = qx.event.Utils.series(localList, function(listener, listenerIndex) {
            __TRACE("bubbleList[" + i + "] -> localList[" + listenerIndex + "] callListener");
            context = listener.context || currentTarget;

            if (qx.core.Environment.get("qx.debug")) {
              // warn if the context is disposed
              if (context && context.isDisposed && context.isDisposed()) {
                self.warn(
                  "The context object '" + context + "' for the event '" +
                  type + "' of '" + currentTarget + "'is already disposed."
                );
              }
            }

            return listener.handler.call(context, event);
          }, true);

          if (result === qx.event.Utils.ABORT) {
            return qx.event.Utils.reject(tracker);
          }
          if (event.getPropagationStopped()) {
            return qx.event.Utils.reject(tracker);
          }
          return result;
        });
      });

      if (__TRACE_LOGGING) {
        if (tracker.promise) {
          __TRACE("events promised");
          qx.event.Utils.then(tracker, function() {
            __TRACE("events promised done");
          });
        } else {
          __TRACE("events done");
        }
      }
      return tracker.promise;
    }
  }
});
