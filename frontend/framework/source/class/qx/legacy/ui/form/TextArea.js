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

************************************************************************ */

/* ************************************************************************

#module(ui_form)

************************************************************************ */

/**
 * @appearance text-area
 */
qx.Class.define("qx.ui.form.TextArea",
{
  extend : qx.ui.form.TextField,





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "text-area"
    },

    allowStretchY :
    {
      refine : true,
      init : true
    },

    spellCheck :
    {
      refine : true,
      init : true
    },


    /**
     * Controls whether text wrap is activated or not.
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     */
    wrap :
    {
      check : "Boolean",
      init : true,
      apply : "_applyWrap"
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

    _inputTag : "textarea",
    _inputType : null,
    _inputOverflow : "auto",



    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyElement : function(value, old)
    {
      this.base(arguments, value, old);
      this._styleWrap();
    },

    _applyWrap : function(value, old) {
      this._styleWrap();
    },

    _styleWrap : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        if (this._inputElement) {
          this._inputElement.wrap = this.getWrap() ? "soft" : "off";
        }
      },

      "gecko" : function()
      {
        if (this._inputElement) {
          var wrapValue  = this.getWrap() ? "soft" : "off";
          var styleValue = this.getWrap() ? ""     : "auto";

          this._inputElement.setAttribute('wrap', wrapValue);
          this._inputElement.style.overflow = styleValue;
        }
      },

      "default" : function()
      {
        if (this._inputElement) {
          this._inputElement.style.whiteSpace = this.getWrap() ? "normal" : "nowrap";
        }
      }
    }),



    /*
    ---------------------------------------------------------------------------
      LAYOUT HELPER
    ---------------------------------------------------------------------------
    */

  /**
   * @return {Integer}
   */
    _computePreferredInnerHeight : function() {
      return 60;
    }
  }
});
