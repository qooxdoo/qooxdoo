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

var log = util.createLog("resource-manager");

require("./ImageHandler");
require("./MetaHandler");


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
    this.__handlers = [
      new qxcompiler.resources.ImageHandler(),
      new qxcompiler.resources.MetaHandler()
    ];
  },

  members: {
    __dbFilename: null,
    __db: null,
    __libraries: null,
    
    /**
     * Adds a library definition
     *
     * @param library
     */
    addLibrary: function (library) {
      this.__libraries.push(library);
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
          t.__db = data && data.trim().length ? JSON.parse(data) : {};
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

      // Scan all the libraries
      async.forEach(t.__libraries,
          function (library, callback) {
            var resources = db.resources[library.getNamespace()];
            if (!resources)
              db.resources[library.getNamespace()] = resources = {};
            var unconfirmed = {};
            for (var relFile in resources)
              unconfirmed[relFile] = true;
            var rootDir = path.join(library.getRootDir(), library.getResourcePath());
            var tasks = [];

            // Scans a folder, recursively, looking for resource files
            function scanDir(dir, callback) {

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
                          scanDir(absFile, callback);
                        } else {
                          var relFile = absFile.substring(rootDir.length + 1).replace(/\\/g, '/');
                          var fileInfo = resources[relFile];
                          delete unconfirmed[relFile];
                          if (!fileInfo)
                            fileInfo = resources[relFile] = {};
                          
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
            
            function testUntested(callback) {
              // Check the unconfirmed resources to make sure that they still exist;
              //  delete from the database if they don't
              async.forEach(unconfirmed,
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
            
            // If the root folder exists, scan it
            fs.exists(rootDir, function (exists) {
              if (!exists)
                return callback(null);

              scanDir(rootDir, function (err) {
                if (err)
                  return callback(err);

                testUntested((err) => {
                  if (err)
                    return callback(err);
                  
                  flushTasks(callback);
                });
              });
            });

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

      function addAsset(libraryName, resourceName) {
        if (assetPaths[resourceName] !== undefined)
          return;

        var libraryData = db.resources[libraryName];
        var fileInfo = libraryData[resourceName];
        var asset = {
          libraryName: libraryName,
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
        var pos = srcPath.indexOf(':');
        var libraryName;
        if (pos > -1) {
          libraryName = srcPath.substring(0, pos);
          srcPath = srcPath.substring(pos + 1);
        } else {
          libraryName = srcPath.match(/^([^/]+)/)[0];
        }
        
        var libraryData = db.resources[libraryName];
        if (!libraryData) {
          t.warn("Cannot find library for " + srcPath);
          continue;
        }
        var pos = srcPath.indexOf('*');
        if (pos > -1) {
          srcPath = srcPath.substring(0, pos);
          for (var resourceName in libraryData) {
            if (resourceName.substring(0, srcPath.length) == srcPath)
              addAsset(libraryName, resourceName);
          }
        } else {
          var fileInfo = libraryData[srcPath];
          if (fileInfo)
            addAsset(libraryName, srcPath);
        }
      }
      
      return assets;
    }
  }
});
