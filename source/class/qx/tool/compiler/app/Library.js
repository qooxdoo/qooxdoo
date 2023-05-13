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
var async = require("async");

var log = qx.tool.utils.LogManager.createLog("library");

/**
 * A Qooxdoo Library or application; typical usage is to call .loadManifest to configure from
 * the library itself
 */
qx.Class.define("qx.tool.compiler.app.Library", {
  extend: qx.core.Object,

  construct() {
    super();
    this.__knownSymbols = {};
    this.__sourceFileExtensions = {};
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
    __knownSymbols: null,
    __sourceFileExtensions: null,
    __promiseLoadManifest: null,
    __environmentChecks: null,
    __fontsData: null,

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
      return (this.__promiseLoadManifest =
        this.__loadManifestImpl(loadFromDir));
    },

    async __loadManifestImpl(loadFromDir) {
      var Console = qx.tool.compiler.Console.getInstance();
      let rootDir = loadFromDir;

      rootDir = await qx.tool.utils.files.Utils.correctCase(
        path.resolve(loadFromDir)
      );

      this.setRootDir(rootDir);
      let data = await qx.tool.utils.Json.loadJsonAsync(
        rootDir + "/Manifest.json"
      );

      if (!data) {
        throw new Error(
          Console.decode("qx.tool.compiler.library.emptyManifest", rootDir)
        );
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
          this.warn(
            Console.decode(
              "qx.tool.compiler.library.cannotFindPath",
              this.getNamespace(),
              dir
            )
          );

          return dir;
        }
        let correctedDir = await qx.tool.utils.files.Utils.correctCase(d);
        if (
          correctedDir.substring(0, rootDir.length + 1) !=
          rootDir + path.sep
        ) {
          this.warn(
            Console.decode(
              "qx.tool.compiler.library.cannotCorrectCase",
              rootDir
            )
          );

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
          qx.tool.compiler.Console.print(
            "qx.tool.compiler.webfonts.deprecated"
          );
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
          "qx.tool.cli.compile.deprecatedProvidesBoot",
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
     * Scans the filing system looking for classes; there are occasions (ie Qooxdoo's qxWeb module)
     * where the class name does not comply with the namespace, this method is used to find those
     * files and also to prepopulate the known symbols list
     * @param cb {Function} (err, classes) returns an array of class names
     */
    scanForClasses(cb) {
      var t = this;
      var classes = [];
      function scanDir(folder, packageName, cb) {
        fs.readdir(folder, function (err, filenames) {
          if (err) {
            cb(err);
            return;
          }

          async.each(
            filenames,
            function (filename, cb) {
              if (filename[0] == ".") {
                cb();
                return;
              }
              fs.stat(path.join(folder, filename), function (err, stat) {
                if (err || !stat) {
                  cb(err);
                  return;
                }

                if (stat.isDirectory()) {
                  var tmp = packageName;
                  if (tmp.length) {
                    tmp += ".";
                  }
                  tmp += filename;
                  scanDir(path.join(folder, filename), tmp, cb);
                  return;
                }

                // Make sure it looks like a file
                var match = filename.match(/(.*)(\.\w+)$/);
                if (!match) {
                  log.trace("Skipping file " + folder + "/" + filename);
                  cb();
                  return;
                }

                // Class name
                var className = match[1];
                var extension = match[2];
                if (packageName.length) {
                  className = packageName + "." + className;
                }

                if (className.match(/__init__/)) {
                  cb();
                  return;
                }
                if (extension == ".js" || extension == ".ts") {
                  t.__knownSymbols[className] = "class";
                  t.__sourceFileExtensions[className] = extension;
                  classes.push(className);
                } else {
                  t.__knownSymbols[filename] = "resource";
                }
                if (Boolean(packageName) && !t.__knownSymbols[packageName]) {
                  t.__knownSymbols[packageName] = "package";
                  var pos;
                  tmp = packageName;
                  while ((pos = tmp.lastIndexOf(".")) > -1) {
                    tmp = tmp.substring(0, pos);
                    t.__knownSymbols[tmp] = "package";
                  }
                }

                cb();
              });
            },
            cb
          );
        });
      }

      let rootDir = path.join(t.getRootDir(), t.getSourcePath());
      if (!fs.existsSync(rootDir)) {
        let Console = qx.tool.compiler.Console.getInstance();
        qx.tool.compiler.Console.warn(
          Console.decode(
            "qx.tool.compiler.library.cannotFindPath",
            t.getNamespace(),
            rootDir
          )
        );

        cb(null, []);
        return;
      }
      scanDir(rootDir, "", function (err) {
        cb(err, classes);
      });
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
        isWebFont = fonts.find(webFont =>
          webFont.getResources().find(resource => resource == filename)
        );

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
     * Detects the type of a symbol, "class", "resource", "package", "environment", or null if not found
     *
     * @param {String} name
     * @return {{symbolType,name,className}?}
     */
    getSymbolType(name) {
      if (!name.length) {
        return null;
      }
      var t = this;

      var type = this.__knownSymbols[name];

      if (type) {
        return {
          symbolType: t.__knownSymbols[name],
          className: type == "class" ? name : null,
          name: name
        };
      }

      function testEnvironment(check) {
        if (!check) {
          return null;
        }
        let match = false;
        if (check.startsWith) {
          match = name.startsWith(check.matchString);
        } else {
          match = name == check.matchString;
        }
        if (match) {
          return {
            symbolType: "environment",
            className: check.className,
            name: name
          };
        }
        return null;
      }

      let result = testEnvironment(this.__environmentChecks[name]);
      if (result) {
        return result;
      }
      for (let key in this.__environmentChecks) {
        let check = this.__environmentChecks[key];
        if (check.startsWith) {
          result = testEnvironment(check);
          if (result !== null) {
            return result;
          }
        }
      }

      var tmp = name;
      var pos;
      while ((pos = tmp.lastIndexOf(".")) > -1) {
        tmp = tmp.substring(0, pos);
        type = this.__knownSymbols[tmp];
        if (type) {
          if (type == "class") {
            return { symbolType: "member", className: tmp, name: name };
          }
          return null;
        }
      }

      return null;
    },

    /**
     * Checks whether the classname is an actual class, in this library
     *
     * @param classname {String} classname to look for
     * @return {Boolean}
     */
    isClass(classname) {
      var type = this.__knownSymbols[classname];
      return type === "class";
    },

    /**
     * Returns all known symbols as a map indexed by symbol name
     */
    getKnownSymbols() {
      return this.__knownSymbols;
    },

    /**
     * Returns the original extension of the class file that implemented the
     * given class name.
     *
     * @param {String} className
     */
    getSourceFileExtension(className) {
      return this.__sourceFileExtensions[className];
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
