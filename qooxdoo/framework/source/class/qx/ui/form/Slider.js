/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The Slider widget provides a vertical or horizontal slider.
 *
 * The Slider is the classic widget for controlling a bounded value.
 * It lets the user move a slider handle along a horizontal or vertical
 * groove and translates the handle's position into an integer value
 * within the defined range.
 *
 * The Slider has very few of its own functions; most of the functionality
 * is in {@link BaseSlider}. The most useful functions are slideTo()
 * to set the slider directly to some value; setSingleStep(), setPageStep()
 * to set the steps; and setMinimum() and setMaximum() to define the
 * range of the slider.
 *
 * A slider accepts focus on Tab and provides both a mouse wheel and
 * a keyboard interface. The keyboard interface is the following:
 *
 * * Left/Right move a horizontal slider by one single step.
 * * Up/Down move a vertical slider by one single step.
 * * PageUp moves up one page.
 * * PageDown moves down one page.
 * * Home moves to the start (mininum).
 * * End moves to the end (maximum).
 *
 * Here are the main properties of the class:
 *
 * # <code>value</code>: The bounded integer that BaseSlider maintains.
 * # <code>minimum</code>: The lowest possible value.
 * # <code>maximum</code>: The highest possible value.
 * # <code>singleStep</code>: The smaller of two natural steps that an abstract sliders provides and typically corresponds to the user pressing an arrow key.
 * # <code>pageStep</code>: The larger of two natural steps that an abstract slider provides and typically corresponds to the user pressing PageUp or PageDown.
 */
qx.Class.define("qx.ui.form.Slider",
{
  extend : qx.ui.core.Widget,
  implement : qx.ui.form.IFormElement,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param orientation {String} Configure the {@link #orientation} property
   */
  construct : function(orientation)
  {
    this.base(arguments);

    // Force canvas layout
    this._setLayout(new qx.ui.layout.Canvas());

    // Add listeners
    this.addListener("keypress", this._onKeyPress);
    this.addListener("mousewheel", this._onMouseWheel);
    this.addListener("mousedown", this._onMouseDown);
    this.addListener("mouseup", this._onMouseUp);
    this.addListener("losecapture", this._onMouseUp);
    this.addListener("resize", this._onUpdate);

    // Stop events
    this.addListener("contextmenu", this._onStopEvent);
    this.addListener("click", this._onStopEvent);
    this.addListener("dblclick", this._onStopEvent);

    // Initialize orientation
    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "slider"
    },


    // overridden
    focusable :
    {
      refine : true,
      init : true
    },


    /** Whether the slider is horizontal or vertical. */
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_applyOrientation"
    },


    /** The name of the widget. Mainly used for serialization proposes. */
    name :
    {
      check : "String",
      nullable : true,
      event : "changeName"
    },


    /**
     * The current slider value.
     *
     * Strictly validates according to {@link #minimum} and {@link #maximum}.
     * Do not apply any value correction to the incoming value. If you depend
     * on this, please use {@link #slideTo} instead.
     */
    value :
    {
      check : "typeof value==='number'&&value>=this.getMinimum()&&value<=this.getMaximum()",
      init : 0,
      apply : "_applyValue",
      event : "changeValue"
    },


    /**
     * The minimum slider value (may be nagative). This value must be smaller
     * than {@link #maximum}.
     */
    minimum :
    {
      check : "Integer",
      init : 0,
      apply : "_applyMinimum"
    },


    /**
     * The maximum slider value (may be nagative). This value must be larger
     * than {@link #minimum}.
     */
    maximum :
    {
      check : "Integer",
      init : 100,
      apply : "_applyMaximum"
    },


    /**
     * The amount to increment on each event. Typically corresponds
     * to the user pressing an arrow key.
     */
    singleStep :
    {
      check : "Integer",
      init : 1
    },


    /**
     * The amount to increment on each event. Typically corresponds
     * to the user pressing <code>PageUp</code> or <code>PageDown</code>.
     */
    pageStep :
    {
      check : "Integer",
      init : 10
    },


    /**
     * Factor to apply to the width/height of the knob in relation
     * to the dimension of the underlying area.
     */
    knobFactor :
    {
      check : "Number",
      apply : "_applyKnobFactor",
      nullable : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __sliderLocation : null,
    __knobLocation : null,
    __knobSize : null,
    __dragMode : null,
    __dragOffset : null,
    __trackingMode : null,
    __trackingDirection : null,
    __trackingEnd : null,
    __timer : null,


    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "knob":
          control = new qx.ui.core.Widget();
          control.addListener("resize", this._onUpdate, this);
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Listener of mousewheel event
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     * @return {void}
     */
    _onMouseWheel : function(e)
    {
      var direction = e.getWheelDelta() > 0 ? 1 : -1;
      this.slideBy(direction * this.getSingleStep());
      e.stop();
    },


    /**
     * Event handler for keypress events.
     *
     * Adds support for arrow keys, page up, page down, home and end keys.
     *
     * @param e {qx.event.type.Keypress} Incoming keypress event
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      var isHorizontal = this.getOrientation() === "horizontal";
      var backward = isHorizontal ? "Left" : "Up";
      var forward = isHorizontal ? "Right" : "Down";

      switch(e.getKeyIdentifier())
      {
        case forward:
          this.slideForward();
          break;

        case backward:
          this.slideBack();
          break;

        case "PageDown":
          this.slidePageForward();
          break;

        case "PageUp":
          this.slidePageBack();
          break;

        case "Home":
          this.slideToBegin();
          break;

        case "End":
          this.slideToEnd();
          break;

        default:
          return;
      }

      // Stop processed events
      e.stop();
    },


    /**
     * Listener of mousedown event. Initializes drag or tracking mode.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     * @return {void}
     */
    _onMouseDown : function(e)
    {
      var isHorizontal = this.__isHorizontal;
      var knob = this._getChildControl("knob");

      var locationProperty = isHorizontal ? "left" : "top";

      var cursorLocation = isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();
      var sliderLocation = this.__sliderLocation = qx.bom.element.Location.get(this.getContentElement().getDomElement())[locationProperty];
      var knobLocation = this.__knobLocation = qx.bom.element.Location.get(knob.getContainerElement().getDomElement())[locationProperty];

      if (e.getTarget() === knob)
      {
        // Switch into drag mode
        this.__dragMode = true;

        // Compute dragOffset (includes both: inner position of the widget and cursor position on knob)
        this.__dragOffset = cursorLocation + sliderLocation - knobLocation;
      }
      else
      {
        // Switch into tracking mode
        this.__trackingMode = true;

        // Detect tracking direction
        this.__trackingDirection = cursorLocation <= knobLocation ? -1 : 1;

        // Compute end value
        this.__computeTrackingEnd(e);

        // Directly call interval method once
        this._onInterval();

        // Initialize timer (when needed)
        if (!this.__timer)
        {
          this.__timer = new qx.event.Timer(100);
          this.__timer.addListener("interval", this._onInterval, this);
        }

        // Start timer
        this.__timer.start();
      }

      // Register move listener
      this.addListener("mousemove", this._onMouseMove);

      // Activate capturing
      this.capture();

      // Stop event
      e.stopPropagation();
    },


    /**
     * Listener of mouseup event. Used for cleanup of previously
     * initialized modes.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     * @return {void}
     */
    _onMouseUp : function(e)
    {
      if (this.__dragMode)
      {
        // Release capture mode
        this.releaseCapture();

        // Cleanup status flags
        delete this.__dragMode;
        delete this.__dragOffset;
      }
      else if (this.__trackingMode)
      {
        // Stop timer interval
        this.__timer.stop();

        // Release capture mode
        this.releaseCapture();

        // Cleanup status flags
        delete this.__trackingMode;
        delete this.__trackingDirection;
        delete this.__trackingEnd;
      }

      // Remove move listener again
      this.removeListener("mousemove", this._onMouseMove);

      // Stop event
      if (e.getType() === "mouseup") {
        e.stopPropagation();
      }
    },


    /**
     * Listener of mousmove event for the knob. Only used in drag mode.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     * @return {void}
     */
    _onMouseMove : function(e)
    {
      if (this.__dragMode)
      {
        var dragStop = this.__isHorizontal ?
          e.getDocumentLeft() : e.getDocumentTop();
        var position = dragStop - this.__dragOffset;

        this.slideTo(this._positionToValue(position));
      }
      else if (this.__trackingMode)
      {
        // Update tracking end on mousemove
        this.__computeTrackingEnd(e);
      }

      // Stop event
      e.stopPropagation();
    },


    /**
     * Listener of interval event by the internal timer. Only used
     * in tracking sequences.
     *
     * @param e {qx.event.type.Event} Incoming event object
     * @return {void}
     */
    _onInterval : function(e)
    {
      // Compute new value
      var value = this.getValue() + (this.__trackingDirection * this.getPageStep());

      // Limit value
      if (value < this.getMinimum()) {
        value = this.getMinimum();
      } else if (value > this.getMaximum()) {
        value = this.getMaximum();
      }

      // Stop at tracking position (where the mouse is pressed down)
      var slideBack = this.__trackingDirection == -1;
      if ((slideBack && value <= this.__trackingEnd) || (!slideBack && value >= this.__trackingEnd)) {
        value = this.__trackingEnd;
      }

      // Finally slide to the desired position
      this.slideTo(value);
    },


    /**
     * Listener of resize event for both the slider itself and the knob.
     *
     * @param e {qx.event.type.Data} Incoming event object
     * @return {void}
     */
    _onUpdate : function(e)
    {
      // Update sliding space
      var availSize = this.getInnerSize();
      var knobSize = this._getChildControl("knob").getBounds();
      var sizeProperty = this.__isHorizontal ? "width" : "height";

      // Sync knob size
      this._updateKnobSize();

      // Store knob size
      this.__slidingSpace = availSize[sizeProperty] - knobSize[sizeProperty];
      this.__knobSize = knobSize[sizeProperty];

      // Update knob position (sliding space must be updated first)
      this._updateKnobPosition();
    },






    /*
    ---------------------------------------------------------------------------
      UTILS
    ---------------------------------------------------------------------------
    */

    /** {Boolean} Whether the slider is layouted horizontally */
    __isHorizontal : false,


    /** {Integer} Available space for knob to slide on, computed on resize of the widget */
    __slidingSpace : 0,


    /**
     * Computes the value where the tracking should end depending on
     * the current mouse position.
     *
     * @param e {qx.event.type.Mouse} Incoming mouse event
     * @return {void}
     */
    __computeTrackingEnd : function(e)
    {
      var isHorizontal = this.__isHorizontal;
      var cursorLocation = isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();
      var sliderLocation = this.__sliderLocation;
      var knobLocation = this.__knobLocation;
      var knobSize = this.__knobSize;

      // Compute relative position
      var position = cursorLocation - sliderLocation;
      if (cursorLocation >= knobLocation) {
        position -= knobSize;
      }

      // Compute stop value
      var value = this._positionToValue(position);

      var min = this.getMinimum();
      var max = this.getMaximum();

      if (value < min) {
        value = min;
      } else if (value > max) {
        value = max;
      } else {
        var old = this.getValue();
        var step = this.getPageStep();
        var method = this.__trackingDirection < 0 ? "floor" : "ceil";

        // Fix to page step
        value = old + (Math[method]((value - old) / step) * step);
      }

      // Store value when undefined, otherwise only when it follows the
      // current direction e.g. goes up or down
      if (this.__trackingEnd == null || (this.__trackingDirection == -1 && value <= this.__trackingEnd) || (this.__trackingDirection == 1 && value >= this.__trackingEnd)) {
        this.__trackingEnd = value;
      }
    },


    /**
     * Converts the given position to a value.
     *
     * Does not respect single or page step.
     *
     * @param position {Integer} Position to use
     * @return {Integer} Resulting value (rounded)
     */
    _positionToValue : function(position)
    {
      // Reading available space
      var avail = this.__slidingSpace;

      // Protect undefined value (before initial resize) and division by zero
      if (avail == null || avail == 0) {
        return 0;
      }

      // Compute and limit percent
      var percent = position / avail;
      if (percent < 0) {
        percent = 0;
      } else if (percent > 1) {
        percent = 1;
      }

      // Compute range
      var range = this.getMaximum() - this.getMinimum();

      // Compute value
      return this.getMinimum() + Math.round(range * percent);
    },


    /**
     * Converts the given value to a position to place
     * the knob to.
     *
     * @param value {Integer} Value to use
     * @return {Integer} Computed position (rounded)
     */
    _valueToPosition : function(value)
    {
      // Reading available space
      var avail = this.__slidingSpace;
      if (avail == null) {
        return 0;
      }

      // Computing range
      var range = this.getMaximum() - this.getMinimum();

      // Protect division by zero
      if (range == 0) {
        return 0;
      }

      // Translating value to distance from minimum
      var value = value - this.getMinimum();

      // Compute and limit percent
      var percent = value / range;
      if (percent < 0) {
        percent = 0;
      } else if (percent > 1) {
        percent = 1;
      }

      // Compute position from available space and percent
      return Math.round(avail * percent);
    },


    /**
     * Updates the knob position following the currently configured
     * value. Useful on reflows where the dimensions of the slider
     * itself have been modified.
     *
     * @return {void}
     */
    _updateKnobPosition : function() {
      this._setKnobPosition(this._valueToPosition(this.getValue()));
    },


    /**
     * Moves the knob to the given position.
     *
     * @param position {Integer} Any valid posititon (needs to be
     *   greater or equal than zero)
     * @return {void}
     */
    _setKnobPosition : function(position)
    {
      // Use DOM Element
      var container = this._getChildControl("knob").getContainerElement();
      if (this.__isHorizontal) {
        container.setStyle("left", position+"px", true);
      } else {
        container.setStyle("top", position+"px", true);
      }

      // Alternative: Use layout system
      // Not used because especially in IE7/Firefox2 the
      // direct element manipulation is a lot faster

      /*
      if (this.__isHorizontal) {
        this._getChildControl("knob").setLayoutProperties({left:position});
      } else {
        this._getChildControl("knob").setLayoutProperties({top:position});
      }
      */
    },


    /**
     * Reconfigures the size of the knob depending on
     * the optionally defined {@link #knobFactor}.
     *
     * @return {void}
     */
    _updateKnobSize : function()
    {
      // Compute knob size
      var knobFactor = this.getKnobFactor();
      if (knobFactor == null) {
        return;
      }

      // Ignore when not rendered yet
      var avail = this.getInnerSize();
      if (avail == null) {
        return;
      }

      // Read size property
      if (this.__isHorizontal) {
        this._getChildControl("knob").setWidth(Math.round(knobFactor * avail.width));
      } else {
        this._getChildControl("knob").setHeight(Math.round(knobFactor * avail.height));
      }
    },





    /*
    ---------------------------------------------------------------------------
      SLIDE METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Slides backward to the minimum value
     *
     * @return {void}
     */
    slideToBegin : function() {
      this.slideTo(this.getMinimum());
    },


    /**
     * Slides forward to the maximum value
     *
     * @return {void}
     */
    slideToEnd : function() {
      this.slideTo(this.getMaximum());
    },


    /**
     * Slides forward (right or bottom depending on orientation)
     *
     * @return {void}
     */
    slideForward : function() {
      this.slideBy(this.getSingleStep());
    },


    /**
     * Slides backward (to left or top depending on orientation)
     *
     * @return {void}
     */
    slideBack : function() {
      this.slideBy(-this.getSingleStep());
    },


    /**
     * Slides a page forward (to right or bottom depending on orientation)
     *
     * @return {void}
     */
    slidePageForward : function() {
      this.slideBy(this.getPageStep());
    },


    /**
     * Slides a page backward (to left or top depending on orientation)
     *
     * @return {void}
     */
    slidePageBack : function() {
      this.slideBy(-this.getPageStep());
    },


    /**
     * Slides by the given offset.
     *
     * This method works with the value, not with the coordinate.
     *
     * @param offset {Integer} Offset to scroll by
     * @return {void}
     */
    slideBy : function(offset) {
      this.slideTo(this.getValue() + offset);
    },


    /**
     * Slides to the given value
     *
     * This method works with the value, not with the coordinate.
     *
     * @param value {Integer} Scroll to a value between the defined
     *   minimum and maximum.
     * @return {void}
     */
    slideTo : function(value)
    {
      // Bring into allowed range or fix to single step grid
      if (value < this.getMinimum()) {
        value = this.getMinimum();
      } else if (value > this.getMaximum()) {
        value = this.getMaximum();
      } else {
        value = this.getMinimum() + Math.round((value - this.getMinimum()) / this.getSingleStep()) * this.getSingleStep()
      }

      // Sync with property
      this.setValue(value);
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyOrientation : function(value, old)
    {
      var knob = this._getChildControl("knob");

      // Update private flag for faster access
      this.__isHorizontal = value === "horizontal";

      // Toggle states and knob layout
      if (this.__isHorizontal)
      {
        this.removeState("vertical");
        knob.removeState("vertical");

        this.addState("horizontal");
        knob.addState("horizontal");

        knob.setLayoutProperties({top:0, right:null, bottom:0});
      }
      else
      {
        this.removeState("horizontal");
        knob.removeState("horizontal");

        this.addState("vertical");
        knob.addState("vertical");

        knob.setLayoutProperties({right:0, bottom:null, left:0});
      }

      // Sync knob position
      this._updateKnobPosition();
    },


    // property apply
    _applyKnobFactor : function(value, old)
    {
      if (value != null)
      {
        this._updateKnobSize();
      }
      else
      {
        if (this.__isHorizontal) {
          this._getChildControl("knob").resetWidth();
        } else {
          this._getChildControl("knob").resetHeight();
        }
      }
    },


    // property apply
    _applyValue : function(value, old) {
      this._updateKnobPosition();
    },


    // property apply
    _applyMinimum : function(value, old)
    {
      if (this.getValue() < value) {
        this.setValue(value);
      }

      this._updateKnobPosition();
    },


    // property apply
    _applyMaximum : function(value, old)
    {
      if (this.getValue() > value) {
        this.setValue(value);
      }

      this._updateKnobPosition();
    }
  }
});
