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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.ui.mobile.form.Input",
{
  extend : qx.ui.mobile.core.Widget,
  type : "abstract",


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(value)
  {
    this.base(arguments);
    if (value) {
      this.setValue(value);
    }

    this.initType();
    this.initSize();
    this.initMaxLength();
    this.initReadonly();
    this.initPlaceholder();

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
    liveUpdate :
    {
      check : "Boolean",
      init : false
    },


    type :
    {
      check : "String",
      nullable : true,
      init : null,
      apply : "_applyAttribute"
    },


    placeholder :
    {
      check : "String",
      nullable : true,
      init : null,
      apply : "_applyAttribute"
    },


    size :
    {
      check : "Integer",
      nullable : true,
      init : null,
      apply : "_applyAttribute"
    },


    maxLength :
    {
      check : "Integer",
      nullable : true,
      init : null,
      apply : "_applyAttribute"
    },


    readonly :
    {
      check : "Boolean",
      nullable : true,
      init : null,
      apply : "_applyAttribute"
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

    // overridden
    _getTagName : function()
    {
      return "input";
    },


    _convertValue : function(value)
    {
      return value || "";
    },


    setValue : function(value)
    {
      value = this._convertValue();
      if (this.__oldValue != value)
      {
        this._setAttribute("value", value);
        this.__fireChangeValue(value);
      }
    },


    getValue : function()
    {
      return this._getAttribute("value");
    },


    resetValue : function()
    {
      this.setValue(null);
    },


    _onChangeContent : function(evt)
    {
      this.__fireChangeValue(this._convertValue(evt.getData()));
    },


    _onInput : function(evt)
    {
      this.fireDataEvent("input", evt.getData(), true);
      if (this.getLiveUpdate())
      {
        this.setValue(evt.getData());
      }
    },


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
