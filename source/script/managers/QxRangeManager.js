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
qx.types.Range = function()
{
  // We need no internal objects cache
  qx.core.Target.call(this);
};

qx.types.Range.extend(qx.manager.object.ObjectManager, "qx.types.Range");

qx.types.Range.addProperty({ name : "value", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });
qx.types.Range.addProperty({ name : "min", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });
qx.types.Range.addProperty({ name : "max", type : QxConst.TYPEOF_NUMBER, defaultValue : 100 });
qx.types.Range.addProperty({ name : "step", type : QxConst.TYPEOF_NUMBER, defaultValue : 1 });

qx.types.Range.CHANGE_EVENTTYPE = QxConst.INTERNAL_CHANGE;

proto._checkValue = function(propValue) {
  return Math.max(this.getMin(), Math.min(this.getMax(), Math.floor(propValue)));
};

proto._modifyValue = function(propValue, propOldValue, propData)
{
  if (this.hasEventListeners(qx.types.Range.CHANGE_EVENTTYPE)) {
    this.dispatchEvent(new qx.event.types.Event(qx.types.Range.CHANGE_EVENTTYPE), true);
  };

  return true;
};

proto._checkMax = function(propValue) {
  return Math.floor(propValue);
};

proto._modifyMax = function(propValue, propOldValue, propData)
{
  this.setValue(Math.min(this.getValue(), propValue));

  if (this.hasEventListeners(qx.types.Range.CHANGE_EVENTTYPE)) {
    this.dispatchEvent(new qx.event.types.Event(qx.types.Range.CHANGE_EVENTTYPE), true);
  };

  return true;
};

proto._checkMin = function(propValue) {
  return Math.floor(propValue);
};

proto._modifyMin = function(propValue, propOldValue, propData)
{
  this.setValue(Math.max(this.getValue(), propValue));

  if (this.hasEventListeners(qx.types.Range.CHANGE_EVENTTYPE)) {
    this.dispatchEvent(new qx.event.types.Event(qx.types.Range.CHANGE_EVENTTYPE), true);
  };

  return true;
};
