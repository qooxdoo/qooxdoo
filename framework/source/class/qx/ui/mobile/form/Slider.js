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
 *    var slider= new qx.ui.mobile.form.Slider().set({
 *       minimum : 0,
 *       maximum : 10,
 *       step : 2
 *     });
 *     slider.addListener("changeValue", handler, this);
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
  include : [
    qx.ui.mobile.form.MValue,
    qx.ui.form.MForm,
    qx.ui.form.MModelProperty,
    qx.ui.mobile.form.MState
  ],
  implement : [
    qx.ui.form.IForm,
    qx.ui.form.IModel,
    qx.ui.form.INumberForm
  ],

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
     * The minimum slider value (may be negative). This value must be smaller
     * than {@link #maximum}.
     */
    minimum :
    {
      check : "Integer",
      init : 0,
      apply : "_updateKnobPosition",
      event : "changeMinimum"
    },


    /**
     * The maximum slider value (may be negative). This value must be larger
     * than {@link #minimum}.
     */
    maximum :
    {
      check : "Integer",
      init : 100,
      apply : "_updateKnobPosition",
      event : "changeMaximum"
    },


    /**
     * The amount to increment on each event. Typically corresponds
     * to the user moving the knob.
     */
    step :
    {
      check : "Integer",
      init : 1,
      event : "changeStep"
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
    _pixelPerStep : null,
    __value: 0,


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
      return qx.dom.Element.create("div");
    },


    /**
     * Registers all needed event listener.
     */
    _registerEventListener : function()
    {
      this.addListener("touchstart", this._onTouchStart, this);
      this.addListener("touchmove", this._onTouchMove, this);
      qx.bom.Element.addListener(this._getKnobElement(), "touchstart", this._onTouchStart, this);
      qx.bom.Element.addListener(this._getKnobElement(), "transitionEnd", this._onTransitionEnd, this);
      qx.event.Registration.addListener(window, "resize", this._refresh, this);
      this.addListenerOnce("domupdated", this._refresh, this);
    },


    /**
     * Unregisters all needed event listener.
     */
    _unregisterEventListener : function()
    {
      this.removeListener("touchstart", this._onTouchStart, this);
      this.removeListener("touchmove", this._onTouchMove, this);
      qx.bom.Element.removeListener(this._getKnobElement(), "touchstart", this._onTouchStart, this);
      qx.bom.Element.removeListener(this._getKnobElement(), "transitionEnd", this._onTransitionEnd, this);
      qx.event.Registration.removeListener(window, "resize", this._refresh, this);
      this.removeListener("domupdated", this._refresh, this);
    },


    /**
     * Refreshs the slider.
     */
    _refresh : function()
    {
      this._updateSizes();
      this._updateKnobPosition();
    },


    /**
     * Updates all internal sizes of the slider.
     */
    _updateSizes : function()
    {
      var knobElement = this._getKnobElement();
      var containerElement = this.getContainerElement();
      this._containerElementWidth = qx.bom.element.Dimension.getWidth(containerElement);
      this._containerElementLeft = qx.bom.element.Location.getLeft(containerElement);
      this._knobWidth = qx.bom.element.Dimension.getWidth(knobElement);
      this._pixelPerStep = this._getPixelPerStep(this._containerElementWidth);
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
        this._updateSizes();
        var position = this._lastPosition =  this._getPosition(evt.getDocumentLeft());

        var knobElement = this._getKnobElement();
        if (evt.getTarget() == knobElement)
        {
          this._isMovingKnob = true;
          evt.stopPropagation();
        } else {
          var element = this.getContainerElement();
          qx.bom.element.Style.set(knobElement, "-webkit-transition", "left .15s, margin-left .15s");
          qx.bom.element.Style.set(element, "-webkit-transition", "background-position .15s");
          this.setValue(this._positionToValue(position));
        }
      }
    },


    /**
     * Event handler. Called when the transition end event occurs.
     *
     * @param evt {qx.event.type.Event} The causing event
     */
    _onTransitionEnd : function(evt)
    {
      var knobElement = this._getKnobElement();
      qx.bom.element.Style.set(knobElement, "-webkit-transition", null);

      var element = this.getContainerElement();
      qx.bom.element.Style.set(element, "-webkit-transition", null);
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
        // Optimize Performance - only update the position when needed
        if (Math.abs(this._lastPosition - position) > this._pixelPerStep /2)
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
     * @return {Integer} The current position of the container element.
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
     * Sets the value of this slider.
     * It is called by setValue method of qx.ui.mobile.form.MValue mixin
     * @param value {Integer} the new value of the slider
     */
    _setValue : function(value)
    {
      this.__value = value;
      this._updateKnobPosition();
    },

    /**
     * Gets the value [true/false] of this slider.
     * It is called by getValue method of qx.ui.mobile.form.MValue mixin
     * @return value {Integer} the value of the slider
     */
    _getValue : function() {
      return this.__value;
    },

    /**
     * Updates the knob position based on the current value.
     */
    _updateKnobPosition : function()
    {
      var percent = this._valueToPercent(this.getValue());
      this._setKnobPosition(percent);
      this._setProgressIndicatorPosition(percent);
    },


    /**
     * Sets the indicator positon based on the give percent value.
     *
     * @param percent {Float} The knob position
     */
    _setProgressIndicatorPosition : function(percent)
    {
      var width = this._containerElementWidth;
      // Center the indicator to the knob element
      var position = this._percentToPosition(width, percent) + (this._knobWidth / 2);
      var element = this.getContainerElement();

      // Fix the indicator position, corresponding to the knob position
      var marginLeft = this._knobWidth * (percent / 100);
      var backgroundPositionValue = (position - marginLeft) + 'px 0px, 0px 0px';
      qx.bom.element.Style.set(element, "backgroundPosition", backgroundPositionValue);
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
        qx.bom.element.Style.set(knobElement, "left", percent + "%");
        // Fix knob position, so that it can't be moved over the slider area
        var knobWidth = this._knobWidth || qx.bom.element.Dimension.getWidth(knobElement);
        var marginLeft = knobWidth * (percent / 100);
        qx.bom.element.Style.set(knobElement, "marginLeft", "-" + marginLeft + "px");
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
      var value = this.getMinimum() + (Math.round(position / this._pixelPerStep) * this.getStep());
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
    _getPixelPerStep : function(width)
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