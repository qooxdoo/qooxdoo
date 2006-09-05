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
 * new qx.ui.splitpane.SplitPane(orientation, firstProportion, secondProportion )<br />
 *
 * @param orientation {string} The orientation of the splitpane control. Allowed values are qx.constant.Layout.ORIENTATION_HORIZONTAL (default) and qx.constant.Layout.ORIENTATION_VERTICAL. This is the same type as used in {@link qx.ui.layout.BoxLayout#orientation}.
 * @param firstProportion {string} The proportion of the left (top) pane. Allowed values are any by {@see qx.ui.core.Widget} supported unit.
 * @param secondProportion {string} The proportion of the right (bottom) pane. Allowed values are any by {@see qx.ui.core.Widget} supported unit.
 *
 */
qx.OO.defineClass("qx.ui.splitpane.SplitPane", qx.ui.layout.CanvasLayout,
function(orientation, firstProportion, secondProportion) {
  
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
   | | | firstComponent          |  |s|  | secondComponent                             | | |
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
  glass.setAppearance('splitpane-glasspane');
  glass.setVisibility(false);
  
  var slider = this._slider = new qx.ui.splitpane.Splitter(this._box.getOrientation());
  slider.setVisibility(false);
  
  var splitter = this._splitter = new qx.ui.splitpane.Splitter(this._box.getOrientation());
  splitter.addEventListener(qx.constant.Event.MOUSEDOWN, this._onsplittermousedown, this);
  splitter.addEventListener(qx.constant.Event.MOUSEUP, this._onsplittermouseup, this);
  splitter.addEventListener(qx.constant.Event.MOUSEMOVE, this._onsplittermousemove, this);

  var firstComponent = this._firstComponent = new qx.ui.layout.CanvasLayout();
  var secondComponent = this._secondComponent = new qx.ui.layout.CanvasLayout();
  
  switch(box.getOrientation()) {
    case qx.constant.Layout.ORIENTATION_HORIZONTAL :
      firstComponent.setWidth(qx.util.Validation.isValidStringOrNumber(firstProportion) ? firstProportion : '1*');
      secondComponent.setWidth(qx.util.Validation.isValidStringOrNumber(secondProportion) ? secondProportion : '1*');
      break;
      
    case qx.constant.Layout.ORIENTATION_VERTICAL :
      firstComponent.setHeight(qx.util.Validation.isValidStringOrNumber(firstProportion) ? firstProportion : '1*');
      secondComponent.setHeight(qx.util.Validation.isValidStringOrNumber(secondProportion) ? secondProportion : '1*');
      break;
  }

  box.add(this._firstComponent, splitter, this._secondComponent);
  
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
 * Whether the splitter should stop at preferred box width, or not.
 */
qx.OO.addProperty({ name : 'fullyMinimizeable', type : qx.constant.Type.BOOLEAN, allowNull : false, defaultValue : false, getAlias : 'isFullyMinimizeable' });

/**
 * if the glasspane should be visible, set this to true.
 */
qx.OO.addProperty({ name : 'visibleGlassPane', type : qx.constant.Type.BOOLEAN, allowNull : false, defaultValue : false, getAlias : 'isVisibleGlassPane' });










/*
---------------------------------------------------------------------------
  PUBLIC METHODS
---------------------------------------------------------------------------
 */


/**
 * adds one or more widget(s) to the left pane
 *
 *@param widget {qx.ui.core.Parent}
 */
qx.Proto.addLeft = function() {
  var c = this.getFirstComponent();
  return c.add.apply(c, arguments);
}



/**
 * adds one or more widget(s) to the top pane
 *
 *@param widget {qx.ui.core.Parent}
 */
qx.Proto.addTop = function() {
  var c = this.getFirstComponent();
  return c.add.apply(c, arguments);
}



/**
 * adds one or more widget(s) to the right pane
 *
 *@param widget {qx.ui.core.Parent}
 */
qx.Proto.addRight = function() {
  var c = this.getSecondComponent();
  return c.add.apply(c, arguments);
}



/**
 * adds one or more widget(s) to the bottom pane
 *
 *@param widget {qx.ui.core.Parent}
 */
qx.Proto.addBottom = function() {
  var c = this.getSecondComponent();
  return c.add.apply(c, arguments);
}



/**
 * Returns the left component (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getLeftComponent = function() {
  return this.getFirstComponent();
}



/**
 * Returns the top component (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getTopComponent = function() {
  return this.getFirstComponent();
}



/**
 * Returns the right component (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getRightComponent = function() {
  return this.getSecondComponent();
}



/**
 * Returns the bottom component (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getBottomComponent = function() {
  return this.getSecondComponent();
}



/**
 * Returns the first component (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getFirstComponent = function() {
  return this._firstComponent;
}



/**
 * Returns the second component (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getSecondComponent = function() {
  return this._secondComponent;
}










/*
---------------------------------------------------------------------------
  PRIVAT METHODS
---------------------------------------------------------------------------
 */










/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
 */
qx.Proto._modifyVisibleGlassPane = function(propValue, propOldValue, propData) {
  var glass = this._glass;
  if(propValue) {
    glass.setState('visible', true);
  }
  
  if(propOldValue) {
    glass.setState('visible', false);
  }
  
  return true;
}










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
  
  glasspane.setVisibility(true);
  
  if(!this.isContinuousLayout()) {
    // initialize the slider
    slider._applyRuntimeLeft(qx.dom.DomLocation.getPageBoxLeft(el) - l);
    slider._applyRuntimeTop(qx.dom.DomLocation.getPageBoxTop(el) - t);
    slider._applyRuntimeWidth(qx.dom.DomDimension.getBoxWidth(el));
    slider._applyRuntimeHeight(qx.dom.DomDimension.getBoxHeight(el));
    
    slider.setVisibility(true);
  }
  
  var isLimit = !this.isFullyMinimizeable();
  
  // initialize the drag session
  this._dragSession = {
    offsetX : e.getPageX() - qx.dom.DomLocation.getPageBoxLeft(el) + l,
    offsetY : e.getPageY() - qx.dom.DomLocation.getPageBoxTop(el) + t,
    
    width : r - l,
    height: b - t,
    
    /*
    parentAvailableAreaLeft : l + (isLimit ? this.getFirstComponent().getPreferredBoxWidth() : 0),
    parentAvailableAreaTop : t + (isLimit ? this.getFirstComponent().getPreferredBoxHeight() : 0),
    parentAvailableAreaRight : r - (isLimit ? this.getSecondComponent().getPreferredBoxWidth() : 0),
    parentAvailableAreaBottom : b - (isLimit ? this.getSecondComponent().getPreferredBoxHeight() : 0)
    */
    
    parentAvailableAreaLeft : l + (isLimit ? this.getFirstComponent().getMinWidth() : 0),
    parentAvailableAreaTop : t + (isLimit ? this.getFirstComponent().getMinHeight() : 0),
    parentAvailableAreaRight : r - (isLimit ? this.getSecondComponent().getMinWidth() : 0),
    parentAvailableAreaBottom : b - (isLimit ? this.getSecondComponent().getMinHeight() : 0)
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
        this._firstComponent.setWidth(fWidth + '*');
        this._secondComponent.setWidth(sWidth + '*');
        break;
        
      case qx.constant.Layout.ORIENTATION_VERTICAL :
        var sHeight = s.height - s.lastY;
        var fHeight = s.height - sHeight;
        this._firstComponent.setHeight(fHeight + '*');
        this._secondComponent.setHeight(sHeight + '*');
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
        this._firstComponent.setWidth(fWidth + '*');
        this._secondComponent.setWidth(sWidth + '*');
        break;
        
      case qx.constant.Layout.ORIENTATION_VERTICAL :
        var sHeight = s.height - s.lastY;
        var fHeight = s.height - sHeight;
        this._firstComponent.setHeight(fHeight + '*');
        this._secondComponent.setHeight(sHeight + '*');
        break;
    }
  } else {
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
  
  if(this._firstComponent) {
    this._firstComponent.dispose();
    this._firstComponent = null;
  }
  
  if(this._secondComponent) {
    this._secondComponent.dispose();
    this._secondComponent = null;
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
  
  if(this._glass) {
    this._glass.dispose();
    this._glass = null;
  }
  
  
  return qx.ui.layout.BoxLayout.prototype.dispose.call(this);
}
