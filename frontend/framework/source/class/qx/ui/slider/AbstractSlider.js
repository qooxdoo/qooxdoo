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

/* ************************************************************************

#use(qx.event.handler.DragDrop)

************************************************************************ */

/**
 */
qx.Class.define("qx.ui.slider.AbstractSlider",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(orientation)
  {
    this.base(arguments);

    // Force canvas layout
    this._setLayout(new qx.ui.layout.Canvas());

    // Add user events
    this.addListener("mousedown", this._onMouseDown, this);
    this.addListener("mouseup", this._onMouseUp, this);
    this.addListener("losecapture", this._onMouseUp, this);
    this.addListener("mousewheel", this._onMouseWheel, this);

    // Create knob
    this._knob = new qx.ui.core.Widget();
    this._knob.setAppearance("slider-knob");
    this._add(this._knob);

    // Initialize orientation
    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

    // Resize handling
    this.addListener("resize", this._onResize, this);
    this._knob.addListener("resize", this._onResize, this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Whether the slider is horizontal or vertical. */
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_applyOrientation"
    },


    /** The current slider value */
    value :
    {
      check : "Integer",
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
     * The maximum slider value. This value must be larger than {@link #minimum}.
     */
    maximum :
    {
      check : "Integer",
      init : 100,
      apply : "_applyMaximum"
    },


    /** The amount to increment on each event. Typically corresponds to the user pressing an arrow key. */
    singleStep :
    {
      check : "Integer",
      init : 1
    },


    /** The amount to increment on each event. Typically corresponds to the user pressing PageUp or PageDown. */
    pageStep :
    {
      check : "Integer",
      init : 10
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __availSlidingSpace : 0,


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    _onMouseDown : function(e)
    {
      var isHorizontal = this.getOrientation() === "horizontal";
      var knob = this._knob;
      var knobLocation = qx.bom.element.Location.get(knob.getContainerElement().getDomElement());

      if (e.getTarget() === knob)
      {
        var sliderLocation = qx.bom.element.Location.get(this.getContainerElement().getDomElement());

        if (isHorizontal) {
          this.__dragOffset = sliderLocation.left + (e.getDocumentLeft() - knobLocation.left);
        } else {
          this.__dragOffset = sliderLocation.top + (e.getDocumentTop() - knobLocation.top);
        }

        // Switch into drag mode
        this.__dragMode = true;

        // Register move listener and activate capturing
        this.addListener("mousemove", this._onKnobMove);
        this.capture();
      }
      else
      {
        // Switch into tracking mode
        this.__trackingMode = true;

        // Detect tracking direction
        if (isHorizontal) {
          this.__trackingDirection = e.getDocumentLeft() <= knobLocation.left ? -1 : 1;
        } else {
          this.__trackingDirection = e.getDocumentTop() <= knobLocation.top ? -1 : 1;
        }

        // Initialize timer
        if (!this.__timer)
        {
          this.__timer = new qx.event.Timer(100);
          this.__timer.addListener("interval", this._onInterval, this);
        }

        // Start timer and activate capturing
        this.__timer.start();
        this.capture();
      }
    },


    _onMouseUp : function(e)
    {
      if (this.__dragMode)
      {
        this.removeListener("mousemove", this._onKnobMove);
        this.releaseCapture();

        delete this.__dragMode;
      }
      else if (this.__trackingMode)
      {
        this.__timer.stop();
        this.releaseCapture();

        delete this.__trackingMode;
        delete this.__trackingDirection;
      }
    },


    _onInterval : function(e)
    {
      var value = this.getValue() + (this.__trackingDirection * this.getPageStep())

      if (value < this.getMinimum()) {
        value = this.getMinimum();
      } else if (value > this.getMaximum()) {
        value = this.getMaximum();
      }

      this.scrollTo(value);
    },


    _onKnobMove : function(e)
    {
      var isHorizontal = this.getOrientation() === "horizontal";
      var dragStop = isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();
      var position = dragStop - this.__dragOffset;

      this.scrollTo(this._positionToValue(position));
    },


    _onMouseWheel : function(e)
    {
      this.scrollBy(e.getWheelDelta() * this.getSingleStep());
      e.stopPropagation();
    },


    _onResize : function(e)
    {
      var availSize = this.getComputedInnerSize();
      var knobSize = this._knob.getBounds();

      if (this.getOrientation() === "horizontal") {
        this.__availSlidingSpace = availSize.width - knobSize.width;
      } else {
        this.__availSlidingSpace = availSize.height - knobSize.height;
      }

      this._updateSliderPosition();
    },





    /*
    ---------------------------------------------------------------------------
      UTILS
    ---------------------------------------------------------------------------
    */

    _positionToValue : function(position)
    {
      var avail = this.__availSlidingSpace;

      // Protect division by zero
      if (avail == 0) {
        return 0;
      }

      // Compute and limit percent
      var percent = position / avail;
      if (percent < 0) {
        percent = 0;
      } else if (percent > 1) {
        percent = 1;
      }

      // Compute value from range and percent
      var range = Math.abs(this.getMaximum() - this.getMinimum());
      var value = this.getMinimum() + Math.round(range * percent);

      return value;
    },


    _valueToPosition : function(value)
    {
      // Correcting value
      value = value + Math.abs(this.getMinimum());

      // Computing range
      var range = Math.abs(this.getMaximum() - this.getMinimum());

      // Protect division by zero
      if (range == 0) {
        return 0;
      }

      // Compute and limit percent
      var percent = value / range;
      if (percent < 0) {
        percent = 0;
      } else if (percent > 1) {
        percent = 1;
      }

      // Compute position from available space and percent
      var position = Math.round(this.__availSlidingSpace * percent);

      return position;
    },


    _updateSliderPosition : function()
    {
      var position = this._valueToPosition(this.getValue());

      if (this.getOrientation() === "horizontal") {
        var props = {left:position};
      } else {
        var props = {top:position};
      }

      this._knob.setLayoutProperties(props);
    },





    /*
    ---------------------------------------------------------------------------
      SCROLL METHODS
    ---------------------------------------------------------------------------
    */

    scrollForward : function() {
      this.scrollBy(this.getSingleStep());
    },

    scrollBack : function() {
      this.scrollBy(-this.getSingleStep());
    },

    scrollPageForward : function() {
      this.scrollBy(this.getPageStep());
    },

    scrollPageBack : function() {
      this.scrollBy(-this.getPageStep());
    },

    scrollBy : function(offset) {
      this.scrollTo(this.getValue() + offset);
    },

    scrollTo : function(value)
    {
      if (value < this.getMinimum()) {
        value = this.getMinimum();
      } else if (value > this.getMaximum()) {
        value = this.getMaximum();
      }

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
      var isHorizontal = value === "horizontal";
      var knob = this._knob;

      this.setAllowStretchX(isHorizontal);
      this.setAllowStretchY(!isHorizontal);

      if (isHorizontal)
      {
        this.removeState("vertical");
        knob.removeState("vertical");

        this.addState("horizontal");
        knob.addState("horizontal");
      }
      else
      {
        this.removeState("horizontal");
        knob.removeState("horizontal");

        this.addState("vertical");
        knob.addState("vertical");
      }

      if (isHorizontal) {
        knob.setLayoutProperties({top:0, right:null, bottom:0});
      } else {
        knob.setLayoutProperties({right:0, bottom:null, left:0});
      }

      this._updateSliderPosition();
    },


    // property apply
    _applyValue : function(value, old) {
      this._updateSliderPosition();
    },


    // property apply
    _applyMinimum : function(value, old) {
      this._updateSliderPosition();
    },


    // property apply
    _applyMaximum : function(value, old) {
      this._updateSliderPosition();
    }
  }
});
