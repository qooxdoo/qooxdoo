/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/*!
  Event object for property changes.
*/
qx.OO.defineClass("qx.event.type.DataEvent", qx.event.type.Event, 
function(vType, vData)
{
  qx.event.type.Event.call(this, vType);

  this.setData(vData);
});

qx.OO.addFastProperty({ name : "propagationStopped", defaultValue : false });
qx.OO.addFastProperty({ name : "data" });

qx.Proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  }

  this._valueData = null;

  return qx.event.type.Event.prototype.dispose.call(this);
}
