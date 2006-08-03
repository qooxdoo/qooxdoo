/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org
     2006 by Derrell Lipman

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(transport)
#require(qx.constant.Net)

************************************************************************ */

qx.OO.defineClass("qx.io.remote.RemoteExchange", qx.core.Target,
function(vRequest)
{
  qx.core.Target.call(this);

  this.setRequest(vRequest);
  vRequest.setTransport(this);
});


/*
---------------------------------------------------------------------------
  DEFAULT SETTINGS
---------------------------------------------------------------------------
*/

qx.Settings.setDefault("enableDebug", false);






/* ************************************************************************
   Class data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  TRANSPORT TYPE HANDLING
---------------------------------------------------------------------------
*/

qx.io.remote.RemoteExchange.typesOrder = [ "qx.io.remote.XmlHttpTransport", "qx.io.remote.IframeTransport" ];

qx.io.remote.RemoteExchange.typesReady = false;

qx.io.remote.RemoteExchange.typesAvailable = {};
qx.io.remote.RemoteExchange.typesSupported = {};

qx.io.remote.RemoteExchange.registerType = function(vClass, vId) {
  qx.io.remote.RemoteExchange.typesAvailable[vId] = vClass;
}

qx.io.remote.RemoteExchange.initTypes = function()
{
  if (qx.io.remote.RemoteExchange.typesReady) {
    return;
  }

  for (var vId in qx.io.remote.RemoteExchange.typesAvailable)
  {
    vTransporterImpl = qx.io.remote.RemoteExchange.typesAvailable[vId];

    if (vTransporterImpl.isSupported()) {
      qx.io.remote.RemoteExchange.typesSupported[vId] = vTransporterImpl;
    }
  }

  qx.io.remote.RemoteExchange.typesReady = true;

  if (qx.lang.Object.isEmpty(qx.io.remote.RemoteExchange.typesSupported)) {
    throw new Error("No supported transport types were found!");
  }
}

qx.io.remote.RemoteExchange.canHandle = function(vImpl, vNeeds, vResponseType)
{
  if (!qx.lang.Array.contains(vImpl.handles.responseTypes, vResponseType)) {
    return false;
  }

  for (var vKey in vNeeds)
  {
    if (!vImpl.handles[vKey]) {
      return false;
    }
  }

  return true;
}





/*
---------------------------------------------------------------------------
  MAPPING
---------------------------------------------------------------------------
*/

/*
http://msdn.microsoft.com/library/default.asp?url=/library/en-us/xmlsdk/html/0e6a34e4-f90c-489d-acff-cb44242fafc6.asp

0: UNINITIALIZED
The object has been created, but not initialized (the open method has not been called).

1: LOADING
The object has been created, but the send method has not been called.

2: LOADED
The send method has been called, but the status and headers are not yet available.

3: INTERACTIVE
Some data has been received. Calling the responseBody and responseText properties at this state to obtain partial results will return an error, because status and response headers are not fully available.

4: COMPLETED
All the data has been received, and the complete data is available in the
*/

qx.io.remote.RemoteExchange._nativeMap =
{
  0 : qx.constant.Net.STATE_CREATED,
  1 : qx.constant.Net.STATE_CONFIGURED,
  2 : qx.constant.Net.STATE_SENDING,
  3 : qx.constant.Net.STATE_RECEIVING,
  4 : qx.constant.Net.STATE_COMPLETED
}






/*
---------------------------------------------------------------------------
  UTILS
---------------------------------------------------------------------------
*/

qx.io.remote.RemoteExchange.wasSuccessful = function(vStatusCode, vReadyState, vIsLocal)
{
  if (vIsLocal)
  {
    switch(vStatusCode)
    {
      case null:
      case 0:
        return true;

      case -1:
        // Not Available (OK for readystates: MSXML<4=1-3, MSXML>3=1-2, Gecko=1)
        return vReadyState < 4;

      default:
        return typeof vStatusCode === qx.constant.Type.UNDEFINED;
    }
  }
  else
  {
    switch(vStatusCode)
    {
      case -1:  // Not Available (OK for readystates: MSXML<4=1-3, MSXML>3=1-2, Gecko=1)
        if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug") && vReadyState > 3) {
          qx.dev.log.Logger.getClassLogger(qx.io.remote.RemoteExchange).debug("Failed with statuscode: -1 at readyState " + vReadyState);
        }

        return vReadyState < 4;


      case 200: // OK
      case 304: // Not Modified
        return true;


      case 201: // Created
      case 202: // Accepted
      case 203: // Non-Authoritative Information
      case 204: // No Content
      case 205: // Reset Content
        return true;


      case 206: // Partial Content
        if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug") && vReadyState === 4) {
          qx.dev.log.Logger.getClassLogger(qx.io.remote.RemoteExchange).debug("Failed with statuscode: 206 (Partial content while being complete!)");
        }

        return vReadyState !== 4;


      case 300: // Multiple Choices
      case 301: // Moved Permanently
      case 302: // Moved Temporarily
      case 303: // See Other
      case 305: // Use Proxy
      case 400: // Bad Request
      case 401: // Unauthorized
      case 402: // Payment Required
      case 403: // Forbidden
      case 404: // Not Found
      case 405: // Method Not Allowed
      case 406: // Not Acceptable
      case 407: // Proxy Authentication Required
      case 408: // Request Time-Out
      case 409: // Conflict
      case 410: // Gone
      case 411: // Length Required
      case 412: // Precondition Failed
      case 413: // Request Entity Too Large
      case 414: // Request-URL Too Large
      case 415: // Unsupported Media Type
      case 500: // Server Error
      case 501: // Not Implemented
      case 502: // Bad Gateway
      case 503: // Out of Resources
      case 504: // Gateway Time-Out
      case 505: // HTTP Version not supported
        if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
          qx.dev.log.Logger.getClassLogger(qx.io.remote.RemoteExchange).debug("Failed with typical HTTP statuscode: " + vStatusCode);
        }

        return false;


      // The following case labels are wininet.dll error codes that may be encountered.
      // Server timeout
      case 12002:
      // 12029 to 12031 correspond to dropped connections.
      case 12029:
      case 12030:
      case 12031:
      // Connection closed by server.
      case 12152:
      // See above comments for variable status.
      case 13030:
        if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
          qx.dev.log.Logger.getClassLogger(qx.io.remote.RemoteExchange).debug("Failed with MSHTML specific HTTP statuscode: " + vStatusCode);
        }

        return false;


      default:
        // Handle all 20x status codes as OK as defined in the corresponding RFC
        // http://www.w3.org/Protocols/rfc2616/rfc2616.html
        if (vStatusCode > 206 && vStatusCode < 300) {
          return true;
        }

        qx.dev.log.Logger.getClassLogger(qx.io.remote.RemoteExchange).debug("Unknown status code: " + vStatusCode + " (" + vReadyState + ")");
        throw new Error("Unknown status code: " + vStatusCode);
    }
  }
}


qx.io.remote.RemoteExchange.statusCodeToString = function(vStatusCode)
{
  switch(vStatusCode)
  {
    case -1:    return "Not available";
    case 200:   return "Ok";
    case 304:   return "Not modified";
    case 206:   return "Partial content";
    case 204:   return "No content";
    case 300:   return "Multiple choices";
    case 301:   return "Moved permanently";
    case 302:   return "Moved temporarily";
    case 303:   return "See other";
    case 305:   return "Use proxy";
    case 400:   return "Bad request";
    case 401:   return "Unauthorized";
    case 402:   return "Payment required";
    case 403:   return "Forbidden";
    case 404:   return "Not found";
    case 405:   return "Method not allowed";
    case 406:   return "Not acceptable";
    case 407:   return "Proxy authentication required";
    case 408:   return "Request time-out";
    case 409:   return "Conflict";
    case 410:   return "Gone";
    case 411:   return "Length required";
    case 412:   return "Precondition failed";
    case 413:   return "Request entity too large";
    case 414:   return "Request-URL too large";
    case 415:   return "Unsupported media type";
    case 500:   return "Server error";
    case 501:   return "Not implemented";
    case 502:   return "Bad gateway";
    case 503:   return "Out of resources";
    case 504:   return "Gateway time-out";
    case 505:   return "HTTP version not supported";
    case 12002: return "Server timeout";
    case 12029: return "Connection dropped";
    case 12030: return "Connection dropped";
    case 12031: return "Connection dropped";
    case 12152: return "Connection closed by server";
    case 13030: return "MSHTML-specific HTTP status code";
    default:    return "Unknown status code";
  }
}







/* ************************************************************************
   Instance data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Set the request to send with this transport.
*/
qx.OO.addProperty({ name : "request", type : qx.constant.Type.OBJECT, instance : "qx.io.remote.RemoteRequest" });
/*!
  Set the implementation to use to send the request with.

  The implementation should be a subclass of qx.io.remote.AbstractRemoteTransport and
  must implement all methods in the transport API.
*/
qx.OO.addProperty({ name : "implementation", type : qx.constant.Type.OBJECT });
qx.OO.addProperty(
{
  name           : "state",
  type           : qx.constant.Type.STRING,
  possibleValues : [
                   qx.constant.Net.STATE_CONFIGURED, qx.constant.Net.STATE_SENDING,
                   qx.constant.Net.STATE_RECEIVING, qx.constant.Net.STATE_COMPLETED,
                   qx.constant.Net.STATE_ABORTED, qx.constant.Net.STATE_TIMEOUT,
                   qx.constant.Net.STATE_FAILED
                   ],
  defaultValue   : qx.constant.Net.STATE_CONFIGURED
});








/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

qx.Proto.send = function()
{
  var vRequest = this.getRequest();

  if (!vRequest) {
    return this.error("Please attach a request object first");
  }

  qx.io.remote.RemoteExchange.initTypes();

  var vUsage = qx.io.remote.RemoteExchange.typesOrder;
  var vSupported = qx.io.remote.RemoteExchange.typesSupported;

  // Mapping settings to contenttype and needs to check later
  // if the selected transport implementation can handle
  // fulfill these requirements.
  var vResponseType = vRequest.getResponseType();
  var vNeeds = {};

  if (vRequest.getAsynchronous()) {
    vNeeds.asynchronous = true;
  } else {
    vNeeds.synchronous = true;
  }

  if (vRequest.getCrossDomain()) {
    vNeeds.crossDomain = true;
  }

  var vTransportImpl, vTransport;
  for (var i=0, l=vUsage.length; i<l; i++)
  {
    vTransportImpl = vSupported[vUsage[i]];

    if (vTransportImpl)
    {
      if (!qx.io.remote.RemoteExchange.canHandle(vTransportImpl, vNeeds, vResponseType)) {
        continue;
      }

      try
      {
        if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
          this.debug("Using implementation: " + vTransportImpl.classname);
        }

        vTransport = new vTransportImpl;
        this.setImplementation(vTransport);

        vTransport.send();
        return true;
      }
      catch(ex)
      {
        return this.error("Request handler throws error", ex);
      }
    }
  }

  this.error("There is no transport implementation available to handle this request: " + vRequest);
}
/*!
  Force the transport into the aborted (qx.constant.Net.STATE_ABORTED)
  state.
*/
qx.Proto.abort = function()
{
  var vImplementation = this.getImplementation();

  if (vImplementation)
  {
    if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
      this.debug("Abort: implementation " + vImplementation.toHashCode());
    }
    vImplementation.abort();
  }
  else
  {
    if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
      this.debug("Abort: forcing state to be aborted");
    }
    this.setState(qx.constant.Net.STATE_ABORTED);
  }
}
/*!
  Force the transport into the timeout state.
*/
qx.Proto.timeout = function()
{
  var vImplementation = this.getImplementation();

  if (vImplementation)
  {
    this.warn("Timeout: implementation " + vImplementation.toHashCode());
    vImplementation.timeout();
  }
  else
  {
    this.warn("Timeout: forcing state to timeout");
    this.setState(qx.constant.Net.STATE_TIMEOUT);
  }

  // Disable future timeouts in case user handler blocks
  if (this.getRequest()) {
    this.getRequest().setTimeout(0);
  }
}









/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onsending = function(e) {
  this.setState(qx.constant.Net.STATE_SENDING);
}

qx.Proto._onreceiving = function(e) {
  this.setState(qx.constant.Net.STATE_RECEIVING);
}

qx.Proto._oncompleted = function(e) {
  this.setState(qx.constant.Net.STATE_COMPLETED);
}

qx.Proto._onabort = function(e) {
  this.setState(qx.constant.Net.STATE_ABORTED);
}

qx.Proto._onfailed = function(e) {
  this.setState(qx.constant.Net.STATE_FAILED);
}

qx.Proto._ontimeout = function(e) {
  this.setState(qx.constant.Net.STATE_TIMEOUT);
}






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyImplementation = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    propOldValue.removeEventListener(qx.constant.Event.SENDING, this._onsending, this);
    propOldValue.removeEventListener(qx.constant.Event.RECEIVING, this._onreceiving, this);
    propOldValue.removeEventListener(qx.constant.Event.COMPLETED, this._oncompleted, this);
    propOldValue.removeEventListener(qx.constant.Event.ABORTED, this._onabort, this);
    propOldValue.removeEventListener(qx.constant.Event.TIMEOUT, this._ontimeout, this);
    propOldValue.removeEventListener(qx.constant.Event.FAILED, this._onfailed, this);
  }

  if (propValue)
  {
    var vRequest = this.getRequest();

    propValue.setUrl(vRequest.getUrl());
    propValue.setMethod(vRequest.getMethod());
    propValue.setAsynchronous(vRequest.getAsynchronous());

    propValue.setUsername(vRequest.getUsername());
    propValue.setPassword(vRequest.getPassword());

    propValue.setParameters(vRequest.getParameters());
    propValue.setRequestHeaders(vRequest.getRequestHeaders());
    propValue.setData(vRequest.getData());

    propValue.setResponseType(vRequest.getResponseType());

    propValue.addEventListener(qx.constant.Event.SENDING, this._onsending, this);
    propValue.addEventListener(qx.constant.Event.RECEIVING, this._onreceiving, this);
    propValue.addEventListener(qx.constant.Event.COMPLETED, this._oncompleted, this);
    propValue.addEventListener(qx.constant.Event.ABORTED, this._onabort, this);
    propValue.addEventListener(qx.constant.Event.TIMEOUT, this._ontimeout, this);
    propValue.addEventListener(qx.constant.Event.FAILED, this._onfailed, this);
  }

  return true;
}

qx.Proto._modifyState = function(propValue, propOldValue, propData)
{
  var vRequest = this.getRequest();

  if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
    this.debug("State: " + propOldValue + " => " + propValue);
  }

  switch(propValue)
  {
    case qx.constant.Net.STATE_SENDING:
      this.createDispatchEvent(qx.constant.Event.SENDING);
      break;

    case qx.constant.Net.STATE_RECEIVING:
      this.createDispatchEvent(qx.constant.Event.RECEIVING);
      break;

    case qx.constant.Net.STATE_COMPLETED:
    case qx.constant.Net.STATE_ABORTED:
    case qx.constant.Net.STATE_TIMEOUT:
    case qx.constant.Net.STATE_FAILED:
      var vImpl = this.getImplementation();

      if (! vImpl) {
        // implementation has already been disposed
        break;
      }

      var vResponse = new qx.io.remote.RemoteResponse;

      if (propValue == qx.constant.Net.STATE_COMPLETED) {
        var vContent = vImpl.getResponseContent();
        vResponse.setContent(vContent);

        /*
         * Was there acceptable content?  This might occur, for example, if
         * the web server was shut down unexpectedly and thus the connection
         * closed with no data having been sent.
         */
        if (vContent === null) {
          // Nope.  Change COMPLETED to FAILED.
          if (qx.Settings.getValueOfClass("qx.io.remote.RemoteExchange", "enableDebug")) {
            this.debug("Altered State: " + propValue + " => failed");
          }
          propValue = qx.constant.Net.STATE_FAILED;
        }
      }

      vResponse.setStatusCode(vImpl.getStatusCode());
      vResponse.setResponseHeaders(vImpl.getResponseHeaders());

      // this.debug("Result Text: " + vResponse.getTextContent());

      var vEventType;

      switch(propValue)
      {
        case qx.constant.Net.STATE_COMPLETED:
          vEventType = qx.constant.Event.COMPLETED;
          break;

        case qx.constant.Net.STATE_ABORTED:
          vEventType = qx.constant.Event.ABORTED;
          break;

        case qx.constant.Net.STATE_TIMEOUT:
          vEventType = qx.constant.Event.TIMEOUT;
          break;

        case qx.constant.Net.STATE_FAILED:
          vEventType = qx.constant.Event.FAILED;
          break;
      }

      // Disconnect and dispose implementation
      this.setImplementation(null);
      vImpl.dispose();

      // Fire event to listeners
      this.createDispatchDataEvent(vEventType, vResponse);
      break;
  }

  return true;
}








/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  var vImpl = this.getImplementation();
  if (vImpl)
  {
    this.setImplementation(null);
    vImpl.dispose();
  }

  this.setRequest(null);

  return qx.core.Target.prototype.dispose.call(this);
}
