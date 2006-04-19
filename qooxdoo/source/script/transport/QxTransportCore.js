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

QxTransport.canHandle = function(vImpl, vNeeds, vResponseType)
{
  if (!vImpl.handles.responseTypes.contains(vResponseType)) {
    return false;
  };

  for (var vKey in vNeeds)
  {
    if (!vImpl.handles[vKey]) {
      return false;
    };
  };

  return true;
};





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

QxTransport._nativeMap =
{
  0 : QxConst.REQUEST_STATE_CREATED,
  1 : QxConst.REQUEST_STATE_CONFIGURED,
  2 : QxConst.REQUEST_STATE_SENDING,
  3 : QxConst.REQUEST_STATE_RECEIVING,
  4 : QxConst.REQUEST_STATE_COMPLETED
};






/*
---------------------------------------------------------------------------
  UTILS
---------------------------------------------------------------------------
*/

QxTransport.wasSuccessful = function(vStatusCode, vReadyState, vIsLocal)
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
        return typeof vStatusCode === QxConst.TYPEOF_UNDEFINED;
    };
  }
  else
  {
    switch(vStatusCode)
    {
      case -1:  // Not Available (OK for readystates: MSXML<4=1-3, MSXML>3=1-2, Gecko=1)
        if (QxSettings.enableTransportDebug && vReadyState > 3) {
          QxDebug("QxTransport", "Failed with statuscode: -1 at readyState " + vReadyState);
        };

        return vReadyState < 4;


      case 200: // OK
      case 304: // Not Modified
        return true;


      case 206: // Partial Content
        if (QxSettings.enableTransportDebug && vReadyState === 4) {
          QxDebug("QxTransport", "Failed with statuscode: 206 (Partial content while being complete!)");
        };

        return vReadyState !== 4;


      case 204: // No Content
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
        if (QxSettings.enableTransportDebug) {
          QxDebug("QxTransport", "Failed with typical HTTP statuscode: " + vStatusCode);
        };

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
        if (QxSettings.enableTransportDebug) {
          QxDebug("QxTransport", "Failed with MSHTML specific HTTP statuscode: " + vStatusCode);
        };

        return false;


      default:
        QxDebug("QxTransport", "Unknown status code: " + vStatusCode + " (" + vReadyState + ")");
        throw new Error("Unknown status code: " + vStatusCode);
    };
  };
};
