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
      apply : "_modifyValue"
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
      apply : "_modifyMaxLength",
      nullable : true
    },

    /** Whether the field is read only */
    readOnly :
    {
      check : "Integer",
      apply : "_modifyReadOnly",
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

    _modifyElement : function(propValue, propOldValue)
    {
      this.base(arguments, propValue, propOldValue);

      if (propValue)
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
        this._renderColor();
        this._renderTextAlign();
        this._renderCursor();

        // Register inline event
        if (qx.core.Variant.isSet("qx.client", "mshtml")) {
          inp.onpropertychange = this.__oninput;
        } else {
          inp.addEventListener("input", this.__oninput, false);
        }

        // Append to real element
        propValue.appendChild(inp);
      }
    },


    /**
     * We could not use width/height = 100% because the outer elements
     * could have paddings and borders which will break. We use the
     * computed inner width/height instead
     */
    _postApply : function()
    {
      var istyle = this._inputElement.style;
      istyle.width = this.getInnerWidth() + "px";

      // Reduce height by 2 pixels (the manual or mshtml margin)
      istyle.height = (this.getInnerHeight() - 2) + "px";
    },


    _modifyCursor : function(propValue, propOldValue)
    {
      if (this._inputElement) {
        this._renderCursor();
      }
    },

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

    _renderTextAlign : function() {
      this._inputElement.style.textAlign = this.getTextAlign() || "";
    },


    /**
     * Apply the enabled property.
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     */
    _modifyEnabled : function(propValue, propOldValue)
    {
      if (this._inputElement) {
        this._inputElement.disabled = propValue===false;
      }

      return this.base(arguments, propValue, propOldValue);
    },


    /**
     * Apply the value property
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     */
    _modifyValue : function(propValue, propOldValue)
    {
      this._inValueProperty = true;

      if (this._inputElement) {
        this._inputElement.value = propValue === null ? "" : propValue;
      }

      delete this._inValueProperty;
    },


    /**
     * Apply the maxLenght property.
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     */
    _modifyMaxLength : function(propValue, propOldValue)
    {
      if (this._inputElement) {
        this._inputElement.maxLength = propValue == null ? "" : propValue;
      }
    },


    /**
     * Apply the readOnly property.
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     */
    _modifyReadOnly : function(propValue, propOldValue)
    {
      if (this._inputElement) {
        this._inputElement.readOnly = propValue;
      }
    },


    /**
     * Sync color to embedded input element
     */
    _styleTextColor : function(value)
    {
      this.__color = value;
      this._renderColor();
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _applyFont : function(value, old) {
      qx.manager.object.FontManager.getInstance().connect(this._styleFont, this, value);
    },


    /**
     * @type member
     * @param value {qx.renderer.font.Font}
     */
    _styleFont : function(value)
    {
      this.__font = value;
      this._renderFont();
    },

    _renderFont : function()
    {
      var inp = this._inputElement;

      if (inp)
      {
        var value = this.__font;
        value ? value.renderElement(inp) : qx.renderer.font.Font.resetElement(inp);
      }
    },

    _renderColor : function()
    {
      var inp = this._inputElement;

      if (inp) {
        inp.style.color = this.__color || "";
      }
    },






    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

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

    _computePreferredInnerWidth : function() {
      return 120;
    },


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

      if (this._textOnFocus != vValue) {
        this.setValue(vValue);
      }
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

        return true;
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

        return true;
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
        this.setSelectionLength(this.getValue().length);
      }

      // to be sure we get the element selected
      this._inputElement.select();
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