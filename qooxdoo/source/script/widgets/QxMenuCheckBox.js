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

#package(menu)

************************************************************************ */

/*!
  A checkbox for the menu system.
*/
function QxMenuCheckBox(vLabel, vCommand, vChecked)
{
  QxMenuButton.call(this, vLabel, QxConst.IMAGE_BLANK, vCommand);

  if (QxUtil.isValidBoolean(vChecked)) {
    this.setChecked(vChecked);
  };

  this._iconObject.setAppearance("menu-check-box-icon");
};

QxMenuCheckBox.extend(QxMenuButton, "QxMenuCheckBox");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxMenuCheckBox.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "menu-check-box" });
QxMenuCheckBox.addProperty({ name : "name", type : QxConst.TYPEOF_STRING });
QxMenuCheckBox.addProperty({ name : "value", type : QxConst.TYPEOF_STRING });
QxMenuCheckBox.addProperty({ name : "checked", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, getAlias : "isChecked" });





/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifyChecked = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this.addState(QxConst.STATE_CHECKED);
    this.getIconObject().addState(QxConst.STATE_CHECKED);
  }
  else
  {
    this.removeState(QxConst.STATE_CHECKED);
    this.getIconObject().removeState(QxConst.STATE_CHECKED);
  };

  return true;
};





/*
---------------------------------------------------------------------------
  EXECUTE
---------------------------------------------------------------------------
*/

proto.execute = function()
{
  this.setChecked(!this.getChecked());
  QxMenuButton.prototype.execute.call(this);
};
