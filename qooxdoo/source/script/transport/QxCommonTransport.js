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

function QxCommonTransport() {
  QxTarget.call(this);
};

QxCommonTransport.extend(QxTarget, "QxCommonTransport");






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Target url to issue the request to
*/
QxCommonTransport.addProperty({ name : "url", type : QxConst.TYPEOF_STRING });

/*!
  Determines what type of request to issue
*/
QxCommonTransport.addProperty({ name : "method", type : QxConst.TYPEOF_STRING });

/*!
  Set the request to asynchronous
*/
QxCommonTransport.addProperty({ name : "asynchronous", type : QxConst.TYPEOF_BOOLEAN });

/*!
  Set the data to be sent via this request
*/
QxCommonTransport.addProperty({ name : "data", type : QxConst.TYPEOF_STRING });

/*!
  Username to use for HTTP authentication
*/
QxCommonTransport.addProperty({ name : "username", type : QxConst.TYPEOF_STRING });

/*!
  Password to use for HTTP authentication
*/
QxCommonTransport.addProperty({ name : "password", type : QxConst.TYPEOF_STRING });

/*!
  The state of the current request
*/
QxCommonTransport.addProperty(
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
QxCommonTransport.addProperty({ name : "requestHeaders", type: QxConst.TYPEOF_OBJECT });

/*!
  Request parameters to send.
*/
QxCommonTransport.addProperty({ name : "parameters", type: QxConst.TYPEOF_OBJECT });

/*!
  Response Type
*/
QxCommonTransport.addProperty({ name : "responseType", type: QxConst.TYPEOF_STRING });








/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

proto.send = function() {
  this.error("Need implementation", "send");
};

proto.abort = function()
{
  if (QxSettings.enableTransportDebug) {
    this.warn("Aborting...");
  };

  this.setState(QxConst.REQUEST_STATE_ABORTED);
};

/*!
  
*/
proto.timeout = function()
{
  if (QxSettings.enableTransportDebug) {
    this.warn("Timeout...");
  };

  this.setState(QxConst.REQUEST_STATE_TIMEOUT);
};

/*!
  
  Force the transport into the failed state (QxConst.REQUEST_STATE_FAILED).

  Listeners of the "failed" signal are notified about the event.
*/
proto.failed = function()
{
  if (QxSettings.enableTransportDebug) {
    this.warn("Failed...");
  };

  this.setState(QxConst.REQUEST_STATE_FAILED);
};







/*
---------------------------------------------------------------------------
  REQUEST HEADER SUPPORT
---------------------------------------------------------------------------
*/
/*!
  Add a request header to this transports QxRequest.

  This method is virtual and concrete subclasses are supposed to
  implement it.
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
