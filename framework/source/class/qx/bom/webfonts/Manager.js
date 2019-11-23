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
 * Manages font-face definitions, making sure that each rule is only applied
 * once. It supports adding fonts of the same family but with different style
 * and weight. For instance, the following declaration uses 4 different source
 * files and combine them in a single font family.
 *
 * <pre class='javascript'>
 *   sources: [
 *     {
 *       family: "Sansation",
 *       source: [
 *         "fonts/Sansation-Regular.ttf"
 *       ]
 *     },
 *     {
 *       family: "Sansation",
 *       fontWeight: "bold",
 *       source: [
 *         "fonts/Sansation-Bold.ttf",
 *       ]
 *     },
 *     {
 *       family: "Sansation",
 *       fontStyle: "italic",
 *       source: [
 *         "fonts/Sansation-Italic.ttf",
 *       ]
 *     },
 *     {
 *       family: "Sansation",
 *       fontWeight: "bold",
 *       fontStyle: "italic",
 *       source: [
 *         "fonts/Sansation-BoldItalic.ttf",
 *       ]
 *     }
 *   ]
 * </pre>
 * 
 * This class does not need to be disposed, except when you want to abort the loading
 * and validation process.
 */
qx.Class.define("qx.bom.webfonts.Manager", {

  extend : qx.core.Object,

  type : "singleton",


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.__createdStyles = [];
    this.__validators = {};
    this.__queue = [];
    this.__preferredFormats = this.getPreferredFormats();
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * List of known font definition formats (i.e. file extensions). Used to
     * identify the type of each font file configured for a web font.
     */
    FONT_FORMATS : ["eot", "woff2", "woff", "ttf", "svg"],

    /**
     * Timeout (in ms) to wait before deciding that a web font was not loaded.
     */
    VALIDATION_TIMEOUT : 5000
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __createdStyles : null,
    __styleSheet : null,
    __validators : null,
    __preferredFormats : null,
    __queue : null,
    __queueInterval : null,


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Adds the necessary font-face rule for a web font to the document. Also
     * creates a web font Validator ({@link qx.bom.webfonts.Validator}) that
     * checks if the webFont was applied correctly.
     *
     * @param familyName {String} Name of the web font
     * @param sourcesList {Object} List of source URLs along with their style
     * (e.g. fontStyle: "italic") and weight (e.g. fontWeight: "bold").
     * For maximum compatibility, this should include EOT, WOFF and TTF versions
     * of the font.
     * @param callback {Function?} Optional event listener callback that will be
     * executed once the validator has determined whether the webFont was
     * applied correctly.
     * See {@link qx.bom.webfonts.Validator#changeStatus}
     * @param context {Object?} Optional context for the callback function
     */
    require : function(familyName, sourcesList, callback, context)
    {
      var sourceUrls = sourcesList.source;
      var comparisonString = sourcesList.comparisonString;
      var version = sourcesList.version;
      var fontWeight = sourcesList.fontWeight;
      var fontStyle = sourcesList.fontStyle;
      var sources = [];
      for (var i=0,l=sourceUrls.length; i<l; i++) {
        var split = sourceUrls[i].split("#");
        var src = qx.util.ResourceManager.getInstance().toUri(split[0]);
        if (split.length > 1) {
          src = src + "#" + split[1];
        }
        sources.push(src);
      }

      // old IEs need a break in between adding @font-face rules
      if (qx.core.Environment.get("engine.name") == "mshtml" && (
          parseInt(qx.core.Environment.get("engine.version")) < 9 ||
          qx.core.Environment.get("browser.documentmode") < 9)) {
        if (!this.__queueInterval) {
          this.__queueInterval = new qx.event.Timer(100);
          this.__queueInterval.addListener("interval", this.__flushQueue, this);
        }

        if (!this.__queueInterval.isEnabled()) {
          this.__queueInterval.start();
        }

        this.__queue.push([familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context]);
      } else {
        this.__require(familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context);
      }
    },


    /**
     * Removes a font's font-face definition from the style sheet. This means
     * the font will no longer be available and any elements using it will
     * fall back to the their regular font-families.
     *
     * @param familyName {String} font-family name
     * @param fontWeight {String} the font-weight.
     * @param fontStyle {String} the font-style.
     */
    remove : function(familyName, fontWeight, fontStyle) {
      var fontLookupKey = this.__createFontLookupKey(familyName, fontWeight, fontStyle);
      var index = null;
      for (var i=0,l=this.__createdStyles.length; i<l; i++) {
        if (this.__createdStyles[i] == fontLookupKey) {
          index = i;
          this.__removeRule(familyName, fontWeight, fontStyle);
          break;
        }
      }
      if (index !== null) {
        qx.lang.Array.removeAt(this.__createdStyles, index);
      }
      if (familyName in this.__validators) {
        this.__validators[familyName].dispose();
        delete this.__validators[familyName];
      }
    },


    /**
     * Returns the preferred font format(s) for the currently used browser. Some
     * browsers support multiple formats, e.g. WOFF and TTF or WOFF and EOT. In
     * those cases, WOFF is considered the preferred format.
     *
     * @return {String[]} List of supported font formats ordered by preference
     * or empty Array if none could be determined
     */
    getPreferredFormats : function()
    {
      var preferredFormats = [];
      var browser = qx.core.Environment.get("browser.name");
      var browserVersion = qx.core.Environment.get("browser.version");
      var os = qx.core.Environment.get("os.name");
      var osVersion = qx.core.Environment.get("os.version");

      if ((browser == "edge" && browserVersion >= 14) ||
          (browser == "firefox" && browserVersion >= 69) ||
          (browser == "chrome" && browserVersion >= 36)) {
        preferredFormats.push("woff2");
      }

      if ((browser == "ie" && qx.core.Environment.get("browser.documentmode") >= 9) ||
          (browser == "edge" && browserVersion >= 12) ||
          (browser == "firefox" && browserVersion >= 3.6) ||
          (browser == "chrome" && browserVersion >= 6)) {
        preferredFormats.push("woff");
      }

      if ((browser == "edge" && browserVersion >= 12) ||
          (browser == "opera" && browserVersion >= 10) ||
          (browser == "safari" && browserVersion >= 3.1) ||
          (browser == "firefox" && browserVersion >= 3.5) ||
          (browser == "chrome" && browserVersion >= 4) ||
          (browser == "mobile safari" && os == "ios" && osVersion >= 4.2)) {
        preferredFormats.push("ttf");
      }

      if (browser == "ie" && browserVersion >= 4) {
        preferredFormats.push("eot");
      }

      if (browser == "mobileSafari" && os == "ios" && osVersion >= 4.1) {
        preferredFormats.push("svg");
      }

      return preferredFormats;
    },


    /**
     * Removes the styleSheet element used for all web font definitions from the
     * document. This means all web fonts declared by the manager will no longer
     * be available and elements using them will fall back to their regular
     * font-families
     */
    removeStyleSheet : function()
    {
      this.__createdStyles = [];
      if (this.__styleSheet) {
        qx.bom.Stylesheet.removeSheet(this.__styleSheet);
      }
      this.__styleSheet = null;
    },



    /*
    ---------------------------------------------------------------------------
      PRIVATE API
    ---------------------------------------------------------------------------
    */

    /**
     * Creates a lookup key to index the created fonts.
     * @param familyName {String} font-family name
     * @param fontWeight {String} the font-weight.
     * @param fontStyle {String} the font-style.
     * @return {string} the font lookup key
     */
    __createFontLookupKey: function (familyName, fontWeight, fontStyle) {
      var lookupKey = familyName + "_" + (fontWeight ? fontWeight : "normal") + "_" + (fontStyle ? fontStyle : "normal");
      return lookupKey;
    },

    /**
     * Does the actual work of adding stylesheet rules and triggering font
     * validation
     *
     * @param familyName {String} Name of the web font
     * @param sources {String[]} List of source URLs. For maximum compatibility,
     * this should include EOT, WOFF and TTF versions of the font.
     * @param fontWeight {String} the web font should be registered using a
     * fontWeight font weight.
     * @param fontStyle {String} the web font should be registered using an
     * fontStyle font style.
     * @param comparisonString {String} String to check whether the font has loaded or not
     * @param version {String?} Optional version that is appended to the font URL to be able to override caching
     * @param callback {Function?} Optional event listener callback that will be
     * executed once the validator has determined whether the webFont was
     * applied correctly.
     * @param context {Object?} Optional context for the callback function
     */
    __require : function(familyName, sources, fontWeight, fontStyle, comparisonString, version, callback, context)
    {
      var fontLookupKey = this.__createFontLookupKey(familyName, fontWeight, fontStyle);
      if (!this.__createdStyles.includes(fontLookupKey)) {
        var sourcesMap = this.__getSourcesMap(sources);
        var rule = this.__getRule(familyName, fontWeight, fontStyle, sourcesMap, version);

        if (!rule) {
          throw new Error("Couldn't create @font-face rule for WebFont " + familyName + "!");
        }

        if (!this.__styleSheet) {
          this.__styleSheet = qx.bom.Stylesheet.createElement();
        }

        try {
          this.__addRule(rule);
        }
        catch(ex) {
          if (qx.core.Environment.get("qx.debug")) {
            this.warn("Error while adding @font-face rule:", ex.message);
            return;
          }
        }
        this.__createdStyles.push(fontLookupKey);
      }

      if (!this.__validators[familyName]) {
        this.__validators[familyName] = new qx.bom.webfonts.Validator(familyName, comparisonString);
        this.__validators[familyName].setTimeout(qx.bom.webfonts.Manager.VALIDATION_TIMEOUT);
        this.__validators[familyName].addListenerOnce("changeStatus", this.__onFontChangeStatus, this);
      }

      if (callback) {
        var cbContext = context || window;
        this.__validators[familyName].addListenerOnce("changeStatus", callback, cbContext);
      }

      this.__validators[familyName].validate();
    },


    /**
     * Processes the next item in the queue
     */
    __flushQueue : function()
    {
      if (this.__queue.length == 0) {
        this.__queueInterval.stop();
        return;
      }
      var next = this.__queue.shift();
      this.__require.apply(this, next);
    },


    /**
     * Removes the font-face declaration if a font could not be validated
     *
     * @param ev {qx.event.type.Data} qx.bom.webfonts.Validator#changeStatus
     */
    __onFontChangeStatus : function(ev)
    {
      var result = ev.getData();
      if (result.valid === false) {
        qx.event.Timer.once(function() {
          this.remove(result.family);
        }, this, 250);
      }
    },


    /**
     * Uses a naive regExp match to determine the format of each defined source
     * file for a webFont. Returns a map with the format names as keys and the
     * corresponding source URLs as values.
     *
     * @param sources {String[]} Array of source URLs
     * @return {Map} Map of formats and URLs
     */
    __getSourcesMap : function(sources)
    {
      var formats = qx.bom.webfonts.Manager.FONT_FORMATS;
      var sourcesMap = {};
      var reg = new RegExp("\.(" + formats.join("|") + ")");
      for (var i=0, l=sources.length; i<l; i++) {
        var match = reg.exec(sources[i]);
        if (match) {
          var type = match[1];
          sourcesMap[type] = sources[i];
        }
      }
      return sourcesMap;
    },


    /**
     * Assembles the body of a font-face rule for a single webFont.
     *
     * @param familyName {String} Font-family name
     * @param fontWeight {String} the web font should be registered using a
     * fontWeight font weight.
     * @param fontStyle {String} the web font should be registered using an
     * fontStyle font style.
     * @param sourcesMap {Map} Map of font formats and sources
     * @param version {String?} Optional version to be appended to the URL
     * @return {String} The computed CSS rule
     */
    __getRule : function(familyName, fontWeight, fontStyle, sourcesMap, version)
    {
      var rules = [];

      var formatList = this.__preferredFormats.length > 0
        ? this.__preferredFormats : qx.bom.webfonts.Manager.FONT_FORMATS;

      for (var i=0,l=formatList.length; i<l; i++) {
        var format = formatList[i];
        if (sourcesMap[format]) {
          rules.push(this.__getSourceForFormat(format, sourcesMap[format], version));
        }
      }

      var rule = "src: " + rules.join(",\n") + ";";

      rule = "font-family: " + familyName + ";\n" + rule;
      rule = rule + "\nfont-style: " + (fontStyle ? fontStyle : "normal") + ";";
      rule = rule + "\nfont-weight: " + (fontWeight ? fontWeight : "normal") + ";";

      return rule;
    },


    /**
     * Returns the full src value for a given font URL depending on the type

     * @param format {String} The font format, one of eot, woff2, woff, ttf, svg
     * @param url {String} The font file's URL
     * @param version {String?} Optional version to be appended to the URL
     * @return {String} The src directive
     */
    __getSourceForFormat : function(format, url, version)
    {
      if (version) {
        url += "?" + version;
      }

      switch(format) {
        case "eot": return "url('" + url + "');" +
          "src: url('" + url + "?#iefix') format('embedded-opentype')";
        case "woff2":
          return "url('" + url + "') format('woff2')";
        case "woff":
          return "url('" + url + "') format('woff')";
        case "ttf":
          return "url('" + url + "') format('truetype')";
        case "svg":
          return "url('" + url + "') format('svg')";
        default:
          return null;
      }
    },


    /**
     * Adds a font-face rule to the document
     *
     * @param rule {String} The body of the CSS rule
     */
    __addRule : function(rule)
    {
      var completeRule = "@font-face {" + rule + "}\n";

      if (qx.core.Environment.get("browser.name") == "ie" &&
          qx.core.Environment.get("browser.documentmode") < 9) {
        var cssText = this.__fixCssText(this.__styleSheet.cssText);
        cssText += completeRule;
        this.__styleSheet.cssText = cssText;
      }
      else {
        this.__styleSheet.insertRule(completeRule, this.__styleSheet.cssRules.length);
      }
    },


    /**
     * Removes the font-face declaration for the given font-family from the
     * stylesheet
     *
     * @param familyName {String} The font-family name
     * @param fontWeight {String} fontWeight font-weight.
     * @param fontStyle {String} fontStyle font-style.
     */
    __removeRule : function(familyName, fontWeight, fontStyle)
    {
      // In IE and edge even if the rule was added with font-style first
      // and font-weight second, it is not guaranteed that the attributes
      // remain in that order. Therefore we check for both version,
      // style first, weight second and weight first, style second.
      // Without this fix the rule isn't found and removed reliable. 
      var regtext = 
        "@font-face.*?" + familyName + 
        "(.*font-style: *" + (fontStyle ? fontStyle : "normal") + 
        ".*font-weight: *" + (fontWeight ? fontWeight : "normal")+")|" +
        "(.*font-weight: *" + (fontWeight ? fontWeight : "normal") + 
        ".*font-style: *" + (fontStyle ? fontStyle : "normal")+")"
        ;
      var reg = new RegExp(regtext, "m");
      for (var i=0,l=document.styleSheets.length; i<l; i++) {
        var sheet = document.styleSheets[i];
        if (sheet.cssText) {
          var cssText = sheet.cssText.replace(/\n/g, "").replace(/\r/g, "");
          cssText = this.__fixCssText(cssText);
          if (reg.exec(cssText)) {
            cssText = cssText.replace(reg, "");
          }
          sheet.cssText = cssText;
        }
        else if (sheet.cssRules) {
          for (var j=0,m=sheet.cssRules.length; j<m; j++) {
            var cssText = sheet.cssRules[j].cssText.replace(/\n/g, "").replace(/\r/g, "");
            if (reg.exec(cssText)) {
              this.__styleSheet.deleteRule(j);
              return;
            }
          }
        }
      }
    },

    /**
     * IE 6 and 7 omit the trailing quote after the format name when
     * querying cssText. This needs to be fixed before cssText is replaced
     * or all rules will be invalid and no web fonts will work any more.
     *
     * @param cssText {String} CSS text
     * @return {String} Fixed CSS text
     */
    __fixCssText : function(cssText)
    {
      return cssText.replace("'eot)", "'eot')")
        .replace("('embedded-opentype)", "('embedded-opentype')");
    }

  },

  /*
  *****************************************************************************
    DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.__queueInterval) {
      this.__queueInterval.stop();
      this.__queueInterval.dispose();
    }
    delete this.__createdStyles;
    this.removeStyleSheet();
    for (var prop in this.__validators) {
      this.__validators[prop].dispose();
    }
    qx.bom.webfonts.Validator.removeDefaultHelperElements();
  }
});
