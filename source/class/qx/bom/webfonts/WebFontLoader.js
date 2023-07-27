/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Loads web fonts
 */
qx.Class.define("qx.bom.webfonts.WebFontLoader", {
  extend: qx.core.Object,

  construct(fontFamily) {
    super();
    this.setFontFamily(fontFamily);
    this.__validators = {};
  },

  properties: {
    /** The font name that this font is known by */
    fontFamily: {
      check: "String"
    },

    /** The fontFaces which need to be defined */
    fontFaces: {
      nullable: true,
      apply: "_applyFontFaces"
    },

    /** CSS urls or paths which need to be loaded */
    css: {
      nullable: true,
      check: "Array"
    },

    /**
     * Characters that are used to test if the font has loaded properly. These
     * default to "WEei" in `qx.bom.webfont.Validator` and can be overridden
     * for certain cases like icon fonts that do not provide the predefined
     * characters.
     */
    comparisonString: {
      check: "String",
      init: null,
      nullable: true
    },

    /**
     * Version identifier that is appended to the URL to be loaded. Fonts
     * that are defined thru themes may be managed by the resource manager.
     * In this case updated fonts persist due to aggressive fontface caching
     * of some browsers. To get around this, set the `version` property to
     * the version of your font. It will be appended to the CSS URL and forces
     * the browser to re-validate.
     *
     * The version needs to be URL friendly, so only characters, numbers,
     * dash and dots are allowed here.
     */
    version: {
      check(value) {
        return (
          value === null ||
          (typeof value === "string" && /^[a-zA-Z0-9.-]+$/.test(value))
        );
      },
      init: null,
      nullable: true
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __fontFacesQueue: null,
    __fontFacesCreatedPromise: null,

    _validators: null,

    getValidator(fontWeight, fontStyle) {
      fontWeight = fontWeight || "normal";
      fontStyle = fontStyle || "normal";
      let id = fontWeight + "::" + fontStyle;
      let validator = this.__validators[id];
      if (!validator) {
        validator = this.__validators[id] = new qx.bom.webfonts.Validator(
          this.getFontFamily(),
          this.getComparisonString(),
          fontWeight,
          fontStyle
        );

        validator.setTimeout(qx.bom.webfonts.WebFont.VALIDATION_TIMEOUT);
        validator.validate();
      }
      return validator;
    },

    /**
     * Called to load the font details into the browser
     */
    async load() {
      (this.getCss() || []).forEach(url => {
        if (!url.match(/^https?:/)) {
          url = qx.util.ResourceManager.getInstance().toUri(url);
        }
        if (this.getVersion()) {
          url += url.indexOf("?") < 0 ? "?" : "&";
          url += this.getVersion();
        }
        qx.bom.webfonts.WebFontLoader.__loadStylesheet(url);
      });
      let fontFaces = this.getFontFaces();
      if (fontFaces) {
        fontFaces.forEach(fontFace => {
          if (fontFace.paths) {
            fontFace.paths = fontFace.paths.map(path => {
              if (!path.match(/^https?:/)) {
                path = qx.util.ResourceManager.getInstance().toUri(path);
              }
              if (this.getVersion()) {
                path += path.indexOf("?") < 0 ? "?" : "&";
                path += this.getVersion();
              }
              return path;
            });
          }
        });
        this.__fontFacesQueue = qx.lang.Array.clone(fontFaces);
        this.__fontFacesCreatedPromise = new qx.Promise();
      }
      this.__dequeueFontFaces();
    },

    async promiseLoaded() {
      return await this.__fontFacesCreatedPromise;
    },

    /**
     * Adds the font faces in __fontFacesQueue
     */
    __dequeueFontFaces() {
      if (this.__fontFacesQueue == null) {
        return;
      }
      let fontFace = this.__fontFacesQueue.pop();

      this.__addFontFace(fontFace);

      if (this.__fontFacesQueue.length == 0) {
        this.__fontFacesQueue = null;
        this.__fontFacesCreatedPromise.resolve(true);
      }

      if (
        qx.core.Environment.get("engine.name") == "mshtml" &&
        (parseInt(qx.core.Environment.get("engine.version")) < 9 ||
          qx.core.Environment.get("browser.documentmode") < 9)
      ) {
        // old IEs need a break in between adding @font-face rules
        setTimeout(() => this.__dequeueFontFaces(), 100);
      } else {
        this.__dequeueFontFaces();
      }
    },

    /**
     * Adds a font face definition to the browser
     *
     * @param {*} fontFace - POJO of from the array in Manifest.json
     * @returns
     */
    __addFontFace(fontFace) {
      let fontFamily = fontFace.fontFamily || this.getFontFamily();
      let fontLookupKey = qx.bom.webfonts.WebFontLoader.createFontLookupKey(
        fontFamily,
        fontFace.fontWeight || "normal",
        fontFace.fontStyle || "normal"
      );

      if (qx.bom.webfonts.WebFontLoader.__addedFontFaces[fontLookupKey]) {
        return;
      }

      if (!qx.bom.webfonts.WebFontLoader.__styleSheet) {
        let styleSheet = qx.bom.Stylesheet.createElement();
        qx.bom.webfonts.WebFontLoader.__styleSheet = styleSheet;
        if (qx.core.Environment.get("qx.debug")) {
          styleSheet.ownerNode.setAttribute(
            "data-qx-created-by",
            qx.bom.webfonts.WebFontLoader.classname
          );

          styleSheet.ownerNode.$$qxObject = this;
        }
      }

      let sourcesMap = {};
      const MATCH_FORMAT = new RegExp(
        ".(" +
          qx.bom.webfonts.WebFontLoader.getPreferredFormats().join("|") +
          ")"
      );

      /*
       * When compiling a `@font-face` rule, note that the first "src:" must never specify a format
       * and that EOT must go first if there is one
       */

      let fontFaceSrcRules = [];
      for (let i = 0; i < fontFace.paths.length; i++) {
        let match = MATCH_FORMAT.exec(fontFace.paths[i]);
        if (!match) {
          continue;
        }

        let fontFormat = match[1];
        let url = fontFace.paths[i];
        if (this.getVersion()) {
          url += "?" + this.getVersion();
        }

        fontFaceSrcRules.push({
          url: url,
          format: fontFormat
        });

        if (fontFormat == "eot") {
          fontFaceSrcRules.push({
            url: url + "?#iefix'",
            format: "embedded-opentype"
          });
        }
      }
      fontFaceSrcRules = fontFaceSrcRules.sort((a, b) => {
        a.fontFormat == "embedded-opentype" ? -1 : 0;
      });

      let strSources = "src: ";
      for (let i = 0; i < fontFaceSrcRules.length; i++) {
        if (i > 0) {
          strSources += ", ";
        }
        strSources +=
          "url('" +
          new URL(fontFaceSrcRules[i].url, document.baseURI).href +
          "')";
        if (i > 0) {
          strSources += " format('" + fontFaceSrcRules[i].format + "')";
        }
      }
      strSources += ";\n";

      let rule = "font-family: " + fontFamily + ";\n";
      rule += strSources + "\n";
      rule += "font-style: " + (fontFace.fontStyle || "normal") + ";\n";
      rule += "font-weight: " + (fontFace.fontWeight || "normal") + ";\n";

      rule = "@font-face {\n" + rule + "}\n";

      let styleSheet = qx.bom.webfonts.WebFontLoader.__styleSheet;
      try {
        if (
          qx.core.Environment.get("browser.name") == "ie" &&
          qx.core.Environment.get("browser.documentmode") < 9
        ) {
          let cssText = qx.bom.webfonts.WebFontLoader.__fixCssText(
            styleSheet.cssText
          );

          cssText += rule;
          styleSheet.cssText = cssText;
        } else {
          styleSheet.insertRule(rule, styleSheet.cssRules.length);
        }
      } catch (ex) {
        if (qx.core.Environment.get("qx.debug")) {
          this.warn("Error while adding @font-face rule:", ex.message);
          return;
        }
      }

      qx.bom.webfonts.WebFontLoader.__addedFontFaces[fontLookupKey] = true;
    },

    // property apply
    _applyFontFaces(fontFaces, old) {
      var families = [];

      for (var i = 0, l = fontFaces.length; i < l; i++) {
        let fontFace = fontFaces[i];
        var familyName = this._quoteFontFamily(
          fontFace.family || this.getFontFamily()
        );

        if (families.indexOf(familyName) < 0) {
          families.push(familyName);
        }
      }
    },

    /**
     * Makes sure font-family names containing spaces are properly quoted
     *
     * @param familyName {String} A font-family CSS value
     * @return {String} The quoted family name
     */
    _quoteFontFamily(familyName) {
      return familyName.replace(/["']/g, "");
    }
  },

  statics: {
    /**
     * List of known font definition formats (i.e. file extensions). Used to
     * identify the type of each font file configured for a web font.
     */
    FONT_FORMATS: ["eot", "woff2", "woff", "ttf", "svg"],

    /**
     * Timeout (in ms) to wait before deciding that a web font was not loaded.
     */
    VALIDATION_TIMEOUT: 5000,

    /** @type{String[]} array of supported font formats, most preferred first */
    __preferredFormats: null,

    /** */
    __loadedStylesheets: {},
    __addedFontFaces: {},

    /** Loader instances indexed by font family name */
    __loaders: {},

    /**
     * Gets/creates a loader
     *
     * @param {String} name font family name
     * @param {Boolean?} create whether to create one if one does not exist (default to false)
     * @returns
     */
    getLoader(name, create) {
      let loader = qx.bom.webfonts.WebFontLoader.__loaders[name];
      if (!loader && create) {
        loader = qx.bom.webfonts.WebFontLoader.__loaders[name] =
          new qx.bom.webfonts.WebFontLoader(name);
      }
      return loader;
    },

    /**
     * Adds a stylesheet, once per url
     *
     * @param {String} url
     */
    __loadStylesheet(url) {
      if (qx.bom.webfonts.WebFontLoader.__loadedStylesheets[url]) {
        return;
      }

      qx.bom.Stylesheet.includeFile(url);
      qx.bom.webfonts.WebFontLoader.__loadedStylesheets[url] = true;
    },

    /**
     * Creates a lookup key to index the created fonts.
     * @param familyName {String} font-family name
     * @param fontWeight {String} the font-weight.
     * @param fontStyle {String} the font-style.
     * @return {string} the font lookup key
     */
    createFontLookupKey(familyName, fontWeight, fontStyle) {
      var lookupKey =
        familyName +
        "_" +
        (fontWeight ? fontWeight : "normal") +
        "_" +
        (fontStyle ? fontStyle : "normal");
      return lookupKey;
    },

    /**
     * Uses a naive regExp match to determine the format of each defined source
     * file for a webFont. Returns a map with the format names as keys and the
     * corresponding source URLs as values.
     *
     * @param sources {String[]} Array of source URLs
     * @return {Map} Map of formats and URLs
     */
    __getSourcesMap(sources) {
      var formats = qx.bom.webfonts.WebFontLoader.FONT_FORMATS;
      var sourcesMap = {};
      var reg = new RegExp(".(" + formats.join("|") + ")");
      for (var i = 0, l = sources.length; i < l; i++) {
        var match = reg.exec(sources[i]);
        if (match) {
          var type = match[1];
          sourcesMap[type] = sources[i];
        }
      }
      return sourcesMap;
    },

    /**
     * Returns the preferred font format(s) for the currently used browser. Some
     * browsers support multiple formats, e.g. WOFF and TTF or WOFF and EOT. In
     * those cases, WOFF is considered the preferred format.
     *
     * @return {String[]} List of supported font formats ordered by preference
     * or empty Array if none could be determined
     */
    getPreferredFormats() {
      if (qx.bom.webfonts.WebFontLoader.__preferredFormats) {
        return qx.bom.webfonts.WebFontLoader.__preferredFormats;
      }

      var preferredFormats = [];
      var browser = qx.core.Environment.get("browser.name");
      var browserVersion = qx.core.Environment.get("browser.version");
      var os = qx.core.Environment.get("os.name");
      var osVersion = qx.core.Environment.get("os.version");

      if (
        (browser == "edge" && browserVersion >= 14) ||
        (browser == "firefox" && browserVersion >= 69) ||
        (browser == "chrome" && browserVersion >= 36)
      ) {
        preferredFormats.push("woff2");
      }

      if (
        (browser == "ie" &&
          qx.core.Environment.get("browser.documentmode") >= 9) ||
        (browser == "edge" && browserVersion >= 12) ||
        (browser == "firefox" && browserVersion >= 3.6) ||
        (browser == "chrome" && browserVersion >= 6)
      ) {
        preferredFormats.push("woff");
      }

      if (
        (browser == "edge" && browserVersion >= 12) ||
        (browser == "opera" && browserVersion >= 10) ||
        (browser == "safari" && browserVersion >= 3.1) ||
        (browser == "firefox" && browserVersion >= 3.5) ||
        (browser == "chrome" && browserVersion >= 4) ||
        (browser == "mobile safari" && os == "ios" && osVersion >= 4.2)
      ) {
        preferredFormats.push("ttf");
      }

      if (browser == "ie" && browserVersion >= 4) {
        preferredFormats.push("eot");
      }

      if (browser == "mobileSafari" && os == "ios" && osVersion >= 4.1) {
        preferredFormats.push("svg");
      }

      return (qx.bom.webfonts.WebFontLoader.__preferredFormats =
        preferredFormats);
    },

    /**
     * IE 6 and 7 omit the trailing quote after the format name when
     * querying cssText. This needs to be fixed before cssText is replaced
     * or all rules will be invalid and no web fonts will work any more.
     *
     * @param cssText {String} CSS text
     * @return {String} Fixed CSS text
     */
    __fixCssText(cssText) {
      return cssText
        .replace("'eot)", "'eot')")
        .replace("('embedded-opentype)", "('embedded-opentype')");
    }
  }
});
