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
#require(qx.io.remote.IframeTransport)

************************************************************************ */

// basic registration to qx.io.remote.RemoteExchange
// the real availability check (activeX stuff and so on) follows at the first real request
qx.io.remote.RemoteExchange.registerType(qx.io.remote.IframeTransport, "qx.io.remote.IframeTransport");

qx.io.remote.IframeTransport.handles =
{
  synchronous : false,
  asynchronous : true,
  crossDomain : true,
  fileUpload: true,
  responseTypes : [ QxConst.MIMETYPE_TEXT, QxConst.MIMETYPE_JAVASCRIPT, QxConst.MIMETYPE_JSON, QxConst.MIMETYPE_XML, QxConst.MIMETYPE_HTML ]
};

qx.io.remote.IframeTransport.isSupported = function() {
  return true;
};
