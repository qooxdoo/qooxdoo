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

      if (value)
      {
        var source = value.colors;
        var util = qx.util.ColorUtil;
        var temp;

        for (var key in source)
        {
          temp = source[key];

          if (typeof temp === "string")
          {
            if (!util.isCssString(temp)) {
              throw new Error("Could not parse color: " + temp);
            }
          }
          else if (temp instanceof Array)
          {
            temp = util.rgbToRgbString(temp);
          }
          else
          {
            throw new Error("Could not parse color: " + temp);
          }

          dest[key] = temp;
        }
      }

      this._setDynamic(dest);
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
