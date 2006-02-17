/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
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

#package(ajax)

************************************************************************ */

function QxRequestQueue()
{
  QxTarget.call(this);

  this._queue = [];  
  
  this._timer = new QxTimer(50);
  this._timer.addEventListener("interval", this._oninterval, this);
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
  EVENT LISTENERS
---------------------------------------------------------------------------
*/

proto._oninterval = function()
{
  // TODO: How to support concurrent requests?
  var vRequest = this._queue.shift();
  var vTransport = new QxTransport(vRequest);

  // Establish event connection between QxTransport instance and QxRequest
  vTransport.addEventListener(QxConst.EVENT_TYPE_SENDING, vRequest._onsending, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_RECEIVING, vRequest._onreceiving, vRequest);
  vTransport.addEventListener(QxConst.EVENT_TYPE_COMPLETED, vRequest._oncompleted, vRequest);
  
  // Finally send request
  vTransport.send();
  
  // Stop timer on empty queue
  if (this._queue.length === 0) {
    this._timer.stop();
  };  
};






/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

proto.add = function(vRequest) 
{
  this._queue.push(vRequest);

  vRequest.setState(QxConst.EVENT_TYPE_QUEUED);  
  
  this._timer.start();
};

proto.abort = function(vRequest) {
  this.error("Needs implementation", "abort");
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
  
  if (this._timer)
  {
    this._timer.dispose();
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
