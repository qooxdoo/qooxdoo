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

function QxRequest(vUrl)
{
  QxTarget.call(this);

  this.setUrl(vUrl);
};

QxRequest.extend(QxTarget, "QxRequest");






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxRequest.addProperty({ name : "url", type : QxConst.TYPEOF_STRING });
QxRequest.addProperty(
{
  name           : "method",
  type           : QxConst.TYPEOF_STRING,
  possibleValues : [
                   QxConst.METHOD_GET, QxConst.METHOD_POST,
                   QxConst.METHOD_PUT, QxConst.METHOD_HEAD,
                   QxConst.METHOD_DELETE
                   ],
  defaultValue   : QxConst.METHOD_POST
});
QxRequest.addProperty({ name : "asynchronous", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });
QxRequest.addProperty({ name : "data", type : QxConst.TYPEOF_STRING });
QxRequest.addProperty({ name : "username", type : QxConst.TYPEOF_STRING });
QxRequest.addProperty({ name : "password", type : QxConst.TYPEOF_STRING });
QxRequest.addProperty(
{
  name           : "state",
  type           : QxConst.TYPEOF_STRING,
  possibleValues : [
                   QxConst.REQUEST_STATE_CONFIGURED, QxConst.REQUEST_STATE_QUEUED,
                   QxConst.REQUEST_STATE_SENDING, QxConst.REQUEST_STATE_RECEIVING,
                   QxConst.REQUEST_STATE_COMPLETED, QxConst.REQUEST_STATE_ABORTED,
                   QxConst.REQUEST_STATE_TIMEOUT, QxConst.REQUEST_STATE_FAILED
                   ],
  defaultValue   : QxConst.REQUEST_STATE_CONFIGURED
});
QxRequest.addProperty({ name : "timeout", type : QxConst.TYPEOF_NUMBER });






/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

proto.send = function() {
  QxRequestQueue.add(this);
};

proto.abort = function() {
  QxRequestQueue.abort(this);
};

proto.reset = function()
{
  switch(this.getState())
  {
    case QxConst.REQUEST_STATE_SENDING:
    case QxConst.REQUEST_STATE_RECEIVING:
      this.error("Aborting already sent request!");
      // no break

    case QxConst.REQUEST_STATE_QUEUED:
      this.abort();
      break;
  };
};







/*
---------------------------------------------------------------------------
  STATE ALIASES
---------------------------------------------------------------------------
*/

proto.isConfigured = function() {
  return this.getState() === QxConst.REQUEST_STATE_CONFIGURED;
};

proto.isQueued = function() {
  return this.getState() === QxConst.REQUEST_STATE_QUEUED;
};

proto.isSending = function() {
  return this.getState() === QxConst.REQUEST_STATE_SENDING;
};

proto.isReceiving = function() {
  return this.getState() === QxConst.REQUEST_STATE_RECEIVING;
};

proto.isCompleted = function() {
  return this.getState() === QxConst.REQUEST_STATE_COMPLETED;
};

proto.isAborted = function() {
  return this.getState() === QxConst.REQUEST_STATE_ABORTED;
};

proto.isTimeout = function() {
  return this.getState() === QxConst.REQUEST_STATE_TIMEOUT;
};

proto.isFailed = function() {
  return this.getState() === QxConst.REQUEST_STATE_FAILED;
};






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onqueued = function(e)
{
  // Modify internal state
  this.setState(QxConst.REQUEST_STATE_QUEUED);

  // Bubbling up
  this.dispatchEvent(e);
};

proto._onsending = function(e)
{
  // Modify internal state
  this.setState(QxConst.REQUEST_STATE_SENDING);

  // Bubbling up
  this.dispatchEvent(e);
};

proto._onreceiving = function(e)
{
  // Modify internal state
  this.setState(QxConst.REQUEST_STATE_RECEIVING);

  // Bubbling up
  this.dispatchEvent(e);
};

proto._oncompleted = function(e)
{
  // Modify internal state
  this.setState(QxConst.REQUEST_STATE_COMPLETED);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
};

proto._onaborted = function(e)
{
  // Modify internal state
  this.setState(QxConst.REQUEST_STATE_ABORTED);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
};

proto._ontimeout = function(e)
{
  // Modify internal state
  this.setState(QxConst.REQUEST_STATE_TIMEOUT);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
};

proto._onfailed = function(e)
{
  // Modify internal state
  this.setState(QxConst.REQUEST_STATE_FAILED);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
};






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyState = function(propValue, propOldValue, propData)
{
  if (QxSettings.enableTransportDebug) {
    this.debug("State: " + propValue);
  };

  return true;
};








/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (QxSettings.enableTransportDebug) {
    this.debug("Disposing...");
  };

  return QxTarget.prototype.dispose.call(this);
};
