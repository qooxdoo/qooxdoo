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

************************************************************************ */

qx.OO.defineClass("qx.ui.toolbar.ToolBarCheckBox", qx.ui.toolbar.ToolBarButton, 
function(vText, vIcon, vChecked)
{
  qx.ui.toolbar.ToolBarButton.call(this, vText, vIcon);

  if (qx.util.Validation.isValid(vChecked)) {
    this.setChecked(vChecked);
  }
});



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "checked", type : qx.constant.Type.BOOLEAN, defaultValue : false });





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyChecked = function(propValue, propOldValue, propData)
{
  propValue ? this.addState(qx.ui.form.Button.STATE_CHECKED) : this.removeState(qx.ui.form.Button.STATE_CHECKED);
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
    this.setChecked(!this.getChecked());
    this.execute();
  }

  this.removeState(qx.ui.form.Button.STATE_ABANDONED);
  this.removeState(qx.ui.form.Button.STATE_PRESSED);

  e.stopPropagation();
}
