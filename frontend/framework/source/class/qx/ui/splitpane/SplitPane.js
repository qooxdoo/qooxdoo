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

qx.OO.defineClass("qx.ui.splitpane.SplitPane", qx.ui.layout.BoxLayout,
function(vOrientation) {
  
  qx.ui.layout.BoxLayout.call(this, vOrientation);
  
  var fPane = this._firstPane = new qx.ui.splitpane.FirstPane;
  
  var sPane = this._secondPane = new qx.ui.splitpane.SecondPane;
  
  var splitter = this._splitter = new qx.ui.splitpane.Splitter(this.getOrientation());
  
  splitter.addEventListener(qx.constant.Event.MOUSEDOWN, this._onsplittermousedown, this);
  splitter.addEventListener(qx.constant.Event.MOUSEUP, this._onsplittermouseup, this);
  splitter.addEventListener(qx.constant.Event.MOUSEMOVE, this._onsplittermousemove, this);
  
  this.addAtBegin(fPane);
  this.add(splitter);
  this.addAtEnd(sPane);
  
});











/*
---------------------------------------------------------------------------
  PUBLIC METHODS
---------------------------------------------------------------------------
 */

qx.Proto.getLeftPane = function() {
  return this._getFirstPane();
}

qx.Proto.getTopPane = function() {
  return this._getFirstPane();
}

qx.Proto.getRightPane = function() {
  return this._getSecondPane();
}

qx.Proto.getBottomPane = function() {
  return this._getSecondPane();
}





/*
---------------------------------------------------------------------------
  RIVAT METHODS
---------------------------------------------------------------------------
 */

qx.Proto._getFirstPane = function() {
  return this._firstPane;
}

qx.Proto._getSecondPane = function() {
  return this._secondPane;
}







/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
 */

qx.Proto._onsplittermousedown = function(e) {
  
  // enable capturing
  this._splitter.setCapture(true);
  
  // measuring and caching of values for drag session
  
  var el = this._splitter.getElement();
  var pl = this.getElement();
  
  var l = qx.dom.DomLocation.getPageAreaLeft(pl);
  var t = qx.dom.DomLocation.getPageAreaTop(pl);
  var r = qx.dom.DomLocation.getPageAreaRight(pl);
  var b = qx.dom.DomLocation.getPageAreaBottom(pl);

  this._dragSession = {
    offsetX : e.getPageX() - qx.dom.DomLocation.getPageBoxLeft(el) + l,
    offsetY : e.getPageY() - qx.dom.DomLocation.getPageBoxTop(el) + t,

    parentAvailableAreaLeft : l + 1,
    parentAvailableAreaTop : t + 1,
    parentAvailableAreaRight : r - 1,
    parentAvailableAreaBottom : b - 1
  };
  
}


qx.Proto._onsplittermouseup = function(e) {
  
  var splitter = this._splitter;
  var s = this._dragSession;
  
  if(!s) {
    return;
  }
  
  // disable capturing
  splitter.setCapture(false);
  
  // cleanup session
  this._dragSession = null;
  
}


qx.Proto._onsplittermousemove = function(e) {
  
  var s = this._dragSession;
  var o = this._splitter;
  
  // pre check for active session and capturing
  if (!s || !this._splitter.getCapture()) {
    return;
  }

  // pre check if we go out of the available area
  if (!qx.lang.Number.isBetweenRange(e.getPageX(), s.parentAvailableAreaLeft, s.parentAvailableAreaRight) || !qx.lang.Number.isBetweenRange(e.getPageY(), s.parentAvailableAreaTop, s.parentAvailableAreaBottom)) {
    return;
  }
  
  // use the fast and direct dom methods
  switch(this.getOrientation()) {
    case qx.constant.Layout.ORIENTATION_HORIZONTAL :
      o._applyRuntimeLeft(s.lastX = e.getPageX() - s.offsetX);
      break;
    case qx.constant.Layout.ORIENTATION_VERTICAL :
      o._applyRuntimeTop(s.lastY = e.getPageY() - s.offsetY);
      break;
  }
  
  e.preventDefault();
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
  
  if (this._firstPane) {
    this._firstPane.dispose();
    this._firstPane = null;
  }
  
  if (this._secondPane) {
    this._secondPane.dispose();
    this._secondPane = null;
  }
  
  if (this._splitter) {
    this._splitter.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onsplittermousedown, this);
    this._splitter.removeEventListener(qx.constant.Event.MOUSEUP, this._onsplittermouseup, this);
    this._splitter.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onsplittermousemove, this);
    this._splitter.dispose();
    this._splitter = null;
  }
  
  return qx.ui.layout.BoxLayout.prototype.dispose.call(this);
}
