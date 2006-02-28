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

************************************************************************ */

function QxTransport(vRequest)
{
  QxTarget.call(this);

  this.setRequest(vRequest);
};

QxTransport.extend(QxTarget, "QxTransport");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxTransport.addProperty({ name : "request", type : QxConst.TYPEOF_OBJECT, instance : "QxRequest" });
QxTransport.addProperty({ name : "implementation", type : QxConst.TYPEOF_OBJECT });
QxTransport.addProperty(
{
  name           : "state",
  type           : QxConst.TYPEOF_STRING,
  possibleValues : [
                   QxConst.REQUEST_STATE_CONFIGURED, QxConst.REQUEST_STATE_SENDING,
                   QxConst.REQUEST_STATE_RECEIVING, QxConst.REQUEST_STATE_COMPLETED
                   ],
  defaultValue   : QxConst.REQUEST_STATE_CONFIGURED
});







/*
---------------------------------------------------------------------------
  TRANSPORT TYPE HANDLING
---------------------------------------------------------------------------
*/

QxTransport.typesOrder = [ "QxXmlHttpTransport", "QxIframeTransport" ];

QxTransport.typesReady = false;

QxTransport.typesAvailable = {};
QxTransport.typesSupported = {};

QxTransport.registerType = function(vClass, vId) {
  QxTransport.typesAvailable[vId] = vClass;
};

QxTransport.initTypes = function()
{
  if (QxTransport.typesReady) {
    return;
  };

  for (var vId in QxTransport.typesAvailable)
  {
    vTransporterImpl = QxTransport.typesAvailable[vId];

    if (vTransporterImpl.isSupported()) {
      QxTransport.typesSupported[vId] = vTransporterImpl;
    };
  };

  QxTransport.typesReady = true;

  if (QxUtil.isObjectEmpty(QxTransport.typesSupported)) {
    throw new Error("No supported transport types were found!");
  };
};








/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

proto.send = function()
{
  QxTransport.initTypes();

  var vUsage = QxTransport.typesOrder;
  var vAvailable = QxTransport.typesAvailable;
  var vTransportImpl;
  var vTransport;

  for (var i=0, l=vUsage.length; i<l; i++)
  {
    vTransportImpl = vAvailable[vUsage[i]];

    if (vTransportImpl)
    {
      try
      {
        this.setImplementation(new vTransportImpl);
        return true;
      }
      catch(ex)
      {
        return this.error("Request handler throws error: " + ex, "send");
      };
    };
  };

  this.error("No Request Type available for: " + vRequest, "handle");
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

    propOldValue.dispose();
  };

  if (propValue)
  {
    var vRequest = this.getRequest();

    propValue.setUrl(vRequest.getUrl());
    propValue.setMethod(vRequest.getMethod());
    propValue.setAsynchronous(vRequest.getAsynchronous());
    propValue.setData(vRequest.getData());
    propValue.setUsername(vRequest.getUsername());
    propValue.setPassword(vRequest.getPassword());

    propValue.addEventListener(QxConst.EVENT_TYPE_SENDING, this._onsending, this);
    propValue.addEventListener(QxConst.EVENT_TYPE_RECEIVING, this._onreceiving, this);
    propValue.addEventListener(QxConst.EVENT_TYPE_COMPLETED, this._oncompleted, this);

    propValue.send();
  };

  return true;
};

proto._modifyState = function(propValue, propOldValue, propData)
{
  var vRequest = this.getRequest();

  // this.debug("state: " + propValue);

  switch(propValue)
  {
    case QxConst.REQUEST_STATE_SENDING:
      this.createDispatchEvent(QxConst.EVENT_TYPE_SENDING);
      break;

    case QxConst.REQUEST_STATE_RECEIVING:
      this.createDispatchEvent(QxConst.EVENT_TYPE_RECEIVING);
      break;

    case QxConst.REQUEST_STATE_COMPLETED:
      if (this.hasEventListeners(QxConst.EVENT_TYPE_COMPLETED))
      {
        var vImpl = this.getImplementation();
        var vResponse = new QxResponse;

        vResponse.setStatusCode(vImpl.getStatusCode());
        vResponse.setTextContent(vImpl.getResponseText());
        vResponse.setXmlContent(vImpl.getResponseXml());

        // TODO: Response Headers

        this.dispatchEvent(new QxDataEvent(QxConst.EVENT_TYPE_COMPLETED, vResponse), true);
      };

      // Cleanup connection to implementation and dispose
      this.setImplementation(null);
  };

  return true;
};
