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
   * @param vValue {String} initial text value of the input field ({@link #value}).
   */
  construct : function(vValue)
  {
    // ************************************************************************
    //   INIT
    // ************************************************************************
    this.base(arguments);

    if (typeof vValue === "string") {
      this.setValue(vValue);
    }

    // ************************************************************************
    //   BEHAVIOR
    // ************************************************************************
    this.setTagName("input");
    this.setHtmlProperty("type", "text");
    this.setHtmlAttribute("autocomplete", "OFF");
    this.setTabIndex(1);
    this.setSelectable(true);

    // ************************************************************************
    //   EVENTS
    // ************************************************************************
    this.enableInlineEvent("input");

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
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    appearance :
    {
      _legacy      : true,
      check        : "string",
      defaultValue : "text-field"
    },

    /**
     * The value of the text field.
     * The value is by default updated when the input field looses the focus (blur).
     * If the property {@link #liveUpdate} is set to <code>true</code>, the value is
     * upated on each key stroke.
     */
    value :
    {
      check : "String",
      init : "",
      event : "changeValue",
      apply : "_modifyValue"
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
      apply : "_modifyMaxLength"
    },

    /** Whether the field is read only */
    readOnly :
    {
      check : "Integer",
      apply : "_modifyReadOnly"
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
      apply : "_modifyValidator"
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
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * Apply the enabled property.
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     */
    _modifyEnabled : function(propValue, propOldValue)
    {
      propValue ? this.removeHtmlAttribute("disabled") : this.setHtmlAttribute("disabled", "disabled");
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
      this.setHtmlProperty("value", propValue == null ? "" : propValue);
      delete this._inValueProperty;
    },


    /**
     * Apply the maxLenght property.
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     */
    _modifyMaxLength : function(propValue, propOldValue) {
      propValue ? this.setHtmlProperty("maxLength", propValue) : this.removeHtmlProperty("maxLength");
    },


    /**
     * Apply the readOnly property.
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     */
    _modifyReadOnly : function(propValue, propOldValue) {
      propValue ? this.setHtmlProperty("readOnly", "readOnly") : this.removeHtmlProperty("readOnly");
    },


    /**
     * Apply the {@link qx.ui.core.Widget#font} property.
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     */
    _modifyFont : function(propValue, propOldValue)
    {
      this._invalidatePreferredInnerDimensions();

      if (propValue) {
        propValue._applyWidget(this);
      } else if (propOldValue) {
        propOldValue._resetWidget(this);
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
      this._visualPropertyCheck();
      return this.getElement().value;
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
      return 15;
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
        this.getElement().value = this.getValue() === null ? "" : this.getValue();
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
        return this.getElement().createTextRange();
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

        var vText = this.getElement().value;

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
        this.getElement().selectionStart = vStart;
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

        if (!this.getElement().contains(vSelectionRange.parentElement())) {
          return -1;
        }

        var vRange = this.__getRange();

        vRange.setEndPoint("EndToStart", vSelectionRange);
        return vRange.text.length;
      },

      "default" : function()
      {
        this._visualPropertyCheck();
        return this.getElement().selectionStart;
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

        if (!this.getElement().contains(vSelectionRange.parentElement())) {
          return;
        }

        vSelectionRange.collapse();
        vSelectionRange.moveEnd("character", vLength);
        vSelectionRange.select();
      },

      "default" : function(vLength)
      {
        this._visualPropertyCheck();

        var el = this.getElement();

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

        if (!this.getElement().contains(vSelectionRange.parentElement())) {
          return 0;
        }

        return vSelectionRange.text.length;
      },

      "default" : function()
      {
        this._visualPropertyCheck();

        var el = this.getElement();
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

        if (!this.getElement().contains(vSelectionRange.parentElement())) {
          return;
        }

        vSelectionRange.text = vText;

        // apply text to internal storage
        this.setValue(this.getElement().value);

        // recover selection (to behave the same gecko does)
        this.setSelectionStart(vStart);
        this.setSelectionLength(vText.length);

        return true;
      },

      "default" : function(vText)
      {
        this._visualPropertyCheck();

        var el = this.getElement();

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

        if (!this.getElement().contains(vSelectionRange.parentElement())) {
          return "";
        }

        return vSelectionRange.text;
      },

      "default" : function()
      {
        this._visualPropertyCheck();

        return this.getElement().value.substr(this.getSelectionStart(), this.getSelectionLength());
      }
    }),


    /**
     * Select all text in the input field.
     *
     * @type member
     * @signature function()
     */
    selectAll : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._visualPropertyCheck();

        if (this.getValue() != null)
        {
          this.setSelectionStart(0);
          this.setSelectionLength(this.getValue().length);
        }

        // to be sure we get the element selected
        this.getElement().select();
      },

      "default" : function()
      {
        this._visualPropertyCheck();

        this.getElement().select();
      }
    }),


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

        var el = this.getElement();
        el.selectionStart = vStart;
        el.selectionEnd = vEnd;
      }
    })
  }
});