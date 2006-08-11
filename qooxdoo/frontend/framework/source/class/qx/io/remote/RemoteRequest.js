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

#module(io_remote)
#require(qx.constant.Mime)
#require(qx.constant.Net)

************************************************************************ */

/*!
  This class is used to send HTTP requests to the server.
  @param vUrl Target url to issue the request to.
  @param vMethod Determines what type of request to issue (GET or
  POST). Default is GET.
  @param vResponseType The mime type of the response. Default is text/plain.
*/
qx.OO.defineClass("qx.io.remote.RemoteRequest", qx.core.Target,
function(vUrl, vMethod, vResponseType)
{
  qx.core.Target.call(this);

  this._requestHeaders = {};
  this._parameters = {};

  this.setUrl(vUrl);
  this.setMethod(vMethod || qx.constant.Net.METHOD_GET);
  this.setResponseType(vResponseType || qx.constant.Mime.TEXT);

  this.setProhibitCaching(true);

  // Prototype-Style Request Headers
  this.setRequestHeader("X-Requested-With", "qooxdoo");
  this.setRequestHeader("X-Qooxdoo-Version", qx.core.Version.toString());

  // Get the next sequence number for this request
  this._seqNum = ++qx.io.remote.RemoteRequest._seqNum;
});




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/
/*!
  Target url to issue the request to.
*/
qx.OO.addProperty({ name : "url", type : qx.constant.Type.STRING });
/*!
  Determines what type of request to issue (GET or POST).
*/
qx.OO.addProperty(
{
  name           : "method",
  type           : qx.constant.Type.STRING,
  possibleValues : [
                   qx.constant.Net.METHOD_GET, qx.constant.Net.METHOD_POST,
                   qx.constant.Net.METHOD_PUT, qx.constant.Net.METHOD_HEAD,
                   qx.constant.Net.METHOD_DELETE
                   ]
});
/*!
  Set the request to asynchronous.
*/
qx.OO.addProperty({ name : "asynchronous", type : qx.constant.Type.BOOLEAN, defaultValue : true,
                    getAlias: "isAsynchronous" });
/*!
  Set the data to be sent via this request
*/
qx.OO.addProperty({ name : "data", type : qx.constant.Type.STRING });
/*!
  Username to use for HTTP authentication. Null if HTTP authentication
  is not used.
*/
qx.OO.addProperty({ name : "username", type : qx.constant.Type.STRING });
/*!
  Password to use for HTTP authentication. Null if HTTP authentication
  is not used.
*/
qx.OO.addProperty({ name : "password", type : qx.constant.Type.STRING });
qx.OO.addProperty(
{
  name           : "state",
  type           : qx.constant.Type.STRING,
  possibleValues : [
                   qx.constant.Net.STATE_CONFIGURED, qx.constant.Net.STATE_QUEUED,
                   qx.constant.Net.STATE_SENDING, qx.constant.Net.STATE_RECEIVING,
                   qx.constant.Net.STATE_COMPLETED, qx.constant.Net.STATE_ABORTED,
                   qx.constant.Net.STATE_TIMEOUT, qx.constant.Net.STATE_FAILED
                   ],
  defaultValue   : qx.constant.Net.STATE_CONFIGURED
});
/*
  Response type of request.

  The response type is a MIME type, default is text/plain. Other
  supported MIME types are text/javascript, text/html, text/json,
  application/xml.
*/
qx.OO.addProperty({
  name           : "responseType",
  type           : qx.constant.Type.STRING,
  possibleValues : [
                   qx.constant.Mime.TEXT,
                   qx.constant.Mime.JAVASCRIPT, qx.constant.Mime.JSON,
                   qx.constant.Mime.XML, qx.constant.Mime.HTML
                   ]
});
/*!
  Number of millieseconds before the request is being timed out.

  If this property is null, the timeout for the request comes is the
  qx.io.remote.RemoteRequestQueue's property defaultTimeout.
*/
qx.OO.addProperty({ name : "timeout", type : qx.constant.Type.NUMBER });

/*!
  Prohibit request from being cached.

  Setting the value to true adds a parameter "nocache" to the request
  with a value of the current time. Setting the value to false removes
  the parameter.
*/
qx.OO.addProperty({ name : "prohibitCaching", type : qx.constant.Type.BOOLEAN });
/*!
  Indicate that the request is cross domain.

  A request is cross domain if the request's URL points to a host other
  than the local host. This switches the concrete implementation that
  is used for sending the request from qx.io.remote.XmlHttpTransport to
  qx.io.remote.IframeTransport because only the latter can handle cross domain
  requests.
*/
qx.OO.addProperty({ name : "crossDomain", type : qx.constant.Type.BOOLEAN, defaultValue : false });
/*!
  The transport instance used for the request.

  This is necessary to be able to abort an asynchronous request.
*/
qx.OO.addProperty({ name : "transport", type : qx.constant.Type.OBJECT, instance : "qx.io.remote.RemoteExchange" });






/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/
/*!
  Schedule this request for transport to server.

  The request is added to the singleton class qx.io.remote.RemoteRequestQueue's list of
  pending requests.
*/
qx.Proto.send = function() {
  qx.io.remote.RemoteRequestQueue.add(this);
}

/*!
  Abort sending this request.

  The request is removed from the singleton class qx.io.remote.RemoteRequestQueue's
  list of pending events. If the request haven't been scheduled this
  method is a noop.
*/
qx.Proto.abort = function() {
  qx.io.remote.RemoteRequestQueue.abort(this);
}

qx.Proto.reset = function()
{
  switch(this.getState())
  {
    case qx.constant.Net.STATE_SENDING:
    case qx.constant.Net.STATE_RECEIVING:
      this.error("Aborting already sent request!");
      // no break

    case qx.constant.Net.STATE_QUEUED:
      this.abort();
      break;
  }
}







/*
---------------------------------------------------------------------------
  STATE ALIASES
---------------------------------------------------------------------------
*/

qx.Proto.isConfigured = function() {
  return this.getState() === qx.constant.Net.STATE_CONFIGURED;
}

qx.Proto.isQueued = function() {
  return this.getState() === qx.constant.Net.STATE_QUEUED;
}

qx.Proto.isSending = function() {
  return this.getState() === qx.constant.Net.STATE_SENDING;
}

qx.Proto.isReceiving = function() {
  return this.getState() === qx.constant.Net.STATE_RECEIVING;
}

qx.Proto.isCompleted = function() {
  return this.getState() === qx.constant.Net.STATE_COMPLETED;
}

qx.Proto.isAborted = function() {
  return this.getState() === qx.constant.Net.STATE_ABORTED;
}

qx.Proto.isTimeout = function() {
  return this.getState() === qx.constant.Net.STATE_TIMEOUT;
}

/*!
  Return true if the request is in the failed state
  (qx.constant.Net.STATE_FAILED).
*/
qx.Proto.isFailed = function() {
  return this.getState() === qx.constant.Net.STATE_FAILED;
}







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onqueued = function(e)
{
  // Modify internal state
  this.setState(qx.constant.Net.STATE_QUEUED);

  // Bubbling up
  this.dispatchEvent(e);
}

qx.Proto._onsending = function(e)
{
  // Modify internal state
  this.setState(qx.constant.Net.STATE_SENDING);

  // Bubbling up
  this.dispatchEvent(e);
}

qx.Proto._onreceiving = function(e)
{
  // Modify internal state
  this.setState(qx.constant.Net.STATE_RECEIVING);

  // Bubbling up
  this.dispatchEvent(e);
}

qx.Proto._oncompleted = function(e)
{
  // Modify internal state
  this.setState(qx.constant.Net.STATE_COMPLETED);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
}

qx.Proto._onaborted = function(e)
{
  // Modify internal state
  this.setState(qx.constant.Net.STATE_ABORTED);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
}

qx.Proto._ontimeout = function(e)
{
/*
  // User's handler can block until timeout.
  switch(this.getState())
  {
    // If we're no longer running...
    case qx.constant.Net.STATE_COMPLETED:
    case qx.constant.Net.STATE_TIMEOUT:
    case qx.constant.Net.STATE_ABORTED:
    case qx.constant.Net.STATE_FAILED:
      // then don't bubble up the timeout event
      return;
  }
*/

  // Modify internal state
  this.setState(qx.constant.Net.STATE_TIMEOUT);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
}

qx.Proto._onfailed = function(e)
{
  // Modify internal state
  this.setState(qx.constant.Net.STATE_FAILED);

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
}








/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyState = function(propValue, propOldValue, propData)
{
  if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
    this.debug("State: " + propValue);
  }

  return true;
}

qx.Proto._modifyProhibitCaching = function(propValue, propOldValue, propData)
{
  propValue ? this.setParameter("nocache", new Date().valueOf()) : this.removeParameter("nocache");

  return true;
}

qx.Proto._modifyMethod = function(propValue, propOldValue, propData)
{
  if (propValue === qx.constant.Net.METHOD_POST) {
    this.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  }

  return true;
}

qx.Proto._modifyResponseType = function(propValue, propOldValue, propData)
{
  this.setRequestHeader("X-Qooxdoo-Response-Type", propValue);
  return true;
}







/*
---------------------------------------------------------------------------
  REQUEST HEADER
---------------------------------------------------------------------------
*/
/*!
  Add a request header to the request.

  Example: request.setRequestHeader("Content-Type", "text/html")
*/
qx.Proto.setRequestHeader = function(vId, vValue) {
  this._requestHeaders[vId] = vValue;
}

qx.Proto.removeRequestHeader = function(vId) {
  delete this._requestHeaders[vId];
}

qx.Proto.getRequestHeader = function(vId) {
  return this._requestHeaders[vId] || null;
}

qx.Proto.getRequestHeaders = function() {
  return this._requestHeaders;
}









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
qx.Proto.setParameter = function(vId, vValue) {
  this._parameters[vId] = vValue;
}

/*!
  Remove a parameter from the request.

  @param vId String identifier of the parameter to remove.
*/
qx.Proto.removeParameter = function(vId) {
  delete this._parameters[vId];
}

/*!
  Get a parameter in the request.

  @param vId String identifier of the parameter to get.
*/
qx.Proto.getParameter = function(vId) {
  return this._parameters[vId] || null;
}

/*!
  Returns an object containg all parameters for the request.
*/
qx.Proto.getParameters = function() {
  return this._parameters;
}








/*
---------------------------------------------------------------------------
  SEQUENCE NUMBER
---------------------------------------------------------------------------
*/

/*
 * Sequence (id) number of a request, used to associate a response or error
 * with its initiating request.
 */
qx.io.remote.RemoteRequest._seqNum = 0;

/**
 * Obtain the sequence (id) number used for this request
 */
qx.Proto.getSequenceNumber = function() {
  return this._seqNum;
}






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  this._requestHeaders = null;
  this._parameters = null;

  this.setTransport(null);

  return qx.core.Target.prototype.dispose.call(this);
}
