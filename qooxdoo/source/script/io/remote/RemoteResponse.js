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

qx.OO.defineClass("qx.io.remote.RemoteResponse", qx.core.Target, 
function() {
  qx.core.Target.call(this);
});




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "state", type : qx.Const.TYPEOF_NUMBER });
/*!
  Status code of the response.
*/
qx.OO.addProperty({ name : "statusCode", type : qx.Const.TYPEOF_NUMBER });
qx.OO.addProperty({ name : "content" });
qx.OO.addProperty({ name : "responseHeaders", type : qx.Const.TYPEOF_OBJECT });







/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

/*
qx.Proto._modifyResponseHeaders = function(propValue, propOldValue, propData)
{
  for (vKey in propValue) {
    this.debug("R-Header: " + vKey + "=" + propValue[vKey]);
  };

  return true;
};
*/







/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

qx.Proto.getResponseHeader = function(vHeader)
{
  var vAll = this.getResponseHeaders();
  if (vAll) {
    return vAll[vHeader] || null;
  };

  return null;
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  return qx.core.Target.prototype.dispose.call(this);
};
