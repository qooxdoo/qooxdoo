/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(io_remote)

************************************************************************ */

/**
 * Handles scheduling of requests to be sent to a server.
 *
 * This class is a singleton and is used by qx.io.remote.Request to schedule its
 * requests. It should not be used directly.
 */
qx.Class.define("qx.io.remote.RequestQueue",
{
  type : "singleton",
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._queue = [];
    this._active = [];

    this._totalRequests = 0;

    // timeout handling
    this._timer = new qx.client.Timer(500);
    this._timer.addEventListener("interval", this._oninterval, this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    enabled :
    {
      init : true,
      check : "Boolean",
      apply : "_applyEnabled"
    },

    /**
     * @deprecated
     */
    maxTotalRequests :
    {
      check : "Integer",
      nullable : true
    },


    /**
     * Maximum number of parallel requests.
     */
    maxConcurrentRequests :
    {
      check : "Integer",
      init : 3
    },


    /**
     * Default timeout for remote requests in milliseconds.
     */
    defaultTimeout :
    {
      check : "Integer",
      init : 5000
    }
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
      QUEUE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _debug : function()
    {
      // Debug output
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug"))
        {
          var vText =
            this._active.length + "/" +
            (this._queue.length + this._active.length);

          this.debug("Progress: " + vText);
          window.status = "Request-Queue Progress: " + vText;
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _check : function()
    {
      // Debug output
      this._debug();

      // Check queues and stop timer if not needed anymore
      if (this._active.length == 0 && this._queue.length == 0) {
        this._timer.stop();
      }

      // Checking if enabled
      if (!this.getEnabled()) {
        return;
      }

      // Checking active queue fill
      if (this._active.length >= this.getMaxConcurrentRequests() || this._queue.length == 0) {
        return;
      }

      // Checking number of total requests
      if (this.getMaxTotalRequests() != null && this._totalRequests >= this.getMaxTotalRequests()) {
        return;
      }

      var vRequest = this._queue.shift();
      var vTransport = new qx.io.remote.Exchange(vRequest);

      // Increment counter
      this._totalRequests++;

      // Add to active queue
      this._active.push(vTransport);

      // Debug output
      this._debug();

      // Establish event connection between qx.io.remote.Exchange and me.
      vTransport.addEventListener("sending", this._onsending, this);
      vTransport.addEventListener("receiving", this._onreceiving, this);
      vTransport.addEventListener("completed", this._oncompleted, this);
      vTransport.addEventListener("aborted", this._oncompleted, this);
      vTransport.addEventListener("timeout", this._oncompleted, this);
      vTransport.addEventListener("failed", this._oncompleted, this);


      var returnValue = true;

      try
      {
        // Send
        returnValue = vTransport.send();
      }
      catch (exc)
      {
        returnValue = exc;
      }

      // if we got an exception remove it from the queue by using the failed
      // handler
      if (returnValue !== true)
      {
        var response = new qx.io.remote.Response('failed');
        response.setContent(returnValue);
        vTransport.dispatchEvent(response);
      }
      else
      {
        // Store send timestamp
        vTransport._start = (new Date()).valueOf();
      }

      // Retry
      if (this._queue.length > 0) {
        this._check();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vTransport {var} TODOC
     * @return {void}
     */
    _remove : function(vTransport)
    {
      // Remove from active transports
      qx.lang.Array.remove(this._active, vTransport);

      // Check again
      this._check();
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    _activeCount : 0,


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onsending : function(e)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug"))
        {
          this._activeCount++;
          e.getTarget()._counted = true;

          this.debug("ActiveCount: " + this._activeCount);
        }
      }

      var vTransport = e.getTarget();
      vTransport.getRequest()._onsending(e);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onreceiving : function(e)
    {
      e.getTarget().getRequest()._onreceiving(e);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _oncompleted : function(e)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug"))
        {
          if (e.getTarget()._counted)
          {
            this._activeCount--;
            this.debug("ActiveCount: " + this._activeCount);
          }
        }
      }

      var vTransport = e.getTarget();

      // remove from queue
      this._remove(vTransport);

      // call user handler
      var vRequest = vTransport.getRequest();
      if (vRequest['_on' + e.getType()])
      {
        vRequest['_on' + e.getType()](e);
      }

      // Dispose transport object
      vTransport.dispose();
    },




    /*
    ---------------------------------------------------------------------------
      TIMEOUT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _oninterval : function(e)
    {
      var vActive = this._active;

      if (vActive.length == 0)
      {
        this._timer.stop();
        return;
      }

      var vTransport;
      var vRequest;
      var vDefaultTimeout = this.getDefaultTimeout();
      var vTimeout;
      var vTime;

      for (var i=vActive.length-1; i>=0; i--)
      {
        vTransport = vActive[i];
        vRequest = vTransport.getRequest();

        if (vRequest.isAsynchronous())
        {
          vTimeout = vRequest.getTimeout();

          // if timer is disabled or transport not sended ignore it
          if (vTimeout == 0 || vTransport._start == null)
          {
            continue;
          }

          if (vTimeout == null) {
            vTimeout = vDefaultTimeout;
          }

          vTime = (new Date).valueOf() - vTransport._start;

          if (vTime > vTimeout)
          {
            this.warn("Timeout: transport " + vTransport.toHashCode());
            this.warn(vTime + "ms > " + vTimeout + "ms");
            vTransport.timeout();
          }
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyEnabled : function(value, old)
    {
      if (value) {
        this._check();
      }

      this._timer.setEnabled(value);
    },




    /*
    ---------------------------------------------------------------------------
      CORE METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Add the request to the pending requests queue.
     *
     * @type member
     * @param vRequest {var} TODOC
     * @return {void}
     */
    add : function(vRequest)
    {
      vRequest.setState("queued");

      this._queue.push(vRequest);
      this._check();

      if (this.getEnabled()) {
        this._timer.start();
      }
    },


    /**
     * Remove the request from the pending requests queue.
     *
     *  The underlying transport of the request is forced into the aborted
     *  state ("aborted") and listeners of the "aborted"
     *  signal are notified about the event. If the request isn't in the
     *  pending requests queue, this method is a noop.
     *
     * @type member
     * @param vRequest {var} TODOC
     * @return {void}
     */
    abort : function(vRequest)
    {
      var vTransport = vRequest.getTransport();

      if (vTransport) {
        vTransport.abort();
      } else if (qx.lang.Array.contains(this._queue, vRequest)) {
        qx.lang.Array.remove(this._queue, vRequest);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjectDeep("_active", 1);
    this._disposeObjects("_timer");
    this._disposeFields("_queue");
  }
});
