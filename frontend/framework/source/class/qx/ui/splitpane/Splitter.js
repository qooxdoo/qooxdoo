/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Volker Pauli (vpauli)
     * Sebastian Werner (wpbasti)

 ************************************************************************ */

/* ************************************************************************

#module(ui_splitpane)

 ************************************************************************ */


/**
 * Creates a new instance of a splitter. This class is used by SplitPane an should not used
 * on its own.
 *
 * @parm orientation {string} The orientation of the splitter. Allowed values are qx.constant.Layout.ORIENTATION_HORIZONTAL (default) and qx.constant.Layout.ORIENTATION_VERTICAL. This is the same type as used in {@link qx.ui.layout.BoxLayout#orientation}.
 */

qx.OO.defineClass("qx.ui.splitpane.Splitter", qx.ui.layout.CanvasLayout,
function() {
  qx.ui.layout.CanvasLayout.call(this);
});






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
 */

/**
 * The appearance of the splitter
 */
qx.OO.changeProperty({ name : "appearance", defaultValue : "splitpane-splitter" });

/**
 * The size of the splitter control in px
 */
qx.OO.addProperty({ name : "size", type : qx.constant.Type.NUMBER, allowNull : false, defaultValue : 2, impl : "layout" });

/**
 * The orientation of the splitter control. Allowed values are qx.constant.Layout.ORIENTATION_HORIZONTAL (default) and qx.constant.Layout.ORIENTATION_VERTICAL.
 */
qx.OO.addProperty({ name : "orientation", type : qx.constant.Type.STRING, possibleValues : [ qx.constant.Layout.ORIENTATION_HORIZONTAL, qx.constant.Layout.ORIENTATION_VERTICAL ], impl : "layout" });





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
 */

qx.Proto._modifyLayout = function(propValue, propOldValue, propData)
{
  if (this.getOrientation() === qx.constant.Layout.ORIENTATION_HORIZONTAL) {
    this.setWidth(this.getSize());
    this.setHeight(null);
  } else {
    this.setWidth(null);
    this.setHeight(this.getSize());
  }

  return true;
}
