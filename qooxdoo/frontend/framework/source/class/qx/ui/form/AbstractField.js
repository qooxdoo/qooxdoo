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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The is a basic form field with common functionality between
 * {@link TextArea} and {@link TextField}.
 *
 * On each key stroke the value is synchronized with the
 * {@link #value} property. Value changes can be monitored by listening on the
 * {@link #input} or {@link #change} events.
 */
qx.Class.define("qx.ui.form.AbstractField",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {String} initial text value of the input field ({@link #value}).
   */
  construct : function(value)
  {
    this.base(arguments);

    if (value != null) {
      this.setValue(value);
    }

    // Add listeners
    var inputElement = this._contentElement;
    inputElement.addListener("input", this._onInput, this);
    inputElement.addListener("change", this._onChange, this);
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * This event is dispatched each time the user types a character into the
     * text field.
     *
     * The method {@link qx.event.type.Data#getData} return the
     * current text value of the text field.
     */
    "input" : "qx.event.type.Data",


    /**
     * This event is dispatched each time the text field looses focus and the
     * text field values has changed.
     *
     * The method {@link qx.event.type.Data#getData} return the
     * current text value of the text field.
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
    /**
     * The value of the text field.
     * The value is upated on each key stroke.
     */
    value :
    {
      check : "String",
      init : "",
      apply : "_applyValue"
    },


    /**
     * Text alignment
     */
    textAlign :
    {
      check : [ "left", "center", "right", "justify" ],
      nullable : true,
      themeable : true,
      apply : "_applyTextAlign"
    },


    /** Whether the field is read only */
    readOnly :
    {
      check : "Boolean",
      apply : "_applyReadOnly",
      init : false
    },


    // overridden
    selectable :
    {
      refine : true,
      init : true
    },


    // overridden
    focusable :
    {
      refine : true,
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
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    getFocusElement : function() {
      return this._contentElement;
    },


    /**
     * Creates the input element. Derived classes may override this
     * method, to create different input elements.
     *
     * @return {qx.html.Input} a new input element.
     */
    _createInputElement : function()
    {
      var input =  new qx.html.Input("text");
      input.setStyle("overflow", "hidden");

      return input;
    },


    // overridden
    _createContentElement : function()
    {
      var el = this._createInputElement();

      // Disable non-crossbrowser spellcheck
      el.setAttribute("spellcheck", "false");

      // Apply styles
      el.setStyles(
      {
        "border": "0 none",
        "padding": 0,
        "margin": 0,
        "background": "transparent",
        "outline": "none",
        "resize": "none",
        "appearance": "none"
      });

      return el;
    },


    // overridden
    _applyEnabled : function(value, old)
    {
      this.base(arguments, value, old);

      this._contentElement.setAttribute("disabled", value===false);
    },


    // default text sizes
    _textSize :
    {
      width : 16,
      height : 16
    },


    // overridden
    _getContentHint : function()
    {
      return {
        width : this._textSize.width * 10,
        height : this._textSize.height || 16
      };
    },


    // overridden
    _applyFont : function(value, old)
    {
      // Apply
      var styles = value ? value.getStyles() : qx.bom.Font.getDefaultStyles();
      this._contentElement.setStyles(styles);

      // Compute text size
      if (value) {
        this._textSize = qx.bom.Label.getTextSize("A", value.getStyles());
      } else {
        delete this._textSize;
      }

      // Update layout
      qx.ui.core.queue.Layout.add(this);
    },



    /*
    ---------------------------------------------------------------------------
      TEXT COLOR SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyTextColor : function(value, old)
    {
      if (value) {
        this.getContentElement().setStyle("color", value);
      } else {
        this.getContentElement().removeStyle("color");
      }
    },



    /*
    ---------------------------------------------------------------------------
      TEXTFIELD API
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyValue : function(value, old)
    {
      // Do not overwrite when already correct (on input events)
      // This is needed to keep caret position while typing.
      if (this._contentElement.getValue() != value) {
        this._contentElement.setValue(value);
      }
    },


    // property apply
    _applyTextAlign : function(value, old) {
      this._contentElement.setStyle("textAlign", value || "");
    },


    // property apply
    _applyReadOnly : function(value, old)
    {
      this._contentElement.setAttribute("readOnly", value);

      if (value) {
        this.addState("readonly");
      } else {
        this.removeState("readonly");
      }
    },





    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Input event handler.
     *
     * @type member
     */
    _onInput : function()
    {
      // Synchronize value
      var value = this._contentElement.getValue();
      this.setValue(value);

      // Fire input event
      if (this.hasListener("input")) {
        this.fireDataEvent("input", value);
      }
    },


    /**
     * Change event handler.
     *
     * @type member
     */
    _onChange : function()
    {
      // Synchronize value
      var value = this._contentElement.getValue();
      this.setValue(value);

      // Fire change event
      if (this.hasListener("change")) {
        this.fireDataEvent("change", value);
      }
    }
  }
});
