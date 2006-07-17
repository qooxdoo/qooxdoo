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

#module(menu)

************************************************************************ */

/*!
  A checkbox for the menu system.
*/
qx.OO.defineClass("qx.ui.menu.MenuCheckBox", qx.ui.menu.MenuButton, 
function(vLabel, vCommand, vChecked)
{
  qx.ui.menu.MenuButton.call(this, vLabel, qx.manager.object.ImageManager.BLANK, vCommand);

  if (qx.util.Validation.isValidBoolean(vChecked)) {
    this.setChecked(vChecked);
  }

  this._iconObject.setAppearance("menu-check-box-icon");
});



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "menu-check-box" });
qx.OO.addProperty({ name : "name", type : qx.constant.Type.STRING });
qx.OO.addProperty({ name : "value", type : qx.constant.Type.STRING });
qx.OO.addProperty({ name : "checked", type : qx.constant.Type.BOOLEAN, defaultValue : false, getAlias : "isChecked" });





/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifyChecked = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this.addState(qx.ui.form.Button.STATE_CHECKED);
    this.getIconObject().addState(qx.ui.form.Button.STATE_CHECKED);
  }
  else
  {
    this.removeState(qx.ui.form.Button.STATE_CHECKED);
    this.getIconObject().removeState(qx.ui.form.Button.STATE_CHECKED);
  }

  return true;
}





/*
---------------------------------------------------------------------------
  EXECUTE
---------------------------------------------------------------------------
*/

qx.Proto.execute = function()
{
  this.setChecked(!this.getChecked());
  qx.ui.menu.MenuButton.prototype.execute.call(this);
}
