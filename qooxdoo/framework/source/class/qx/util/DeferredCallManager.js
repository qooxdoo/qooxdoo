/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This class manages the timer used for deferred calls. All
 * {@link qx.util.DeferredCall} instances use the single timer from this class.
 */
qx.Class.define("qx.util.DeferredCallManager",
{
  extend : qx.core.Object,
  type : "singleton",


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.__calls = {};
    this.__timeoutWrapper = qx.lang.Function.bind(this.__timeout, this);
    this.__hasCalls = false;
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __timeoutId : null,
    __currentQueue : null,
    __calls : null,
    __hasCalls : null,


    /**
     * Schedule a deferred call
     *
     * @param deferredCall {qx.util.DeferredCall} The call to schedule
     */
    schedule : function(deferredCall)
    {
      if (this.__timeoutId == null)
      {
        // this.debug("Configure timeout...");
        this.__timeoutId = window.setTimeout(this.__timeoutWrapper, 0);
      }

      var callKey = deferredCall.toHashCode();

      // the flush is currently running and the call is already
      // scheduled
      if (this.__currentQueue && this.__currentQueue[callKey]) {
        return;
      }

      this.__calls[callKey] = deferredCall;
      this.__hasCalls = true;
    },


    /**
     * Cancel a scheduled deferred call
     *
     * @param deferredCall {qx.util.DeferredCall} The call to schedule
     */
    cancel : function(deferredCall)
    {
      var callKey = deferredCall.toHashCode();

      // the flush is currently running and the call is already
      // scheduled -> remove it from the current queue
      if(this.__currentQueue && this.__currentQueue[callKey])
      {
        this.__currentQueue[callKey] = null;
        return;
      }

      delete this.__calls[callKey];

      // stop timer if no other calls are waiting
      if(qx.lang.Object.isEmpty(this.__calls) && this.__timeoutId != null)
      {
        // this.debug("Clear timeout...");
        window.clearTimeout(this.__timeoutId);
        this.__timeoutId = null;
      }
    },


    /**
     * Helper function for the timer.
     *
     * @return {void}
     */
    __timeout : function()
    {
      this.__timeoutId = null;

      // the queue may change while doing the flush so we work on a copy of
      // the queue and loop while the queue has any entries.
      while(this.__hasCalls)
      {
        this.__currentQueue = qx.lang.Object.copy(this.__calls);
        this.__calls = {};
        this.__hasCalls = false;

        for (var key in this.__currentQueue)
        {
          var call = this.__currentQueue[key];
          if (call)
          {
            this.__currentQueue[key] = null;
            call.call();
          }
        }
      }

      this.__currentQueue = null;
    }

  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.__timeoutId != null) {
      window.clearTimeout(this.__timeoutId);
    }
    this._disposeFields("__timeoutWrapper", "__calls");
  }
});