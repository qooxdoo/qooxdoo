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
    __lineToCss :
    {
      below : "underline",
      strikeout : "line-through",
      above : "overline"
    },


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
      widget.removeStyleProperty("textTransform");
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
      check : "Integer",
      init : 11,
      apply : "_applySize"
    },

    family :
    {
      check : "Array",
      init : "",
      apply : "_applyFamily"
    },

    bold :
    {
      check : "Boolean",
      init : false
    },

    italic :
    {
      check : "Boolean",
      init : false
    },

    line :
    {
      check : [ "below", "strikeout", "above" ],
      nullable : true
    },

    transform :
    {
      check : [ "lowercase", "capitalize", "uppercase" ],
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
    _applySize : function(value, old) {
      this.__size = value ? value + "px" : "";
    },

    _applyFamily : function(value, old) {
      this.__family = value ? '"' + value.join('","') + '"' : "";
    },

    render : function(widget)
    {
      widget.setStyleProperty("fontFamily", this.__family);
      widget.setStyleProperty("fontSize", this.__size);
      widget.setStyleProperty("fontWeight", this.getBold() ? "bold" : "normal");
      widget.setStyleProperty("fontStyle", this.getItalic() ? "italic" : "normal");
      widget.setStyleProperty("textDecoration", this.self(arguments).__lineToCss[this.getLine()] || "");
      widget.setStyleProperty("textTransform", this.getTransform() || "");
    }
  }
});
