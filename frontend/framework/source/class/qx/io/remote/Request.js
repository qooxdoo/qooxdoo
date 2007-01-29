/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org
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
#require(qx.net.Http)
#require(qx.util.Mime)

************************************************************************ */

/**
 * This class is used to send HTTP requests to the server.
 *
 * @event created {qx.event.type.Event}
 * @event configured {qx.event.type.Event}
 * @event sending {qx.event.type.Event}
 * @event receiving {qx.event.type.Event}
 * @event completed {qx.event.type.Event}
 * @event failed {qx.event.type.Event}
 * @event aborted {qx.event.type.Event}
 * @event timeout {qx.event.type.Event}
 *
 * @param vUrl {String}
 *   Target url to issue the request to.
 *
 * @param vMethod {String}
 *   Determines that type of request to issue (GET or POST). Default is GET. 
 *
 * @param vResponseType {String}
 *   The mime type of the response. Default is text/plain {@link qx.util.Mime}.
 */
qx.OO.defineClass("qx.io.remote.Request", qx.core.Target,
function(vUrl, vMethod, vResponseType)
{
  qx.core.Target.call(this);

  this._requestHeaders = {};
  this._parameters = {};
  this._formFields = {};

  this.setUrl(vUrl);
  this.setMethod(vMethod || qx.net.Http.METHOD_GET);
  this.setResponseType(vResponseType || qx.util.Mime.TEXT);

  this.setProhibitCaching(true);

  // Prototype-Style Request Headers
  this.setRequestHeader("X-Requested-With", "qooxdoo");
  this.setRequestHeader("X-Qooxdoo-Version", qx.core.Version.toString());

  // Get the next sequence number for this request
  this._seqNum = ++qx.io.remote.Request._seqNum;
});




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/
/**
 * Target url to issue the request to.
 */
qx.OO.addProperty({ name : "url", type : "string" });

/**
 * Determines what type of request to issue (GET or POST).
 */
qx.OO.addProperty(
{
  name           : "method",
  type           : "string",
  possibleValues : [
                     qx.net.Http.METHOD_GET,
                     qx.net.Http.METHOD_POST,
                     qx.net.Http.METHOD_PUT,
                     qx.net.Http.METHOD_HEAD,
                     qx.net.Http.METHOD_DELETE
                   ]
});

/**
 * Set the request to asynchronous.
 */
qx.OO.addProperty(
{
  name         : "asynchronous",
  type         : "boolean",
  defaultValue : true,
  getAlias     : "isAsynchronous"
});

/**
 * Set the data to be sent via this request
 */
qx.OO.addProperty({ name : "data", type : "string" });

/**
 * Username to use for HTTP authentication.
 * Set to NULL if HTTP authentication is not used.
 */
qx.OO.addProperty({ name : "username", type : "string" });

/**
 * Password to use for HTTP authentication.
 * Set to NULL if HTTP authentication is not used.
 */
qx.OO.addProperty({ name : "password", type : "string" });

/**
 * The state that the request is in, while being processed.
 */
qx.OO.addProperty(
{
  name           : "state",
  type           : "string",
  possibleValues : [
                     "configured",
                     "queued",
                     "sending",
                     "receiving",
                     "completed",
                     "aborted",
                     "timeout",
                     "failed"
                   ],
  defaultValue   : "configured"
});

/**
 * Response type of request.
 *
 * The response type is a MIME type, default is text/plain. Other supported
 * MIME types are text/javascript, text/html, application/json,
 * application/xml.
 *
 * @see qx.util.Mime
 */
qx.OO.addProperty({
  name           : "responseType",
  type           : "string",
  possibleValues : [
                     qx.util.Mime.TEXT,
                     qx.util.Mime.JAVASCRIPT,
                     qx.util.Mime.JSON,
                     qx.util.Mime.XML,
                     qx.util.Mime.HTML
                   ]
});

/**
 * Number of millieseconds before the request is being timed out.
 *
 * If this property is null, the timeout for the request comes is the
 * qx.io.remote.RequestQueue's property defaultTimeout.
 */
qx.OO.addProperty({ name : "timeout", type : "number" });

/**
 * Prohibit request from being cached.
 *
 * Setting the value to <i>true</i> adds a parameter "nocache" to the request
 * with a value of the current time. Setting the value to <i>false</i> removes
 * the parameter.
 */
qx.OO.addProperty({ name : "prohibitCaching", type : "boolean" });

/**
 * Indicate that the request is cross domain.
 *
 * A request is cross domain if the request's URL points to a host other than
 * the local host. This switches the concrete implementation that is used for
 * sending the request from qx.io.remote.XmlHttpTransport to
 * qx.io.remote.ScriptTransport, because only the latter can handle cross
 * domain requests.
 */
qx.OO.addProperty(
{
  name         : "crossDomain",
  type         : "boolean",
  defaultValue : false
});

/**
 * Indicate that the request will be used for a file upload.
 *
 * The request will be used for a file upload.  This switches the concrete
 * implementation that is used for sending the request from
 * qx.io.remote.XmlHttpTransport to qx.io.remote.IFrameTransport, because only
 * the latter can handle file uploads.
 */
qx.OO.addProperty(
{
  name         : "fileUpload",
  type         : "boolean",
  defaultValue : false
});

/**
 * The transport instance used for the request.
 *
 * This is necessary to be able to abort an asynchronous request.
 */
qx.OO.addProperty(
{
  name     : "transport",
  type     : "object",
  instance : "qx.io.remote.Exchange"
});

/**
 * Use Basic HTTP Authentication.
 */
qx.OO.addProperty({ name : "useBasicHttpAuth", type : "boolean" });






/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

/**
 * Schedule this request for transport to server.
 *
 * The request is added to the singleton class qx.io.remote.RequestQueue's
 * list of pending requests.
 */
qx.Proto.send = function() {
  qx.io.remote.RequestQueue.getInstance().add(this);
}

/**
 * Abort sending this request.
 *
 * The request is removed from the singleton class qx.io.remote.RequestQueue's
 * list of pending events. If the request haven't been scheduled this
 * method is a noop.
 */
qx.Proto.abort = function() {
  qx.io.remote.RequestQueue.getInstance().abort(this);
}

/**
 * Abort sending this request if it has not already been aborted.
 */
qx.Proto.reset = function()
{
  switch(this.getState())
  {
    case "sending":
    case "receiving":
      this.error("Aborting already sent request!");
      // no break

    case "queued":
      this.abort();
      break;
  }
}







/*
---------------------------------------------------------------------------
  STATE ALIASES
---------------------------------------------------------------------------
*/

/**
 * Determine if this request is in the configured state.
 *
 * @return {Boolean}
 *   <true> if the request is in the configured state; <false> otherwise.
 */
qx.Proto.isConfigured = function() {
  return this.getState() === "configured";
}

/**
 * Determine if this request is in the queued state.
 *
 * @return {Boolean}
 *   <true> if the request is in the queued state; <false> otherwise.
 */
qx.Proto.isQueued = function() {
  return this.getState() === "queued";
}

/**
 * Determine if this request is in the sending state.
 *
 * @return {Boolean}
 *   <true> if the request is in the sending state; <false> otherwise.
 */
qx.Proto.isSending = function() {
  return this.getState() === "sending";
}

/**
 * Determine if this request is in the receiving state.
 *
 * @return {Boolean}
 *   <true> if the request is in the receiving state; <false> otherwise.
 */
qx.Proto.isReceiving = function() {
  return this.getState() === "receiving";
}

/**
 * Determine if this request is in the completed state.
 *
 * @return {Boolean}
 *   <true> if the request is in the completed state; <false> otherwise.
 */
qx.Proto.isCompleted = function() {
  return this.getState() === "completed";
}

/**
 * Determine if this request is in the aborted state.
 *
 * @return {Boolean}
 *   <true> if the request is in the aborted state; <false> otherwise.
 */
qx.Proto.isAborted = function() {
  return this.getState() === "aborted";
}

/**
 * Determine if this request is in the timeout state.
 *
 * @return {Boolean}
 *   <true> if the request is in the timeout state; <false> otherwise.
 */
qx.Proto.isTimeout = function() {
  return this.getState() === "timeout";
}

/**
 * Determine if this request is in the failed state.
 *
 * @return {Boolean}
 *   <true> if the request is in the failed state; <false> otherwise.
 */
qx.Proto.isFailed = function() {
  return this.getState() === "failed";
}







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

/**
 * Event handler called when the request enters the queued state.
 *
 * WARNING: THIS APPEARS TO BE AN OBSOLETE METHOD; THERE IS NO 'queued' STATE
 *
 * @param e {qx.event.type.Event}
 *   Event indicating state change
 */
qx.Proto._onqueued = function(e)
{
  // Modify internal state
  this.setState("queued");

  // Bubbling up
  this.dispatchEvent(e);
}

/**
 * Event handler called when the request enters the sending state.
 *
 * @param e {qx.event.type.Event}
 *   Event indicating state change
 */
qx.Proto._onsending = function(e)
{
  // Modify internal state
  this.setState("sending");

  // Bubbling up
  this.dispatchEvent(e);
}

/**
 * Event handler called when the request enters the receiving state.
 *
 * @param e {qx.event.type.Event}
 *   Event indicating state change
 */
qx.Proto._onreceiving = function(e)
{
  // Modify internal state
  this.setState("receiving");

  // Bubbling up
  this.dispatchEvent(e);
}

/**
 * Event handler called when the request enters the completed state.
 *
 * @param e {qx.event.type.Event}
 *   Event indicating state change
 */
qx.Proto._oncompleted = function(e)
{
  // Modify internal state
  this.setState("completed");

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
}

/**
 * Event handler called when the request enters the aborted state.
 *
 * @param e {qx.event.type.Event}
 *   Event indicating state change
 */
qx.Proto._onaborted = function(e)
{
  // Modify internal state
  this.setState("aborted");

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
}

/**
 * Event handler called when the request enters the timeout state.
 *
 * @param e {qx.event.type.Event}
 *   Event indicating state change
 */
qx.Proto._ontimeout = function(e)
{
/*
  // User's handler can block until timeout.
  switch(this.getState())
  {
    // If we're no longer running...
    case "completed":
    case "timeout":
    case "aborted":
    case "failed":
      // then don't bubble up the timeout event
      return;
  }
*/

  // Modify internal state
  this.setState("timeout");

  // Bubbling up
  this.dispatchEvent(e);

  // Automatically dispose after event completion
  this.dispose();
}

/**
 * Event handler called when the request enters the failed state.
 *
 * @param e {qx.event.type.Event}
 *   Event indicating state change
 */
qx.Proto._onfailed = function(e)
{
  // Modify internal state
  this.setState("failed");

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
  if (qx.Settings.getValueOfClass("qx.io.remote.Exchange", "enableDebug")) {
    this.debug("State: " + propValue);
  }

  return true;
}

qx.Proto._modifyProhibitCaching = function(propValue, propOldValue, propData)
{
  if (propValue) {
    // This works by making the URL unique on each request.  The actual id,
    // "nocache" is irrelevant; it's the fact that a (usually) different date
    // is added to the URL on each request that prevents caching.
    this.setParameter("nocache", new Date().valueOf());

    // Add the HTTP 1.0 request to avoid use of a cache
    this.setRequestHeader("Pragma", "no-cache");

    // Add the HTTP 1.1 request to avoid use of a cache
    this.setRequestHeader("Cache-Control", "no-cache");

  } else {
    this.removeParameter("nocache");
    this.removeRequestHeader("Pragma");
    this.removeRequestHeader("Cache-Control");
  }

  return true;
}

qx.Proto._modifyMethod = function(propValue, propOldValue, propData)
{
  if (propValue === qx.net.Http.METHOD_POST) {
    this.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  } else {
    this.removeRequestHeader("Content-Type");
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

/**
 * Add a request header to the request.
 *
 * Example: request.setRequestHeader("Content-Type", qx.util.Mime.HTML)
 *
 * @param vId {String}
 *   The identifier to use for this added header
 *
 * @param vValue {String}
 *   The value to use for this added header
 */
qx.Proto.setRequestHeader = function(vId, vValue) {
  this._requestHeaders[vId] = vValue;
}

/**
 * Remove a previously-added request header
 *
 * @param vId {String}
 *   The id of the header to be removed
 */
qx.Proto.removeRequestHeader = function(vId) {
  delete this._requestHeaders[vId];
}

/**
 * Retrieve the value of a header which was previously set
 *
 * @param vId {String}
 *   The id of the header value being requested
 *
 * @return {String}
 *   The value of the header wiith the specified id
 */
qx.Proto.getRequestHeader = function(vId) {
  return this._requestHeaders[vId] || null;
}

/**
 * Return the object containing all of the headers which have been added.
 *
 * @return {Object}
 *   The returned object has as its property names each of the ids of headers
 *   which have been added, and as each property value, the value of the
 *   property corresponding to that id.
 */
qx.Proto.getRequestHeaders = function() {
  return this._requestHeaders;
}









/*
---------------------------------------------------------------------------
  PARAMETERS
---------------------------------------------------------------------------
*/

/**
 * Add a parameter to the request.
 *
 * @param vId {String}
 *   String identifier of the parameter to add.
 *
 * @param vValue
 *   Value of parameter. May be a string (for one parameter) or an array of
 *   strings (for setting multiple parameter values with the same parameter
 *   name).
 */
qx.Proto.setParameter = function(vId, vValue) {
  this._parameters[vId] = vValue;
}

/**
 * Remove a parameter from the request.
 *
 * @param vId {String}
 *   Identifier of the parameter to remove.
 */
qx.Proto.removeParameter = function(vId) {
  delete this._parameters[vId];
}

/**
 * Get a parameter in the request.
 *
 * @param vId {String}
 *   Identifier of the parameter to get.
 */
qx.Proto.getParameter = function(vId) {
  return this._parameters[vId] || null;
}

/**
 * Returns the object containg all parameters for the request.
 *
 * @return {Object}
 *   The returned object has as its property names each of the ids of
 *   parameters which have been added, and as each property value, the value
 *   of the property corresponding to that id.
 */
qx.Proto.getParameters = function() {
  return this._parameters;
}






/*
---------------------------------------------------------------------------
  FORM FIELDS
---------------------------------------------------------------------------
*/

/**
 * Add a form field to the POST request.
 *
 * NOTE: Adding any programatic form fields using this method will switch the
 *       Transport implementation to IframeTransport.
 *
 * NOTE: Use of these programatic form fields disallow use of synchronous
 *       requests and cross-domain requests.  Be sure that you do not need
 *       those features when setting these programatic form fields.
 *
 * @param vId {String}
 *   String identifier of the form field to add.
 *
 * @param vValue {String}
 *   Value of form field
 */
qx.Proto.setFormField = function(vId, vValue) {
  this._formFields[vId] = vValue;
}

/**
 * Remove a form field from the POST request.
 *
 * @param vId {String}
 *   Identifier of the form field to remove.
 */
qx.Proto.removeFormField = function(vId) {
  delete this._formFields[vId];
}

/**
 * Get a form field in the POST request.
 *
 * @param vId {String}
 *   Identifier of the form field to get.
 */
qx.Proto.getFormField = function(vId) {
  return this._formFields[vId] || null;
}

/**
 * Returns the object containg all form fields for the POST request.
 *
 * @return {Object}
 *   The returned object has as its property names each of the ids of
 *   form fields which have been added, and as each property value, the value
 *   of the property corresponding to that id.
 */
qx.Proto.getFormFields = function() {
  return this._formFields;
}








/*
---------------------------------------------------------------------------
  SEQUENCE NUMBER
---------------------------------------------------------------------------
*/

/**
 * Sequence (id) number of a request, used to associate a response or error
 * with its initiating request.
 */
qx.io.remote.Request._seqNum = 0;

/**
 * Obtain the sequence (id) number used for this request
 *
 * @return {Integer}
 *   The sequence number of this request
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
