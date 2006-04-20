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
#require(qx.io.remote.XmlHttpTransport)

************************************************************************ */

// basic registration to qx.io.remote.RemoteExchange
// the real availability check (activeX stuff and so on) follows at the first real request
qx.io.remote.RemoteExchange.registerType(qx.io.remote.XmlHttpTransport, "qx.io.remote.XmlHttpTransport");

qx.io.remote.XmlHttpTransport.handles =
{
  synchronous : true,
  asynchronous : true,
  crossDomain : false,
  fileUpload: false,
  responseTypes : [ QxConst.MIMETYPE_TEXT, QxConst.MIMETYPE_JAVASCRIPT, QxConst.MIMETYPE_JSON, QxConst.MIMETYPE_XML, QxConst.MIMETYPE_HTML ]
};

qx.io.remote.XmlHttpTransport.requestObjects = [];
qx.io.remote.XmlHttpTransport.requestObjectCount = 0;

qx.io.remote.XmlHttpTransport.isSupported = function()
{
  if (window.XMLHttpRequest)
  {
    if (qx.core.Settings.enableTransportDebug) {
      qx.dev.Debug("qx.io.remote.XmlHttpTransport", "Using XMLHttpRequest");
    };

    qx.io.remote.XmlHttpTransport.createRequestObject = qx.io.remote.XmlHttpTransport._createNativeRequestObject;
    return true;
  };

  if (window.ActiveXObject)
  {
    var vServers = [ "MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.5.0", "MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP.2.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP" ];
    var vObject;
    var vServer;

    for (var i=0, l=vServers.length; i<l; i++)
    {
      vServer = vServers[i];

      try
      {
        vObject = new ActiveXObject(vServer);
        break;
      }
      catch(ex)
      {
        vObject = null;
      };
    };

    if (vObject)
    {
      if (qx.core.Settings.enableTransportDebug) {
        qx.dev.Debug("qx.io.remote.XmlHttpTransport", "Using ActiveXObject: " + vServer);
      };

      qx.io.remote.XmlHttpTransport._activeXServer = vServer;
      qx.io.remote.XmlHttpTransport.createRequestObject = qx.io.remote.XmlHttpTransport._createActiveXRequestObject;

      return true;
    };
  };

  return false;
};

/*!
  Return a new request object suitable for the client browser.

  qx.io.remote.XmlHttpTransport's isSupported method scans which request object
  to use. The createRequestObject method is then replaced with a
  method that creates request suitable for the client browser. If the
  client browser doesn't support XMLHTTP requests, the method isn't
  replaced and the error "XMLHTTP is not supported!" is thrown.
*/
qx.io.remote.XmlHttpTransport.createRequestObject = function() {
  throw new Error("XMLHTTP is not supported!");
};

qx.io.remote.XmlHttpTransport._createNativeRequestObject = function() {
   return new XMLHttpRequest;
};

qx.io.remote.XmlHttpTransport._createActiveXRequestObject = function() {
  return new ActiveXObject(qx.io.remote.XmlHttpTransport._activeXServer);
};
