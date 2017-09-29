/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
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
 * ************************************************************************/
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
const http = require("http");
const fontkit = require('fontkit');
const util = require("../../util");

const log = util.createLog("font");



/**
 * Represents a WebFont provided by a Library
 */
qx.Class.define("qxcompiler.app.WebFont", {
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

    /** Optional mapping filename */
    mapping: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** Optional characters to be used for the 'is it loaded' test */
    testCharacters: {
      init: '\uf1e3\uf1f7\uf11b\uf19d',
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
        filename = path.join(this.__library.getResourcePath(), filename);
        this.__processFontFile(filename, resolve, reject);
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
          const contentType = res.headers['content-type'];

          if (statusCode !== 200) {
            error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
          }
          else if (!/^font\/(ttf|svg|eot|woff|woff2)$/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
              `Expected font/ttf, font/svg, font/eot, font/woff or font/woff2 but received ${contentType}`);
          }

          if (error) {
            res.resume();
            return reject(error);
          }

          tmp.tmpName(function _tempNameGenerated(err, tmpFilename) {
            if (err) return reject(err);

            let outFile =fs.createWriteStream(tmpFilename);
            outFile.on("close", function() {
              this.__processFontFile(tmpFilename, resolve, reject);
              fs.unlink(tmpFilename);
            }.bind(this));

            res.on('data', (chunk) => { outFile.write(chunk); });
            res.on('end', function() {
              outFile.end();
            });
          }.bind(this));

        }.bind(this)).on('error', (e) => {
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
          return reject(err);
        }

        let resources = {};

        // If we've a mapping file, take this information instead
        // of anaylzing the font.
        if (this.getMapping()) {
          fs.readFile(this.getMapping(), {encoding: 'utf-8'}, (err, data) => {
            if (err) {
              log.error(`Cannot read mapping file '${this.getMapping()}': ${err.code}`);
              return reject(err);
            }
  
            let map = JSON.parse(data);
            Object.keys(map).forEach((key) => {
              let glyph = font.glyphForCodePoint(map[key]);
              resources["@" + this.getName() + "/" + key] = [
                this.getDefaultSize(),
                Math.round(this.getDefaultSize() * glyph.advanceHeight / glyph.advanceWidth),
                parseInt(map[key], 16)
              ];
            })
  
            return resolve(resources);
          });

          return;
        }

        font.characterSet.forEach(function(codePoint) {
          let glyph = font.glyphForCodePoint(codePoint);
          resources["@" + this.getName() + "/" + glyph.name] = [
            this.getDefaultSize(),
            Math.round(this.getDefaultSize() * glyph.advanceHeight / glyph.advanceWidth),
            codePoint
          ];
        }, this);

        resolve(resources);
      }.bind(this));
    },

    /**
     * Return bootstrap code that is executed before the Application starts.
     *
     * @param target {qxcompiler.targets.Target} the target
     * @param application {qxcompiler.app.Application} the application being built
     * @return {String}
     */
    getBootstrapCode : function(target, application) {
      return "";
    },

    /**
     * Called by {Target} to compile the fonts, called once per application build
     * (NOTE:: right now, this is called for each application - that is soon to be fixed)
     *
     * @param target {qxcompiler.targets.Target} the target
     * @return {Promise}
     */
    generateForTarget: async function(target) {
      return new Promise((resolve, reject) => {
        this.getResources().some((resource) => {

          // Search for the first supported extension
          let basename = resource.match(/^.*[/\\]([^/\\\?]+).*$/)[1];
          if (!basename.endsWith(".ttf")) {
            return false;
          }

          // We support http/https and local files, check for URLs
          // first.
          if (resource.match(/^https?:\/\//)) {
            this._loadRemoteFont(resource).then((data) => {
              this.__fontData = data;
              resolve();
            }).catch((err) => {
              reject(err);
            });
          }

          // ... local file
          else {
            this._loadLocalFont(resource).then((data) => {
              this.__fontData = data;
              resolve();
            }).catch((err) => {
              reject(err);
            });
          }

          return true;
        });
      });
    },

    /**
     * Called by Target to add fonts to an application
     *
     * @param target {qxcompiler.targets.Target} the target
     * @param application {qxcompiler.app.Application} the application being built
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
      if (!str)
        str = JSON.stringify(this.getResources());
      return str;
    }
  }
});
