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
 * The TextField is a one line text input field.
 *
 * On each key stroke the text field value is synchronized with the
 * {@link #value} property. Value changes can be monitored by listening on the
 * {@link #changeValue} event.
 */
qx.Class.define("qx.ui.form.TextField",
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
    this.addListener("input", this._oninput);

    this.initTabIndex();
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
      event : "changeValue",
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


    /**
     * Whether the browser's build in spell check should be enabled
     * for this text field. Currently affets only FireFox >= 2.
     *
     * Documented at http://developer.mozilla.org/en/docs/Controlling_spell_checking_in_HTML_forms
     */
    spellCheck :
    {
      check : "Boolean",
      init : false,
      apply : "_applySpellCheck"
    },


    /** Maximum number of characters in the text field. */
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _getContentHint : function()
    {
      return {
        width : 120,
        minWidth : 0,
        maxWidth : Infinity,
        height : this._textHeight || 16,
        minHeight : 0,
        maxHeight : Infinity
      };
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

      el.setStyles({
        "position": "absolute",
        "zIndex": 10,
        "border": "0 none",
        "padding": 0,
        "margin": 0,
        "background": "transparent",
        "outline": "none",
        "resize": "none",
        "appearance": "none"
      });

      // Emulate IE hard-coded margin
      // Mozilla by default emulates this IE handling, but in a wrong
      // way. IE adds the additional margin to the CSS margin where
      // Mozilla replaces it. But this make it possible for the user
      // to overwrite the margin, which is not possible in IE.
      // See also: https://bugzilla.mozilla.org/show_bug.cgi?id=73817
      if (qx.core.Variant.isSet("qx.client", "gecko|opera|webkit")) {
        el.setStyle("margin", "1px 0");
      }

      return el;
    },


    // overridden
    _applyEnabled : function(value, old)
    {
      this.base(arguments, value, old);
      this._contentElement.setAttribute("disabled", value===false);
    },


    // overridden
    _applyFont : function(value, old) {
      qx.theme.manager.Font.getInstance().connect(this._styleFont, this, value);
    },


    /**
     * Utility method to render the given font. Calls the
     * {@link #_renderFont} method.
     *
     * @type member
     * @param font {qx.html.Font} new font value to render
     * @return {void}
     */
    _styleFont : function(font)
    {
      if (font)
      {
        font.render(this._contentElement);
        this._textHeight = qx.bom.Label.getTextSize("A", font.getStyles()).height;
      }
      else
      {
        qx.ui.core.Font.reset(this._contentElement);
        delete this._textHeight;
      }

      this.__font = font;
      this.scheduleLayoutUpdate();
    },


    /*
    ---------------------------------------------------------------------------
      TEXTFIELD API
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyValue : function(value, old) {
      this._contentElement.setValue(value);
    },

    // property apply
    _applyTextAlign : function(value, old) {
      this._contentElement.setStyle("textAlign", value || "");
    },

    // property apply
    _applySpellCheck : function(value, old) {
      this._contentElement.setAttribute("spellcheck", value.toString());
    },

    // property apply
    _applyMaxLength : function(value, old) {
      this._contentElement.setAttribute("maxLength", value == null ? "" : value);
    },

    // property apply
    _applyReadOnly : function(value, old)
    {
      this._contentElement.setAttribute("readOnly", value.toString());

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
    _oninput : function()
    {
      var value = this._contentElement.getValue();
      this.setValue(value);
    }

  }
});