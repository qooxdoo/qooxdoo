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

     * Carsten Lergenmueller (carstenL)



 ************************************************************************ */



/* ************************************************************************



#module(ui_splitpane)



 ************************************************************************ */





/**

 * Creates a new instance of a SplitPane. It allows the user to dynamically resize

 * the areas dropping the border between.

 *

 * new qx.ui.splitpane.SplitPane(orientation)

 * new qx.ui.splitpane.SplitPane(orientation, firstSize, secondSize)

 *

 * @param orientation (string) The orientation of the splitpane control. Allowed values are qx.constant.Layout.ORIENTATION_HORIZONTAL (default) and qx.constant.Layout.ORIENTATION_VERTICAL. This is the same type as used in {@link qx.ui.layout.BoxLayout#orientation}.

 * @param firstSize (string) The size of the left (top) pane. Allowed values are any by {@link qx.ui.core.Widget} supported unit.

 * @param secondSize (string) The size of the right (bottom) pane. Allowed values are any by {@link qx.ui.core.Widget} supported unit.

 */

qx.OO.defineClass("qx.ui.splitpane.SplitPane", qx.ui.layout.CanvasLayout,

function(orientation, firstSize, secondSize) {



  qx.ui.layout.CanvasLayout.call(this);



  var self = this;



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

  this._slider = new qx.ui.layout.CanvasLayout;

  this._slider.setAppearance("splitpane-slider");

  this._slider.setStyleProperty("fontSize", "0px");

  this._slider.setStyleProperty("lineHeight", "0px");

  this._slider.hide();

  this.add(this._slider);



  // CREATE SPLITTER

  this._splitter = new qx.ui.layout.CanvasLayout;

  this._splitter.setStyleProperty("fontSize", "0px");

  this._splitter.setStyleProperty("lineHeight", "0px");

  this._splitter.setAppearance("splitpane-splitter");



  // SET UP KNOB POSITIONING



  // Sync knob and slider knob left to splitter left

  this._splitter._superApplyRuntimeLeft = this._splitter._applyRuntimeLeft;

  this._splitter._applyRuntimeLeft = function(value){

    if (self._knob != null && (self.getOrientation() == qx.constant.Layout.ORIENTATION_HORIZONTAL)){

      self._knob.setLeft(value - ((self._knob.getWidth() - self.getSplitterSize()) / 2));

      self._sliderKnob._applyRuntimeLeft(self._knob.getLeft());

    }

    self._splitter._superApplyRuntimeLeft(value);

  }



  // Sync slider knob left to slider left

  this._slider._superApplyRuntimeLeft = this._slider._applyRuntimeLeft;

  this._slider._applyRuntimeLeft = function(value){

    if (self._knob != null && (self.getOrientation() == qx.constant.Layout.ORIENTATION_HORIZONTAL)){

      self._sliderKnob._applyRuntimeLeft(value - ((self._sliderKnob.getWidth() - self.getSplitterSize()) / 2));

    }

    self._slider._superApplyRuntimeLeft(value);

  }



  // Sync knob and slider knob top to splitter top

  this._splitter._superApplyRuntimeTop = this._splitter._applyRuntimeTop;

  this._splitter._applyRuntimeTop = function(value){

    if (self._knob != null && (self.getOrientation() == qx.constant.Layout.ORIENTATION_VERTICAL)){

      self._knob._applyRuntimeTop(value - ((self._knob.getHeight() - self.getSplitterSize()) / 2));

      self._sliderKnob._applyRuntimeTop(self._knob.getTop());

    }

    self._splitter._superApplyRuntimeTop(value);

  }



  // Sync slider knob top to slider top

  this._slider._superApplyRuntimeTop = this._slider._applyRuntimeTop;

  this._slider._applyRuntimeTop = function(value){

    if (self._knob != null && (self.getOrientation() == qx.constant.Layout.ORIENTATION_VERTICAL)){

      self._sliderKnob._applyRuntimeTop(value - ((self._sliderKnob.getHeight() - self.getSplitterSize()) / 2));

    }

    self._slider._superApplyRuntimeTop(value);

  }



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

 * Appearance change

 */

qx.OO.changeProperty({ name : "appearance", defaultValue : "splitpane" });



/**

 * Appearance to use for the holding knob. If null, no holding knob will be shown, otherwise

 * the given appearance will be set. The appearance may set all properties supported by

 * qx.ui.basic.Image and should support the states "horizontal" (knob setup for horizontal splitpane),

 * "vertical" (knob setup for vertical splitpane) and "dragging" (knob which is being dragged).

 * See appearance "splitpane-knob" in qx.theme.appearance.DefaultAppearanceTheme for an example.

 */

qx.OO.addProperty({ name : "appearanceKnob", allowNull : true, defaultValue : null });



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



/**

 * Size of the splitter

 */

qx.OO.addProperty({ name : "splitterSize", defaultValue : 5 });















/*

---------------------------------------------------------------------------

  PUBLIC METHODS

---------------------------------------------------------------------------

*/





/**

 * adds one or more widget(s) to the left pane

 *

 *@param widget (qx.ui.core.Parent)

 */

qx.Proto.addLeft = function() {

  var c = this.getFirstArea();

  return c.add.apply(c, arguments);

}



/**

 * adds one or more widget(s) to the top pane

 *

 *@param widget (qx.ui.core.Parent)

 */

qx.Proto.addTop = function() {

  var c = this.getFirstArea();

  return c.add.apply(c, arguments);

}



/**

 * adds one or more widget(s) to the right pane

 *

 *@param widget (qx.ui.core.Parent)

 */

qx.Proto.addRight = function() {

  var c = this.getSecondArea();

  return c.add.apply(c, arguments);

}



/**

 * adds one or more widget(s) to the bottom pane

 *

 *@param widget (qx.ui.core.Parent)

 */

qx.Proto.addBottom = function() {

  var c = this.getSecondArea();

  return c.add.apply(c, arguments);

}













/**

 * Returns the left area (CanvasLayout)

 *

 * @return (qx.ui.layout.CanvasLayout)

 */

qx.Proto.getLeftArea = function() {

  return this.getFirstArea();

}



/**

 * Returns the top area (CanvasLayout)

 *

 * @return (qx.ui.layout.CanvasLayout)

 */

qx.Proto.getTopArea = function() {

  return this.getFirstArea();

}



/**

 * Returns the right area (CanvasLayout)

 *

 * @return (qx.ui.layout.CanvasLayout)

 */

qx.Proto.getRightArea = function() {

  return this.getSecondArea();

}



/**

 * Returns the bottom area (CanvasLayout)

 *

 * @return (qx.ui.layout.CanvasLayout)

 */

qx.Proto.getBottomArea = function() {

  return this.getSecondArea();

}



/**

 * Returns the first area (CanvasLayout)

 *

 * @return (qx.ui.layout.CanvasLayout)

 */

qx.Proto.getFirstArea = function() {

  return this._firstArea;

}



/**

 * Returns the second area (CanvasLayout)

 *

 * @return (qx.ui.layout.CanvasLayout)

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

      this._splitter.setWidth(null);



      break;



    case qx.constant.Layout.ORIENTATION_VERTICAL:

      // remove old listeners

      this._splitter.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onSplitterMouseDownY, this);

      this._splitter.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onSplitterMouseMoveY, this);

      this._splitter.removeEventListener(qx.constant.Event.MOUSEUP, this._onSplitterMouseUpY, this);



      // reset old dimensions

      this._firstArea.setHeight(null);

      this._secondArea.setHeight(null);

      this._splitter.setHeight(null);



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



  this._setupKnobsForOrientation(propOldValue, propValue);



  // apply new dimensions

  this._syncFirstSize();

  this._syncSecondSize();

  this._syncSplitterSize();



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



qx.Proto._modifySplitterSize = function(propValue, propOldValue, propData)

{

  this._syncSplitterSize();

  return true;

}



qx.Proto._modifyAppearanceKnob = function(propValue, propOldValue, propData) {

  if ((propValue == null) && (propOldValue != null)){



    this._setupKnobsForOrientation(this.getOrientation(), null);

    this._knob.dispose();

    this._sliderKnob.dispose();



    this._knob = null;

    this._sliderKnob = null;



  } else if ((propValue != null) && (propOldValue == null)){



    //CREATE HOLDING KNOB

    var orientation = this.getOrientation();

    this._knob = new qx.ui.basic.Image();

    this._knob.setAppearance(propValue);

    this._knob.addState(orientation);

    this._knob.setZIndex(this._splitter.getZIndex() + 1);

    this.add(this._knob);



    this._sliderKnob = new qx.ui.basic.Image();

    this._sliderKnob.setAppearance(propValue);

    this._sliderKnob.addState(orientation);

    this._sliderKnob.setZIndex(this._slider.getZIndex() + 1);

    this._sliderKnob.hide();

    this.add(this._sliderKnob);



    this._setupKnobsForOrientation(null, this.getOrientation());

  }

  return true;

}





qx.Proto._setupKnobsForOrientation = function(oldOrientation, newOrientation){

  if (this._knob != null){



    this._knob.removeState(oldOrientation);

    this._sliderKnob.removeState(oldOrientation);

    this._knob.addState(newOrientation);

    this._sliderKnob.addState(newOrientation);





    if (oldOrientation == qx.constant.Layout.ORIENTATION_HORIZONTAL){

      this._knob.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onSplitterMouseDownY, this);

      this._knob.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onSplitterMouseMoveY, this);

      this._knob.removeEventListener(qx.constant.Event.MOUSEUP, this._onSplitterMouseUpY, this);

    } else {

      this._knob.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onSplitterMouseDownX, this);

      this._knob.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onSplitterMouseMoveX, this);

      this._knob.removeEventListener(qx.constant.Event.MOUSEUP, this._onSplitterMouseUpX, this);

    }



    if (newOrientation != null) {

      if (newOrientation == qx.constant.Layout.ORIENTATION_HORIZONTAL){

        this._knob.setCursor("col-resize");

        this._knob.addEventListener(qx.constant.Event.MOUSEMOVE, this._onSplitterMouseMoveX, this);

        this._knob.addEventListener(qx.constant.Event.MOUSEDOWN, this._onSplitterMouseDownX, this);

        this._knob.addEventListener(qx.constant.Event.MOUSEUP, this._onSplitterMouseUpX, this);

      } else {

        this._knob.setCursor("row-resize");

        this._knob.addEventListener(qx.constant.Event.MOUSEMOVE, this._onSplitterMouseMoveY, this);

        this._knob.addEventListener(qx.constant.Event.MOUSEDOWN, this._onSplitterMouseDownY, this);

        this._knob.addEventListener(qx.constant.Event.MOUSEUP, this._onSplitterMouseUpY, this);

      }

    }

  }

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



qx.Proto._syncSplitterSize = function()

{

  switch(this.getOrientation())

  {

    case qx.constant.Layout.ORIENTATION_HORIZONTAL:

      this._splitter.setWidth(this.getSplitterSize());

      if (this.knob != null){

        this._knob.setTop(this.getFirstSize() - (this._knob.getHeight() / 2));

      }

      break;



    case qx.constant.Layout.ORIENTATION_VERTICAL:

      this._splitter.setHeight(this.getSplitterSize());

      if (this.knob != null){

        this._knob.setLeft(this.getFirstSize() - (this._knob.getWidth() / 2));

      }

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

 * @param e (qx.event.MouseEvent) The event itself.

 */

qx.Proto._onSplitterMouseDownX = function(e)

{

  if (!e.isLeftButtonPressed()) {

    return;

  }



  this._commonMouseDown();



  // activate global cursor

  this.getTopLevelWidget().setGlobalCursor("col-resize");

  this._slider.addState("dragging");

  if (this._knob != null){

    this._sliderKnob.addState("dragging");

  }



  // initialize the drag session

  this._dragMin = qx.dom.DomLocation.getPageInnerLeft(this._box.getElement());

  this._dragMax = this._dragMin + this._box.getInnerWidth() - this._splitter.getBoxWidth();

  this._dragOffset = e.getPageX() - qx.dom.DomLocation.getPageBoxLeft(this._splitter.getElement());

}



/**

 * Initializes drag session in case of a mousedown event on splitter in a vertical splitpane.

 *

 * @param e (qx.event.MouseEvent) The event itself.

 */

qx.Proto._onSplitterMouseDownY = function(e)

{

  if (!e.isLeftButtonPressed()) {

    return;

  }



  this._commonMouseDown();



  // activate global cursor

  this.getTopLevelWidget().setGlobalCursor("row-resize");

  this._slider.addState("dragging");

  if (this._knob != null){

    this._sliderKnob.addState("dragging");

  }



  // initialize the drag session

  // dragStart = position of layout + mouse offset on splitter

  this._dragMin = qx.dom.DomLocation.getPageInnerTop(this._box.getElement());

  this._dragMax = this._dragMin + this._box.getInnerHeight() - this._splitter.getBoxHeight();

  this._dragOffset = e.getPageY() - qx.dom.DomLocation.getPageBoxTop(this._splitter.getElement());

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

    if (this._knob != null){

      this._sliderKnob.show();

    }

  }

}

















/**

 * Move the splitter in case of a mousemove event on splitter in a horizontal splitpane.

 *

 * @param e (qx.event.MouseEvent) The event itself.

 */

qx.Proto._onSplitterMouseMoveX = function(e)

{

  if (!this._splitter.getCapture()) {

    return;

  }



  this.isLiveResize() ? this._syncX(e) : this._slider._applyRuntimeLeft(this._normalizeX(e));

  e.preventDefault();

}



/**

 * Move the splitter in case of a mousemove event on splitter in a vertical splitpane.

 *

 * @param e (qx.event.MouseEvent) The event itself.

 */

qx.Proto._onSplitterMouseMoveY = function(e)

{

  if (!this._splitter.getCapture()) {

    return;

  }



  this.isLiveResize() ? this._syncY(e) : this._slider._applyRuntimeTop(this._normalizeY(e));

  e.preventDefault();

}















/**

 * Ends the drag session and computes the new dimensions of panes in case of a mouseup event on splitter in a horizontal splitpane.

 *

 * @param e (qx.event.MouseEvent) The event itself.

 */

qx.Proto._onSplitterMouseUpX = function(e)

{

  if (!this._splitter.getCapture()) {

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

 * @param e (qx.event.MouseEvent) The event itself.

 */

qx.Proto._onSplitterMouseUpY = function(e)

{

  if (!this._splitter.getCapture()) {

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

  if (this._knob != null){

    this._sliderKnob.hide();

  }





  // disable capturing

  this._splitter.setCapture(false);



  // reset the global cursor

  this.getTopLevelWidget().setGlobalCursor(null);



  // cleanup dragsession

  this._slider.removeState("dragging");

  if (this._knob != null){

    this._sliderKnob.removeState("dragging");

  }

}



qx.Proto._syncX = function(e)

{

  var first = this._normalizeX(e);

  var second = this._box.getInnerWidth() - this._splitter.getBoxWidth() - first;



  this._syncCommon(first, second);

}



qx.Proto._syncY = function(e)

{

  var first = this._normalizeY(e);

  var second = this._box.getInnerHeight() - this._splitter.getBoxHeight() - first;



  this._syncCommon(first, second);

}



qx.Proto._syncCommon = function(first, second)

{

  this.setFirstSize(first + qx.constant.Core.STAR);

  this.setSecondSize(second + qx.constant.Core.STAR);

}



qx.Proto._normalizeX = function(e) {

  return qx.lang.Number.limit(e.getPageX() - this._dragOffset, this._dragMin, this._dragMax) - this._dragMin;

}



qx.Proto._normalizeY = function(e) {

  return qx.lang.Number.limit(e.getPageY() - this._dragOffset, this._dragMin, this._dragMax) - this._dragMin;

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



  //Disposal of knobs will be done by AppearanceKnob mobifier

  this.setAppearanceKnob(null);



  if(this._glass) {

    this._glass.dispose();

    this._glass = null;

  }





  return qx.ui.layout.BoxLayout.prototype.dispose.call(this);

}

