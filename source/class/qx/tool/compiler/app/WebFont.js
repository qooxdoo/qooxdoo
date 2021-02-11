/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
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

  construct: function(library) {
    this.base(arguments);
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
     * @return {Promise}
     */
    _loadLocalFont : function(filename) {
      return new Promise((resolve, reject) => {
        let fontpath = path.join(this.__library.getRootDir(), path.join(this.__library.getResourcePath(), filename));
        this.__processFontFile(fontpath, resolve, reject);
      });
    },

    /**
     * Helper which loads a remote font to analyze the result.
     *
     * @param url {String} URL for the font download
     * @return {Promise}
     */
    _loadRemoteFont : function(url) {
      return new Promise(function(resolve, reject) {
        http.get(url, function(res) {
          let error;
          const { statusCode } = res;
          const contentType = res.headers["content-type"];

          if (statusCode !== 200) {
            error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
          } else if (!/^font\/(ttf|svg|eot|woff|woff2)$/.test(contentType)) {
            error = new Error("Invalid content-type.\n" +
              `Expected font/ttf, font/svg, font/eot, font/woff or font/woff2 but received ${contentType}`);
          }

          if (error) {
            res.resume();
            reject(error);
            return;
          }

          tmp.tmpName(function _tempNameGenerated(err, tmpFilename) {
            if (err) {
              reject(err);
              return;
            }

            let outFile =fs.createWriteStream(tmpFilename);
            outFile.on("close", function() {
              this.__processFontFile(tmpFilename, resolve, reject);
              fs.unlink(tmpFilename);
            }.bind(this));

            res.on("data", chunk => {
              outFile.write(chunk);
            });
            res.on("end", function() {
              outFile.end();
            });
          }.bind(this));
        }.bind(this)).on("error", e => {
          reject(e);
        });
      }.bind(this));
    },

    /**
     * Common code to extract the desired font information from a font file
     * on disk. It resolves the promises given by the calling stub (remote or
     * local font retrieval).
     *
     * @param filename {String} Path to font file
     * @param resolve {Function} External promise resolve
     * @param reject {Function} External promise reject
     */
    __processFontFile : function(filename, resolve, reject) {
      fontkit.open(filename, null, function(err, font) {
        if (err) {
          reject(err);
          return;
        }

        let resources = {};

        // If we have a mapping file, take this information instead
        // of anaylzing the font.
        if (this.getMapping()) {
          let mapPath = path.join(this.__library.getRootDir(), path.join(this.__library.getResourcePath(), this.getMapping()));
          fs.readFile(mapPath, {encoding: "utf-8"}, (err, data) => {
            if (err) {
              log.error(`Cannot read mapping file '${mapPath}': ${err.code}`);
              reject(err);
              return;
            }

            let map = JSON.parse(data);
            Object.keys(map).forEach(key => {
              let codePoint = parseInt(map[key], 16);
              let glyph = font.glyphForCodePoint(codePoint);
              if (!glyph.id) {
                qx.tool.compiler.Console.log(`WARN: no glyph found for ${font} ${key}: ${codePoint}`);
                return;
              }
              resources["@" + this.getName() + "/" + key] = [
                Math.ceil(this.getDefaultSize() * glyph.advanceWidth / glyph.advanceHeight), // width
                this.getDefaultSize(), // height
                codePoint
              ];
            }, this);

            resolve(resources);
            return;
          });

          return;
        }

        // some IconFonts (MaterialIcons for example) use ligatures
        // to name their icons. This code extracts the ligatures
        // hat tip to Jossef Harush https://stackoverflow.com/questions/54721774/extracting-ttf-font-ligature-mappings/54728584
        let ligatureName = {};
        let lookupList = font.GSUB.lookupList.toArray();
        let lookupListIndexes = font.GSUB.featureList[0].feature.lookupListIndexes;
        lookupListIndexes.forEach(index => {
          let subTable = lookupList[index].subTables[0];
          let leadingCharacters = [];
          subTable.coverage.rangeRecords.forEach(coverage => {
            for (let i = coverage.start; i <= coverage.end; i++) {
              let character = font.stringsForGlyph(i)[0];
              leadingCharacters.push(character);
            }
          });
          let ligatureSets = subTable.ligatureSets.toArray();
          ligatureSets.forEach((ligatureSet, ligatureSetIndex) => {
            let leadingCharacter = leadingCharacters[ligatureSetIndex];
            ligatureSet.forEach(ligature => {
              let character = font.stringsForGlyph(ligature.glyph)[0];
              if (!character) {
                // qx.tool.compiler.Console.log(`WARN: ${this.getName()} no character ${ligature}`);
                return;
              }
              let ligatureText = leadingCharacter + ligature
                .components
                .map(x => font.stringsForGlyph(x)[0])
                .join("");
              var hexId = character.charCodeAt(0).toString(16);
              if (ligatureName[hexId] == undefined) {
                ligatureName[hexId] = [ ligatureText ]; 
              } else {
                ligatureName[hexId].push(ligatureText); 
              }
            });
          });
        });

        let defaultSize = this.getDefaultSize();
        font.characterSet.forEach(codePoint => {
          let glyph = font.glyphForCodePoint(codePoint);
          if (glyph.path.commands.length < 1 && !glyph.layers) {
            return;
          }

          const found = gName => {
            resources["@" + this.getName() + "/" + gName] = [
              Math.ceil(this.getDefaultSize() * glyph.advanceWidth / glyph.advanceHeight), // width
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


        resolve(resources);
      }.bind(this));
    },

    /**
     * Return bootstrap code that is executed before the Application starts.
     *
     * @param target  {qx.tool.compiler.targets.Target} the target
     * @param application  {qx.tool.compiler.app.Application} the application being built
     * @param initial {Boolean} true if this is the first pass
     * @return {String}
     */
    getBootstrapCode : function(target, application, initial) {
      let res = "";

      if (initial) {
        res = "qx.$$fontBootstrap={};\n";
      }

      let font = {
        size: this.getDefaultSize(),
        lineHeight: 1,
        family: [this.getName()],
        sources: [
          {
            family: this.getName(),
            source: this.getResources()
          }
        ]
      };

      if (this.getComparisonString()) {
        font.comparisonString = this.getComparisonString();
      }

      return res += "qx.$$fontBootstrap['" + this.getName() + "']=" + JSON.stringify(font) + ";";
    },

    /**
     * Called by {Target} to compile the fonts, called once per application build
     * (NOTE:: right now, this is called for each application - that is soon to be fixed)
     *
     * @param target  {qx.tool.compiler.targets.Target} the target
     * @return {Promise}
     */
    generateForTarget: function(target) {
      return new Promise((resolve, reject) => {
        for (let resource of this.getResources()) {
          // Search for the first supported extension
          let basename = resource.match(/^.*[/\\]([^/\\\?#]+).*$/)[1];
          // fontkit knows about these font formats
          if (!basename.match(/\.(ttf|otf|woff|woff2)$/)) {
            continue;
          }
          // We support http/https and local files, check for URLs
          // first.
          if (resource.match(/^https?:\/\//)) {
            this._loadRemoteFont(resource).then(data => {
              this.__fontData = data;
              resolve();
            })
              .catch(err => {
                reject(err);
              });
            return;
          }
          // handle local file
          this._loadLocalFont(resource).then(data => {
            this.__fontData = data;
            resolve();
          })
            .catch(err => {
              reject(err);
            });
          return;
        }
        reject(`Failed to load/validate FontMap for webfont (expected ttf, otf, woff or woff2) ${this.getName()}`);
      });
    },

    /**
     * Called by Target to add fonts to an application
     *
     * @param target  {qx.tool.compiler.targets.Target} the target
     * @param application  {qx.tool.compiler.app.Application} the application being built
     * @return {Promise}
     */
    generateForApplication: async function(target, application) {
      return this.__fontData||null;
    },

    /**
     * Returns a string representation of this for debugging
     *
     * @return {String} the name or resource of this font
     */
    toString: function() {
      var str = this.getName();
      if (!str) {
        str = JSON.stringify(this.getResources());
      }
      return str;
    }
  }
});
