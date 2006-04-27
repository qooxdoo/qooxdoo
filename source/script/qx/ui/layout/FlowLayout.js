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
#use(qx.renderer.layout.FlowLayoutImpl)

************************************************************************ */

qx.OO.defineClass("qx.ui.layout.FlowLayout", qx.ui.core.Parent, 
function() {
  qx.ui.core.Parent.call(this);
});

/*!
  The spacing between childrens. Could be any positive integer value.
*/
qx.OO.addProperty({ name : "horizontalSpacing", type : qx.Const.TYPEOF_NUMBER, defaultValue : 0, addToQueueRuntime : true, impl : "layout" });

/*!
  The spacing between childrens. Could be any positive integer value.
*/
qx.OO.addProperty({ name : "verticalSpacing", type : qx.Const.TYPEOF_NUMBER, defaultValue : 0, addToQueueRuntime : true, impl : "layout" });

/*!
  The horizontal align of the children. Allowed values are: "left" and "right"
*/
qx.OO.addProperty({ name : "horizontalChildrenAlign", type : qx.Const.TYPEOF_STRING, defaultValue : "left", possibleValues : [ "left", "right" ], addToQueueRuntime : true });

/*!
  The vertical align of the children. Allowed values are: "top" and "bottom"
*/
qx.OO.addProperty({ name : "verticalChildrenAlign", type : qx.Const.TYPEOF_STRING, defaultValue : "top", possibleValues : [ "top", "bottom" ], addToQueueRuntime : true });

/*!
  Should the children be layouted in reverse order?
*/
qx.OO.addProperty({ name : "reverseChildrenOrder", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : false, addToQueueRuntime : true, impl : "layout" });






/*
---------------------------------------------------------------------------
  INIT LAYOUT IMPL
---------------------------------------------------------------------------
*/

/*!
  This creates an new instance of the layout impl this widget uses
*/
qx.Proto._createLayoutImpl = function() {
  return new qx.renderer.layout.FlowLayoutImpl(this);
};





/*
---------------------------------------------------------------------------
  DIMENSION CACHE
---------------------------------------------------------------------------
*/

qx.Proto._changeInnerWidth = function(vNew, vOld)
{
  qx.ui.core.Parent.prototype._changeInnerWidth.call(this, vNew, vOld);

  // allow 'auto' values for height to update when the inner width changes
  this._invalidatePreferredInnerHeight();
};




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyLayout = function(propValue, propOldValue, propData)
{
  // invalidate inner preferred dimensions
  this._invalidatePreferredInnerDimensions();

  return true;
};
