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

const fs = qx.tool.compiler.utils.Promisify.fs;

require("qooxdoo");
const async = require("async");
const util = require("../util");
const path = require("upath");

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
    },
    
    /**
     * Whether to write information about the libraries into the boot script
     */
    writeLibraryInfo: {
      init: true,
      nullable: false,
      check: "Boolean"
    }

  },

  events: {
    /**
     * Fired after all enviroment data is collected
     *  application {qx.tool.compiler.app.Application} the app 
     *  enviroment: {Object} enviroment data
     */
    "checkEnvironment": "qx.event.type.Data"
  },


  members: {
    __pathMappings: null,
    __pathMappingsOrder: null,

    /**
     * Initialises the target, creating directories etc
     */
    open: async function() {
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
        if (value[value.length - 1] != "/") {
          value += "/";
        }
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
        if (obj) {
          for (var name in obj) {
            result[name] = obj[name];
          } 
        }
      }
      var result = {};
      if (environment) {
        merge(environment);
      }
      if (app.getEnvironment()) {
        merge(app.getEnvironment()); 
      }
      return result;
    },

    /**
     * Syncs all assets into the output directory
     *
     * @param compileInfo
     */
    _syncAssets: async function(compileInfo) {
      var t = this;

      const analyser = compileInfo.application.getAnalyser();
      await new Promise((resolve, reject) => {
        var queue = async.queue(
            function (asset, cb) {
              var library = analyser.findLibrary(asset.libraryName);
              qx.tool.compiler.files.Utils.sync(
                  library.getRootDir() + "/" + library.getResourcePath() + "/" + asset.filename,
                  path.join(t.getOutputDir(), "resource", asset.filename))
                  .then(() => cb())
                  .catch(err => cb(err));
            },
            100
        );
        queue.drain = resolve;
        queue.error = err => t.error(err.stack||err);
        queue.push(compileInfo.assets);
      });
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
      var dir = this.getApplicationRoot(application);
      var targetUri = path.relative(dir, this.getOutputDir()) + "/";
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
      if (mapTo !== null) {
        return mapTo;
      }

      if (relativeTo) {
        filename = path.relative(relativeTo, filename);
      }

      return filename;
    },
    
    _copyClassesToFile: function(classes, outputFilename) {
      let transpiledDir = path.join(this.getOutputDir(), "transpiled");
      let allCode = [];
      return qx.tool.compiler.utils.Promisify.eachOfSeries(classes, filename =>
        fs.readFileAsync(path.join(transpiledDir, filename), "utf8")
          .then(code => allCode.push(code))
      )
      .then(() => fs.writeFileAsync(outputFilename, allCode.join("\n")));
    },

    /**
     * Generates the application
     *
     * @param {Application} app
     * @param {Maker} maker
     */
    generateApplication: function(application, environment) {
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
      const requiredLibs = application.getRequiredLibraries();
      var namespace = compileInfo.namespace = library.getNamespace();
      if (this.isWriteLibraryInfo()) {
        libraryInfoMap[namespace] = library.getLibraryInfo();
      }
      // Root of the application & URI
      var appRootDir = this.getApplicationRoot(application);

      return util.mkpathAsync(appRootDir)
      .then(() => {
        var parts = compileInfo.parts = application.getPartsDependencies();
        
        let matchBundle = qx.tool.compiler.app.Application.createWildcardMatchFunction(application.getBundleInclude(), application.getBundleExclude());
  
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
              "sourceUri": ""
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
        let promises = [];
        parts.forEach((part, index) => {
          configdata.loader.parts[part.name] = [ index ];
          let pkgdata = configdata.loader.packages[index] = { uris: [] };
          let bundle = null;
          let bundleIndex = 0;
          
          part.classes.forEach(classname => {
            let def = db.classInfo[classname];
            let classFilename = classname.replace(/\./g, "/") + ".js";
            
            if (matchBundle(classname)) {
              if (bundle === null) {
                bundle = [ ];
              }
              bundle.push(classFilename);
              return;
            }
            
            if (bundle !== null) {
              let bundleFilename = "part-" + part.name + "-bundle-" + (++bundleIndex) + ".js";
              promises.push(this._copyClassesToFile(bundle, path.join(appRootDir, t.getScriptPrefix() + bundleFilename)));
              pkgdata.uris.push("__out__:" + bundleFilename);
              bundle = null;
            }
            pkgdata.uris.push(def.libraryName + ":" + classFilename);
          });
          if (bundle !== null) {
            let bundleFilename = "part-" + part.name + "-bundle-" + (++bundleIndex) + ".js";
            promises.push(this._copyClassesToFile(bundle, path.join(appRootDir, t.getScriptPrefix() + bundleFilename)));
            pkgdata.uris.push("__out__:" + bundleFilename);
          }
        });
        return qx.Promise.all(promises)
          .then(() => {
            configdata.loader.packages[0].uris.unshift("__out__:" + t.getScriptPrefix() + "polyfill.js");
            configdata.loader.packages[0].uris.unshift("__out__:" + t.getScriptPrefix() + "resources.js");
  
            requiredLibs.forEach(libnamespace => {
              var library = analyser.findLibrary(libnamespace);
              if (this.isWriteLibraryInfo()) {
                libraryInfoMap[libnamespace] = library.getLibraryInfo();
              }
              var arr = library.getAddScript();
              if (arr) {
                arr.forEach(path => configdata.urisBefore.push(libnamespace + ":" + path));
              }
              arr = library.getAddCss();
              if (arr) {
                arr.forEach(path => configdata.cssBefore.push(libnamespace + ":" + path));
              }
            });
  
            for (var name in environment) {
              configdata.environment[name] = environment[name]; 
            }
              
            t.fireDataEvent("checkEnvironment", { application: application, environment: configdata.environment});
  
            var pkgdata = compileInfo.pkgdata = {
              "locales": {},
              "resources": {},
              "translations": {
                "C": {}
              }
            };
            var rm = analyser.getResourceManager();
            
            return qx.Promise.all([
              analyser.getCldr("en").then(cldr => pkgdata.locales["C"] = cldr),
                
              t._writeTranslations(compileInfo),
              
              new Promise((resolve, reject) => {
                var promises = [];
                var fontCntr = 0;
                requiredLibs.forEach(libnamespace => {
                  var library = analyser.findLibrary(libnamespace);
                  var fonts = library.getWebFonts();
                  if (!fonts) {
                    return;
                  }
                  fonts.forEach(font => {
                    var p = font.generateForTarget(t)
                      .then(() => font.generateForApplication(t, application))
                      .then(resources => {
                        for (var key in resources) {
                          configdata.resources[key] = resources[key];
                        }
                        var code = font.getBootstrapCode(t, application, fontCntr++ == 0);
                        if (code) {
                          configdata.preBootCode.push(code); 
                        }
                      })
                      .catch(err => {
                        qx.tool.compiler.Console.print("qx.tool.compiler.webfonts.error", font.toString(), err.toString());
                      });
                    promises.push(p);
                  });
                });
                qx.Promise.all(promises)
                  .then(resolve)
                  .catch(reject);
              }),
              
              new qx.Promise((resolve, reject) => {
                var assetUris = application.getAssetUris(rm, configdata.environment);
                var assets = rm.getAssets(assetUris);
                compileInfo.assets = assets;
  
                // Save any changes that getAssets collected
                return rm.saveDatabase()
                  .then(() => {
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
                  })
                  .then(resolve)
                  .catch(reject);
              })
            ]);
          })
          .then(() => t._writeApplication(compileInfo));
        });
    },

    /**
     * Handles the output of translations and locales
     *
     * @param compileInfo {Map} compile data
     */
    _writeTranslations: async function(compileInfo) {
      const analyser = compileInfo.application.getAnalyser();
      analyser.updateTranslations(compileInfo.library, this.getLocales());

      await this._writeLocales(compileInfo);
      if (this.getWriteAllTranslations()) {
        await this._writeAllTranslations(compileInfo);
      } else {
        await this._writeRequiredTranslations(compileInfo);
      }
    },

    /**
     * Transform method for locales property; ensures that all locales are case correct, ie
     * have the form aa_BB (for example "en_GB" is correct but "en_gb" is invalid)
     *
     * @param value {String[]} array of locale IDs
     * @return {String[]} the modified array
     */
    _transformLocales: function(value) {
      if (!value) {
        return value;
      }
      return value.map(localeId => {
        localeId = localeId.toLowerCase();
        var pos = localeId.indexOf("_");
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
     */
    _writeLocales: async function(compileInfo) {
      var t = this;
      var analyser = compileInfo.application.getAnalyser();
      var pkgdata = compileInfo.pkgdata;

      function loadLocaleData(localeId) {
        var combinedCldr = null;

        function accumulateCldr(localeId) {
          return analyser.getCldr(localeId)
            .then(cldr => {
              if (!combinedCldr) {
                combinedCldr = cldr; 
              } else {
                for (var name in cldr) {
                  var value = combinedCldr[name];
                  if (value === null || value === undefined) {
                    combinedCldr[name] = cldr[name]; 
                  }
                }
              }
              var parentLocaleId = qx.tool.compiler.app.Cldr.getParentLocale(localeId);
              if (parentLocaleId) {
                return accumulateCldr(parentLocaleId);
              }
              return combinedCldr;
            });
        }

        return accumulateCldr(localeId);
      }

      var promises = t.getLocales().map(localeId => loadLocaleData(localeId)
          .then(cldr => pkgdata.locales[localeId] = cldr));

      await qx.Promise.all(promises);
    },

    /**
     * Writes all translations
     *
     * @param compileInfo {Map} compile data
     */
    _writeAllTranslations: async function(compileInfo) {
      var t = this;
      var analyser = compileInfo.application.getAnalyser();
      var pkgdata = compileInfo.pkgdata;

      function writeEntry(entry, localeId) {
        if (entry) {
          var pkgdataTranslations = compileInfo.pkgdata.translations[localeId];
          var msgstr = entry.msgstr;
          if (!qx.lang.Type.isArray(msgstr)) {
            msgstr = [msgstr]; 
          }
          if (msgstr[0]) {
            pkgdataTranslations[entry.msgid] = msgstr[0];
          }
          if (entry.msgid_plural && msgstr[1]) {
            pkgdataTranslations[entry.msgid_plural] = msgstr[1];
          }
        }
      }

      var promises = t.getLocales().map(localeId => {
        pkgdata.translations[localeId] = {};
        return analyser.getTranslation(compileInfo.library, localeId)
          .then(translation => {
            var entries = translation.getEntries();
            for (var msgid in entries) {
              writeEntry(entries[msgid], localeId);
            }
          });
      });
      await qx.Promise.all(promises);
    },

    /**
     * Writes only those translations which are actually required
     *
     * @param compileInfo {Map} compile data
     */
    _writeRequiredTranslations: async function(compileInfo) {
      var t = this;
      var analyser = compileInfo.application.getAnalyser();
      var db = analyser.getDatabase();
      var pkgdata = compileInfo.pkgdata;

      function writeEntry(localeId, entry) {
        if (entry) {
          var msgstr = entry.msgstr;
          if (!qx.lang.Type.isArray(msgstr)) {
            msgstr = [msgstr];
          }
          var pkgdataTranslations = pkgdata.translations[localeId];
          if (msgstr[0]) {
            pkgdataTranslations[entry.msgid] = msgstr[0]; 
          }
          if (entry.msgid_plural && msgstr[1]) {
            pkgdataTranslations[entry.msgid_plural] = msgstr[1];
          }
        }
      }

      var translations = {};
      var promises = [];
      t.getLocales().forEach(function(localeId) {
        pkgdata.translations[localeId] = {};
        compileInfo.application.getRequiredLibraries().forEach(function(libnamespace) {
          var library = analyser.findLibrary(libnamespace);
          promises.push(
            analyser.getTranslation(library, localeId)
              .then(translation => {
                  var id = library.getNamespace() + ":" + localeId;
                  translations[id] = translation;
                  writeEntry(localeId, translation.getEntry(""));
                })
            );
        });
      });
      await qx.Promise.all(promises);
      
      compileInfo.parts.forEach(part => {
        part.classes.forEach(classname => {
          var dbClassInfo = db.classInfo[classname];
          if (!dbClassInfo.translations) {
            return; 
          }

          t.getLocales().forEach(localeId => {
            var id = dbClassInfo.libraryName + ":" + localeId;
            var translation = translations[id];
            dbClassInfo.translations.forEach(transInfo => writeEntry(localeId, translation.getEntry(transInfo.msgid)));
          });
        });
      });
    },

    /**
     * Writes the application
     * @param assets {Object[]} list of assets, where each asset is (see @link(qx.tool.compiler.resources.Manager) for details)
     *  - libraryName {String}
     *  - filename {String}
     *  - fileInfo {String)
     */
    _writeApplication: async function(compileInfo) {
      var t = this;
      var application = compileInfo.application;
      var analyser = this.getAnalyser();
      var appRootDir = this.getApplicationRoot(application);

      async function writeBootJs() {
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

        for (let i = 0, locales = analyser.getLocales(); i < locales.length; i++) {
          var localeId = locales[i];
          MAP.Translations[localeId] = null;
          MAP.Locales[localeId] = null;
        }

        var data = await fs.readFileAsync(application.getLoaderTemplate(), { encoding: "utf-8" });
        var lines = data.split("\n");
        for (let i = 0; i < lines.length; i++) {
          var line = lines[i];
          var match;
          while ((match = line.match(/\%\{([^}]+)\}/))) {
            var keyword = match[1];
            var replace = "";
            if (MAP[keyword] !== undefined) {
              if (keyword == "PreBootCode") {
                replace = MAP[keyword]; 
              } else if (keyword == "Libinfo") {
                replace = JSON.stringify(MAP[keyword], null, 2).replace(/\": \"/g, "\": qx.$$$$appRoot + \"");
              } else {
                replace = JSON.stringify(MAP[keyword], null, 2);
              }
            }
            var newLine = line.substring(0, match.index) + replace + line.substring(match.index + keyword.length + 3);
            line = newLine;
          }
          if (line.match(/^\s*delayDefer:\s*false\b/)) {
            line = line.replace(/false/, "true"); 
          }
          lines[i] = line;
        }
        
        data = lines.join("\n");
        let name = application.isBrowserApp() ? "boot.js" : application.getName() + ".js";
        let pos = name.lastIndexOf("/");
        if (pos > -1) {
          name = name.substring(pos + 1); 
        }
        var ws = fs.createWriteStream(path.join(appRootDir, t.getScriptPrefix() + name));
        ws.write(data);
        await t._writeBootJs(compileInfo, ws)
          .then(() => ws.end());
      }

      await fs.writeFileAsync(appRootDir + "/" + t.getScriptPrefix() + "resources.js",
          "qx.$$packageData['0'] = " + JSON.stringify(compileInfo.pkgdata, null, 2) + ";\n",
          { encoding: "utf8" });

      const src = path.join(require.resolve("babel-polyfill"), "../../dist/polyfill.js");
      const dest = path.join(appRootDir, t.getScriptPrefix() + "polyfill.js");
      await qx.tool.compiler.files.Utils.copyFile(src, dest);
      
      await qx.Promise.all([
        writeBootJs(), 
        
        this._writeIndexHtml(compileInfo),
        
        new qx.Promise((resolve, reject) => {
          if (!t.isWriteCompileInfo()) {
            resolve();
            return; 
          }
          var MAP = {
              EnvSettings: compileInfo.configdata.environment,
              Libinfo: compileInfo.configdata.libraries,
              UrisBefore: compileInfo.configdata.urisBefore,
              CssBefore: compileInfo.configdata.cssBefore,
              Assets: compileInfo.assets,
              Parts: compileInfo.parts
            };
          var outputDir = path.join(appRootDir, t.getScriptPrefix());

          qx.tool.compiler.utils.Json.saveJsonAsync(path.join(outputDir, "compile-info.json"), MAP)
            .then(() => qx.tool.compiler.utils.Json.saveJsonAsync(path.join(outputDir, "resources.json"), compileInfo.pkgdata))
            .then(resolve)
            .catch(reject);
        })
      ])
      .then(() => this._afterWriteApplication(compileInfo));
    },

    /**
     * After the first part of boot.js has been written, this is called so to optionally
     * append to the stream
     * @param writeStream {Stream} for writing
     * @returns {*}
     */
    _writeBootJs: async function(compileInfo, writeStream) {
    },

    /**
     * Called to generate index.html
     * @private
     */
    _writeIndexHtml: async function(compileInfo) {
      var t = this;
      var application = compileInfo.application;

      if (!application.isBrowserApp()) {
        return; 
      }

      if (!t.isGenerateIndexHtml()) {
        return; 
      }

      var resDir = this.getApplicationRoot(application);

      let writeIndexHtml = async (appRootDir, writingIndexToRoot) => {
        let appRoot = "";
        let preBootJs = "";
        if (writingIndexToRoot) {
          appRoot = t.getProjectDir(application) + "/";
          preBootJs = "  <script type=\"text/javascript\">\n" +
            "    if (!window.qx)\n" +
            "      window.qx = {};\n" +
            "    qx.$$$appRoot = \"" + appRoot + "\";\n" +
            "  </script>\n";
        }

        let pathToTarget = writingIndexToRoot ? "" : path.relative(path.join(t.getOutputDir(), t.getProjectDir(application)), t.getOutputDir()) + "/";
        const TEMPLATE_VARS = {
            "resourcePath": pathToTarget + "resource/",
            "targetPath": pathToTarget,
            "appPath": appRoot + t.getScriptPrefix(),
            "preBootJs": preBootJs,
            "appTitle": (application.getTitle()||"Qooxdoo Application")
        };
        
        function replaceVars(code) {
          for (let varName in TEMPLATE_VARS) {
            code = code.replace(new RegExp(`\\$\{${varName}\}`, "g"), TEMPLATE_VARS[varName]);
          }
          return code;
        }
        
        let defaultIndexHtml = replaceVars(
            "<!DOCTYPE html>\n" +
            "<html>\n" +
            "<head>\n" +
            "  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
            "  <title>${appTitle}</title>\n" +
            "</head>\n" +
            "<body>\n" +
            "  <!-- This index.html can be customised by creating a boot/index.html (do not include Qooxdoo application script tags like\n" +
            "       the one below because they will be added automatically)\n" +
            "    -->\n" +
            "${preBootJs}\n" +
            "  <script type=\"text/javascript\" src=\"${appPath}boot.js\"></script>\n" +
            "</body>\n" +
            "</html>\n");

        var classname = application.getClassName();
        var bootDir = application.getBootPath();
        var stats = bootDir && (await qx.tool.compiler.files.Utils.safeStat(bootDir));
        let writeIndexHtml = true;
        if (stats && stats.isDirectory()) {
          await qx.tool.compiler.files.Utils.sync(bootDir, resDir, (from, to) => {
            if (!from.endsWith(".html")) {
              return true;
            }
            return fs.readFileAsync(from, "utf8")
              .then(data => {
                if (path.basename(from) == "index.html") {
                  writeIndexHtml = false;
                  if (!data.match(/\$\{\s*preBootJs\s*\}/)) {
                    data = data.replace("</body>", "\n${preBootJs}\n</body>");
                    qx.tool.compiler.Console.print("qx.tool.compiler.target.missingPreBootJs", from);
                  }
                  if (!data.match(/script.*boot.js/)) {
                    data = data.replace("</body>", "\n  <script type=\"text/javascript\" src=\"${appPath}boot.js\"></script>\n</body>");
                    qx.tool.compiler.Console.print("qx.tool.compiler.target.missingBootJs", from);
                  }
                }
                data = replaceVars(data);
                return fs.writeFileAsync(to, data, "utf8")
                  .then(() => false);
              });
          });
        }
        if (writeIndexHtml) {
          await writeFile(appRootDir + t.getScriptPrefix() + "index.html", defaultIndexHtml, { encoding: "utf8" });
        }
      };

      if (application.getWriteIndexHtmlToRoot()) {
        await writeIndexHtml(t.getOutputDir(), true);
      }
      await writeIndexHtml(t.getApplicationRoot(application), false);
    },

    /**
     * Called after everything has been written, eg to allow for post compilation steps like minifying etc
     */
    _afterWriteApplication: async function(compileInfo) {
    }
  }
});
