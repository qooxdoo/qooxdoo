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

/**
 * Handles scheduling of requests to be sent to a server.
 *
 * This class is a singleton and is used by qx.io.remote.Request to schedule its
 * requests. It should not be used directly.
 *
 * @internal
 */
qx.Class.define("qx.io.remote.RequestQueue",
{
  type : "singleton",
  extend : qx.core.Object,




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
    this._timer = new qx.event.Timer(500);
    this._timer.addListener("interval", this._oninterval, this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /**
     * Indicates whether queue is enabled or not.
     */
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
     * Generates debug output
     */
    _debug : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug"))
        {
          // Debug output
          var vText = this._active.length + "/" + (this._queue.length + this._active.length);

          this.debug("Progress: " + vText);
          window.status = "Request-Queue Progress: " + vText;
        }
      }
    },


    /**
     * Checks the queue if any request is left to send and uses the transport
     * layer to send the open requests.
     * This method calls itself until every request in the queue is send.
     *
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

      // Establish event connection between qx.io.remote.Exchange instance and
      // qx.io.remote.Request
      vTransport.addListener("sending", vRequest._onsending, vRequest);
      vTransport.addListener("receiving", vRequest._onreceiving, vRequest);
      vTransport.addListener("completed", vRequest._oncompleted, vRequest);
      vTransport.addListener("aborted", vRequest._onaborted, vRequest);
      vTransport.addListener("timeout", vRequest._ontimeout, vRequest);
      vTransport.addListener("failed", vRequest._onfailed, vRequest);

      // Establish event connection between qx.io.remote.Exchange and me.
      vTransport.addListener("sending", this._onsending, this);
      vTransport.addListener("completed", this._oncompleted, this);
      vTransport.addListener("aborted", this._oncompleted, this);
      vTransport.addListener("timeout", this._oncompleted, this);
      vTransport.addListener("failed", this._oncompleted, this);

      // Store send timestamp
      vTransport._start = (new Date).valueOf();

      // Send
      vTransport.send();

      // Retry
      if (this._queue.length > 0) {
        this._check();
      }
    },


    /**
     * Removes a transport object from the active queue and disposes the
     * transport object in order stop the request.
     *
     * @param vTransport {qx.io.remote.Exchange} Transport object
     * @return {void}
     */
    _remove : function(vTransport)
    {
      // Remove from active transports
      qx.lang.Array.remove(this._active, vTransport);

      // Dispose transport object
      vTransport.dispose();

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
     * Listens for the "sending" event of the transport object and increases
     * the counter for active requests.
     *
     * @param e {qx.event.type.Event} event object
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
    },


    /**
     * Listens for the "completed" event of the transport object and decreases
     * the counter for active requests.
     *
     * @param e {qx.event.type.Event} event object
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

      this._remove(e.getTarget());
    },




    /*
    ---------------------------------------------------------------------------
      TIMEOUT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Listens for the "interval" event of the transport object and checks
     * if the active requests are timed out.
     *
     * @param e {qx.event.type.Event} event object
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

      var vCurrent = (new Date).valueOf();
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

          // if timer is disabled...
          if (vTimeout == 0)
          {
            // then ignore it.
            continue;
          }

          if (vTimeout == null) {
            vTimeout = vDefaultTimeout;
          }

          vTime = vCurrent - vTransport._start;

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


    // property apply
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
     * @param vRequest {var} The request
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
     * @param vRequest {var} The request
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
    this._disposeArray("_active");
    this._disposeObjects("_timer");
    this._disposeFields("_queue");
  }
});
