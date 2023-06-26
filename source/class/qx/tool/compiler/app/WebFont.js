/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2017 GONICUS GmbH, http://www.gonicus.de
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * Cajus Pollmeier (pollmeier@gonicus.de, @cajus)
 *
 * *********************************************************************** */
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
const http = require("http");
const fontkit = require("fontkit");

var log = qx.tool.utils.LogManager.createLog("font");

/**
 * Represents a WebFont provided by a Library
 */
qx.Class.define("qx.tool.compiler.app.WebFont", {
  extend: qx.core.Object,

  construct(library) {
    super();
    this.__library = library;
  },

  properties: {
    /** The name of the webfont */
    name: {
      check: "String"
    },

    /** The default size */
    defaultSize: {
      check: "Integer",
      init: 40
    },

    /**
     * Optional mapping filename. The path is relative to the location of the
     * `Manifest.json` file. The mapping file is in json format and should contain
     * a map of icon name to code point in hex:
     * `{ "my_icon": "ef99", "my_other_icon": "483c"}`
     */
    mapping: {
      init: null,
      nullable: true,
      check: "String"
    },

    /**
     * Characters that are used to test if the font has loaded properly. These
     * default to "WEei" in `qx.bom.webfont.Validator` and can be overridden
     * for certain cases like icon fonts that do not provide the predefined
     * characters.
     */
    comparisonString: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** {String[]} Resources that make up the font; an array of Strings, each of which can be a URL or a local file */
    resources: {
      check: "Array"
    }
  },

  members: {
    __library: null,
    __fontData: null,

    /**
     * Helper which triggers a local font analyze run.
     *
     * @param filename {String} Filename for the local font
     * @return {Map<String,String>} mapping of glyphs to codepoints
     */
    async _loadLocalFont(filename) {
      let fontpath = path.join(
        this.__library.getRootDir(),
        path.join(this.__library.getResourcePath(), filename)
      );

      return await this.__processFontFile(fontpath);
    },

    /**
     * Helper which loads a remote font to analyze the result.
     *
     * @param url {String} URL for the font download
     * @return {Map<String,String>} mapping of glyphs to codepoints
     */
    async _loadRemoteFont(url) {
      let tmpFilename = await qx.tool.utils.Http.downloadToTempFile(
        url,
        /^font\/(ttf|svg|eot|woff|woff2)$/
      );

      let result = await this.__processFontFile(tmpFilename);
      fs.unlink(tmpFilename);
      return result;
    },

    /**
     * Common code to extract the desired font information from a font file
     * on disk.
     *
     * @param filename {String} Path to font file
     * @return {Map<String,String>} mapping of glyphs to codepoints
     */
    async __processFontFile(filename) {
      let font = await fontkit.open(filename);
      let resources = {};

      // If we have a mapping file, take qx.tool.compiler.Console.information instead
      // of anaylzing the font.
      if (this.getMapping()) {
        let mapPath = path.join(
          this.__library.getRootDir(),
          path.join(this.__library.getResourcePath(), this.getMapping())
        );

        let data;
        try {
          data = await fs.promises.readFile(mapPath, { encoding: "utf-8" });
        } catch (err) {
          log.error(`Cannot read mapping file '${mapPath}': ${err.code}`);
          throw err;
        }

        let map = JSON.parse(data);
        Object.keys(map).forEach(key => {
          let codePoint = parseInt(map[key], 16);
          let glyph = font.glyphForCodePoint(codePoint);
          if (!glyph.id) {
            qx.tool.compiler.Console.trace(
              `WARN: no glyph found in ${filename} ${key}: ${codePoint}`
            );

            return;
          }
          resources["@" + this.getName() + "/" + key] = [
            Math.ceil(
              (this.getDefaultSize() * glyph.advanceWidth) / glyph.advanceHeight
            ),

            // width
            this.getDefaultSize(), // height
            codePoint
          ];
        }, this);

        return resources;
      }

      if (!font.GSUB?.lookupList?.toArray()?.length) {
        qx.tool.compiler.Console.error(
          `The webfont in ${filename} does not have any ligatures`
        );

        return resources;
      }

      // some IconFonts (MaterialIcons for example) use ligatures
      // to name their icons. This code extracts the ligatures
      // hat tip to Jossef Harush https://stackoverflow.com/questions/54721774/extracting-ttf-font-ligature-mappings/54728584
      let ligatureName = {};
      let lookupList = font.GSUB.lookupList.toArray();
      let lookupListIndexes =
        font.GSUB.featureList[0].feature.lookupListIndexes;
      lookupListIndexes.forEach(index => {
        let subTable = lookupList[index].subTables[0];
        let leadingCharacters = [];
        if (subTable?.coverage?.rangeRecords) {
          subTable.coverage.rangeRecords.forEach(coverage => {
            for (let i = coverage.start; i <= coverage.end; i++) {
              let character = font.stringsForGlyph(i)[0];
              leadingCharacters.push(character);
            }
          });
        }
        let ligatureSets = subTable?.ligatureSets?.toArray() || [];
        ligatureSets.forEach((ligatureSet, ligatureSetIndex) => {
          let leadingCharacter = leadingCharacters[ligatureSetIndex];
          ligatureSet.forEach(ligature => {
            let character = font.stringsForGlyph(ligature.glyph)[0];
            if (!character) {
              // qx.tool.compiler.Console.log(`WARN: ${this.getName()} no character ${ligature}`);
              return;
            }
            let ligatureText =
              leadingCharacter +
              ligature.components.map(x => font.stringsForGlyph(x)[0]).join("");
            var hexId = character.charCodeAt(0).toString(16);
            if (ligatureName[hexId] == undefined) {
              ligatureName[hexId] = [ligatureText];
            } else {
              ligatureName[hexId].push(ligatureText);
            }
          });
        });
      });

      let defaultSize = this.getDefaultSize();
      font.characterSet.forEach(codePoint => {
        let glyph = font.glyphForCodePoint(codePoint);
        let commands = null;
        try {
          // This can throw an exception if the font does not support ligatures
          commands = glyph?.path?.commands;
        } catch (ex) {
          commands = null;
        }
        if (!commands?.length && !glyph.layers) {
          return;
        }

        const found = gName => {
          resources["@" + this.getName() + "/" + gName] = [
            Math.ceil(
              (this.getDefaultSize() * glyph.advanceWidth) / glyph.advanceHeight
            ),

            // width
            defaultSize, // height
            codePoint
          ];
        };
        if (glyph.name) {
          found(glyph.name);
        }
        var names = ligatureName[codePoint.toString(16)];
        if (names) {
          names.forEach(found);
        }
      }, this);

      return resources;
    },

    /**
     * Return bootstrap code that is executed before the Application starts.
     *
     * @param target  {qx.tool.compiler.targets.Target} the target
     * @param application  {qx.tool.compiler.app.Application} the application being built
     * @return {String}
     */
    getBootstrapCode(target, application) {
      let res = "";
      let font = {
        defaultSize: this.getDefaultSize(),
        lineHeight: 1,
        family: [this.getName()],
        fontFaces: [
          {
            paths: this.getResources()
          }
        ]
      };

      if (this.getComparisonString()) {
        font.comparisonString = this.getComparisonString();
      }

      return (res +=
        "qx.$$fontBootstrap['" +
        this.getName() +
        "']=" +
        JSON.stringify(font, null, 2) +
        ";");
    },

    /**
     * Called by {Target} to compile the fonts, called once per application build
     * (NOTE:: right now, this is called for each application - that is soon to be fixed)
     *
     * @param target  {qx.tool.compiler.targets.Target} the target
     * @return {Promise}
     */
    generateForTarget(target) {
      if (this.__generateForTargetPromise) {
        return this.__generateForTargetPromise;
      }

      const generate = async () => {
        for (let resource of this.getResources()) {
          // Search for the first supported extension
          let basename = resource.match(/^.*[/\\]([^/\\\?#]+).*$/)[1];
          // fontkit knows about these font formats
          if (!basename.match(/\.(ttf|otf|woff|woff2)$/)) {
            continue;
          }

          if (resource.match(/^https?:\/\//)) {
            this.__fontData = await this._loadRemoteFont(resource);
          } else {
            this.__fontData = await this._loadLocalFont(resource);
          }

          return this.__fontData;
        }

        throw new Error(
          `Failed to load/validate FontMap for webfont (expected ttf, otf, woff or woff2) ${this.getName()}`
        );
      };

      this.__generateForTargetPromise = generate();
      return this.__generateForTargetPromise;
    },

    /**
     * Called by Target to add fonts to an application
     *
     * @param target  {qx.tool.compiler.targets.Target} the target
     * @param application  {qx.tool.compiler.app.Application} the application being built
     * @return {Promise}
     */
    async generateForApplication(target, application) {
      return this.__fontData || null;
    },

    /**
     * Returns a string representation of this for debugging
     *
     * @return {String} the name or resource of this font
     */
    toString() {
      var str = this.getName();
      if (!str) {
        str = JSON.stringify(this.getResources());
      }
      return str;
    }
  }
});
