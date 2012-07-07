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
/* ************************************************************************

#require(qx.event.handler.Input)

************************************************************************ */

/**
 * The mixin contains all functionality to provide a value property for input
 * widgets.
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

    qx.event.Registration.addListener(this.getContentElement(), "change", this._onChangeContent, this);
    qx.event.Registration.addListener(this.getContentElement(), "input", this._onInput, this);
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


    /**
     * Converts the incoming value.
     *
     * @param value {var} The value to convert
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
     *
     * @return {var} The set value
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
      this.fireDataEvent("input", evt.getData(), true);
      if (this.getLiveUpdate())
      {
        this.setValue(evt.getData());
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
        this.fireDataEvent("changeValue", value)
      }
    }
  }
});
