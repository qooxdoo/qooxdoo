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

function QxResponse()
{
  QxTarget.call(this);
};

QxResponse.extend(QxTarget, "QxResponse");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxResponse.addProperty({ name : "state", type : QxConst.TYPEOF_NUMBER });
QxResponse.addProperty({ name : "statusCode", type : QxConst.TYPEOF_NUMBER });
QxResponse.addProperty({ name : "textContent", type : QxConst.TYPEOF_STRING });
QxResponse.addProperty({ name : "xmlContent", type : QxConst.TYPEOF_OBJECT });




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
  
  return QxTarget.prototype.dispose.call(this);  
};
