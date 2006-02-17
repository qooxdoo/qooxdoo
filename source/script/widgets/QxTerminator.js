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

#package(guicore)

************************************************************************ */

/*!
  This widget is the last widget of the current child chain.
*/
function QxTerminator() {
  QxWidget.call(this);
};

QxTerminator.extend(QxWidget, "QxTerminator");






/*
---------------------------------------------------------------------------
  APPLY PADDING
---------------------------------------------------------------------------
*/

proto._applyPaddingX = function(vParent, vChanges, vStyle)
{
  if (vChanges.paddingLeft) {
    this._applyRuntimePaddingLeft(this.getPaddingLeft());
  };

  if (vChanges.paddingRight) {
    this._applyRuntimePaddingRight(this.getPaddingRight());
  };
};

proto._applyPaddingY = function(vParent, vChanges, vStyle)
{
  if (vChanges.paddingTop) {
    this._applyRuntimePaddingTop(this.getPaddingTop());
  };

  if (vChanges.paddingBottom) {
    this._applyRuntimePaddingBottom(this.getPaddingBottom());
  };
};






/*
---------------------------------------------------------------------------
  APPLY CONTENT
---------------------------------------------------------------------------
*/

proto._applyContent = function()
{
  // Small optimization: Only add innerPreferred jobs
  // if we don't have a static width
  if (this._computedWidthTypePixel) {
    this._cachedPreferredInnerWidth = null;
  } else {
    this._invalidatePreferredInnerWidth();
  };

  // Small optimization: Only add innerPreferred jobs
  // if we don't have a static height
  if (this._computedHeightTypePixel) {
    this._cachedPreferredInnerHeight = null;
  } else {
    this._invalidatePreferredInnerHeight();
  };

  // add load job
  if (this._initialLayoutDone) {
    this.addToJobQueue(QxConst.EVENT_TYPE_LOAD);
  };
};

proto._layoutPost = function(vChanges) {
  if (vChanges.initial || vChanges.load || vChanges.width || vChanges.height) {
    this._postApply();
  };
};

proto._postApply = QxUtil.returnTrue;







/*
---------------------------------------------------------------------------
  BOX DIMENSION HELPERS
---------------------------------------------------------------------------
*/

proto._computeBoxWidthFallback = proto.getPreferredBoxWidth;
proto._computeBoxHeightFallback = proto.getPreferredBoxHeight;

proto._computePreferredInnerWidth = QxUtil.returnZero;
proto._computePreferredInnerHeight = QxUtil.returnZero;







/*
---------------------------------------------------------------------------
  METHODS TO GIVE THE LAYOUTERS INFORMATIONS
---------------------------------------------------------------------------
*/

proto._isWidthEssential = function()
{
  if (!this._computedLeftTypeNull && !this._computedRightTypeNull) {
    return true;
  };

  if (!this._computedWidthTypeNull && !this._computedWidthTypeAuto) {
    return true;
  };

  if (!this._computedMinWidthTypeNull && !this._computedMinWidthTypeAuto) {
    return true;
  };

  if (!this._computedMaxWidthTypeNull && !this._computedMaxWidthTypeAuto) {
    return true;
  };

  if (this._borderElement) {
    return true;
  };

  return false;
};

proto._isHeightEssential = function()
{
  if (!this._computedTopTypeNull && !this._computedBottomTypeNull) {
    return true;
  };

  if (!this._computedHeightTypeNull && !this._computedHeightTypeAuto) {
    return true;
  };

  if (!this._computedMinHeightTypeNull && !this._computedMinHeightTypeAuto) {
    return true;
  };

  if (!this._computedMaxHeightTypeNull && !this._computedMaxHeightTypeAuto) {
    return true;
  };

  if (this._borderElement) {
    return true;
  };

  return false;
};
