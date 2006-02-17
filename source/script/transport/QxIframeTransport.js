/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
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

#package(ajax)

************************************************************************ */

function QxIframeTransport()
{
  QxTarget.call(this);
    
};

QxIframeTransport.extend(QxTarget, "QxIframeTransport");

// basic registration to QxTransport
// the real availability check (activeX stuff and so on) follows at the first real request
QxTransport.registerType(QxIframeTransport, "QxIframeTransport");

QxIframeTransport.isSupported = function() {
  return false;
};






/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

proto.send = function()
{
  this.debug("Sending...");  
};
