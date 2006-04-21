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
#require(qx.manager.selection.RadioManager)

************************************************************************ */

qx.ui.toolbar.ToolBarRadioButton = function(vText, vIcon, vChecked) {
  qx.ui.toolbar.ToolBarCheckBox.call(this, vText, vIcon, vChecked);
};

qx.ui.toolbar.ToolBarRadioButton.extend(qx.ui.toolbar.ToolBarCheckBox, "qx.ui.toolbar.ToolBarRadioButton");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The assigned qx.manager.selection.RadioManager which handles the switching between registered buttons
*/
qx.ui.toolbar.ToolBarRadioButton.addProperty({ name : "manager", type : qx.Const.TYPEOF_OBJECT, instance : "qx.manager.selection.RadioManager", allowNull : true });

/*!
  The name of the radio group. All the radio elements in a group (registered by the same manager)
  have the same name (and could have a different value).
*/
qx.ui.toolbar.ToolBarRadioButton.addProperty({ name : "name", type : qx.Const.TYPEOF_STRING });

/*!
  Prohibit the deselction of the checked radio button when clicked on it.
*/
qx.ui.toolbar.ToolBarRadioButton.addProperty({ name : "disableUncheck", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : false });






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyChecked = function(propValue, propOldValue, propData)
{
  qx.ui.toolbar.ToolBarCheckBox.prototype._modifyChecked.call(this, propValue, propOldValue, propData);

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

  if (!this.hasState(qx.Const.STATE_ABANDONED))
  {
    this.addState(qx.Const.STATE_OVER);
    this.setChecked(this.getDisableUncheck() || !this.getChecked());
    this.execute();
  };

  this.removeState(qx.Const.STATE_ABANDONED);
  this.removeState(qx.Const.STATE_PRESSED);

  e.stopPropagation();
};
