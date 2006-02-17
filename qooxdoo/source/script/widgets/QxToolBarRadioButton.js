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

#package(toolbar)
#require(QxRadioManager)

************************************************************************ */

function QxToolBarRadioButton(vText, vIcon, vChecked) {
  QxToolBarCheckBox.call(this, vText, vIcon, vChecked);
};

QxToolBarRadioButton.extend(QxToolBarCheckBox, "QxToolBarRadioButton");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The assigned QxRadioManager which handles the switching between registered buttons
*/
QxToolBarRadioButton.addProperty({ name : "manager", type : QxConst.TYPEOF_OBJECT, instance : "QxRadioManager", allowNull : true });

/*!
  The name of the radio group. All the radio elements in a group (registered by the same manager)
  have the same name (and could have a different value).
*/
QxToolBarRadioButton.addProperty({ name : "name", type : QxConst.TYPEOF_STRING });

/*!
  Prohibit the deselction of the checked radio button when clicked on it.
*/
QxToolBarRadioButton.addProperty({ name : "disableUncheck", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyChecked = function(propValue, propOldValue, propData)
{
  QxToolBarCheckBox.prototype._modifyChecked.call(this, propValue, propOldValue, propData);

  var vManager = this.getManager();
  if (vManager) {
    vManager.handleItemChecked(this, propValue);
  };

  return true;
};

proto._modifyManager = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.remove(this);
  };

  if (propValue) {
    propValue.add(this);
  };

  return true;
};





/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

proto._onmouseup = function(e)
{
  this.setCapture(false);
  
  if (!this.hasState(QxConst.STATE_ABANDONED))
  {
    this.addState(QxConst.STATE_OVER);
    this.setChecked(this.getDisableUncheck() || !this.getChecked());
    this.execute();      
  };
  
  this.removeState(QxConst.STATE_ABANDONED);
  this.removeState(QxConst.STATE_PRESSED);
  
  e.stopPropagation();
};
