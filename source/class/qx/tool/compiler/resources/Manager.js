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

const fs = require("fs");
const path = require("upath");

/**
 * Analyzes library resources, collecting information into a cached database
 * file
 */
qx.Class.define("qx.tool.compiler.resources.Manager", {
  extend: qx.core.Object,

  /**
   * Constructor
   */
  construct(dbFilename) {
    super();
    this.__libraries = [];
    this.__resourceDiscovery = new qx.tool.compiler.meta.Discovery();
    this.__dbFilename = dbFilename;
    this.__loaders = [new qx.tool.compiler.resources.ImageLoader(this), new qx.tool.compiler.resources.MetaLoader(this)];

    this.__converters = [new qx.tool.compiler.resources.ScssConverter(), new qx.tool.compiler.resources.ScssIncludeConverter()];
  },

  properties: {
    watch: {
      check: "Boolean",
      init: false
    }
  },

  events: {
    /** Fired when an asset changes, the data is {qx.tool.compiler.resources.Asset} */
    assetChanged: "qx.event.type.Data",

    /** Fired when an asset is removed, the data is {qx.tool.compiler.resources.Asset} */
    assetRemoved: "qx.event.type.Data"
  },

  members: {
    __assets: undefined,

    /** {String} filename of database */
    __dbFilename: null,

    /** {Object} Database */
    __db: null,

    /** {qx.tool.compiler.meta.Discovery} the discovery used to locate files */
    __resourceDiscovery: null,

    /** @type{qx.tool.compiler.Library[]} all libraries */
    __libraries: null,

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
      try {
        this.__db = (await qx.tool.utils.Json.loadJsonAsync(this.__dbFilename)) || {};
      } catch (ex) {
        if (ex.code === "ENOENT") {
          this.__db = {};
        }
      }
      if (!this.__db.resources) {
        this.__db.resources = {};
      }
    },

    /**
     * Saves the database
     */
    async saveDatabase() {
      await qx.tool.utils.Utils.makeParentDir(this.__dbFilename);
      return await qx.tool.utils.Json.saveJsonAsync(this.__dbFilename, this.__db);
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
     * Adds a library to the resource manager, which adds its resource directories to the discovery process
     *
     * @param {qx.tool.compiler.app.Library} library
     */
    addLibrary(library) {
      const addResourceDir = resourcePath => {
        let rootDir = path.join(library.getRootDir(), library.get(resourcePath));
        let stat = qx.tool.utils.files.Utils.safeStatSync(rootDir);
        if (stat?.isDirectory()) {
          this.__resourceDiscovery.addPath(rootDir, { library: library, resourcePath: resourcePath });
        }
      };

      addResourceDir("resourcePath");
      addResourceDir("themePath");
      this.__libraries.push(library);
    },

    /**
     * Starts the resource discovery, scanning the libraries for resources
     */
    async start() {
      await this.loadDatabase();
      let debounceSaveDatabase = new qx.util.Debounce(() => this.saveDatabase(), 100);

      let unconfirmed = {};
      this.__allResourceUris = null;
      this.__assets = {};
      this.__librariesByResourceUri = {};

      for (let library of this.__libraries) {
        var resources = this.__db.resources[library.getNamespace()];
        if (resources) {
          for (let relFile in resources) {
            unconfirmed[relFile] = library;
          }
        }
      }

      const onResourceFileAddedOrChanged = evt => {
        let { filename, rootDir, context } = evt.getData();
        let library = context.library;
        if (!library) {
          throw new Error(`Cannot find library for rootDir ${rootDir} for file ${filename}`);
        }

        var resources = this.__db.resources[library.getNamespace()];
        if (!resources) {
          this.__db.resources[library.getNamespace()] = resources = {};
        }

        var relFile = filename.substring(rootDir.length + 1).replace(/\\/g, "/");
        let assetUri = qx.tool.compiler.resources.Asset.calculateUri(library, relFile);
        let asset = this.__assets[assetUri];
        if (asset) {
          asset.getFileInfo().mtime = fs.statSync(filename).mtime;
        } else {
          let fileInfo = resources[relFile];
          if (!fileInfo) {
            fileInfo = resources[relFile] = {};
          }
          fileInfo.resourcePath = context.resourcePath;
          fileInfo.mtime = fs.statSync(filename).mtime;
          let asset = new qx.tool.compiler.resources.Asset(library, relFile, fileInfo);
          this.__addAsset(asset);
        }
        delete unconfirmed[relFile];
        debounceSaveDatabase.trigger();
        this.fireDataEvent("assetChanged", asset);
      };

      const onResourceFileRemoved = evt => {
        let { filename, rootDir, context } = evt.getData();
        let library = context.library;
        if (!library) {
          throw new Error(`Cannot find library for rootDir ${rootDir} for file ${filename}`);
        }

        var resources = this.__db.resources[library.getNamespace()];
        if (!resources) {
          this.__db.resources[library.getNamespace()] = resources = {};
        }

        var relFile = filename.substring(rootDir.length + 1).replace(/\\/g, "/");
        delete resources[relFile];

        let assetUri = qx.tool.compiler.resources.Asset.calculateUri(library, relFile);
        let asset = this.__assets[assetUri];
        if (asset) {
          delete this.__assets[assetUri];
          this.fireDataEvent("assetRemoved", asset);
        }
        debounceSaveDatabase.trigger();
      };

      this.__resourceDiscovery.setWatch(this.getWatch());
      this.__resourceDiscovery.addListener("fileAdded", onResourceFileAddedOrChanged, this);
      this.__resourceDiscovery.addListener("fileChanged", onResourceFileAddedOrChanged, this);
      this.__resourceDiscovery.addListener("fileRemoved", onResourceFileRemoved, this);
      await this.__resourceDiscovery.start();

      for (let filename in unconfirmed) {
        let library = unconfirmed[filename];
        let resources = this.__db.resources[library.getNamespace()];
        let fileInfo = resources[filename];
        if (!fileInfo) {
          delete resources[filename];
        } else {
          let stat = qx.tool.utils.files.Utils.safeStatSync(filename);
          if (!stat) {
            delete resources[filename];
          }
        }
      }

      await qx.tool.utils.Promisify.poolEachOf(Object.values(this.__assets), 10, async asset => {
        await asset.load();
        let fileInfo = asset.getFileInfo();
        if (fileInfo.meta) {
          for (var altPath in fileInfo.meta) {
            let lib = this.findLibraryForResource(altPath);
            if (!lib) {
              lib = asset.getLibrary();
            }
            let otherAsset = this.__assets[lib.getNamespace() + ":" + altPath];
            if (otherAsset) {
              otherAsset.addMetaReferee(asset);
              asset.addMetaReferTo(otherAsset);
            } else {
              qx.tool.compiler.Console.warn("Cannot find asset " + altPath + " referenced in " + asset);
            }
          }
        }
        if (fileInfo.dependsOn) {
          let dependsOn = [];
          fileInfo.dependsOn.forEach(str => {
            let otherAsset = this.__assets[str];
            if (!otherAsset) {
              qx.tool.compiler.Console.warn("Cannot find asset " + str + " depended on by " + asset);
            } else {
              dependsOn.push(otherAsset);
            }
          });
          if (dependsOn.length) {
            asset.setDependsOn(dependsOn);
          }
        }
        return null;
      });
      debounceSaveDatabase.trigger();
    },

    /**
     * Stops the resource discovery
     */
    async stop() {
      await this.__resourceDiscovery.stop();
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
            `found ${result.map(l => l.getNamespace()).join(",")} returning first library`
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
      // check for absolute path first, in windows c:/ is a valid absolute name
      if (path.isAbsolute(uri)) {
        let library = this.__libraries.find(lib => uri.startsWith(path.resolve(lib.getRootDir())));
        return library ? [library] : [];
      }

      // Explicit library?
      let pos = uri.indexOf(":");
      if (pos !== -1) {
        let ns = uri.substring(0, pos);
        let library = this.__libraries.find(lib => lib.getNamespace() == ns);
        return library ? [library] : [];
      }

      // Non-wildcards are a direct lookup
      // check for $ and *. less pos wins
      // fix for https://github.com/qooxdoo/qooxdoo/issues/260
      let pos1 = uri.indexOf("$"); // Variable references are effectively a wildcard lookup
      let pos2 = uri.indexOf("*");
      if (pos1 === -1) {
        pos = pos2;
      } else if (pos2 === -1) {
        pos = pos1;
      } else {
        pos = Math.min(pos1, pos2);
      }
      if (pos === -1) {
        let library = this.__librariesByResourceUri[uri] || null;
        if (!library) {
          return [];
        }
        return qx.lang.Type.isArray(library) ? library : [library];
      }

      // Strip wildcard
      var isFolderMatch = uri[pos - 1] === "/";
      uri = uri.substring(0, pos - 1);

      // Fast folder match
      if (isFolderMatch) {
        let library = this.__librariesByResourceUri[uri] || null;
        if (!library) {
          return [];
        }
        return qx.lang.Type.isArray(library) ? library : [library];
      }

      // Slow scan
      if (!this.__allResourceUris) {
        this.__allResourceUris = Object.keys(this.__librariesByResourceUri).sort();
      }
      var thisUriPos = qx.tool.utils.Values.binaryStartsWith(this.__allResourceUris, uri);

      if (thisUriPos > -1) {
        let libraries = {};
        for (; thisUriPos < this.__allResourceUris.length; thisUriPos++) {
          var thisUri = this.__allResourceUris[thisUriPos];
          if (!thisUri.startsWith(uri)) {
            break;
          }

          pos = uri.indexOf(":");
          if (pos !== -1) {
            let ns = uri.substring(0, pos);
            if (!libraries[ns]) {
              libraries[ns] = this.__libraries.find(lib => lib.getNamespace() == ns);
            }
          }
        }

        return Object.values(libraries);
      }

      return [];
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

      asset.setLoaders(this.__loaders.filter(loader => loader.matches(filename, library)));

      asset.setConverters(this.__converters.filter(converter => converter.matches(filename, library)));
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

      let resourceDir = path.join(library.getRootDir(), isThemeFile ? library.getThemePath() : library.getResourcePath());
      srcPath = path.relative(resourceDir, path.isAbsolute(srcPath) ? srcPath : path.join(resourceDir, srcPath));

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
          let tmp = this.__libraries.find(lib => lib.getNamespace() == ns);
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
            resourceNames = Object.keys(libraryData).filter(resourceName => resourceName.substring(0, srcPath.length) === srcPath);
          } else if (libraryData[srcPath]) {
            resourceNames = [srcPath];
          }

          resourceNames.forEach(resourceName => {
            if (assetPaths[resourceName] !== undefined) {
              return;
            }
            let asset = this.__assets[library.getNamespace() + ":" + resourceName];

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
