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
 * An advanced wrapper for the HTML <code>&lt;input type="text"&gt;</code> tag.
 *
 * It is used for textual user input.
 *
 * @appearance text-field
 */
qx.Class.define("qx.ui.form.TextField",
{
  extend : qx.ui.basic.Terminator,




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

    // Apply value
    if (value != null) {
      this.setValue(value);
    }

    // Initialize Properties
    this.initHideFocus();
    this.initWidth();
    this.initHeight();
    this.initTabIndex();
    this.initSpellCheck();

    // Inline event wrapper
    this.__oninput = qx.lang.Function.bindEvent(this._oninputDom, this);

    // Add listeners
    this.addEventListener("blur", this._onblur);
    this.addEventListener("focus", this._onfocus);
    this.addEventListener("input", this._oninput);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      VALIDATION
    ---------------------------------------------------------------------------
    */

    /**
     * Create a validator function from a regular expression.
     * If the input string matches the regular expression, the
     * text is considered valid.
     *
     * @type static
     * @param vRegExp {RegExp} Regular expression to match the text against.
     * @return {Function} Validator function.
     */
    createRegExpValidator : function(vRegExp)
    {
      return function(s) {
        return vRegExp.test(s);
      };
    }
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * Fired each time the user types in the text field. The data property
     * of the event contains the value of the text field.
     */
    "input" : "qx.event.type.DataEvent"
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    allowStretchX :
    {
      refine : true,
      init : true
    },

    allowStretchY :
    {
      refine : true,
      init : false
    },

    appearance :
    {
      refine : true,
      init : "text-field"
    },

    tabIndex :
    {
      refine : true,
      init : 1
    },

    hideFocus :
    {
      refine : true,
      init : true
    },

    width :
    {
      refine : true,
      init : "auto"
    },

    height :
    {
      refine : true,
      init : "auto"
    },

    selectable :
    {
      refine : true,
      init : true
    },

    /**
     * The value of the text field.
     * The value is by default updated when the input field looses the focus (blur).
     * If the property {@link #liveUpdate} is set to <code>true</code>, the value is
     * upated on each key stroke.
     */
    value :
    {
      init : "",
      nullable : true,
      event : "changeValue",
      apply : "_applyValue"
    },

    /**
     * The alignment of the text inside the box
     */
    textAlign :
    {
      check : [ "left", "center", "right", "justify" ],
      nullable : true,
      themeable : true,
      apply : "_applyTextAlign"
    },

    /**
     * Whether the browser's build in spell check should be enabled
     * for this input field. Currently affets only FireFox >= 2.
     *
     * Documented at http://developer.mozilla.org/en/docs/Controlling_spell_checking_in_HTML_forms
     */
    spellCheck :
    {
      check : "Boolean",
      init : false,
      apply : "_applySpellCheck"
    },

    /**
     * Whether the property {@link #value} should be updated "live" on each key
     * stroke or only on focus blur (default).
     */
    liveUpdate :
    {
      check : "Boolean",
      init : false
    },

    /** Maximum number of characters in the input field. */
    maxLength :
    {
      check : "Integer",
      apply : "_applyMaxLength",
      nullable : true
    },

    /** Whether the field is read only */
    readOnly :
    {
      check : "Boolean",
      apply : "_applyReadOnly",
      init : false
    },

    /**
     * Set validator function. The validator function should take a
     * string as input and return a boolean value whether the string
     * is valid. The validator is used by the functions {@link #isValid}
     * and {@link #isComputedValid}.
     */
    validator :
    {
      check : "Function",
      event : "changeValidator",
      nullable : true
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
      PROTECTED CONTROLS
    ---------------------------------------------------------------------------
    */

    _inputTag : "input",
    _inputType : "text",
    _inputOverflow : "hidden",



    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyElement : function(value, old)
    {
      this.base(arguments, value, old);

      if (value)
      {
        var inp = this._inputElement = document.createElement(this._inputTag);

        // Apply type
        if (this._inputType) {
          inp.type = this._inputType;
        }

        // Disable auto complete
        // setAttribute() is needed for gecko
        inp.autoComplete = "off";
        inp.setAttribute("autoComplete", "off");

        // Apply properties
        inp.disabled = this.getEnabled()===false;
        inp.readOnly = this.getReadOnly();
        inp.value = this.getValue() ? this.getValue() : "";

        if (this.getMaxLength() != null) {
          inp.maxLength = this.getMaxLength();
        }

        // Normalize styles
        var istyle = inp.style;
        istyle.padding = istyle.margin = 0;
        istyle.border = "0 none";
        istyle.background = "transparent";
        istyle.overflow = this._inputOverflow;
        istyle.outline = "none";
        istyle.resize = "none";

        // Disable browser appearance
        istyle.WebkitAppearance = "none";
        istyle.MozAppearance = "none";

        // Emulate IE hard-coded margin
        // Mozilla by default emulates this IE handling, but in a wrong
        // way. IE adds the additional margin to the CSS margin where
        // Mozilla replaces it. But this make it possible for the user
        // to overwrite the margin, which is not possible in IE.
        // See also: https://bugzilla.mozilla.org/show_bug.cgi?id=73817
        if (qx.core.Variant.isSet("qx.client", "gecko|opera|webkit")) {
          istyle.margin = "1px 0"
        }

        // Sync font, color, textAlign and cursor
        this._renderFont();
        this._renderTextColor();
        this._renderTextAlign();
        this._renderCursor();
        this._renderSpellCheck();

        // Register inline event
        if (qx.core.Variant.isSet("qx.client", "mshtml")) {
          inp.onpropertychange = this.__oninput;
        } else {
          inp.addEventListener("input", this.__oninput, false);
        }

        // Append to real element
        value.appendChild(inp);
      }
    },


    /**
     * We could not use width/height = 100% because the outer elements
     * could have paddings and borders which will break. We use the
     * computed inner width/height instead
     *
     * @return {void}
     */
    _postApply : function()
    {
      this._syncFieldWidth();
      this._syncFieldHeight();
    },

    /**
     * Changes the inner width of the text field.
     * Calls the protected method {@link #_syncFieldWidth} to
     * sync the inner width.
     *
     * @param value {Number} new value
     * @param old {Number} old value
     * @return {void}
     */
    _changeInnerWidth : function(value, old) {
      this._syncFieldWidth();
    },

    /**
     * Changes the inner height of the text field.
     * Calls the protected method {@link #_syncFieldHeight} to
     * sync the inner height.
     *
     * @param value {Number} new value
     * @param old {Number} old value
     * @return {void}
     */
    _changeInnerHeight : function(value, old) {
      this._syncFieldHeight();
    },


    /**
     * Synchronizes the styleProperty <code>width</code> with
     * the current <code>innerWidth</code>
     *
     * @return {void}
     */
    _syncFieldWidth : function()
    {
      this._inputElement.style.width = this.getInnerWidth() + "px";
    },


    /**
     * Synchronizes the styleProperty <code>width</code> with
     * the current <code>innerWidth</code>
     *
     * @return {void}
     */
    _syncFieldHeight : function()
    {
      // Reduce height by 2 pixels (the manual or mshtml margin)
      this._inputElement.style.height = (this.getInnerHeight() - 2) + "px";
    },


    _applyCursor : function(value, old)
    {
      if (this._inputElement) {
        this._renderCursor();
      }
    },


    /**
     * Renders the cursor using the styleProperty <code>cursor</code> directly.
     */
    _renderCursor : function()
    {
      var style = this._inputElement.style;
      var value = this.getCursor();

      if (value)
      {
        if (value == "pointer" && qx.core.Client.getInstance().isMshtml()) {
          style.cursor = "hand";
        } else {
          style.cursor = value;
        }
      }
      else
      {
        style.cursor = "";
      }
    },

    _applyTextAlign : function(value, old)
    {
      if (this._inputElement) {
        this._renderTextAlign();
      }
    },


    /**
     * Renders the text align using the styleProperty <code>textAlign</code> directly.
     */
    _renderTextAlign : function() {
      this._inputElement.style.textAlign = this.getTextAlign() || "";
    },


    _applySpellCheck : function(value, old)
    {
      if (this._inputElement) {
        this._renderSpellCheck();
      }
    },

    /**
     * Applies the spell check to the DOM element.
     */
    _renderSpellCheck : function() {
      this._inputElement.spellcheck = this.getSpellCheck();
    },


    /**
     * Apply the enabled property.
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyEnabled : function(value, old)
    {
      if (this._inputElement) {
        this._inputElement.disabled = value===false;
      }

      return this.base(arguments, value, old);
    },


    /**
     * Apply the value property
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyValue : function(value, old)
    {
      this._inValueProperty = true;

      if (this._inputElement)
      {
        if (value === null) {
          value = "";
        }

        if (this._inputElement.value !== value) {
          this._inputElement.value = value;
        }
      }

      delete this._inValueProperty;
    },


    /**
     * Apply the maxLength property.
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMaxLength : function(value, old)
    {
      if (this._inputElement) {
        this._inputElement.maxLength = value == null ? "" : value;
      }
    },


    /**
     * Apply the readOnly property.
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyReadOnly : function(value, old)
    {
      if (this._inputElement) {
        this._inputElement.readOnly = value;
      }

      if (value) {
        this.addState("readonly");
      } else {
        this.removeState("readonly");
      }
    },


    /**
    * TODOC
    *
    * @type member
    * @param value {var} Current value
    * @param old {var} Previous value
    */
    _applyTextColor : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleTextColor, this, value);
    },


    /**
     * Sync color to embedded input element
     *
     * @param value {String} new color value to render
     * @return {void}
     */
    _styleTextColor : function(value)
    {
      this.__textColor = value;
      this._renderTextColor();
    },


    /**
    * Renders the color using the styleProperty <code>color</code> directly.
    *
    * @return {void}
    */
    _renderTextColor : function()
    {
      var inp = this._inputElement;

      if (inp) {
        inp.style.color = this.__textColor || "";
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyFont : function(value, old) {
      qx.theme.manager.Font.getInstance().connect(this._styleFont, this, value);
    },


    /**
     * Utility method to render the given font. Calls the
     * {@link #_renderFont} method.
     *
     * @type member
     * @param value {qx.ui.core.Font} new font value to render
     * @return {void}
     */
    _styleFont : function(value)
    {
      this.__font = value;
      this._renderFont();
    },


    /**
     * Renders the new font
     *
     * @return {void}
     */
    _renderFont : function()
    {
      var inp = this._inputElement;

      if (inp)
      {
        var value = this.__font;
        value ? value.renderElement(inp) : qx.ui.core.Font.resetElement(inp);
      }
    },








    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Overridden from {@link qx.ui.core.Widget#_visualizeFocus}: set the focus to the inputElement
     * and not to the parent div.
     *
     * @type member
     */
    _visualizeFocus : function()
    {
      this.base(arguments);

      if (!qx.event.handler.FocusHandler.mouseFocus && this.getEnableElementFocus())
      {
        try {
          this._inputElement.focus();
        } catch(ex) {}
      }
    },


    /**
     * Overridden from {@link qx.ui.core.Widget#_visualizeFocus}: set the focus to the inputElement
     * and not to the parent div.
     *
     * @type member
     */
    _visualizeBlur : function()
    {
      this.base(arguments);

      // Blur always, not only when element focussing is enabled.
      // We need to remove the caret in all cases.
      // This sometimes does not work in IE (caret keeps blinking)
      // but key events are not handled by the text field anymore.
      if (!qx.event.handler.FocusHandler.mouseFocus)
      {
        try {
          this._inputElement.blur();
        } catch(ex) {}
      }
    },


    /**
     * Return the current value of the text field. The computed values is
     * independent of the value of the {@link #liveUpdate} property.
     *
     * @type member
     * @return {String} The current value of the text field.
     */
    getComputedValue : function()
    {
      if (this._inputElement) {
        return this._inputElement.value;
      }

      return this.getValue();
    },


    /**
     * Returns the inner input element.
     *
     * @return {Element} the input element
     */
    getInputElement : function() {
      return this._inputElement || null;
    },


    /**
     * Whether the value of the {@link #value} property is valid.
     * The validatore function ({@link #validator}) is used to
     * validate the text.
     *
     * @type member
     * @return {Boolean} Whether the text is valid.
     */
    isValid : function()
    {
      var vValidator = this.getValidator();
      return !vValidator || vValidator(this.getValue());
    },


    /**
     * Whether the current text of the text field returned by
     * {@link #getComputedValue} is valid.
     * The validatore function ({@link #validator}) is used to
     * validate the text.
     *
     * @type member
     * @return {Boolean} Whether the computed value is valid.
     */
    isComputedValid : function()
    {
      var vValidator = this.getValidator();
      return !vValidator || vValidator(this.getComputedValue());
    },




    /*
    ---------------------------------------------------------------------------
      PREFERRED DIMENSIONS
    ---------------------------------------------------------------------------
    */

  /**
   * @return {Integer}
   */
    _computePreferredInnerWidth : function() {
      return 120;
    },


  /**
   * @return {Integer}
   */
    _computePreferredInnerHeight : function() {
      return 16;
    },




    /*
    ---------------------------------------------------------------------------
      BROWSER QUIRKS
    ---------------------------------------------------------------------------
    */

    /**
     * Fix IE's input event for filled text fields
     *
     * @type member
     * @signature function()
     */
    _ieFirstInputFix : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._inValueProperty = true;
        this._inputElement.value = this.getValue() === null ? "" : this.getValue();
        this._firstInputFixApplied = true;
        delete this._inValueProperty;
      },

      "default" : null
    }),


    /**
     * Apply {@link #_ieFirstInputFix} in the appear event of the widget.
     *
     * @type member
     * @signature function()
     */
    _afterAppear : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this.base(arguments);

        if (!this._firstInputFixApplied) {
          qx.client.Timer.once(this._ieFirstInputFix, this, 1);
        }
      },

      "default" : function() {
        this.base(arguments);
      }
    }),


    _firstInputFixApplied : false,




    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    _textOnFocus : null,

    _oninputDom : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        if (!this._inValueProperty && e.propertyName === "value") {
          this.createDispatchDataEvent("input", this.getComputedValue());
        }
      },

      "default" : function(e) {
        this.createDispatchDataEvent("input", this.getComputedValue());
      }
    }),


    /**
     * Tab focus event handler
     *
     * @type member
     */
    _ontabfocus : function() {
      this.selectAll();
    },


    /**
     * Focus event handler.
     *
     * @type member
     */
    _onfocus : function() {
      this._textOnFocus = this.getComputedValue();
    },


    /**
     * Blur event handler.
     *
     * @type member
     */
    _onblur : function()
    {
      var vValue = this.getComputedValue().toString();

      if (this._textOnFocus != vValue) {
        this.setValue(vValue);
      }

      this.setSelectionLength(0);
    },


    /**
     * Input event handler.
     *
     * @type member
     */
    _oninput : function()
    {
      if (!this.isLiveUpdate()) {
        return;
      }

      var vValue = this.getComputedValue().toString();
      this.setValue(vValue);
    },


    /*
    ---------------------------------------------------------------------------
      CROSS-BROWSER SELECTION HANDLING

      Microsoft Documentation:
      http://msdn.microsoft.com/workshop/author/dhtml/reference/methods/createrange.asp
      http://msdn.microsoft.com/workshop/author/dhtml/reference/objects/obj_textrange.asp
    ---------------------------------------------------------------------------
    */

    /**
     * Internal IE text selection helper.
     *
     * @type member
     * @signature function()
     */
    __getRange : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._visualPropertyCheck();
        return this._inputElement.createTextRange();
      },

      "default" : null
    }),


    /**
     * Internal IE text selection helper.
     *
     * @type member
     * @signature function()
     */
    __getSelectionRange : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._visualPropertyCheck();
        return this.getTopLevelWidget().getDocumentElement().selection.createRange();
      },

      "default" : null
    }),


    /**
     * Set the start index of the text selection in the field.
     *
     * @type member
     * @param vStart {Number} Start index of a new text selection.
     * @signature function(vStart)
     */
    setSelectionStart : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vStart)
      {
        this._visualPropertyCheck();

        var vText = this._inputElement.value;

        // a bit hacky, special handling for line-breaks
        var i = 0;

        while (i < vStart)
        {
          // find next line break
          i = vText.indexOf("\r\n", i);

          if (i == -1) {
            break;
          }

          vStart--;
          i++;
        }

        var vRange = this.__getRange();

        vRange.collapse();
        vRange.move("character", vStart);
        vRange.select();
      },

      "default" : function(vStart)
      {
        this._visualPropertyCheck();
        this._inputElement.selectionStart = vStart;
      }
    }),


    /**
     * Get the start index of the text selection in the field.
     *
     * @type member
     * @return {Number} Start index of the current selection.
     * @signature function()
     */
    getSelectionStart : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._visualPropertyCheck();

        var vSelectionRange = this.__getSelectionRange();

        if (!this._inputElement.contains(vSelectionRange.parentElement())) {
          return -1;
        }

        var vRange = this.__getRange();

        vRange.setEndPoint("EndToStart", vSelectionRange);
        return vRange.text.length;
      },

      "default" : function()
      {
        this._visualPropertyCheck();
        return this._inputElement.selectionStart;
      }
    }),


    /**
     * Set the length of the selection. The selection starts at the index specified by the
     * method {@link #setSelectionStart}.
     *
     * @type member
     * @param vLength {Number} Lenght of the new selection.
     * @signature function(vLength)
     */
    setSelectionLength : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vLength)
      {
        this._visualPropertyCheck();

        var vSelectionRange = this.__getSelectionRange();

        if (!this._inputElement.contains(vSelectionRange.parentElement())) {
          return;
        }

        vSelectionRange.collapse();
        vSelectionRange.moveEnd("character", vLength);
        vSelectionRange.select();
      },

      "default" : function(vLength)
      {
        this._visualPropertyCheck();

        var el = this._inputElement;

        if (qx.util.Validation.isValidString(el.value)) {
          el.selectionEnd = el.selectionStart + vLength;
        }
      }
    }),


    /**
     * Get the number of charaters in the current selection.
     *
     * @type member
     * @return {Number} The lenght of the selection.
     * @signature function()
     */
    getSelectionLength : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._visualPropertyCheck();

        var vSelectionRange = this.__getSelectionRange();

        if (!this._inputElement.contains(vSelectionRange.parentElement())) {
          return 0;
        }

        return vSelectionRange.text.length;
      },

      "default" : function()
      {
        this._visualPropertyCheck();

        var el = this._inputElement;
        return el.selectionEnd - el.selectionStart;
      }
    }),


    /**
     * Set the text of the current selection.
     *
     * @type member
     * @param vText {String} New text value of the current selection
     * @signature function(vText)
     */
    setSelectionText : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vText)
      {
        this._visualPropertyCheck();

        var vStart = this.getSelectionStart();
        var vSelectionRange = this.__getSelectionRange();

        if (!this._inputElement.contains(vSelectionRange.parentElement())) {
          return;
        }

        vSelectionRange.text = vText;

        // apply text to internal storage
        this.setValue(this._inputElement.value);

        // recover selection (to behave the same gecko does)
        this.setSelectionStart(vStart);
        this.setSelectionLength(vText.length);
      },

      "default" : function(vText)
      {
        this._visualPropertyCheck();

        var el = this._inputElement;

        var vOldText = el.value;
        var vStart = el.selectionStart;

        var vOldTextBefore = vOldText.substr(0, vStart);
        var vOldTextAfter = vOldText.substr(el.selectionEnd);

        var vValue = el.value = vOldTextBefore + vText + vOldTextAfter;

        // recover selection
        el.selectionStart = vStart;
        el.selectionEnd = vStart + vText.length;

        // apply new value to internal cache
        this.setValue(vValue);
      }
    }),


    /**
     * Get the text value of the current selection.
     *
     * @type member
     * @return {String} The text value of the current selection.
     * @signature function()
     */
    getSelectionText : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._visualPropertyCheck();

        var vSelectionRange = this.__getSelectionRange();

        if (!this._inputElement.contains(vSelectionRange.parentElement())) {
          return "";
        }

        return vSelectionRange.text;
      },

      "default" : function()
      {
        this._visualPropertyCheck();

        return this._inputElement.value.substr(this.getSelectionStart(), this.getSelectionLength());
      }
    }),


    /**
     * Select all text in the input field.
     *
     * @type member
     */
    selectAll : function()
    {
      this._visualPropertyCheck();

      if (this.getValue() != null)
      {
        this.setSelectionStart(0);
        this.setSelectionLength(this._inputElement.value.length);
      }

      // to be sure we get the element selected
      this._inputElement.select();
      this._inputElement.focus();
    },


    /**
     * Select text within a given index range in the input field.
     *
     * @type member
     * @param vStart {Number} start index of the selection
     * @param vEnd {Number} end index of the selection.
     * @signature function(vStart, vEnd)
     */
    selectFromTo : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vStart, vEnd)
      {
        this._visualPropertyCheck();

        this.setSelectionStart(vStart);
        this.setSelectionLength(vEnd - vStart);
      },

      "default" : function(vStart, vEnd)
      {
        this._visualPropertyCheck();

        var el = this._inputElement;
        el.selectionStart = vStart;
        el.selectionEnd = vEnd;
      }
    })
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this._inputElement)
    {
      if (qx.core.Variant.isSet("qx.client", "mshtml")) {
        this._inputElement.onpropertychange = null;
      } else {
        this._inputElement.removeEventListener("input", this.__oninput, false);
      }
    }

    this._disposeFields("_inputElement", "__font", "__oninput");
  }
});