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
 * To implement the range of a spinner's value, a {@link qx.util.range.Range
 * Range} object is deployed as the {@link #manager} object. Here you can define the
 * boundaries of the range (*min* and *max* properties), the *default* value,
 * the *precision* and whether the range should *wrap* when stepping beyond a
 * border (see the Range documentation for more information). An optional {@link
 * #numberFormat} property allows you to control the format of how a value can
 * be entered and will be displayed.
 *
 * A brief, but non-trivial example:
 *
 * <pre>
 * var s = new qx.legacy.ui.form.Spinner;
 * s.set({
 *   max: 3000,
 *   min: -3000
 * });
 * var nf = new qx.util.format.NumberFormat();
 * nf.setMaximumFractionDigits(2);
 * s.setNumberFormat(nf);
 * s.getManager().setPrecision(2);
 * </pre>
 *
 * A spinner instance without any further properties specified in the
 * constructor or a subsequent *set* command will appear with default
 * values and behaviour.
 *
 * @appearance spinner
 *
 * @appearance spinner-field {qx.legacy.ui.form.TextField}
 *
 * @appearance spinner-button-up {qx.legacy.ui.basic.Image}
 * @state pressed {spinner-button-up}
 *
 * @appearance spinner-button-down {qx.legacy.ui.basic.Image}
 * @state pressed {spinner-button-down}
 */
qx.Class.define("qx.legacy.ui.form.Spinner",
{
  extend : qx.legacy.ui.layout.HorizontalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vMin, vValue, vMax)
  {
    this.base(arguments);

    // ************************************************************************
    //   BEHAVIOR
    // ************************************************************************
    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      this.setStyleProperty("fontSize", "0px");
    }

    // ************************************************************************
    //   TEXTFIELD
    // ************************************************************************
    this._textfield = new qx.legacy.ui.form.TextField;
    this._textfield.setBorder(null);
    this._textfield.setWidth("1*");
    this._textfield.setAllowStretchY(true);
    this._textfield.setHeight(null);
    this._textfield.setLiveUpdate(true);
    this._textfield.setVerticalAlign("middle");
    this._textfield.setAppearance("spinner-text-field");
    this.add(this._textfield);

    // ************************************************************************
    //   BUTTON LAYOUT
    // ************************************************************************
    this._buttonlayout = new qx.legacy.ui.layout.VerticalBoxLayout;
    this._buttonlayout.setWidth("auto");
    this.add(this._buttonlayout);

    // ************************************************************************
    //   UP-BUTTON
    // ************************************************************************
    this._upbutton = new qx.legacy.ui.basic.Image;
    this._upbutton.setAppearance("spinner-button-up");
    this._upbutton.setHeight("1*");
    this._buttonlayout.add(this._upbutton);

    // ************************************************************************
    //   DOWN-BUTTON
    // ************************************************************************
    this._downbutton = new qx.legacy.ui.basic.Image;
    this._downbutton.setAppearance("spinner-button-down");
    this._downbutton.setHeight("1*");
    this._buttonlayout.add(this._downbutton);

    // ************************************************************************
    //   TIMER
    // ************************************************************************
    this._timer = new qx.event.Timer(this.getInterval());

    // ************************************************************************
    //   MANAGER
    // ************************************************************************
    this.setManager(new qx.util.range.Range());
    this.initWrap();

    // ************************************************************************
    //   EVENTS
    // ************************************************************************
    this.addListener("keypress", this._onKeyPress, this);
    this.addListener("keydown", this._onkeydown, this);
    this.addListener("keyup", this._onkeyup, this);
    this.addListener("mousewheel", this._onmousewheel, this);

    this._textfield.addListener("changeValue", this._ontextchange, this);
    this._textfield.addListener("input", this._oninput, this);
    this._textfield.addListener("blur", this._onblur, this);
    this._upbutton.addListener("mousedown", this._onmousedown, this);
    this._downbutton.addListener("mousedown", this._onmousedown, this);
    this._timer.addListener("interval", this._oninterval, this);

    // ************************************************************************
    //   INITIALIZATION
    // ************************************************************************
    if (vMin != null) {
      this.setMin(vMin);
    }

    if (vMax != null) {
      this.setMax(vMax);
    }

    if (vValue != null) {
      this.setValue(vValue);
    }

    this._checkValue = this.__checkValue;
    this._numberFormat = null;

    this.initWidth();
    this.initHeight();

    this._last_value = "";
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * Fired each time the value of the spinner changes.
     * The "data" property of the event is set to the new value
     * of the spinner.
     */
    "change" : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    appearance :
    {
      refine : true,
      init : "spinner"
    },

    width :
    {
      refine : true,
      init : 60
    },

    height :
    {
      refine : true,
      init : 22
    },




    /** The amount to increment on each event (keypress or mousedown). */
    incrementAmount :
    {
      check : "Number",
      init : 1,
      apply : "_applyIncrementAmount"
    },


    /** The amount to increment on each event (keypress or mousedown). */
    wheelIncrementAmount :
    {
      check : "Number",
      init : 1
    },


    /** The amount to increment on each pageup / pagedown keypress */
    pageIncrementAmount :
    {
      check : "Number",
      init : 10
    },


    /** The current value of the interval (this should be used internally only). */
    interval :
    {
      check : "Integer",
      init : 100
    },


    /** The first interval on event based shrink/growth of the value. */
    firstInterval :
    {
      check : "Integer",
      init : 500
    },


    /** This configures the minimum value for the timer interval. */
    minTimer :
    {
      check : "Integer",
      init : 20
    },


    /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
    timerDecrease :
    {
      check : "Integer",
      init : 2
    },


    /** If minTimer was reached, how much the amount of each interval should grow (in relation to the previous interval). */
    amountGrowth :
    {
      check : "Number",
      init : 1.01
    },


    /** whether the value should wrap around */
    wrap :
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


    /** Range manager */
    manager :
    {
      check : "qx.util.range.IRange",
      apply : "_applyManager",
      dispose : true
    },


    /** Holding a reference to the protected {@link _checkValue} method */
    checkValueFunction :
    {
      apply : "_applyCheckValueFunction"
    },


    /**  */
    numberFormat :
    {
      check : "qx.util.format.NumberFormat",
      apply : "_applyNumberFormat"
    },


    /**  */
    selectTextOnInteract :
    {
      check : "Boolean",
      init : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    _applyIncrementAmount : function(value, old) {
      this._computedIncrementAmount = value;
    },


    _applyEditable : function(value, old)
    {
      if (this._textfield) {
        this._textfield.setReadOnly(! value);
      }
    },


    _applyWrap : function(value, old)
    {
      this.getManager().setWrap(value);
      this._onchange();
    },


    _applyManager : function(value, old)
    {
      if (old)
      {
        old.removeListener("change", this._onchange, this);
      }

      if (value)
      {
        value.addListener("change", this._onchange, this);
      }

      // apply initital value
      this._onchange();
    },


    _applyCheckValueFunction : function(value, old) {
      this._checkValue = value;
    },


    _applyNumberFormat : function(value, old) {
      this._numberFormat = value;
      this.getManager().setPrecision(value.getMaximumFractionDigits());
      this._onchange();
    },


    /*
    ---------------------------------------------------------------------------
      PREFERRED DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the prefered inner width for the spinner widget. Currently this
     * method returns 50.
     *
     * @return {Integer} prefered inner width for the spinner widget
     */
    _computePreferredInnerWidth : function() {
      return 50;
    },


    /**
     * Return the prefered inner height for the spinner widget. Currently this
     * method returns 14
     *
     * @return {Integer} prefered inner height for the spinner widget
     */
    _computePreferredInnerHeight : function() {
      return 14;
    },




    /*
    ---------------------------------------------------------------------------
      KEY EVENT-HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Callback for the "keyPress" event.<br/>
     * Perform action when "Enter" (without "Alt"), control keys
     * and numeric (0-9) keys are pressed. Suppress all key events for
     * events without modifiers.
     *
     * @param e {qx.legacy.event.type.KeyEvent} keyPress event
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      var vIdentifier = e.getKeyIdentifier();

      if (vIdentifier == "Enter" && !e.isAltPressed())
      {
        this._checkValue(true, false);
        if (this.getSelectTextOnInteract()) {
          this._textfield.selectAll();
        }
      }
      else
      {
        switch(vIdentifier)
        {
          case "Up":
          case "Down":
          case "Left":
          case "Right":
          case "Shift":
          case "Control":
          case "Alt":
          case "Escape":
          case "Delete":
          case "Backspace":
          case "Insert":
          case "Home":
          case "End":
          case "PageUp":
          case "PageDown":
          case "NumLock":
          case "Tab":
            break;

          default:
            if ((vIdentifier >= "0" && vIdentifier <= "9") ||
                (vIdentifier == '-')) {
              return;
            }
            if (this._numberFormat) {
              var locale = this._numberFormat._locale;
              if ((vIdentifier == qx.locale.Number.getGroupSeparator(locale)) ||
                  (vIdentifier == qx.locale.Number.getDecimalSeparator(locale)))
              {
                return;
              }
            }

            // supress all key events without modifier
            if (e.getModifiers() == 0) {
              e.preventDefault();
            }
        }
      }
    },


    /**
     * Callback for "keyDown" event.<br/>
     * Controls the interval mode ("single" or "page")
     * and the interval increase by detecting "Up"/"Down"
     * and "PageUp"/"PageDown" keys.
     * Starting a timer to control the incrementing of the
     * spinner value.
     *
     * @param e {qx.legacy.event.type.KeyEvent} keyDown event
     * @return {void}
     */
    _onkeydown : function(e)
    {
      var vIdentifier = e.getKeyIdentifier();

      if (this._intervalIncrease == null)
      {
        switch(vIdentifier)
        {
          case "Up":
          case "Down":
            this._intervalIncrease = vIdentifier == "Up";
            this._intervalMode = "single";

            this._resetIncrements();
            this._checkValue(true, false);

            this._increment();
            this._timer.startWith(this.getFirstInterval());

            break;

          case "PageUp":
          case "PageDown":
            this._intervalIncrease = vIdentifier == "PageUp";
            this._intervalMode = "page";

            this._resetIncrements();
            this._checkValue(true, false);

            this._pageIncrement();
            this._timer.startWith(this.getFirstInterval());

            break;
        }
      }
    },


    /**
     * Callback for "keyUp" event.<br/>
     * Detecting "Up"/"Down" and "PageUp"/"PageDown" keys.
     * If detected the interval mode and interval increase get resetted
     * and the timer for the control of the increase of the spinner value
     * gets stopped.
     *
     * @param e {qx.legacy.event.type.KeyEvent} keyUp event
     * @return {void}
     */
    _onkeyup : function(e)
    {
      if (this._intervalIncrease != null)
      {
        switch(e.getKeyIdentifier())
        {
          case "Up":
          case "Down":
          case "PageUp":
          case "PageDown":
            this._timer.stop();

            this._intervalIncrease = null;
            this._intervalMode = null;
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT-HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Callback method for the "mouseDown" event of the spinner buttons.<br/>
     * State handling, registering event listeners at the spinner button and
     * invoking the increment management (resets increments, setup and start timer etc.).
     *
     * @param e {qx.legacy.event.type.MouseEvent} mouseDown event
     * @return {void}
     */
    _onmousedown : function(e)
    {
      if (!e.isLeftButtonPressed()) {
        return;
      }

      this._checkValue(true);

      var vButton = e.getCurrentTarget();

      vButton.addState("pressed");

      vButton.addListener("mouseup", this._onmouseup, this);
      vButton.addListener("mouseout", this._onmouseup, this);

      this._intervalIncrease = vButton == this._upbutton;
      this._resetIncrements();
      this._increment();

      if (this.getSelectTextOnInteract()) {
        this._textfield.selectAll();
      }

      this._timer.setInterval(this.getFirstInterval());
      this._timer.start();
    },


    /**
     * Callback method for the "mouseUp" event of the spinner buttons.<br/>
     * State handling, removing event listeners at the spinner button, focusing
     * the text field and resetting the interval management (stopping timer,
     * resetting interval increase).
     *
     * @param e {qx.legacy.event.type.MouseEvent} mouseUp event
     * @return {void}
     */
    _onmouseup : function(e)
    {
      var vButton = e.getCurrentTarget();

      vButton.removeState("pressed");

      vButton.removeListener("mouseup", this._onmouseup, this);
      vButton.removeListener("mouseout", this._onmouseup, this);

      if (this.getSelectTextOnInteract()) {
        this._textfield.selectAll();
      }
      this._textfield.setFocused(true);

      this._timer.stop();
      this._intervalIncrease = null;
    },


    /**
     * Callback method for the "mouseWheel" event.<br/>
     * Delegates the in-/decrementing to the manager and
     * selects the text field.
     *
     * @param e {qx.legacy.event.type.MouseEvent} mouseWheel event
     * @return {void}
     */
    _onmousewheel : function(e)
    {
      this._checkValue(true);
      if (this.getManager().incrementValue)
      {
        this.getManager().incrementValue(this.getWheelIncrementAmount() *
                                         e.getWheelDelta());
      }
      else
      {
        var value = this.getManager().getValue() +
                                   (this.getWheelIncrementAmount() *
                                    e.getWheelDelta())
        value = this.getManager().limit(value);
        this.getManager().setValue(value);
      }
      this._textfield.selectAll();
    },




    /*
    ---------------------------------------------------------------------------
      OTHER EVENT-HANDLING
    ---------------------------------------------------------------------------
    */

    _ontextchange : function(e) {
      this._last_value = e.getOldData();
    },

    /**
     * Callback method for the "input" event.<br/>
     * Delegates the further processing to the method
     * hold by the "checkValue" property.
     *
     * @param e {qx.event.type.Data} input event
     * @return {void}
     */
    _oninput : function(e) {
      this._checkValue(true, true);
    },


    /**
     * Callback method for the "change" event.<br/>
     * Sets the value of the text field and enables/disables
     * the up-/down-buttons of the min-/max-value are reached
     * (additionally stops the timer of the min-/max-boundaries are reached)
     * Dispatched the "change" event.
     *
     * @param e {qx.event.type.Data} change event
     * @return {void}
     */
    _onchange : function(e)
    {
      var vValue = this.getManager().getValue();
      if (this._numberFormat) {
        this._textfield.setValue(this._numberFormat.format(vValue));
      } else {
        this._textfield.setValue(String(vValue));
      }

      if (vValue == this.getMin() && !this.getWrap())
      {
        this._downbutton.removeState("pressed");
        this._downbutton.setEnabled(false);
        this._timer.stop();
      }
      else
      {
        this._downbutton.resetEnabled();
      }

      if (vValue == this.getMax() && !this.getWrap())
      {
        this._upbutton.removeState("pressed");
        this._upbutton.setEnabled(false);
        this._timer.stop();
      }
      else
      {
        this._upbutton.resetEnabled();
      }

      this.fireDataEvent("change", vValue);
    },


    /**
     * Callback method for the "blur" event.<br/>
     * Calls the method of the "checkValueFunction" property
     *
     * @param e {qx.legacy.event.type.FocusEvent} blur event
     * @return {void}
     */
    _onblur : function(e) {
      this._checkValue(false);
    },




    /*
    ---------------------------------------------------------------------------
      MAPPING TO RANGE MANAGER
    ---------------------------------------------------------------------------
    */

    /**
     * Mapping to the "setValue" method of the Range manager
     *
     * @param nValue {Number} new value of the spinner
     * @return {void}
     */
    setValue : function(nValue) {
      this.getManager().setValue(this.getManager().limit(nValue));
    },


    /**
     * Mapping to the "getValue" method of the Range manager
     *
     * @return {Number} Current value of the spinner
     */
    getValue : function()
    {
      // make sure the manager is uptodate with what is on screen
      this._checkValue(true);
      return this.getManager().getValue();
    },


    /**
     * Mapping to the "resetValue" method of the Range manager
     *
     * @return {void}
     */
    resetValue : function() {
      this.getManager().resetValue();
    },


    /**
     * Mapping to the "setMax" method of the Range manager
     *
     * @param vMax {Number} new max value of the spinner
     * @return {Number} new max value of the spinner
     */
    setMax : function(vMax) {
      return this.getManager().setMax(vMax);
    },


    /**
     * Mapping to the "getMax" method of the Range manager
     *
     * @return {Number} current max value of the spinner
     */
    getMax : function() {
      return this.getManager().getMax();
    },


    /**
     * Mapping to the "setMin" method of the Range manager
     *
     * @param vMin {Number} new min value of the spinner
     * @return {Number} new min value of the spinner
     */
    setMin : function(vMin) {
      return this.getManager().setMin(vMin);
    },


    /**
     * Mapping to the "getMin" method of the Range manager
     *
     * @return {Number} current min value of the spinner
     */
    getMin : function() {
      return this.getManager().getMin();
    },


    /*
    ---------------------------------------------------------------------------
      INTERVAL HANDLING
    ---------------------------------------------------------------------------
    */

    _intervalIncrease : null,


    /**
     * Callback method for the "interval" event.<br/>
     * Stops the timer and sets a new interval. Executes the increment
     * of the spinner depending on the intervalMode and restarts the timer with
     * the new interval.
     *
     * @param e {qx.event.type.Event} interval event
     * @return {void}
     */
    _oninterval : function(e)
    {
      this._timer.stop();
      this.setInterval(Math.max(this.getMinTimer(), this.getInterval() - this.getTimerDecrease()));

      if (this._intervalMode == "page")
      {
        this._pageIncrement();
      }
      else
      {
        if (this.getInterval() == this.getMinTimer()) {
          this._computedIncrementAmount = this.getAmountGrowth() * this._computedIncrementAmount;
        }

        this._increment();
      }

      var wrap = this.getManager().getWrap();

      switch(this._intervalIncrease)
      {
        case true:
          if (this.getValue() == this.getMax() && !wrap) {
            return;
          }

        case false:
          if (this.getValue() == this.getMin() && !wrap) {
            return;
          }
      }

      this._timer.restartWith(this.getInterval());
    },




    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */

    /**
     * Default check value utility method
     *
     * @param acceptEmpty {Boolean} Whether empty values are allowed or not.
     * @param acceptEdit {Boolean} Whether editing is accepted or not.
     * @return {void}
     */
    __checkValue : function(acceptEmpty, acceptEdit)
    {
      var el = this._textfield.getInputElement();

      if (!el) {
        return;
      }

      if ((el.value == "") || (el.value == "-"))
      {
        if (!acceptEmpty)
        {
          this.setValue(this.getMax());
          this.resetValue();
          return;
        }
      }
      else
      {
        // cache original value
        var str_val = el.value;

        // prepare for parsing. We don't use numberFormat itself to parse the
        // string, as we want to be a little more liberal at this point since
        // we might be currently editing the string. For example, we accept
        // things like "4000."
        var parsable_str;

        if (this._numberFormat)
        {
          var groupSepEsc =
    qx.lang.String.escapeRegexpChars(qx.locale.Number.getGroupSeparator(this._numberFormat._locale) + "");
          var decimalSepEsc =
    qx.lang.String.escapeRegexpChars(qx.locale.Number.getDecimalSeparator(this._numberFormat._locale) + "");
          parsable_str = str_val.replace(new RegExp(groupSepEsc, "g"), "");
          parsable_str = parsable_str.replace(new RegExp(decimalSepEsc), ".");
        }
        else
        {
          parsable_str = str_val;
        }

        // parse the string
        var val = parseFloat(parsable_str);
        var limitedVal = this.getManager().limit(val);
        var oldValue = this.getManager().getValue();
        var fixedVal = limitedVal;

        // NaN means we had a parse error, but we'll be more picky than
        // parseFloat (refuse stuff like 5.55-12.5 which parseFloat
        // parses as 5.55). We also refuse values outside the range.
        if (isNaN(val) || (limitedVal != val) || (val != parsable_str))
        {
          if (acceptEdit) {
            this._textfield.setValue(this._last_value);
          } else {
            if (isNaN(limitedVal)) {
              // reset to last correct value
              fixedVal = oldValue;
            } else {
              fixedVal = limitedVal;
            }
          }
        }
        if (acceptEdit)
        {
          return;
        }

        var formattedValue;

        if (this._numberFormat) {
          formattedValue = this._numberFormat.format(fixedVal);
        } else {
          formattedValue = String(fixedVal);
        }

        if ((fixedVal === oldValue) && (str_val !== formattedValue)) {
          // "silently" update the displayed value as it won't get
          // updated by the range manager since it considers the value as
          // unchanged.
          this._textfield.setValue(formattedValue);
        }

        // inform manager
        this.getManager().setValue(fixedVal);
      }
    },


    /**
     * Performs a normal increment
     *
     * @return {void}
     */
    _increment : function()
    {
      if (this.getManager().incrementValue)
      {
        this.getManager().incrementValue((this._intervalIncrease ? 1 : -1) *
                                         this._computedIncrementAmount);
      }
      else
      {
        var value = this.getManager().getValue() +
                                   ((this._intervalIncrease ? 1 : -1) *
                                    this._computedIncrementAmount);

        value = this.getManager().limit(value);

        this.getManager().setValue(value);
      }
    },


    /**
     * Performs a page increment
     *
     * @return {void}
     */
    _pageIncrement : function()
    {
      if (this.getManager().pageIncrementValue)
      {
        this.getManager().pageIncrementValue();
      }
      else
      {
        var value = this.getManager().getValue() +
                                   ((this._intervalIncrease ? 1 : -1) *
                                    this.getPageIncrementAmount());

        value = this.getManager().limit(value);

        this.getManager().setValue(value);
      }
    },


    /**
     * Reset the increments
     *
     * @return {void}
     */
    _resetIncrements : function()
    {
      this._computedIncrementAmount = this.getIncrementAmount();
      this.resetInterval();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var mgr = this.getManager();
    if (mgr) {
      mgr.dispose();
    }

    this._disposeObjects("_textfield", "_buttonlayout", "_upbutton", "_downbutton",
      "_timer");
  }
});
