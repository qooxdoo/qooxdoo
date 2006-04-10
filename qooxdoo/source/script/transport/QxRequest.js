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
#post(QxRequestQueue)
#post(QxConst)

************************************************************************ */

/*!
  This class is used to send HTTP requests to the server.
  @param vUrl Target url to issue the request to.
  @param vMethod Determines what type of request to issue (GET or
  POST). Default is GET.
  @param vResponseType The mime type of the response. Default is text/plain.
*/
function QxRequest(vUrl, vMethod, vResponseType)
{
  QxTarget.call(this);

  this._requestHeaders = {};
  this._parameters = {};

  this.setUrl(vUrl);
  this.setMethod(vMethod || QxConst.METHOD_GET);
  this.setResponseType(vResponseType || QxConst.MIMETYPE_TEXT);

  this.setProhibitCaching(true);

  // Prototype-Style Request Headers
  this.setRequestHeader("X-Requested-With", "qooxdoo");
  this.setRequestHeader("X-Qooxdoo-Version", QxMain.version);
};

QxRequest.extend(QxTarget, "QxRequest");






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/
/*!
  Target url to issue the request to.
*/
QxRequest.addProperty({ name : "url", type : QxConst.TYPEOF_STRING });
/*!
  Determines what type of request to issue (GET or POST).
*/
QxRequest.addProperty(
{
  name           : "method",
  type           : QxConst.TYPEOF_STRING,
  possibleValues : [
                   QxConst.METHOD_GET, QxConst.METHOD_POST,
                   QxConst.METHOD_PUT, QxConst.METHOD_HEAD,
                   QxConst.METHOD_DELETE
                   ]
});
/*!
  Set the request to asynchronous.
*/
QxRequest.addProperty({ name : "asynchronous", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });
/*!
  Set the data to be sent via this request
*/
QxRequest.addProperty({ name : "data", type : QxConst.TYPEOF_STRING });
/*!
  Username to use for HTTP authentication. Null if HTTP authentication
  is not used.
*/
QxRequest.addProperty({ name : "username", type : QxConst.TYPEOF_STRING });
/*!
  Password to use for HTTP authentication. Null if HTTP authentication
  is not used.
*/
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
/*
  Response type of request.

  The response type is a MIME type, default is text/plain. Other
  supported MIME types are text/javascript, text/html, text/json,
  application/xml.
*/
QxRequest.addProperty({
  name           : "responseType",
  type           : QxConst.TYPEOF_STRING,
  possibleValues : [
                   QxConst.MIMETYPE_TEXT,
                   QxConst.MIMETYPE_JAVASCRIPT, QxConst.MIMETYPE_JSON,
                   QxConst.MIMETYPE_XML, QxConst.MIMETYPE_HTML
                   ]
});
/*!
  Number of millieseconds before the request is being timed out.

  If this property is null, the timeout for the request comes is the
  QxRequestQueue's property defaultTimeout.
*/
QxRequest.addProperty({ name : "timeout", type : QxConst.TYPEOF_NUMBER });

/*!
  Prohibit request from being cached.

  Setting the value to true adds a parameter "nocache" to the request
  with a value of the current time. Setting the value to false removes
  the parameter.
*/
QxRequest.addProperty({ name : "prohibitCaching", type : QxConst.TYPEOF_BOOLEAN });
/*!
  Indicate that the request is cross domain.

  A request is cross domain if the requests URL points to a host other
  than the local host. This switches the concrete implementation that
  is used for sending the request from QxXmlHttpTransport to
  QxIframeTransport because only the latter can handle cross domain
  requests.
*/
QxRequest.addProperty({ name : "crossDomain", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });






/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/
/*!
  Schedule this request for transport to server.

  The request is added to the singleton class QxRequestQueue's list of
  pending requests.
*/
proto.send = function() {
  QxRequestQueue.add(this);
};

/*!
  Abort sending this request.

  The request is removed from the singleton class QxRequestQueue's
  list of pending events. If the request haven't been scheduled this
  method is a noop.
*/  
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

/*!
  Return true if the request is in the failed state
  (QxConst.REQUEST_STATE_FAILED).
*/
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

proto._modifyProhibitCaching = function(propValue, propOldValue, propData)
{
  propValue ? this.setParameter("nocache", new Date().valueOf()) : this.removeParameter("nocache");

  return true;
};

proto._modifyMethod = function(propValue, propOldValue, propData)
{
  if (propValue === QxConst.METHOD_POST) {
    this.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  };

  return true;
};

proto._modifyResponseType = function(propValue, propOldValue, propData)
{
  this.setRequestHeader("X-Qooxdoo-Response-Type", propValue);
  return true;
};






/*
---------------------------------------------------------------------------
  REQUEST HEADER
---------------------------------------------------------------------------
*/
/*!
  Add a request header to the request.

  Example: request.setRequestHeader("Content-Type", "text/html")
*/
proto.setRequestHeader = function(vId, vValue) {
  this._requestHeaders[vId] = vValue;
};

proto.removeRequestHeader = function(vId) {
  delete this._requestHeaders[vId];
};

proto.getRequestHeader = function(vId) {
  return this._requestHeaders[vId] || null;
};

proto.getRequestHeaders = function() {
  return this._requestHeaders;
};









/*
---------------------------------------------------------------------------
  PARAMETERS
---------------------------------------------------------------------------
*/
/*!
  Add a parameter to the request.

  @param vId String identifier of the parameter to add.
  @param vValue Value of parameter.
*/  
proto.setParameter = function(vId, vValue) {
  this._parameters[vId] = vValue;
};

/*!
  Remove a parameter from the request.

  @param vId String identifier of the parameter to remove.
*/
proto.removeParameter = function(vId) {
  delete this._parameters[vId];
};

/*!
  Get a parameter in the request.

  @param vId String identifier of the parameter to get.
*/
proto.getParameter = function(vId) {
  return this._parameters[vId] || null;
};

/*!
  Returns an object containg all parameters for the request.
*/
proto.getParameters = function() {
  return this._parameters;
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

  this._requestHeaders = null;
  this._parameters = null;

  /*
  if (QxSettings.enableTransportDebug) {
    this.debug("Disposing...");
  };
  */

  return QxTarget.prototype.dispose.call(this);
};
