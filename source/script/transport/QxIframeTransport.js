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

  this._frame.src = "about:blank";
  this._frame.id = this._frame.name = vFrameName
  this._frame.onload = function(e) { return o._onload(e) };

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
  this._frame.onreadystatechange = function(e) { return o._onreadystatechange(e) };
};

QxIframeTransport.extend(QxCommonTransport, "QxIframeTransport");





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
    vUrl += QxConst.CORE_QUESTIONMARK + vParametersList.join(QxConst.CORE_AMPERSAND);
  };



  // --------------------------------------
  //   Preparing form
  // --------------------------------------

  this._form.action = vUrl;
  this._form.method = vMethod;

  this.debug("Action: " + this._form.action);
  this.debug("Method: " + this._form.method);
  this.debug("Target: " + this._form.target);


  // --------------------------------------
  //   Sending data
  // --------------------------------------

  this.debug("Before Submit");

  this._form.submit();

  this.debug("After Submit");
};






/*
---------------------------------------------------------------------------
  EVENT LISTENER
---------------------------------------------------------------------------
*/

proto._onload = function(e)
{
  this.debug("onLoad...");

  if (this._form.src) {
    return;
  };

	this.setState(QxConst.REQUEST_STATE_COMPLETED);
};

proto._onreadystatechange = function(e)
{
  this.debug("onReadyStateChange... (" + this._frame.readyState + ")");

  switch(this._frame.readyState)
  {
    case "loading":
      this.setState(QxConst.REQUEST_STATE_SENDING);
      break;

    case "interactive":
      this.setState(QxConst.REQUEST_STATE_RECEIVING);
      break;

    case "complete":
      this.setState(QxConst.REQUEST_STATE_COMPLETED);
      break;
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
  RESPONSE DATA SUPPORT
---------------------------------------------------------------------------
*/

proto.getIframeContentWindow = function() {
  return QxDom.getIframeContentWindow(this._frame);
};

proto.getIframeContentDocument = function() {
  return QxDom.getIframeContentDocument(this._frame);
};

/*!
  Provides the response text from the request when available and null otherwise.
  By passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
proto.getResponseText = function()
{
  var vXml = this.getResponseXml();

  this.debug("XML: " + vXml);

  return "Hello World";
};

/*!
  Provides the XML provided by the response if any and null otherwise.
  By passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
proto.getResponseXml = function() {
  return this.getIframeContentDocument();
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
