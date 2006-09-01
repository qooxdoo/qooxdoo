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


/**
 * Creates a new instance of a SplitPane. It allows the user to dynamically resize
 * the areas dropping the border between.
 * <br /><br />
 * new qx.ui.splitpane.SplitPane(orientation)<br />
 * new qx.ui.splitpane.SplitPane(orientation, continuousLayout)<br />
 * new qx.ui.splitpane.SplitPane(orientation, continuousLayout, leftComponent, rightComponent)
 *
 * @param orientation {string} The orientation of the splitpane control. Allowed values are qx.constant.Layout.ORIENTATION_HORIZONTAL (default) and qx.constant.Layout.ORIENTATION_VERTICAL. This is the same type as used in {@link qx.ui.layout.BoxLayout#orientation}.
 * @param continuousLayout {boolean} If true, the content will updated immediately.
 * @param leftComponent {qx.ui.core.Parent} The layout of the left (top) pane.
 * @param rightComponent {qx.ui.core.Parent} The layout of the right (bottom) pane.
 *
 */
qx.OO.defineClass("qx.ui.splitpane.SplitPane", qx.ui.layout.BoxLayout,
function(orientation, continuousLayout, leftComponent, rightComponent) {
  
  qx.ui.layout.BoxLayout.call(this, orientation);
  
  if(qx.util.Validation.isValidBoolean(continuousLayout)) {
    this.setContinuousLayout(continuousLayout);
  }
  
  this.setLeftComponent(qx.util.Validation.isValidObject(leftComponent) ? leftComponent : new qx.ui.layout.CanvasLayout);
  this.setRightComponent(qx.util.Validation.isValidObject(rightComponent) ? rightComponent : new qx.ui.layout.CanvasLayout);
  
  var splitter = this._splitter = new qx.ui.splitpane.Splitter(this.getOrientation());
  
  splitter.addEventListener(qx.constant.Event.MOUSEDOWN, this._onsplittermousedown, this);
  splitter.addEventListener(qx.constant.Event.MOUSEUP, this._onsplittermouseup, this);
  splitter.addEventListener(qx.constant.Event.MOUSEMOVE, this._onsplittermousemove, this);
  
  this.addAtBegin(this.getLeftComponent());
  this.add(splitter);
  this.addAtEnd(this.getRightComponent());
  
});










/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
 */

/**
 * The layout method for the splitpane. If true, the content will updated immediatly.
 */
qx.OO.addProperty({ name : 'continuousLayout', type : qx.constant.Type.BOOLEAN, allowNull : false, defaultValue : false, getAlias : 'isContinuousLayout'});


/**
 * The layout of the left (top) component.
 */
qx.OO.addProperty({ name : 'leftComponent', type : qx.constant.Type.OBJECT, allowNull : false, instance : 'qx.ui.core.Widget', getAlias : 'getTopComponent', setAlias : 'setTopComponent' });

/**
 * The layout of the right (bottom) component.
 */
qx.OO.addProperty({ name : 'rightComponent', type : qx.constant.Type.OBJECT, allowNull : false, instance : 'qx.ui.core.Widget', getAlias : 'getBottomComponent', setAlias : 'setBottomComponent' });

/**
 * If true, the an additional control is shown on top of the splitter. This control gives you the abability to move the splitter completely to one ore another site.
 */
qx.OO.addProperty({ name : 'oneTouchExpandable', type : qx.constant.Type.BOOLEAN, allowNull : false, defaultValue : false, getAlias : 'isOneTouchExpandable'});










/*
---------------------------------------------------------------------------
  PUBLIC METHODS
---------------------------------------------------------------------------
 */










/*
---------------------------------------------------------------------------
  RIVAT METHODS
---------------------------------------------------------------------------
 */










/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
 */

/**
 * Initializes drag session in case of a mousedown event on the splitter.
 *
 * @param e {qx.event.MouseEvent} The event itself.
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
    
    width : r - l,
    height: b - t,
    
    parentAvailableAreaLeft : l + 1,
    parentAvailableAreaTop : t + 1,
    parentAvailableAreaRight : r - 1,
    parentAvailableAreaBottom : b - 1
  };
  
}



/**
 * Ends the drag session and computes the new dimensions of panes in case of a mouseup event on the splitter.
 *
 * @param e {qx.event.MouseEvent} The event itself.
 */
qx.Proto._onsplittermouseup = function(e) {
  
  var splitter = this._splitter;
  var s = this._dragSession;
  
  if(!s) {
    return;
  }

  this._splitter.setState("dragging", false);

  // disable capturing
  splitter.setCapture(false);
  
  // resize panes
  if(!this.isContinuousLayout()) {
    switch(this.getOrientation()) {
      case qx.constant.Layout.ORIENTATION_HORIZONTAL :
        var sWidth = s.width - s.lastX;
        var fWidth = s.width - sWidth;
        this.getLeftComponent().setWidth(fWidth.toString() + '*');
        this.getLeftComponent().setHeight(null);
        this.getRightComponent().setWidth(sWidth.toString() + '*');
        this.getRightComponent().setHeight(null);
        break;
        
      case qx.constant.Layout.ORIENTATION_VERTICAL :
        var sHeight = s.height - s.lastY;
        var fHeight = s.height - sHeight;
        this.getLeftComponent().setWidth(null);
        this.getLeftComponent().setHeight(fHeight.toString() + '*');
        this.getRightComponent().setWidth(null);
        this.getRightComponent().setHeight(sHeight.toString() + '*');
        break;
    }
  }
  
  // cleanup session
  this._dragSession = null;
  
}



/**
 * Move the splitter in case of a mousemove event on the splitter.
 *
 * @param e {qx.event.MouseEvent} The event itself.
 */

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

  this._splitter.setState("dragging", true);

  // use the fast and direct dom methods to draw the splitter
  switch(this.getOrientation()) {
    case qx.constant.Layout.ORIENTATION_HORIZONTAL :
      o._applyRuntimeLeft(s.lastX = e.getPageX() - s.offsetX);
      break;
    case qx.constant.Layout.ORIENTATION_VERTICAL :
      o._applyRuntimeTop(s.lastY = e.getPageY() - s.offsetY);
      break;
  }
  
  // resize the panes
  if(this.isContinuousLayout()) {
    switch(this.getOrientation()) {
      case qx.constant.Layout.ORIENTATION_HORIZONTAL :
        var sWidth = s.width - s.lastX;
        var fWidth = s.width - sWidth;
        this.getLeftComponent().setWidth(fWidth.toString() + '*');
        this.getLeftComponent().setHeight(null);
        this.getRightComponent().setWidth(sWidth.toString() + '*');
        this.getRightComponent().setHeight(null);
        break;
        
      case qx.constant.Layout.ORIENTATION_VERTICAL :
        var sHeight = s.height - s.lastY;
        var fHeight = s.height - sHeight;
        this.getLeftComponent().setWidth(null);
        this.getLeftComponent().setHeight(fHeight.toString() + '*');
        this.getRightComponent().setWidth(null);
        this.getRightComponent().setHeight(sHeight.toString() + '*');
        break;
    }
  }
  
  e.preventDefault();
}










/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
 */

/**
 * Garbage collection
 */
qx.Proto.dispose = function() {
  if (this.getDisposed()) {
    return true;
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
