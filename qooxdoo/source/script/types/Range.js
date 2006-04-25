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

#package(range)

************************************************************************ */

/*!
  This manager is used by all objects which needs ranges like qx.ui.form.Spinner, QxSlider, ...
*/
qx.OO.defineClass("qx.types.Range", qx.manager.object.ObjectManager, 
function()
{
  // We need no internal objects cache
  qx.core.Target.call(this);
});

qx.types.Range.addProperty({ name : "value", type : qx.Const.TYPEOF_NUMBER, defaultValue : 0 });
qx.types.Range.addProperty({ name : "min", type : qx.Const.TYPEOF_NUMBER, defaultValue : 0 });
qx.types.Range.addProperty({ name : "max", type : qx.Const.TYPEOF_NUMBER, defaultValue : 100 });
qx.types.Range.addProperty({ name : "step", type : qx.Const.TYPEOF_NUMBER, defaultValue : 1 });

qx.Proto._checkValue = function(propValue) {
  return Math.max(this.getMin(), Math.min(this.getMax(), Math.floor(propValue)));
};

qx.Proto._modifyValue = function(propValue, propOldValue, propData)
{
  if (this.hasEventListeners(qx.Const.EVENT_TYPE_CHANGE)) {
    this.dispatchEvent(new qx.event.types.Event(qx.Const.EVENT_TYPE_CHANGE), true);
  };

  return true;
};

qx.Proto._checkMax = function(propValue) {
  return Math.floor(propValue);
};

qx.Proto._modifyMax = function(propValue, propOldValue, propData)
{
  this.setValue(Math.min(this.getValue(), propValue));

  if (this.hasEventListeners(qx.Const.EVENT_TYPE_CHANGE)) {
    this.dispatchEvent(new qx.event.types.Event(qx.Const.EVENT_TYPE_CHANGE), true);
  };

  return true;
};

qx.Proto._checkMin = function(propValue) {
  return Math.floor(propValue);
};

qx.Proto._modifyMin = function(propValue, propOldValue, propData)
{
  this.setValue(Math.max(this.getValue(), propValue));

  if (this.hasEventListeners(qx.Const.EVENT_TYPE_CHANGE)) {
    this.dispatchEvent(new qx.event.types.Event(qx.Const.EVENT_TYPE_CHANGE), true);
  };

  return true;
};
