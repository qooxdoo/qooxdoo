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
qx.Class.define("qx.theme.manager.Font", {
  type: "singleton",
  extend: qx.util.ValueManager,
  implement: [qx.core.IDisposable],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct() {
    super();

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

  properties: {
    /** the currently selected font theme */
    theme: {
      check: "Theme",
      nullable: true,
      apply: "_applyTheme",
      event: "changeTheme"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    _manifestFonts: null,

    /**
     * Returns the dynamically interpreted result for the incoming value
     *
     * @param value {String} dynamically interpreted identifier
     * @return {var} return the (translated) result of the incoming value
     */
    resolveDynamic(value) {
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
    resolve(value) {
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
      if (theme !== null && theme.fonts[value]) {
        let createdFonts = this.__initialiseFonts(theme.fonts);
        let font = createdFonts[value] || null;
        if (font) {
          cache[value] = font;
        }
        return font;
      }
      if (qx.core.Environment.get("qx.debug")) {
        if (theme) {
          if (!this.__warnedMissingFonts) {
            this.__warnedMissingFonts = {};
          }
          if (!this.__warnedMissingFonts[value]) {
            this.__warnedMissingFonts[value] = true;
            this.debug(
              `Cannot resolve a font named ${value} - available fonts are ${Object.keys(
                theme.fonts
              ).join(", ")}`
            );
          }
        }
      }

      return value;
    },

    /**
     * Whether a value is interpreted dynamically
     *
     * @param value {String} dynamically interpreted identifier
     * @return {Boolean} returns true if the value is interpreted dynamically
     */
    isDynamic(value) {
      var cache = this._dynamic;

      if (
        value &&
        (value instanceof qx.bom.Font || cache[value] !== undefined)
      ) {
        return true;
      }

      // If the font instance is not yet cached create a new one to return
      // This is true whenever a runtime include occurred (using "qx.Theme.include"
      // or "qx.Theme.patch"), since these methods only merging the keys of
      // the theme and are not updating the cache
      var theme = this.getTheme();
      if (theme !== null && value && theme.fonts[value]) {
        var fontClass = this.__getFontClass(theme.fonts[value]);
        var font = new fontClass();

        // Inject information about custom charcter set tests before we apply the
        // complete blob in one.
        if (theme.fonts[value].comparisonString) {
          font.setComparisonString(theme.fonts[value].comparisonString);
        }

        cache[value] = font.set(theme.fonts[value]);
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
    __resolveInclude(fonts, fontName) {
      if (fonts[fontName].include) {
        // get font infos out of the font theme
        var fontToInclude = fonts[fonts[fontName].include];

        // delete 'include' key - not part of the merge
        fonts[fontName].include = null;
        delete fonts[fontName].include;

        fonts[fontName] = qx.lang.Object.mergeWith(
          fonts[fontName],
          fontToInclude,
          false
        );

        this.__resolveInclude(fonts, fontName);
      }
    },

    /**
     * Initialises fonts from a set of font definitions (eg from a theme Font configuration)
     *
     * @param {Map<String,Object>} fontDefs indexed by font ID
     * @return {Map<String,qx.bom.Font>} created fonts
     */
    __initialiseFonts(fontDefs) {
      let webFontDefs = [];
      let createdFonts = {};

      for (var fontId in fontDefs) {
        let fontDef = fontDefs[fontId];
        if (fontDef.include && fontDefs[fontDef.include]) {
          this.__resolveInclude(fontDefs, fontId);
        }

        if (fontDef.fontName) {
          let preset = this._manifestFonts[fontDef.fontName];
          Object.keys(preset).forEach(presetKey => {
            if (fontDef[presetKey] === undefined) {
              fontDef[presetKey] = preset[presetKey];
            }
          });
        }

        // If the theme font is defining sources, then we want to intercept that and either
        //  fabricate a Manifest font, or if the qx.bom.webfonts.WebFont has already been
        //  created we need to add the font face definition to the existing one
        if (fontDef.sources) {
          // Make sure the font family is specified in the font definition (it was previously allowable to
          //  only specify the font family in the sources object)
          if (
            fontDef.sources.family &&
            fontDef.family.indexOf(fontDef.sources.family) < 0
          ) {
            fontDef.family.unshift(fontDef.sources.family);
          }
          let family = fontDef.family[0];

          // Make sure that there is a font definition
          if (!fontDefs[family]) {
            fontDefs[family] = {
              fontFaces: []
            };
          }

          // Create a lookup of the fontFaces within the font definition
          let fontFacesLookup = {};
          fontDefs[family].fontFaces.forEach(fontFace => {
            let fontKey = qx.bom.webfonts.WebFontLoader.createFontLookupKey(
              fontFace.family,
              fontFace.fontWeight,
              fontFace.fontStyle
            );

            fontFacesLookup[fontKey] = fontFace;
          });
          let fontKey = qx.bom.webfonts.WebFontLoader.createFontLookupKey(
            fontDef.sources.family,
            fontDef.sources.fontWeight,
            fontDef.sources.fontStyle
          );

          if (!fontFacesLookup[fontKey]) {
            let fontFace = {
              fontFamily: fontDef.sources.family,
              fontWeight: fontDef.sources.fontWeight,
              fontStyle: fontDef.sources.fontStyle
            };

            fontDefs[family].fontfaces.push(fontFace);
          }
        }
        if (fontDef.css || fontDef.fontFaces) {
          webFontDefs.push(fontDef);
        }
        var fontClass = this.__getFontClass(fontDef);
        var font = new fontClass();

        // Inject information about custom charcter set tests before we apply the
        // complete blob in one.
        if (fontDef.comparisonString) {
          font.setComparisonString(fontDef.comparisonString);
        }

        createdFonts[fontId] = font;
        qx.Class.getProperties(qx.bom.Font).forEach(propertyName => {
          let value = fontDef[propertyName];
          if (value !== undefined) {
            font["set" + qx.lang.String.firstUp(propertyName)](value);
          }
        });
        createdFonts[fontId].themed = true;
      }

      // Load all of the web fonts
      for (let webFontDef of webFontDefs) {
        let loader = qx.bom.webfonts.WebFontLoader.getLoader(
          webFontDef.family[0],
          true
        );

        ["css", "fontFaces", "comparisonString", "version"].forEach(
          propertyName => {
            if (webFontDef[propertyName]) {
              loader["set" + qx.lang.String.firstUp(propertyName)](
                webFontDef[propertyName]
              );
            }
          }
        );

        loader.load();
      }

      // Initialise the fonts, including those that refer to the loaded web fonts
      for (let fontId in createdFonts) {
        let font = createdFonts[fontId];
        font.loadComplete();
      }

      return createdFonts;
    },

    // apply method
    _applyTheme(value) {
      let createdFonts = (this._dynamic = {});

      for (let key in createdFonts) {
        if (createdFonts[key].themed) {
          createdFonts[key].dispose();
          delete createdFonts[key];
        }
      }

      if (value) {
        var fonts = this._manifestFonts
          ? Object.assign(value.fonts, this._manifestFonts)
          : value.fonts;
        createdFonts = this.__initialiseFonts(fonts);
      }

      this._setDynamic(createdFonts);
    },

    /**
     * Decides which Font class should be used based on the theme configuration
     *
     * @param config {Map} The font's configuration map
     * @return {Class}
     */
    __getFontClass(config) {
      if (config.fontFaces || config.css) {
        return qx.bom.webfonts.WebFont;
      }
      return qx.bom.Font;
    },

    /**
     * Returns the font information output by the compiler
     * @internal subject to change
     * @return {Object}
     */
    getManifestFonts() {
      return this._manifestFonts;
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    this._disposeMap("_dynamic");
  }
});
