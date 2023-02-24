/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2023 Zenesis Limited https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (@johnspackman)

************************************************************************ */

const fs = require("fs");
const path = require("path");

/**
 * Represents a font as defined in the Manifest.json's
 *
 * @typedef Sources
 * @param {String?} family the family name that is in the font files (defaults to the name of the font)
 * @param {String[]?} paths the filenames of font files inside the resources dircetory
 * @param {String[]?} urls the urls of font files in a CDN
 *
 */
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

    /** Default size of the font */
    defaultSize: {
      init: null,
      nullable: true,
      check: "Integer"
    },

    /** Comparison string to be used */
    comparisonString: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** Sources array */
    sources: {
      init: null,
      check: "Array",
      nullable: true
    },

    /** Glyphs filename (relative to resources of the library that defines it) */
    glyphs: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** Family names for the browser to search for */
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
     * @param {Sources} sources (see comment for this class)
     * @return {String} code to include in the output
     */
    getBootstrapCode(target, application, sources) {
      let res = "";
      let font = {
        lineHeight: 1,
        family: this.getFamily() || [this.getName()]
      };

      if (this.getDefaultSize() !== null) {
        font.size = this.getDefaultSize();
      }
      if (sources && sources.length) {
        font.sources = sources.map(source => {
          let data = {
            family: source.family || this.getName()
          };

          if (!target.isLocalFonts() && source.urls) {
            data.urls = source.urls;
          } else if (source.paths) {
            data.source = source.paths;
          }
          return data;
        });
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
