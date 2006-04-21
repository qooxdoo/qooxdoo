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
#require(qx.io.remote.RemoteExchange)
#post(qx.dom.DomIframe)

************************************************************************ */

/*!
  Transports requests to a server using an IFRAME.

  This class should not be used directly by client programmers.
 */
qx.io.remote.IframeTransport = function()
{
  qx.io.remote.AbstractRemoteTransport.call(this);

  var vUniqueId = (new Date).valueOf();
  var vFrameName = "frame_" + vUniqueId;
  var vFormName = "form_" + vUniqueId;

  // Mshtml allows us to define a full HTML as a parameter for createElement.
  // Using this method is the only (known) working to register the frame
  // to the known elements of the Internet Explorer.
  if (qx.sys.Client.isMshtml()) {
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

qx.io.remote.IframeTransport.extend(qx.io.remote.AbstractRemoteTransport, "qx.io.remote.IframeTransport");

proto._lastReadyState = 0;





/*
---------------------------------------------------------------------------
  CLASS PROPERTIES AND METHODS
---------------------------------------------------------------------------
*/

// basic registration to qx.io.remote.RemoteExchange
// the real availability check (activeX stuff and so on) follows at the first real request
qx.io.remote.RemoteExchange.registerType(qx.io.remote.IframeTransport, "qx.io.remote.IframeTransport");

qx.io.remote.IframeTransport.handles =
{
  synchronous : false,
  asynchronous : true,
  crossDomain : true,
  fileUpload: true,
  responseTypes : [ qx.Const.MIMETYPE_TEXT, qx.Const.MIMETYPE_JAVASCRIPT, qx.Const.MIMETYPE_JSON, qx.Const.MIMETYPE_XML, qx.Const.MIMETYPE_HTML ]
};

qx.io.remote.IframeTransport.isSupported = function() {
  return true;
};






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
    vParametersList.push(vId + qx.Const.CORE_EQUAL + vParameters[vId]);
  };

  if (vParametersList.length > 0) {
    vUrl += (vUrl.indexOf(qx.Const.CORE_QUESTIONMARK) >= 0 ? qx.Const.CORE_AMPERSAND : qx.Const.CORE_QUESTIONMARK) + vParametersList.join(qx.Const.CORE_AMPERSAND);
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
qx.io.remote.IframeTransport._numericMap =
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

  this._switchReadyState(qx.io.remote.IframeTransport._numericMap.complete);
};

/*!
  Converting named readyState to numeric value and update state property
*/
proto._onreadystatechange = function(e) {
  this._switchReadyState(qx.io.remote.IframeTransport._numericMap[this._frame.readyState]);
};

proto._switchReadyState = function(vReadyState)
{
  // Ignoring already stopped requests
  switch(this.getState())
  {
    case qx.Const.REQUEST_STATE_COMPLETED:
    case qx.Const.REQUEST_STATE_ABORTED:
    case qx.Const.REQUEST_STATE_FAILED:
    case qx.Const.REQUEST_STATE_TIMEOUT:
      this.warn("Ignore Ready State Change");
      return;
  };

  // Updating internal state
  while (this._lastReadyState < vReadyState) {
    this.setState(qx.io.remote.RemoteExchange._nativeMap[++this._lastReadyState]);
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
  return qx.Const.CORE_EMPTY;

  // TODO
  // this.error("Need implementation", "getStatusText");
};







/*
---------------------------------------------------------------------------
  FRAME UTILITIES
---------------------------------------------------------------------------
*/

proto.getIframeWindow = function() {
  return qx.dom.DomIframe.getWindow(this._frame);
};

proto.getIframeDocument = function() {
  return qx.dom.DomIframe.getDocument(this._frame);
};

proto.getIframeBody = function() {
  return qx.dom.DomIframe.getBody(this._frame);
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
  if (this.getState() !== qx.Const.REQUEST_STATE_COMPLETED)
  {
    if (qx.core.Settings.enableTransportDebug) {
      this.warn("Transfer not complete, ignoring content!");
    };

    return null;
  };

  if (qx.core.Settings.enableTransportDebug) {
    this.debug("Returning content for responseType: " + this.getResponseType());
  };

  switch(this.getResponseType())
  {
    case qx.Const.MIMETYPE_TEXT:
      return this.getIframeTextContent();
      break;

    case qx.Const.MIMETYPE_HTML:
      return this.getIframeHtmlContent();
      break;

    case qx.Const.MIMETYPE_JSON:
    case qx.Const.MIMETYPE_JAVASCRIPT:
      try {
        var vText = this.getIframeTextContent();
        return vText ? eval("(" + vText + ")") : null;
      } catch(ex) {
        return this.error("Could not execute javascript/json: " + ex, "getResponseContent");
      };

    case qx.Const.MIMETYPE_XML:
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
    if (qx.sys.Client.isGecko()) {
      this._frame.src = qx.manager.object.ImageManager.buildUri("core/blank.gif");
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

  return qx.io.remote.AbstractRemoteTransport.prototype.dispose.call(this);
};
