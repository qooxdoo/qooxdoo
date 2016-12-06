/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)
     * Jonathan Weiß (jonathan_rass)

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
 * <pre class='javascript'>
 * var s = new qx.ui.form.Spinner();
 * s.set({
 *   maximum: 3000,
 *   minimum: -3000
 * });
 * var nf = new qx.util.format.NumberFormat();
 * nf.setMaximumFractionDigits(2);
 * s.setNumberFormat(nf);
 * </pre>
 *
 * A spinner instance without any further properties specified in the
 * constructor or a subsequent *set* command will appear with default
 * values and behaviour.
 *
 * @childControl textfield {qx.ui.form.TextField} holds the current value of the spinner
 * @childControl upbutton {qx.ui.form.Button} button to increase the value
 * @childControl downbutton {qx.ui.form.Button} button to decrease the value
 *
 */
qx.Class.define("qx.ui.form.Spinner",
{
  extend : qx.ui.core.Widget,
  implement : [
    qx.ui.form.INumberForm,
    qx.ui.form.IRange,
    qx.ui.form.IForm
  ],
  include : [
    qx.ui.core.MContentPadding,
    qx.ui.form.MForm
  ],


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
    this.addListener("roll", this._onRoll, this);

    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
    }

    // CREATE CONTROLS
    var textField = this._createChildControl("textfield");
    this._createChildControl("upbutton");
    this._createChildControl("downbutton");

    // INITIALIZATION
    if (min != null) {
      this.setMinimum(min);
    }

    if (max != null) {
      this.setMaximum(max);
    }

    if (value !== undefined) {
      this.setValue(value);
    } else {
      this.initValue();
    }

    // forward the focusin and focusout events to the textfield. The textfield
    // is not focusable so the events need to be forwarded manually.
    this.addListener("focusin", function(e) {
      textField.fireNonBubblingEvent("focusin", qx.event.type.Focus);
    }, this);

    this.addListener("focusout", function(e) {
      textField.fireNonBubblingEvent("focusout", qx.event.type.Focus);
    }, this);
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

    /** The amount to increment on each event (keypress or pointerdown) */
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
    minimum:
    {
      check : "Number",
      apply : "_applyMinimum",
      init : 0,
      event: "changeMinimum"
    },

    /** The value of the spinner. */
    value:
    {
      check : "this._checkValue(value)",
      nullable : true,
      apply : "_applyValue",
      init : 0,
      event : "changeValue"
    },

    /** maximal value of the Range object */
    maximum:
    {
      check : "Number",
      apply : "_applyMaximum",
      init : 100,
      event: "changeMaximum"
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
    /** Saved last value in case invalid text is entered */
    __lastValidValue : null,

    /** Whether the page-up button has been pressed */
    __pageUpMode : false,

    /** Whether the page-down button has been pressed */
    __pageDownMode : false,


    /*
    ---------------------------------------------------------------------------
      WIDGET INTERNALS
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "textfield":
          control = new qx.ui.form.TextField();
          control.setFilter(this._getFilterRegExp());
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
          control.addListener("execute", this._countUp, this);
          this._add(control, {column: 1, row: 0});
          break;

        case "downbutton":
          control = new qx.ui.form.RepeatButton();
          control.addState("inner");
          control.setFocusable(false);
          control.addListener("execute", this._countDown, this);
          this._add(control, {column:1, row: 1});
          break;
      }

      return control || this.base(arguments, id);
    },


    /**
     * Returns the regular expression used as the text field's filter
     *
     * @return {RegExp} The filter RegExp.
     */
    _getFilterRegExp : function()
    {
      var decimalSeparator, groupSeparator, locale;

      if (this.getNumberFormat() !== null) {
        locale = this.getNumberFormat().getLocale();
      } else {
        locale = qx.locale.Manager.getInstance().getLocale();
      }

      decimalSeparator = qx.locale.Number.getDecimalSeparator(locale);
      groupSeparator = qx.locale.Number.getGroupSeparator(locale);

      var prefix = "";
      var postfix = "";
      if (this.getNumberFormat() !== null) {
        prefix = this.getNumberFormat().getPrefix() || "";
        postfix = this.getNumberFormat().getPostfix() || "";
      }

      var filterRegExp = new RegExp("[0-9" +
        qx.lang.String.escapeRegexpChars(decimalSeparator) +
        qx.lang.String.escapeRegexpChars(groupSeparator) +
        qx.lang.String.escapeRegexpChars(prefix) +
        qx.lang.String.escapeRegexpChars(postfix) +
        "\-]"
      );

      return filterRegExp;
    },


    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates : {
      focused : true,
      invalid : true
    },


    // overridden
    tabFocus : function()
    {
      var field = this.getChildControl("textfield");

      field.getFocusElement().focus();
      field.selectAllText();
    },





    /*
    ---------------------------------------------------------------------------
      APPLY METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Apply routine for the minimum property.
     *
     * It sets the value of the spinner to the maximum of the current spinner
     * value and the given min property value.
     *
     * @param value {Number} The new value of the min property
     * @param old {Number} The old value of the min property
     */
    _applyMinimum : function(value, old)
    {
      if (this.getMaximum() < value) {
        this.setMaximum(value);
      }

      if (this.getValue() < value) {
        this.setValue(value);
      } else {
        this._updateButtons();
      }
    },


    /**
     * Apply routine for the maximum property.
     *
     * It sets the value of the spinner to the minimum of the current spinner
     * value and the given max property value.
     *
     * @param value {Number} The new value of the max property
     * @param old {Number} The old value of the max property
     */
    _applyMaximum : function(value, old)
    {
      if (this.getMinimum() > value) {
        this.setMinimum(value);
      }

      if (this.getValue() > value) {
        this.setValue(value);
      } else {
        this._updateButtons();
      }
    },


    // overridden
    _applyEnabled : function(value, old)
    {
      this.base(arguments, value, old);

      this._updateButtons();
    },


    /**
     * Check whether the value being applied is allowed.
     *
     * If you override this to change the allowed type, you will also
     * want to override {@link #_applyValue}, {@link #_applyMinimum},
     * {@link #_applyMaximum}, {@link #_countUp}, {@link #_countDown}, and
     * {@link #_onTextChange} methods as those cater specifically to numeric
     * values.
     *
     * @param value {var}
     *   The value being set
     * @return {Boolean}
     *   <i>true</i> if the value is allowed;
     *   <i>false> otherwise.
     */
    _checkValue : function(value) {
      return typeof value === "number" && value >= this.getMinimum() && value <= this.getMaximum();
    },


    /**
     * Apply routine for the value property.
     *
     * It disables / enables the buttons and handles the wrap around.
     *
     * @param value {Number} The new value of the spinner
     * @param old {Number} The former value of the spinner
     */
    _applyValue: function(value, old)
    {
      var textField = this.getChildControl("textfield");

      this._updateButtons();

      // save the last valid value of the spinner
      this.__lastValidValue = value;

      // write the value of the spinner to the textfield
      if (value !== null) {
        if (this.getNumberFormat()) {
          textField.setValue(this.getNumberFormat().format(value));
        } else {
          textField.setValue(value + "");
        }
      } else {
        textField.setValue("");
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
      var textField = this.getChildControl("textfield");

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
      this._updateButtons();
    },


    /**
     * Apply routine for the numberFormat property.<br/>
     * When setting a number format, the display of the
     * value in the text-field will be changed immediately.
     *
     * @param value {Boolean} The new value of the numberFormat property
     * @param old {Boolean} The former value of the numberFormat property
     */
    _applyNumberFormat : function(value, old) {
      var textField = this.getChildControl("textfield");
      textField.setFilter(this._getFilterRegExp());

      if (old) {
        old.removeListener("changeNumberFormat", this._onChangeNumberFormat, this);
      }

      var numberFormat = this.getNumberFormat();
      if (numberFormat !== null) {
        numberFormat.addListener("changeNumberFormat", this._onChangeNumberFormat, this);
      }

      this._applyValue(this.__lastValidValue, undefined);
    },

    /**
     * Returns the element, to which the content padding should be applied.
     *
     * @return {qx.ui.core.Widget} The content padding target.
     */
    _getContentPaddingTarget : function() {
      return this.getChildControl("textfield");
    },

    /**
     * Checks the min and max values, disables / enables the
     * buttons and handles the wrap around.
     */
    _updateButtons : function() {
      var upButton = this.getChildControl("upbutton");
      var downButton = this.getChildControl("downbutton");
      var value = this.getValue();

      if (!this.getEnabled())
      {
        // If Spinner is disabled -> disable buttons
        upButton.setEnabled(false);
        downButton.setEnabled(false);
      }
      else
      {
        if (this.getWrap())
        {
          // If wraped -> always enable buttons
          upButton.setEnabled(true);
          downButton.setEnabled(true);
        }
        else
        {
          // check max value
          if (value !== null && value < this.getMaximum()) {
            upButton.setEnabled(true);
          } else {
            upButton.setEnabled(false);
          }

          // check min value
          if (value !== null && value > this.getMinimum()) {
            downButton.setEnabled(true);
          } else {
            downButton.setEnabled(false);
          }
        }
      }
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
     * @param e {qx.event.type.KeySequence} keyDown event
     */
    _onKeyDown: function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "PageUp":
          // mark that the spinner is in page mode and process further
          this.__pageUpMode = true;

        case "Up":
          this.getChildControl("upbutton").press();
          break;

        case "PageDown":
          // mark that the spinner is in page mode and process further
          this.__pageDownMode = true;

        case "Down":
          this.getChildControl("downbutton").press();
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
     * @param e {qx.event.type.KeySequence} keyUp event
     */
    _onKeyUp: function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "PageUp":
          this.getChildControl("upbutton").release();
          this.__pageUpMode = false;
          break;

        case "Up":
          this.getChildControl("upbutton").release();
          break;

        case "PageDown":
          this.getChildControl("downbutton").release();
          this.__pageDownMode = false;
          break;

        case "Down":
          this.getChildControl("downbutton").release();
          break;
      }
    },




    /*
    ---------------------------------------------------------------------------
      OTHER EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Callback method for the "roll" event.<br/>
     * Increments or decrements the value of the spinner.
     *
     * @param e {qx.event.type.Roll} roll event
     */
    _onRoll: function(e)
    {
      // only wheel
      if (e.getPointerType() != "wheel") {
        return;
      }
      var delta = e.getDelta().y;
      if (delta < 0) {
        this._countUp();
      } else if (delta > 0) {
        this._countDown();
      }

      e.stop();
    },


    /**
     * Callback method for the "change" event of the textfield.
     *
     * @param e {qx.event.type.Event} text change event or blur event
     */
    _onTextChange : function(e)
    {
      var textField = this.getChildControl("textfield");
      var value;

      // if a number format is set
      if (this.getNumberFormat())
      {
        // try to parse the current number using the number format
        try {
          value = this.getNumberFormat().parse(textField.getValue());
        } catch(ex) {
          // otherwise, process further
        }
      }

      if (value === undefined)
      {
        // try to parse the number as a float
        value = parseFloat(textField.getValue());
      }

      // if the result is a number
      if (!isNaN(value))
      {
        // Fix value if invalid
        if (value > this.getMaximum()) {
          value = this.getMaximum();
        } else if (value < this.getMinimum()) {
          value = this.getMinimum();
        }

        // If value is the same than before, call directly _applyValue()
        if (value === this.__lastValidValue) {
          this._applyValue(this.__lastValidValue);
        } else {
          this.setValue(value);
        }
      }
      else
      {
        // otherwise, reset the last valid value
        this._applyValue(this.__lastValidValue, undefined);
      }
    },


    /**
     * Callback method for the locale Manager's "changeLocale" event.
     *
     * @param ev {qx.event.type.Event} locale change event
     */

    _onChangeLocale : function(ev)
    {
      if (this.getNumberFormat() !== null) {
        this.setNumberFormat(this.getNumberFormat());
        var textfield = this.getChildControl("textfield");
        textfield.setFilter(this._getFilterRegExp());
        textfield.setValue(this.getNumberFormat().format(this.getValue()));
      }
    },


    /**
     * Callback method for the number format's "changeNumberFormat" event.
     *
     * @param ev {qx.event.type.Event} number format change event
     */
    _onChangeNumberFormat : function(ev) {
      var textfield = this.getChildControl("textfield");
      textfield.setFilter(this._getFilterRegExp());
      textfield.setValue(this.getNumberFormat().format(this.getValue()));
    },




    /*
    ---------------------------------------------------------------------------
      INTERVAL HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Checks if the spinner is in page mode and counts either the single
     * or page Step up.
     *
     */
    _countUp: function()
    {
      if (this.__pageUpMode) {
        var newValue = this.getValue() + this.getPageStep();
      } else {
        var newValue = this.getValue() + this.getSingleStep();
      }

      // handle the case where wrapping is enabled
      if (this.getWrap())
      {
        if (newValue > this.getMaximum())
        {
          var diff = this.getMaximum() - newValue;
          newValue = this.getMinimum() - diff - 1;
        }
      }

      this.gotoValue(newValue);
    },


    /**
     * Checks if the spinner is in page mode and counts either the single
     * or page Step down.
     *
     */
    _countDown: function()
    {
      if (this.__pageDownMode) {
        var newValue = this.getValue() - this.getPageStep();
      } else {
        var newValue = this.getValue() - this.getSingleStep();
      }

      // handle the case where wrapping is enabled
      if (this.getWrap())
      {
        if (newValue < this.getMinimum())
        {
          var diff = this.getMinimum() + newValue;
          newValue = this.getMaximum() + diff + 1;
        }
      }

      this.gotoValue(newValue);
    },


    /**
     * Normalizes the incoming value to be in the valid range and
     * applies it to the {@link #value} afterwards.
     *
     * @param value {Number} Any number
     * @return {Number} The normalized number
     */
    gotoValue : function(value) {
      return this.setValue(Math.min(this.getMaximum(), Math.max(this.getMinimum(), value)));
    },

    // overridden
    focus : function()
    {
      this.base(arguments);
      this.getChildControl("textfield").getFocusElement().focus();
    }
  },


  destruct : function()
  {
    var nf = this.getNumberFormat();
    if (nf) {
      nf.removeListener("changeNumberFormat", this._onChangeNumberFormat, this);
    }

    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
    }
  }
});
