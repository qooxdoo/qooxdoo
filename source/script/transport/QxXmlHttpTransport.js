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
#require(QxTransport)

************************************************************************ */

function QxXmlHttpTransport()
{
  QxTarget.call(this);

  this._requestHeader = {};

  this._req = QxXmlHttpTransport.createRequestObject();

  var o = this;
  this._req.onreadystatechange = function(e) { return o._onreadystatechange(e); };
};

QxXmlHttpTransport.extend(QxTarget, "QxXmlHttpTransport");

// basic registration to QxTransport
// the real availability check (activeX stuff and so on) follows at the first real request
QxTransport.registerType(QxXmlHttpTransport, "QxXmlHttpTransport");








/*
---------------------------------------------------------------------------
  GLOBAL METHOD DETECTION
---------------------------------------------------------------------------
*/

QxXmlHttpTransport.requestObjects = [];
QxXmlHttpTransport.requestObjectCount = 0;

QxXmlHttpTransport.isSupported = function()
{
  if (window.XMLHttpRequest)
  {
    // QxDebug("QxXmlHttpTransport", "Using XMLHttpRequest");

    QxXmlHttpTransport.createRequestObject = QxXmlHttpTransport._createNativeRequestObject;
    return true;
  };

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
      };
    };

    if (vObject)
    {
      // QxDebug("QxXmlHttpTransport", "Using ActiveXObject: " + vServer);

      QxXmlHttpTransport._activeXServer = vServer;
      QxXmlHttpTransport.createRequestObject = QxXmlHttpTransport._createActiveXRequestObject;

      return true;
    };
  };

  return false;
};

QxXmlHttpTransport.createRequestObject = function() {
  throw new Error("XMLHTTP is not supported!");
};

QxXmlHttpTransport._createNativeRequestObject = function() {
   return new XMLHttpRequest;
};

QxXmlHttpTransport._createActiveXRequestObject = function() {
  return new ActiveXObject(QxXmlHttpTransport._activeXServer);
};








/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Target url to issue the request to
*/
QxXmlHttpTransport.addProperty({ name : "url", type : QxConst.TYPEOF_STRING });

/*!
  Determines what type of request to issue
*/
QxXmlHttpTransport.addProperty({ name : "method", type : QxConst.TYPEOF_STRING });

/*!
  Set the request to asynchronous
*/
QxXmlHttpTransport.addProperty({ name : "asynchronous", type : QxConst.TYPEOF_BOOLEAN });

/*!
  Set the data to be sent via this request
*/
QxXmlHttpTransport.addProperty({ name : "data", type : QxConst.TYPEOF_STRING });

/*!
  Username to use for HTTP authentication
*/
QxXmlHttpTransport.addProperty({ name : "username", type : QxConst.TYPEOF_STRING });

/*!
  Password to use for HTTP authentication
*/
QxXmlHttpTransport.addProperty({ name : "password", type : QxConst.TYPEOF_STRING });

/*!
  The state of the current request
*/
QxXmlHttpTransport.addProperty(
{
  name           : "state",
  type           : QxConst.TYPEOF_STRING,
  possibleValues : [
                   QxConst.REQUEST_STATE_CREATED, QxConst.REQUEST_STATE_CONFIGURED,
                   QxConst.REQUEST_STATE_SENDING, QxConst.REQUEST_STATE_RECEIVING,
                   QxConst.REQUEST_STATE_COMPLETED, QxConst.REQUEST_STATE_ABORTED,
                   QxConst.REQUEST_STATE_TIMEOUT, QxConst.REQUEST_STATE_FAILED
                   ],
  defaultValue   : QxConst.REQUEST_STATE_CREATED
});

/*!
  Request headers
*/
QxXmlHttpTransport.addProperty({ name : "requestHeaders", type: QxConst.TYPEOF_OBJECT });

/*!
  Parameters
*/
QxXmlHttpTransport.addProperty({ name : "parameters", type: QxConst.TYPEOF_OBJECT });






/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

proto._localRequest = false;
proto._lastReadyState = 0;

proto.getRequest = function() {
  return this._req;
};

proto.send = function()
{
  this._lastReadyState = 0;

  var vRequest = this.getRequest();
  var vMethod = this.getMethod();
  var vAsynchronous = this.getAsynchronous();
  var vUrl = this.getUrl();



  // --------------------------------------
  //   Local handling
  // --------------------------------------

  var vLocalRequest = this._localRequest = QxClient.getRunsLocally() && !(/^http(s){0,1}\:/.test(vUrl));



  // --------------------------------------
  //   Adding parameters
  // --------------------------------------

  var vParameters = this.getParameters();
  var vParametersList = [];
  for (var vId in vParameters) {
    vParametersList.push(vId + QxConst.CORE_EQUAL + vParameters[vId]);
  };

  if (vParametersList.length > 0) {
    vUrl += QxConst.CORE_QUESTIONMARK + vParametersList.join(QxConst.CORE_AMPERSAND);
  };



  // --------------------------------------
  //   Opening connection
  // --------------------------------------

  if (this.getUsername()) {
    vRequest.open(vMethod, vUrl, vAsynchronous, this.getUsername(), this.getPassword());
  } else {
    vRequest.open(vMethod, vUrl, vAsynchronous);
  };



  // --------------------------------------
  //   Appliying request header
  // --------------------------------------

  var vRequestHeaders = this.getRequestHeaders();
  for (var vId in vRequestHeaders) {
    vRequest.setRequestHeader(vId, vRequestHeaders[vId]);
  };



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
    };

    return;
  };



  // --------------------------------------
  //   Readystate for sync reqeusts
  // --------------------------------------

  if (!vAsynchronous) {
    this._onreadystatechange();
  };
};

proto.abort = function()
{
  if (QxSettings.enableTransportDebug) {
    this.warn("Aborting...");
  };

  this.setState(QxConst.REQUEST_STATE_ABORTED);
};

proto.timeout = function()
{
  if (QxSettings.enableTransportDebug) {
    this.warn("Timeout...");
  };

  this.setState(QxConst.REQUEST_STATE_TIMEOUT);
};

proto.failed = function()
{
  if (QxSettings.enableTransportDebug) {
    this.warn("Failed...");
  };

  this.setState(QxConst.REQUEST_STATE_FAILED);
};

proto.failedLocally = function()
{
  if (this.getState() === QxConst.REQUEST_STATE_FAILED) {
    return;
  };

  // should only occours on "file://" access
  if (QxSettings.enableTransportDebug) {
    this.warn("Could not load from file: " + this.getUrl());
  };

  this.failed();
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

  switch(propValue)
  {
    case QxConst.REQUEST_STATE_CREATED:
      this.createDispatchEvent(QxConst.EVENT_TYPE_CREATED);
      break;

    case QxConst.REQUEST_STATE_CONFIGURED:
      this.createDispatchEvent(QxConst.EVENT_TYPE_CONFIGURED);
      break;

    case QxConst.REQUEST_STATE_SENDING:
      this.createDispatchEvent(QxConst.EVENT_TYPE_SENDING);
      break;

    case QxConst.REQUEST_STATE_RECEIVING:
      this.createDispatchEvent(QxConst.EVENT_TYPE_RECEIVING);
      break;

    case QxConst.REQUEST_STATE_COMPLETED:
      this.createDispatchEvent(QxConst.EVENT_TYPE_COMPLETED);
      break;

    case QxConst.REQUEST_STATE_ABORTED:
      this.createDispatchEvent(QxConst.EVENT_TYPE_ABORTED);
      break;

    case QxConst.REQUEST_STATE_FAILED:
      this.createDispatchEvent(QxConst.EVENT_TYPE_FAILED);
      break;

    case QxConst.REQUEST_STATE_TIMEOUT:
      this.createDispatchEvent(QxConst.EVENT_TYPE_TIMEOUT);
      break;
  };

  return true;
};







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

/*
http://msdn.microsoft.com/library/default.asp?url=/library/en-us/xmlsdk/html/0e6a34e4-f90c-489d-acff-cb44242fafc6.asp

0: UNINITIALIZED
The object has been created, but not initialized (the open method has not been called).

1: LOADING
The object has been created, but the send method has not been called.

2: LOADED
The send method has been called, but the status and headers are not yet available.

3: INTERACTIVE
Some data has been received. Calling the responseBody and responseText properties at this state to obtain partial results will return an error, because status and response headers are not fully available.

4: COMPLETED
All the data has been received, and the complete data is available in the
*/

QxXmlHttpTransport._nativeMap =
{
  0 : QxConst.REQUEST_STATE_CREATED,
  1 : QxConst.REQUEST_STATE_CONFIGURED,
  2 : QxConst.REQUEST_STATE_SENDING,
  3 : QxConst.REQUEST_STATE_RECEIVING,
  4 : QxConst.REQUEST_STATE_COMPLETED
};

proto._onreadystatechange = function(e)
{
  // Ignoring already stopped requests
  switch(this.getState())
  {
    case QxConst.REQUEST_STATE_COMPLETED:
    case QxConst.REQUEST_STATE_ABORTED:
    case QxConst.REQUEST_STATE_FAILED:
    case QxConst.REQUEST_STATE_TIMEOUT:
      this.warn("Ignore Ready State Change");
      return;
  };

  // Checking status code
  var vReadyState = this.getReadyState();
  if (!QxTransport.wasSuccessful(this.getStatusCode(), vReadyState, this._localRequest)) {
    return this.failed();
  };

  // Updating internal state
  while (this._lastReadyState < vReadyState) {
    this.setState(QxXmlHttpTransport._nativeMap[++this._lastReadyState]);
  };
};







/*
---------------------------------------------------------------------------
  READY STATE
---------------------------------------------------------------------------
*/

proto.getReadyState = function()
{
  var vReadyState = null;

  try {
    vReadyState = this._req.readyState;
  } catch(ex) {};

  return vReadyState;
};







/*
---------------------------------------------------------------------------
  REQUEST HEADER SUPPORT
---------------------------------------------------------------------------
*/

proto.setRequestHeader = function(vLabel, vValue)
{
  this._requestHeader[vLabel] = vValue;
  this._req.setRequestHeader(vLabel, vValue);
};

proto.removeRequestHeader = function()
{
  this._requestHeader[vId] = null;
  this._req.setRequestHeader(vLabel, null);
};









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
proto.getResponseHeader = function(vLabel)
{
  var vResponseHeader = null;

  try {
    this.getRequest().getResponseHeader(vLabel) || null;
  } catch(ex) {};

  return vResponseHeader;
};

proto.getStringResponseHeaders = function()
{
  var vSourceHeader = null;

  try
  {
    var vLoadHeader = this._req.getAllResponseHeaders();
    if (vLoadHeader) {
      vSourceHeader = vLoadHeader;
    };
  } catch(ex) {};

  return vSourceHeader;
};

/*!
  Provides an hash of all response headers.
*/
proto.getResponseHeaders = function()
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
  		};
  	};
  };

  return vHeader;
};








/*
---------------------------------------------------------------------------
  STATUS SUPPORT
---------------------------------------------------------------------------
*/

/*!
  Returns the current status code of the request if available or -1 if not.
*/
proto.getStatusCode = function()
{
  var vStatusCode = -1;

  try {
    vStatusCode = this.getRequest().status;
  } catch(ex) {};

  return vStatusCode;
};

/*!
  Provides the status text for the current request if available and null otherwise.
*/
proto.getStatusText = function()
{
  var vStatusText = QxConst.CORE_EMPTY;

  try {
    vStatusText = this.getRequest().statusText;
  } catch(ex) {};

  return vStatusText;
};









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
proto.getResponseText = function()
{
  var vResponseText = null;

  switch(this.getStatusCode())
  {
    case 0:
    case 200:
      try {
        vResponseText = this.getRequest().responseText;
      } catch(ex) {};
  };

  return vResponseText;
};

/*!
  Provides the XML provided by the response if any and null otherwise.
  By passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
proto.getResponseXml = function()
{
  var vResponseXML = null;

  switch(this.getStatusCode())
  {
    case 0:
    case 200:
      try {
        vResponseXML = this.getRequest().responseXML;
      } catch(ex) {};
  };

  return vResponseXML;
};

/*!
  Returns the length of the content as fetched thus far
*/
proto.getFetchedLength = function()
{
  var vText = this.getResponseText(true);
  return QxUtil.isValidString(vText) ? vText.length : 0;
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

  /*
  if (QxSettings.enableTransportDebug) {
    this.debug("Disposing...");
  };
  */

  var vRequest = this.getRequest();

  if (vRequest)
  {
    // Should be right,
    // but is not compatible to mshtml (throws an exception)
    if (!QxClient.isMshtml()) {
      vRequest.onreadystatechange = null;
    };

    // Aborting
    switch(vRequest.readyState)
    {
      case 1:
      case 2:
      case 3:
        vRequest.abort();
    };

    // Cleanup objects
    this._req = null;
  };

  this._requestHeader = null;

  return QxTarget.prototype.dispose.call(this);
};
