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
qx.OO.addProperty({ name : "url", type : qx.Const.TYPEOF_STRING });

/*!
  Determines what type of request to issue
*/
qx.OO.addProperty({ name : "method", type : qx.Const.TYPEOF_STRING });

/*!
  Set the request to asynchronous
*/
qx.OO.addProperty({ name : "asynchronous", type : qx.Const.TYPEOF_BOOLEAN });

/*!
  Set the data to be sent via this request
*/
qx.OO.addProperty({ name : "data", type : qx.Const.TYPEOF_STRING });

/*!
  Username to use for HTTP authentication
*/
qx.OO.addProperty({ name : "username", type : qx.Const.TYPEOF_STRING });

/*!
  Password to use for HTTP authentication
*/
qx.OO.addProperty({ name : "password", type : qx.Const.TYPEOF_STRING });

/*!
  The state of the current request
*/
qx.OO.addProperty(
{
  name           : "state",
  type           : qx.Const.TYPEOF_STRING,
  possibleValues : [
                   qx.constant.Net.STATE_CREATED, qx.constant.Net.STATE_CONFIGURED,
                   qx.constant.Net.STATE_SENDING, qx.constant.Net.STATE_RECEIVING,
                   qx.constant.Net.STATE_COMPLETED, qx.constant.Net.STATE_ABORTED,
                   qx.constant.Net.STATE_TIMEOUT, qx.constant.Net.STATE_FAILED
                   ],
  defaultValue   : qx.constant.Net.STATE_CREATED
});

/*!
  Request headers
*/
qx.OO.addProperty({ name : "requestHeaders", type: qx.Const.TYPEOF_OBJECT });

/*!
  Request parameters to send.
*/
qx.OO.addProperty({ name : "parameters", type: qx.Const.TYPEOF_OBJECT });

/*!
  Response Type
*/
qx.OO.addProperty({ name : "responseType", type: qx.Const.TYPEOF_STRING });








/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

qx.Proto.send = function() {
  throw new Error("send is abstract");
};

qx.Proto.abort = function()
{
  if (qx.core.Settings.enableTransportDebug) {
    this.warn("Aborting...");
  };

  this.setState(qx.constant.Net.STATE_ABORTED);
};

/*!

*/
qx.Proto.timeout = function()
{
  if (qx.core.Settings.enableTransportDebug) {
    this.warn("Timeout...");
  };

  this.setState(qx.constant.Net.STATE_TIMEOUT);
};

/*!

  Force the transport into the failed state (qx.constant.Net.STATE_FAILED).

  Listeners of the "failed" signal are notified about the event.
*/
qx.Proto.failed = function()
{
  if (qx.core.Settings.enableTransportDebug) {
    this.warn("Failed...");
  };

  this.setState(qx.constant.Net.STATE_FAILED);
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
  throw new Error("setRequestHeader is abstract");
};






/*
---------------------------------------------------------------------------
  RESPONSE HEADER SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.getResponseHeader = function(vLabel) {
  throw new Error("getResponseHeader is abstract");
};

/*!
  Provides an hash of all response headers.
*/
qx.Proto.getResponseHeaders = function() {
  throw new Error("getResponseHeaders is abstract");
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
  throw new Error("getStatusCode is abstract");
};

/*!
  Provides the status text for the current request if available and null otherwise.
*/
qx.Proto.getStatusText = function() {
  throw new Error("getStatusText is abstract");
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
  throw new Error("getResponseText is abstract");
};

/*!
  Provides the XML provided by the response if any and null otherwise.
  By passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
qx.Proto.getResponseXml = function() {
  throw new Error("getResponseXml is abstract");
};

/*!
  Returns the length of the content as fetched thus far
*/
qx.Proto.getFetchedLength = function() {
  throw new Error("getFetchedLength is abstract");
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
    case qx.constant.Net.STATE_CREATED:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_CREATED);
      break;

    case qx.constant.Net.STATE_CONFIGURED:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_CONFIGURED);
      break;

    case qx.constant.Net.STATE_SENDING:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_SENDING);
      break;

    case qx.constant.Net.STATE_RECEIVING:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_RECEIVING);
      break;

    case qx.constant.Net.STATE_COMPLETED:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_COMPLETED);
      break;

    case qx.constant.Net.STATE_ABORTED:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_ABORTED);
      break;

    case qx.constant.Net.STATE_FAILED:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_FAILED);
      break;

    case qx.constant.Net.STATE_TIMEOUT:
      this.createDispatchEvent(qx.Const.EVENT_TYPE_TIMEOUT);
      break;
  };

  return true;
};
