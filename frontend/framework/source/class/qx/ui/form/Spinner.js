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
 * var s = new qx.ui.form.Spinner;
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
    this._textField.addListener("input", this._onInput, this);
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
    appearance: {
      refine : true,
      init : "spinner"
    },

    /** The amount to increment on each event (keypress or mousedown). */
    singleStep: {
      check : "Number",
      init : 1
    },

    /** The amount to increment on each event (keypress or mousedown). */
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
      init : false
    },

    /** Controls whether the textfield of the spinner is editable or not */
    editable :
    {
      check : "Boolean",
      init : true,
      apply : "_applyEditable"
    },

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
    _applyMin : function(value, old) {
      this.setValue(Math.max(this.getValue(), value));
    },
    
    _applyMax : function(value, old) {
      this.setValue(Math.min(this.getValue(), value));
    },
    
    _applyValue: function(value, old) {      
      // if the spinner should NOT wrap around
      if (!this.getWrap()) {
        // if the value is greater than the max value
        if (value > this.getMax()) {
          // set the value to the max value and return
          this.setValue(this.getMax());          
          return;          
        // if the value is lower than the max value
        } else if(value < this.getMin()) {
          // set the min value and return        
          this.setValue(this.getMin());
          return;
        }
        
      } else {
        if (value > this.getMax()) {
          var tmp = value - this.getMax(); 
          this.setValue(this.getMin() + tmp - 1);
          return;
        } else if(value < this.getMin()) {        
          var tmp = value - this.getMin(); 
          this.setValue(this.getMax() + tmp + 1);
          return;
        }        
      }
      
      
      if (value < this.getMax()) {
        this._upbutton.setEnabled(true);
      } else {
        // disable the up button
        this._upbutton.setEnabled(false);
        this._upbutton.release();        
      }
      
      if (value > this.getMin()) {
        this._downbutton.setEnabled(true);
      } else {
        // disable the down button
        this._downbutton.setEnabled(false);
        this._downbutton.release();
      }
      
      this._lastValidValue = value;
      
      if (this.getNumberFormat()) {
        this._textField.setValue(this.getNumberFormat().format(value));
      } else {
        this._textField.setValue(String(value));            
      }
    },    


    _applyEditable : function(value, old)
    {
      if (this._textField) {
        this._textField.setReadOnly(!value);
      }
    },


    _applyNumberFormat : function(value, old) {      
      this._textField.setValue(this.getNumberFormat().format(this._lastValidValue));      
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
     * and "PageUp"/"PageDown" keys.
     * Starting a timer to control the incrementing of the
     * spinner value.
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyDown event
     */
    _onKeyDown: function(e) {      
      switch(e.getKeyIdentifier()) {
        case "PageUp":
          this._pageUpMode = true;
        case "Up":          
          this.__adoptText(e);
          this._upbutton.press();
          break;
          
        case "PageDown":
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
     * Detecting "Up"/"Down" and "PageUp"/"PageDown" keys.
     * If detected the interval mode and interval increase get resetted
     * and the timer for the control of the increase of the spinner value
     * gets stopped.
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
     * Delegates the in-/decrementing to the manager and
     * selects the text field.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseWheel event
     * @return {void}
     */
    _onmousewheel: function(e) {
        this.setValue(this.getValue() + this.getWheelStep() * e.getWheelDelta());
    },


    /*
    ---------------------------------------------------------------------------
      OTHER EVENT-HANDLING
    ---------------------------------------------------------------------------
    */
    _onTextChange: function(e) {
      this.__adoptText(e);
    },
    

    /**
     * Callback method for the "input" event.<br/>
     * Delegates the further processing to the method
     * hold by the "checkValue" property.
     *
     * @type member
     * @param e {qx.event.type.Data} input event
     * @return {void}
     */
    _onInput: function(e) {
      // this.info("input");
      // this._checkValue(true, true);
    },

    _onBlur: function(e) {
      this._onTextChange(e);
    },


    /*
    ---------------------------------------------------------------------------
      INTERVAL HANDLING
    ---------------------------------------------------------------------------
    */
    _countUp: function() {
      if (this._pageUpMode) {
        this.setValue(this.getValue() + this.getPageStep());
      } else {
        this.setValue(this.getValue() + this.getSingleStep());
      }
    },
    
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
    __adoptText: function(e) {
      if (this.getNumberFormat()) {
        try {
          var value = this.getNumberFormat().parse(this._textField.getValue());
          this.setValue(value);               
          return;
        } catch(e) {
        }
      } 
      
      var value = parseFloat(this._textField.getValue(), 10);     
    
      if (!isNaN(value)) {
        this.setValue(value);               
      } else {
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
