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

************************************************************************ */

qx.OO.defineClass("qx.io.remote.AbstractRemoteTransport", qx.core.Target, 
function() {
  qx.core.Target.call(this);
});






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Target url to issue the request to
*/
qx.io.remote.AbstractRemoteTransport.addProperty({ name : "url", type : qx.Const.TYPEOF_STRING });

/*!
  Determines what type of request to issue
*/
qx.io.remote.AbstractRemoteTransport.addProperty({ name : "method", type : qx.Const.TYPEOF_STRING });

/*!
  Set the request to asynchronous
*/
qx.io.remote.AbstractRemoteTransport.addProperty({ name : "asynchronous", type : qx.Const.TYPEOF_BOOLEAN });

/*!
  Set the data to be sent via this request
*/
qx.io.remote.AbstractRemoteTransport.addProperty({ name : "data", type : qx.Const.TYPEOF_STRING });

/*!
  Username to use for HTTP authentication
*/
qx.io.remote.AbstractRemoteTransport.addProperty({ name : "username", type : qx.Const.TYPEOF_STRING });

/*!
  Password to use for HTTP authentication
*/
qx.io.remote.AbstractRemoteTransport.addProperty({ name : "password", type : qx.Const.TYPEOF_STRING });

/*!
  The state of the current request
*/
qx.io.remote.AbstractRemoteTransport.addProperty(
{
  name           : "state",
  type           : qx.Const.TYPEOF_STRING,
  possibleValues : [
                   qx.Const.REQUEST_STATE_CREATED, qx.Const.REQUEST_STATE_CONFIGURED,
                   qx.Const.REQUEST_STATE_SENDING, qx.Const.REQUEST_STATE_RECEIVING,
                   qx.Const.REQUEST_STATE_COMPLETED, qx.Const.REQUEST_STATE_ABORTED,
                   qx.Const.REQUEST_STATE_TIMEOUT, qx.Const.REQUEST_STATE_FAILED
                   ],
  defaultValue   : qx.Const.REQUEST_STATE_CREATED
});

/*!
  Request headers
*/
qx.io.remote.AbstractRemoteTransport.addProperty({ name : "requestHeaders", type: qx.Const.TYPEOF_OBJECT });

/*!
  Request parameters to send.
*/
qx.io.remote.AbstractRemoteTransport.addProperty({ name : "parameters", type: qx.Const.TYPEOF_OBJECT });

/*!
  Response Type
*/
qx.io.remote.AbstractRemoteTransport.addProperty({ name : "responseType", type: qx.Const.TYPEOF_STRING });








/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

qx.Proto.send = function() {
  this.error("Need implementation", "send");
};

qx.Proto.abort = function()
{
  if (qx.core.Settings.enableTransportDebug) {
    this.warn("Aborting...");
  };

  this.setState(qx.Const.REQUEST_STATE_ABORTED);
};

/*!

*/
qx.Proto.timeout = function()
{
  if (qx.core.Settings.enableTransportDebug) {
    this.warn("Timeout...");
  };

  this.setState(qx.Const.REQUEST_STATE_TIMEOUT);
};

/*!

  Force the transport into the failed state (qx.Const.REQUEST_STATE_FAILED).

  Listeners of the "failed" signal are notified about the event.
*/
qx.Proto.failed = function()
{
  if (qx.core.Settings.enableTransportDebug) {
    this.warn("Failed...");
  };

  this.setState(qx.Const.REQUEST_STATE_FAILED);
};







/*
---------------------------------------------------------------------------
  REQUEST HEADER SUPPORT
---------------------------------------------------------------------------
*/
/*!
  Add a request header to this transports qx.io.remote.RemoteRequest.

  This method is virtual and concrete subclasses are supposed to
  implement it.
*/
qx.Proto.setRequestHeader = function(vLabel, vValue) {
  this.error("Need implementation", "setRequestHeader");
};






/*
---------------------------------------------------------------------------
  RESPONSE HEADER SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.getResponseHeader = function(vLabel) {
  this.error("Need implementation", "getResponseHeader");
};

/*!
  Provides an hash of all response headers.
*/
qx.Proto.getResponseHeaders = function() {
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
qx.Proto.getStatusCode = function() {
  this.error("Need implementation", "getStatusCode");
};

/*!
  Provides the status text for the current request if available and null otherwise.
*/
qx.Proto.getStatusText = function() {
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
qx.Proto.getResponseText = function() {
  this.error("Need implementation", "getResponseText");
};

/*!
  Provides the XML provided by the response if any and null otherwise.
  By passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
qx.Proto.getResponseXml = function() {
  this.error("Need implementation", "getResponseXml");
};

/*!
  Returns the length of the content as fetched thus far
*/
qx.Proto.getFetchedLength = function() {
  this.error("Need implementation", "getFetchedLength");
};







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyState = function(propValue, propOldValue, propData)
{
  if (qx.core.Settings.enableTransportDebug) {
    this.debug("State: " + propValue);
  };

  switch(propValue)
  {
    case qx.Const.REQUEST_STATE_CREATED:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_CREATED);
      break;

    case qx.Const.REQUEST_STATE_CONFIGURED:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_CONFIGURED);
      break;

    case qx.Const.REQUEST_STATE_SENDING:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_SENDING);
      break;

    case qx.Const.REQUEST_STATE_RECEIVING:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_RECEIVING);
      break;

    case qx.Const.REQUEST_STATE_COMPLETED:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_COMPLETED);
      break;

    case qx.Const.REQUEST_STATE_ABORTED:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_ABORTED);
      break;

    case qx.Const.REQUEST_STATE_FAILED:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_FAILED);
      break;

    case qx.Const.REQUEST_STATE_TIMEOUT:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_TIMEOUT);
      break;
  };

  return true;
};
