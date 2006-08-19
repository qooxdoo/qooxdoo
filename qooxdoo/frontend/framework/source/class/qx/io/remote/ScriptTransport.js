/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org
     2006 by Derrell Lipman
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)
     * Andreas Junghans (lucidcake)

************************************************************************ */

/* ************************************************************************

#module(io_remote)
#require(qx.io.remote.RemoteExchange)
#require(qx.constant.Mime)

************************************************************************ */

/*!
  Transports requests to a server using dynamic script tags.

  This class should not be used directly by client programmers.
 */
qx.OO.defineClass("qx.io.remote.JsTransport", qx.io.remote.AbstractRemoteTransport,
function()
{
  qx.io.remote.AbstractRemoteTransport.call(this);
  
  var vUniqueId = ++qx.io.remote.JsTransport._uniqueId;
  if (vUniqueId >= 2000000000) {
    qx.io.remote.JsTransport._uniqueId = vUniqueId = 1;
  }

  this._element = null;
  this._uniqueId = vUniqueId;
});

qx.Class._uniqueId = 0;
qx.Class._instanceRegistry = {};
qx.Class.JSTRANSPORT_PREFIX = "_jstransport_";
qx.Class.JSTRANSPORT_ID_PARAM = qx.Class.JSTRANSPORT_PREFIX + "id";
qx.Class.JSTRANSPORT_DATA_PARAM = qx.Class.JSTRANSPORT_PREFIX + "data";
qx.Proto._lastReadyState = 0;





/*
---------------------------------------------------------------------------
  CLASS PROPERTIES AND METHODS
---------------------------------------------------------------------------
*/

// basic registration to qx.io.remote.RemoteExchange
// the real availability check (activeX stuff and so on) follows at the first real request
qx.io.remote.RemoteExchange.registerType(qx.io.remote.JsTransport, "qx.io.remote.JsTransport");

qx.io.remote.JsTransport.handles =
{
  synchronous : false,
  asynchronous : true,
  crossDomain : true,
  fileUpload: false,
  responseTypes : [ qx.constant.Mime.TEXT, qx.constant.Mime.JAVASCRIPT, qx.constant.Mime.JSON ]
}

qx.io.remote.JsTransport.isSupported = function() {
  return true;
}






/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

qx.Proto.send = function()
{
  var vUrl = this.getUrl();



  // --------------------------------------
  //   Adding parameters
  // --------------------------------------

  vUrl += (vUrl.indexOf(qx.constant.Core.QUESTIONMARK) >= 0 ? qx.constant.Core.AMPERSAND : qx.constant.Core.QUESTIONMARK) + qx.io.remote.JsTransport.JSTRANSPORT_ID_PARAM + qx.constant.Core.EQUAL + this._uniqueId;

  var vParameters = this.getParameters();
  var vParametersList = [];
  for (var vId in vParameters) {
    if (vId.indexOf(qx.io.remote.JsTransport.JSTRANSPORT_PREFIX) == 0) {
      this.error("Illegal parameter name. The following prefix is used internally by qooxdoo): " +
        qx.io.remote.JsTransport.JSTRANSPORT_PREFIX);
    }
    vParametersList.push(vId + qx.constant.Core.EQUAL + vParameters[vId]);
  }

  if (vParametersList.length > 0) {
    vUrl += qx.constant.Core.AMPERSAND + vParametersList.join(qx.constant.Core.AMPERSAND);
  }



  // --------------------------------------
  //   Sending data
  // --------------------------------------

  vData = this.getData();
  if (vData != null) {
    vUrl += qx.constant.Core.AMPERSAND + qx.io.remote.JsTransport.JSTRANSPORT_DATA_PARAM + qx.constant.Core.EQUAL + encodeURIComponent(vData);
  }
  
  qx.io.remote.JsTransport._instanceRegistry[this._uniqueId] = this;
  this._element = document.createElement("script");
  this._element.charset = "utf-8";  // IE needs this (it ignores the
                                    // encoding from the header sent by the
                                    // server for dynamic script tags)
  this._element.src = vUrl;
  
  document.body.appendChild(this._element);
}





/*
---------------------------------------------------------------------------
  EVENT LISTENER
---------------------------------------------------------------------------
*/

// For reference:
// http://msdn.microsoft.com/workshop/author/dhtml/reference/properties/readyState_1.asp
qx.io.remote.JsTransport._numericMap =
{
  "uninitialized" : 1,
  "loading" : 2,
  "loaded" : 2,
  "interactive" : 3,
  "complete" : 4
}

qx.Proto._switchReadyState = function(vReadyState)
{
  // Ignoring already stopped requests
  switch(this.getState())
  {
    case qx.constant.Net.STATE_COMPLETED:
    case qx.constant.Net.STATE_ABORTED:
    case qx.constant.Net.STATE_FAILED:
    case qx.constant.Net.STATE_TIMEOUT:
      this.warn("Ignore Ready State Change");
      return;
  }

  // Updating internal state
  while (this._lastReadyState < vReadyState) {
    this.setState(qx.io.remote.RemoteExchange._nativeMap[++this._lastReadyState]);
  }
}
qx.Class._requestFinished = function(id, content) {
  var vInstance = qx.io.remote.JsTransport._instanceRegistry[id];
  if (vInstance == null) {
    if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
      this.warn("Request finished for an unknown instance (probably aborted or timed out before)");
    }
  } else {
    vInstance._responseContent = content;
    vInstance._switchReadyState(qx.io.remote.JsTransport._numericMap.complete);
  }
}





/*
---------------------------------------------------------------------------
  REQUEST HEADER SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.setRequestHeader = function(vLabel, vValue)
{
  // TODO
  // throw new Error("setRequestHeader is abstract");
}






/*
---------------------------------------------------------------------------
  RESPONSE HEADER SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.getResponseHeader = function(vLabel)
{
  return null;

  // TODO
  // this.error("Need implementation", "getResponseHeader");
}

/*!
  Provides an hash of all response headers.
*/
qx.Proto.getResponseHeaders = function()
{
  return {}

  // TODO
  // throw new Error("getResponseHeaders is abstract");
}







/*
---------------------------------------------------------------------------
  STATUS SUPPORT
---------------------------------------------------------------------------
*/

/*!
  Returns the current status code of the request if available or -1 if not.
*/
qx.Proto.getStatusCode = function()
{
  return 200;

  // TODO
  // this.error("Need implementation", "getStatusCode");
}

/*!
  Provides the status text for the current request if available and null otherwise.
*/
qx.Proto.getStatusText = function()
{
  return qx.constant.Core.EMPTY;

  // TODO
  // this.error("Need implementation", "getStatusText");
}







/*
---------------------------------------------------------------------------
  RESPONSE DATA SUPPORT
---------------------------------------------------------------------------
*/

/*!
  Returns the length of the content as fetched thus far
*/
qx.Proto.getFetchedLength = function()
{
  return 0;

  // TODO
  // throw new Error("getFetchedLength is abstract");
}

qx.Proto.getResponseContent = function()
{
  if (this.getState() !== qx.constant.Net.STATE_COMPLETED)
  {
    if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
      this.warn("Transfer not complete, ignoring content!");
    }

    return null;
  }

  if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
    this.debug("Returning content for responseType: " + this.getResponseType());
  }

  switch(this.getResponseType())
  {
    case qx.constant.Mime.TEXT:
      // server is responsible for using a string as the response

    case qx.constant.Mime.JSON:

    case qx.constant.Mime.JAVASCRIPT:
      return this._responseContent;

    default:
      this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
      return null;
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

  if (this._element != null)
  {
    delete qx.io.remote.JsTransport._instanceRegistry[this._uniqueId];
    document.body.removeChild(this._element);
    this._element = null;
  }

  return qx.io.remote.AbstractRemoteTransport.prototype.dispose.call(this);
}
