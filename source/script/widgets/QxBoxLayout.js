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
#post(QxHorizontalBoxLayoutImpl)
#post(QxVerticalBoxLayoutImpl)

************************************************************************ */

function QxBoxLayout(vOrientation)
{
  QxParent.call(this);

  // apply orientation
  if (QxUtil.isValidString(vOrientation)) {
    this.setOrientation(vOrientation);
  };
};

QxBoxLayout.extend(QxParent, "QxBoxLayout");

QxBoxLayout.STR_REVERSED = "-reversed";



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The orientation of the layout control. Allowed values are QxConst.ORIENTATION_HORIZONTAL (default) and QxConst.ORIENTATION_VERTICAL.
*/
QxBoxLayout.addProperty({ name : "orientation", type : QxConst.TYPEOF_STRING, possibleValues : [ QxConst.ORIENTATION_HORIZONTAL, QxConst.ORIENTATION_VERTICAL ], addToQueueRuntime : true });

/*!
  The spacing between childrens. Could be any positive integer value.
*/
QxBoxLayout.addProperty({ name : "spacing", type : QxConst.TYPEOF_NUMBER, defaultValue : 0, addToQueueRuntime : true, impl : "layout" });

/*!
  The horizontal align of the children. Allowed values are: "left", "center" and "right"
*/
QxBoxLayout.addProperty({ name : "horizontalChildrenAlign", type : QxConst.TYPEOF_STRING, defaultValue : "left", possibleValues : [ "left", "center", "right" ], impl : "layoutOrder", addToQueueRuntime : true });

/*!
  The vertical align of the children. Allowed values are: "top", "middle" and "bottom"
*/
QxBoxLayout.addProperty({ name : "verticalChildrenAlign", type : QxConst.TYPEOF_STRING, defaultValue : "top", possibleValues : [ "top", "middle", "bottom" ], impl : "layoutOrder", addToQueueRuntime : true });

/*!
  Should the children be layouted in reverse order?
*/
QxBoxLayout.addProperty({ name : "reverseChildrenOrder", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, impl : "layoutOrder", addToQueueRuntime : true });

/*!
  Should the widgets be stretched to the available width (orientation==vertical) or height (orientation==horizontal)?
  This only applies if the child has not configured a own value for this axis.
*/
QxBoxLayout.addProperty({ name : "stretchChildrenOrthogonalAxis", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true, addToQueueRuntime : true });

/*!
  If there are min/max values in combination with flex try to optimize placement.
  This is more complex and produces more time for the layouter but sometimes this feature is needed.
*/
QxBoxLayout.addProperty({ name : "useAdvancedFlexAllocation", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, addToQueueRuntime : true });





/*
---------------------------------------------------------------------------
  INIT LAYOUT IMPL
---------------------------------------------------------------------------
*/

/*!
  This creates an new instance of the layout impl this widget uses
*/
proto._createLayoutImpl = function() {
  return this.getOrientation() == QxConst.ORIENTATION_VERTICAL ? new QxVerticalBoxLayoutImpl(this) : new QxHorizontalBoxLayoutImpl(this);
};






/*
---------------------------------------------------------------------------
  HELPERS
---------------------------------------------------------------------------
*/

proto._layoutHorizontal = false;
proto._layoutVertical = false;
proto._layoutMode = "left";

proto.isHorizontal = function() {
  return this._layoutHorizontal;
};

proto.isVertical = function() {
  return this._layoutVertical;
};

proto.getLayoutMode = function()
{
  if (this._layoutMode == null) {
    this._updateLayoutMode();
  };

  return this._layoutMode;
};

proto._updateLayoutMode = function()
{
  this._layoutMode = this._layoutVertical ? this.getVerticalChildrenAlign() : this.getHorizontalChildrenAlign();

  if (this.getReverseChildrenOrder()) {
    this._layoutMode += QxBoxLayout.STR_REVERSED;
  };
};

proto._invalidateLayoutMode = function() {
  this._layoutMode = null;
};






/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifyOrientation = function(propValue, propOldValue, propData)
{
  // update fast access variables
  this._layoutHorizontal = propValue == QxConst.ORIENTATION_HORIZONTAL;
  this._layoutVertical = propValue == QxConst.ORIENTATION_VERTICAL;

  // Layout Implementation
  if (this._layoutImpl)
  {
    this._layoutImpl.dispose();
    this._layoutImpl = null;
  };

  if (QxUtil.isValidString(propValue)) {
    this._layoutImpl = this._createLayoutImpl();
  };

  // call other core modifier
  return this._modifyLayoutOrder(propValue, propOldValue, propData);
};

proto._modifyLayoutOrder = function(propValue, propOldValue, propData)
{
  // update layout mode
  this._invalidateLayoutMode();

  // call other core modifier
  return this._modifyLayout(propValue, propOldValue, propData);
};

proto._modifyLayout = function(propValue, propOldValue, propData)
{
  // invalidate inner preferred dimensions
  this._invalidatePreferredInnerDimensions();

  // accumulated width needs to be invalidated
  this._invalidateAccumulatedChildrenOuterWidth();
  this._invalidateAccumulatedChildrenOuterHeight();

  // make property handling happy :)
  return true;
};





/*
---------------------------------------------------------------------------
  ACCUMULATED CHILDREN WIDTH/HEIGHT
--------------------------------------------------------------------------------

  Needed for center/middle and right/bottom alignment

---------------------------------------------------------------------------
*/

QxWidget.addCachedProperty({ name : "accumulatedChildrenOuterWidth", defaultValue : null });
QxWidget.addCachedProperty({ name : "accumulatedChildrenOuterHeight", defaultValue : null });

proto._computeAccumulatedChildrenOuterWidth = function()
{
  var ch=this.getVisibleChildren(), chc, i=-1, sp=this.getSpacing(), s=-sp;

  while(chc=ch[++i]) {
    s += chc.getOuterWidth() + sp;
  };

  return s;
};

proto._computeAccumulatedChildrenOuterHeight = function()
{
  var ch=this.getVisibleChildren(), chc, i=-1, sp=this.getSpacing(), s=-sp;

  while(chc=ch[++i]) {
    s += chc.getOuterHeight() + sp;
  };

  return s;
};







/*
---------------------------------------------------------------------------
  STRETCHING SUPPORT
---------------------------------------------------------------------------
*/

proto._recomputeChildrenStretchingX = function()
{
  var ch=this.getVisibleChildren(), chc, i=-1;

  while(chc=ch[++i])
  {
    if (chc._recomputeStretchingX() && chc._recomputeBoxWidth()) {
      chc._recomputeOuterWidth();
    };
  };
};

proto._recomputeChildrenStretchingY = function()
{
  var ch=this.getVisibleChildren(), chc, i=-1;

  while(chc=ch[++i])
  {
    if (chc._recomputeStretchingY() && chc._recomputeBoxHeight()) {
      chc._recomputeOuterHeight();
    };
  };
};
