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

#module(ui_buttonview)

************************************************************************ */

qx.OO.defineClass("qx.ui.pageview.buttonview.ButtonViewBar", qx.ui.pageview.AbstractPageViewBar,
function() {
  qx.ui.pageview.AbstractPageViewBar.call(this);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "bar-view-bar" });




/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

qx.Proto.getWheelDelta = function(e)
{
  var vWheelDelta = e.getWheelDelta();

  switch(this.getParent().getBarPosition())
  {
    case qx.constant.Layout.ALIGN_LEFT:
    case qx.constant.Layout.ALIGN_RIGHT:
      vWheelDelta *= -1;
  }

  return vWheelDelta;
}





/*
---------------------------------------------------------------------------
  APPEARANCE ADDITIONS
---------------------------------------------------------------------------
*/

qx.Proto._applyStateAppearance = function()
{
  var vPos = this.getParent().getBarPosition();

  this._states.barLeft = vPos === qx.constant.Layout.ALIGN_LEFT;
  this._states.barRight = vPos === qx.constant.Layout.ALIGN_RIGHT;
  this._states.barTop = vPos === qx.constant.Layout.ALIGN_TOP;
  this._states.barBottom = vPos === qx.constant.Layout.ALIGN_BOTTOM;

  qx.ui.pageview.AbstractPageViewButton.prototype._applyStateAppearance.call(this);
}
