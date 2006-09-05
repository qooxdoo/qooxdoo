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




  // CREATE INNER BOX LAYOUT
  var box = this._box = new qx.ui.layout.BoxLayout(orientation);
  box.setEdge(0);
  this.add(box);

  /*

   the splitpane itself is a boxlayout resides on top of a canvas for easier computing of positional values

    ---------------------------------------------------------------------------------------
   |  canvas                                                                               |
   |  -----------------------------------------------------------------------------------  |
   | | box                                                                               | |
   | | ---------------------------  ---  ----------------------------------------------- | |
   | | |                         |  | |  |                                             | | |
   | | | firstArea          |  |s|  | secondArea                             | | |
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
   widget inside the areas without paying attention on the special mouseevent handling of the used widget. In particular the iframe
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



  // CREATE GLASS PANE
  // Protect iframes, ...
  var glass = this._glass = new qx.ui.layout.CanvasLayout();
  glass.setEdge(0);
  glass.setAppearance('splitpane-glasspane');
  glass.hide();
  this.add(glass);

  // CREATE SLIDER
  var slider = this._slider = new qx.ui.splitpane.Splitter(this._box.getOrientation());
  slider.hide();
  this.add(slider);




  // CREATE SPLITTER
  var splitter = this._splitter = new qx.ui.splitpane.Splitter(this._box.getOrientation());
  splitter.addEventListener(qx.constant.Event.MOUSEDOWN, this._onsplittermousedown, this);
  splitter.addEventListener(qx.constant.Event.MOUSEUP, this._onsplittermouseup, this);
  splitter.addEventListener(qx.constant.Event.MOUSEMOVE, this._onsplittermousemove, this);

  // CREATE AREAS
  var firstArea = this._firstArea = new qx.ui.layout.CanvasLayout;
  var secondArea = this._secondArea = new qx.ui.layout.CanvasLayout;

  var firstSize = qx.util.Validation.isValidStringOrNumber(firstProportion) ? firstProportion : qx.constant.Core.FLEX;
  var secondSize = qx.util.Validation.isValidStringOrNumber(secondProportion) ? secondProportion : qx.constant.Core.FLEX;

  switch(box.getOrientation()) {
    case qx.constant.Layout.ORIENTATION_HORIZONTAL :
      firstArea.setWidth(firstSize);
      secondArea.setWidth(secondSize);
      break;

    case qx.constant.Layout.ORIENTATION_VERTICAL :
      firstArea.setHeight(firstSize);
      secondArea.setHeight(secondSize);
      break;
  }

  box.add(this._firstArea, splitter, this._secondArea);
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
  var c = this.getFirstArea();
  return c.add.apply(c, arguments);
}



/**
 * adds one or more widget(s) to the top pane
 *
 *@param widget {qx.ui.core.Parent}
 */
qx.Proto.addTop = function() {
  var c = this.getFirstArea();
  return c.add.apply(c, arguments);
}



/**
 * adds one or more widget(s) to the right pane
 *
 *@param widget {qx.ui.core.Parent}
 */
qx.Proto.addRight = function() {
  var c = this.getSecondArea();
  return c.add.apply(c, arguments);
}



/**
 * adds one or more widget(s) to the bottom pane
 *
 *@param widget {qx.ui.core.Parent}
 */
qx.Proto.addBottom = function() {
  var c = this.getSecondArea();
  return c.add.apply(c, arguments);
}



/**
 * Returns the left area (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getLeftArea = function() {
  return this.getFirstArea();
}



/**
 * Returns the top area (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getTopArea = function() {
  return this.getFirstArea();
}



/**
 * Returns the right area (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getRightArea = function() {
  return this.getSecondArea();
}



/**
 * Returns the bottom area (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getBottomArea = function() {
  return this.getSecondArea();
}



/**
 * Returns the first area (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getFirstArea = function() {
  return this._firstArea;
}



/**
 * Returns the second area (CanvasLayout)
 *
 * @return {qx.ui.layout.CanvasLayout}
 */
qx.Proto.getSecondArea = function() {
  return this._secondArea;
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
qx.Proto._modifyVisibleGlassPane = function(propValue, propOldValue, propData)
{
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

  glasspane.show();

  if(!this.isContinuousLayout()) {
    // initialize the slider
    slider._applyRuntimeLeft(qx.dom.DomLocation.getPageBoxLeft(el) - l);
    slider._applyRuntimeTop(qx.dom.DomLocation.getPageBoxTop(el) - t);
    slider._applyRuntimeWidth(qx.dom.DomDimension.getBoxWidth(el));
    slider._applyRuntimeHeight(qx.dom.DomDimension.getBoxHeight(el));

    slider.show();
  }

  // initialize the drag session
  this._dragSession =
  {
    offsetX : e.getPageX() - qx.dom.DomLocation.getPageBoxLeft(el) + l,
    offsetY : e.getPageY() - qx.dom.DomLocation.getPageBoxTop(el) + t,

    width : r - l,
    height: b - t,

    parentAvailableAreaLeft : l,
    parentAvailableAreaTop : t,
    parentAvailableAreaRight : r,
    parentAvailableAreaBottom : b
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

  glasspane.hide();
  slider.hide();

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
        this._firstArea.setWidth(fWidth + '*');
        this._secondArea.setWidth(sWidth + '*');
        break;

      case qx.constant.Layout.ORIENTATION_VERTICAL :
        var sHeight = s.height - s.lastY;
        var fHeight = s.height - sHeight;
        this._firstArea.setHeight(fHeight + '*');
        this._secondArea.setHeight(sHeight + '*');
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
        this._firstArea.setWidth(fWidth + '*');
        this._secondArea.setWidth(sWidth + '*');
        break;

      case qx.constant.Layout.ORIENTATION_VERTICAL :
        var sHeight = s.height - s.lastY;
        var fHeight = s.height - sHeight;
        this._firstArea.setHeight(fHeight + '*');
        this._secondArea.setHeight(sHeight + '*');
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

  if(this._firstArea) {
    this._firstArea.dispose();
    this._firstArea = null;
  }

  if(this._secondArea) {
    this._secondArea.dispose();
    this._secondArea = null;
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
