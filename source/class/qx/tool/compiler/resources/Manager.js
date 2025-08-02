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

/* eslint-disable @qooxdoo/qx/no-illegal-private-usage */

var path = require("upath");

var log = qx.tool.utils.LogManager.createLog("resource-manager");

/**
 * Analyses library resources, collecting information into a cached database
 * file
 */
qx.Class.define("qx.tool.compiler.resources.Manager", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param analyser {qx.tool.compiler.Analyser}
   */
  construct(analyser) {
    super();
    this.__analyser = analyser;
    this.__dbFilename = analyser.getResDbFilename() || "resource-db.json";
    this.__loaders = [
      new qx.tool.compiler.resources.ImageLoader(this),
      new qx.tool.compiler.resources.MetaLoader(this)
    ];

    this.__converters = [
      new qx.tool.compiler.resources.ScssConverter(),
      new qx.tool.compiler.resources.ScssIncludeConverter()
    ];
  },

  members: {
    /** {String} filename of database */
    __dbFilename: null,

    /** {Object} Database */
    __db: null,

    /** the used analyser */
    __analyser: null,

    /** {Map{String,Library}} Lookup of libraries, indexed by resource URI */
    __librariesByResourceUri: null,

    /** {String[]} Array of all resource URIs, sorted alphabetically (ie these are the keys in __librariesByResourceUri) */
    __allResourceUris: null,

    /** {ResourceLoader[]} list of resource loaders, used to add info to the database */
    __loaders: null,

    /** {ResourceConverter[]} list of resource converters, used to copy resources to the target */
    __converters: null,

    /**
     * Loads the cached database
     */
    async loadDatabase() {
      this.__db =
        (await qx.tool.utils.Json.loadJsonAsync(this.__dbFilename)) || {};
    },

    /**
     * Saves the database
     */
    async saveDatabase() {
      log.debug("saving resource manager database");
      return qx.tool.utils.Json.saveJsonAsync(this.__dbFilename, this.__db);
    },

    /**
     * Returns the loaded database
     *
     * @returns
     */
    getDatabase() {
      return this.__db;
    },

    /**
     * Finds the library needed for a resource, see `findLibrariesForResource`.  This reports
     * an error if more than one library is found.
     *
     * @param uri {String} URI
     * @return {qx.tool.compiler.app.Library[]} the libraries, empty list if not found
     */
    findLibraryForResource(uri) {
      let result = this.findLibrariesForResource(uri);
      if (result.length == 0) {
        return null;
      }
      if (result.length > 1) {
        qx.tool.compiler.Console.error(
          `Cannot determine a single library for the URI '${uri}'; ` +
            `found ${result
              .map(l => l.getNamespace())
              .join(",")} returning first library`
        );
      }
      return result[0];
    },

    /**
     * Finds the libraries needed for a resource; this depends on `findAllResources` having
     * already been called.  `uri` can include optional explicit namespace (eg "qx:blah/blah.png"),
     * otherwise the library resource lookups are examined to find the library.
     *
     * Note that there can be more than one directory because the lookup holds directory names (used
     * for wildcards) and they are allowed to be duplicated.
     *
     * @param uri {String} URI
     * @return {qx.tool.compiler.app.Library[]} the libraries, empty list if not found
     */
    findLibrariesForResource(uri) {
      const findLibrariesForResourceImpl = () => {
        var ns;
        var pos;

        // check for absolute path first, in windows c:/ is a valid absolute name
        if (path.isAbsolute(uri)) {
          let library = this.__analyser
            .getLibraries()
            .find(lib => uri.startsWith(path.resolve(lib.getRootDir())));
          return library || null;
        }

        // Explicit library?
        pos = uri.indexOf(":");
        if (pos !== -1) {
          ns = uri.substring(0, pos);
          let library = this.__analyser.findLibrary(ns);
          return library || null;
        }

        // Non-wildcards are a direct lookup
        // check for $ and *. less pos wins
        // fix for https://github.com/qooxdoo/qooxdoo/issues/260
        var pos1 = uri.indexOf("$"); // Variable references are effectively a wildcard lookup
        var pos2 = uri.indexOf("*");
        if (pos1 === -1) {
          pos = pos2;
        } else if (pos2 === -1) {
          pos = pos1;
        } else {
          pos = Math.min(pos1, pos2);
        }
        if (pos === -1) {
          let library = this.__librariesByResourceUri[uri] || null;
          return library;
        }

        // Strip wildcard
        var isFolderMatch = uri[pos - 1] === "/";
        uri = uri.substring(0, pos - 1);

        // Fast folder match
        if (isFolderMatch) {
          let library = this.__librariesByResourceUri[uri] || null;
          return library;
        }

        // Slow scan
        if (!this.__allResourceUris) {
          this.__allResourceUris = Object.keys(
            this.__librariesByResourceUri
          ).sort();
        }
        var thisUriPos = qx.tool.utils.Values.binaryStartsWith(
          this.__allResourceUris,
          uri
        );

        if (thisUriPos > -1) {
          let libraries = {};
          for (; thisUriPos < this.__allResourceUris.length; thisUriPos++) {
            var thisUri = this.__allResourceUris[thisUriPos];
            if (!thisUri.startsWith(uri)) {
              break;
            }

            pos = uri.indexOf(":");
            if (pos !== -1) {
              ns = uri.substring(0, pos);
              if (!libraries[ns]) {
                libraries[ns] = this.__analyser.findLibrary(ns);
              }
            }
          }

          return Object.values(libraries);
        }

        return null;
      };

      let result = findLibrariesForResourceImpl();
      if (!result) {
        return [];
      }
      if (!qx.lang.Type.isArray(result)) {
        return [result];
      }
      return result;
    },

    /**
     * Scans all libraries looking for resources; this does not analyse the
     * files, simply compiles the list
     */
    async findAllResources() {
      var t = this;
      var db = this.__db;
      if (!db.resources) {
        db.resources = {};
      }
      t.__librariesByResourceUri = {};
      this.__allResourceUris = null;
      this.__assets = {};

      await qx.Promise.all(
        t.__analyser.getLibraries().map(async library => {
          var resources = db.resources[library.getNamespace()];
          if (!resources) {
            db.resources[library.getNamespace()] = resources = {};
          }
          var unconfirmed = {};
          for (let relFile in resources) {
            unconfirmed[relFile] = true;
          }

          const scanResources = async resourcePath => {
            // If the root folder exists, scan it
            var rootDir = path.join(
              library.getRootDir(),
              library.get(resourcePath)
            );

            await qx.tool.utils.files.Utils.findAllFiles(
              rootDir,
              async filename => {
                var relFile = filename
                  .substring(rootDir.length + 1)
                  .replace(/\\/g, "/");
                var fileInfo = resources[relFile];
                delete unconfirmed[relFile];
                if (!fileInfo) {
                  fileInfo = resources[relFile] = {};
                }
                fileInfo.resourcePath = resourcePath;
                fileInfo.mtime = await qx.tool.utils.files.Utils.safeStat(
                  filename
                ).mtime;

                let asset = new qx.tool.compiler.resources.Asset(
                  library,
                  relFile,
                  fileInfo
                );

                this.__addAsset(asset);
              }
            );
          };

          await scanResources("resourcePath");
          await scanResources("themePath");

          // Check the unconfirmed resources to make sure that they still exist;
          //  delete from the database if they don't
          await qx.Promise.all(
            Object.keys(unconfirmed).map(async filename => {
              let fileInfo = resources[filename];
              if (!fileInfo) {
                delete resources[filename];
              } else {
                let stat = await qx.tool.utils.files.Utils.safeStat(filename);
                if (!stat) {
                  delete resources[filename];
                }
              }
            })
          );
        })
      );

      await qx.tool.utils.Promisify.poolEachOf(
        Object.values(this.__assets),
        10,
        async asset => {
          await asset.load();
          let fileInfo = asset.getFileInfo();
          if (fileInfo.meta) {
            for (var altPath in fileInfo.meta) {
              let lib = this.findLibraryForResource(altPath);
              if (!lib) {
                lib = asset.getLibrary();
              }
              let otherAsset =
                this.__assets[lib.getNamespace() + ":" + altPath];
              if (otherAsset) {
                otherAsset.addMetaReferee(asset);
                asset.addMetaReferTo(otherAsset);
              } else {
                qx.tool.compiler.Console.warn(
                  "Cannot find asset " + altPath + " referenced in " + asset
                );
              }
            }
          }
          if (fileInfo.dependsOn) {
            let dependsOn = [];
            fileInfo.dependsOn.forEach(str => {
              let otherAsset = this.__assets[str];
              if (!otherAsset) {
                qx.tool.compiler.Console.warn(
                  "Cannot find asset " + str + " depended on by " + asset
                );
              } else {
                dependsOn.push(otherAsset);
              }
            });
            if (dependsOn.length) {
              asset.setDependsOn(dependsOn);
            }
          }
          return null;
        }
      );
    },

    /**
     * Adds an asset
     *
     * @param asset {Asset} the asset to add
     */
    __addAsset(asset) {
      this.__assets[asset.toUri()] = asset;

      let library = asset.getLibrary();
      let filename = asset.getFilename();
      let tmp = "";
      filename.split("/").forEach((seg, index) => {
        if (index) {
          tmp += "/";
        }
        tmp += seg;
        let current = this.__librariesByResourceUri[tmp];
        if (current) {
          if (qx.lang.Type.isArray(current)) {
            if (!qx.lang.Array.contains(current, library)) {
              current.push(library);
            }
          } else if (current !== library) {
            current = this.__librariesByResourceUri[tmp] = [current, library];
          }
        } else {
          this.__librariesByResourceUri[tmp] = library;
        }
      });

      asset.setLoaders(
        this.__loaders.filter(loader => loader.matches(filename, library))
      );

      asset.setConverters(
        this.__converters.filter(converter =>
          converter.matches(filename, library)
        )
      );
    },

    /**
     * Gets an individual asset
     *
     * @param srcPath {String} the resource name, with or without a namespace prefix
     * @param create {Boolean?} if true the asset will be created if it does not exist
     * @param isThemeFile {Boolean?} if true the asset will be expected to be in the theme folder
     * @return {Asset?} the asset, if found
     */
    getAsset(srcPath, create, isThemeFile) {
      let library = this.findLibraryForResource(srcPath);
      if (!library) {
        qx.tool.compiler.Console.warn("Cannot find library for " + srcPath);
        return null;
      }

      let resourceDir = path.join(
        library.getRootDir(),
        isThemeFile ? library.getThemePath() : library.getResourcePath()
      );

      srcPath = path.relative(
        resourceDir,
        path.isAbsolute(srcPath) ? srcPath : path.join(resourceDir, srcPath)
      );

      let asset = this.__assets[library.getNamespace() + ":" + srcPath];
      if (!asset && create) {
        asset = new qx.tool.compiler.resources.Asset(library, srcPath, {
          resourcePath: "resourcePath"
        });

        this.__addAsset(asset);
      }
      return asset;
    },

    /**
     * Collects information about the assets listed in srcPaths;
     *
     * @param srcPaths
     * @return {Asset[]}
     */
    getAssetsForPaths(srcPaths) {
      var db = this.__db;

      // Generate a lookup that maps the resource name to the meta file that
      //  contains the composite
      var metas = {};
      for (var libraryName in db.resources) {
        var libraryData = db.resources[libraryName];
        for (var resourcePath in libraryData) {
          var fileInfo = libraryData[resourcePath];
          if (!fileInfo.meta) {
            continue;
          }
          for (var altPath in fileInfo.meta) {
            metas[altPath] = resourcePath;
          }
        }
      }

      var assets = [];
      var assetPaths = {};

      srcPaths.forEach(srcPath => {
        let pos = srcPath.indexOf(":");
        let libraries = null;
        if (pos > -1) {
          let ns = srcPath.substring(0, pos);
          let tmp = this.__analyser.findLibrary(ns);
          libraries = tmp ? [tmp] : [];
          srcPath = srcPath.substring(pos + 1);
        } else {
          libraries = this.findLibrariesForResource(srcPath);
        }

        if (libraries.length == 0) {
          qx.tool.compiler.Console.warn("Cannot find library for " + srcPath);
          return;
        }

        libraries.forEach(library => {
          let libraryData = db.resources[library.getNamespace()];
          pos = srcPath.indexOf("*");
          let resourceNames = [];
          if (pos > -1) {
            srcPath = srcPath.substring(0, pos);
            resourceNames = Object.keys(libraryData).filter(
              resourceName =>
                resourceName.substring(0, srcPath.length) === srcPath
            );
          } else if (libraryData[srcPath]) {
            resourceNames = [srcPath];
          }

          resourceNames.forEach(resourceName => {
            if (assetPaths[resourceName] !== undefined) {
              return;
            }
            let asset =
              this.__assets[library.getNamespace() + ":" + resourceName];

            let fileInfo = asset.getFileInfo();
            if (fileInfo.doNotCopy === true) {
              return;
            }

            (asset.getMetaReferees() || []).forEach(meta => {
              // Extract the fragment from the meta data for this particular resource
              var resMetaData = meta.getFileInfo().meta[resourceName];
              fileInfo.composite = resMetaData[3];
              fileInfo.x = resMetaData[4];
              fileInfo.y = resMetaData[5];
            });

            assets.push(asset);
            assetPaths[resourceName] = assets.length - 1;
          });
        });
      });

      return assets;
    }
  }
});
