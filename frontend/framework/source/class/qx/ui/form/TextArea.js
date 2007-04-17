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
      _legacy      : true,
      type         : "string",
      defaultValue : "text-area"
    },

    wrap :
    {
      _legacy : true,
      type    : "boolean"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _inputTag : "textarea",
    _inputType : null,

    _modifyElement : function(propValue, propOldValue)
    {
      this.base(arguments, propValue, propOldValue);

      if (propValue) {
        this._applyWrap(this.getWrap());
      }
    },

    _modifyWrap : function(propValue, propOldValue)
    {
      if (this._inputElement) {
        this._applyWrap(propValue);
      }
    },

    _applyWrap : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(propValue) {
        this._inputElement.style.whiteSpace = propValue ? "normal" : "nowrap";
      },

      "default" : function(propValue) {
        this._inputElement.wrap = propValue ? "soft" : "off";
      }
    }),

    _computePreferredInnerHeight : function() {
      return 60;
    }
  }
});