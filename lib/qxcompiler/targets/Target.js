/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2013 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

var fs = require("fs");
var qx = require("qooxdoo");
var async = require("async");
var util = require("../../util");
var path = require("path");

var log = util.createLog("target");

/**
 * A target for building an application, instances of Target control the generation of transpiled
 * source and collection into an application, including minifying etc
 */
module.exports = qx.Class.define("qxcompiler.targets.Target", {
  extend: qx.core.Object,

  /**
   * Constructor
   * @param outputDir {String} output directory
   */
  construct: function(outputDir) {
    this.base(arguments);
    this.__libraryUris = {};
    this.setOutputDir(outputDir);
  },

  properties: {
    /** Type of compilation */
    type: {
      init: "source",
      nullable: false,
      check: [ "source", "build" ]
    },

    /** Output directory (guaranteed to have a trailing slash) */
    outputDir: {
      init: "output",
      nullable: false,
      check: "String",
      transform: "_transformOutputDir"
    },

    /**
     * Prefix for all scripts and generated files; this is used to allow multiple
     * applications to be generated into a single output folder, EG for the demo browser
     */
    scriptPrefix: {
      init: "",
      check: "String"
    },

    /**
     * Whether to generate the index.html
     */
    generateIndexHtml: {
      init: true,
      check: "Boolean"
    },

    /**
     * The application being generated
     */
    application: {
      nullable: false
    }

  },

  members: {
    __libraryUris: null,

    /**
     * Initialises the target, creating directories etc
     * @param cb
     */
    open: function(cb) {
      util.mkpath(this.getOutputDir(), cb);
    },

    /**
     * Transforms outputDir so that it always includes a trailing slash
     * @param value
     * @returns {*}
     * @private
     */
    _transformOutputDir: function(value) {
      if (value) {
        if (value[value.length - 1] != '/')
          value += "/";
      }
      return value;
    },

    /**
     * Specifies the URi to use for a library
     * @param libraryName {String} the library name (eg "qx")
     * @param uri {String} the URI prefix for the library
     */
    setUri: function(libraryName, uri) {
      this.__libraryUris[libraryName] = uri;
    },

    /**
     * Returns the URI for a library
     * @param libraryName
     * @returns {*|null} The URI prefix, or null if none specified
     */
    getUri: function(libraryName) {
      return this.__libraryUris[libraryName]||null;
    },

    /**
     * Sets the URI for the target
     * @param uri
     */
    setTargetUri: function(uri) {
      this.setUri("", uri);
    },

    /**
     * Returns the URI for the target
     * @return {String|null} the URI
     */
    getTargetUri: function() {
      return this.getUri("");
    },

    /**
     * Generates the application
     *
     * @param {Application} app
     */
    generateApplication: function(cb) {
      var t = this;
      var app = this.getApplication();
      var analyser = app.getAnalyser();
      var db = analyser.getDatabase();

      var namespace = qxcompiler.ClassFile.getNamespace(app.getClassName());
      var library = analyser.findLibrary(namespace);

      // Root of the application & URI
      var appRootDir = this.getOutputDir() + "/";
      var appRootUri = this.getTargetUri();

      var prefixUri;
      if (appRootUri)
        prefixUri = appRootUri + "/";
      else
        prefixUri = "";

      util.mkpath(appRootDir + "script", function(err) {
        if (err)
          return cb && cb(err);

        var uris = app.getUris();

        uris.unshift("__out__:" + t.getScriptPrefix() + "resources.js");
        var configdata = t._configdata = {
          "environment": {
            "qx.application": app.getClassName(),
            "qx.revision": "",
            "qx.theme": app.getTheme(),
            "qx.version": analyser.getQooxdooVersion()
          },
          "loader": {
            "parts": {
              "boot": [
                "0"
              ]
            },
            "packages": {
              "0": {
                "uris": uris
              }
            }
          },
          "libraries": {
            "__out__": {
              "sourceUri": prefixUri + "script"
            }
          },
          "urisBefore": [],
          "cssBefore": [],
          "boot": "boot",
          "closureParts": {},
          "bootIsInline": false,
          "addNoCacheParam": false
        };

        var tmp = app.getEnvironment();
        if (tmp) {
          for (var name in tmp)
            configdata.environment[name] = tmp[name];
        }

        var pkgdata = t._pkgdata = {
          "locales": {},
          "resources": {},
          "translations": {
            "C": {}
          }
        };

        for (var i = 0, locales = analyser.getLocales(); i < locales.length; i++) {
          var localeId = locales[i];
          pkgdata.locales[localeId] = db.cldr[localeId];
          pkgdata.translations[localeId] = {};
        }
        pkgdata.locales["C"] = db.cldr["en"];

        var rm = analyser.getResourceManager();
        var assetUris = app.getAssets(configdata.environment);
        rm.getAssets(assetUris, function (err, assets) {

          // Save any changes that getAssets collected
          rm.saveDatabase();

          for (var i = 0; i < assets.length; i++) {
            var asset = assets[i];
            var arr = pkgdata.resources[asset.filename] = [
              asset.fileInfo.width, asset.fileInfo.height, (asset.filename.match(/\.(\w+)$/)[1]) || "", asset.libraryName
            ];
            if (asset.fileInfo.composite !== undefined) {
              arr.push(asset.fileInfo.composite);
              arr.push(asset.fileInfo.x);
              arr.push(asset.fileInfo.y);
            }
          }
          t._writeApplication(cb);
        });
      });
    },

    /**
     * Writes the application
     * @param cb
     * @private
     */
    _writeApplication: function(cb) {
      var t = this;
      var analyser = this.getApplication().getAnalyser();
      var appRootDir = this.getOutputDir() + "/";

      async.parallel([
        function (cb) {
          var MAP = {
            EnvSettings: t._configdata.environment,
            Libinfo: t._configdata.libraries,
            Resources: {},
            Translations: {"C": null},
            Locales: {"C": null},
            Parts: t._configdata.loader.parts,
            Packages: t._configdata.loader.packages,
            UrisBefore: [],
            CssBefore: [],
            Boot: "boot",
            ClosureParts: {},
            BootIsInline: false,
            NoCacheParam: false,
            DecodeUrisPlug: undefined,
            BootPart: undefined
          };

          for (var i = 0, locales = analyser.getLocales(); i < locales.length; i++) {
            var localeId = locales[i];
            MAP.Translations[localeId] = null;
            MAP.Locales[localeId] = null;
          }

          fs.readFile(analyser.getQooxdooPath() + "/../tool/data/generator/loader.tmpl.js",
              {encoding: "utf-8"},
              function (err, data) {
                if (err)
                  return cb(err);
                var lines = data.split('\n');
                for (var i = 0; i < lines.length; i++) {
                  var line = lines[i];
                  var match;
                  while (match = line.match(/\%\{([^}]+)\}/)) {
                    var keyword = match[1];
                    var replace = "";
                    if (MAP[keyword] !== undefined)
                      replace = JSON.stringify(MAP[keyword], null, 2);
                    var newLine = line.substring(0, match.index) + replace + line.substring(match.index + keyword.length + 3);
                    line = newLine;
                  }
                  if (line.match(/^\s*delayDefer:\s*false\b/))
                    line = line.replace(/false/, 'true');
                  lines[i] = line;
                }
                data = lines.join('\n');
                var ws = fs.createWriteStream(appRootDir + "script/" + t.getScriptPrefix() + "boot.js");
                ws.write(data);
                t._writeBootJs(ws, function(err) {
                  ws.end();
                  return cb(err);
                })
              });
        },

        function (cb) {
          t._writeIndexHtml(cb);
        },

        function (cb) {
          fs.writeFile(appRootDir + "script/" + t.getScriptPrefix() + "resources.js",
              "qx.$$packageData['0'] = " + JSON.stringify(t._pkgdata, null, 2) + ";\n",
              cb);
        },

        function (cb) {
          fs.writeFile(appRootDir + "script/" + t.getScriptPrefix() + "resources.json",
              JSON.stringify(t._pkgdata, null, 2) + "\n",
              cb);
        }
      ],
      cb);
    },

    /**
     * After the first part of boot.js has been written, this is called so to optionally
     * append to the stream
     * @param writeStream {Stream} for writing
     * @param cb
     * @returns {*}
     * @private
     */
    _writeBootJs: function(writeStream, cb) {
      return cb();
    },

    /**
     * Called to generate index.html
     * @param cb
     * @returns {*}
     * @private
     */
    _writeIndexHtml: function(cb) {
      var t = this;
      var appRootDir = this.getOutputDir() + "/";

      if (!t.isGenerateIndexHtml())
        return cb();
      fs.writeFile(appRootDir + t.getScriptPrefix() + "index.html",
          "<!DOCTYPE html>\n" +
          "<html>\n" +
          "<head>\n" +
          "  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
          "  <title>skeleton</title>\n" +
          "  <script type=\"text/javascript\" src=\"script/" + t.getScriptPrefix() + "boot.js\"></script>\n" +
          "</head>\n" +
          "<body></body>\n" +
          "</html>\n",
          cb);
    }
  }
});



