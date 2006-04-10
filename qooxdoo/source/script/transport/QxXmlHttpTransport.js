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
#post(QxXmlHttpTransportCore)

************************************************************************ */

function QxXmlHttpTransport()
{
  QxCommonTransport.call(this);

  this._req = QxXmlHttpTransport.createRequestObject();

  var o = this;
  this._req.onreadystatechange = function(e) { return o._onreadystatechange(e); };
};

QxXmlHttpTransport.extend(QxCommonTransport, "QxXmlHttpTransport");









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






/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

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
    vUrl += (vUrl.indexOf(QxConst.CORE_QUESTIONMARK) >= 0 ? QxConst.CORE_AMPERSAND : QxConst.CORE_QUESTIONMARK) + vParametersList.join(QxConst.CORE_AMPERSAND);
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

/*!
  Force the transport into the failed state
  (QxConst.REQUEST_STATE_FAILED).

  This method should be used only if the requests URI was local
  access. I.e. it started with "file://".
*/
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
  EVENT HANDLER
---------------------------------------------------------------------------
*/

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
    this.setState(QxTransport._nativeMap[++this._lastReadyState]);
  };
};







/*
---------------------------------------------------------------------------
  READY STATE
---------------------------------------------------------------------------
*/
/*!
  Get the ready state of this transports request.

  For QxXmlHttpTransports, the ready state is a number between 1 to 4.
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
/*!
  Add a request header to this transports request.
*/
proto.setRequestHeader = function(vLabel, vValue) {
  this._req.setRequestHeader(vLabel, vValue);
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
  Provides a hash of all response headers.
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

proto.getResponseContent = function()
{
  if (this.getState() !== QxConst.REQUEST_STATE_COMPLETED)
  {
    if (QxSettings.enableTransportDebug) {
      this.warn("Transfer not complete, ignoring content!");
    };

    return null;
  };

  if (QxSettings.enableTransportDebug) {
    this.debug("Returning content for responseType: " + this.getResponseType());
  };

  switch(this.getResponseType())
  {
    case QxConst.MIMETYPE_TEXT:
    case QxConst.MIMETYPE_HTML:
      return this.getResponseText();

    case QxConst.MIMETYPE_JSON:
    case QxConst.MIMETYPE_JAVASCRIPT:
      try {
        return eval("(" + this.getResponseText() + ")");
      } catch(ex) {
        return this.error("Could not execute javascript/json: " + ex, "getResponseContent");
      };

    case QxConst.MIMETYPE_XML:
      return this.getResponseXml();

    default:
      this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
      return null;
  };
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
      this.getRequest().abort();
      this.createDispatchEvent(QxConst.EVENT_TYPE_ABORTED);
      break;

    case QxConst.REQUEST_STATE_FAILED:
      this.getRequest().abort();
      this.createDispatchEvent(QxConst.EVENT_TYPE_FAILED);
      break;

    case QxConst.REQUEST_STATE_TIMEOUT:
      this.getRequest().abort();
      this.createDispatchEvent(QxConst.EVENT_TYPE_TIMEOUT);
      break;
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

  return QxCommonTransport.prototype.dispose.call(this);
};
