/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(io_remote)

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
qx.OO.addProperty({ name : "url", type : qx.constant.Type.STRING });

/*!
  Determines what type of request to issue
*/
qx.OO.addProperty({ name : "method", type : qx.constant.Type.STRING });

/*!
  Set the request to asynchronous
*/
qx.OO.addProperty({ name : "asynchronous", type : qx.constant.Type.BOOLEAN });

/*!
  Set the data to be sent via this request
*/
qx.OO.addProperty({ name : "data", type : qx.constant.Type.STRING });

/*!
  Username to use for HTTP authentication
*/
qx.OO.addProperty({ name : "username", type : qx.constant.Type.STRING });

/*!
  Password to use for HTTP authentication
*/
qx.OO.addProperty({ name : "password", type : qx.constant.Type.STRING });

/*!
  The state of the current request
*/
qx.OO.addProperty(
{
  name           : "state",
  type           : qx.constant.Type.STRING,
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
qx.OO.addProperty({ name : "requestHeaders", type: qx.constant.Type.OBJECT });

/*!
  Request parameters to send.
*/
qx.OO.addProperty({ name : "parameters", type: qx.constant.Type.OBJECT });

/*!
  Response Type
*/
qx.OO.addProperty({ name : "responseType", type: qx.constant.Type.STRING });








/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

qx.Proto.send = function() {
  throw new Error("send is abstract");
}

qx.Proto.abort = function()
{
  if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
    this.warn("Aborting...");
  }

  this.setState(qx.constant.Net.STATE_ABORTED);
}

/*!

*/
qx.Proto.timeout = function()
{
  if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
    this.warn("Timeout...");
  }

  this.setState(qx.constant.Net.STATE_TIMEOUT);
}

/*!

  Force the transport into the failed state (qx.constant.Net.STATE_FAILED).

  Listeners of the "failed" signal are notified about the event.
*/
qx.Proto.failed = function()
{
  if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
    this.warn("Failed...");
  }

  this.setState(qx.constant.Net.STATE_FAILED);
}







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
}






/*
---------------------------------------------------------------------------
  RESPONSE HEADER SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.getResponseHeader = function(vLabel) {
  throw new Error("getResponseHeader is abstract");
}

/*!
  Provides an hash of all response headers.
*/
qx.Proto.getResponseHeaders = function() {
  throw new Error("getResponseHeaders is abstract");
}







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
}

/*!
  Provides the status text for the current request if available and null otherwise.
*/
qx.Proto.getStatusText = function() {
  throw new Error("getStatusText is abstract");
}






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
}

/*!
  Provides the XML provided by the response if any and null otherwise.
  By passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
qx.Proto.getResponseXml = function() {
  throw new Error("getResponseXml is abstract");
}

/*!
  Returns the length of the content as fetched thus far
*/
qx.Proto.getFetchedLength = function() {
  throw new Error("getFetchedLength is abstract");
}







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyState = function(propValue, propOldValue, propData)
{
  if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
    this.debug("State: " + propValue);
  }

  switch(propValue)
  {
    case qx.constant.Net.STATE_CREATED:
      this.createDispatchEvent(qx.constant.Event.CREATED);
      break;

    case qx.constant.Net.STATE_CONFIGURED:
      this.createDispatchEvent(qx.constant.Event.CONFIGURED);
      break;

    case qx.constant.Net.STATE_SENDING:
      this.createDispatchEvent(qx.constant.Event.SENDING);
      break;

    case qx.constant.Net.STATE_RECEIVING:
      this.createDispatchEvent(qx.constant.Event.RECEIVING);
      break;

    case qx.constant.Net.STATE_COMPLETED:
      this.createDispatchEvent(qx.constant.Event.COMPLETED);
      break;

    case qx.constant.Net.STATE_ABORTED:
      this.createDispatchEvent(qx.constant.Event.ABORTED);
      break;

    case qx.constant.Net.STATE_FAILED:
      this.createDispatchEvent(qx.constant.Event.FAILED);
      break;

    case qx.constant.Net.STATE_TIMEOUT:
      this.createDispatchEvent(qx.constant.Event.TIMEOUT);
      break;
  }

  return true;
}
