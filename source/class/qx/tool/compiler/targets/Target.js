/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
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

const fs = qx.tool.utils.Promisify.fs;

const path = require("upath");

/**
 * A target for building an application, instances of Target control the generation of transpiled
 * source and collection into an application, including minifying etc
 */
qx.Class.define("qx.tool.compiler.targets.Target", {
  extend: qx.core.Object,

  /**
   * Constructor
   * @param outputDir {String} output directory
   */
  construct(outputDir) {
    super();
    this.setOutputDir(outputDir);
  },

  properties: {
    /** Type of compilation */
    type: {
      init: "source",
      nullable: false,
      check: ["source", "build"]
    },

    /** Output directory (guaranteed to have a trailing slash) */
    outputDir: {
      init: "output",
      nullable: false,
      check: "String",
      transform: "_transformOutputDir"
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
     * Target type default environment property map
     */
    defaultEnvironment: {
      init: null,
      inheritable: true,
      nullable: true
    },

    /**
     * List of environment keys to preserve in code, ie reserve for runtime detection
     * and exclude from code elimination
     */
    preserveEnvironment: {
      init: null,
      nullable: true,
      check: "Array"
    },

    /**
     * The analyser being generated
     */
    analyser: {
      nullable: false
    },

    /**
     * Whether to inline external scripts
     */
    inlineExternalScripts: {
      init: false,
      check: "Boolean"
    },

    /**
     * Whether to add timestamps to all URLs (cache busting)
     */
    addTimestampsToUrls: {
      init: true,
      check: "Boolean"
    },

    /** Locales being generated */
    locales: {
      nullable: false,
      init: ["en"],
      transform: "_transformLocales"
    },

    /** Whether to break locale & translation data out into separate parts */
    i18nAsParts: {
      init: false,
      nullable: false,
      check: "Boolean"
    },

    /** Whether to write all translation strings (as opposed to just those used by the classes) */
    writeAllTranslations: {
      init: false,
      nullable: false,
      check: "Boolean"
    },

    /** Whether to update the source .po files with new strings */
    updatePoFiles: {
      init: false,
      nullable: false,
      check: "Boolean"
    },

    /** What to do with library transation strings */
    libraryPoPolicy: {
      init: "ignore",
      check: ["ignore", "untranslated", "all"]
    },

    /** Whether to write a summary of the compile info to disk, ie everything about dependencies and
     * resources that are used to create the index.js file, but stored as pure JSON for third party code
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
    },

    /**
     * Whether to use relative paths in source maps
     */
    sourceMapRelativePaths: {
      init: false,
      nullable: false,
      check: "Boolean"
    }
  },

  events: {
    /**
     * Fired after all enviroment data is collected, but before compilation begins; this
     * is an  opportunity to adjust the environment for the target.  The event data contains:
     *  application {qx.tool.compiler.app.Application} the app
     *  enviroment: {Object} enviroment data
     */
    checkEnvironment: "qx.event.type.Data",

    /**
     * Fired when an application is about to be serialized to disk; the appMeta is fully
     * populated, and this is an opportunity to amend the meta data before it is serialized
     * into files on disk
     */
    writingApplication: "qx.event.type.Event",

    /**
     * Fired when an application has been serialized to disk
     */
    writtenApplication: "qx.event.type.Event"
  },

  members: {
    /** @type {Map} maps filenames to uris */
    __pathMappings: null,

    /** @type {qx.tool.compiler.targets.meta.ApplicationMeta} for the current application */
    __appMeta: null,

    /**
     * Initialises the target, creating directories etc
     */
    async open() {},

    /**
     * Transforms outputDir so that it always includes a trailing slash
     *
     * @param value
     * @returns {*}
     * @private
     */
    _transformOutputDir(value) {
      if (value) {
        if (value[value.length - 1] != "/") {
          value += "/";
        }
      }
      return value;
    },

    /**
     * Returns the root for applications
     */
    getApplicationRoot(application) {
      return (
        path.join(this.getOutputDir(), this.getProjectDir(application)) + "/"
      );
    },

    /**
     * Returns the project dir
     *
     * @returns String
     */
    getProjectDir(application) {
      return application.getOutputPath() || application.getName();
    },

    /**
     * Returns the URI for the root of the output, relative to the application
     */
    _getOutputRootUri(application) {
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
    addPathMapping(fromFile, toUri) {
      fromFile = path.resolve(fromFile);
      if (this.__pathMappings === null) {
        this.__pathMappings = {};
      }
      this.__pathMappings[fromFile] = toUri;
    },

    /**
     * Converts a filename to a URI, taking into account mappings added via `addMapping`.  If there is
     * no mapping, null is returned
     *
     * @param filename {String} the filename to map
     * @return {String} the URI for the file, null if not found
     */
    getPathMapping(filename) {
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
    mapToUri(filename, relativeTo) {
      var mapTo = this.getPathMapping(filename);
      if (mapTo !== null) {
        return mapTo;
      }

      if (relativeTo) {
        filename = path.relative(relativeTo, filename);
      }

      return filename;
    },

    _copyClassesToFile(classes, outputFilename) {
      let transpiledDir = path.join(this.getOutputDir(), "transpiled");
      let allCode = [];
      return qx.tool.utils.Promisify.eachOfSeries(classes, filename =>
        fs
          .readFileAsync(path.join(transpiledDir, filename), "utf8")
          .then(code => allCode.push(code))
      ).then(() => fs.writeFileAsync(outputFilename, allCode.join("\n")));
    },

    /**
     * Generates the application
     *
     * @param application {Application} the application
     * @param environment {Object} the environment
     */
    async generateApplication(application, environment) {
      var t = this;
      var analyser = application.getAnalyser();
      var rm = analyser.getResourceManager();

      let appMeta = (this.__appMeta =
        new qx.tool.compiler.targets.meta.ApplicationMeta(this, application));
      appMeta.setAddTimestampsToUrls(this.getAddTimestampsToUrls());
      /*
      if (!appMeta.getAppLibrary()) {
        qx.tool.compiler.Console.print("qx.tool.compiler.target.missingAppLibrary", application.getClassName());
        return;
      }
      */
      let targetUri = t._getOutputRootUri(application);
      var appRootDir = this.getApplicationRoot(application);

      let mapTo = this.getPathMapping(
        path.join(appRootDir, this.getOutputDir(), "transpiled/")
      );

      appMeta.setSourceUri(mapTo ? mapTo : targetUri + "transpiled/");
      mapTo = this.getPathMapping(
        path.join(appRootDir, this.getOutputDir(), "resource")
      );

      appMeta.setResourceUri(mapTo ? mapTo : targetUri + "resource");

      const requiredLibs = application.getRequiredLibraries();

      await qx.tool.utils.Utils.makeDirs(appRootDir);

      appMeta.setEnvironment({
        "qx.application": application.getClassName(),
        "qx.revision": "",
        "qx.theme": application.getTheme(),
        "qx.version": analyser.getQooxdooVersion(),
        "qx.compiler.targetType": this.getType(),
        "qx.compiler.outputDir": this.getOutputDir()
      });

      let externals = {};
      const addExternal = (arr, type) => {
        if (arr) {
          arr.forEach(filename => {
            if (externals[filename.toLowerCase()]) {
              return;
            }
            externals[filename.toLowerCase()] = true;
            let actualType =
              type || (filename.endsWith(".js") ? "urisBefore" : "cssBefore");
            if (filename.match(/^https?:/)) {
              appMeta.addExternal(actualType, filename);
            } else {
              let asset = rm.getAsset(filename);
              if (asset) {
                let str = asset.getDestFilename(t);
                str = path.relative(appRootDir, str);
                appMeta.addPreload(actualType, str);
              }
            }
          });
        }
      };

      requiredLibs.forEach(libnamespace => {
        var library = analyser.findLibrary(libnamespace);
        appMeta.addLibrary(library);
        if (this.isWriteLibraryInfo()) {
          let libraryInfoMap = appMeta.getEnvironmentValue(
            "qx.libraryInfoMap",
            {}
          );

          libraryInfoMap[libnamespace] = library.getLibraryInfo();
        }
        addExternal(library.getAddScript(), "urisBefore");
        addExternal(library.getAddCss(), "cssBefore");
      });

      /*
       * Environment
       */
      for (let name in environment) {
        appMeta.setEnvironmentValue(name, environment[name]);
      }
      await t.fireDataEventAsync("checkEnvironment", {
        application: application,
        environment: appMeta.getEnvironment()
      });

      /*
       * Boot files
       */
      let bootJs = new qx.tool.compiler.targets.meta.BootJs(appMeta);
      let bootPackage = appMeta.createPackage();
      appMeta.setBootMetaJs(bootJs);
      bootPackage.addJavascriptMeta(
        new qx.tool.compiler.targets.meta.PolyfillJs(appMeta)
      );

      // Add browserified CommonJS modules, if any. The Browserify
      // class will always bundle local modules specified for an
      // application in compile.json, but will not bundle `require()`d
      // modules that are Node modules.
      if (
        appMeta.getEnvironmentValue("qx.compiler.applicationType") == "browser"
      ) {
        bootPackage.addJavascriptMeta(
          new qx.tool.compiler.targets.meta.Browserify(appMeta)
        );
      }	

      /*
       * Assemble the Parts
       */
      var partsData = application.getPartsDependencies();
      let matchBundle =
        qx.tool.compiler.app.Application.createWildcardMatchFunction(
          application.getBundleInclude(),
          application.getBundleExclude()
        );

      let lastPackage = bootPackage;
      let packages = {
        boot: bootPackage
      };

      partsData.forEach((partData, index) => {
        let partMeta = appMeta.createPart(partData.name);
        if (index == 0) {
          partMeta.addPackage(bootPackage);
        }

        partData.classes.forEach(classname => {
          let classFilename = classname.replace(/\./g, "/") + ".js";

          let transpiledClassFilename = path.join(
            this.getOutputDir(),
            "transpiled",
            classFilename
          );

          let db = analyser.getDatabase();
          let dbClassInfo = db.classInfo[classname];
          let library = analyser.findLibrary(dbClassInfo.libraryName);
          let sourcePath = library.getFilename(classFilename);
          let jsMeta = new qx.tool.compiler.targets.meta.Javascript(
            appMeta,
            transpiledClassFilename,
            sourcePath
          );

          let packageName = matchBundle(classname) ? "__bundle" : partData.name;
          let pkg = packages[packageName];

          if (!pkg || pkg !== lastPackage) {
            pkg = packages[packageName] = appMeta.createPackage();
            if (packageName == "__bundle") {
              pkg.setEmbedAllJavascript(true);
            }
            partMeta.addPackage(pkg);
          }
          if (dbClassInfo.externals) {
            addExternal(dbClassInfo.externals);
          }
          pkg.addJavascriptMeta(jsMeta);
          pkg.addClassname(classname);
          lastPackage = pkg;
        });
      });

      var assetUris = application.getAssetUris(t, rm, appMeta.getEnvironment()); // Save any changes that getAssets collected
      await rm.saveDatabase();

      var promises = [
        analyser.getCldr("en").then(cldr => bootPackage.addLocale("C", cldr)),
        t._writeTranslations()
      ];

      var fontCntr = 0;
      var assets = {};
      rm.getAssetsForPaths(assetUris).forEach(asset => {
        bootPackage.addAsset(asset);
        assets[asset.getFilename()] = asset.toString();
      });

      if (analyser.getApplicationTypes().indexOf("browser") > -1) {
        // Get a list of all fonts to load; use the font name as a unique identifier, and
        //  prioritise the application's library's definitions - this allows the application
        //  the opportunity to override the font definitions.  This is important when the
        //  library uses the open source/free versions of a font but the application
        //  developer has purchased the commercial/full version of the font (eg FontAwesome)
        let appLibrary = appMeta.getAppLibrary();
        let fontsToLoad = {};
        const addLibraryFonts = library => {
          var fonts = library.getWebFonts();
          if (!fonts) {
            return;
          }
          fonts.forEach(font => {
            fontsToLoad[font.getName()] = {
              font,
              library
            };
          });
        };
        requiredLibs.forEach(libnamespace => {
          var library = analyser.findLibrary(libnamespace);
          if (library != appLibrary) {
            addLibraryFonts(library);
          }
        });
        addLibraryFonts(appLibrary);

        const loadFont = async (library, font) => {
          try {
            // check if font is asset somewhere
            let res = font.getResources().filter(res => assets[res]);
            if (res.length === 0) {
              qx.tool.compiler.Console.print(
                "qx.tool.compiler.webfonts.noResources",
                font.toString(),
                application.getName(),
                font.getResources().join(",")
              );

              return;
            }
            font.setResources(res);

            await font.generateForTarget(t);
            let resources = await font.generateForApplication(t, application);
            for (var key in resources) {
              appMeta.addResource(key, resources[key]);
            }
            var code = font.getBootstrapCode(t, application, fontCntr++ == 0);
            if (code) {
              appMeta.addPreBootCode(code);
            }
          } catch (ex) {
            qx.tool.compiler.Console.print(
              "qx.tool.compiler.webfonts.error",
              font.toString(),
              ex.toString()
            );
          }
        };

        Object.keys(fontsToLoad).forEach(fontName => {
          let { font, library } = fontsToLoad[fontName];
          promises.push(loadFont(library, font));
        });
      }
      await qx.Promise.all(promises);
      await t._writeApplication();
      this.__appMeta = null;
    },

    /**
     * Handles the output of translations and locales
     */
    async _writeTranslations() {
      let appMeta = this.getAppMeta();
      const analyser = appMeta.getAnalyser();
      if (this.isUpdatePoFiles()) {
        let policy = this.getLibraryPoPolicy();
        if (policy != "ignore") {
          await analyser.updateTranslations(
            appMeta.getAppLibrary(),
            this.getLocales(),
            appMeta.getLibraries(),
            policy == "all"
          );
        } else {
          await analyser.updateTranslations(
            appMeta.getAppLibrary(),
            this.getLocales(),
            null,
            false
          );
        }
      }

      await this._writeLocales();
      if (this.getWriteAllTranslations()) {
        await this._writeAllTranslations();
      } else {
        await this._writeRequiredTranslations();
      }
    },

    /**
     * Transform method for locales property; ensures that all locales are case correct, ie
     * have the form aa_BB (for example "en_GB" is correct but "en_gb" is invalid)
     *
     * @param value {String[]} array of locale IDs
     * @return {String[]} the modified array
     */
    _transformLocales(value) {
      if (!value) {
        return value;
      }
      return value.map(localeId => {
        localeId = localeId.toLowerCase();
        var pos = localeId.indexOf("_");
        if (pos > -1) {
          localeId =
            localeId.substring(0, pos) + localeId.substring(pos).toUpperCase();
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
     */
    async _writeLocales() {
      var t = this;
      let appMeta = this.getAppMeta();
      var analyser = appMeta.getAnalyser();
      let bootPackage = appMeta.getPackages()[0];

      function loadLocaleData(localeId) {
        var combinedCldr = null;

        function accumulateCldr(localeId) {
          return analyser.getCldr(localeId).then(cldr => {
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
            var parentLocaleId =
              qx.tool.compiler.app.Cldr.getParentLocale(localeId);
            if (parentLocaleId) {
              return accumulateCldr(parentLocaleId);
            }
            return combinedCldr;
          });
        }

        return accumulateCldr(localeId);
      }

      var promises = t.getLocales().map(async localeId => {
        let cldr = await loadLocaleData(localeId);
        let pkg = this.isI18nAsParts()
          ? appMeta.getLocalePackage(localeId)
          : bootPackage;
        pkg.addLocale(localeId, cldr);
      });

      await qx.Promise.all(promises);
    },

    /**
     * Writes all translations
     */
    async _writeAllTranslations() {
      var t = this;
      let appMeta = this.getAppMeta();
      var analyser = appMeta.getAnalyser();
      let bootPackage = appMeta.getPackages()[0];
      var translations = {};
      var promises = [];
      t.getLocales().forEach(localeId => {
        let pkg = this.isI18nAsParts()
          ? appMeta.getLocalePackage(localeId)
          : bootPackage;
        function addTrans(library, localeId) {
          return analyser
            .getTranslation(library, localeId)
            .then(translation => {
              var id = library.getNamespace() + ":" + localeId;
              translations[id] = translation;
              var entries = translation.getEntries();
              for (var msgid in entries) {
                pkg.addTranslationEntry(localeId, entries[msgid]);
              }
            });
        }
        appMeta.getLibraries().forEach(function (library) {
          if (library === appMeta.getAppLibrary()) {
            return;
          }
          promises.push(addTrans(library, localeId));
        });
        // translation from main app should overwrite package translations
        promises.push(addTrans(appMeta.getAppLibrary(), localeId));
      });
      await qx.Promise.all(promises);
    },

    /**
     * Writes only those translations which are actually required
     */
    async _writeRequiredTranslations() {
      var t = this;
      let appMeta = this.getAppMeta();
      var analyser = appMeta.getAnalyser();
      var db = analyser.getDatabase();
      let bootPackage = appMeta.getPackages()[0];

      var translations = {};
      var promises = [];
      t.getLocales().forEach(localeId => {
        let pkg = this.isI18nAsParts()
          ? appMeta.getLocalePackage(localeId)
          : bootPackage;
        appMeta.getLibraries().forEach(function (library) {
          promises.push(
            analyser.getTranslation(library, localeId).then(translation => {
              var id = library.getNamespace() + ":" + localeId;
              translations[id] = translation;
              let entry = translation.getEntry("");
              if (entry) {
                pkg.addTranslationEntry(localeId, entry);
              }
            })
          );
        });
      });
      await qx.Promise.all(promises);

      appMeta.getPackages().forEach(pkg => {
        pkg.getClassnames().forEach(classname => {
          var dbClassInfo = db.classInfo[classname];
          if (!dbClassInfo.translations) {
            return;
          }
          t.getLocales().forEach(localeId => {
            let localePkg = this.isI18nAsParts()
              ? appMeta.getLocalePackage(localeId)
              : pkg;
            dbClassInfo.translations.forEach(transInfo => {
              let entry;
              let id = appMeta.getAppLibrary().getNamespace() + ":" + localeId;
              // search in main app first
              let translation = translations[id];
              if (translation) {
                entry = translation.getEntry(transInfo.msgid);
              }
              let idLib = dbClassInfo.libraryName + ":" + localeId;
              if (!entry && id !== idLib) {
                let translation = translations[idLib];
                if (translation) {
                  entry = translation.getEntry(transInfo.msgid);
                }
              }
              if (entry) {
                localePkg.addTranslationEntry(localeId, entry);
              }
            });
          });
        });
      });
    },

    /**
     * Writes the application
     */
    async _writeApplication() {
      var t = this;

      await this.fireEventAsync("writingApplication");

      let appMeta = this.getAppMeta();
      var application = appMeta.getApplication();
      var appRootDir = appMeta.getApplicationRoot();

      if (!appMeta.getAppLibrary()) {
        qx.tool.compiler.Console.print(
          "qx.tool.compiler.target.missingAppLibrary",
          application.getName()
        );

        return;
      }

      let bootMeta = appMeta.getBootMetaJs();
      for (let arr = appMeta.getPackages(), i = 0; i < arr.length; i++) {
        let pkg = arr[i];
        if (pkg.isEmpty()) {
          pkg.setNeedsWriteToDisk(false);
          bootMeta.addEmbeddedJs(pkg.getJavascript());
        }
        await pkg.getJavascript().unwrap().writeToDisk();
      }

      await appMeta.getBootMetaJs().unwrap().writeToDisk();

      await this._writeIndexHtml();

      if (!t.isWriteCompileInfo()) {
        await this.fireEventAsync("writtenApplication");
        return;
      }

      let bootPackage = appMeta.getPackages()[0];
      let appSummary = {
        appClass: application.getClassName(),
        libraries: appMeta.getLibraries().map(lib => lib.getNamespace()),
        parts: [],
        resources: bootPackage.getAssets().map(asset => asset.getFilename()),
        locales: this.getLocales(),
        environment: appMeta.getEnvironment(),
        urisBefore: appMeta.getPreloads().urisBefore,
        cssBefore: appMeta.getPreloads().cssBefore
      };

      application.getPartsDependencies().forEach(partData => {
        appSummary.parts.push({
          classes: partData.classes,
          include: partData.include,
          exclude: partData.exclude,
          minify: partData.minify,
          name: partData.name
        });
      });

      await fs.writeFileAsync(
        appRootDir + "/compile-info.json",
        JSON.stringify(appSummary, null, 2) + "\n",
        { encoding: "utf8" }
      );

      await this.fireEventAsync("writtenApplication");
    },

    /**
     * Called to generate index.html
     */
    async _writeIndexHtml() {
      var t = this;
      let appMeta = this.getAppMeta();
      var application = appMeta.getApplication();

      if (!application.isBrowserApp()) {
        return;
      }

      if (!this.isGenerateIndexHtml()) {
        return;
      }

      var resDir = this.getApplicationRoot(application);

      let timeStamp = new Date().getTime();
      let pathToTarget =
        path.relative(
          path.join(t.getOutputDir(), t.getProjectDir(application)),
          t.getOutputDir()
        ) + "/";
      let indexJsTimestamp = "";
      if (this.isAddTimestampsToUrls()) {
        let indexJsFilename = path.join(
          appMeta.getApplicationRoot(),
          "index.js"
        );

        indexJsTimestamp = "?" + fs.statSync(indexJsFilename).mtimeMs;
      }
      let TEMPLATE_VARS = {
        resourcePath: pathToTarget + "resource/",
        targetPath: pathToTarget,
        appPath: "",
        preBootJs: "",
        appTitle: application.getTitle() || "Qooxdoo Application",
        timeStamp: timeStamp,
        indexJsTimestamp: indexJsTimestamp
      };

      function replaceVars(code) {
        for (let varName in TEMPLATE_VARS) {
          code = code.replace(
            new RegExp(`\\$\{${varName}\}`, "g"),
            TEMPLATE_VARS[varName]
          );
        }
        return code;
      }
      /* eslint-disable no-template-curly-in-string */
      let defaultIndexHtml =
        "<!DOCTYPE html>\n" +
        "<html>\n" +
        "<head>\n" +
        '  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n' +
        "  <title>${appTitle}</title>\n" +
        "</head>\n" +
        "<body>\n" +
        "  <!-- This index.html can be customised by creating a boot/index.html (do not include Qooxdoo application script tags like\n" +
        "       the one below because they will be added automatically)\n" +
        "    -->\n" +
        "${preBootJs}\n" +
        '  <script type="text/javascript" src="${appPath}index.js${indexJsTimestamp}"></script>\n' +
        "</body>\n" +
        "</html>\n";
      /* eslint-enable no-template-curly-in-string */
      var bootDir = application.getBootPath();
      let indexHtml = null;
      if (bootDir) {
        bootDir = path.join(
          appMeta.getAppLibrary().getRootDir(),
          application.getBootPath()
        );

        var stats = await qx.tool.utils.files.Utils.safeStat(bootDir);
        if (stats && stats.isDirectory()) {
          await qx.tool.utils.files.Utils.sync(
            bootDir,
            resDir,
            async (from, to) => {
              if (!from.endsWith(".html")) {
                return true;
              }
              let data = await fs.readFileAsync(from, "utf8");
              if (path.basename(from) == "index.html") {
                if (!data.match(/\$\{\s*preBootJs\s*\}/)) {
                  /* eslint-disable no-template-curly-in-string */
                  data = data.replace("</body>", "\n${preBootJs}\n</body>");
                  /* eslint-enable no-template-curly-in-string */
                  qx.tool.compiler.Console.print(
                    "qx.tool.compiler.target.missingPreBootJs",
                    from
                  );
                }
                if (!data.match(/\s*index.js\s*/)) {
                  /* eslint-disable no-template-curly-in-string */
                  data = data.replace(
                    "</body>",
                    '\n  <script type="text/javascript" src="${appPath}index.js${indexJsTimestamp}"></script>\n</body>'
                  );

                  /* eslint-enable no-template-curly-in-string */
                  qx.tool.compiler.Console.print(
                    "qx.tool.compiler.target.missingBootJs",
                    from
                  );
                }
                indexHtml = data;
              }
              data = replaceVars(data);
              await fs.writeFileAsync(to, data, "utf8");
              return false;
            }
          );
        }
      }
      if (!indexHtml) {
        indexHtml = defaultIndexHtml;
        await fs.writeFileAsync(resDir + "index.html", replaceVars(indexHtml), {
          encoding: "utf8"
        });
      }

      if (application.getWriteIndexHtmlToRoot()) {
        pathToTarget = "";
        TEMPLATE_VARS = {
          resourcePath: "resource/",
          targetPath: "",
          appPath: t.getProjectDir(application) + "/",
          preBootJs: "",
          appTitle: application.getTitle() || "Qooxdoo Application",
          timeStamp: timeStamp,
          indexJsTimestamp: indexJsTimestamp
        };

        await fs.writeFileAsync(
          t.getOutputDir() + "index.html",
          replaceVars(indexHtml),
          { encoding: "utf8" }
        );
      }
    },

    getAppMeta() {
      return this.__appMeta;
    }
  }
});
