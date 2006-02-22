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
#post(QxFlowLayoutImpl)

************************************************************************ */

function QxFlowLayout() {
  QxParent.call(this);
};

QxFlowLayout.extend(QxParent, "QxFlowLayout");

/*!
  The spacing between childrens. Could be any positive integer value.
*/
QxFlowLayout.addProperty({ name : "horizontalSpacing", type : QxConst.TYPEOF_NUMBER, defaultValue : 0, addToQueueRuntime : true, impl : "layout" });

/*!
  The spacing between childrens. Could be any positive integer value.
*/
QxFlowLayout.addProperty({ name : "verticalSpacing", type : QxConst.TYPEOF_NUMBER, defaultValue : 0, addToQueueRuntime : true, impl : "layout" });

/*!
  The horizontal align of the children. Allowed values are: "left" and "right"
*/
QxFlowLayout.addProperty({ name : "horizontalChildrenAlign", type : QxConst.TYPEOF_STRING, defaultValue : "left", possibleValues : [ "left", "right" ], addToQueueRuntime : true });

/*!
  The vertical align of the children. Allowed values are: "top" and "bottom"
*/
QxFlowLayout.addProperty({ name : "verticalChildrenAlign", type : QxConst.TYPEOF_STRING, defaultValue : "top", possibleValues : [ "top", "bottom" ], addToQueueRuntime : true });

/*!
  Should the children be layouted in reverse order?
*/
QxFlowLayout.addProperty({ name : "reverseChildrenOrder", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, addToQueueRuntime : true, impl : "layout" });






/*
---------------------------------------------------------------------------
  INIT LAYOUT IMPL
---------------------------------------------------------------------------
*/

/*!
  This creates an new instance of the layout impl this widget uses
*/
proto._createLayoutImpl = function() {
  return new QxFlowLayoutImpl(this);
};





/*
---------------------------------------------------------------------------
  DIMENSION CACHE
---------------------------------------------------------------------------
*/

proto._changeInnerWidth = function(vNew, vOld)
{
  QxParent.prototype._changeInnerWidth.call(this, vNew, vOld);

  // allow 'auto' values for height to update when the inner width changes
  this._invalidatePreferredInnerHeight();
};




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyLayout = function(propValue, propOldValue, propData)
{
  // invalidate inner preferred dimensions
  this._invalidatePreferredInnerDimensions();

  return true;
};
