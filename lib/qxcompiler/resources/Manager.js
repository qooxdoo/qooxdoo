/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
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
var path = require("path");
var child_process = require("child_process");
var async = require('async');
var qx = require("qooxdoo");
var util = require("../../util");
var imageSize = require("image-size");
var jsonlint = require("jsonlint");

var log = util.createLog("resource-manager");

require("./ImageHandler");
require("./MetaHandler");
require("./SCSSHandler");


/**
 * Analyses library resources, collecting information into a cached database
 * file
 */
module.exports = qx.Class.define("qxcompiler.resources.Manager", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param dbFilename
   *          {String?} database filename, default is "resource-db.json"
   */
  construct: function (dbFilename) {
    this.base(arguments);
    this.__dbFilename = dbFilename || "resource-db.json";
    this.__libraries = [];
    this.__librariesByNamespace = {};
    this.__handlers = [
      new qxcompiler.resources.ImageHandler(),
      new qxcompiler.resources.MetaHandler(),
      new qxcompiler.resources.SCSSHandler()
    ];
  },

  members: {
    /** {String} filename of database */
    __dbFilename: null,
    
    /** {Object} Database */
    __db: null,
    
    /** {Library[]} All libraries */
    __libraries: null,
    
    /** {Map{String,Library}} Lookup of libraries, indexed by namespace */
    __librariesByNamespace: null,
    
    /** {Map{String,Library}} Lookup of libraries, indexed by resource URI */
    __librariesByResourceUri: null,
    
    /** {String[]} Array of all resource URIs, sorted alphabetically (ie these are the keys in __librariesByResourceUri) */
    __allResourceUris: null,
    
    /** {Map{String,Library}} Lookup of libraries, indexed by resource folder URI */
    __librariesByResourceFolderUri: null,
    
    /**
     * Adds a library definition
     *
     * @param library
     */
    addLibrary: function (library) {
      this.__libraries.push(library);
      this.__librariesByNamespace[library.getNamespace()] = library;
    },

    /**
     * Loads the cached database
     *
     * @param callback
     */
    loadDatabase: function (callback) {
      var t = this;
      async.waterfall([
        function readDb(callback) {
          fs.exists(t.__dbFilename, function (exists) {
            if (exists)
              fs.readFile(t.__dbFilename, {encoding: "utf-8"}, callback);
            else
              callback(null, null);
          });
        },

        function parseDb(data, callback) {
          t.__db = data && data.trim().length ? jsonlint.parse(data) : {};
          callback(null, t.__db);
        }
      ], callback);
    },

    /**
     * Saves the database
     *
     * @param callback
     */
    saveDatabase: function (callback) {
      log.debug("saving resource manager database");
      fs.writeFile(this.__dbFilename, JSON.stringify(this.__db, null, 2), callback);
    },

    /**
     * Returns the loaded database
     *
     * @returns
     */
    getDatabase: function () {
      return this.__db;
    },
    
    /**
     * Finds the library needed for a resource; this depends on `findAllResources` having 
     * already been called.  `uri` can include optional explicit namespace (eg "qx:blah/blah.png"),
     * otherwise the library resource lookups are examined to find the library.
     * 
     * @param uri {String} URI
     * @return {Library?} the library, null if not found
     */
    findLibraryForResource: function(uri) {
      var t = this;
      var db = this.__db;
      
      // Explicit library?
      var pos = uri.indexOf(':');
      if (pos !== -1) {
        var ns = uri.substring(0, pos);
        var library = this.__librariesByNamespace[ns];
        return library||null;
      }
      
      // Non-wildcards are a direct lookup
      var pos = uri.indexOf('*');
      if (pos === -1)
        pos = uri.indexOf('$'); // Variable references are effectively a wildcard lookup
      if (pos === -1) {
        var library = t.__librariesByResourceUri[uri]||null;
        return library;
      }
      
      // Strip wildcard
      var isFolderMatch = uri[pos - 1] === '/';
      uri = uri.substring(0, pos - 1);

      // Fast folder match
      if (isFolderMatch) {
        var library = t.__librariesByResourceFolderUri[uri]||null;
        return library;
      }
      
      // Slow scan
      pos = qxcompiler.utils.Values.binaryStartsWith(t.__allResourceUris, uri);
      if (pos > -1) {
        var firstUri = t.__allResourceUris[pos];
        var library = t.__librariesByResourceUri[firstUri] || t.__librariesByResourceFolderUri[firstUri] || null;
        return library;
      }

      return null;
    },

    /**
     * Scans all libraries looking for resources; this does not analyse the
     * files, simply compiles the list
     *
     * @param callback
     */
    findAllResources: function (callback) {
      var t = this;
      var db = this.__db;
      if (!db.resources)
        db.resources = {};
      t.__librariesByResourceUri = {};
      t.__librariesByResourceFolderUri = {};

      // Scan all the libraries
      async.forEach(t.__libraries,
          function (library, callback) {
            var resources = db.resources[library.getNamespace()];
            if (!resources)
              db.resources[library.getNamespace()] = resources = {};
            var unconfirmed = {};
            for (var relFile in resources)
              unconfirmed[relFile] = true;
            var tasks = [];
              
            // Scans a folder, recursively, looking for resource files
            function scanDir(rootDir, dir, doNotCopy, callback) {

              // Get the list of files
              fs.readdir(dir, function (err, files) {
                if (err)
                  return callback(err);

                // and process each one
                async.forEach(files,
                    function (file, callback) {
                      var absFile = path.join(dir, file);
                      fs.stat(absFile, function (err, stat) {
                        if (err)
                          return callback(err);

                        // Directory? recurse
                        if (stat.isDirectory()) {
                          scanDir(rootDir, absFile, doNotCopy, callback);
                        } else {
                          var relFile = absFile.substring(rootDir.length + 1).replace(/\\/g, '/');
                          var fileInfo = resources[relFile];
                          delete unconfirmed[relFile];
                          if (!fileInfo)
                            fileInfo = resources[relFile] = {};
                          fileInfo.doNotCopy = doNotCopy;  
                          t.__librariesByResourceUri[relFile] = library;
                          var relDir = dir.substring(rootDir.length + 1).replace(/\\/g, '/');
                          t.__librariesByResourceFolderUri[relDir] = library;
                          
                          var handlers = t.__handlers.filter((handler) => handler.matches(absFile));
                          if (!handlers.length)
                            return callback();
                          
                          if (handlers.some((handler) => handler.needsCompile(absFile, fileInfo, stat))) {
                            fileInfo.mtime = stat.mtime;
                            tasks.push({
                              fileInfo: fileInfo,
                              absFile: absFile,
                              library: library,
                              handlers: handlers
                            });
                          }
                          callback();
                        }
                      });
                    },
                    callback);
              });
            }
            
            function testUntested(rootDir, callback) {
              // Check the unconfirmed resources to make sure that they still exist;
              //  delete from the database if they don't
              async.forEach(Object.keys(unconfirmed),
                  function (relFile, callback) {
                    fs.stat(path.join(rootDir, relFile), function (err, stat) {
                      if (err)
                        delete resources[relFile];
                      callback();
                    });
                  },
                  callback);
            }
            
            function flushTasks(callback) {
              if (tasks.length == 0)
                return callback(null);

              // inspect all the files that need it
              var identifyQueue = async.queue(function(task, callback) {
                var promises = [];
                task.handlers.forEach((handler) => { 
                  promises.push(handler.compile(task.absFile, task.library, task.fileInfo));
                });
                Promise.all(promises)
                  .then(() => { callback(); })
                  .catch((err) => { callback(err); });

              }, 20);

              identifyQueue.push(tasks);
              identifyQueue.drain = callback;
              identifyQueue.error = function(err) {
                t.error(err.stack||err);
              };
            }
            
            function scanProp(prop, fromTheme, callback) {
              // If the root folder exists, scan it
              var rootDir = path.join(library.getRootDir(), library.get(prop));
              fs.exists(rootDir, function (exists) {
                if (!exists)
                  return callback(null);
                scanDir(rootDir, rootDir, fromTheme, function (err) {
                  if (err)
                    return callback(err);
                  testUntested(rootDir, (err) => {
                    if (err)
                      return callback(err);
                  callback();
                  });
                });
              });
            };
            scanProp("resourcePath", false, function() {
                 scanProp("themePath", true, function() {
                  flushTasks(function(err) {
                    t.__allResourceUris = Object.keys(t.__librariesByResourceUri).sort();
                    callback(err);
                  });
                 });
            })
          }, 
          callback);   
        },

    /**
     * Collects information about the assets listed in srcPaths;
     * @param srcPaths
     */
    getAssets: function (srcPaths) {
      var t = this;
      var db = this.__db;

      // Generate a lookup that maps the resource name to the meta file that
      //  contains the composite
      var metas = {};
      for (var libraryName in db.resources) {
        var libraryData = db.resources[libraryName];
        for (var resourcePath in libraryData) {
          var fileInfo = libraryData[resourcePath];
          if (!fileInfo.meta)
            continue;
          for (var altPath in fileInfo.meta) {
            metas[altPath] = resourcePath;
          }
        }
      }

      // Collect a list of assets
      var assets = [];
      var assetPaths = {};

      function addAsset(library, resourceName) {
        if (assetPaths[resourceName] !== undefined)
          return;

        var libraryData = db.resources[library.getNamespace()];
        var fileInfo = libraryData[resourceName];
        if (fileInfo.doNotCopy === true)
           return;
        var asset = {
          libraryName: library.getNamespace(),
          filename: resourceName,
          fileInfo: fileInfo
        };

        // Does this have meta data for a composite?
        var metaPath = metas[resourceName];
        if (metaPath != null) {
          var metaInfo = libraryData[metaPath];
          if (metaInfo) {
            // Extract the fragment from the meta data for this particular resource
            var resMetaData = metaInfo.meta[resourceName];
            fileInfo.composite = resMetaData[3];
            fileInfo.x = resMetaData[4];
            fileInfo.y = resMetaData[5];
            if (!assetPaths[metaPath])
              srcPaths.push(metaPath);
          }
        }
        assets.push(asset);
        assetPaths[resourceName] = assets.length - 1;
      }

      for (var i = 0; i < srcPaths.length; i++) {
        var srcPath = srcPaths[i];
        var library = t.findLibraryForResource(srcPath);
        if (!library) {
          t.warn("Cannot find library for " + srcPath);
          continue;
        }
        
        var pos = srcPath.indexOf(':');
        if (pos > -1)
          srcPath = srcPath.substring(pos + 1);
        
        var libraryData = db.resources[library.getNamespace()];
        var pos = srcPath.indexOf('*');
        if (pos > -1) {
          srcPath = srcPath.substring(0, pos);
          for (var resourceName in libraryData) {
            if (resourceName.substring(0, srcPath.length) == srcPath)
              addAsset(library, resourceName);
          }
        } else {
          var fileInfo = libraryData[srcPath];
          if (fileInfo && (fileInfo.doNotCopy !==true))
            addAsset(library, srcPath);
        }
      }
      
      return assets;
    }
  }
});
