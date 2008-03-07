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
 *
 * @appearance spinner
 *
 * @appearance spinner-field {qx.ui.form.TextField}
 *
 * @appearance spinner-button-up {qx.ui.form.Button}
 * @state pressed {spinner-button-up}
 *
 * @appearance spinner-button-down {qx.ui.form.Button}
 * @state pressed {spinner-button-down}
 */
qx.Class.define("qx.ui.form.Spinner",
{
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vMin, vValue, vMax)
  {
    this.base(arguments);

    //   MAIN LAYOUT
    this._mainLayout = new qx.ui.layout.Grid();
    this._mainLayout.setColumnFlex(0, 1);
    this._mainLayout.setRowFlex(0,1);
    this._mainLayout.setRowFlex(1,1);
    this.setLayout(this._mainLayout);
    //   TEXTFIELD
    this._textField = new qx.ui.form.TextField();
    this._textField.setAppearance("spinner-text-field");
    this._textField.setWidth(40);
    this._mainLayout.add(this._textField, 0, 0, {rowSpan: 2});
    
    //   UP-BUTTON
    this._upbutton = new qx.ui.form.RepeatButton();
    this._upbutton.setAppearance("spinner-button-up");
    this._mainLayout.add(this._upbutton, 0, 1);

    //   DOWN-BUTTON
    this._downbutton = new qx.ui.form.RepeatButton();
    this._downbutton.setAppearance("spinner-button-down");
    this._mainLayout.add(this._downbutton, 1, 1);

    //   EVENTS
    this.addListener("keydown", this._onKeyDown, this);
    this.addListener("keyup", this._onKeyUp, this);
    this.addListener("mousewheel", this._onmousewheel, this);
    this._textField.addListener("change", this._onTextChange, this);
    this._textField.addListener("blur", this._onBlur, this);
    this._upbutton.addListener("execute", this._countUp, this);
    this._downbutton.addListener("execute", this._countDown, this);

    //   INITIALIZATION
    if (vMin != null) {
      this.setMin(vMin);
    }

    if (vMax != null) {
      this.setMax(vMax);
    }

    if (vValue != null) {
      this.setValue(vValue);
    }
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

  properties: {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */
    /** Defines the apperance of the widget. (initial "spinner") */
    appearance: {
      refine : true,
      init : "spinner"
    },

    /** The amount to increment on each event (keypress or mousedown) */
    singleStep: {
      check : "Number",
      init : 1
    },

    /** The amount to increment on each event (keypress or mousedown) */
    wheelStep: {
      check : "Number",
      init : 1
    },

    /** The amount to increment on each pageup / pagedown keypress */
    pageStep: {
      check : "Number",
      init : 10
    },

    /** minimal value of the Range object */
    min: {
      check : "Number",
      apply : "_applyMin",
      event : "change",
      init : 0
    },

    /** current value of the Range object */
    value: {
      check : "Number",
      apply : "_applyValue",
      init : 0,
      event : "change"
    },

    /** maximal value of the Range object */
    max: {
      check : "Number",
      apply : "_applyMax",
      event : "change",
      init : 100
    },

    /** whether the value should wrap around */
    wrap: {
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
    numberFormat : {
      check : "qx.util.format.NumberFormat",
      apply : "_applyNumberFormat",
      nullable : true
    },


    allowGrowY :
    {
      refine : true,
      init : false
    },


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
    /*
    ---------------------------------------------------------------------------
      APPLY METHODS
    ---------------------------------------------------------------------------
    */
    /**
     * Apply routine for the min property.<br/>
     * It sets the value of the spinner to the maximum of the current spinner
     * value and the given min property value.
     * 
     * @type member
     * @param value {Number} The new value of the min property
     * @param old {Number} The old value of the min property
     */
    _applyMin : function(value, old) {
      this.setValue(Math.max(this.getValue(), value));
    },


    /**
     * Apply routine for the max property.<br/>
     * It sets the value of the spinner to the minnimum of the current spinner 
     * value and the given max property value.
     * 
     * @type member
     * @param value {Number} The new value of the max property
     * @param old {Number} The old value of the max property
     */    
    _applyMax : function(value, old) {
      this.setValue(Math.min(this.getValue(), value));
    },


    /**
     * Apply routine for the value property.<br/>
     * It checks the min and max values, disables / enables the
     * buttons and handles the wrap around. 
     * 
     * @type member
     * @param value {Number} The new value of the spinner
     * @param old {Number} The former value of the spinner
     */
    _applyValue: function(value, old) {
      // if the spinner should NOT wrap around
      if (!this.getWrap()) {
        // if the value is greater than the max value
        if (value > this.getMax()) {
          // ATTENTION!!!
          // Set the new value in a timer to avoid endles recursion becaus 
          // of the peroperty system!
          var self = this;
          window.setTimeout(function() {
            // set the value to the max value and return
            self.setValue(self.getMax());
          }, 0);
          return;
        // if the value is lower than the max value
        } else if(value < this.getMin()) {
          // ATTENTION!!!
          // Set the new value in a timer to avoid endles recursion becaus 
          // of the peroperty system!
          var self = this;
          window.setTimeout(function() {
            // set the min value and return
            self.setValue(self.getMin());
          }, 0);
          return;
        }
      // if the spinner should wrapp around  
      } else {
        // if the valus is over the max value
        if (value > this.getMax()) {
          // set the new value and reuturn
          var tmp = value - this.getMax(); 
          this.setValue(this.getMin() + tmp - 1);
          return;
        // if the value is lower than the min value
        } else if(value < this.getMin()) {
          // set the new value and return
          var tmp = value - this.getMin(); 
          this.setValue(this.getMax() + tmp + 1);
          return;
        }        
      }
      
      // up button enabled/disabled
      if (value < this.getMax()) {
        // only enable the button if the spinner itself is enabled
        if (this.getEnabled()) {
          this._upbutton.setEnabled(true);
        }
      } else {
        // only disable the buttons if wrapping is disabled
        if (!this.getWrap()) {
          // first release the button
          this._upbutton.release();
          // then disable the up button
          this._upbutton.setEnabled(false);
        }
      }
      // down button enabled/disabled
      if (value > this.getMin()) {
        // only enable the button if the spinner itself is enabled
        if (this.getEnabled()) {
          this._downbutton.setEnabled(true);
        }
      } else {
        // only disable the buttons if wrapping is disabled
        if (!this.getWrap()) {
          // first release the button
          this._downbutton.release();
          // then disable the down button
          this._downbutton.setEnabled(false);
        }
      }

      // save the last valid value of the spinner
      this._lastValidValue = value;
      
      // write the value of the spinner to the textfield
      if (this.getNumberFormat()) {
        this._textField.setValue(this.getNumberFormat().format(value));
      } else {
        this._textField.setValue(String(value));            
      }
    },


    /**
     * Apply routine for the editable property.<br/>
     * It sets the textfield of the spinner to not read only.
     * 
     * @type member
     * @param value {Boolean} The new value of the editable property
     * @param old {Boolean} The former value of the editable property
     */
    _applyEditable : function(value, old)
    {
      if (this._textField) {
        this._textField.setReadOnly(!value);
      }
    },


    /**
     * Apply routine for the wrap property.<br/>
     * Enables all buttons if the wrapping is enabled.
     * 
     * @type member
     * @param value {Boolean} The new value of the wrap property
     * @param old {Boolean} The former value of the wrap property
     */
    _applyWrap : function(value, old)
    {
      if (value) {
        if (this.getEnabled()) {
          this._upbutton.setEnabled(true);
          this._downbutton.setEnabled(true);
        }
      }
    },

    /**
     * Apply routine for the numberFormat property.<br/>
     * When setting a number format, the display of the 
     * value in the textfield will be changed immediately.
     * 
     * @type member
     * @param value {Boolean} The new value of the numberFormat property
     * @param old {Boolean} The former value of the numberFormat property
     */
    _applyNumberFormat : function(value, old) {
      this._textField.setValue(this.getNumberFormat().format(this._lastValidValue));      
    },

    // overridden
    _applyEnabled : function(value, old) {
      if (value === false) {
        // disable the spinner
        this.addState("disabled");
        // diable the buttons separately becaus they will be enabled explicit 
        this._upbutton.setEnabled(false);
        this._downbutton.setEnabled(false);
      } else {
        // enable the spinner
        this.removeState("disabled");
        // enable the buttons separately becaus they will be disabled explicit
        this._upbutton.setEnabled(true);
        this._downbutton.setEnabled(true);
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
     * @type member
     * @param e {qx.event.type.KeyEvent} keyDown event
     */
    _onKeyDown: function(e) {
      switch(e.getKeyIdentifier()) {
        case "PageUp":
          // mark that the spinner is in page mode and process further
          this._pageUpMode = true;
        case "Up":
          this.__adoptText(e);
          this._upbutton.press();
          break;
          
        case "PageDown":
          // mark that the spinner is in page mode and process further
          this._pageDownMode = true;
        case "Down":        
          this.__adoptText(e);
          this._downbutton.press();
          break;
      }
      e.stopPropagation();
    },


    /**
     * Callback for "keyUp" event.<br/>
     * Detecting "Up"/"Down" and "PageUp"/"PageDown" keys.<br/>
     * Releases the button and disabled the page mode, if necessary. 
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyUp event
     * @return {void}
     */
    _onKeyUp: function(e) {
      switch(e.getKeyIdentifier()) {
        case "PageUp":
          this._upbutton.release();
          this._pageUpMode = false;
          break;
        case "Up":
          this._upbutton.release();
          break;
          
        case "PageDown":
          this._downbutton.release();
          this._pageDownMode = false;
          break;
        case "Down":
          this._downbutton.release();
          break;
      }
    },


    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT-HANDLING
    ---------------------------------------------------------------------------
    */
    /**
     * Callback method for the "mouseWheel" event.<br/>
     * Increments or decrements the value of the spinner.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseWheel event
     */
    _onmousewheel: function(e) {
        this.setValue(this.getValue() + this.getWheelStep() * e.getWheelDelta());
    },


    /*
    ---------------------------------------------------------------------------
      OTHER EVENT-HANDLING
    ---------------------------------------------------------------------------
    */
    /**
     * Callback method for the "change" event of the textfield.<br/>
     * Just calls the internal {#__adoptText} method.
     * 
     * @type member
     * @param e {qx.ui.event.type.Event} text change event or blur event
     */
    _onTextChange: function(e) {
      this.__adoptText(e);
    },


    /**
     * Callback method for the "blur" event of the textfield.<br/>
     * Just calls the internal {#_onTextChange} method with the event as parameter.
     * 
     * @type member
     * @param e {qx.ui.event.type.Event} blur event
     */
    _onBlur: function(e) {
      this._onTextChange(e);
    },


    /*
    ---------------------------------------------------------------------------
      INTERVAL HANDLING
    ---------------------------------------------------------------------------
    */
    /**
     * Checks if the spinner is in page mode and couts  either the single 
     * or page Step up.
     * 
     * @type member
     */
    _countUp: function() {
      if (this._pageUpMode) {
        this.setValue(this.getValue() + this.getPageStep());
      } else {
        this.setValue(this.getValue() + this.getSingleStep());
      }
    },


    /**
     * Checks if the spinner is in page mode and couts  either the single 
     * or page Step down.
     * 
     * @type member
     */
    _countDown: function() {
      if (this._pageDownMode) {
        this.setValue(this.getValue() - this.getPageStep());
      } else {
        this.setValue(this.getValue() - this.getSingleStep());
      }
    },


    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */
    /**
     * Tryes to parse the current text in the textfield and set it as 
     * spinner value. If the value can be not be parsed, the last valid value 
     * will be set to the textfield as well as to the spinner value.
     * 
     * @type member
     */
    __adoptText: function(e) {
      // if a number format is set
      if (this.getNumberFormat()) {
        // try to parse the current number using the number format
        try {
          var value = this.getNumberFormat().parse(this._textField.getValue());
          // if the arsing succeeded, set the value and done
          this.setValue(value);
          return;
        } catch(e) {
          // otherwise, process further
        }
      } 
      
      // try to parse the number as a float
      var value = parseFloat(this._textField.getValue(), 10);
      // if the result is a number
      if (!isNaN(value)) {
        // set the value in the spinner
        this.setValue(value);
      } else {
        // otherwise, reset the last valid value
        this._textField.setValue(String(this._lastValidValue));
      }
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

    this._disposeObjects("_textField", "_buttonlayout", "_upbutton", "_downbutton");
  }
});
