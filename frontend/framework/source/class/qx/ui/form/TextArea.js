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

    wrap :
    {
      check : "Boolean",
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

    _modifyElement : function(propValue, propOldValue)
    {
      this.base(arguments, propValue, propOldValue);
      this._styleWrap();
    },

    _modifyWrap : function(propValue, propOldValue) {
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

    _computePreferredInnerHeight : function() {
      return 60;
    }
  }
});