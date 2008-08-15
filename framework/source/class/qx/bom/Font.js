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
 * A wrapper for CSS font styles. Fond objects can be aplpied to instances
 * of {@link qx.html.Element}.
 */
qx.Class.define("qx.bom.Font",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param size {String} The font size (Unit: pixel)
   * @param family {String[]} A sorted list of font families
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
     * @param str {String} the CSS string
     * @return {qx.bom.Font} the created instance
     */
    fromString : function(str)
    {
      var font = new qx.bom.Font();
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
            var temp = parseInt(part, 10);

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
     * @param config {Map} map of property values
     * @return {qx.bom.Font} the created instance
     */
    fromConfig : function(config)
    {
      var font = new qx.bom.Font;
      font.set(config);
      return font;
    },


    /** {Map} Default (empty) CSS styles */
    __defaultStyles :
    {
      fontFamily: "",
      fontSize: "",
      fontWeight: "",
      fontStyle: "",
      textDecoration: "",
      lineHeight: 1.2
    },


    /**
     * Returns a map of all properties in empty state.
     *
     * This is useful for resetting previously configured
     * font styles.
     *
     * @return {Map} Default styles
     */
    getDefaultStyles : function() {
      return this.__defaultStyles;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The font size (Unit: pixel) */
    size :
    {
      check : "Integer",
      nullable : true,
      apply : "_applySize"
    },

    /**
     * The line height as scaling factor of the default line height. A value
     * of 1 corresponds to the default line height
     */
    lineHeight :
    {
      check : "Number",
      nullable: true,
      apply : "_applyLineHeight"
    },


    /** A sorted list of font families */
    family :
    {
      check : "Array",
      nullable : true,
      apply : "_applyFamily"
    },

    /** Whether the font is bold */
    bold :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyBold"
    },

    /** Whether the font is italic */
    italic :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyItalic"
    },

    /** The text decoration for this font */
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
    __lineHeight : null,


    // property apply
    _applySize : function(value, old) {
      this.__size = value === null ? null : value + "px";
    },


    _applyLineHeight : function(value, old) {
      this.__lineHeight = value === null ? null : value;
    },


    // property apply
    _applyFamily : function(value, old)
    {
      var family = "";

      for (var i=0, l=value.length; i<l; i++)
      {
        // in FireFox 2 and WebKit fonts like 'serif' or 'sans-serif' must
        // not be quoted!
        if (value[i].indexOf(" ") > 0) {
          family += '"' + value[i] + '"';
        } else {
          family += value[i];
        }

        if (i !== l-1) {
          family += ",";
        }
      }

      this.__family = family;
    },


    // property apply
    _applyBold : function(value, old) {
      this.__bold = value === null ? null : value ? "bold" : "normal";
    },


    // property apply
    _applyItalic : function(value, old) {
      this.__italic = value === null ? null : value ? "italic" : "normal";
    },


    // property apply
    _applyDecoration : function(value, old) {
      this.__decoration = value === null ? null : value;
    },


    /**
     * Get a map of all CSS styles, which will be applied to the widget
     */
    getStyles : function()
    {
      return {
        fontFamily : this.__family,
        fontSize : this.__size,
        fontWeight : this.__bold,
        fontStyle : this.__italic,
        textDecoration : this.__decoration,
        lineHeight : this.__lineHeight
      }
    }
  }
});
