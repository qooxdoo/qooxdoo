/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * ************************************************************************/

var fs = require("fs");
require("qooxdoo");
var async = require("async");
var util = require("../util");
var path = require("upath");

var log = util.createLog("target");

const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

/**
 * A target for building an application, instances of Target control the generation of transpiled
 * source and collection into an application, including minifying etc
 */
module.exports = qx.Class.define("qx.tool.compiler.targets.Target", {
  extend: qx.core.Object,

  /**
   * Constructor
   * @param outputDir {String} output directory
   */
  construct: function(outputDir) {
    this.base(arguments);
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
     * URI to get to the resources generated (eg the resources/ and transpiled/ directories); the default
     * is relative to the application folder
     */
    targetUri: {
      init: null,
      nullable: true,
      check: "String",
      transform: "_transformTargetUri"
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
     * Environment property map
     */
    environment: {
      init: null,
      nullable: true
    },

    /**
     * The analyser being generated
     */
    analyser: {
      nullable: false
    },

    /** Locales being generated */
    locales: {
      nullable: false,
      init: [ "en" ],
      transform: "_transformLocales"
    },

    /** Whether to write all translation strings (as opposed to just those used by the classes) */
    writeAllTranslations: {
      init: false,
      nullable: false,
      check: "Boolean"
    },

    /** Whether to write a summary of the compile info to disk, ie everything about dependencies and
     * resources that are used to create the boot.js file, but stored as pure JSON for third party code
     * to use.
     */
    writeCompileInfo: {
      init: false,
      nullable: false,
      check: "Boolean"
    }

  },

  members: {
    __pathMappings: null,
    __pathMappingsOrder: null,

    /**
     * Initialises the target, creating directories etc
     *
     * @param cb
     */
    open: function(cb) {
      cb();
    },

    /**
     * Transforms outputDir so that it always includes a trailing slash
     *
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
     * Transforms targetUri so that it always includes a trailing slash
     *
     * @param value
     * @returns {*}
     * @private
     */
    _transformTargetUri: function(value) {
      if (value) {
        if (value[value.length - 1] != '/')
          value += "/";
      }
      return value;
    },

    /**
     * Compiles the environment settings into one
     *
     * @param app
     * @param environment
     * @returns {{}}
     * @private
     */
    _mergeEnvironment: function(app, environment) {
      function merge(obj) {
        if (obj)
          for (var name in obj)
            result[name] = obj[name];
      }
      var result = {};
      if (environment)
        merge(environment);
      if (app.getEnvironment())
        merge(app.getEnvironment());
      return result;
    },

    /**
     * Syncs all assets into the output directory
     *
     * @param compileInfo
     * @param cb
     * @private
     */
    _syncAssets: function(compileInfo, cb) {
      var t = this;

      var libraries = this.getAnalyser().getLibraries();
      var libraryLookup = {};
      libraries.forEach(function(library) {
        libraryLookup[library.getNamespace()] = library;
      });

      var queue = async.queue(
          function (asset, cb) {
            var library = libraryLookup[asset.libraryName];
            qx.tool.compiler.files.Utils.sync(
                library.getRootDir() + "/" + library.getResourcePath() + "/" + asset.filename,
                path.join(t.getOutputDir(), "resource", asset.filename))
                .then(() => cb()).catch((err) => cb(err));
          },
          100
      );
      queue.drain = cb;
      queue.error = function(err) {
        t.error(err.stack||err);
      };
      queue.push(compileInfo.assets);
    },

    /**
     * Returns the root for applications
     */
    getApplicationRoot: function(application) {
      return path.join(this.getOutputDir(), this.getProjectDir(application)) + "/";
    },

    /**
     * Returns the project dir
     *
     * @returns String
     */
    getProjectDir: function (application) {
       return application.getOutputPath() || application.getName();
    },
    /**
     * Returns the URI for the root of the output, relative to the application
     */
    _getOutputRootUri: function(application) {
      var targetUri = application.isBrowserApp() ? this.getTargetUri() : null;
      if (!targetUri) {
        var dir = this.getApplicationRoot(application);
        var targetUri = path.relative(dir, this.getOutputDir()) + "/";
      };
      return targetUri;
    },

    /**
     * Adds a path mapping, where any reference to a file in `fromFile` is remapped to be
     * loaded via the `toUri.
     *
     * @param fromFile {String} the directory (or filename) to map
     * @param toUri {String} the URI to map to
     */
    addPathMapping: function(fromFile, toUri) {
      fromFile = path.resolve(fromFile);
      if (this.__pathMappings === null) {
        this.__pathMappings = {};
        this.__pathMappingsOrder = [];
      }
      this.__pathMappings[fromFile] = toUri;
      this.__pathMappingsOrder.push(fromFile);
    },

    /**
     * Converts a filename to a URI, taking into account mappings added via `addMapping`.  If there is
     * no mapping, null is returned
     *
     * @param filename {String} the filename to map
     * @return {String} the URI for the file, null if not found
     */
    getPathMapping: function(filename) {
      if (this.__pathMappings) {
        var absFilename = path.resolve(filename);

        // Search
        for (var fromFile in this.__pathMappings) {
          if (absFilename.startsWith(fromFile)) {
            var toUri = this.__pathMappings[fromFile];
            filename = toUri + absFilename.substring(fromFile.length);
            return filename;
          }
        }
      }

      return null;
    },

    /**
     * Converts a filename to a URI, taking into account mappings added via `addMapping`.  If there is
     * no mapping, the filename can be modified to be relative to a given path (ie the directory where
     * the index.html is located)
     *
     * @param filename {String} the filename to map
     * @param relativeTo {String?} optional path that the filename needs to be relative to if there is no mapping
     * @return {String} the URI for the file
     */
    mapToUri: function(filename, relativeTo) {
      var mapTo = this.getPathMapping(filename);
      if (mapTo !== null)
        return mapTo;

      if (relativeTo)
        filename = path.relative(relativeTo, filename);

      return filename;
    },

    /**
     * Generates the application
     *
     * @param {Application} app
     * @param {Maker} maker
     */
    generateApplication: function(application, environment, cb) {
      var t = this;
      var analyser = application.getAnalyser();
      var db = analyser.getDatabase();

      var compileInfo = {
        library: null,
        namespace: null,
        application: application,
        environment: environment,
        configdata: null,
        pkgdata: null,
        assets: null,
        parts: null
      };
      var libraryInfoMap = {};
      var appClassname = application.getClassName();
      var library = compileInfo.library = analyser.getLibraryFromClassname(appClassname);
      var namespace = compileInfo.namespace = library.getNamespace();
      libraryInfoMap[namespace] = library.getLibraryInfo();
      // Root of the application & URI
      var appRootDir = this.getApplicationRoot(application);

      util.mkpath(appRootDir, function(err) {
        if (err)
          return cb && cb(err);

        var parts = compileInfo.parts = application.getPartsDependencies();

        var configdata = compileInfo.configdata = {
          "environment": {
            "qx.application": application.getClassName(),
            "qx.revision": "",
            "qx.theme": application.getTheme(),
            "qx.version": analyser.getQooxdooVersion(),
            "qx.libraryInfoMap": libraryInfoMap
          },
          "loader": {
            "parts": {
            },
            "packages": {
            }
          },
          "libraries": {
            "__out__": {
              "sourceUri": application.getSourceUri()||"."
            }
          },
          "resources": {},
          "urisBefore": [],
          "cssBefore": [],
          "boot": "boot",
          "closureParts": {},
          "bootIsInline": false,
          "addNoCacheParam": false,
          "preBootCode": []
        };
        parts.forEach((part, index) => {
          configdata.loader.parts[part.name] = [ index ];
          var pkgdata = configdata.loader.packages[index] = { uris: [] };
          part.classes.forEach((classname) => {
            var def = db.classInfo[classname];
            pkgdata.uris.push(def.libraryName + ":" + classname.replace(/\./g, "/") + ".js");
          });
        });
        configdata.loader.packages[0].uris.unshift("__out__:" + t.getScriptPrefix() + "polyfill.js");
        configdata.loader.packages[0].uris.unshift("__out__:" + t.getScriptPrefix() + "resources.js");

        analyser.getLibraries().forEach(function (library) {
          var libnamespace = library.getNamespace();
          libraryInfoMap[libnamespace] = library.getLibraryInfo();
          var arr = library.getAddScript();
          if (arr) {
            arr.forEach(function(path) {
              configdata.urisBefore.push(libnamespace + ":" + path);
            });
          }
          var arr = library.getAddCss();
          if (arr) {
            arr.forEach(function(path) {
              configdata.cssBefore.push(libnamespace + ":" + path);
            });
          }

        });

        for (var name in environment)
          configdata.environment[name] = environment[name];

        var pkgdata = compileInfo.pkgdata = {
          "locales": {},
          "resources": {},
          "translations": {
            "C": {}
          }
        };

        var translations = {};
        async.parallel([
            function(cb) {
              analyser.getCldr("en")
                .then((cldr) => {
                  pkgdata.locales["C"] = cldr;
                  cb();
                })
                .catch(cb);
            },

            function(cb) {
              t._writeTranslations(compileInfo, function(err) {
                cb(err);
              });
            },

            function(cb) {
              var promises = [];
              var fontCntr = 0;
              analyser.getLibraries().forEach((library) => {
                var fonts = library.getWebFonts();
                if (fonts) {
                  fonts.forEach((font) => {
                    var p = font.generateForTarget(t)
                      .then(() => font.generateForApplication(t, application))
                      .then((resources) => {
                        for (var key in resources) {
                          configdata.resources[key] = resources[key];
                        }
                        var code = font.getBootstrapCode(t, application, fontCntr++ == 0);
                        if (code)
                          configdata.preBootCode.push(code);
                      })
                      .catch((err) => {
                        qx.tool.compiler.Console.print("qx.tool.compiler.webfonts.error", font.toString(), err.toString());
                      });
                    promises.push(p);
                  });
                }
              });
              Promise.all(promises)
                .then(() => cb())
                .catch(cb);
            },

            function(cb) {
              var rm = analyser.getResourceManager();
              var assetUris = application.getAssetUris(rm, configdata.environment);
              var assets = rm.getAssets(assetUris);
              compileInfo.assets = assets;

              // Save any changes that getAssets collected
              rm.saveDatabase(function() {
                for (var i = 0; i < assets.length; i++) {
                  var asset = assets[i];
                  var m = asset.filename.match(/\.(\w+)$/);
                  var arr = pkgdata.resources[asset.filename] = [
                    asset.fileInfo.width,
                    asset.fileInfo.height,
                    (m && m[1]) || "",
                    asset.libraryName
                  ];
                  if (asset.fileInfo.composite !== undefined) {
                    arr.push(asset.fileInfo.composite);
                    arr.push(asset.fileInfo.x);
                    arr.push(asset.fileInfo.y);
                  }
                }
                cb();
              });
            }
          ],
          function(err) {
            if (err)
              return cb && cb(err);
            t._writeApplication(compileInfo, cb);
          });
      });
    },

    /**
     * Handles the output of translations and locales
     *
     * @param compileInfo {Map} compile data
     * @param cb {Function(err)} callback when complete
     */
    _writeTranslations: function(compileInfo, cb) {
      const analyser = compileInfo.application.getAnalyser();
      analyser.updateTranslations(compileInfo.library, this.getLocales());

      this._writeLocales(compileInfo, (err) => {
        if (err)
          return cb(err);
        if (this.getWriteAllTranslations())
          this._writeAllTranslations(compileInfo, cb);
        else
          this._writeRequiredTranslations(compileInfo, cb);
      });
    },

    /**
     * Transform method for locales property; ensures that all locales are case correct, ie
     * have the form aa_BB (for example "en_GB" is correct but "en_gb" is invalid)
     *
     * @param value {String[]} array of locale IDs
     * @return {String[]} the modified array
     */
    _transformLocales: function(value) {
      if (!value)
        return value;
      return value.map((localeId) => {
        localeId = localeId.toLowerCase();
        var pos = localeId.indexOf('_');
        if (pos > -1) {
          localeId = localeId.substring(0, pos) + localeId.substring(pos).toUpperCase();
        }
        return localeId;
      });
    },

    /**
     * Writes the required locale CLDR data, incorporating inheritance.  Note that locales in CLDR can
     * have a "parent locale", where the locale inherits all settings from the parent except where explicitly
     * set in the locale.  This is in addition to the inheritance between language and locale, eg where "en_GB"
     * overrides settings from "en".  Qooxdoo client understands that if a setting is not provided in
     * "en_GB" it must look to "en", but it does not understand the "parent locale" inheritance, so this
     * method must flatten the "parent locale" inheritance.
     *
     * @param compileInfo {Map} compile data
     * @param cb {Function(err)} callback when complete
     */
    _writeLocales: function(compileInfo, cb) {
      var t = this;
      var analyser = compileInfo.application.getAnalyser();
      var db = analyser.getDatabase();
      var pkgdata = compileInfo.pkgdata;

      function loadLocaleData(localeId) {
        var combinedCldr = null;

        function accumulateCldr(localeId) {
          return analyser.getCldr(localeId)
            .then((cldr) => {
              if (!combinedCldr)
                combinedCldr = cldr;
              else {
                for (var name in cldr) {
                  var value = combinedCldr[name];
                  if (value === null || value === undefined)
                    combinedCldr[name] = cldr[name];
                }
              }
              var parentLocaleId = qx.tool.compiler.app.Cldr.getParentLocale(localeId);
              if (parentLocaleId)
                return accumulateCldr(parentLocaleId);
              return combinedCldr;
            });
        }

        return accumulateCldr(localeId);
      }

      var promises = t.getLocales().map((localeId) => {
        return loadLocaleData(localeId)
          .then((cldr) => pkgdata.locales[localeId] = cldr);
      });

      Promise.all(promises).then(() => cb()).catch(cb);
    },

    /**
     * Writes all translations
     *
     * @param compileInfo {Map} compile data
     * @param cb {Function(err)} callback when complete
     */
    _writeAllTranslations: function(compileInfo, cb) {
      var t = this;
      var analyser = compileInfo.application.getAnalyser();
      var db = analyser.getDatabase();
      var pkgdata = compileInfo.pkgdata;

      function writeEntry(entry, localeId) {
        if (entry) {
          var pkgdataTranslations = compileInfo.pkgdata.translations[localeId];
          var msgstr = entry.msgstr;
          if (!qx.lang.Type.isArray(msgstr))
            msgstr = [msgstr];
          if (msgstr[0])
            pkgdataTranslations[entry.msgid] = msgstr[0];
          if (entry.msgid_plural && msgstr[1])
            pkgdataTranslations[entry.msgid_plural] = msgstr[1];
        }
      }

      var promises = t.getLocales().map((localeId) => {
        pkgdata.translations[localeId] = {};
        return analyser.getTranslation(compileInfo.library, localeId)
          .then((translation) => {
            var entries = translation.getEntries();
            for (var msgid in entries)
                writeEntry(entries[msgid], localeId);
          });
      });
      Promise.all(promises).then(() => cb()).catch(cb);
    },

    /**
     * Writes only those translations which are actually required
     *
     * @param compileInfo {Map} compile data
     * @param cb {Function(err)} callback when complete
     */
    _writeRequiredTranslations: function(compileInfo, cb) {
      var t = this;
      var analyser = compileInfo.application.getAnalyser();
      var db = analyser.getDatabase();
      var pkgdata = compileInfo.pkgdata;

      function writeEntry(localeId, entry) {
        if (entry) {
          var msgstr = entry.msgstr;
          if (!qx.lang.Type.isArray(msgstr))
            msgstr = [msgstr];
          var pkgdataTranslations = pkgdata.translations[localeId];
          if (msgstr[0])
            pkgdataTranslations[entry.msgid] = msgstr[0];
          if (entry.msgid_plural && msgstr[1])
            pkgdataTranslations[entry.msgid_plural] = msgstr[1];
        }
      }

      var translations = {};
      var promises = [];
      t.getLocales().forEach(function(localeId) {
        pkgdata.translations[localeId] = {};
        analyser.getLibraries().forEach(function(library) {
          promises.push(
            analyser.getTranslation(library, localeId)
              .then((translation) => {
                  var id = library.getNamespace() + ":" + localeId;
                  translations[id] = translation;
                  writeEntry(localeId, translation.getEntry(""));
                })
            );
        });
      });
      Promise.all(promises)
        .then(() => {
          compileInfo.parts.forEach((part) => {
            part.classes.forEach((classname) => {
              var dbClassInfo = db.classInfo[classname];
              if (!dbClassInfo.translations)
                return;

              t.getLocales().forEach((localeId) => {
                var id = dbClassInfo.libraryName + ":" + localeId;
                var translation = translations[id];
                dbClassInfo.translations.forEach(function(transInfo) {
                  writeEntry(localeId, translation.getEntry(transInfo.msgid));
                });
              });
            });
          });
        })
        .then(cb)
        .catch((err) => cb(err));
    },

    /**
     * Writes the application
     * @param assets {Object[]} list of assets, where each asset is (see @link(qx.tool.compiler.resources.Manager) for details)
     *  - libraryName {String}
     *  - filename {String}
     *  - fileInfo {String)
     * @param cb
     * @private
     */
    _writeApplication: function(compileInfo, cb) {
      var t = this;
      var application = compileInfo.application;
      var analyser = this.getAnalyser();
      var appRootDir = this.getApplicationRoot(application);

      function writeCompileInfo(cb) {
        if (!t.isWriteCompileInfo())
          return cb();
        var MAP = {
            EnvSettings: compileInfo.configdata.environment,
            Libinfo: compileInfo.configdata.libraries,
            UrisBefore: compileInfo.configdata.urisBefore,
            CssBefore: compileInfo.configdata.cssBefore,
            Assets: compileInfo.assets,
            Parts: compileInfo.parts
          };
        var outputDir = path.join(appRootDir, t.getScriptPrefix());

        fs.writeFile(path.join(outputDir, "compile-info.json"),
            JSON.stringify(MAP, null, 2) + "\n",
            { encoding: "utf8" },
            (err) => {
              if (err)
                return cb(err);
              fs.writeFile(path.join(outputDir, "resources.json"),
                  JSON.stringify(compileInfo.pkgdata, null, 2) + "\n",
                  { encoding: "utf8" },
                  cb);
            });
      }
      function writeBootJs(cb) {
        var MAP = {
          EnvSettings: compileInfo.configdata.environment,
          Libinfo: compileInfo.configdata.libraries,
          Resources: compileInfo.configdata.resources,
          Translations: {"C": null},
          Locales: {"C": null},
          Parts: compileInfo.configdata.loader.parts,
          Packages: compileInfo.configdata.loader.packages,
          UrisBefore: compileInfo.configdata.urisBefore,
          CssBefore: compileInfo.configdata.cssBefore,
          Boot: "boot",
          ClosureParts: {},
          BootIsInline: false,
          NoCacheParam: false,
          DecodeUrisPlug: undefined,
          BootPart: undefined,
          TranspiledPath: undefined,
          PreBootCode: compileInfo.configdata.preBootCode.join("\n")
        };

        if (application.getType() !== "browser") {
          MAP.TranspiledPath = path.relative(appRootDir, path.join(t.getOutputDir(), "transpiled"));
        }

        for (var i = 0, locales = analyser.getLocales(); i < locales.length; i++) {
          var localeId = locales[i];
          MAP.Translations[localeId] = null;
          MAP.Locales[localeId] = null;
        }

        fs.readFile(application.getLoaderTemplate(), { encoding: "utf-8" },
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
                  if (MAP[keyword] !== undefined) {
                    if (keyword == "PreBootCode")
                      replace = MAP[keyword];
                    else if (keyword == "Libinfo") {
                      replace = JSON.stringify(MAP[keyword], null, 2).replace(/\": \"/g, "\": qx.$$$$appRoot + \"");
                    } else
                      replace = JSON.stringify(MAP[keyword], null, 2);
                  }
                  var newLine = line.substring(0, match.index) + replace + line.substring(match.index + keyword.length + 3);
                  line = newLine;
                }
                if (line.match(/^\s*delayDefer:\s*false\b/))
                  line = line.replace(/false/, 'true');
                lines[i] = line;
              }
              data = lines.join('\n');
              let name = application.isBrowserApp() ? "boot.js" : application.getName() + ".js";
              let pos = name.lastIndexOf('/');
              if (pos > -1)
                name = name.substring(pos + 1);
              var ws = fs.createWriteStream(path.join(appRootDir, t.getScriptPrefix() + name));
              ws.write(data);
              t._writeBootJs(compileInfo, ws, function(err) {
                ws.end();
                return cb(err);
              })
            });
      }

      function writeIndexHtml(cb) {
        t._writeIndexHtml(compileInfo).then(() => cb()).catch(cb);
      }

      function writePolyfill(cb) {
        var src = path.join(require.resolve("babel-polyfill"), "../../dist/polyfill.js");
        var dest = path.join(appRootDir, t.getScriptPrefix() + "polyfill.js");
        qx.tool.compiler.files.Utils.copyFile(src, dest)
          .then(() => cb()).catch(cb);
      }

      function writeResourcesJs(cb) {
        fs.writeFile(appRootDir + "/" + t.getScriptPrefix() + "resources.js",
            "qx.$$packageData['0'] = " + JSON.stringify(compileInfo.pkgdata, null, 2) + ";\n",
            { encoding: "utf8" },
            function(err) {
              cb(err);
            });
      }

      async.series(
          [
            writeResourcesJs,
            writePolyfill,
            function(cb) {
              async.parallel([ writeBootJs, writeIndexHtml, writeCompileInfo ],
                  function(err) {
                    if (err)
                      return cb && cb(err);
                    t._afterWriteApplication(compileInfo, cb);
                  });
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
    _writeBootJs: function(compileInfo, writeStream, cb) {
      return cb();
    },

    /**
     * Called to generate index.html
     * @param cb
     * @returns {*}
     * @private
     */
    _writeIndexHtml: async function(compileInfo) {
      var t = this;
      var application = compileInfo.application;

      if (!application.isBrowserApp())
        return Promise.resolve();

      if (!t.isGenerateIndexHtml())
        return Promise.resolve();

      var resDir = this.getApplicationRoot(application);

      let writeIndexHtml = async (appRootDir, writingIndexToRoot) => {
        let appRoot = writingIndexToRoot ? t.getProjectDir(application) + "/" : "";
        let bootJs =
          "  <script type=\"text/javascript\">\n" +
          "    if (!window.qx) window.qx = {};\n" +
          "    qx.$$$appRoot = \"" + appRoot + "\";\n" +
          "  </script>\n" +
          "  <script type=\"text/javascript\" src=\"" + appRoot + t.getScriptPrefix() + "boot.js\"></script>\n";

        let defaultIndexHtml =
            "<!DOCTYPE html>\n" +
            "<html>\n" +
            "<head>\n" +
            "  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
            "  <title>" + (application.getTitle()||"Qooxdoo Application") + "</title>\n" +
            "</head>\n" +
            "<body>\n" +
            "  <!-- This index.html can be customised by creating a boot/index.html (do not include Qooxdoo application script tags like\n" +
            "       the one below because they will be added automatically)\n" +
            "    -->\n" +
            "</body>\n" +
            "</html>\n";

        var classname = application.getClassName();
        var library = t.getAnalyser().getLibraryFromClassname(classname);
        if (!library)
          throw new Error("Cannot find library for class " + classname);
        var bootDir = path.join(library.getRootDir(), library.getBootPath());
        var stats;
        try {
          stats = await stat(bootDir);
        }catch(ex) {
          stats = null;
        }
        let html;
        if (!stats || !stats.isDirectory()) {
          html = defaultIndexHtml;
        } else {
          await qx.tool.compiler.files.Utils.sync(bootDir, resDir, (from, to) => !from.endsWith("index.html"));
          var stats = await stat(path.join(bootDir, "index.html"));
          if (stats.isFile()) {
            html = await readFile(path.join(bootDir, "index.html"), { encoding: "utf8" });
          } else {
            html = defaultIndexHtml;
          }
        }
        let str = bootJs + "</body>";
        let after = html.replace("</body>", str);
        return writeFile(appRootDir + t.getScriptPrefix() + "index.html", after, { encoding: "utf8" });
      };

      if (application.getWriteIndexHtmlToRoot()) {
        await writeIndexHtml(t.getOutputDir(), true);
      }
      await writeIndexHtml(t.getApplicationRoot(application), false);
    },

    /**
     * Called after everything has been written, eg to allow for post compilation steps like minifying etc
     * @param cb
     * @private
     */
    _afterWriteApplication: function(compileInfo, cb) {
      cb()
    }
  }
});
