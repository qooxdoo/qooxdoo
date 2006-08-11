/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_toolbar)

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
