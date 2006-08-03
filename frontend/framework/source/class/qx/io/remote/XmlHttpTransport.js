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

#module(transport)
#require(qx.constant.Mime)
#require(qx.io.remote.RemoteExchange)

************************************************************************ */

qx.OO.defineClass("qx.io.remote.XmlHttpTransport", qx.io.remote.AbstractRemoteTransport,
function()
{
  qx.io.remote.AbstractRemoteTransport.call(this);

  this._req = qx.io.remote.XmlHttpTransport.createRequestObject();

  var o = this;
  this._req.onreadystatechange = function(e) { return o._onreadystatechange(e); }
});





/* ************************************************************************
   Class data, properties and methods
************************************************************************ */

// basic registration to qx.io.remote.RemoteExchange
// the real availability check (activeX stuff and so on) follows at the first real request
qx.io.remote.RemoteExchange.registerType(qx.io.remote.XmlHttpTransport, "qx.io.remote.XmlHttpTransport");

qx.io.remote.XmlHttpTransport.handles =
{
  synchronous : true,
  asynchronous : true,
  crossDomain : false,
  fileUpload: false,
  responseTypes : [ qx.constant.Mime.TEXT, qx.constant.Mime.JAVASCRIPT, qx.constant.Mime.JSON, qx.constant.Mime.XML, qx.constant.Mime.HTML ]
}

qx.io.remote.XmlHttpTransport.requestObjects = [];
qx.io.remote.XmlHttpTransport.requestObjectCount = 0;

qx.io.remote.XmlHttpTransport.isSupported = function()
{
  if (window.XMLHttpRequest)
  {
    if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
      qx.dev.log.Logger.getClassLogger(qx.io.remote.XmlHttpTransport).debug("Using XMLHttpRequest");
    }

    qx.io.remote.XmlHttpTransport.createRequestObject = qx.io.remote.XmlHttpTransport._createNativeRequestObject;
    return true;
  }

  if (window.ActiveXObject)
  {
    var vServers = [ "MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.5.0", "MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP.2.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP" ];
    var vObject;
    var vServer;

    for (var i=0, l=vServers.length; i<l; i++)
    {
      vServer = vServers[i];

      try
      {
        vObject = new ActiveXObject(vServer);
        break;
      }
      catch(ex)
      {
        vObject = null;
      }
    }

    if (vObject)
    {
      if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
        qx.dev.log.Logger.getClassLogger(qx.io.remote.XmlHttpTransport).debug("Using ActiveXObject: " + vServer);
      }

      qx.io.remote.XmlHttpTransport._activeXServer = vServer;
      qx.io.remote.XmlHttpTransport.createRequestObject = qx.io.remote.XmlHttpTransport._createActiveXRequestObject;

      return true;
    }
  }

  return false;
}

/*!
  Return a new request object suitable for the client browser.

  qx.io.remote.XmlHttpTransport's isSupported method scans which request object
  to use. The createRequestObject method is then replaced with a
  method that creates request suitable for the client browser. If the
  client browser doesn't support XMLHTTP requests, the method isn't
  replaced and the error "XMLHTTP is not supported!" is thrown.
*/
qx.io.remote.XmlHttpTransport.createRequestObject = function() {
  throw new Error("XMLHTTP is not supported!");
}

qx.io.remote.XmlHttpTransport._createNativeRequestObject = function() {
   return new XMLHttpRequest;
}

qx.io.remote.XmlHttpTransport._createActiveXRequestObject = function() {
  return new ActiveXObject(qx.io.remote.XmlHttpTransport._activeXServer);
}









/* ************************************************************************
   Instance data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

qx.Proto._localRequest = false;
qx.Proto._lastReadyState = 0;

qx.Proto.getRequest = function() {
  return this._req;
}






/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

qx.Proto.send = function()
{
  this._lastReadyState = 0;

  var vRequest = this.getRequest();
  var vMethod = this.getMethod();
  var vAsynchronous = this.getAsynchronous();
  var vUrl = this.getUrl();



  // --------------------------------------
  //   Local handling
  // --------------------------------------

  var vLocalRequest = this._localRequest = qx.sys.Client.getRunsLocally() && !(/^http(s){0,1}\:/.test(vUrl));



  // --------------------------------------
  //   Adding parameters
  // --------------------------------------

  var vParameters = this.getParameters();
  var vParametersList = [];
  for (var vId in vParameters) {
    vParametersList.push(vId + qx.constant.Core.EQUAL + vParameters[vId]);
  }

  if (vParametersList.length > 0) {
    vUrl += (vUrl.indexOf(qx.constant.Core.QUESTIONMARK) >= 0 ? qx.constant.Core.AMPERSAND : qx.constant.Core.QUESTIONMARK) + vParametersList.join(qx.constant.Core.AMPERSAND);
  }



  // --------------------------------------
  //   Opening connection
  // --------------------------------------
  if (this.getUsername()) {
    vRequest.open(vMethod, vUrl, vAsynchronous, this.getUsername(), this.getPassword());
  } else {
    vRequest.open(vMethod, vUrl, vAsynchronous);
  }



  // --------------------------------------
  //   Appliying request header
  // --------------------------------------

  var vRequestHeaders = this.getRequestHeaders();
  for (var vId in vRequestHeaders) {
    vRequest.setRequestHeader(vId, vRequestHeaders[vId]);
  }



  // --------------------------------------
  //   Sending data
  // --------------------------------------

  try
  {
    vRequest.send(this.getData());
  }
  catch(ex)
  {
    if (vLocalRequest)
    {
      this.failedLocally();
    }
    else
    {
      this.error("Failed to send data: " + ex, "send");
      this.failed();
    }

    return;
  }



  // --------------------------------------
  //   Readystate for sync reqeusts
  // --------------------------------------

  if (!vAsynchronous) {
    this._onreadystatechange();
  }
}

/*!
  Force the transport into the failed state
  (qx.constant.Net.STATE_FAILED).

  This method should be used only if the requests URI was local
  access. I.e. it started with "file://".
*/
qx.Proto.failedLocally = function()
{
  if (this.getState() === qx.constant.Net.STATE_FAILED) {
    return;
  }

  // should only occur on "file://" access
  this.warn("Could not load from file: " + this.getUrl());

  this.failed();
}









/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onreadystatechange = function(e)
{
  // Ignoring already stopped requests
  switch(this.getState())
  {
    case qx.constant.Net.STATE_COMPLETED:
    case qx.constant.Net.STATE_ABORTED:
    case qx.constant.Net.STATE_FAILED:
    case qx.constant.Net.STATE_TIMEOUT:
      if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
        this.warn("Ignore Ready State Change");
      }
      return;
  }

  // Checking status code
  var vReadyState = this.getReadyState();
  if (!qx.io.remote.RemoteExchange.wasSuccessful(this.getStatusCode(), vReadyState, this._localRequest)) {
    return this.failed();
  }

  // Updating internal state
  while (this._lastReadyState < vReadyState) {
    this.setState(qx.io.remote.RemoteExchange._nativeMap[++this._lastReadyState]);
  }
}







/*
---------------------------------------------------------------------------
  READY STATE
---------------------------------------------------------------------------
*/
/*!
  Get the ready state of this transports request.

  For qx.io.remote.XmlHttpTransports, the ready state is a number between 1 to 4.
*/
qx.Proto.getReadyState = function()
{
  var vReadyState = null;

  try {
    vReadyState = this._req.readyState;
  } catch(ex) {}

  return vReadyState;
}







/*
---------------------------------------------------------------------------
  REQUEST HEADER SUPPORT
---------------------------------------------------------------------------
*/
/*!
  Add a request header to this transports request.
*/
qx.Proto.setRequestHeader = function(vLabel, vValue) {
  this._req.setRequestHeader(vLabel, vValue);
}







/*
---------------------------------------------------------------------------
  RESPONSE HEADER SUPPORT
---------------------------------------------------------------------------
*/

/*!
  Returns a specific header provided by the server upon sending a request,
  with header name determined by the argument headerName.

  Only available at readyState 3 and 4 universally and in readyState 2
  in Gecko.
*/
qx.Proto.getResponseHeader = function(vLabel)
{
  var vResponseHeader = null;

  try {
    this.getRequest().getResponseHeader(vLabel) || null;
  } catch(ex) {}

  return vResponseHeader;
}

qx.Proto.getStringResponseHeaders = function()
{
  var vSourceHeader = null;

  try
  {
    var vLoadHeader = this._req.getAllResponseHeaders();
    if (vLoadHeader) {
      vSourceHeader = vLoadHeader;
    }
  } catch(ex) {}

  return vSourceHeader;
}

/*!
  Provides a hash of all response headers.
*/
qx.Proto.getResponseHeaders = function()
{
  var vSourceHeader = this.getStringResponseHeaders();
  var vHeader = {};

  if (vSourceHeader)
  {
    var vValues = vSourceHeader.split(/[\r\n]+/g);

    for(var i=0, l=vValues.length; i<l; i++)
    {
      var vPair = vValues[i].match(/^([^:]+)\s*:\s*(.+)$/i);
      if(vPair) {
        vHeader[vPair[1]] = vPair[2];
      }
    }
  }

  return vHeader;
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
  var vStatusCode = -1;

  try {
    vStatusCode = this.getRequest().status;
  } catch(ex) {}

  return vStatusCode;
}

/*!
  Provides the status text for the current request if available and null otherwise.
*/
qx.Proto.getStatusText = function()
{
  var vStatusText = qx.constant.Core.EMPTY;

  try {
    vStatusText = this.getRequest().statusText;
  } catch(ex) {}

  return vStatusText;
}









/*
---------------------------------------------------------------------------
  RESPONSE DATA SUPPORT
---------------------------------------------------------------------------
*/

/*!
  Provides the response text from the request when available and null otherwise.
  By passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
qx.Proto.getResponseText = function()
{
  var vResponseText = null;

  switch(this.getStatusCode())
  {
    case 0:
    case 200:
      try {
        vResponseText = this.getRequest().responseText;
      } catch(ex) {}
  }

  return vResponseText;
}

/*!
  Provides the XML provided by the response if any and null otherwise.
  By passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
qx.Proto.getResponseXml = function()
{
  var vResponseXML = null;

  switch(this.getStatusCode())
  {
    case 0:
    case 200:
      try {
        vResponseXML = this.getRequest().responseXML;
      } catch(ex) {}
  }

  return vResponseXML;
}

/*!
  Returns the length of the content as fetched thus far
*/
qx.Proto.getFetchedLength = function()
{
  var vText = this.getResponseText(true);
  return qx.util.Validation.isValidString(vText) ? vText.length : 0;
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

  var vText = this.getResponseText();

  switch(this.getResponseType())
  {
    case qx.constant.Mime.TEXT:
    case qx.constant.Mime.HTML:
      return vText;

    case qx.constant.Mime.JSON:
      try {
        return vText && vText.length > 0 ? qx.io.Json.parseQx(vText) : null;
      } catch(ex) {
        return this.error("Could not execute json: [" + vText + "]", ex);
      }

    case qx.constant.Mime.JAVASCRIPT:
      try {
        return vText && vText.length > 0 ? window.eval(vText) : null;
      } catch(ex) {
        return this.error("Could not execute javascript: [" + vText + "]", ex);
      }

    case qx.constant.Mime.XML:
      return this.getResponseXml();

    default:
      this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
      return null;
  }
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

  switch(propValue)
  {
    case qx.constant.Net.STATE_CREATED:
      this.createDispatchEvent(qx.constant.Event.CREATED);
      break;

    case qx.constant.Net.STATE_CONFIGURED:
      this.createDispatchEvent(qx.constant.Event.CONFIGURED);
      break;

    case qx.constant.Net.STATE_SENDING:
      this.createDispatchEvent(qx.constant.Event.SENDING);
      break;

    case qx.constant.Net.STATE_RECEIVING:
      this.createDispatchEvent(qx.constant.Event.RECEIVING);
      break;

    case qx.constant.Net.STATE_COMPLETED:
      this.createDispatchEvent(qx.constant.Event.COMPLETED);
      break;

    case qx.constant.Net.STATE_ABORTED:
      this.getRequest().abort();
      this.createDispatchEvent(qx.constant.Event.ABORTED);
      break;

    case qx.constant.Net.STATE_FAILED:
      this.getRequest().abort();
      this.createDispatchEvent(qx.constant.Event.FAILED);
      break;

    case qx.constant.Net.STATE_TIMEOUT:
      this.getRequest().abort();
      this.createDispatchEvent(qx.constant.Event.TIMEOUT);
      break;
  }

  return true;
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

  var vRequest = this.getRequest();

  if (vRequest)
  {
    // Should be right,
    // but is not compatible to mshtml (throws an exception)
    if (!qx.sys.Client.isMshtml()) {
      vRequest.onreadystatechange = null;
    }

    // Aborting
    switch(vRequest.readyState)
    {
      case 1:
      case 2:
      case 3:
        vRequest.abort();
    }

    // Cleanup objects
    this._req = null;
  }

  return qx.io.remote.AbstractRemoteTransport.prototype.dispose.call(this);
}
