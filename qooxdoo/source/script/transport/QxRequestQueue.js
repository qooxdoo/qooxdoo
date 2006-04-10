/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(transport)
#require(QxTimer)
#post(QxTransport)

************************************************************************ */
/*!
  Handles scheduling of requests to be sent to a server.

  This class is a singleton and is used by QxRequest to schedule its
  requests. It should not be used directly.
 */
function QxRequestQueue()
{
  QxTarget.call(this);

  this._queue = [];
  this._active = [];

  this._totalRequests = 0;

  this._timer = new QxTimer(50);
  this._timer.addEventListener(QxConst.EVENT_TYPE_INTERVAL, this._oninterval, this);
};

QxRequestQueue.extend(QxTarget, "QxRequestQueue");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxRequestQueue.addProperty({ name : "maxTotalRequests", type : QxConst.TYPEOF_NUMBER });
QxRequestQueue.addProperty({ name : "maxConcurrentRequests", type : QxConst.TYPEOF_NUMBER, defaultValue : 3 });
QxRequestQueue.addProperty({ name : "defaultTimeout", type : QxConst.TYPEOF_NUMBER, defaultValue : 3000 });






/*
---------------------------------------------------------------------------
  QUEUE HANDLING
---------------------------------------------------------------------------
*/

proto._debug = function()
{
  // Debug output
  var vText = this._active.length + "/" + (this._queue.length+this._active.length);

  if (QxSettings.enableTransportDebug)
  {
    this.debug("Progress: " + vText);
    window.status = "Request-Queue Progress: " + vText;
  };
};

proto._check = function()
{
  // Debug output
  this._debug();

  // Check queues and stop timer if not needed anymore
  if (this._active.length == 0 && this._queue.length == 0) {
    this._timer.stop();
  };

  // Checking if enabled
  if (!this.getEnabled()) {
    return;
  };

  // Checking active queue fill
  if (this._active.length >= this.getMaxConcurrentRequests() || this._queue.length == 0) {
    return;
  };

  // Checking number of total requests
  if (this.getMaxTotalRequests() != null && this._totalRequests >= this.getMaxTotalRequests()) {
    return;
  };

  // TODO: How to support concurrent requests?
  var vRequest = this._queue.shift();
  var vTransport = new QxTransport(vRequest);

  // Increment counter
  this._totalRequests++;

  // Add to active queue
  this._active.push(vTransport);

  // Debug output
  this._debug();

  // Establish event connection between QxTransport instance and QxRequest
  vTransport.addEventListener(QxConst.EVENT_TYPE_SENDING, vRequest._onsending, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_RECEIVING, vRequest._onreceiving, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_COMPLETED, vRequest._oncompleted, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_ABORTED, vRequest._onaborted, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_TIMEOUT, vRequest._ontimeout, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_FAILED, vRequest._onfailed, vRequest);

  // Establish event connection between QxTransport and me.
  vTransport.addEventListener(QxConst.EVENT_TYPE_SENDING, this._onsending, this);
  vTransport.addEventListener(QxConst.EVENT_TYPE_COMPLETED, this._oncompleted, this);
  vTransport.addEventListener(QxConst.EVENT_TYPE_ABORTED, this._oncompleted, this);
  vTransport.addEventListener(QxConst.EVENT_TYPE_TIMEOUT, this._oncompleted, this);
  vTransport.addEventListener(QxConst.EVENT_TYPE_FAILED, this._oncompleted, this);

  // Store send timestamp
  vTransport._start = (new Date).valueOf();

  // Send
  vTransport.send();

  // Retry
  if (this._queue.length > 0) {
    this._check();
  };
};

proto._remove = function(vTransport)
{
  var vRequest = vTransport.getRequest();

  // Destruct event connection between QxTransport instance and QxRequest
  vTransport.removeEventListener(QxConst.EVENT_TYPE_SENDING, vRequest._onsending, vRequest);
  vTransport.removeEventListener(QxConst.EVENT_TYPE_RECEIVING, vRequest._onreceiving, vRequest);
  vTransport.removeEventListener(QxConst.EVENT_TYPE_COMPLETED, vRequest._oncompleted, vRequest);
  vTransport.removeEventListener(QxConst.EVENT_TYPE_ABORTED, vRequest._onaborted, vRequest);
  vTransport.removeEventListener(QxConst.EVENT_TYPE_TIMEOUT, vRequest._ontimeout, vRequest);
  vTransport.removeEventListener(QxConst.EVENT_TYPE_FAILED, vRequest._onfailed, vRequest);

  // Destruct event connection between QxTransport and me.
  vTransport.removeEventListener(QxConst.EVENT_TYPE_SENDING, this._onsending, this);
  vTransport.removeEventListener(QxConst.EVENT_TYPE_COMPLETED, this._oncompleted, this);
  vTransport.removeEventListener(QxConst.EVENT_TYPE_ABORTED, this._oncompleted, this);
  vTransport.removeEventListener(QxConst.EVENT_TYPE_TIMEOUT, this._oncompleted, this);
  vTransport.removeEventListener(QxConst.EVENT_TYPE_FAILED, this._oncompleted, this);

  // Remove from active transports
  this._active.remove(vTransport);

  // Dispose transport object
  vTransport.dispose();

  // Check again
  this._check();
};







/*
---------------------------------------------------------------------------
  EVENT HANDLING
---------------------------------------------------------------------------
*/

proto._activeCount = 0;

proto._onsending = function(e)
{
  if (QxSettings.enableTransportDebug)
  {
    this._activeCount++;
    e.getTarget()._counted = true;

    this.debug("ActiveCount: " + this._activeCount);
  };
};

proto._oncompleted = function(e)
{
  if (QxSettings.enableTransportDebug)
  {
    if (e.getTarget()._counted)
    {
      this._activeCount--;
      this.debug("ActiveCount: " + this._activeCount);
    };
  };

  this._remove(e.getTarget());
};







/*
---------------------------------------------------------------------------
  TIMEOUT HANDLING
---------------------------------------------------------------------------
*/

proto._oninterval = function(e)
{
  var vActive = this._active;

  if (vActive.length == 0) {
    return;
  };

  var vCurrent = (new Date).valueOf();
  var vTransport;
  var vDefaultTimeout = this.getDefaultTimeout();
  var vTimeout;
  var vTime;

  for (var i=vActive.length-1; i>0; i--)
  {
    vTransport = vActive[i];
    vTimeout = vTransport.getRequest().getTimeout();

    if (vTimeout == null) {
      vTimeout = vDefaultTimeout;
    };

    vTime = vCurrent - vTransport._start;

    if (vTime > vTimeout)
    {
      this.warn("Timeout: transport " + vTransport.toHashCode());
      this.warn(vTime + "ms > " + vTimeout + "ms");
      vTransport.timeout();
    };
  };
};




/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifyEnabled = function(propValue, propOldValue, propData)
{
  if (propValue) {
    this._check();
  };

  this._timer.setEnabled(propValue);

  return true;
};







/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/
/*!
  Add the request to the pending requests queue.
*/
proto.add = function(vRequest)
{
  vRequest.setState(QxConst.EVENT_TYPE_QUEUED);

  this._queue.push(vRequest);
  this._check();

  if (this.getEnabled()) {
    this._timer.start();
  };
};

/*!
  Remove the request from the pending requests queue.

  The underlying transport of the request is forced into the aborted
  state (QxConst.REQUEST_STATE_ABORTED) and listeners of the "aborted"
  signal are notified about the event. If the request isn't in the
  pending requests queue, this method is a noop.
*/
proto.abort = function(vRequest)
{
  var vTransport = vRequest.getTransport();

  if (vTransport)
  {
    vTransport.abort();
  }
  else if (this._queue.contains(vRequest))
  {
    this._queue.remove(vRequest);
  };
};







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  if (this._active)
  {
    for (var i=0, a=this._active, l=a.length; i<l; i++) {
      this._remove(a[i]);
    };

    this._active = null;
  };

  if (this._timer)
  {
    this._timer.removeEventListener(QxConst.EVENT_TYPE_INTERVAL, this._oninterval, this);
    this._timer = null;
  };

  this._queue = null;

  return QxTarget.prototype.dispose.call(this);
};







/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxRequestQueue = new QxRequestQueue;
