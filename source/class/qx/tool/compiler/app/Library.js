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
 * *********************************************************************** */

var path = require("path");

var fs = require("fs");

var log = qx.tool.utils.LogManager.createLog("library");

/**
 * A Qooxdoo Library or application; typical usage is to call .loadManifest to configure from
 * the library itself
 */
qx.Class.define("qx.tool.compiler.app.Library", {
  extend: qx.core.Object,

  construct() {
    super();
    this.__environmentChecks = {};
  },

  properties: {
    /** The namespace of the library */
    namespace: {
      check: "String"
    },

    /** The version of the library */
    version: {
      check: "String"
    },

    /** The directory; transformed into an absolute path */
    rootDir: {
      check: "String",
      transform: "_transformRootDir"
    },

    /** The path to source files, relative to rootDir */
    sourcePath: {
      init: "source/class",
      check: "String"
    },

    /** The path to generated transpiled files, relative to rootDir */
    transpiledPath: {
      init: "source/transpiled",
      check: "String"
    },

    /** The info section form the Manifest */
    libraryInfo: {
      check: "Map"
    },

    /** The path to resource files, relative to rootDir */
    resourcePath: {
      init: "source/resource",
      check: "String"
    },

    /** The path to resource files, relative to rootDir */
    themePath: {
      init: "source/theme",
      check: "String"
    },

    /** The path to translation files, relative to rootDir */
    translationPath: {
      init: "source/translation",
      check: "String"
    },

    /**
     * {WebFont[]} List of webfonts provided
     * @deprecated
     */
    webFonts: {
      init: null,
      nullable: true,
      check: "Array"
    },

    /** Array of external scripts required by the library */
    addScript: {
      init: null
    },

    /** Array of external stylesheets required by the library */
    addCss: {
      init: null
    },

    /**  Array of requires resources of the library */
    requires: {
      init: null
    }
  },

  members: {
    __promiseLoadManifest: null,
    __environmentChecks: null,
    __fontsData: null,

    /**
     * 
     * @param {string} classname 
     * @returns {boolean} Whether the classname belongs to this library
     */
    isClass(classname) {
      return classname.startsWith(this.getNamespace() + ".");
    },

    /**
     * Transform for rootDir; converts it to an absolute path
     * @param value
     * @returns {*}
     * @private
     */
    _transformRootDir(value) {
      //      if (value)
      //        value = path.resolve(value);
      return value;
    },

    /**
     * Loads the Manifest.json from the directory and uses it to configure
     * properties
     * @param loadFromDir {String} directory
     */
    loadManifest(loadFromDir) {
      if (this.__promiseLoadManifest) {
        return this.__promiseLoadManifest;
      }
      return (this.__promiseLoadManifest = this.__loadManifestImpl(loadFromDir));
    },

    async __loadManifestImpl(loadFromDir) {
      var Console = qx.tool.compiler.Console.getInstance();
      let rootDir = loadFromDir;

      rootDir = await qx.tool.utils.files.Utils.correctCase(path.resolve(loadFromDir));

      this.setRootDir(rootDir);
      let data = await qx.tool.utils.Json.loadJsonAsync(rootDir + "/Manifest.json");

      if (!data) {
        throw new Error(Console.decode("qx.tool.compiler.library.emptyManifest", rootDir));
      }
      this.setNamespace(data.provides.namespace);
      this.setVersion(data.info.version);
      if (data.provides.environmentChecks) {
        for (var key in data.provides.environmentChecks) {
          let check = data.provides.environmentChecks[key];
          let pos = key.indexOf("*");
          if (pos > -1) {
            this.__environmentChecks[key] = {
              matchString: key.substring(0, pos),
              startsWith: true,
              className: check
            };
          } else {
            this.__environmentChecks[key] = {
              matchString: key,
              className: check
            };
          }
        }
      }

      const fixLibraryPath = async dir => {
        let d = path.resolve(rootDir, dir);
        if (!fs.existsSync(d)) {
          this.warn(Console.decode("qx.tool.compiler.library.cannotFindPath", this.getNamespace(), dir));

          return dir;
        }
        let correctedDir = await qx.tool.utils.files.Utils.correctCase(d);
        if (correctedDir.substring(0, rootDir.length + 1) != rootDir + path.sep) {
          this.warn(Console.decode("qx.tool.compiler.library.cannotCorrectCase", rootDir));

          return dir;
        }
        correctedDir = correctedDir.substring(rootDir.length + 1);
        return correctedDir;
      };

      let sourcePath = await fixLibraryPath(data.provides["class"]);
      this.setSourcePath(sourcePath);
      if (data.provides.resource) {
        let resourcePath = await fixLibraryPath(data.provides.resource);
        this.setResourcePath(resourcePath);
      }
      this.setLibraryInfo(data.info);
      if (data.provides.transpiled) {
        this.setTranspiledPath(data.provides.transpiled);
      } else {
        var m = sourcePath.match(/^(.*)\/([^/]+)$/);
        if (m && m.length == 3) {
          this.setTranspiledPath(m[1] + "/transpiled");
        } else {
          this.setTranspiledPath("transpiled");
        }
      }
      if (data.provides.translation) {
        this.setTranslationPath(data.provides.translation);
      }
      if (data.provides.webfonts) {
        let fonts = [];
        if (data.provides.webfonts.length) {
          qx.tool.compiler.Console.print("qx.tool.compiler.webfonts.deprecated", rootDir);
        }
        data.provides.webfonts.forEach(wf => {
          var font = new qx.tool.compiler.app.WebFont(this).set(wf);
          fonts.push(font);
        });
        this.setWebFonts(fonts);
      }
      this.__fontsData = data.provides.fonts || {};
      if (data.externalResources) {
        if (data.externalResources.script) {
          this.setAddScript(data.externalResources.script);
        }
        if (data.externalResources.css) {
          this.setAddCss(data.externalResources.css);
        }
      }
      if (data.requires) {
        this.setRequires(data.requires);
      }
      if (data.provides && data.provides.boot) {
        qx.tool.compiler.Console.print(
          "qx.tool.compiler.cli.compile.deprecatedProvidesBoot",
          rootDir
        );
      }
    },

    /**
     * Returns the provides.fonts data from the manifest
     *
     * @returns {Array}
     */
    getFontsData() {
      return this.__fontsData;
    },

    /**
     * Detects whether the filename is one of the library's fonts
     *
     * @param {String} filename
     * @returns {Boolean}
     */
    isFontAsset(filename) {
      let isWebFont = false;
      if (filename.endsWith("svg")) {
        let fonts = this.getWebFonts() || [];
        isWebFont = fonts.find(webFont => webFont.getResources().find(resource => resource == filename));

        if (!isWebFont) {
          for (let fontId in this.__fontsData) {
            let fontData = this.__fontsData[fontId];
            isWebFont = (fontData.fontFaces || []).find(fontFace =>
              (fontFace.paths || []).find(resource => resource == filename)
            );

            if (isWebFont) {
              break;
            }
          }
        }
      }
      return isWebFont;
    },

    /**
     * Returns the full filename for the file within this library
     *
     * @param filename {String} the filename relative to this library
     * @return {String} the full filename
     */
    getFilename(filename) {
      return path.join(this.getRootDir(), this.getSourcePath(), filename);
    },

    /**
     * Returns the full filename for the file within this library's resources
     *
     * @param filename {String} the filename relative to this library
     * @return {String} the full filename
     */
    getResourceFilename(filename) {
      return path.join(this.getRootDir(), this.getResourcePath(), filename);
    },

    /**
     * Returns the full filename for the file within this library's theme
     *
     * @param filename {String} the filename relative to this library
     * @return {String} the full filename
     */
    getThemeFilename(filename) {
      return path.join(this.getRootDir(), this.getThemePath(), filename);
    },

    /**
     * Returns the environment checks defined in the manifest
     *
     * @returns
     */
    getEnvironmentChecks() {
      return this.__environmentChecks;
    }
  },

  statics: {
    /**
     * Helper method to create a Library instance and load it's manifest
     *
     * @param rootDir {String} directory of the library (must contain a Manifest.json)
     * @return {Library}
     */
    async createLibrary(rootDir) {
      let lib = new qx.tool.compiler.app.Library();
      await lib.loadManifest(rootDir);
      return lib;
    }
  }
});
