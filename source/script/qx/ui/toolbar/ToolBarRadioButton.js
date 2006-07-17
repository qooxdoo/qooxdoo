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

#module(toolbar)
#require(qx.manager.selection.RadioManager)

************************************************************************ */

qx.OO.defineClass("qx.ui.toolbar.ToolBarRadioButton", qx.ui.toolbar.ToolBarCheckBox, 
function(vText, vIcon, vChecked) {
  qx.ui.toolbar.ToolBarCheckBox.call(this, vText, vIcon, vChecked);
});




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The assigned qx.manager.selection.RadioManager which handles the switching between registered buttons
*/
qx.OO.addProperty({ name : "manager", type : qx.constant.Type.OBJECT, instance : "qx.manager.selection.RadioManager", allowNull : true });

/*!
  The name of the radio group. All the radio elements in a group (registered by the same manager)
  have the same name (and could have a different value).
*/
qx.OO.addProperty({ name : "name", type : qx.constant.Type.STRING });

/*!
  Prohibit the deselction of the checked radio button when clicked on it.
*/
qx.OO.addProperty({ name : "disableUncheck", type : qx.constant.Type.BOOLEAN, defaultValue : false });






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyChecked = function(propValue, propOldValue, propData)
{
  qx.ui.toolbar.ToolBarCheckBox.prototype._modifyChecked.call(this, propValue, propOldValue, propData);

  var vManager = this.getManager();
  if (vManager) {
    vManager.handleItemChecked(this, propValue);
  }

  return true;
}

qx.Proto._modifyManager = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.remove(this);
  }

  if (propValue) {
    propValue.add(this);
  }

  return true;
}





/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

qx.Proto._onmouseup = function(e)
{
  this.setCapture(false);

  if (!this.hasState(qx.ui.form.Button.STATE_ABANDONED))
  {
    this.addState(qx.ui.core.Widget.STATE_OVER);
    this.setChecked(this.getDisableUncheck() || !this.getChecked());
    this.execute();
  }

  this.removeState(qx.ui.form.Button.STATE_ABANDONED);
  this.removeState(qx.ui.form.Button.STATE_PRESSED);

  e.stopPropagation();
}
