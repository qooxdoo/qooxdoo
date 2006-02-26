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
  This manager is used by all objects which needs ranges like QxSpinner, QxSlider, ...
*/
function QxRangeManager()
{
  // We need no internal objects cache
  QxTarget.call(this);
};

QxRangeManager.extend(QxManager, "QxRangeManager");

QxRangeManager.addProperty({ name : "value", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });
QxRangeManager.addProperty({ name : "min", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });
QxRangeManager.addProperty({ name : "max", type : QxConst.TYPEOF_NUMBER, defaultValue : 100 });
QxRangeManager.addProperty({ name : "step", type : QxConst.TYPEOF_NUMBER, defaultValue : 1 });

QxRangeManager.CHANGE_EVENTTYPE = QxConst.INTERNAL_CHANGE;

proto._checkValue = function(propValue) {
  return Math.max(this.getMin(), Math.min(this.getMax(), Math.floor(propValue)));
};

proto._modifyValue = function(propValue, propOldValue, propData)
{
  if (this.hasEventListeners(QxRangeManager.CHANGE_EVENTTYPE)) {
    this.dispatchEvent(new QxEvent(QxRangeManager.CHANGE_EVENTTYPE), true);
  };

  return true;
};

proto._checkMax = function(propValue) {
  return Math.floor(propValue);
};

proto._modifyMax = function(propValue, propOldValue, propData)
{
  this.setValue(Math.min(this.getValue(), propValue));

  if (this.hasEventListeners(QxRangeManager.CHANGE_EVENTTYPE)) {
    this.dispatchEvent(new QxEvent(QxRangeManager.CHANGE_EVENTTYPE), true);
  };

  return true;
};

proto._checkMin = function(propValue) {
  return Math.floor(propValue);
};

proto._modifyMin = function(propValue, propOldValue, propData)
{
  this.setValue(Math.max(this.getValue(), propValue));

  if (this.hasEventListeners(QxRangeManager.CHANGE_EVENTTYPE)) {
    this.dispatchEvent(new QxEvent(QxRangeManager.CHANGE_EVENTTYPE), true);
  };

  return true;
};
