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
qx.Class.define("qx.ui.core.Font",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(size, family)
  {
    this.base(arguments);

    if (size !== undefined) {
      this.setSize(size);
    }

    if (family !== undefined) {
      this.setFamily(family);
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Converts a typical CSS font definition string to an font object
     *
     * @type static
     * @param str {String} the CSS string
     * @return {qx.ui.core.Font} the created instance
     */
    fromString : function(str)
    {
      var font = new qx.ui.core.Font;
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
            font.setDecoration("underline");
            break;

          default:
            var temp = parseInt(part);

            if (temp == part || qx.lang.String.contains(part, "px")) {
              font.setSize(temp);
            } else {
              name.push(part);
            }

            break;
        }
      }

      if (name.length > 0) {
        font.setFamily(name);
      }

      return font;
    },


    /**
     * Converts a map property definition into a border object.
     *
     * @type static
     * @param config {Map} map of property values
     * @return {qx.ui.core.Border} the created instance
     */
    fromConfig : function(config)
    {
      var font = new qx.ui.core.Font;
      font.set(config);
      return font;
    },


    reset : function(widget)
    {
      widget.removeStyleProperty("fontFamily");
      widget.removeStyleProperty("fontSize");
      widget.removeStyleProperty("fontWeight");
      widget.removeStyleProperty("fontStyle");
      widget.removeStyleProperty("textDecoration");
    },

    resetElement : function(element)
    {
      var style = element.style;

      style.fontFamily = "";
      style.fontSize = "";
      style.fontWeight = "";
      style.fontStyle = "";
      style.textDecoration = "";
    },

    /**
     * Reset a style map by setting the font attributes to empty.
     *
     * @param style {Map}
     * @type static
     * @return {void}
     */
    resetStyle : function(style)
    {
      style.fontFamily = "";
      style.fontSize = "";
      style.fontWeight = "";
      style.fontStyle = "";
      style.textDecoration = "";
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
      nullable : true,
      apply : "_applySize"
    },

    family :
    {
      check : "Array",
      nullable : true,
      apply : "_applyFamily"
    },

    bold :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyBold"
    },

    italic :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyItalic"
    },

    decoration :
    {
      check : [ "underline", "line-through", "overline" ],
      nullable : true,
      apply : "_applyDecoration"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __size : null,
    __family : null,
    __bold : null,
    __italic : null,
    __decoration : null,

    _applySize : function(value, old) {
      this.__size = value === null ? null : value + "px";
    },

    _applyFamily : function(value, old)
    {
      var family = "";
      for (var i=0, l=value.length; i<l; i++) {
        if (value[i].indexOf(" ") > 0) {
          family += '"' + value[i] + '"';
        } else {
          // in FireFox 2 and WebKit fonts like 'serif' or 'sans-serif' must
          // not be quoted!
          family += value[i];
        }
        if (i != l-1) {
          family += ",";
        }
      }
      this.__family = family;
    },

    _applyBold : function(value, old) {
      this.__bold = value === null ? null : value ? "bold" : "normal";
    },

    _applyItalic : function(value, old) {
      this.__italic = value === null ? null : value ? "italic" : "normal";
    },

    _applyDecoration : function(value, old) {
      this.__decoration = value === null ? null : value;
    },

    render : function(widget)
    {
      widget.setStyleProperty("fontFamily", this.__family);
      widget.setStyleProperty("fontSize", this.__size);
      widget.setStyleProperty("fontWeight", this.__bold);
      widget.setStyleProperty("fontStyle", this.__italic);
      widget.setStyleProperty("textDecoration", this.__decoration);
    },

    /**
     * Generate a style map with the current font attributes.
     *
     * @param style {Map}
     * @type member
     * @return {void}
     */
    renderStyle : function(style)
    {
      style.fontFamily = this.__family || "";
      style.fontSize = this.__size || "";
      style.fontWeight = this.__bold || "";
      style.fontStyle =  this.__italic || "";
      style.textDecoration = this.__decoration || "";
    },

    renderElement : function(element)
    {
      var style = element.style;
      style.fontFamily = this.__family || "";
      style.fontSize = this.__size || "";
      style.fontWeight = this.__bold || "";
      style.fontStyle =  this.__italic || "";
      style.textDecoration = this.__decoration || "";
    },

    /**
     * Generate a style string with the current font attributes.
     *
     * @type member
     * @return {String}
     */
    generateStyle : function() {
      return ( this.__family ? "font-family:" + this.__family.replace(/\"/g, "'") + ";" : "" ) +
             ( this.__size ? "font-size:" + this.__size + ";" : "" ) +
             ( this.__weight ? "font-weight:" + this.__weight + ";" : "" ) +
             ( this.__style ? "font-style:" + this.__style + ";" : "" ) +
             ( this.__decoration ? "text-decoration:" + this.__decoration + ";" : "" );
    }
  }
});
