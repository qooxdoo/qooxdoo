/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
 *
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


  construct : function()
  {
    this.base(arguments);
    this._registerEventListener();
    this._refresh();

    this.addCssClass("gap");
  },


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
      check : "Number",
      init : 0,
      apply : "_refresh",
      event : "changeMinimum"
    },


    /**
     * The maximum slider value (may be negative). This value must be larger
     * than {@link #minimum}.
     */
    maximum :
    {
      check : "Number",
      init : 100,
      apply : "_refresh",
      event : "changeMaximum"
    },


    /**
     * The amount to increment on each event. Typically corresponds
     * to the user moving the knob.
     */
    step :
    {
      check : "Number",
      init : 1,
      event : "changeStep"
    },


    /**
     * Reverses the display direction of the slider knob. If true, the maxmium of
     * the slider is on the left side and minimum on the right side.
     */
    reverseDirection :
    {
      check : "Boolean",
      init : false,
      apply : "_refresh"
    },


    /**
     * Adjusts which slider value should be displayed inside the knob.
     * If <code>null</code> no value will be displayed.
     */
    displayValue :
    {
      init : "percent",
      check : [ "value", "percent" ],
      nullable : true,
      apply : "_applyDisplayValue"
    }
  },


  members :
  {
    _knobElement : null,
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
      this.addListener("pointerdown", this._onPointerDown, this);
      this.addListener("track", this._onTrack, this);
      this.addListener("appear", this._refresh, this);

      qx.event.Registration.addListener(window, "resize", this._refresh, this);
      qx.event.Registration.addListener(window, "orientationchange", this._refresh, this);
      this.addListenerOnce("domupdated", this._refresh, this);
    },


    /**
     * Unregisters all needed event listener.
     */
    _unregisterEventListener : function()
    {
      this.removeListener("pointerdown", this._onPointerDown, this);
      this.removeListener("track", this._onTrack, this);
      this.removeListener("appear", this._refresh, this);

      qx.event.Registration.removeListener(window, "resize", this._refresh, this);
      qx.event.Registration.removeListener(window, "orientationchange", this._refresh, this);
      this.removeListener("domupdated", this._refresh, this);
    },


    /**
     * Refreshes the slider and the knob position.
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
      var containerElement = this.getContainerElement();
      if(containerElement) {
        this._containerElementWidth = qx.bom.element.Dimension.getWidth(containerElement);
        this._containerElementLeft = qx.bom.element.Location.getLeft(containerElement);
        this._pixelPerStep = this._getPixelPerStep(this._containerElementWidth);
      }
    },


    /**
     * Event handler. Called when the <code>pointerdown</code> event occurs.
     *
     * @param evt {qx.event.type.Pointer} The pointer event.
     */
    _onPointerDown: function(evt)
    {
      if (evt.isPrimary())
      {
        this._updateSizes();
        var position = this._getPosition(evt.getDocumentLeft());
        this.setValue(this._positionToValue(position));

        evt.stopPropagation();
      }
    },


    /**
     * Event handler. Called when the <code>track</code> event occurs.
     *
     * @param evt {qx.event.type.Track} The track event.
     */
    _onTrack : function(evt)
    {
      var position = this._getPosition(evt.getDocumentLeft());
      this.setValue(this._positionToValue(position));
      evt.stopPropagation();
      evt.preventDefault();
    },


    /**
     * Returns the current position of the knob.
     *
     * @param documentLeft {Integer} The left position of the knob
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
      qx.bom.AnimationFrame.request(this._refresh, this);
    },

    /**
     * Gets the value [true/false] of this slider.
     * It is called by getValue method of qx.ui.mobile.form.MValue mixin
     * @return {Integer} the value of the slider
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

      var width = this._containerElementWidth;
      var position = Math.floor(this._percentToPosition(width, percent));

      var knobElement = this._getKnobElement();
      if (knobElement) {
        qx.bom.element.Style.set(this._getKnobElement(), "width", width - (width - position) + "px");
        qx.bom.element.Attribute.set(this._getKnobElement(), "data-value", this.getValue());
        qx.bom.element.Attribute.set(this._getKnobElement(), "data-percent", Math.floor(percent));
      }
    },


    // Property apply
    _applyDisplayValue : function(value, old ) {
      if(old != null) {
        this.removeCssClass(old);
      }
      if(value != null) {
        this.addCssClass(value);
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

      var percent = ((value - min) * 100) / this._getRange();

      if (this.isReverseDirection()) {
        return 100 - percent;
      } else {
        return percent;
      }
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
      value = this._limitValue(value);
      if(this.isReverseDirection()) {
        var center = this.getMinimum() + this._getRange()/2;
        var dist = center-value;
        value = center + dist;
      }

      return value;
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


  destruct : function()
  {
    this._knobElement = null;
    this._unregisterEventListener();
  }
});
