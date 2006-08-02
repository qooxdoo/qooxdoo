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

#module(layout)
#require(qx.constant.Layout)
#use(qx.renderer.layout.DockLayoutImpl)

************************************************************************ */

qx.OO.defineClass("qx.ui.layout.DockLayout", qx.ui.core.Parent,
function() {
  qx.ui.core.Parent.call(this);
});

/*!
  The layout mode (in which order the children should be layouted)
*/
qx.OO.addProperty({ name : "mode", type : qx.constant.Type.STRING, defaultValue : qx.constant.Layout.ORIENTATION_VERTICAL, possibleValues : [ qx.constant.Layout.ORIENTATION_VERTICAL, qx.constant.Layout.ORIENTATION_HORIZONTAL, "ordered" ], addToQueueRuntime : true });

/*
  Overwrite from qx.ui.core.Widget, we do not support 'auto' and 'flex'
*/
qx.OO.changeProperty({ name : "width", addToQueue : true, unitDetection : "pixelPercent" });
qx.OO.changeProperty({ name : "minWidth", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });
qx.OO.changeProperty({ name : "minWidth", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });
qx.OO.changeProperty({ name : "height", addToQueue : true, unitDetection : "pixelPercent" });
qx.OO.changeProperty({ name : "minHeight", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });
qx.OO.changeProperty({ name : "minHeight", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });






/*
---------------------------------------------------------------------------
  INIT LAYOUT IMPL
---------------------------------------------------------------------------
*/

/*!
  This creates an new instance of the layout impl this widget uses
*/
qx.Proto._createLayoutImpl = function() {
  return new qx.renderer.layout.DockLayoutImpl(this);
}




/*
---------------------------------------------------------------------------
  ENHANCED CHILDREN FEATURES
---------------------------------------------------------------------------
*/

/*!
  Add multiple childrens and make them left aligned
*/
qx.Proto.addLeft = function() {
  this._addAlignedHorizontal(qx.constant.Layout.ALIGN_LEFT, arguments);
}

/*!
  Add multiple childrens and make them right aligned
*/
qx.Proto.addRight = function() {
  this._addAlignedHorizontal(qx.constant.Layout.ALIGN_RIGHT, arguments);
}

/*!
  Add multiple childrens and make them top aligned
*/
qx.Proto.addTop = function() {
  this._addAlignedVertical(qx.constant.Layout.ALIGN_TOP, arguments);
}

/*!
  Add multiple childrens and make them bottom aligned
*/
qx.Proto.addBottom = function() {
  this._addAlignedVertical(qx.constant.Layout.ALIGN_BOTTOM, arguments);
}

qx.Proto._addAlignedVertical = function(vAlign, vArgs)
{
  for (var i=0, l=vArgs.length; i<l; i++) {
    vArgs[i].setVerticalAlign(vAlign);
  }

  this.add.apply(this, vArgs);
}

qx.Proto._addAlignedHorizontal = function(vAlign, vArgs)
{
  for (var i=0, l=vArgs.length; i<l; i++) {
    vArgs[i].setHorizontalAlign(vAlign);
  }

  this.add.apply(this, vArgs);
}
