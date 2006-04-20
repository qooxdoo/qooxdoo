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
#post(QxTransportCore)
#post(qx.io.remote.RemoteResponse)

************************************************************************ */

qx.io.remote.RemoteExchange = function(vRequest)
{
  qx.core.Target.call(this);

  this.setRequest(vRequest);
};

qx.io.remote.RemoteExchange.extend(qx.core.Target, "qx.io.remote.RemoteExchange");






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/
/*!
  Set the request to send with this transport.
*/
qx.io.remote.RemoteExchange.addProperty({ name : "request", type : QxConst.TYPEOF_OBJECT, instance : "qx.io.remote.RemoteRequest" });
/*!
  Set the implementation to use to send the request with.

  The implementation should be a subclass of qx.io.remote.AbstractTransport and
  must implement all methods in the transport API.
*/
qx.io.remote.RemoteExchange.addProperty({ name : "implementation", type : QxConst.TYPEOF_OBJECT });
qx.io.remote.RemoteExchange.addProperty(
{
  name           : "state",
  type           : QxConst.TYPEOF_STRING,
  possibleValues : [
                   QxConst.REQUEST_STATE_CONFIGURED, QxConst.REQUEST_STATE_SENDING,
                   QxConst.REQUEST_STATE_RECEIVING, QxConst.REQUEST_STATE_COMPLETED,
                   QxConst.REQUEST_STATE_ABORTED, QxConst.REQUEST_STATE_TIMEOUT,
                   QxConst.REQUEST_STATE_FAILED
                   ],
  defaultValue   : QxConst.REQUEST_STATE_CONFIGURED
});








/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

proto.send = function()
{
  var vRequest = this.getRequest();

  if (!vRequest) {
    return this.error("Please attach a request object first", "send");
  };

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
  };

  if (vRequest.getCrossDomain()) {
    vNeeds.crossDomain = true;
  };

  var vTransportImpl, vTransport;
  for (var i=0, l=vUsage.length; i<l; i++)
  {
    vTransportImpl = vSupported[vUsage[i]];

    if (vTransportImpl)
    {
      if (!qx.io.remote.RemoteExchange.canHandle(vTransportImpl, vNeeds, vResponseType)) {
        continue;
      };

      try
      {
        this.debug("Using implementation: " + vTransportImpl.classname);

        vTransport = new vTransportImpl;
        this.setImplementation(vTransport);

        vTransport.send();
        return true;
      }
      catch(ex)
      {
        return this.error("Request handler throws error: " + ex, "send");
      };
    };
  };

  this.error("There is no transport implementation available to handle this request: " + vRequest, "handle");
};
/*!
  Force the transport into the aborted (QxConst.REQUEST_STATE_ABORTED)
  state.
*/
proto.abort = function()
{
  var vImplementation = this.getImplementation();

  if (vImplementation)
  {
    this.debug("Abort: implementation " + vImplementation.toHashCode());
    vImplementation.abort();
  }
  else
  {
    this.debug("Abort: forcing state to be aborted");
    this.setState(QxConst.REQUEST_STATE_ABORTED);
  };
};
/*!
  Force the transport into the timeout state.
*/
proto.timeout = function()
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
    this.setState(QxConst.REQUEST_STATE_TIMEOUT);
  };
};









/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onsending = function(e) {
  this.setState(QxConst.REQUEST_STATE_SENDING);
};

proto._onreceiving = function(e) {
  this.setState(QxConst.REQUEST_STATE_RECEIVING);
};

proto._oncompleted = function(e) {
  this.setState(QxConst.REQUEST_STATE_COMPLETED);
};

proto._onabort = function(e) {
  this.setState(QxConst.REQUEST_STATE_ABORTED);
};

proto._onfailed = function(e) {
  this.setState(QxConst.REQUEST_STATE_FAILED);
};

proto._ontimeout = function(e) {
  this.setState(QxConst.REQUEST_STATE_TIMEOUT);
};






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyImplementation = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    propOldValue.removeEventListener(QxConst.EVENT_TYPE_SENDING, this._onsending, this);
    propOldValue.removeEventListener(QxConst.EVENT_TYPE_RECEIVING, this._onreceiving, this);
    propOldValue.removeEventListener(QxConst.EVENT_TYPE_COMPLETED, this._oncompleted, this);
    propOldValue.removeEventListener(QxConst.EVENT_TYPE_ABORTED, this._onabort, this);
    propOldValue.removeEventListener(QxConst.EVENT_TYPE_TIMEOUT, this._ontimeout, this);
    propOldValue.removeEventListener(QxConst.EVENT_TYPE_FAILED, this._onfailed, this);
  };

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

    propValue.addEventListener(QxConst.EVENT_TYPE_SENDING, this._onsending, this);
    propValue.addEventListener(QxConst.EVENT_TYPE_RECEIVING, this._onreceiving, this);
    propValue.addEventListener(QxConst.EVENT_TYPE_COMPLETED, this._oncompleted, this);
    propValue.addEventListener(QxConst.EVENT_TYPE_ABORTED, this._onabort, this);
    propValue.addEventListener(QxConst.EVENT_TYPE_TIMEOUT, this._ontimeout, this);
    propValue.addEventListener(QxConst.EVENT_TYPE_FAILED, this._onfailed, this);
  };

  return true;
};

proto._modifyState = function(propValue, propOldValue, propData)
{
  var vRequest = this.getRequest();

  if (qx.core.Settings.enableTransportDebug) {
    this.debug("State: " + propValue);
  };

  switch(propValue)
  {
    case QxConst.REQUEST_STATE_SENDING:
      this.createDispatchEvent(QxConst.EVENT_TYPE_SENDING);
      break;

    case QxConst.REQUEST_STATE_RECEIVING:
      this.createDispatchEvent(QxConst.EVENT_TYPE_RECEIVING);
      break;

    case QxConst.REQUEST_STATE_COMPLETED:
    case QxConst.REQUEST_STATE_ABORTED:
    case QxConst.REQUEST_STATE_TIMEOUT:
    case QxConst.REQUEST_STATE_FAILED:
      var vImpl = this.getImplementation();
      var vResponse = new qx.io.remote.RemoteResponse;

      vResponse.setStatusCode(vImpl.getStatusCode());
      vResponse.setContent(vImpl.getResponseContent());
      vResponse.setResponseHeaders(vImpl.getResponseHeaders());

      // this.debug("Result Text: " + vResponse.getTextContent());

      var vEventType;

      switch(propValue)
      {
        case QxConst.REQUEST_STATE_COMPLETED:
          vEventType = QxConst.EVENT_TYPE_COMPLETED;
          break;

        case QxConst.REQUEST_STATE_ABORTED:
          vEventType = QxConst.EVENT_TYPE_ABORTED;
          break;

        case QxConst.REQUEST_STATE_TIMEOUT:
          vEventType = QxConst.EVENT_TYPE_TIMEOUT;
          break;

        case QxConst.REQUEST_STATE_FAILED:
          vEventType = QxConst.EVENT_TYPE_FAILED;
          break;
      };

      // Disconnect and dispose implementation
      this.setImplementation(null);
      vImpl.dispose();

      // Fire event to listeners
      this.createDispatchDataEvent(vEventType, vResponse);
      break;
  };

  return true;
};








/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  /*
  if (qx.core.Settings.enableTransportDebug) {
    this.debug("Disposing...");
  };
  */

  var vImpl = this.getImplementation();
  if (vImpl)
  {
    this.setImplementation(null);
    vImpl.dispose();
  };

  this.setRequest(null);

  return qx.core.Target.prototype.dispose.call(this);
};
