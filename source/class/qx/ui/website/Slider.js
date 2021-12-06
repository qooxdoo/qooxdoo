/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * The Slider control is used to select a numerical value from a given range.
 * It supports custom minimum/maximum values, step sizes and offsets (which limit
 * the knob's range).
 *
 * <h2>Markup</h2>
 * The Slider contains a single button element (the knob), which will be
 * created if it's not already present.
 *
 * <h2>CSS Classes</h2>
 * <table>
 *   <thead>
 *     <tr>
 *       <td>Class Name</td>
 *       <td>Applied to</td>
 *       <td>Description</td>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td><code>qx-slider</code></td>
 *       <td>Container element</td>
 *       <td>Identifies the Slider widget</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-slider-knob</code></td>
 *       <td>Slider knob (button)</td>
 *       <td>Identifies and styles the Slider's draggable knob</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * <h2 class="widget-markup">Generated DOM Structure</h2>
 *
 * @require(qx.module.event.Pointer)
 * @require(qx.module.Transform)
 * @require(qx.module.Template)
 * @require(qx.module.util.Type)
 *
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Slider",
{
  extend : qx.ui.website.Widget,

  statics : {
    /**
     * *step*
     *
     * The steps can be either a number or an array of predefined steps. In the
     * case of a number, it defines the amount of each step. In the case of an
     * array, the values of the array will be used as step values.
     *
     * Default value: <pre>1</pre>
     *
     *
     * *minimum*
     *
     * The minimum value of the slider. This will only be used if no explicit
     * steps are given.
     *
     * Default value: <pre>0 </pre>
     *
     *
     * *maximum*
     *
     * The maximum value of the slider. This will only be used if no explicit
     * steps are given.
     *
     * Default value: <pre>100</pre>
     *
     *
     * *offset*
     *
     * The amount of pixel the slider should be position away from its left and
     * right border.
     *
     * Default value: <pre>0 </pre>
     */
    _config : {
      minimum : 0,
      maximum : 100,
      offset : 0,
      step : 1
    },


    /**
     * *knobContent*
     *
     * The content of the knob element.
     *
     * Default value: <pre>{{value}}</pre>
     */
    _templates : {
      knobContent : "{{value}}"
    },


    /**
     * Factory method which converts the current collection into a collection of
     * slider widgets.
     *
     * @param value {Number?} The initial value of each slider widget
     * @param step {Number|Array?} The step config value to configure the step
     * width or the steps as array of numbers.
     * @return {qx.ui.website.Slider} A new Slider collection.
     * @attach {qxWeb}
     */
    slider : function(value, step) {
      var slider = new qx.ui.website.Slider(this);
      slider.init();
      if (typeof step !== "undefined") {
        slider.setConfig("step", step);
      }
      if (typeof value !== "undefined") {
        slider.setValue(value);
      } else {
        slider.setValue(slider.getConfig("minimum"));
      }

      return slider;
    }
  },

  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },

  events :
  {
    /** Fired at each value change */
    "changeValue" : "Number",

    /** Fired with each pointer move event */
    "changePosition" : "Number"
  },


  members :
  {
    __dragMode : null,
    _value : 0,

    init : function() {
      if (!this.base(arguments)) {
        return false;
      }

      var cssPrefix = this.getCssPrefix();

      if (!this.getValue()) {
        var step = this.getConfig("step");
        var defaultVal= qxWeb.type.get(step) == "Array" ? step[0] : this.getConfig("minimum");
        this._value = defaultVal;
      }

      this.on("pointerup", this._onSliderPointerUp, this)
      .on("focus", this._onSliderFocus, this)
      .setStyle("touch-action", "pan-y");
      qxWeb(document).on("pointerup", this._onDocPointerUp, this);
      qxWeb(window).on("resize", this._onWindowResize, this);

      if (this.getChildren("." + cssPrefix + "-knob").length === 0) {
        this.append(qx.ui.website.Widget.create("<button>")
        .addClass(cssPrefix + "-knob"));
      }

      this.getChildren("." + cssPrefix + "-knob")
      .setAttributes({
        "draggable": "false",
        "unselectable": "true"
      })
      .setHtml(this._getKnobContent())
      .on("pointerdown", this._onPointerDown, this)
      .on("dragstart", this._onDragStart, this)
      .on("focus", this._onKnobFocus, this)
      .on("blur", this._onKnobBlur, this);
      this.render();

      return true;
    },


    /**
     * Returns the current value of the slider
     *
     * @return {Integer} slider value
     */
    getValue : function() {
      return this._value;
    },

    /**
     * Sets the current value of the slider.
     *
     * @param value {Integer} new value of the slider
     *
     * @return {qx.ui.website.Slider} The collection for chaining
     */
    setValue : function(value)
    {
      if (qxWeb.type.get(value) != "Number") {
        throw Error("Please provide a Number value for 'value'!");
      }

      var step = this.getConfig("step");
      if (qxWeb.type.get(step) != "Array") {
        var min = this.getConfig("minimum");
        var max = this.getConfig("maximum");
        if (value < min) {
          value = min;
        }
        if (value > max) {
          value = max;
        }
        if (qxWeb.type.get(step) == "Number") {
          value = Math.round(value / step) * step;
        }
      }

      this._value = value;

      if (qxWeb.type.get(step) != "Array" || step.indexOf(value) != -1) {
        this.__valueToPosition(value);
        this.getChildren("." + this.getCssPrefix() + "-knob")
          .setHtml(this._getKnobContent());
        this.emit("changeValue", value);
      }

      return this;
    },


    render : function() {
      var step = this.getConfig("step");
      if (qxWeb.type.get(step) == "Array") {
        this._getPixels();
        if (step.indexOf(this.getValue()) == -1) {
          this.setValue(step[0]);
        } else {
          this.setValue(this.getValue());
        }
      } else if (qxWeb.type.get(step) == "Number") {
        this.setValue(Math.round(this.getValue() / step) * step);
      } else {
        this.setValue(this.getValue());
      }
      this.getChildren("." + this.getCssPrefix() + "-knob")
        .setHtml(this._getKnobContent());

      return this;
    },


    /**
     * Returns the content that should be displayed in the knob
     * @return {String} knob content
     */
    _getKnobContent : function() {
      return qxWeb.template.render(
        this.getTemplate("knobContent"), {value: this.getValue()}
      );
    },


    /**
     * Returns half of the slider knob's width, used for positioning
     * @return {Integer} half knob width
     */
    _getHalfKnobWidth : function() {
      var knobWidth = this.getChildren("." + this.getCssPrefix() + "-knob").getWidth();
      return Math.round(parseFloat(knobWidth / 2));
    },


    /**
     * Returns the boundaries (in pixels) of the slider's range of motion
     * @return {Map} a map with the keys <code>min</code> and <code>max</code>
     */
    _getDragBoundaries : function()
    {
      var paddingLeft = Math.ceil(parseFloat(this.getStyle("paddingLeft")) || 0);
      var paddingRight = Math.ceil(parseFloat(this.getStyle("paddingRight")) || 0);
      var offset = this.getConfig("offset");
      return {
        min : this.getOffset().left + offset + paddingLeft,
        max : this.getOffset().left + this.getWidth() - offset - paddingRight
      };
    },


    /**
     * Creates a lookup table to get the pixel values for each slider step
     * and computes the "breakpoint" between two steps in pixel.
     *
     * @return {Integer[]} list of pixel values
     */
    _getPixels : function()
    {
      var step = this.getConfig("step");
      if (qxWeb.type.get(step) != "Array") {
        return [];
      }

      var dragBoundaries = this._getDragBoundaries();
      var pixel = [];

      // First pixel value is fixed
      pixel.push(dragBoundaries.min);

      var lastIndex = step.length-1;

      var paddingLeft = Math.ceil(parseFloat(this.getStyle("paddingLeft")) || 0);
      var paddingRight = Math.ceil(parseFloat(this.getStyle("paddingRight")) || 0);

      //The width really used by the slider (drag area)
      var usedWidth = this.getWidth() - (this.getConfig("offset") * 2) - paddingLeft - paddingRight;

      //The width of a single slider step
      var stepWidth = usedWidth/(step[lastIndex] - step[0]);

      var stepCount = 0;

      for(var i=1, j=step.length-1; i<j; i++){
        stepCount = step[i] - step[0];
        pixel.push(Math.round(stepCount*stepWidth) + dragBoundaries.min);
      }

      // Last pixel value is fixed
      pixel.push(dragBoundaries.max);

      return pixel;
    },


    /**
    * Returns the nearest existing slider value according to he position of the knob element.
    * @param position {Integer} The current knob position in pixels
    * @return {Integer} The next position to snap to
    */
    _getNearestValue : function(position) {
      var pixels = this._getPixels();
      if (pixels.length === 0) {

        var dragBoundaries = this._getDragBoundaries();
        var availableWidth = dragBoundaries.max - dragBoundaries.min;
        var relativePosition = position - dragBoundaries.min;
        var fraction = relativePosition / availableWidth;
        var min = this.getConfig("minimum");
        var max = this.getConfig("maximum");
        var result = (max - min) * fraction + min;
        if (result < min) {
          result = min;
        }
        if (result > max) {
          result = max;
        }
        var step = this.getConfig("step");
        if (qxWeb.type.get(step) == "Number") {
          result = Math.round(result / step) * step;
        }
        return result;
      }

      var currentIndex = 0, before = 0, after = 0;
      for (var i=0, j=pixels.length; i<j; i++) {
        if (position >= pixels[i]) {
          currentIndex = i;
          before = pixels[i];
          after = pixels[i+1] || before;
        } else {
          break;
        }
      }

      currentIndex = Math.abs(position - before) <=  Math.abs(position - after) ? currentIndex : currentIndex + 1;

      return this.getConfig("step")[currentIndex];
    },


    /**
     * Reads the pointer's position and sets slider value to the nearest step.
     *
     * @param e {qx.event.Emitter} Incoming event object
     */
    _onSliderPointerUp : function(e) {
      if ((e.getDocumentLeft() === 0 && e.getDocumentTop() === 0) ||
        !this.getEnabled()) {
        return;
      }
      this.setValue(this._getNearestValue(e.getDocumentLeft()));
    },


    /**
     * Listener for the pointerdown event. Initializes drag or tracking mode.
     *
     * @param e {qx.event.Emitter} Incoming event object
     */
    _onPointerDown : function(e) {
      // this can happen if the user releases the button while dragging outside
      // of the browser viewport
      if (this.__dragMode) {
        return;
      }

      this.__dragMode = true;

      qxWeb(document.documentElement).on("pointermove", this._onPointerMove, this)
      .setStyle("cursor", "pointer");

      e.stopPropagation();
    },


    /**
     * Listener for the pointerup event. Used for cleanup of previously
     * initialized modes.
     *
     * @param e {qx.event.Emitter} Incoming event object
     */
    _onDocPointerUp : function(e) {
      if (this.__dragMode === true) {
        // Cleanup status flags
        delete this.__dragMode;

        this.__valueToPosition(this.getValue());

        qxWeb(document.documentElement).off("pointermove", this._onPointerMove, this)
        .setStyle("cursor", "auto");
        e.stopPropagation();
      }
    },


    /**
     * Listener for the pointermove event for the knob. Only used in drag mode.
     *
     * @param e {qx.event.Emitter} Incoming event object
     */
    _onPointerMove : function(e) {
      e.preventDefault();

      if (this.__dragMode) {
        var dragPosition = e.getDocumentLeft();
        var dragBoundaries = this._getDragBoundaries();
        var paddingLeft = Math.ceil(parseFloat(this.getStyle("paddingLeft")) || 0);
        var positionKnob = dragPosition - this.getOffset().left - this._getHalfKnobWidth() - paddingLeft;

        if (dragPosition >= dragBoundaries.min && dragPosition <= dragBoundaries.max) {
          this.setValue(this._getNearestValue(dragPosition));
          if (positionKnob > 0) {
            this._setKnobPosition(positionKnob);
            this.emit("changePosition", positionKnob);
          }
        }
        e.stopPropagation();
      }
    },


    /**
     * Prevents drag event propagation
     * @param e {Event} e drag start event
     */
    _onDragStart : function(e) {
      e.stopPropagation();
      e.preventDefault();
    },


    /**
     * Delegates the Slider's focus to the knob
     * @param e {Event} focus event
     */
    _onSliderFocus : function(e) {
      this.getChildren("." + this.getCssPrefix() + "-knob").focus();
    },


    /**
     * Attaches the event listener for keyboard support to the knob on focus
     * @param e {Event} focus event
     */
    _onKnobFocus : function(e) {
      this.getChildren("." + this.getCssPrefix() + "-knob")
        .on("keydown", this._onKeyDown, this);
    },


    /**
     * Removes the event listener for keyboard support from the knob on blur
     * @param e {Event} blur event
     */
    _onKnobBlur : function(e) {
      this.getChildren("." + this.getCssPrefix() + "-knob")
        .off("keydown", this._onKeyDown, this);
    },


    /**
     * Moves the knob if the left or right arrow key is pressed
     * @param e {Event} keydown event
     */
    _onKeyDown : function(e) {
      var newValue;
      var currentValue = this.getValue();
      var step = this.getConfig("step");
      var stepType = qxWeb.type.get(step);
      var key = e.getKeyIdentifier();
      var idx;
      if (key == "Right") {
        if (stepType === "Array") {
          idx = step.indexOf(currentValue);
          if (idx !== undefined) {
            newValue = step[idx + 1] || currentValue;
          }
        } else if (stepType === "Number") {
          newValue = currentValue + step;
        }
        else {
          newValue = currentValue + 1;
        }
      }
      else if (key == "Left") {
        if (stepType === "Array") {
          idx = step.indexOf(currentValue);
          if (idx !== undefined) {
            newValue = step[idx - 1] || currentValue;
          }
        } else if (stepType === "Number") {
          newValue = currentValue - step;
        }
        else {
          newValue = currentValue - 1;
        }
      } else {
        return;
      }

      this.setValue(newValue);
    },


    /**
    * Applies the horizontal position
    * @param x {Integer} the position to move to
    */
    _setKnobPosition : function(x) {
      var knob = this.getChildren("." + this.getCssPrefix() + "-knob");
      if (qxWeb.env.get("css.transform")) {
        knob.translate([x + "px", 0, 0]);
      } else {
        knob.setStyle("left", x + "px");
      }
    },


    /**
     * Listener for window resize events. This listener method resets the
     * calculated values which are used to position the slider knob.
     */
    _onWindowResize : function() {
      if (qxWeb.type.get(this.getConfig("step")) == "Array") {
        this._getPixels();
      }
      this.__valueToPosition(this._value);
    },


    /**
     * Positions the slider knob to the given value and fires the "changePosition"
     * event with the current position as integer.
     *
     * @param value {Integer} slider step value
     */
    __valueToPosition : function(value)
    {
      var pixels = this._getPixels();
      var paddingLeft = Math.ceil(parseFloat(this.getStyle("paddingLeft")) || 0);
      var valueToPixel;
      if (pixels.length > 0) {
        // Get the pixel value of the current step value
        valueToPixel = pixels[this.getConfig("step").indexOf(value)] - paddingLeft;
      } else {
        var dragBoundaries = this._getDragBoundaries();
        var availableWidth = dragBoundaries.max - dragBoundaries.min;
        var range = this.getConfig("maximum") - this.getConfig("minimum");
        var fraction = (value - this.getConfig("minimum")) / range;
        valueToPixel = (availableWidth * fraction) + dragBoundaries.min - paddingLeft;
      }

      // relative position is necessary here
      var position = valueToPixel - this.getOffset().left - this._getHalfKnobWidth();
      this._setKnobPosition(position);

      this.emit("changePosition", position);
    },


    dispose : function()
    {
      qxWeb(document).off("pointerup", this._onDocPointerUp, this);
      qxWeb(window).off("resize", this._onWindowResize, this);
      this.off("pointerup", this._onSliderPointerUp, this)
      .off("focus", this._onSliderFocus, this);
      this.getChildren("." + this.getCssPrefix() + "-knob")
      .off("pointerdown", this._onPointerDown, this)
      .off("dragstart", this._onDragStart, this)
      .off("focus", this._onKnobFocus, this)
      .off("blur", this._onKnobBlur, this)
      .off("keydown", this._onKeyDown, this);

      this.setHtml("");

      return this.base(arguments);
    }
  },


  // Make the slider widget available as a qxWeb module
  defer : function(statics) {
    qxWeb.$attach({slider : statics.slider});
  }
});
