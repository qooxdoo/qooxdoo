/* ************************************************************************
 
   qooxdoo - the new era of web development
 
   http://qooxdoo.org
 
   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org
 
   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html
 
   Authors:
 * Volker Pauli
 
 ************************************************************************ */

/* ************************************************************************
 
#module(ui_splitpane)
 
 ************************************************************************ */

qx.OO.defineClass("qx.ui.splitpane.Splitter", qx.ui.layout.CanvasLayout,
function(vOrientation) {
  
  qx.ui.layout.CanvasLayout.call(this);

  // set defaults
  this.setWidth(this.getSize());
  this.setCursor('col-resize');

  // apply orientation
  if (qx.util.Validation.isValidString(vOrientation)) {
    this.setOrientation(vOrientation);
  }
  
});










/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
 */

/**
 * The size of the splitter control in px
 */
qx.OO.addProperty({ name : "size", type : qx.constant.Type.NUMBER, allowNull : false, defaultValue : 2});


/**
 * The orientation of the splitter control. Allowed values are qx.constant.Layout.ORIENTATION_HORIZONTAL (default) and qx.constant.Layout.ORIENTATION_VERTICAL.
 */
qx.OO.addProperty({ name : "orientation", type : qx.constant.Type.STRING, possibleValues : [ qx.constant.Layout.ORIENTATION_HORIZONTAL, qx.constant.Layout.ORIENTATION_VERTICAL ], defaultValue : qx.constant.Layout.ORIENTATION_HORIZONTAL });










/*
---------------------------------------------------------------------------
  HELPERS
---------------------------------------------------------------------------
 */

qx.Proto._layoutHorizontal = false;
qx.Proto._layoutVertical = false;


/**
 * Is true, if it is a horizontal splitter.
 *
 * @return {boolean}
 */
qx.Proto.isHorizontal = function() {
  return this._layoutHorizontal;
}

/**
 * Is true, if it is a vertical splitter.
 *
 * @return {boolean}
 */
qx.Proto.isVertical = function() {
  return this._layoutVertical;
}








/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
 */

qx.Proto._modifyOrientation = function(propValue, propOldValue, propData) {
  
  // update fast access variables
  this._layoutHorizontal = propValue == qx.constant.Layout.ORIENTATION_HORIZONTAL;
  this._layoutVertical = propValue == qx.constant.Layout.ORIENTATION_VERTICAL;
  
  // set cursor
  switch(propValue) {
    case qx.constant.Layout.ORIENTATION_HORIZONTAL :
      this.setWidth(this.getSize());
      this.setHeight(null);
      this.setCursor('col-resize');
      break;
      
    case qx.constant.Layout.ORIENTATION_VERTICAL :
      this.setWidth(null);
      this.setHeight(this.getSize());
      this.setCursor("row-resize");
      break;
  }
  
  return true;
}








/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
 */

qx.Proto.dispose = function() {
  if (this.getDisposed()) {
    return true;
  }
  
  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
}