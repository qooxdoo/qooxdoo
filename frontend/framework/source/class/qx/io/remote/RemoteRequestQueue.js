/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org
     2006 by Derrell Lipman

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ioremote)
#require(qx.manager.object.SingletonManager)

************************************************************************ */
/*!
  Handles scheduling of requests to be sent to a server.

  This class is a singleton and is used by qx.io.remote.RemoteRequest to schedule its
  requests. It should not be used directly.
 */
qx.OO.defineClass("qx.io.remote.RemoteRequestQueue", qx.core.Target,
function()
{
  qx.core.Target.call(this);

  this._queue = [];
  this._active = [];

  this._totalRequests = 0;

  this._timer = new qx.client.Timer(50);
  this._timer.addEventListener(qx.constant.Event.INTERVAL, this._oninterval, this);
});




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "maxTotalRequests", type : qx.constant.Type.NUMBER });
qx.OO.addProperty({ name : "maxConcurrentRequests", type : qx.constant.Type.NUMBER, defaultValue : 3 });
qx.OO.addProperty({ name : "defaultTimeout", type : qx.constant.Type.NUMBER, defaultValue : 3000 });






/*
---------------------------------------------------------------------------
  QUEUE HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._debug = function()
{
  // Debug output
  var vText = this._active.length + "/" + (this._queue.length+this._active.length);

  if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug"))
  {
    this.debug("Progress: " + vText);
    window.status = "Request-Queue Progress: " + vText;
  }
}

qx.Proto._check = function()
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
  var vTransport = new qx.io.remote.RemoteExchange(vRequest);

  // Increment counter
  this._totalRequests++;

  // Add to active queue
  this._active.push(vTransport);

  // Debug output
  this._debug();

  // Establish event connection between qx.io.remote.RemoteExchange instance and qx.io.remote.RemoteRequest
  vTransport.addEventListener(qx.constant.Event.SENDING, vRequest._onsending, vRequest);
  vTransport.addEventListener(qx.constant.Event.RECEIVING, vRequest._onreceiving, vRequest);
  vTransport.addEventListener(qx.constant.Event.COMPLETED, vRequest._oncompleted, vRequest);
  vTransport.addEventListener(qx.constant.Event.ABORTED, vRequest._onaborted, vRequest);
  vTransport.addEventListener(qx.constant.Event.TIMEOUT, vRequest._ontimeout, vRequest);
  vTransport.addEventListener(qx.constant.Event.FAILED, vRequest._onfailed, vRequest);

  // Establish event connection between qx.io.remote.RemoteExchange and me.
  vTransport.addEventListener(qx.constant.Event.SENDING, this._onsending, this);
  vTransport.addEventListener(qx.constant.Event.COMPLETED, this._oncompleted, this);
  vTransport.addEventListener(qx.constant.Event.ABORTED, this._oncompleted, this);
  vTransport.addEventListener(qx.constant.Event.TIMEOUT, this._oncompleted, this);
  vTransport.addEventListener(qx.constant.Event.FAILED, this._oncompleted, this);

  // Store send timestamp
  vTransport._start = (new Date).valueOf();

  // Send
  vTransport.send();

  // Retry
  if (this._queue.length > 0) {
    this._check();
  }
}

qx.Proto._remove = function(vTransport)
{
  var vRequest = vTransport.getRequest();

  // Destruct event connection between qx.io.remote.RemoteExchange instance and qx.io.remote.RemoteRequest
  vTransport.removeEventListener(qx.constant.Event.SENDING, vRequest._onsending, vRequest);
  vTransport.removeEventListener(qx.constant.Event.RECEIVING, vRequest._onreceiving, vRequest);
  vTransport.removeEventListener(qx.constant.Event.COMPLETED, vRequest._oncompleted, vRequest);
  vTransport.removeEventListener(qx.constant.Event.ABORTED, vRequest._onaborted, vRequest);
  vTransport.removeEventListener(qx.constant.Event.TIMEOUT, vRequest._ontimeout, vRequest);
  vTransport.removeEventListener(qx.constant.Event.FAILED, vRequest._onfailed, vRequest);

  // Destruct event connection between qx.io.remote.RemoteExchange and me.
  vTransport.removeEventListener(qx.constant.Event.SENDING, this._onsending, this);
  vTransport.removeEventListener(qx.constant.Event.COMPLETED, this._oncompleted, this);
  vTransport.removeEventListener(qx.constant.Event.ABORTED, this._oncompleted, this);
  vTransport.removeEventListener(qx.constant.Event.TIMEOUT, this._oncompleted, this);
  vTransport.removeEventListener(qx.constant.Event.FAILED, this._oncompleted, this);

  // Remove from active transports
  qx.lang.Array.remove(this._active, vTransport);

  // Dispose transport object
  vTransport.dispose();

  // Check again
  this._check();
}







/*
---------------------------------------------------------------------------
  EVENT HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._activeCount = 0;

qx.Proto._onsending = function(e)
{
  if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug"))
  {
    this._activeCount++;
    e.getTarget()._counted = true;

    this.debug("ActiveCount: " + this._activeCount);
  }
}

qx.Proto._oncompleted = function(e)
{
  if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug"))
  {
    if (e.getTarget()._counted)
    {
      this._activeCount--;
      this.debug("ActiveCount: " + this._activeCount);
    }
  }

  this._remove(e.getTarget());
}







/*
---------------------------------------------------------------------------
  TIMEOUT HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._oninterval = function(e)
{
  var vActive = this._active;

  if (vActive.length == 0) {
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
    if (vRequest.isAsynchronous()) {
      vTimeout = vRequest.getTimeout();

      // if timer is disabled...
      if (vTimeout == 0) {
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
}




/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifyEnabled = function(propValue, propOldValue, propData)
{
  if (propValue) {
    this._check();
  }

  this._timer.setEnabled(propValue);

  return true;
}







/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/
/*!
  Add the request to the pending requests queue.
*/
qx.Proto.add = function(vRequest)
{
  vRequest.setState(qx.constant.Event.QUEUED);

  this._queue.push(vRequest);
  this._check();

  if (this.getEnabled()) {
    this._timer.start();
  }
}

/*!
  Remove the request from the pending requests queue.

  The underlying transport of the request is forced into the aborted
  state (qx.constant.Net.STATE_ABORTED) and listeners of the "aborted"
  signal are notified about the event. If the request isn't in the
  pending requests queue, this method is a noop.
*/
qx.Proto.abort = function(vRequest)
{
  var vTransport = vRequest.getTransport();

  if (vTransport)
  {
    vTransport.abort();
  }
  else if (qx.lang.Array.contains(this._queue, vRequest))
  {
    qx.lang.Array.remove(this._queue, vRequest);
  }
}







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  }

  if (this._active)
  {
    for (var i=0, a=this._active, l=a.length; i<l; i++) {
      this._remove(a[i]);
    }

    this._active = null;
  }

  if (this._timer)
  {
    this._timer.removeEventListener(qx.constant.Event.INTERVAL, this._oninterval, this);
    this._timer = null;
  }

  this._queue = null;

  return qx.core.Target.prototype.dispose.call(this);
}







/*
---------------------------------------------------------------------------
  DEFER SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.SingletonManager.add(qx.io.remote.RemoteRequestQueue);
