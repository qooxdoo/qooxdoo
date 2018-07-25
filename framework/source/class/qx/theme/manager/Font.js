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
 * Manager for font themes
 * 
 * NOTE: Instances of this class must be disposed of after use
 *
 * @ignore(qx.$$fontBootstrap)
 */
qx.Class.define("qx.theme.manager.Font",
{
  type : "singleton",
  extend : qx.util.ValueManager,
  implement : [ qx.core.IDisposable ],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Grab bootstrap info
    if (qx.$$fontBootstrap) {
      this._manifestFonts = qx.$$fontBootstrap;
      delete qx.$$fontBootstrap;
    }
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** the currently selected font theme */
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
    _manifestFonts : null,

    /**
     * Returns the dynamically interpreted result for the incoming value
     *
     * @param value {String} dynamically interpreted identifier
     * @return {var} return the (translated) result of the incoming value
     */
    resolveDynamic : function(value)
    {
      var dynamic = this._dynamic;
      return value instanceof qx.bom.Font ? value : dynamic[value];
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

      if (resolved) {
        return resolved;
      }

      // If the font instance is not yet cached create a new one to return
      // This is true whenever a runtime include occurred (using "qx.Theme.include"
      // or "qx.Theme.patch"), since these methods only merging the keys of
      // the theme and are not updating the cache
      var theme = this.getTheme();
      if (theme !== null && theme.fonts[value])
      {
        var font = this.__getFontClass(theme.fonts[value]);
        var fo = (new font);

        // Inject information about custom charcter set tests before we apply the
        // complete blob in one.
        if (theme.fonts[value].comparisonString) {
          fo.setComparisonString(theme.fonts[value].comparisonString);
        }

        return cache[value] = fo.set(theme.fonts[value]);
      }

      return value;
    },


    /**
     * Whether a value is interpreted dynamically
     *
     * @param value {String} dynamically interpreted identifier
     * @return {Boolean} returns true if the value is interpreted dynamically
     */
    isDynamic : function(value)
    {
      var cache = this._dynamic;

      if (value && (value instanceof qx.bom.Font || cache[value] !== undefined))
      {
        return true;
      }

      // If the font instance is not yet cached create a new one to return
      // This is true whenever a runtime include occurred (using "qx.Theme.include"
      // or "qx.Theme.patch"), since these methods only merging the keys of
      // the theme and are not updating the cache
      var theme = this.getTheme();
      if (theme !== null && value && theme.fonts[value])
      {
        var font = this.__getFontClass(theme.fonts[value]);
        var fo = (new font);

        // Inject information about custom charcter set tests before we apply the
        // complete blob in one.
        if (theme.fonts[value].comparisonString) {
          fo.setComparisonString(theme.fonts[value].comparisonString);
        }

        cache[value] = fo.set(theme.fonts[value]);
        return true;
      }

      return false;
    },


    /**
     * Checks for includes and resolves them recursively
     *
     * @param fonts {Map} all fonts of the theme
     * @param fontName {String} font name to include
     */
    __resolveInclude : function(fonts, fontName)
    {
      if (fonts[fontName].include)
      {
        // get font infos out of the font theme
        var fontToInclude = fonts[fonts[fontName].include];

        // delete 'include' key - not part of the merge
        fonts[fontName].include = null;
        delete fonts[fontName].include;

        fonts[fontName] = qx.lang.Object.mergeWith(fonts[fontName], fontToInclude, false);

        this.__resolveInclude(fonts, fontName);
      }
    },


    // apply method
    _applyTheme : function(value)
    {
      var dest = this._dynamic;

      for (var key in dest)
      {
        if (dest[key].themed)
        {
          dest[key].dispose();
          delete dest[key];
        }
      }

      if (value)
      {
        var source = this._manifestFonts ? Object.assign(value.fonts, this._manifestFonts) : value.fonts;

        for (var key in source)
        {
          if (source[key].include && source[source[key].include]) {
            this.__resolveInclude(source, key);
          }

          var font = this.__getFontClass(source[key]);
          var fo = (new font);

          // Inject information about custom charcter set tests before we apply the
          // complete blob in one.
          if (source[key].comparisonString) {
            fo.setComparisonString(source[key].comparisonString);
          }

          dest[key] = fo.set(source[key]);
          dest[key].themed = true;
        }
      }
      this._setDynamic(dest);
    },

    /**
     * Decides which Font class should be used based on the theme configuration
     *
     * @param config {Map} The font's configuration map
     * @return {Class}
     */
    __getFontClass : function(config)
    {
      if (config.sources) {
        return qx.bom.webfonts.WebFont;
      }
      return qx.bom.Font;
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeMap("_dynamic");
  }
});
