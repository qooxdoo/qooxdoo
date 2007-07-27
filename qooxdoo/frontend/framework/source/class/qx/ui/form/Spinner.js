/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_form)

************************************************************************ */

/**
 * @appearance spinner
 *
 * @appearance spinner-field {qx.ui.form.TextField}
 *
 * @appearance spinner-button-up {qx.ui.basic.Image}
 * @state pressed {spinner-button-up}
 *
 * @appearance spinner-button-down {qx.ui.basic.Image}
 * @state pressed {spinner-button-down}
 */
qx.Class.define("qx.ui.form.Spinner",
{
  extend : qx.ui.layout.HorizontalBoxLayout,




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
    this._textfield = new qx.ui.form.TextField;
    this._textfield.setBorder(null);
    this._textfield.setWidth("1*");
    this._textfield.setAllowStretchY(true);
    this._textfield.setHeight(null);
    this._textfield.setVerticalAlign("middle");
    this._textfield.setAppearance("spinner-text-field");
    this.add(this._textfield);

    // ************************************************************************
    //   BUTTON LAYOUT
    // ************************************************************************
    this._buttonlayout = new qx.ui.layout.VerticalBoxLayout;
    this._buttonlayout.setWidth("auto");
    this.add(this._buttonlayout);

    // ************************************************************************
    //   UP-BUTTON
    // ************************************************************************
    this._upbutton = new qx.ui.basic.Image;
    this._upbutton.setAppearance("spinner-button-up");
    this._upbutton.setHeight("1*");
    this._buttonlayout.add(this._upbutton);

    // ************************************************************************
    //   DOWN-BUTTON
    // ************************************************************************
    this._downbutton = new qx.ui.basic.Image;
    this._downbutton.setAppearance("spinner-button-down");
    this._downbutton.setHeight("1*");
    this._buttonlayout.add(this._downbutton);

    // ************************************************************************
    //   TIMER
    // ************************************************************************
    this._timer = new qx.client.Timer(this.getInterval());

    // ************************************************************************
    //   MANAGER
    // ************************************************************************
    this.setManager(new qx.util.range.Range());
    this.initWrap();

    // ************************************************************************
    //   EVENTS
    // ************************************************************************
    this.addEventListener("keypress", this._onkeypress, this);
    this.addEventListener("keydown", this._onkeydown, this);
    this.addEventListener("keyup", this._onkeyup, this);
    this.addEventListener("mousewheel", this._onmousewheel, this);

    this._textfield.addEventListener("input", this._oninput, this);
    this._textfield.addEventListener("blur", this._onblur, this);
    this._upbutton.addEventListener("mousedown", this._onmousedown, this);
    this._downbutton.addEventListener("mousedown", this._onmousedown, this);
    this._timer.addEventListener("interval", this._oninterval, this);

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

    this.initWidth();
    this.initHeight();
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
    "change" : "qx.event.type.DataEvent"
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
      check : "Integer",
      init : 1,
      apply : "_applyIncrementAmount"
    },


    /** The amount to increment on each event (keypress or mousedown). */
    wheelIncrementAmount :
    {
      check : "Integer",
      init : 1
    },


    /** The amount to increment on each pageup / pagedown keypress */
    pageIncrementAmount :
    {
      check : "Integer",
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


    /** If minTimer was reached, how much the amount of each interval should growth (in relation to the previous interval). */
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
        old.removeEventListener("change", this._onchange, this);
      }

      if (value)
      {
        value.addEventListener("change", this._onchange, this);
      }

      // apply initital value
      this._onchange();
    },


    _applyCheckValueFunction : function(value, old) {
      this._checkValue = value;
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
     * @type member
     * @return {Integer} prefered inner width for the spinner widget
     */
    _computePreferredInnerWidth : function() {
      return 50;
    },


    /**
     * Return the prefered inner height for the spinner widget. Currently this
     * method returns 14
     *
     * @type member
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
     * @type member
     * @param e {qx.event.type.KeyEvent} keyPress event
     * @return {void}
     */
    _onkeypress : function(e)
    {
      var vIdentifier = e.getKeyIdentifier();

      if (vIdentifier == "Enter" && !e.isAltPressed())
      {
        this._checkValue(true, false, false);
        this._textfield.selectAll();
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
            if (vIdentifier >= "0" && vIdentifier <= "9") {
              return;
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
     * @type member
     * @param e {qx.event.type.KeyEvent} keyDown event
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
            this._checkValue(true, false, false);

            this._increment();
            this._timer.startWith(this.getFirstInterval());

            break;

          case "PageUp":
          case "PageDown":
            this._intervalIncrease = vIdentifier == "PageUp";
            this._intervalMode = "page";

            this._resetIncrements();
            this._checkValue(true, false, false);

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
     * @type member
     * @param e {qx.event.type.KeyEvent} keyUp event
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
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseDown event
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

      vButton.addEventListener("mouseup", this._onmouseup, this);
      vButton.addEventListener("mouseout", this._onmouseup, this);

      this._intervalIncrease = vButton == this._upbutton;
      this._resetIncrements();
      this._increment();

      this._textfield.selectAll();

      this._timer.setInterval(this.getFirstInterval());
      this._timer.start();
    },


    /**
     * Callback method for the "mouseUp" event of the spinner buttons.<br/>
     * State handling, removing event listeners at the spinner button, focusing
     * the text field and resetting the interval management (stopping timer,
     * resetting interval increase).
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseUp event
     * @return {void}
     */
    _onmouseup : function(e)
    {
      var vButton = e.getCurrentTarget();

      vButton.removeState("pressed");

      vButton.removeEventListener("mouseup", this._onmouseup, this);
      vButton.removeEventListener("mouseout", this._onmouseup, this);

      this._textfield.selectAll();
      this._textfield.setFocused(true);

      this._timer.stop();
      this._intervalIncrease = null;
    },


    /**
     * Callback method for the "mouseWheel" event.<br/>
     * Delegates the in-/decrementing to the manager and
     * selects the text field.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseWheel event
     * @return {void}
     */
    _onmousewheel : function(e)
    {
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

    /**
     * Callback method for the "input" event.<br/>
     * Delegates the further processing to the method
     * hold by the "checkValue" property.
     *
     * @type member
     * @param e {qx.event.type.DataEvent} input event
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
     * @type member
     * @param e {qx.event.type.ChangeEvent} change event
     * @return {void}
     */
    _onchange : function(e)
    {
      var vValue = this.getManager().getValue();

      this._textfield.setValue(String(vValue));

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

      this.createDispatchDataEvent("change", vValue);
    },


    /**
     * Callback method for the "blur" event.<br/>
     * Calls the method of the "checkValueFunction" property
     *
     * @type member
     * @param e {qx.event.type.FocusEvent} blur event
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
     * @type member
     * @param nValue {Number} new value of the spinner
     * @return {void}
     */
    setValue : function(nValue) {
      this.getManager().setValue(this.getManager().limit(nValue));
    },


    /**
     * Mapping to the "getValue" method of the Range manager
     *
     * @type member
     * @return {Number} Current value of the spinner
     */
    getValue : function()
    {
      this._checkValue(true);
      return this.getManager().getValue();
    },


    /**
     * Mapping to the "resetValue" method of the Range manager
     *
     * @type member
     * @return {void}
     */
    resetValue : function() {
      this.getManager().resetValue();
    },


    /**
     * Mapping to the "setMax" method of the Range manager
     *
     * @type member
     * @param vMax {Number} new max value of the spinner
     * @return {Number} new max value of the spinner
     */
    setMax : function(vMax) {
      return this.getManager().setMax(vMax);
    },


    /**
     * Mapping to the "getMax" method of the Range manager
     *
     * @type member
     * @return {Number} current max value of the spinner
     */
    getMax : function() {
      return this.getManager().getMax();
    },


    /**
     * Mapping to the "setMin" method of the Range manager
     *
     * @type member
     * @param vMin {Number} new min value of the spinner
     * @return {Number} new min value of the spinner
     */
    setMin : function(vMin) {
      return this.getManager().setMin(vMin);
    },


    /**
     * Mapping to the "getMin" method of the Range manager
     *
     * @type member
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
     * @type member
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
     * @type member
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

      if (el.value == "")
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
        // cache working variable
        var val = el.value;

        // fix leading '0'
        if (val.length > 1)
        {
          while (val.charAt(0) == "0") {
            val = val.substr(1, val.length);
          }

          var f1 = parseInt(val) || 0;

          if (f1 != el.value)
          {
            el.value = f1;
            return;
          }
        }

        // fix for negative integer handling
        if (val == "-" && acceptEmpty && this.getMin() < 0)
        {
          if (el.value != val) {
            el.value = val;
          }

          return;
        }

        // parse the string
        val = parseInt(val);

        // main check routine
        var doFix = true;
        var fixedVal = this.getManager().limit(val);

        if (isNaN(fixedVal)) {
          fixedVal = this.getManager().getValue();
        }

        // handle empty string
        if (acceptEmpty && val == "") {
          doFix = false;
        }
        else if (!isNaN(val))
        {
          // check for editmode in keypress events
          if (acceptEdit)
          {
            // fix min/max values
            if (val > fixedVal && !(val > 0 && fixedVal <= 0) && String(val).length < String(fixedVal).length) {
              doFix = false;
            } else if (val < fixedVal && !(val < 0 && fixedVal >= 0) && String(val).length < String(fixedVal).length) {
              doFix = false;
            }
          }
        }

        // apply value fix
        if (doFix && el.value != fixedVal) {
          el.value = fixedVal;
        }

        // inform manager
        if (!acceptEdit) {
          this.getManager().setValue(fixedVal);
        }
      }
    },


    /**
     * Performs a normal increment
     *
     * @type member
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
     * @type member
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
     * @type member
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
    this._disposeObjects("_textfield", "_buttonlayout", "_upbutton", "_downbutton",
      "_timer");
  }
});
