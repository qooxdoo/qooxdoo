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
qx.Class.define("qx.renderer.font.Font",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(size, name)
  {
    this.base(arguments);

    if (size !== undefined) {
      this.setSize(size);
    }

    if (name !== undefined) {
      this.setName(name);
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
    fromString : function(str)
    {
      var font = new qx.renderer.font.Font;
      var parts = str.split(/\s+/);
      var name = [];
      var part;

      for (var i=0; i<parts.length; i++)
      {
        switch(part = parts[i])
        {
          case "bold":
            font.setBold(true);
            break;

          case "italic":
            font.setItalic(true);
            break;

          case "underline":
            font.setUnderline(true);
            break;

          case "strikeout":
            font.setStrikeout(true);
            break;

          default:
            var temp = parseFloat(part);

            if (temp == part || qx.lang.String.contains(part, "px")) {
              font.setSize(temp);
            } else {
              name.push(part);
            }

            break;
        }
      }

      if (name.length > 0) {
        font.setName(name.join(" "));
      }

      return font;
    },

    reset : function(widget)
    {
      widget.removeStyleProperty("fontFamily");
      widget.removeStyleProperty("fontSize");
      widget.removeStyleProperty("fontWeight");
      widget.removeStyleProperty("fontStyle");
      widget.removeStyleProperty("textDecoration");
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    size :
    {
      _legacy : true,
      type    : "number",
      impl    : "style"
    },

    family :
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
    _compile : function()
    {
      var name = this.getName();
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

      this._defs.fontFamily = name || "";
      this._defs.fontSize = typeof vSize == "number" ? vSize + "px" : "";
      this._defs.fontWeight = this.getBold() ? "bold" : "normal";
      this._defs.fontStyle = this.getItalic() ? "italic" : "normal";
      this._defs.textDecoration = vDecoration || "";
    },

    render : function(widget)
    {
      // TODO

      /*
      widget.setStyleProperty("fontFamily", this._defs.fontFamily);
      widget.setStyleProperty("fontSize", this._defs.fontSize);
      widget.setStyleProperty("fontWeight", this._defs.fontWeight);
      widget.setStyleProperty("fontStyle", this._defs.fontStyle);
      widget.setStyleProperty("textDecoration", this._defs.textDecoration);
      */
    }
  }
});
