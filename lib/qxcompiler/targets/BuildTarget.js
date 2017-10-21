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
var qx = require("qooxdoo");
var async = require("async");
var util = require("../../util");
var UglifyJS = require("uglify-js");

var log = util.createLog("target");

require("./Target");

/**
 * Compiles a "build" application, minified and self contained application
 */
module.exports = qx.Class.define("qxcompiler.targets.BuildTarget", {
  extend: qxcompiler.targets.Target,

  properties: {
    /** Whether to minify the output */
    minify: {
      init: "mangle",
      check: [ "off", "minify", "mangle", "beautify" ],
      nullable: false,
      check: "String"
    }
  },

  members: {
    /*
     * @Override
     */
    _writeApplication: function(compileInfo, cb) {
      var t = this;
      var _arguments = arguments;
      var application = compileInfo.application;
      var targetUri = t._getOutputRootUri(application);
      
      compileInfo.build = { partUris: {} };
      async.forEachOfSeries(compileInfo.configdata.loader.packages,
          function(package, pkgId, cb) {
            var uris = compileInfo.build.partUris[pkgId] = package.uris;
            package.uris = ["__out__:part-" + pkgId + ".js"];
          });

      var libraries = this.getAnalyser().getLibraries();
      var libraryLookup = {};
      libraries.forEach(function(library) {
        libraryLookup[library.getNamespace()] = library;
        compileInfo.configdata.libraries[library.getNamespace()] = {
          sourceUri: ".",
          resourceUri: targetUri + "resource"
        };
      });

      this._syncAssets(compileInfo, function(err) {
        if (err)
          return cb(err);
        t.base(_arguments, compileInfo, cb);
      });
    },
    
    _writeBootJs: function(compileInfo, ws, cb) {
      var t = this;
      var application = compileInfo.application;
      var appRootDir = this.getApplicationRoot(application);
      var transpiledDir = path.join(t.getOutputDir(), "transpiled");
      var targetUri = t._getOutputRootUri(application);

      async.eachOf(compileInfo.build.partUris, 
          function(uris, pkgId) {
            var ws = fs.createWriteStream(appRootDir + "/" + t.getScriptPrefix() + "part-" + pkgId + ".js");
            async.eachSeries(uris,
                function (uri, cb) {
                  var m = uri.match(/^([^:]+):(.*$)/);
                  var namespace = m[1];
                  var filename = m[2];
                  var rs = fs.createReadStream(path.join(namespace == "__out__" ? appRootDir : transpiledDir, filename));
                  rs.on('end', function () {
                    ws.write("\n");
                    cb();
                  });
                  rs.on('data', function (chunk) {
                    ws.write(chunk);
                  });
                },
                function (err) {
                  if (err)
                    return cb(err);
                  ws.end();
                  cb();
                });
          }, 
          cb);
    },

    _afterWriteApplication: function(compileInfo, cb) {
      var uglifyOpts = {};
      switch (this.getMinify()) {
      case "off":
        return cb();
        
      case "minify":
        uglifyOpts.mangle = false;
        break;
        
      case "beautify":
        uglifyOpts.mangle = false;
        uglifyOpts.output = {
            beautify: true
        };
        break;
        
      case "mangle":
        uglifyOpts.mangle = true;
        break;
      }
        
      var t = this;
      var application = compileInfo.application;
      var appRootDir = this.getApplicationRoot(application);
      
      console.log("Begining minification - this can take some time");
      async.forEachOfSeries(compileInfo.configdata.loader.packages, 
          (package, pkgId, cb) => {
            var partJs = appRootDir + t.getScriptPrefix() + "part-" + pkgId + ".js";
            var uncompressedJs = appRootDir + t.getScriptPrefix() + "uncompressed-" + pkgId + ".js";
            fs.unlink(uncompressedJs, function(err) {
              if (err && err.code != "ENOENT")
                return cb(err);
              fs.rename(partJs, uncompressedJs, function(err) {
                if (err)
                  return cb(err);
                console.log("Minifying " + application.getName() + " part-" + pkgId + ".js");
                var result = UglifyJS.minify(uncompressedJs, uglifyOpts);
                fs.writeFile(partJs, result.code, { encoding: "utf8" }, function(err) {
                  if (err)
                    return cb(err);
                  fs.unlink(uncompressedJs, cb);
                });
              });
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
