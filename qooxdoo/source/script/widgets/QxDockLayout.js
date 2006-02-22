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
#post(QxDockLayoutImpl)

************************************************************************ */

function QxDockLayout() {
  QxParent.call(this);
};

QxDockLayout.extend(QxParent, "QxDockLayout");

/*!
  The layout mode (in which order the children should be layouted)
*/
QxDockLayout.addProperty({ name : "mode", type : QxConst.TYPEOF_STRING, defaultValue : QxConst.ORIENTATION_VERTICAL, possibleValues : [ QxConst.ORIENTATION_VERTICAL, QxConst.ORIENTATION_HORIZONTAL, "ordered" ], addToQueueRuntime : true });

/*
  Overwrite from QxWidget, we do not support 'auto' and 'flex'
*/
QxDockLayout.changeProperty({ name : "width", addToQueue : true, unitDetection : "pixelPercent" });
QxDockLayout.changeProperty({ name : "minWidth", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });
QxDockLayout.changeProperty({ name : "minWidth", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });
QxDockLayout.changeProperty({ name : "height", addToQueue : true, unitDetection : "pixelPercent" });
QxDockLayout.changeProperty({ name : "minHeight", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });
QxDockLayout.changeProperty({ name : "minHeight", defaultValue : -Infinity, addToQueue : true, unitDetection : "pixelPercent" });






/*
---------------------------------------------------------------------------
  INIT LAYOUT IMPL
---------------------------------------------------------------------------
*/

/*!
  This creates an new instance of the layout impl this widget uses
*/
proto._createLayoutImpl = function() {
  return new QxDockLayoutImpl(this);
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
  this._addAlignedHorizontal(QxConst.ALIGN_LEFT, arguments);
};

/*!
  Add multiple childrens and make them right aligned
*/
proto.addRight = function() {
  this._addAlignedHorizontal(QxConst.ALIGN_RIGHT, arguments);
};

/*!
  Add multiple childrens and make them top aligned
*/
proto.addTop = function() {
  this._addAlignedVertical(QxConst.ALIGN_TOP, arguments);
};

/*!
  Add multiple childrens and make them bottom aligned
*/
proto.addBottom = function() {
  this._addAlignedVertical(QxConst.ALIGN_BOTTOM, arguments);
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
