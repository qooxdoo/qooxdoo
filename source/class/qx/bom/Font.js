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
     * Fabian Jakobs (fjakobs)
     * Mustafa Sak (msak)

************************************************************************ */

/**
 * A wrapper for CSS font styles. Fond objects can be applied to instances
 * of {@link qx.html.Element}.
 */
qx.Class.define("qx.bom.Font", {
  extend: qx.core.Object,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param size {String?} The font size (Unit: pixel)
   * @param family {String[]?} A sorted list of font families
   */
  construct(size, family) {
    super();

    this.__lookupMap = {
      fontFamily: "",
      fontSize: null,
      fontWeight: null,
      fontStyle: null,
      textDecoration: null,
      lineHeight: null,
      color: null,
      textShadow: null,
      letterSpacing: null
    };

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

  statics: {
    /**
     * Converts a typical CSS font definition string to an font object
     *
     * Example string: <code>bold italic 20px Arial</code>
     *
     * @param str {String} the CSS string
     * @return {qx.bom.Font} the created instance
     */
    fromString(str) {
      var font = new qx.bom.Font();
      var parts = str.split(/\s+/);
      var name = [];
      var part;

      for (var i = 0; i < parts.length; i++) {
        switch ((part = parts[i])) {
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
     * Converts a map property definition into a font object.
     *
     * @param config {Map} map of property values
     * @return {qx.bom.Font} the created instance
     */
    fromConfig(config) {
      var font = new qx.bom.Font();
      font.set(config);
      return font;
    },

    /** @type {Map} Default (empty) CSS styles */
    __defaultStyles: {
      fontFamily: "",
      fontSize: "",
      fontWeight: "",
      fontStyle: "",
      textDecoration: "",
      lineHeight: 1.2,
      color: "",
      textShadow: "",
      letterSpacing: ""
    },

    /**
     * Returns a map of all properties in empty state.
     *
     * This is useful for resetting previously configured
     * font styles.
     *
     * @return {Map} Default styles
     */
    getDefaultStyles() {
      return this.__defaultStyles;
    }
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    /** The font size (Unit: pixel) */
    size: {
      check: "Integer",
      nullable: true,
      apply: "_applySize"
    },

    /**
     * The line height as scaling factor of the default line height. A value
     * of 1 corresponds to the default line height
     */
    lineHeight: {
      check: "Number",
      nullable: true,
      apply: "_applyLineHeight"
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
    },

    /** A sorted list of font families */
    family: {
      check: "Array",
      nullable: true,
      apply: "_applyFamily"
    },

    /** Whether the font is bold */
    bold: {
      check: "Boolean",
      nullable: true,
      apply: "_applyBold"
    },

    /** Whether the font is italic */
    italic: {
      check: "Boolean",
      nullable: true,
      apply: "_applyItalic"
    },

    /** The text decoration for this font */
    decoration: {
      check: ["underline", "line-through", "overline"],
      nullable: true,
      apply: "_applyDecoration"
    },

    /** The text color for this font */
    color: {
      check: "Color",
      nullable: true,
      apply: "_applyColor"
    },

    /** The text shadow for this font */
    textShadow: {
      nullable: true,
      check: "String",
      apply: "_applyTextShadow"
    },

    /** The weight property of the font as opposed to just setting it to 'bold' by setting the bold property to true */
    weight: {
      nullable: true,
      check: "String",
      apply: "_applyWeight"
    },

    /** The Letter Spacing (Unit: pixel) */
    letterSpacing: {
      check: "Integer",
      nullable: true,
      apply: "_applyLetterSpacing"
    },

    /**
     * This specifies the name of the font defined in Manifest.json in `provides.fonts` - setting it will
     * copy the values from the Manifest into this font definition
     */
    fontName: {
      check: "String",
      nullable: true,
      apply: "_applyFontName"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __lookupMap: null,

    /**
     * Called by the theme manager when all the properties to be set, have been set
     */
    async loadComplete() {
      // Nothing
    },

    // property apply
    _applySize(value, old) {
      this.__lookupMap.fontSize = value === null ? null : value + "px";
    },

    _applyLineHeight(value, old) {
      this.__lookupMap.lineHeight = value === null ? null : value;
    },

    // property apply
    _applyFamily(value, old) {
      var family = "";

      for (var i = 0, l = value.length; i < l; i++) {
        // in FireFox 2 and WebKit fonts like 'serif' or 'sans-serif' must
        // not be quoted!
        if (value[i].indexOf(" ") > 0) {
          family += '"' + value[i] + '"';
        } else {
          family += value[i];
        }

        if (i !== l - 1) {
          family += ",";
        }
      }

      // font family is a special case. In order to render the labels correctly
      // we have to return a font family - even if it's an empty string to prevent
      // the browser from applying the element style
      this.__lookupMap.fontFamily = family;
    },

    // property apply
    _applyFontName(value) {
      if (value) {
        let data =
          qx.theme.manager.Font.getInstance().getManifestFonts()[value];
        if (!data) {
          this.warn("Cannot find a font called " + value);
        } else {
          let toSet = {};
          ["family", "comparisonString"].forEach(name => {
            if (data[name] !== undefined) {
              toSet[name] = data[name];
            }
          });
          this.set(toSet);
        }
      }
    },

    // property apply
    _applyBold(value, old) {
      this.__lookupMap.fontWeight =
        value == null ? null : value ? "bold" : "normal";
    },

    // property apply
    _applyItalic(value, old) {
      this.__lookupMap.fontStyle =
        value == null ? null : value ? "italic" : "normal";
    },

    // property apply
    _applyDecoration(value, old) {
      this.__lookupMap.textDecoration = value == null ? null : value;
    },

    // property apply
    _applyColor(value, old) {
      this.__lookupMap.color = null;
      if (value) {
        this.__lookupMap.color =
          qx.theme.manager.Color.getInstance().resolve(value);
      }
    },

    // property apply
    _applyWeight(value, old) {
      this.__lookupMap.fontWeight = value;
    },

    // property apply
    _applyTextShadow(value, old) {
      this.__lookupMap.textShadow = value == null ? null : value;
    },

    // property apply
    _applyLetterSpacing(value, old) {
      this.__lookupMap.letterSpacing = value === null ? null : value + "px";
    },

    /**
     * Get a map of all CSS styles, which will be applied to the widget. Only
     * the styles which are set are returned.
     *
     * @return {Map} Map containing the current styles. The keys are property
     * names which can directly be used with the <code>set</code> method of each
     * widget.
     */
    getStyles() {
      return this.__lookupMap;
    }
  }
});
