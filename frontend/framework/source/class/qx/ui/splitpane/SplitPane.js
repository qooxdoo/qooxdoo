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
qx.OO.defineClass("qx.ui.splitpane.SplitPane", qx.ui.layout.CanvasLayout,
function(orientation, continuousLayout, leftComponent, rightComponent) {
  
  qx.ui.layout.CanvasLayout.call(this);
  
  // the boxlayout
  
  
  /*
   
   the splitpane itself is a boxlayout resides on top of a canvas for easier computing of positional values
   
    ---------------------------------------------------------------------------------------
   |  canvas                                                                               |
   |  -----------------------------------------------------------------------------------  |
   | | box                                                                               | |
   | | ---------------------------  ---  ----------------------------------------------- | |
   | | |                         |  | |  |                                             | | |
   | | | leftComponent           |  |s|  | rightComponent                              | | |
   | | |                         |  |p|  |                                             | | |
   | | |                         |  |l|  |                                             | | |
   | | |                         |  |i|  |                                             | | |
   | | |                         |  |t|  |                                             | | |
   | | |                         |  |t|  |                                             | | |
   | | |                         |  |e|  |                                             | | |
   | | |                         |  |r|  |                                             | | |
   | | |                         |  | |  |                                             | | |
   | | ---------------------------  ---  ----------------------------------------------- | |
   |  -----------------------------------------------------------------------------------  |
   |                                                                                       |
    ---------------------------------------------------------------------------------------
   
   in front of the splitpane is a glasspane which contains a dragable copy of the splitter. The glasspane and the copy of the splitter
   only appears if a mousedown event is captured on the original splitter and will disappear on mouseup. This helps us to use every
   widget inside the components without paying attention on the special mouseevent handling of the used widget. In particular the iframe
   interupts the event queue, so the splitter stands still in case of moving about the iframe.
   
    ---------------------------------------------------------------------------------------
   |  canvas (glasspane)                                                                   |
   |                               ---                                                     |
   |                               | |                                                     |
   |                               |s|                                                     |
   |                               |p|                                                     |
   |                               |l|                                                     |
   |                               |i|                                                     |
   |                               |t|                                                     |
   |                               |t|                                                     |
   |                               |e|                                                     |
   |                               |r|                                                     |
   |                               | |                                                     |
   |                               ---                                                     |
   |                                                                                       |
    ---------------------------------------------------------------------------------------
   
   */
  
  
  var box = this._box = new qx.ui.layout.BoxLayout(orientation);
  box.setDimension('100%', '100%');
  
  var glass = this._glass = new qx.ui.layout.CanvasLayout();
  glass.setDimension('100%', '100%');
  glass.setBackgroundColor('gray');
  glass.setOpacity(0.1);
  glass.setZIndex(1e7);
  glass.setVisibility(false);
  
  var slider = this._slider = new qx.ui.splitpane.Splitter(this._box.getOrientation());
  slider.setAppearance('splitpane-slider');
  slider.setVisibility(false);
  
  if(qx.util.Validation.isValidBoolean(continuousLayout)) {
    this.setContinuousLayout(continuousLayout);
  }
  
  this.setLeftComponent(qx.util.Validation.isValidObject(leftComponent) ? leftComponent : new qx.ui.layout.CanvasLayout);
  this.setRightComponent(qx.util.Validation.isValidObject(rightComponent) ? rightComponent : new qx.ui.layout.CanvasLayout);
  
  var splitter = this._splitter = new qx.ui.splitpane.Splitter(this._box.getOrientation());
  splitter.setAppearance('splitpane-splitter');
  
  splitter.addEventListener(qx.constant.Event.MOUSEDOWN, this._onsplittermousedown, this);
  splitter.addEventListener(qx.constant.Event.MOUSEUP, this._onsplittermouseup, this);
  splitter.addEventListener(qx.constant.Event.MOUSEMOVE, this._onsplittermousemove, this);
  
  box.addAtBegin(this.getLeftComponent());
  box.add(splitter);
  box.addAtEnd(this.getRightComponent());
  
  this.add(box, glass, slider);
  
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
  PRIVAT METHODS
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
  
  if (!e.isLeftButtonPressed()) {
    return;
  }
  
  var glasspane = this._glass;
  var slider = this._slider;
  var splitter = this._splitter;
  
  // activate global cursor
  this.getTopLevelWidget().setGlobalCursor(slider.getCursor());
  
  // enable capturing
  splitter.setCapture(true);
  
  // measuring and caching of values for drag session
  var el = splitter.getElement();
  var pl = this.getElement();
  
  var l = qx.dom.DomLocation.getPageAreaLeft(pl);
  var t = qx.dom.DomLocation.getPageAreaTop(pl);
  var r = qx.dom.DomLocation.getPageAreaRight(pl);
  var b = qx.dom.DomLocation.getPageAreaBottom(pl);
  
  if(!this.isContinuousLayout()) {
    // initialize the glasspane and the slider
    slider._applyRuntimeLeft(qx.dom.DomLocation.getPageBoxLeft(el) - l);
    slider._applyRuntimeTop(qx.dom.DomLocation.getPageBoxTop(el) - t);
    slider._applyRuntimeWidth(qx.dom.DomDimension.getBoxWidth(el));
    slider._applyRuntimeHeight(qx.dom.DomDimension.getBoxHeight(el));
    
    glasspane.setVisibility(true);
    slider.setVisibility(true);
  }
  
  // initialize the drag session
  this._dragSession = {
    offsetX : e.getPageX() - qx.dom.DomLocation.getPageBoxLeft(el) + l,
    offsetY : e.getPageY() - qx.dom.DomLocation.getPageBoxTop(el) + t,
    
    width : r - l,
    height: b - t,
    
    parentAvailableAreaLeft : l + (this.getLeftComponent().getMinWidth() ? this.getLeftComponent().getMinWidth() : 0),
    parentAvailableAreaTop : t + (this.getTopComponent().getMinHeight() ? this.getTopComponent().getMinHeight() : 0),
    parentAvailableAreaRight : r - (this.getRightComponent().getMinWidth() ? this.getRightComponent().getMinWidth() : 0),
    parentAvailableAreaBottom : b - (this.getBottomComponent().getMinHeight() ? this.getBottomComponent().getMinHeight() : 0)
  };
  
}



/**
 * Ends the drag session and computes the new dimensions of panes in case of a mouseup event on the splitter.
 *
 * @param e {qx.event.MouseEvent} The event itself.
 */
qx.Proto._onsplittermouseup = function(e) {
  
  var glasspane = this._glass;
  var slider = this._slider;
  var splitter = this._splitter;
  var s = this._dragSession;
  
  if(!s || !(s.lastX || s.lastY)) {
    return;
  }
  
  slider.setState("dragging", false);
  
  glasspane.setVisibility(false);
  slider.setVisibility(false);
  
  // disable capturing
  splitter.setCapture(false);
  
  // reset the global cursor
  this.getTopLevelWidget().setGlobalCursor(null);
  
  // resize panes
  if(!this.isContinuousLayout()) {
    switch(this._box.getOrientation()) {
      case qx.constant.Layout.ORIENTATION_HORIZONTAL :
        var sWidth = s.width - s.lastX;
        var fWidth = s.width - sWidth;
        this.getLeftComponent().setWidth(fWidth.toString() + '*');
        // this.getLeftComponent().setHeight(null);
        this.getRightComponent().setWidth(sWidth.toString() + '*');
        // this.getRightComponent().setHeight(null);
        break;
        
      case qx.constant.Layout.ORIENTATION_VERTICAL :
        var sHeight = s.height - s.lastY;
        var fHeight = s.height - sHeight;
        // this.getLeftComponent().setWidth(null);
        this.getLeftComponent().setHeight(fHeight.toString() + '*');
        // this.getRightComponent().setWidth(null);
        this.getRightComponent().setHeight(sHeight.toString() + '*');
        break;
    }
  }
  
  // cleanup dragsession
  this._dragSession = null;
  
}



/**
 * Move the splitter in case of a mousemove event on the splitter.
 *
 * @param e {qx.event.MouseEvent} The event itself.
 */

qx.Proto._onsplittermousemove = function(e) {
  
  var box = this._box;
  var slider = this._slider;
  var splitter = this._splitter;
  var s = this._dragSession;
  
  // pre check for active session and capturing
  if (!s || !splitter.getCapture()) {
    return;
  }
  
  // pre check if we go out of the available area
  if (!qx.lang.Number.isBetweenRange(e.getPageX(), s.parentAvailableAreaLeft, s.parentAvailableAreaRight) || !qx.lang.Number.isBetweenRange(e.getPageY(), s.parentAvailableAreaTop, s.parentAvailableAreaBottom)) {
    return;
  }
  
  // resize the panes
  if(this.isContinuousLayout()) {
    // use the fast and direct dom methods to draw the splitter
    switch(box.getOrientation()) {
      case qx.constant.Layout.ORIENTATION_HORIZONTAL :
        splitter._applyRuntimeLeft(s.lastX = e.getPageX() - s.offsetX);
        break;
      case qx.constant.Layout.ORIENTATION_VERTICAL :
        splitter._applyRuntimeTop(s.lastY = e.getPageY() - s.offsetY);
        break;
    }
    switch(box.getOrientation()) {
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
  } else {
    slider.setState("dragging", true);
    
    // use the fast and direct dom methods to draw the splitter
    switch(box.getOrientation()) {
      case qx.constant.Layout.ORIENTATION_HORIZONTAL :
        slider._applyRuntimeLeft(s.lastX = e.getPageX() - s.offsetX);
        break;
      case qx.constant.Layout.ORIENTATION_VERTICAL :
        slider._applyRuntimeTop(s.lastY = e.getPageY() - s.offsetY);
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

  if (this._slider) {
    this._slider.dispose();
    this._slider = null;
  }

  
  return qx.ui.layout.BoxLayout.prototype.dispose.call(this);
}
