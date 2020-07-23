/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Manager for color themes
 */
qx.Class.define("qx.theme.manager.Color",
{
  type : "singleton",
  extend : qx.util.ValueManager,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** the currently selected color theme */
    theme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyTheme",
      event : "changeTheme"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    _applyTheme : function(value)
    {
      var dest = {};
      this._setDynamic({}); // reset dynamic cache
      if (value) {
        var colors = value.colors;

        for (var name in colors) {
          dest[name] = this.__parseColor(colors, name);
        }
      }

      this._setDynamic(dest);
    },


    /**
     * Helper to take a color stored in the theme and returns the string color value.
     * In most of the times that means it just returns the string stored in the theme.
     * It additionally checks if its a valid color at all.
     *
     * @param colors {Map} The map of color definitions.
     * @param name {String} The name of the color to check.
     * @return {String} The resolved color as string.
     */
    __parseColor : function(colors, name) {
      var color = colors[name];
      if (typeof color === "string") {
        if (!qx.util.ColorUtil.isCssString(color)) {
          // check for references to in theme colors
          if (colors[color] != undefined) {
            return this.__parseColor(colors, color);
          }
          throw new Error("Could not parse color: " + color);
        }
        return color;

      } else if (color instanceof Array) {
        return qx.util.ColorUtil.rgbToRgbString(color);
      } else if (color instanceof Function) {
        return this.__parseColor(colors,color(name));
      }
      // this is might already be a rgb or hex color
      return name;
    },


    /**
     * Returns the dynamically interpreted result for the incoming value,
     * (if available), otherwise returns the original value
     * @param value {String} Value to resolve
     * @return {var} either returns the (translated) result of the incoming
     * value or the value itself
     */
    resolve : function(value)
    {
      var cache = this._dynamic;
      var resolved = cache[value];

      if (resolved)
      {
        return resolved;
      }

      // If the font instance is not yet cached create a new one to return
      // This is true whenever a runtime include occurred (using "qx.Theme.include"
      // or "qx.Theme.patch"), since these methods only merging the keys of
      // the theme and are not updating the cache
      var theme = this.getTheme();
      if (theme !== null && theme.colors[value])
      {
        return cache[value] = theme.colors[value];
      }

      return value;
    },


    /**
     * Whether a value is interpreted dynamically
     *
     * @param value {String} dynamically interpreted identifier
     * @return {Boolean} returns true if the value is interpreted dynamically
     */
    isDynamic : function(value) {
      var cache = this._dynamic;

      if (value && (cache[value] !== undefined))
      {
        return true;
      }

      // If the font instance is not yet cached create a new one to return
      // This is true whenever a runtime include occurred (using "qx.Theme.include"
      // or "qx.Theme.patch"), since these methods only merging the keys of
      // the theme and are not updating the cache
      var theme = this.getTheme();
      if (theme !== null && value && (theme.colors[value] !== undefined))
      {
        cache[value] = theme.colors[value];
        return true;
      }

      return false;
    }
  }
});
