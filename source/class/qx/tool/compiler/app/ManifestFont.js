const fs = require("fs");
const path = require("path");

qx.Class.define("qx.tool.compiler.app.ManifestFont", {
  extend: qx.core.Object,

  construct(name) {
    super();
    this.setName(name);
  },

  properties: {
    /** The name of the font - this is the key in Manifest.json provides.fonts */
    name: {
      check: "String"
    },

    defaultSize: {
      init: null,
      nullable: true,
      check: "Integer"
    },

    comparisonString: {
      init: null,
      nullable: true,
      check: "String"
    },

    urls: {
      init: null,
      check: "Array",
      nullable: true
    },

    sources: {
      init: null,
      check: "Array",
      nullable: true
    },

    glyphs: {
      init: null,
      nullable: true,
      check: "String"
    },

    family: {
      init: null,
      nullable: true,
      check: "Array"
    }
  },

  members: {
    /** @type{Map<String,Object>} font data required by the Qooxdoo app at runtime */
    __fontData: null,

    /**
     * Updates this from the data in the Manifest.json
     *
     * @param {Object} data the data from Manifest
     * @param {qx.tool.compiler.app.Library} library the library
     */
    async updateFromManifest(data, library) {
      let toSet = {};
      [
        "defaultSize",
        "comparisonString",
        "urls",
        "sources",
        "glyphs",
        "family"
      ].forEach(name => {
        if (data.hasOwnProperty(name)) {
          toSet[name] = data[name];
        }
      });
      this.set(toSet);
      if (data.glyphs !== undefined) {
        let glyphsFilename = library.getResourceFilename(data.glyphs);
        let glyphsData = await fs.promises.readFile(glyphsFilename, "utf8");
        glyphsData = JSON.parse(glyphsData);
        this.__fontData = {};
        let name = this.getName();
        let defaultSize = this.getDefaultSize();

        for (let key in glyphsData) {
          let glyph = glyphsData[key];
          this.__fontData["@" + name + "/" + key] = [
            // width
            Math.ceil((defaultSize * glyph.advanceWidth) / glyph.advanceHeight),

            // height
            defaultSize,
            glyph.codePoint
          ];
        }
      }
    },

    /**
     * Generates the font data used by the application; loads the data if not already loaded
     *
     * @returns {Map<String,Object>}
     */
    getApplicationFontData() {
      return this.__fontData;
    },

    /**
     * Return bootstrap code that is executed before the Application starts.
     *
     * @param {qx.tool.compiler.targets.Target} target the target
     * @param {qx.tool.compiler.app.Application} application the application being built
     * @param {boolean} localFonts whether to prefer font files from local resources over CDNs
     * @param {String[]} sources array of URLs for CDN
     * @return {String}
     */
    getBootstrapCode(target, application, localFonts, sources) {
      let res = "";
      let font = {
        lineHeight: 1,
        family: this.getFamily() || [this.getName()]
      };

      if (this.getDefaultSize() !== null) {
        font.size = this.getDefaultSize();
      }
      if (!localFonts && this.getUrls()) {
        font.urls = this.getUrls();
      } else if (sources) {
        font.sources = sources.map(source => ({
          family: source.family || this.getName(),
          source: source.paths
        }));
      }
      if (this.getComparisonString()) {
        font.comparisonString = this.getComparisonString();
      }

      return (res +=
        "qx.$$fontBootstrap['" +
        this.getName() +
        "']=" +
        JSON.stringify(font, null, 2) +
        ";");
    }
  }
});
