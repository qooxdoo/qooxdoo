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
 * The mixin contains all functionality to provide a value property for input
 * widgets.
 *
 * @require(qx.event.handler.Input)
 */
qx.Mixin.define("qx.ui.mobile.form.MValue",
{

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {var?null} The value of the widget.
   */
  construct : function(value)
  {
    if (value) {
      this.setValue(value);
    }

    if (this._getTagName() == "input" || this._getTagName() == "textarea") {
      qx.event.Registration.addListener(this.getContentElement(), "change", this._onChangeContent, this);
      qx.event.Registration.addListener(this.getContentElement(), "input", this._onInput, this);
    }

    this.addListener("focus", this._onFocus,this);
    this.addListener("blur", this._onBlur,this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * The event is fired on every keystroke modifying the value of the field.
     *
     * The method {@link qx.event.type.Data#getData} returns the
     * current value of the text field.
     */
    "input" : "qx.event.type.Data",


    /**
     * The event is fired each time the text field looses focus and the
     * text field values has changed.
     *
     * If you change {@link #liveUpdate} to true, the changeValue event will
     * be fired after every keystroke and not only after every focus loss. In
     * that mode, the changeValue event is equal to the {@link #input} event.
     *
     * The method {@link qx.event.type.Data#getData} returns the
     * current text value of the field.
     */
    "changeValue" : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether the {@link #changeValue} event should be fired on every key
     * input. If set to true, the changeValue event is equal to the
     * {@link #input} event.
     */
    liveUpdate :
    {
      check : "Boolean",
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
    __oldValue : null,
    __inputTimeoutHandle : null,
    __hasFocus : null,


    /**
     * Converts the incoming value.
     *
     * @param value {var} The value to convert
     * @return {var} The converted value
     */
    _convertValue : function(value)
    {
      if(typeof value === 'boolean')
      {
        return value;
      }
      else if (typeof value === 'number')
      {
        return value;
      }
      else
      {
        return value || "";
      }
    },


    /**
    * Handler for <code>focus</code> event.
    */
    _onFocus : function() {
      this.__hasFocus = true;
    },


    /**
    * Handler for <code>blur</code> event.
    */
    _onBlur : function() {
      this.__hasFocus = false;
    },


    /**
    * Returns whether this widget has focus or not.
    * @return {Boolean} <code>true</code> or <code>false</code>
    */
    hasFocus : function() {
      return this.__hasFocus;
    },


    /**
     * Sets the value.
     *
     * @param value {var} The value to set
     */
    setValue : function(value)
    {
      value = this._convertValue(value);
      if (this.__oldValue != value)
      {
        if (this._setValue) {
          this._setValue(value);
        } else {
          this._setAttribute("value", value);
        }
        this.__fireChangeValue(value);
      }
    },

    /**
     * Returns the set value.
     *
     * @return {var} The set value
     */
    getValue : function()
    {
      return this._convertValue(this._getValue ? this._getValue() : this._getAttribute("value"));
    },


    /**
     * Resets the value.
     */
    resetValue : function()
    {
      this.setValue(null);
    },


    /**
     * Event handler. Called when the {@link #changeValue} event occurs.
     *
     * @param evt {qx.event.type.Data} The event, containing the changed content.
     */
    _onChangeContent : function(evt)
    {
      this.__fireChangeValue(this._convertValue(evt.getData()));
    },


    /**
     * Event handler. Called when the {@link #input} event occurs.
     *
     * @param evt {qx.event.type.Data} The event, containing the changed content.
     */
    _onInput : function(evt)
    {
      var data = evt.getData();
      this.fireDataEvent("input", data, true);
      if (this.getLiveUpdate()) {
        if (this._setValue) {
          this._setValue(data);
        } else {
          this.__fireChangeValue(this._convertValue(data));
        }
      }
    },


    /**
    * Returns the caret position of this widget.
    * @return {Integer} the caret position.
    */
    _getCaretPosition : function() {
      var val = this.getContentElement().value;
      if(val && this._getAttribute("type") !== "number") {
        return val.slice(0, this.getContentElement().selectionStart).length;
      } else {
        return val.length;
      }
    },


    /**
     * Sets the caret position on this widget.
     * @param position {Integer} the caret position.
     */
    _setCaretPosition: function(position) {
      if (position != null && this.hasFocus()) {
        if (this._getAttribute("type") !== "number" && this.getContentElement().setSelectionRange) {
          this.getContentElement().setSelectionRange(position, position);
        }
      }
    },


    /**
     * Fires the {@link #changeValue} event.
     *
     * @param value {var} The current value to fire.
     */
    __fireChangeValue : function(value)
    {
      if (this.__oldValue != value)
      {
        this.__oldValue = value;
        this.fireDataEvent("changeValue", value);
      }
    }
  },


  destruct : function() {
    this.removeListener("focus", this._onFocus,this);
    this.removeListener("blur", this._onBlur,this);
  }
});
