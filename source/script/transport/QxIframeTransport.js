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

************************************************************************ */

function QxIframeTransport()
{
  QxCommonTransport.call(this);

  var o = this;

  this._frame = document.createElement("iframe");
  this._frame.id = this._frame.name = "frame_" + (new Date).valueOf();
  this._frame.setAttribute("id", this._frame.id);
  this._frame.setAttribute("name", this._frame.name);
  this._frame.onload = function(e) { return o._onload(e) };
  this._frame.onreadystatechange = function(e) { return o._onreadystatechange(e) };
  document.body.appendChild(this._frame);

  this._form = document.createElement("form");
  this._form.id = this._form.name = "form_" + (new Date).valueOf();
  this._form.target = this._frame.id;
  document.body.appendChild(this._form);
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

proto._onload = function(e)
{
	this.setState(QxConst.REQUEST_STATE_COMPLETED);


};

proto._onreadystatechange = function(e)
{
  this.debug("onReadyStateChange");

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

/*!
  Provides the response text from the request when available and null otherwise.
  By passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
proto.getResponseText = function()
{
  var vFrame = this._frame || window.frames[this._frame.id];

  if (!vFrame) {
    return this.error("Frame is not available anymore!", "getResponseText");
  };

  if (vFrame.contentDocument)
  {
    this.debug("Using method #1");
  }
  else if (vFrame.contentWindow)
  {
    this.debug("Using method #2");
  }
  else if (vFrame.document)
  {
    this.debug("Using method #3");
  }
  else
  {
    return this.error("Could not access iframes content!", "getResponseText");
  };

  /*
	try {   var doc = this.transport.contentDocument.document.body.innerHTML; this.transport.contentDocument.document.close(); }	// For NS6
	catch (e){
		try{ var doc = this.transport.contentWindow.document.body.innerHTML; this.transport.contentWindow.document.close(); } // For IE5.5 and IE6
		 catch (e){
			 try { var doc = this.transport.document.body.innerHTML; this.transport.document.body.close(); } // for IE5
				catch (e) {
					try	{ var doc = window.frames['frame_'+this.uniqueId].document.body.innerText; } // for really nasty browsers
					catch (e) { } // forget it.
			 }
		}
	}
	*/



};

/*!
  Provides the XML provided by the response if any and null otherwise.
  By passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
proto.getResponseXml = function()
{
  return null;

  // TODO
  // this.error("Need implementation", "getResponseXml");
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
    document.body.removeChild(this._frame);
    this._frame.onload = null;
    this._frame.onreadystatechange = null;
    this._frame = null;
  };

  if (this._form)
  {
    document.body.removeChild(this._form);
    this._form = null;
  };

  return QxCommonTransport.prototype.dispose.call(this);
};
