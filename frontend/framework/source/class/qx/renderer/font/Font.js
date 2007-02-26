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

#module(ui_basic)

************************************************************************ */

/** Font implementation for qx.ui.core.Widget instances. */
qx.Clazz.define("qx.renderer.font.Font",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vSize, vName)
  {
    qx.core.Object.call(this);

    this._defs = {};

    if (vSize != null) {
      this.setSize(vSize);
    }

    if (vName != null) {
      this.setName(vName);
    }
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
      UTILITY
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type static
     * @param s {String} TODOC
     * @return {var} TODOC
     */
    fromString : function(s)
    {
      var vFont = new qx.renderer.font.Font;
      var vAllParts = s.split(/\s+/);
      var vName = [];
      var vPart;

      for (var i=0; i<vAllParts.length; i++)
      {
        switch(vPart = vAllParts[i])
        {
          case "bold":
            vFont.setBold(true);
            break;

          case "italic":
            vFont.setItalic(true);
            break;

          case "underline":
            vFont.setUnderline(true);
            break;

          case "strikeout":
            vFont.setStrikeout(true);
            break;

          default:
            var vTemp = parseFloat(vPart);

            if (vTemp == vPart || qx.lang.String.contains(vPart, "px")) {
              vFont.setSize(vTemp);
            } else {
              vName.push(vPart);
            }

            break;
        }
      }

      if (vName.length > 0) {
        vFont.setName(vName.join(" "));
      }

      return vFont;
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

    size :
    {
      _legacy : true,
      type    : "number",
      impl    : "style"
    },

    name :
    {
      _legacy : true,
      type    : "string",
      impl    : "style"
    },

    bold :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false,
      impl         : "style"
    },

    italic :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false,
      impl         : "style"
    },

    underline :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false,
      impl         : "style"
    },

    strikeout :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false,
      impl         : "style"
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
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyStyle : function(propValue, propOldValue, propData)
    {
      this._needsCompilation = true;
      return true;
    },




    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */

    _needsCompilation : true,


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _compile : function()
    {
      var vName = this.getName();
      var vSize = this.getSize();
      var vBold = this.getBold();
      var vItalic = this.getItalic();
      var vUnderline = this.getUnderline();
      var vStrikeout = this.getStrikeout();
      var vDecoration = "";

      if (this.getUnderline()) {
        vDecoration = "underline";
      }

      if (this.getStrikeout()) {
        vDecoration += " " + "strikeout";
      }

      this._defs.fontFamily = vName || "";
      this._defs.fontSize = typeof vSize == "number" ? vSize + "px" : "";
      this._defs.fontWeight = this.getBold() ? "bold" : "normal";
      this._defs.fontStyle = this.getItalic() ? "italic" : "normal";
      this._defs.textDecoration = vDecoration || "";

      this._needsCompilation = false;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vWidget {var} TODOC
     * @return {void}
     */
    _applyWidget : function(vWidget)
    {
      if (this._needsCompilation) {
        this._compile();
      }

      vWidget.setStyleProperty("fontFamily", this._defs.fontFamily);
      vWidget.setStyleProperty("fontSize", this._defs.fontSize);
      vWidget.setStyleProperty("fontWeight", this._defs.fontWeight);
      vWidget.setStyleProperty("fontStyle", this._defs.fontStyle);
      vWidget.setStyleProperty("textDecoration", this._defs.textDecoration);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vWidget {var} TODOC
     * @return {void}
     */
    _resetWidget : function(vWidget)
    {
      vWidget.removeStyleProperty("fontFamily");
      vWidget.removeStyleProperty("fontSize");
      vWidget.removeStyleProperty("fontWeight");
      vWidget.removeStyleProperty("fontStyle");
      vWidget.removeStyleProperty("textDecoration");
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {boolean | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return true;
      }

      delete this._defs;

      return qx.core.Object.prototype.dispose.call(this);
    }
  }
});
