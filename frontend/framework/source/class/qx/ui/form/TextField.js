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

qx.Class.define("qx.ui.form.TextField",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
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
     * TODOC
     *
     * @type static
     * @param vRegExp {var} TODOC
     * @return {Function} TODOC
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
      type         : "string",
      defaultValue : "text-field"
    },

    value :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : ""
    },

    maxLength :
    {
      _legacy : true,
      type    : "number"
    },

    readOnly :
    {
      _legacy : true,
      type    : "boolean"
    },

    selectionStart :
    {
      _legacy : true,
      type    : "number"
    },

    selectionLength :
    {
      _legacy : true,
      type    : "number"
    },

    selectionText :
    {
      _legacy : true,
      type    : "string"
    },

    validator :
    {
      _legacy : true,
      type    : "function"
    },


    /** The font property describes how to paint the font on the widget. */
    font :
    {
      _legacy                : true,
      type                   : "object",
      instance               : "qx.renderer.font.Font",
      convert                : qx.renderer.font.FontCache.convert,
      allowMultipleArguments : true
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
      CLONING
    ---------------------------------------------------------------------------
    */

    // Extend ignore list with selection properties
    _clonePropertyIgnoreList : ",selectionStart,selectionLength,selectionText",




    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {var} TODOC
     */
    _modifyEnabled : function(propValue, propOldValue, propData)
    {
      propValue ? this.removeHtmlAttribute("disabled") : this.setHtmlAttribute("disabled", "disabled");
      return this.base(arguments, propValue, propOldValue, propData);
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
    _modifyValue : function(propValue, propOldValue, propData)
    {
      this._inValueProperty = true;
      this.setHtmlProperty(propData.name, propValue == null ? "" : propValue);
      delete this._inValueProperty;

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {var} TODOC
     */
    _modifyMaxLength : function(propValue, propOldValue, propData) {
      return propValue ? this.setHtmlProperty(propData.name, propValue) : this.removeHtmlProperty(propData.name);
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {var} TODOC
     */
    _modifyReadOnly : function(propValue, propOldValue, propData) {
      return propValue ? this.setHtmlProperty(propData.name, propData.name) : this.removeHtmlProperty(propData.name);
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
    _modifyFont : function(propValue, propOldValue, propData)
    {
      this._invalidatePreferredInnerDimensions();

      if (propValue) {
        propValue._applyWidget(this);
      } else if (propOldValue) {
        propOldValue._resetWidget(this);
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    getComputedValue : function(e)
    {
      this._visualPropertyCheck();
      return this.getElement().value;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isValid : function()
    {
      var vValidator = this.getValidator();
      return !vValidator || vValidator(this.getValue());
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
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
     * TODOC
     *
     * @type member
     * @return {int} TODOC
     */
    _computePreferredInnerWidth : function() {
      return 120;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {int} TODOC
     */
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
     * @return {void}
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
     * TODOC
     *
     * @type member
     * @return {void}
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

      "default" : qx.lang.Function.returnTrue
    }),


    _firstInputFixApplied : false,




    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    _textOnFocus : null,


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _ontabfocus : function(e) {
      this.selectAll();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onfocus : function(e) {
      this._textOnFocus = this.getComputedValue();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onblur : function(e)
    {
      var vValue = this.getComputedValue().toString();

      if (this._textOnFocus != vValue) {
        this.setValue(vValue);
      }

      this.setSelectionLength(0);
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
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _getRange : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._visualPropertyCheck();
        return this.getElement().createTextRange();
      },

      "default" : null
    }),


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _getSelectionRange : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._visualPropertyCheck();
        return this.getTopLevelWidget().getDocumentElement().selection.createRange();
      },

      "default" : null
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vStart {var} TODOC
     * @return {void}
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

        var vRange = this._getRange();

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
     * TODOC
     *
     * @type member
     * @return {void}
     */
    getSelectionStart : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._visualPropertyCheck();

        var vSelectionRange = this._getSelectionRange();

        if (!this.getElement().contains(vSelectionRange.parentElement())) {
          return -1;
        }

        var vRange = this._getRange();

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
     * TODOC
     *
     * @type member
     * @param vLength {var} TODOC
     * @return {void}
     */
    setSelectionLength : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vLength)
      {
        this._visualPropertyCheck();

        var vSelectionRange = this._getSelectionRange();

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
     * TODOC
     *
     * @type member
     * @return {void}
     */
    getSelectionLength : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._visualPropertyCheck();

        var vSelectionRange = this._getSelectionRange();

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
     * TODOC
     *
     * @type member
     * @param vText {var} TODOC
     * @return {void}
     */
    setSelectionText : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vText)
      {
        this._visualPropertyCheck();

        var vStart = this.getSelectionStart();
        var vSelectionRange = this._getSelectionRange();

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
     * TODOC
     *
     * @type member
     * @param vText {var} TODOC
     * @return {void}
     */
    getSelectionText : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._visualPropertyCheck();

        var vSelectionRange = this._getSelectionRange();

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
     * TODOC
     *
     * @type member
     * @return {void}
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
     * TODOC
     *
     * @type member
     * @param vStart {var} TODOC
     * @param vEnd {var} TODOC
     * @return {void}
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
    }),




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      this.base(arguments);
    }
  }
});