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

************************************************************************ */

function QxRequestQueue()
{
  QxTarget.call(this);

  this._queue = [];
  this._working = [];

  this._totalRequests = 0;

  this._timer = new QxTimer(10);
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
QxRequestQueue.addProperty({ name : "defaultTimeout", type : QxConst.TYPEOF_NUMBER, defaultValue : 100 });






/*
---------------------------------------------------------------------------
  QUEUE
---------------------------------------------------------------------------
*/

proto._check = function()
{
  // Debug output
  if (QxSettings.enableTransportDebug) {
    this.debug("queue:" + this._queue.length + " | working:" + this._working.length);
  };

  // Check queues and stop timer if not needed anymore
  if (this._working.length == 0 && this._queue.length == 0) {
    this._timer.stop();
  };

  // Checking if enabled
  if (!this.getEnabled()) {
    return;
  };

  // Checking working queue fill
  if (this._working.length >= this.getMaxConcurrentRequests() || this._queue.length == 0) {
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

  // Add to working queue
  this._working.push(vTransport);

  // Establish event connection between QxTransport instance and QxRequest
  vTransport.addEventListener(QxConst.EVENT_TYPE_SENDING, vRequest._onsending, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_RECEIVING, vRequest._onreceiving, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_COMPLETED, vRequest._oncompleted, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_ABORTED, vRequest._onaborted, vRequest);

  // Establish event connection between QxTransport and me.
  vTransport.addEventListener(QxConst.EVENT_TYPE_COMPLETED, this._oncompleted, this);
  vTransport.addEventListener(QxConst.EVENT_TYPE_ABORTED, this._onaborted, this);

  // Finally send request
  vTransport._start = (new Date).valueOf();
  vTransport.send();

  // Retry
  if (this._queue.length > 0) {
    this._check();
  };
};

proto._oncompleted = function(e)
{
  this._working.remove(e.getTarget());
  this._check();
};

proto._onaborted = function(e)
{
  this._working.remove(e.getTarget());
  this._check();
};

proto._oninterval = function(e)
{
  var vWorking = this._working;

  if (vWorking.length == 0) {
    return;
  };

  var vCurrent = (new Date).valueOf();
  var vTransport;
  var vDefaultTimeout = this.getDefaultTimeout();
  var vTimeout;

  for (var i=0, l=vWorking.length; i<l; i++)
  {
    vTransport = vWorking[i];
    vTimeout = vTransport.getRequest().getTimeout();

    if (vTimeout == null) {
      vTimeout = vDefaultTimeout;
    };

    if ((vCurrent - vTransport._start) > vTimeout)
    {
      this.debug("Timeout reached for request: " + vTransport);
      vTransport.abort();
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
  this._check();
  return true;
};







/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

proto.add = function(vRequest)
{
  vRequest.setState(QxConst.EVENT_TYPE_QUEUED);

  this._queue.push(vRequest);
  this._check();
  this._timer.start();
};

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

  this._queue = null;
  this._working = null;

  if (this._timer)
  {
    this._timer.removeEventListener(QxConst.EVENT_TYPE_INTERVAL, this._oninterval, this);
    this._timer = null;
  };

  return QxTarget.prototype.dispose.call(this);
};







/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxRequestQueue = new QxRequestQueue;
