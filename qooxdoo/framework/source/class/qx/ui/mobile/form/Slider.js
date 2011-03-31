/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * The Slider widget provides horizontal slider.
 *
 * The Slider is the classic widget for controlling a bounded value.
 * It lets the user move a slider handle along a horizontal
 * groove and translates the handle's position into an integer value
 * within the defined range.
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
     var slider= new qx.ui.mobile.form.Slider().set({
        minimum : 0,
        maximum : 10,
        step : 2
      });
      slider.addListener("changeValue", handler, this);
 *
 *   this.getRoot.add(slider);
 * </pre>
 *
 * This example creates a slider and attaches an
 * event listener to the {@link #changeValue} event.
 */
qx.Class.define("qx.ui.mobile.form.Slider",
{
  extend : qx.ui.mobile.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this._registerEventListener();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "slider"
    },


    /**
     * The current slider value.
     *
     * Strictly validates according to {@link #minimum} and {@link #maximum}.
     */
    value :
    {
      check : "Integer",
      init : 0,
      apply : "_updateKnobPosition",
      event : "changeValue"
    },


    /**
     * The minimum slider value (may be negative). This value must be smaller
     * than {@link #maximum}.
     */
    minimum :
    {
      check : "Integer",
      init : 0,
      apply : "_updateKnobPosition"
    },


    /**
     * The maximum slider value (may be negative). This value must be larger
     * than {@link #minimum}.
     */
    maximum :
    {
      check : "Integer",
      init : 100,
      apply : "_updateKnobPosition"
    },


    /**
     * The amount to increment on each event. Typically corresponds
     * to the user moving the knob.
     */
    step :
    {
      check : "Integer",
      init : 1
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _isMovingKnob : false,
    _knobElement : null,
    _knobWidth : null,
    _containerElementWidth : null,
    _containerElementLeft : null,


    /**
     * Increments the current value.
     */
    nextValue : function() {
       this.setValue(this.getValue() + this.getStep());
    },


    /**
     * Decrements the current value.
     */
    previousValue : function() {
       this.setValue(this.getValue() - this.getStep());
    },


    // overridden
    _createContainerElement : function()
    {
      var container = this.base(arguments);
      container.appendChild(this._createKnobElement());
      return container;
    },


    /**
     * Creates the knob element.
     *
     * @return {Element} The created knob element
     */
    _createKnobElement : function()
    {
      return qx.bom.Element.create("div");
    },


    /**
     * Registers all needed event listener.
     */
    _registerEventListener : function()
    {
      this.addListener("touchstart", this._onTouchStart, this);
      this.addListener("touchmove", this._onTouchMove, this);
      qx.bom.Element.addListener(this._getKnobElement(), "touchstart", this._onTouchStart, this);
    },


    /**
     * Unregisters all needed event listener.
     */
    _unregisterEventListener : function()
    {
      this.removeListener("touchstart", this._onTouchStart, this);
      this.removeListener("touchmove", this._onTouchMove, this);
      qx.bom.Element.removeListener(this._getKnobElement(), "touchstart", this._onTouchStart, this);
    },


    /**
     * Event handler. Called when the touch start event occurs.
     *
     * @param evt {qx.event.type.Touch} The touch event
     */
    _onTouchStart: function(evt)
    {
      this._isMovingKnob = false;
      this._lastPosition = 0;
      if (!evt.isMultiTouch())
      {
        var knobElement = this._getKnobElement();
        var containerElement = this.getContainerElement();
        this._containerElementWidth = qx.bom.element.Dimension.getWidth(containerElement);
        this._containerElementLeft = qx.bom.element.Location.getLeft(containerElement);
        this._knobWidth = qx.bom.element.Dimension.getWidth(knobElement);

        var position = this._lastPosition =  this._getPosition(evt.getDocumentLeft());

        if (evt.getTarget() == knobElement)
        {
          this._isMovingKnob = true;
          evt.stopPropagation();
        } else {
          this.setValue(this._positionToValue(position));
        }
      }
    },


    /**
     * Event handler. Called when the touch move event occurs.
     *
     * @param evt {qx.event.type.Touch} The touch event
     */
    _onTouchMove : function(evt)
    {
      if (this._isMovingKnob)
      {
        var position = this._getPosition(evt.getDocumentLeft());
        var pixelPerStep = this._pixelPerStep(this._containerElementWidth);
        // Optimize Performance - only update the position when needed
        if (Math.abs(this._lastPosition - position) > pixelPerStep/2)
        {
          this._lastPosition = position;
          this.setValue(this._positionToValue(position));
        }
        evt.stopPropagation();
        evt.preventDefault();
      }
    },


    /**
     * Returns the current position of the knob.
     *
     * @param documentLeft {Integer} The left positon of the knob
     * @return {Integer} The current position of the container elemnt.
     */
    _getPosition : function(documentLeft)
    {
      return documentLeft - this._containerElementLeft;
    },


    /**
     * Returns the knob DOM element.
     *
     * @return {Element} The knob DOM element.
     */
    _getKnobElement : function()
    {
      if (!this._knobElement) {
        var element = this.getContainerElement();
        if (element) {
          this._knobElement = element.childNodes[0];
        }
      }
      return this._knobElement;
    },


    /**
     * Updates the knob position based on the current value.
     */
    _updateKnobPosition : function()
    {
      this._setKnobPosition(this._valueToPercent(this.getValue()));
    },


    /**
     * Sets the knob positon based on the give percent value.
     *
     * @param percent {Float} The knob position
     */
    _setKnobPosition : function(percent)
    {
      var knobElement = this._getKnobElement();
      if (knobElement)
      {
        var width = this._containerElementWidth;
        var position = this._percentToPosition(width, percent);

        var marginLeft = this._knobWidth/2;
        if (position > width - this._knobWidth) {
          marginLeft = this._knobWidth;
        } else if (position < this._knobWidth) {
          marginLeft = 0;
        }

        qx.bom.element.Style.set(knobElement, "left", percent + "%");
        qx.bom.element.Style.set(knobElement, "margin-left", "-" + marginLeft + "px");
      }
    },


    /**
     * Converts the given value to percent.
     *
     * @param value {Integer} The value to convert
     * @return {Integer} The value in percent
     */
    _valueToPercent : function(value)
    {
      var min = this.getMinimum();
      var value = this._limitValue(value);
      return ((value - min) * 100) / this._getRange();
    },


    /**
     * Converts the given position to the corresponding value.
     *
     * @param position {Integer} The position to convert
     * @return {Integer} The converted value
     */
    _positionToValue : function(position)
    {
      var width = this._containerElementWidth;

      // Fix the position so that it is easier to set the last value
      // Plus a bugfix: Seems like you can not hit the last pixel of the slider
      // div in the browser
      var pixelPerStep = this._pixelPerStep(width);
      if (position <= 4) {
        return this.getMinimum();
      } else if (position >= width - 4) {
        return this.getMaximum();
      }
      var value = this.getMinimum() + (Math.round(position / pixelPerStep) * this.getStep());
      return this._limitValue(value);
    },


    /**
     * Converts the given percent to the position of the knob.
     *
     * @param width {Integer} The width of the slider container element
     * @param percent {Integer} The percent to convert
     * @return {Integer} The position of the knob
     */
    _percentToPosition : function(width, percent)
    {
      return width * (percent / 100);
    },


    /**
     * Limits a value to the set {@link #minimum} and {@link #maximum} properties.
     *
     * @param value {Integer} The value to limit
     * @return {Integer} The limited value
     */
    _limitValue : function(value)
    {
      value = Math.min(value, this.getMaximum());
      value = Math.max(value, this.getMinimum());
      return value;
    },


    /**
     * Return the number of pixels per step.
     *
     * @param width {Integer} The width of the slider container element
     * @return {Integer} The pixels per step
     */
    _pixelPerStep : function(width)
    {
      return width / this._getOverallSteps();
    },


    /**
     * Return the overall number of steps.
     *
     * @return {Integer} The number of steps
     */
    _getOverallSteps : function()
    {
      return (this._getRange() / this.getStep());
    },


    /**
     * Return the range between {@link #maximum} and {@link #minimum}.
     *
     * @return {Integer} The range between {@link #maximum} and {@link #minimum}
     */
    _getRange : function()
    {
      return this.getMaximum() - this.getMinimum();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._knobElement = null;
    this._unregisterEventListener();
  }
});