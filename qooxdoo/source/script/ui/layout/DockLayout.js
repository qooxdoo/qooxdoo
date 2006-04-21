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

#package(layout)
#post(qx.renderer.layout.DockLayoutImpl)

************************************************************************ */

qx.ui.layout.DockLayout = function() {
  qx.ui.core.Parent.call(this);
};

qx.ui.layout.DockLayout.extend(qx.ui.core.Parent, "qx.ui.layout.DockLayout");

/*!
  The layout mode (in which order the children should be layouted)
*/
qx.ui.layout.DockLayout.addProperty({ name : "mode", type : qx.Const.TYPEOF_STRING, defaultValue : qx.Const.ORIENTATION_VERTICAL, possibleValues : [ qx.Const.ORIENTATION_VERTICAL, qx.Const.ORIENTATION_HORIZONTAL, "ordered" ], addToQueueRuntime : true });

/*
  Overwrite from qx.ui.core.Widget, we do not support 'auto' and 'flex'
*/
qx.ui.layout.DockLayout.changeProperty({ name : "width", addToQueue : true, unitDetection : "pixelPercent" });
qx.ui.layout.DockLayout.changeProperty({ name : "minWidth", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });
qx.ui.layout.DockLayout.changeProperty({ name : "minWidth", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });
qx.ui.layout.DockLayout.changeProperty({ name : "height", addToQueue : true, unitDetection : "pixelPercent" });
qx.ui.layout.DockLayout.changeProperty({ name : "minHeight", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });
qx.ui.layout.DockLayout.changeProperty({ name : "minHeight", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });






/*
---------------------------------------------------------------------------
  INIT LAYOUT IMPL
---------------------------------------------------------------------------
*/

/*!
  This creates an new instance of the layout impl this widget uses
*/
proto._createLayoutImpl = function() {
  return new qx.renderer.layout.DockLayoutImpl(this);
};




/*
---------------------------------------------------------------------------
  ENHANCED CHILDREN FEATURES
---------------------------------------------------------------------------
*/

/*!
  Add multiple childrens and make them left aligned
*/
proto.addLeft = function() {
  this._addAlignedHorizontal(qx.Const.ALIGN_LEFT, arguments);
};

/*!
  Add multiple childrens and make them right aligned
*/
proto.addRight = function() {
  this._addAlignedHorizontal(qx.Const.ALIGN_RIGHT, arguments);
};

/*!
  Add multiple childrens and make them top aligned
*/
proto.addTop = function() {
  this._addAlignedVertical(qx.Const.ALIGN_TOP, arguments);
};

/*!
  Add multiple childrens and make them bottom aligned
*/
proto.addBottom = function() {
  this._addAlignedVertical(qx.Const.ALIGN_BOTTOM, arguments);
};

proto._addAlignedVertical = function(vAlign, vArgs)
{
  for (var i=0, l=vArgs.length; i<l; i++) {
    vArgs[i].setVerticalAlign(vAlign);
  };

  this.add.apply(this, vArgs);
};

proto._addAlignedHorizontal = function(vAlign, vArgs)
{
  for (var i=0, l=vArgs.length; i<l; i++) {
    vArgs[i].setHorizontalAlign(vAlign);
  };

  this.add.apply(this, vArgs);
};
