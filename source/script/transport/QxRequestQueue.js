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
  this._workingQueue = [];
  this._totalRequests = 0;
};

QxRequestQueue.extend(QxTarget, "QxRequestQueue");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxRequestQueue.addProperty({ name : "maxTotalRequests", type : QxConst.TYPEOF_NUMBER });
QxRequestQueue.addProperty({ name : "maxConcurrentRequests", type : QxConst.TYPEOF_NUMBER, defaultValue : 3 });






/*
---------------------------------------------------------------------------
  QUEUE
---------------------------------------------------------------------------
*/

proto._check = function()
{
  // Debug output
  if (QxSettings.enableTransportDebug) {
    this.debug("queue: " + this._queue.length + " | working:" + this._workingQueue.length);
  };

  // Checking if enabled
  if (!this.getEnabled()) {
    return;
  };

  // Checking working queue fill
  if (this._workingQueue.length >= this.getMaxConcurrentRequests() || this._queue.length == 0) {
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
  this._workingQueue.push(vTransport);

  // Establish event connection between QxTransport instance and QxRequest
  vTransport.addEventListener(QxConst.EVENT_TYPE_SENDING, vRequest._onsending, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_RECEIVING, vRequest._onreceiving, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_COMPLETED, vRequest._oncompleted, vRequest);

  // Establish event connection between QxTransport and me.
  vTransport.addEventListener(QxConst.EVENT_TYPE_COMPLETED, this._oncompleted, this);

  // Finally send request
  vTransport.send();

  // Retry
  this._check();
};

proto._oncompleted = function(e)
{
  this._workingQueue.remove(e.getTarget());
  this._check();
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
};

proto.abort = function(vRequest)
{


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
  this._workingQueue = null;

  return QxTarget.prototype.dispose.call(this);
};







/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxRequestQueue = new QxRequestQueue;
