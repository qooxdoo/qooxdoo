/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Volker Pauli (vpauli)
     * Sebastian Werner (wpbasti)

 ************************************************************************ */

/* ************************************************************************

#module(ui_splitpane)

 ************************************************************************ */


/**
 * Creates a new instance of a SplitPane. It allows the user to dynamically resize
 * the areas dropping the border between.
 * <br /><br />
 * new qx.ui.splitpane.SplitPane(orientation)<br />
 * new qx.ui.splitpane.SplitPane(orientation, firstSize, secondSize)<br />
 *
 * @param orientation {string} The orientation of the splitpane control. Allowed values are qx.constant.Layout.ORIENTATION_HORIZONTAL (default) and qx.constant.Layout.ORIENTATION_VERTICAL. This is the same type as used in {@link qx.ui.layout.BoxLayout#orientation}.
 * @param firstSize {string} The size of the left (top) pane. Allowed values are any by {@see qx.ui.core.Widget} supported unit.
 * @param secondSize {string} The size of the right (bottom) pane. Allowed values are any by {@see qx.ui.core.Widget} supported unit.
 *
 */
qx.OO.defineClass("qx.ui.splitpane.SplitPane", qx.ui.layout.CanvasLayout,
function(orientation, firstSize, secondSize) {

  qx.ui.layout.CanvasLayout.call(this);


  this.setOverflow("hidden");


  // CREATE INNER BOX LAYOUT
  var box = this._box = new qx.ui.layout.BoxLayout;
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
   | | | firstArea               |  |s|  | secondArea                                  | | |
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
  var glass = this._glass = new qx.ui.layout.CanvasLayout;
  glass.setEdge(0);
  glass.setAppearance("splitpane-glasspane");
  glass.hide();
  this.add(glass);

  // CREATE SLIDER
  this._slider = new qx.ui.splitpane.Splitter;
  this._slider.hide();
  this.add(this._slider);




  // CREATE SPLITTER
  this._splitter = new qx.ui.splitpane.Splitter;

  // CREATE AREAS
  this._firstArea = new qx.ui.layout.CanvasLayout;
  this._secondArea = new qx.ui.layout.CanvasLayout;

  // FILL BOX
  box.add(this._firstArea, this._splitter, this._secondArea);



  // APPLY DIMENSIONS
  this.setFirstSize(firstSize || qx.constant.Core.FLEX);
  this.setSecondSize(secondSize || qx.constant.Core.FLEX);

  // APPLY ORIENTATION
  this.setOrientation(orientation || qx.constant.Layout.ORIENTATION_HORIZONTAL);
});










/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
 */

/**
 * The layout method for the splitpane. If true, the content will updated immediatly.
 */
qx.OO.addProperty({ name : "liveResize", type : qx.constant.Type.BOOLEAN, allowNull : false, defaultValue : false, getAlias : "isLiveResize"});

/**
 * if the glasspane should be visible, set this to true.
 */
qx.OO.addProperty({ name : "visibleGlassPane", type : qx.constant.Type.BOOLEAN, allowNull : false, defaultValue : false, getAlias : "isVisibleGlassPane" });

/**
 * The orientation of the splitpane control. Allowed values are qx.constant.Layout.ORIENTATION_HORIZONTAL (default) and qx.constant.Layout.ORIENTATION_VERTICAL.
 */
qx.OO.addProperty({ name : "orientation", type : qx.constant.Type.STRING, possibleValues : [ qx.constant.Layout.ORIENTATION_HORIZONTAL, qx.constant.Layout.ORIENTATION_VERTICAL ] });

/**
 * The size of the first (left/top) area.
 */
qx.OO.addProperty({ name : "firstSize" });

/**
 * The size of the second (right/bottom) area.
 */
qx.OO.addProperty({ name : "secondSize" });








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
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyOrientation = function(propValue, propOldValue, propData)
{
  // sync orientation to layout
  this._box.setOrientation(propValue);

  // sync orientation to splitter
  this._splitter.setOrientation(propValue);

  switch(propOldValue)
  {
    case qx.constant.Layout.ORIENTATION_HORIZONTAL:
      // remove old listeners
      this._splitter.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onSplitterMouseDownX, this);
      this._splitter.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onSplitterMouseMoveX, this);
      this._splitter.removeEventListener(qx.constant.Event.MOUSEUP, this._onSplitterMouseUpX, this);

      // reset old dimensions
      this._firstArea.setWidth(null);
      this._secondArea.setWidth(null);

      break;

    case qx.constant.Layout.ORIENTATION_VERTICAL:
      // remove old listeners
      this._splitter.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onSplitterMouseDownY, this);
      this._splitter.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onSplitterMouseMoveY, this);
      this._splitter.removeEventListener(qx.constant.Event.MOUSEUP, this._onSplitterMouseUpY, this);

      // reset old dimensions
      this._firstArea.setHeight(null);
      this._secondArea.setHeight(null);

      break;
  }

  switch(propValue)
  {
    case qx.constant.Layout.ORIENTATION_HORIZONTAL:
      // add new listeners
      this._splitter.addEventListener(qx.constant.Event.MOUSEMOVE, this._onSplitterMouseMoveX, this);
      this._splitter.addEventListener(qx.constant.Event.MOUSEDOWN, this._onSplitterMouseDownX, this);
      this._splitter.addEventListener(qx.constant.Event.MOUSEUP, this._onSplitterMouseUpX, this);

      // apply cursor
      this._splitter.setCursor("col-resize");

      break;

    case qx.constant.Layout.ORIENTATION_VERTICAL:
      // add new listeners
      this._splitter.addEventListener(qx.constant.Event.MOUSEDOWN, this._onSplitterMouseDownY, this);
      this._splitter.addEventListener(qx.constant.Event.MOUSEMOVE, this._onSplitterMouseMoveY, this);
      this._splitter.addEventListener(qx.constant.Event.MOUSEUP, this._onSplitterMouseUpY, this);

      // apply cursor
      this._splitter.setCursor("row-resize");

      break;
  }

  // apply new dimensions
  this._syncFirstSize();
  this._syncSecondSize();

  return true;
};


qx.Proto._modifyVisibleGlassPane = function(propValue, propOldValue, propData)
{
  this._glass.setState("visible", propValue);
  return true;
}

qx.Proto._modifyFirstSize = function(propValue, propOldValue, propData)
{
  this._syncFirstSize();
  return true;
}

qx.Proto._modifySecondSize = function(propValue, propOldValue, propData)
{
  this._syncSecondSize();
  return true;
}

qx.Proto._syncFirstSize = function()
{
  switch(this.getOrientation())
  {
    case qx.constant.Layout.ORIENTATION_HORIZONTAL:
      this._firstArea.setWidth(this.getFirstSize());
      break;

    case qx.constant.Layout.ORIENTATION_VERTICAL:
      this._firstArea.setHeight(this.getFirstSize());
      break;
  }
}

qx.Proto._syncSecondSize = function()
{
  switch(this.getOrientation())
  {
    case qx.constant.Layout.ORIENTATION_HORIZONTAL:
      this._secondArea.setWidth(this.getSecondSize());
      break;

    case qx.constant.Layout.ORIENTATION_VERTICAL:
      this._secondArea.setHeight(this.getSecondSize());
      break;
  }
}










/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

/**
 * Initializes drag session in case of a mousedown event on splitter in a horizontal splitpane.
 *
 * @param e {qx.event.MouseEvent} The event itself.
 */
qx.Proto._onSplitterMouseDownX = function(e)
{
  if (!e.isLeftButtonPressed()) {
    return;
  }

  this._commonMouseDown();

  // activate global cursor
  this.getTopLevelWidget().setGlobalCursor("col-resize");

  // initialize the drag session
  // dragStart = position of layout + mouse offset on splitter
  this._dragActive = true;
  this._slider.setState("dragging", true);
  this._dragStart = qx.dom.DomLocation.getPageBoxLeft(this._box.getElement()) + (e.getPageX() - qx.dom.DomLocation.getPageBoxLeft(this._splitter.getElement()));
}

/**
 * Initializes drag session in case of a mousedown event on splitter in a vertical splitpane.
 *
 * @param e {qx.event.MouseEvent} The event itself.
 */
qx.Proto._onSplitterMouseDownY = function(e)
{
  if (!e.isLeftButtonPressed()) {
    return;
  }

  this._commonMouseDown();

  // activate global cursor
  this.getTopLevelWidget().setGlobalCursor("row-resize");

  // initialize the drag session
  // dragStart = position of layout + mouse offset on splitter
  this._dragActive = true;
  this._slider.setState("dragging", true);
  this._dragStart = qx.dom.DomLocation.getPageBoxTop(this._box.getElement()) + (e.getPageY() - qx.dom.DomLocation.getPageBoxTop(this._splitter.getElement()));
}

qx.Proto._commonMouseDown = function()
{
  // enable capturing
  this._splitter.setCapture(true);

  // protect content
  this._glass.show();

  // initialize the slider
  if(!this.isLiveResize())
  {
    this._slider.setLeft(this._splitter.getOffsetLeft());
    this._slider.setTop(this._splitter.getOffsetTop());
    this._slider.setWidth(this._splitter.getBoxWidth());
    this._slider.setHeight(this._splitter.getBoxHeight());

    this._slider.show();
  }
}








/**
 * Move the splitter in case of a mousemove event on splitter in a horizontal splitpane.
 *
 * @param e {qx.event.MouseEvent} The event itself.
 */
qx.Proto._onSplitterMouseMoveX = function(e)
{
  if (!this._dragActive) {
    return;
  }

  this.isLiveResize() ? this._syncX(e) : this._slider._applyRuntimeLeft(e.getPageX() - this._dragStart);
  e.preventDefault();
}

/**
 * Move the splitter in case of a mousemove event on splitter in a vertical splitpane.
 *
 * @param e {qx.event.MouseEvent} The event itself.
 */
qx.Proto._onSplitterMouseMoveY = function(e)
{
  if (!this._dragActive) {
    return;
  }

  this.isLiveResize() ? this._syncY(e) : this._slider._applyRuntimeTop(e.getPageY() - this._dragStart);
  e.preventDefault();
}







/**
 * Ends the drag session and computes the new dimensions of panes in case of a mouseup event on splitter in a horizontal splitpane.
 *
 * @param e {qx.event.MouseEvent} The event itself.
 */
qx.Proto._onSplitterMouseUpX = function(e)
{
  if(!this._dragActive) {
    return;
  }

  if(!this.isLiveResize()) {
    this._syncX(e);
  }

  this._commonMouseUp();
}

/**
 * Ends the drag session and computes the new dimensions of panes in case of a mouseup event on splitter in a vertical splitpane.
 *
 * @param e {qx.event.MouseEvent} The event itself.
 */
qx.Proto._onSplitterMouseUpY = function(e)
{
  if(!this._dragActive) {
    return;
  }

  if(!this.isLiveResize()) {
    this._syncY(e);
  }

  this._commonMouseUp();
}

qx.Proto._commonMouseUp = function()
{
  // hide helpers
  this._glass.hide();
  this._slider.hide();

  // disable capturing
  this._splitter.setCapture(false);

  // reset the global cursor
  this.getTopLevelWidget().setGlobalCursor(null);

  // cleanup dragsession
  this._dragActive = false;
  this._slider.setState("dragging", true);
}

qx.Proto._syncX = function(e)
{
  var first = e.getPageX() - this._dragStart;
  var second = this._box.getInnerWidth() - this._splitter.getBoxWidth() - first;

  this._syncCommon(first, second);
}

qx.Proto._syncY = function(e)
{
  var first = e.getPageY() - this._dragStart;
  var second = this._box.getInnerHeight() - this._splitter.getBoxHeight() - first;

  this._syncCommon(first, second);
}

qx.Proto._syncCommon = function(first, second)
{
  this.setFirstSize(first + qx.constant.Core.STAR);
  this.setSecondSize(second + qx.constant.Core.STAR);
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
    this._splitter.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onSplitterMouseDownX, this);
    this._splitter.removeEventListener(qx.constant.Event.MOUSEUP, this._onSplitterMouseMoveX, this);
    this._splitter.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onSplitterMouseUpX, this);

    this._splitter.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onSplitterMouseDownY, this);
    this._splitter.removeEventListener(qx.constant.Event.MOUSEUP, this._onSplitterMouseMoveY, this);
    this._splitter.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onSplitterMouseUpY, this);

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
