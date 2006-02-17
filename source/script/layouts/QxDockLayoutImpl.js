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

************************************************************************ */

function QxDockLayoutImpl(vWidget) {
  QxLayoutImpl.call(this, vWidget);
};

QxDockLayoutImpl.extend(QxLayoutImpl, "QxDockLayoutImpl");


/*!
  Global Structure:
  [01] COMPUTE BOX DIMENSIONS FOR AN INDIVIDUAL CHILD
  [02] COMPUTE NEEDED DIMENSIONS FOR AN INDIVIDUAL CHILD
  [03] COMPUTE NEEDED DIMENSIONS FOR ALL CHILDREN
  [04] UPDATE LAYOUT WHEN A CHILD CHANGES ITS OUTER DIMENSIONS
  [05] UPDATE CHILD ON INNER DIMENSION CHANGES OF LAYOUT
  [06] UPDATE LAYOUT ON JOB QUEUE FLUSH
  [07] UPDATE CHILDREN ON JOB QUEUE FLUSH
  [08] CHILDREN ADD/REMOVE/MOVE HANDLING
  [09] FLUSH LAYOUT QUEUES OF CHILDREN
  [10] LAYOUT CHILD
  [11] DISPOSER


  Inherits from QxLayoutImpl:
  [02] COMPUTE NEEDED DIMENSIONS FOR AN INDIVIDUAL CHILD
  [03] COMPUTE NEEDED DIMENSIONS FOR ALL CHILDREN
  [04] UPDATE LAYOUT WHEN A CHILD CHANGES ITS OUTER DIMENSIONS
  [08] CHILDREN ADD/REMOVE/MOVE HANDLING
  [11] DISPOSER
*/




/*
---------------------------------------------------------------------------
  [00] ADDITIONAL GLOBAL DATA AND METHODS
---------------------------------------------------------------------------
*/

QxDockLayoutImpl.METHOD_LOCATION = "layoutChild_location_";

QxDockLayoutImpl._childRanking = {
  vertical : function(c) { return c.getVerticalAlign() ? 1e6 : c.getHorizontalAlign() ? 2e6 : 3e6; },
  horizontal : function(c) { return c.getHorizontalAlign() ? 1e6 : c.getVerticalAlign() ? 2e6 : 3e6; },
  ordered : function(c) { return c.getHorizontalAlign() || c.getVerticalAlign() ? 1e6 : 2e6; }
};

QxDockLayoutImpl._childCheck =
{
  common : function(vChild) {
    if (!(vChild._computedLeftTypeNull && vChild._computedRightTypeNull && vChild._computedTopTypeNull && vChild._computedBottomTypeNull)) {
      throw new Error("QxDockLayoutImpl: It is not allowed to define any location values for children: " + vChild + "!");
    };
  },

  horizontal : function(vChild)
  {
    if (!(vChild._computedMinHeightTypeNull && vChild._computedHeightTypeNull && vChild._computedMaxHeightTypeNull)) {
      throw new Error("QxDockLayoutImpl: It is not allowed to define any vertical dimension for 'horizontal' placed children: " + vChild + "!");
    };
  },

  vertical : function(vChild)
  {
    if (!(vChild._computedMinWidthTypeNull && vChild._computedWidthTypeNull && vChild._computedMaxWidthTypeNull)) {
      throw new Error("QxDockLayoutImpl: It is not allowed to define any horizontal dimension for 'vertical' placed children: " + vChild + "!");
    };
  },

  "default" : function(vChild)
  {
    QxDockLayoutImpl._childCheck.horizontal(vChild);
    QxDockLayoutImpl._childCheck.vertical(vChild);
  }
};







/*
---------------------------------------------------------------------------
  [01] COMPUTE BOX DIMENSIONS FOR AN INDIVIDUAL CHILD
---------------------------------------------------------------------------
*/

/*!
  Compute and return the box width of the given child
*/
proto.computeChildBoxWidth = function(vChild)
{
  if (this.getChildAlignMode(vChild) == QxConst.ORIENTATION_HORIZONTAL) {
    return vChild.getWidthValue() || vChild._computeBoxWidthFallback();
  };

  return this.getWidget().getInnerWidth() - this._lastLeft - this._lastRight;
};

/*!
  Compute and return the box height of the given child
*/
proto.computeChildBoxHeight = function(vChild)
{
  if (this.getChildAlignMode(vChild) == QxConst.ORIENTATION_VERTICAL) {
    return vChild.getHeightValue() || vChild._computeBoxHeightFallback();
  };

  return this.getWidget().getInnerHeight() - this._lastTop - this._lastBottom;
};







/*
---------------------------------------------------------------------------
  [05] UPDATE CHILD ON INNER DIMENSION CHANGES OF LAYOUT
---------------------------------------------------------------------------
*/

/*!
  Actions that should be done if the inner width of the widget was changed.
  Normally this includes update to percent values and ranges.
*/
proto.updateChildOnInnerWidthChange = function(vChild)
{
  vChild._recomputePercentX();
  vChild.addToLayoutChanges(QxConst.JOB_LOCATION);

  // inform the caller if there were any notable changes occured
  return true;
};

/*!
  Actions that should be done if the inner height of the widget was changed.
  Normally this includes update to percent values and ranges.
*/
proto.updateChildOnInnerHeightChange = function(vChild)
{
  vChild._recomputePercentY();
  vChild.addToLayoutChanges(QxConst.JOB_LOCATION);

  // inform the caller if there were any notable changes occured
  return true;
};





/*
---------------------------------------------------------------------------
  [06] UPDATE LAYOUT ON JOB QUEUE FLUSH
---------------------------------------------------------------------------
*/

/*!
  Invalidate and recompute things because of job in queue (before the rest of job handling will be executed).
*/
proto.updateSelfOnJobQueueFlush = QxUtil.returnFalse;







/*
---------------------------------------------------------------------------
  [07] UPDATE CHILDREN ON JOB QUEUE FLUSH
---------------------------------------------------------------------------
*/

/*!
  Updates children on special jobs
*/
proto.updateChildrenOnJobQueueFlush = function(vQueue)
{
  if (vQueue.mode || vQueue.addChild || vQueue.removeChild) {
    this.getWidget()._addChildrenToLayoutQueue(QxConst.JOB_LOCATION);
  };
};









/*
---------------------------------------------------------------------------
  [09] FLUSH LAYOUT QUEUES OF CHILDREN
---------------------------------------------------------------------------
*/

/*!
  This method have full control of the order in which the
  registered (or also non-registered) children should be
  layouted on the horizontal axis.
*/
proto.flushChildrenQueue = function(vChildrenQueue)
{
  var vWidget=this.getWidget(), vChildren=vWidget.getVisibleChildren(), vChildrenLength=vChildren.length, vMode=vWidget.getMode();

  // reset layout
  this._lastLeft = this._lastRight = this._lastTop = this._lastBottom = 0;

  // sorting children
  var vRankImpl = QxDockLayoutImpl._childRanking[vMode];
  var vOrderedChildren = vChildren.copy().sort(function(c1, c2) {
    return (vRankImpl(c1) + vChildren.indexOf(c1)) - (vRankImpl(c2) + vChildren.indexOf(c2));
  });

  // flushing children
  for (var i=0; i<vChildrenLength; i++) {
    vWidget._layoutChild(vOrderedChildren[i]);
  };
};

proto.getChildAlign = function(vChild) {
  return vChild.getVerticalAlign() || vChild.getHorizontalAlign() || QxConst.CORE_DEFAULT;
};

proto.getChildAlignMode = function(vChild) {
  return vChild.getVerticalAlign() ? QxConst.ORIENTATION_VERTICAL : vChild.getHorizontalAlign() ? QxConst.ORIENTATION_HORIZONTAL : QxConst.CORE_DEFAULT;
};







/*
---------------------------------------------------------------------------
  [10] LAYOUT CHILD
---------------------------------------------------------------------------
*/

/*!
  This is called from QxWidget and  it's task is to apply the layout
  (excluding border and padding) to the child.
*/
proto.layoutChild = function(vChild, vJobs)
{
  QxDockLayoutImpl._childCheck.common(vChild);
  QxDockLayoutImpl._childCheck[this.getChildAlignMode(vChild)](vChild);

  this.layoutChild_sizeX_essentialWrapper(vChild, vJobs);
  this.layoutChild_sizeY_essentialWrapper(vChild, vJobs);

  this.layoutChild_sizeLimitX(vChild, vJobs);
  this.layoutChild_sizeLimitY(vChild, vJobs);

  this[QxDockLayoutImpl.METHOD_LOCATION + this.getChildAlign(vChild)](vChild, vJobs);
};

proto.layoutChild_location_top = function(vChild, vJobs)
{
  vChild._applyRuntimeTop(this._lastTop);
  vChild._applyRuntimeLeft(this._lastLeft);

  this.layoutChild_location_horizontal(vChild);

  this._lastTop += vChild.getBoxHeight();
};

proto.layoutChild_location_left = function(vChild, vJobs)
{
  vChild._applyRuntimeLeft(this._lastLeft);
  vChild._applyRuntimeTop(this._lastTop);

  this.layoutChild_location_vertical(vChild);

  this._lastLeft += vChild.getBoxWidth();
};







if (QxClient.isMshtml() || QxClient.isOpera())
{
  proto._applyComputedWidth = function(vChild)
  {
    // direct recompute (need to be done, while layouting as the
    // _last* variable changes during layout process)
    vChild._recomputeBoxWidth();

    // wrong: simple invalidates are enough here
    // correct: needs recompute to inform children (to update centering for example)
    vChild._recomputeOuterWidth();
    vChild._recomputeInnerWidth();

    // apply calculated width
    vChild._applyRuntimeWidth(vChild.getBoxWidth());
  };

  proto._applyComputedHeight = function(vChild)
  {
    // direct recompute (need to be done, while layouting as the
    // _last* variable changes during layout process)
    vChild._recomputeBoxHeight();

    // wrong: simple invalidates are enough here
    // correct: needs recompute to inform children (to update centering for example)
    vChild._recomputeOuterHeight();
    vChild._recomputeInnerHeight();

    // apply calculated height
    vChild._applyRuntimeHeight(vChild.getBoxHeight());
  };

  proto.layoutChild_sizeX = function(vChild, vJobs)
  {
    // We need to respect all dimension properties on the horizontal axis in internet explorer to set the 'width' style
    if (vJobs.initial || vJobs.width || vJobs.minWidth || vJobs.maxWidth) {
      vChild._computedWidthTypeNull && vChild._computedMinWidthTypeNull && vChild._computedMaxWidthTypeNull ? vChild._resetRuntimeWidth() : vChild._applyRuntimeWidth(vChild.getBoxWidth());
    };
  };

  proto.layoutChild_sizeY = function(vChild, vJobs)
  {
    // We need to respect all dimension properties on the vertical axis in internet explorer to set the 'height' style
    if (vJobs.initial || vJobs.height || vJobs.minHeight || vJobs.maxHeight) {
      vChild._computedHeightTypeNull && vChild._computedMinHeightTypeNull && vChild._computedMaxHeightTypeNull ? vChild._resetRuntimeHeight() : vChild._applyRuntimeHeight(vChild.getBoxHeight());
    };
  };

  proto.layoutChild_location_horizontal = function(vChild) {
    this._applyComputedWidth(vChild);
  };

  proto.layoutChild_location_vertical = function(vChild) {
    this._applyComputedHeight(vChild);
  };

  proto.layoutChild_location_right = function(vChild, vJobs)
  {
    vChild._applyRuntimeLeft(this.getWidget().getInnerWidth() - this._lastRight - vChild.getBoxWidth());
    vChild._applyRuntimeTop(this._lastTop);

    this.layoutChild_location_vertical(vChild);

    this._lastRight += vChild.getBoxWidth();
  };

  proto.layoutChild_location_bottom = function(vChild, vJobs)
  {
    vChild._applyRuntimeTop(this.getWidget().getInnerHeight() - this._lastBottom - vChild.getBoxHeight());
    vChild._applyRuntimeLeft(this._lastLeft);

    this.layoutChild_location_horizontal(vChild);

    this._lastBottom += vChild.getBoxHeight();
  };

  proto.layoutChild_location_default = function(vChild, vJobs)
  {
    var vWidget = this.getWidget();

    vChild._resetRuntimeRight();
    vChild._resetRuntimeBottom();

    vChild._applyRuntimeTop(this._lastTop);
    vChild._applyRuntimeLeft(this._lastLeft);

    this._applyComputedWidth(vChild);
    this._applyComputedHeight(vChild);
  };
}
else
{
  proto._applyComputedWidth = function(vChild)
  {
    // direct recompute (need to be done, while layouting as the
    // _last* variable changes during layout process)
    vChild._recomputeBoxWidth();

    // wrong: simple invalidates are enough here
    // correct: needs recompute to inform children (to update centering for example)
    vChild._recomputeOuterWidth();
    vChild._recomputeInnerWidth();
  };

  proto._applyComputedHeight = function(vChild)
  {
    // direct recompute (need to be done, while layouting as the
    // _last* variable changes during layout process)
    vChild._recomputeBoxHeight();

    // wrong: simple invalidates are enough here
    // correct: needs recompute to inform children (to update centering for example)
    vChild._recomputeOuterHeight();
    vChild._recomputeInnerHeight();
  };

  proto.layoutChild_sizeX = function(vChild, vJobs)
  {
    if (vJobs.initial || vJobs.width) {
      vChild._computedWidthTypeNull ? vChild._resetRuntimeWidth() : vChild._applyRuntimeWidth(vChild.getWidthValue());
    };
  };

  proto.layoutChild_sizeY = function(vChild, vJobs)
  {
    if (vJobs.initial || vJobs.height) {
      vChild._computedHeightTypeNull ? vChild._resetRuntimeHeight() : vChild._applyRuntimeHeight(vChild.getHeightValue());
    };
  };

  proto.layoutChild_location_horizontal = function(vChild)
  {
    this._applyComputedWidth(vChild);
    vChild._applyRuntimeRight(this._lastRight);
  };

  proto.layoutChild_location_vertical = function(vChild)
  {
    this._applyComputedHeight(vChild);
    vChild._applyRuntimeBottom(this._lastBottom);
  };

  proto.layoutChild_location_right = function(vChild, vJobs)
  {
    vChild._applyRuntimeRight(this._lastRight);
    vChild._applyRuntimeTop(this._lastTop);

    this.layoutChild_location_vertical(vChild);

    this._lastRight += vChild.getBoxWidth();
  };

  proto.layoutChild_location_bottom = function(vChild, vJobs)
  {
    vChild._applyRuntimeBottom(this._lastBottom);
    vChild._applyRuntimeLeft(this._lastLeft);

    this.layoutChild_location_horizontal(vChild);

    this._lastBottom += vChild.getBoxHeight();
  };

  proto.layoutChild_location_default = function(vChild, vJobs)
  {
    vChild._resetRuntimeWidth();
    vChild._resetRuntimeHeight();

    vChild._applyRuntimeTop(this._lastTop);
    vChild._applyRuntimeRight(this._lastRight);
    vChild._applyRuntimeBottom(this._lastBottom);
    vChild._applyRuntimeLeft(this._lastLeft);

    this._applyComputedWidth(vChild);
    this._applyComputedHeight(vChild);
  };
};
