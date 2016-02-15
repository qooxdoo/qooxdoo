/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2013 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

var fs = require("fs");
var qx = require("qooxdoo");
var async = require("async");
var util = require("../../util");

var log = util.createLog("target");

require("./Target");

/**
 * Compiles a "build" application, minified and self contained application
 */
module.exports = qx.Class.define("qxcompiler.targets.BuildTarget", {
  extend: qxcompiler.targets.Target,

  members: {
    _packageUris: null,

    /*
     * @Override
     */
    _writeApplication: function(assets, cb) {
      var _arguments = arguments;
      var t = this;
      t._packageUris = {};
      async.forEachOfSeries(t._configdata.loader.packages,
          function(package, pkgId, cb) {
            var uris = t._uris;
            t._packageUris[pkgId] = package.uris;
            package.uris = [];
          });

      var libraries = this.getApplication().getAnalyser().getLibraries();
      var libraryLookup = {};
      libraries.forEach(function(library) {
        libraryLookup[library.getNamespace()] = library;
        t._configdata.libraries[library.getNamespace()] = {
          sourceUri: "script",
          resourceUri: "resource"
        };
      });

      var queue = async.queue(
          function(asset, cb) {
            var library = libraryLookup[asset.libraryName];
            qxcompiler.files.Utils.sync(
                library.getRootDir() + "/" + library.getResourcePath() + "/" + asset.filename,
                t.getOutputDir() + "/resource/" + asset.filename,
                cb);
          },
          100
      );
      queue.drain = function(err) {
        if (err)
          return cb(err);
        t.base(_arguments, assets, cb);
      };
      queue.push(assets);
    },

    /*
     * @Override
     */
    _writeBootJs: function(writeStream, cb) {
      var t = this;
      var analyser = this.getApplication().getAnalyser();

      async.forEachOfSeries(t._packageUris,
          function(uris, pkgId, cb) {
            async.eachSeries(uris,
                function (uri, cb) {
                  var m = uri.match(/^([^:]+):(.*$)/);
                  var namespace = m[1];
                  var path = m[2];
                  var rs = null;
                  if (namespace == "__out__")
                    rs = fs.createReadStream(t.getOutputDir() + "/script/" + path);
                  else
                    rs = fs.createReadStream(t.getOutputDir() + "/transpiled/" + path);
                  rs.on('end', function () {
                    writeStream.write("\n");
                    cb();
                  });
                  rs.on('data', function (chunk) {
                    writeStream.write(chunk);
                  });
                },
                function (err) {
                  if (err)
                    return cb(err);
                  cb();
                });
          },
          cb);
    },

    /*
     * @Override
     */
    toString: function() {
      return "Build Target: " + this.getOutputDir();
    }
  }
});


