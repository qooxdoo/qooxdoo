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
  
}


qx.Proto._onsplittermouseup = function(e) {
  
  // disable capturing
  this._splitter.setCapture(false);
  
}


qx.Proto._onsplittermousemove = function(e) {
  
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
