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

};

QxIframeTransport.extend(QxCommonTransport, "QxIframeTransport");





/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

proto.send = function() {
  this.error("Need implementation", "send");
};






/*
---------------------------------------------------------------------------
  REQUEST HEADER SUPPORT
---------------------------------------------------------------------------
*/

proto.setRequestHeader = function(vLabel, vValue) {
  this.error("Need implementation", "setRequestHeader");
};






/*
---------------------------------------------------------------------------
  RESPONSE HEADER SUPPORT
---------------------------------------------------------------------------
*/

proto.getResponseHeader = function(vLabel) {
  this.error("Need implementation", "getResponseHeader");
};

/*!
  Provides an hash of all response headers.
*/
proto.getResponseHeaders = function() {
  this.error("Need implementation", "getResponseHeaders");
};







/*
---------------------------------------------------------------------------
  STATUS SUPPORT
---------------------------------------------------------------------------
*/

/*!
  Returns the current status code of the request if available or -1 if not.
*/
proto.getStatusCode = function() {
  this.error("Need implementation", "getStatusCode");
};

/*!
  Provides the status text for the current request if available and null otherwise.
*/
proto.getStatusText = function() {
  this.error("Need implementation", "getStatusText");
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
proto.getResponseText = function() {
  this.error("Need implementation", "getResponseText");
};

/*!
  Provides the XML provided by the response if any and null otherwise.
  By passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
proto.getResponseXml = function() {
  this.error("Need implementation", "getResponseXml");
};

/*!
  Returns the length of the content as fetched thus far
*/
proto.getFetchedLength = function() {
  this.error("Need implementation", "getFetchedLength");
};
