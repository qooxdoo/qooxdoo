/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * A *spinner* is a control that allows you to adjust a numerical value,
 * typically within an allowed range. An obvious example would be to specify the
 * month of a year as a number in the range 1 - 12.
 *
 * To do so, a spinner encompasses a field to display the current value (a
 * textfield) and controls such as up and down buttons to change that value. The
 * current value can also be changed by editing the display field directly, or
 * using mouse wheel and cursor keys.
 *
 * An optional {@link #numberFormat} property allows you to control the format of
 * how a value can be entered and will be displayed.
 *
 * A brief, but non-trivial example:
 *
 * <pre>
 * var s = new qx.ui.form.Spinner();
 * s.set({
 *   max: 3000,
 *   min: -3000
 * });
 * var nf = new qx.util.format.NumberFormat();
 * nf.setMaximumFractionDigits(2);
 * s.setNumberFormat(nf);
 * </pre>
 *
 * A spinner instance without any further properties specified in the
 * constructor or a subsequent *set* command will appear with default
 * values and behaviour.
 */
qx.Class.define("qx.ui.form.Spinner",
{
  extend : qx.ui.core.Widget,
  implement : qx.ui.form.IFormElement,
  include : [qx.ui.core.MContentPadding],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param min {Number} Minimum value
   * @param value {Number} Current value
   * @param max {Number} Maximum value
   */
  construct : function(min, value, max)
  {
    this.base(arguments);

    // MAIN LAYOUT
    var layout = new qx.ui.layout.Grid();
    layout.setColumnFlex(0, 1);
    layout.setRowFlex(0,1);
    layout.setRowFlex(1,1);
    this._setLayout(layout);

    // EVENTS
    this.addListener("keydown", this._onKeyDown, this);
    this.addListener("keyup", this._onKeyUp, this);
    this.addListener("mousewheel", this._onMouseWheel, this);

    // CREATE CONTROLS
    this._createChildControl("textfield");
    this._createChildControl("upbutton");
    this._createChildControl("downbutton");

    // INITIALIZATION
    if (min != null) {
      this.setMin(min);
    }

    if (max != null) {
      this.setMax(max);
    }

    if (value != null) {
      this.setValue(value);
    } else {
      this.initValue();
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties:
  {
    // overridden
    appearance:
    {
      refine : true,
      init : "spinner"
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    },

    /** The amount to increment on each event (keypress or mousedown) */
    singleStep:
    {
      check : "Number",
      init : 1
    },

    /** The amount to increment on each pageup/pagedown keypress */
    pageStep:
    {
      check : "Number",
      init : 10
    },

    /** minimal value of the Range object */
    min:
    {
      check : "Number",
      apply : "_applyMin",
      init : 0
    },

    /** The name of the widget. Mainly used for serialization proposes. */
    name :
    {
      check : "String",
      nullable : true,
      event : "changeName"
    },

    /** The value of the spinner. */
    value:
    {
      check : "typeof value==='number'&&value>=this.getMin()&&value<=this.getMax()",
      apply : "_applyValue",
      init : 0,
      event : "changeValue"
    },

    /** maximal value of the Range object */
    max:
    {
      check : "Number",
      apply : "_applyMax",
      init : 100
    },

    /** whether the value should wrap around */
    wrap:
    {
      check : "Boolean",
      init : false,
      apply : "_applyWrap"
    },

    /** Controls whether the textfield of the spinner is editable or not */
    editable :
    {
      check : "Boolean",
      init : true,
      apply : "_applyEditable"
    },

    /** Controls the display of the number in the textfield */
    numberFormat :
    {
      check : "qx.util.format.NumberFormat",
      apply : "_applyNumberFormat",
      nullable : true
    },

    // overridden
    allowShrinkY :
    {
      refine : true,
      init : false
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __lastValidValue : null,
    __pageUpMode : null,
    __pageDownMode : null,


    /*
    ---------------------------------------------------------------------------
      WIDGET INTERNALS
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "textfield":
          control = new qx.ui.form.TextField();
          control.addState("inner");
          control.setWidth(40);
          control.setFocusable(false);
          control.addListener("changeValue", this._onTextChange, this);

          this._add(control, {column: 0, row: 0, rowSpan: 2});
          break;

        case "upbutton":
          control = new qx.ui.form.RepeatButton();
          control.addState("inner");
          control.setFocusable(false);
          control.addListener("execute", this.__countUp, this);
          this._add(control, {column: 1, row: 0});
          break;

        case "downbutton":
          control = new qx.ui.form.RepeatButton();
          control.addState("inner");
          control.setFocusable(false);
          control.addListener("execute", this.__countDown, this);
          this._add(control, {column:1, row: 1});
          break;
      }

      return control || this.base(arguments, id);
    },


    // overridden
    _forwardStates : {
      focused : true
    },


    // overridden
    tabFocus : function()
    {
      var field = this._getChildControl("textfield");

      field.getFocusElement().focus();
      field.selectAll();
    },





    /*
    ---------------------------------------------------------------------------
      APPLY METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Apply routine for the min property.
     *
     * It sets the value of the spinner to the maximum of the current spinner
     * value and the given min property value.
     *
     * @param value {Number} The new value of the min property
     * @param old {Number} The old value of the min property
     */
    _applyMin : function(value, old)
    {
      this.setMax(Math.max(this.getMax(), value));
      this.setValue(Math.max(this.getValue(), value));
    },


    /**
     * Apply routine for the max property.
     *
     * It sets the value of the spinner to the minnimum of the current spinner
     * value and the given max property value.
     *
     * @param value {Number} The new value of the max property
     * @param old {Number} The old value of the max property
     */
    _applyMax : function(value, old)
    {
      this.setMin(Math.min(this.getMin(), value));
      this.setValue(Math.min(this.getValue(), value));
    },


    /**
     * Apply routine for the value property.
     *
     * It checks the min and max values, disables / enables the
     * buttons and handles the wrap around.
     *
     * @param value {Number} The new value of the spinner
     * @param old {Number} The former value of the spinner
     */
    _applyValue: function(value, old)
    {
      var upButton = this._getChildControl("upbutton");
      var downButton = this._getChildControl("downbutton");
      var textField = this._getChildControl("textfield");

      // up button enabled/disabled
      if (value < this.getMax())
      {
        // only enable the button if the spinner itself is enabled
        if (this.getEnabled()) {
          upButton.resetEnabled();
        }
      }
      else
      {
        // only disable the buttons if wrapping is disabled
        if (!this.getWrap()) {
          upButton.setEnabled(false);
        }
      }

      // down button enabled/disabled
      if (value > this.getMin())
      {
        // only enable the button if the spinner itself is enabled
        if (this.getEnabled()) {
          downButton.resetEnabled();
        }
      }
      else
      {
        // only disable the buttons if wrapping is disabled
        if (!this.getWrap()) {
          downButton.setEnabled(false);
        }
      }

      // save the last valid value of the spinner
      this.__lastValidValue = value;

      // write the value of the spinner to the textfield
      if (this.getNumberFormat()) {
        textField.setValue(this.getNumberFormat().format(value));
      } else {
        textField.setValue(value + "");
      }
    },


    /**
     * Apply routine for the editable property.<br/>
     * It sets the textfield of the spinner to not read only.
     *
     * @param value {Boolean} The new value of the editable property
     * @param old {Boolean} The former value of the editable property
     */
    _applyEditable : function(value, old)
    {
      var textField = this._getChildControl("textfield");

      if (textField) {
        textField.setReadOnly(!value);
      }
    },


    /**
     * Apply routine for the wrap property.<br/>
     * Enables all buttons if the wrapping is enabled.
     *
     * @param value {Boolean} The new value of the wrap property
     * @param old {Boolean} The former value of the wrap property
     */
    _applyWrap : function(value, old)
    {
      if (value)
      {
        var upButton = this._getChildControl("upbutton");
        var downButton = this._getChildControl("downbutton");

        if (this.getEnabled())
        {
          upButton.setEnabled(true);
          downButton.setEnabled(true);
        }
      }
    },


    /**
     * Apply routine for the numberFormat property.<br/>
     * When setting a number format, the display of the
     * value in the textfield will be changed immediately.
     *
     * @param value {Boolean} The new value of the numberFormat property
     * @param old {Boolean} The former value of the numberFormat property
     */
    _applyNumberFormat : function(value, old) {
      this._getChildControl("textfield").setValue(this.getNumberFormat().format(this.__lastValidValue));
    },


    /**
     * Returns the element, to which the content padding should be applied.
     *
     * @return {qx.ui.core.Widget} The content padding target.
     */
    _getContentPaddingTarget : function() {
      return this._getChildControl("textfield");
    },



    /*
    ---------------------------------------------------------------------------
      KEY EVENT-HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Callback for "keyDown" event.<br/>
     * Controls the interval mode ("single" or "page")
     * and the interval increase by detecting "Up"/"Down"
     * and "PageUp"/"PageDown" keys.<br/>
     * The corresponding button will be pressed.
     *
     * @param e {qx.event.type.KeyEvent} keyDown event
     */
    _onKeyDown: function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "PageUp":
          // mark that the spinner is in page mode and process further
          this.__pageUpMode = true;

        case "Up":
          this._getChildControl("upbutton").press();
          break;

        case "PageDown":
          // mark that the spinner is in page mode and process further
          this.__pageDownMode = true;

        case "Down":
          this._getChildControl("downbutton").press();
          break;

        default:
          // Do not stop unused events
          return;
      }

      e.stopPropagation();
      e.preventDefault();
    },


    /**
     * Callback for "keyUp" event.<br/>
     * Detecting "Up"/"Down" and "PageUp"/"PageDown" keys.<br/>
     * Releases the button and disabled the page mode, if necessary.
     *
     * @param e {qx.event.type.KeyEvent} keyUp event
     * @return {void}
     */
    _onKeyUp: function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "PageUp":
          this._getChildControl("upbutton").release();
          this.__pageUpMode = false;
          break;

        case "Up":
          this._getChildControl("upbutton").release();
          break;

        case "PageDown":
          this._getChildControl("downbutton").release();
          this.__pageDownMode = false;
          break;

        case "Down":
          this._getChildControl("downbutton").release();
          break;
      }
    },




    /*
    ---------------------------------------------------------------------------
      OTHER EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Callback method for the "mouseWheel" event.<br/>
     * Increments or decrements the value of the spinner.
     *
     * @param e {qx.event.type.MouseEvent} mouseWheel event
     */
    _onMouseWheel: function(e)
    {
      if (e.getWheelDelta() > 0) {
        this.__countDown();
      } else {
        this.__countUp();
      }

      e.stopPropagation();
    },


    /**
     * Callback method for the "change" event of the textfield.
     *
     * @param e {qx.ui.event.type.Event} text change event or blur event
     */
    _onTextChange : function(e)
    {
      var textField = this._getChildControl("textfield");

      // if a number format is set
      if (this.getNumberFormat())
      {
        // try to parse the current number using the number format
        try
        {
          var value = this.getNumberFormat().parse(textField.getValue());
          // if the parsing succeeded, set the value and done
          this.gotoValue(value);
          return;
        }
        catch(e) {
          // otherwise, process further
        }
      }

      // try to parse the number as a float
      var value = parseFloat(textField.getValue(), 10);

      // if the result is a number
      if (!isNaN(value))
      {
        // Fix range
        if (value > this.getMax()) {
          value = this.getMax();
        } else if (value < this.getMin()) {
          value = this.getMin();
        }

        // this.warn("value: " + value + "   get: " + this.getValue());
        if (value == this.getValue())
        {
          // this.warn("textfield: " + textField.getValue());
          textField.setValue(value + "");
        }
        else
        {
          // set the value in the spinner
          this.setValue(value);
        }
      }
      else
      {
        // otherwise, reset the last valid value
        textField.setValue(this.__lastValidValue + "");
      }
    },






    /*
    ---------------------------------------------------------------------------
      INTERVAL HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Checks if the spinner is in page mode and couts either the single
     * or page Step up.
     *
     */
    __countUp: function()
    {
      if (this.__pageUpMode) {
        var newValue = this.getValue() + this.getPageStep();
      } else {
        var newValue = this.getValue() + this.getSingleStep();
      }

      // handle the case that wraping is enabled
      if (this.getWrap())
      {
        if (newValue > this.getMax())
        {
          var diff = this.getMax() - newValue;
          newValue = this.getMin() + diff;
        }
      }

      this.gotoValue(newValue);
    },


    /**
     * Checks if the spinner is in page mode and couts either the single
     * or page Step down.
     *
     */
    __countDown: function()
    {
      if (this.__pageDownMode) {
        var newValue = this.getValue() - this.getPageStep();
      } else {
        var newValue = this.getValue() - this.getSingleStep();
      }

      // handle the case that wraping is enabled
      if (this.getWrap())
      {
        if (newValue < this.getMin())
        {
          var diff = this.getMin() + newValue;
          newValue = this.getMax() - diff;
        }
      }

      this.gotoValue(newValue);
    },


    /**
     * Normalizes the incoming value to be in the valid range and
     * applied it to the {@link #value} afterwards.
     *
     * @param value {Number} Any number
     * @return {Number} The normalized number
     */
    gotoValue : function(value) {
      return this.setValue(Math.min(this.getMax(), Math.max(this.getMin(), value)));
    }
  }
});
