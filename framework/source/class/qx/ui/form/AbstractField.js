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
 * This is a basic form field with common functionality for 
 * {@link TextArea} and {@link TextField}.
 *
 * On every keystroke the value is synchronized with the
 * {@link #value} property. Value changes can be monitored by listening to the
 * {@link #input} or {@link #changeValue} events, respectively.
 */
qx.Class.define("qx.ui.form.AbstractField",
{
  extend : qx.ui.core.Widget,
  implement : [
    qx.ui.form.IFormElement,
    qx.ui.form.IStringForm,
    qx.ui.form.IForm
  ],
  include : [
    qx.ui.form.MFormElement,
    qx.ui.form.MForm
  ],
  type : "abstract",



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

    this.getContentElement().addListener("change", this._onChangeContent, this);
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
     * current text value of the text field.
     * 
     * @deprecated
     */
    "input" : "qx.event.type.Data",


    /**
     * The event is fired each time the text field looses focus and the
     * text field values has changed.
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
     * Alignment of the text
     */
    textAlign :
    {
      check : [ "left", "center", "right" ],
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
    },

    /** Maximal number of characters that can be entered in the TextArea. */
    maxLength :
    {
      check : "PositiveInteger",
      init : Infinity
    },
    
    /** 
     * Whether the {@link #changeValue} event should be fired on every key 
     * input.
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

    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    getFocusElement : function() {
      return this.getContentElement();
    },


    /**
     * Creates the input element. Derived classes may override this
     * method, to create different input elements.
     *
     * @return {qx.html.Input} a new input element.
     */
    _createInputElement : function() {
      return new qx.html.Input("text");
    },


    // overridden
    _createContentElement : function()
    {
      var el = this._createInputElement();
      
      // Add listener for input event
      el.addListener("input", this._onHtmlInput, this);

      // Disable spellcheck in gecko
      if (qx.core.Variant.isSet("qx.client", "gecko")) {
        el.setAttribute("spellcheck", "false");
      }

      // Apply styles
      el.setStyles(
      {
        "border": "none",
        "padding": 0,
        "margin": 0,
        "display" : "block",
        "background" : "transparent",
        "outline": "none",
        "appearance": "none",
        "autoComplete": "off"
      });

      // Block resize handle in Safari
      if (qx.core.Variant.isSet("qx.client", "webkit")) {
        el.setStyle("resize", "none");
      }

      return el;
    },


    // overridden
    _applyEnabled : function(value, old)
    {
      this.base(arguments, value, old);

      this.getContentElement().setAttribute("disabled", value===false);
    },


    // default text sizes
    __textSize :
    {
      width : 16,
      height : 16
    },


    // overridden
    _getContentHint : function()
    {
      return {
        width : this.__textSize.width * 10,
        height : this.__textSize.height || 16
      };
    },


    // overridden
    _applyFont : function(value, old)
    {
      // Apply
      var styles;
      if (value)
      {
        var font = qx.theme.manager.Font.getInstance().resolve(value);
        styles = font.getStyles();
      }
      else
      {
        styles = qx.bom.Font.getDefaultStyles()
      }
      this.getContentElement().setStyles(styles);

      // Compute text size
      if (value) {
        this.__textSize = qx.bom.Label.getTextSize("A", styles);
      } else {
        delete this.__textSize;
      }

      // Update layout
      qx.ui.core.queue.Layout.add(this);
    },


    // overridden
    _applyTextColor : function(value, old)
    {
      if (value) {
        this.getContentElement().setStyle("color", qx.theme.manager.Color.getInstance().resolve(value));
      } else {
        this.getContentElement().removeStyle("color");
      }
    },


    // overridden
    tabFocus : function()
    {
      this.base(arguments);

      this.selectAll();
    },

    /**
     * Returns the text size.
     * @return {Map} The text size.
     */
    _getTextSize : function() {
      return this.__textSize;
    },

    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for native input events. Redirects the event
     * to the widget.
     *
     * @param e {qx.event.type.Data} Input event
     */
    _onHtmlInput : function(e)
    {
      var value = e.getData();
      if (value.length < this.getMaxLength()) {
        // @deprecated: remove the input event
        this.fireDataEvent("input", e.getData());
        // check for the live change event
        if (this.getLiveUpdate()) {
          this.fireNonBubblingEvent(
            "changeValue", qx.event.type.Data, [value]
          );
        }
      } else {
        this.getContentElement().setValue(value.substr(0, this.getMaxLength()));
      }
    },

    /*
    ---------------------------------------------------------------------------
      TEXTFIELD VALUE API
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the value of the textfield to the given value.
     *
     * @param value {String} The new value
     */
    setValue : function(value)
    {
      // handle null values
      if (value === null) {
        value = "";
      }
      if (qx.lang.Type.isString(value))
      {
        var elem = this.getContentElement();
        if (value.length > this.getMaxLength()) {
          value = value.substr(0, this.getMaxLength());
        }
        if (elem.getValue() != value)
        {
          var oldValue = elem.getValue();
          elem.setValue(value);
          this.fireNonBubblingEvent(
            "changeValue", qx.event.type.Data, [value, oldValue]
          );
        }
        return value;
      }
      throw new Error("Invalid value type: " + value);
    },


    /**
     * Returns the current value of the textfield.
     *
     * @return {String} The current value
     */
    getValue : function() {
      return this.getContentElement().getValue();
    },
    
    
    /**
     * Resets the value to the default
     */
    resetValue : function() {
      this.setValue("");
    },


    /**
     * Event listener for change event of content element
     *
     * @param e {qx.event.type.Data} Incoming change event
     */
    _onChangeContent : function(e) {
      this.fireNonBubblingEvent("changeValue", qx.event.type.Data, [e.getData()]);
    },

    // @deprecated
    // overridden
    addListener: function(type, listener, self, capture) {
      if (type == "input") {
        qx.log.Logger.deprecatedEventWarning(
          arguments.callee, 
          "input",
          "Please use the changeValue event instead."
        );        
      }
      return this.base(arguments, type, listener, self, capture);
    },


    /*
    ---------------------------------------------------------------------------
      TEXTFIELD SELECTION API
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the current selection.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {String|null}
     */
    getSelection : function() {
      return this.getContentElement().getSelection();
    },


    /**
     * Returns the current selection length.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {Integer|null}
     */
    getSelectionLength : function() {
      return this.getContentElement().getSelectionLength();
    },


    /**
     * Set the selection to the given start and end (zero-based).
     * If no end value is given the selection will extend to the
     * end of the textfield's content.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @param start {Integer} start of the selection (zero-based)
     * @param end {Integer} end of the selection
     * @return {void}
     */
    setSelection : function(start, end) {
      this.getContentElement().setSelection(start, end);
    },


    /**
     * Clears the current selection.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {void}
     */
    clearSelection : function() {
      this.getContentElement().clearSelection();
    },


    /**
     * Selects the whole content
     *
     * @return {void}
     */
    selectAll : function() {
      this.setSelection(0);
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyTextAlign : function(value, old) {
      this.getContentElement().setStyle("textAlign", value);
    },


    // property apply
    _applyReadOnly : function(value, old)
    {
      var element = this.getContentElement();

      element.setAttribute("readOnly", value);

      // Prevent native focus
      element.setAttribute("qxKeepFocus", value ? "on" : "off");

      if (value)
      {
        this.addState("readonly");
        this.setFocusable(false);
      }
      else
      {
        this.removeState("readonly");
        this.setFocusable(true);
      }
    }

  }
});
