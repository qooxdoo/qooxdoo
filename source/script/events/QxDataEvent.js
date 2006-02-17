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

#package(core)

************************************************************************ */

/*!
  Event object for property changes.
*/
function QxDataEvent(vType, vData)
{
  QxEvent.call(this, vType);

  this.setData(vData);
};

QxDataEvent.extend(QxEvent, "QxDataEvent");

QxDataEvent.addFastProperty({ name : "propagationStopped", defaultValue : false });
QxDataEvent.addFastProperty({ name : "data" });

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  this._valueData = null;

  return QxEvent.prototype.dispose.call(this);
};
