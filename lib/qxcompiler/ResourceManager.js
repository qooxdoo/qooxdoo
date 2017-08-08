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
var util = require("../util");

var log = util.createLog("resource-manager");
debugger;

/**
 * Analyses library resources, collecting information into a cached database
 * file
 */
module.exports = qx.Class.define("qxcompiler.ResourceManager", {
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
  },

  members: {
    __dbFilename: null,
    __db: null,
    __libraries: null,
    __imageMagickVersion: null,
    __imageMagickPrefix: "",
    
    start: async function() {
      var t = this;
      function detectVersion(stdout) {
        var version = null;
        stdout.split('\n').forEach(function(line) {
          var m = line.match(/^Version:\s+ImageMagick\s+([0-9_\-.]+)\s+([^\s]+)\s+([^\s]+)\s+([0-9\-]+)/);
          if (m) {
            version = m[1];
            return true;
          }
        });
        return version;
      }
      return new Promise((resolve, reject) => {
        util.process.execAndCapture("magick", ["-version"], function(err, stdout, exitCode, signal) {
          if (err && err.code != "ENOENT")
            return reject(err);
          var version = err ? null : detectVersion(stdout);
          if (version)
            return resolve(version);
          
          util.process.execAndCapture("identify", ["-version"], function(err, stdout, exitCode, signal) {
            if (err && err.code != "ENOENT")
              return reject(err);
            
            var version = err ? null : detectVersion(stdout);
            if (version)
              return resolve(version);
            
            return reject("Cannot find ImageMagick");
          });
        });
      })
      .then((version) => {
        t.__imageMagickVersion = version;
        if (version && parseInt(version, 10) >= 7) {
          t.__imageMagickPrefix = "magick ";
        }
      });
    },

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
                          var relFile = absFile.substring(rootDir.length + 1);
                          var fileInfo = resources[relFile];
                          if (!fileInfo)
                            fileInfo = resources[relFile] = {};

                          // Meta files need to be processed if they've changed
                          if (absFile.match(/\.meta$/)) {
                            fs.stat(absFile, function (err, stat) {
                              if (err)
                                return callback(err);
                              var mtime = null;
                              try {
                                mtime = fileInfo.mtime && new Date(fileInfo.mtime);
                              } catch (e) {
                              }

                              // Out of date?  then process it later
                              if (!mtime || mtime.getTime() != stat.mtime.getTime()) {
                                tasks.push(fileInfo);
                                fileInfo.absFile = absFile;
                                fileInfo.mtime = stat.mtime;
                              }
                            });

                          }
                          callback();
                        }
                      });
                    },
                    callback);
              });
            }

            // If the root folder exists, scan it
            fs.exists(rootDir, function (exists) {
              if (!exists)
                return callback(null);

              // Scan it, and when the entire tree is loaded inspect those files that
              //  need separate processing (eg meta files)
              scanDir(rootDir, function (err) {
                if (err)
                  return callback(err);

                if (tasks.length == 0)
                  return callback(null);

                // inspect all the files that need it
                var identifyQueue = async.queue(function (fileInfo, callback) {
                  fs.readFile(fileInfo.absFile, {encoding: "utf-8"}, function (err, data) {
                    if (err)
                      return callback(err);
                    delete fileInfo.absFile;
                    fileInfo.meta = JSON.parse(data);
                    return callback(null);
                  });
                }, 20);

                identifyQueue.push(tasks);
                identifyQueue.drain = function (err) {
                  callback(err);
                };
              });
            });

          },
          callback);
    },

    updateAllAssets: function(cb) {
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

      async.each(t.__libraries, function(library, cb) {
        var libraryData = db.resources[library.getNamespace()];
        libraryData.forEach(function(resourceName) {
          var fileInfo = libraryData[resourceName];

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
         });

      }, cb);
    },

    /**
     * Collects information about the assets listed in srcPaths;
     * @param srcPaths
     * @param callback
     */
    getAssets: function (srcPaths, callback) {
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
        if (assetPaths[resourceName])
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
        assetPaths[resourceName] = true;
      }

      for (var i = 0; i < srcPaths.length; i++) {
        var srcPath = srcPaths[i];
        var libraryName = srcPath.match(/^([^/]+)/)[0];
        var libraryData = db.resources[libraryName];
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
      if (assets.length == 0) {
        callback(null, []);
        return;
      }

      function findLibrary(name) {
        for (var i = 0; i < t.__libraries.length; i++)
          if (t.__libraries[i].getNamespace() == name)
            return t.__libraries[i];
        return null;
      }

      // For each asset, see if we need to update
      var tasks = [];
      async.forEach(assets,
          function (asset, callback) {
            var fileInfo = asset.fileInfo;
            var library = findLibrary(asset.libraryName);
            var filename = path.join(library.getRootDir(), library.getResourcePath(), asset.filename);

            fs.stat(filename, function (err, stat) {
              if (err)
                return callback(err);

              var mtime = null;
              try {
                mtime = fileInfo.mtime && new Date(fileInfo.mtime);
              } catch (e) {
              }
              if (fileInfo.width === undefined || fileInfo.height === undefined || !mtime || mtime.getTime() != stat.mtime.getTime()) {
                if (/(png|gif|jpg|jpeg)$/.test(filename))
                  tasks.push(asset);
                fileInfo.mtime = stat.mtime;
              }
              callback();
            });
          },
          function (err, results) {
            if (err)
              return callback(err);

            if (tasks.length == 0)
              return callback(err, assets);

            // inspect all the files that need it
            var count = 0;
            var identifyQueue = async.queue(function (asset, callback) {
              var library = findLibrary(asset.libraryName);
              var filename = path.join(library.getRootDir(), library.getResourcePath(), asset.filename);

              if (filename.match(/meta$/)) {
                fs.readFile(filename, {encoding: "utf-8"}, function (err, data) {
                  if (err)
                    return callback(err);
                  asset.fileInfo.meta = JSON.parse(data);
                });
              } else {
                log.trace(t.__imageMagickPrefix + 'identify -format "%G" ' + filename);
                child_process.exec(t.__imageMagickPrefix + 'identify -format "%G" ' + filename, function (err, stdout) {
                  if (err)
                    return callback(err);
                  var match = stdout.match(/([0-9]+)x([0-9]+)/);
                  if (match) {
                    asset.fileInfo.width = parseInt(match[1], 10);
                    asset.fileInfo.height = parseInt(match[2], 10);
                  }
                  if (++count % 25 == 0)
                    log.trace("..." + count + " leaving " + identifyQueue.length());
                  return callback();
                });
              }
            }, 20);

            identifyQueue.push(tasks);
            identifyQueue.drain = function (err) {
              log.trace("updateImageData - drained queue");
              callback(err, assets);
            };
          });
    }
  }
});
