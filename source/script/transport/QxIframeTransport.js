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
#post(QxIframeTransportCore)
#post(QxDomIframe)

************************************************************************ */
/*!
  Transports requests to a server using an IFRAME.

  This class should not be used directly by client programmers.
 */
function QxIframeTransport()
{
  QxCommonTransport.call(this);

  var vUniqueId = (new Date).valueOf();
  var vFrameName = "frame_" + vUniqueId;
  var vFormName = "form_" + vUniqueId;

  // Mshtml allows us to define a full HTML as a parameter for createElement.
  // Using this method is the only (known) working to register the frame
  // to the known elements of the Internet Explorer.
  if (QxClient.isMshtml()) {
    this._frame = document.createElement('<iframe name="' + vFrameName + '"></iframe>');
  } else {
    this._frame = document.createElement("iframe");
  };

  this._frame.src = "javascript:void(0)";
  this._frame.id = this._frame.name = vFrameName;
  this._frame.onload = function(e) { return o._onload(e); };

  this._frame.style.width = this._frame.style.height = this._frame.style.left = this._frame.style.top = "0px";
  this._frame.style.visibility = "hidden";

  document.body.appendChild(this._frame);

  this._form = document.createElement("form");
  this._form.target = vFrameName;
  this._form.id = this._form.name = vFormName;

  this._form.style.width = this._frame.style.height = this._frame.style.left = this._frame.style.top = "0px";
  this._form.style.visibility = "hidden";

  document.body.appendChild(this._form);

  var o = this;
  this._frame.onreadystatechange = function(e) { return o._onreadystatechange(e); };
};

QxIframeTransport.extend(QxCommonTransport, "QxIframeTransport");

proto._lastReadyState = 0;





/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

proto.send = function()
{
  var vMethod = this.getMethod();
  var vAsynchronous = this.getAsynchronous();
  var vUrl = this.getUrl();



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
  //   Preparing form
  // --------------------------------------

  this._form.action = vUrl;
  this._form.method = vMethod;



  // --------------------------------------
  //   Sending data
  // --------------------------------------

  this._form.submit();
};






/*
---------------------------------------------------------------------------
  EVENT LISTENER
---------------------------------------------------------------------------
*/

// For reference:
// http://msdn.microsoft.com/workshop/author/dhtml/reference/properties/readyState_1.asp
QxIframeTransport._numericMap =
{
  "uninitialized" : 1,
  "loading" : 2,
  "loaded" : 2,
  "interactive" : 3,
  "complete" : 4
};

/*!
  Converting complete state to numeric value and update state property
*/
proto._onload = function(e)
{
  if (this._form.src) {
    return;
  };

  this._switchReadyState(QxIframeTransport._numericMap.complete);
};

/*!
  Converting named readyState to numeric value and update state property
*/
proto._onreadystatechange = function(e) {
  this._switchReadyState(QxIframeTransport._numericMap[this._frame.readyState]);
};

proto._switchReadyState = function(vReadyState)
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

  // Updating internal state
  while (this._lastReadyState < vReadyState) {
    this.setState(QxTransport._nativeMap[++this._lastReadyState]);
  };
};





/*
---------------------------------------------------------------------------
  REQUEST HEADER SUPPORT
---------------------------------------------------------------------------
*/

proto.setRequestHeader = function(vLabel, vValue)
{
  // TODO
  // this.error("Need implementation", "setRequestHeader");
};






/*
---------------------------------------------------------------------------
  RESPONSE HEADER SUPPORT
---------------------------------------------------------------------------
*/

proto.getResponseHeader = function(vLabel)
{
  return null;

  // TODO
  // this.error("Need implementation", "getResponseHeader");
};

/*!
  Provides an hash of all response headers.
*/
proto.getResponseHeaders = function()
{
  return {};

  // TODO
  // this.error("Need implementation", "getResponseHeaders");
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
  return 200;

  // TODO
  // this.error("Need implementation", "getStatusCode");
};

/*!
  Provides the status text for the current request if available and null otherwise.
*/
proto.getStatusText = function()
{
  return QxConst.CORE_EMPTY;

  // TODO
  // this.error("Need implementation", "getStatusText");
};







/*
---------------------------------------------------------------------------
  FRAME UTILITIES
---------------------------------------------------------------------------
*/

proto.getIframeWindow = function() {
  return QxDom.getIframeWindow(this._frame);
};

proto.getIframeDocument = function() {
  return QxDom.getIframeDocument(this._frame);
};

proto.getIframeBody = function() {
  return QxDom.getIframeBody(this._frame);
};








/*
---------------------------------------------------------------------------
  RESPONSE DATA SUPPORT
---------------------------------------------------------------------------
*/

proto.getIframeTextContent = function()
{
  var vBody = this.getIframeBody();

  if (!vBody) {
    return null;
  };

  // Mshtml returns the content inside a PRE
  // element if we use plain text
  if (vBody.firstChild.tagName == "PRE")
  {
    return vBody.firstChild.innerHTML;
  }
  else
  {
    return vBody.innerHTML;
  };
};

proto.getIframeHtmlContent = function()
{
  var vBody = this.getIframeBody();
  return vBody ? vBody.innerHTML : null;
};

/*!
  Returns the length of the content as fetched thus far
*/
proto.getFetchedLength = function()
{
  return 0;

  // TODO
  // this.error("Need implementation", "getFetchedLength");
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
      return this.getIframeTextContent();
      break;

    case QxConst.MIMETYPE_HTML:
      return this.getIframeHtmlContent();
      break;

    case QxConst.MIMETYPE_JSON:
    case QxConst.MIMETYPE_JAVASCRIPT:
      try {
        var vText = this.getIframeTextContent();
        return vText ? eval("(" + vText + ")") : null;
      } catch(ex) {
        return this.error("Could not execute javascript/json: " + ex, "getResponseContent");
      };

    case QxConst.MIMETYPE_XML:
      return this.getIframeDocument();

    default:
      this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
      return null;
  };
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

  if (this._frame)
  {
    this._frame.onload = null;
    this._frame.onreadystatechange = null;

    // Reset source to a blank image for gecko
    // Otherwise it will switch into a load-without-end behaviour
    if (QxClient.isGecko()) {
      this._frame.src = QxImageManager.buildUri("core/blank.gif");
    };

    // Finally remove element node
    document.body.removeChild(this._frame);

    this._frame = null;
  };

  if (this._form)
  {
    document.body.removeChild(this._form);
    this._form = null;
  };

  return QxCommonTransport.prototype.dispose.call(this);
};
