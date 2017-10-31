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

require("../utils/Promisify");
const fs = qxcompiler.utils.Promisify.fs;
const path = require("path");
const qx = require("qooxdoo");
const async = require("async");
const util = require("../../util");
const UglifyJS = require("uglify-js");
const crypto = require("crypto");

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
  
  events: {
    /**
     * Fired when minification begins, data is a map containing:
     *  application {qxcompiler.app.Application} the app being minified
     *  part: {String} the part being minified
     *  filename: {String} the part filename
     */
    "minifyingApplication": "qx.event.type.Data",
    
    /**
     * Fired when minification begins, data is a map containing:
     *  application {qxcompiler.app.Application} the app being minified
     *  part: {String} the part being minified
     *  filename: {String} the part filename
     */
    "minifiedApplication": "qx.event.type.Data"
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
      var appRootDir = this.getApplicationRoot(application);
      
      compileInfo.build = { 
          parts: {}
      };
      async.forEachOfSeries(compileInfo.configdata.loader.packages,
          function(package, pkgId, cb) {
            var uris = compileInfo.build.parts[pkgId] = { 
                uris: package.uris,
                hashValue: null,
                modified: true
              };
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

      async.parallel(
          [
            (cb) => { t._syncAssets(compileInfo, cb) },
            (cb) => {
              var buildJson = path.join(appRootDir, "build-data.json");
              fs.readFile(buildJson, "utf8", (err, data) => {
                if (err && err.code != "ENOENT")
                  return cb(err);
                // Delete the file immediately so that if the build fails it does not hang around with
                //  incorrect data
                fs.unlink(buildJson, (err) => {
                  if (err && err.code != "ENOENT")
                    return cb(err);
                  try {
                    data = data ? JSON.parse(data) : null;
                  } catch(ex) {
                    // Nothing
                  }
                  if (data && data.parts) {
                    for (var pkgId in data.parts)
                      if (compileInfo.build.parts[pkgId])
                        compileInfo.build.parts[pkgId].hashValue = data.parts[pkgId].hashValue;
                  }
                  cb();
                });
              });
            }
          ],
          (err) => {
            if (err)
              return cb(err);
            t.base(_arguments, compileInfo, cb)
          });
    },
    
    _writeBootJs: function(compileInfo, ws, cb) {
      var t = this;
      var application = compileInfo.application;
      var appRootDir = this.getApplicationRoot(application);
      var transpiledDir = path.join(t.getOutputDir(), "transpiled");
      var targetUri = t._getOutputRootUri(application);

      async.eachOf(compileInfo.build.parts, 
          function(part, pkgId, cb) {
            var tmpFilename = path.join(appRootDir, t.getScriptPrefix(), "part-" + pkgId + "-tmp.js"); 
            var ws = fs.createWriteStream(tmpFilename);
            var hash = crypto.createHash('sha256');
            hash.setEncoding('hex');
            async.eachSeries(part.uris,
                function (uri, cb) {
                  var m = uri.match(/^([^:]+):(.*$)/);
                  var namespace = m[1];
                  var filename = m[2];
                  var rs = fs.createReadStream(path.join(namespace == "__out__" ? appRootDir : transpiledDir, filename));
                  rs.on('end', function () {
                    hash.write("\n");
                    ws.write("\n");
                    cb();
                  });
                  rs.on('data', function (chunk) {
                    hash.write(chunk);
                    ws.write(chunk);
                  });
                },
                function (err) {
                  if (err)
                    return cb(err);
                  ws.end();
                  hash.end();
                  var hashValue = hash.read();
                  if (hashValue !== part.hashValue) {
                    part.hashValue = hashValue;
                    part.modified = true;
                    fs.rename(tmpFilename, path.join(appRootDir, t.getScriptPrefix(), "part-" + pkgId + ".js"), cb);
                  } else {
                    part.modified = false;
                    fs.unlink(tmpFilename, cb);
                  }
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
      
      var p = Promise.resolve();
      for (var pkgId in compileInfo.configdata.loader.packages) {
        var package = compileInfo.configdata.loader.packages[pkgId];
        if (!compileInfo.build.parts[pkgId].modified)
          continue;
        var partJs = path.join(appRootDir, t.getScriptPrefix() + "part-" + pkgId + ".js");
        var uncompressedJs = path.join(appRootDir, t.getScriptPrefix() + "uncompressed-" + pkgId + ".js");
        p = p
          .then(() => qxcompiler.files.Utils.safeUnlink(uncompressedJs))
          .then(() => {
            var p = fs.renameAsync(partJs, uncompressedJs);
            return p.catch((err) => { 
                if (err && err.code != "ENOENT")
                  throw err;
              });
          })
          .then(() => {
            t.fireDataEvent("minifyingApplication", { application: application, part: pkgId, filename: "part-" + pkgId + ".js" });
            var result = UglifyJS.minify(uncompressedJs, uglifyOpts);
            return fs.writeFileAsync(partJs, result.code, { encoding: "utf8" })
              .then(() => {
                t.fireDataEvent("minifiedApplication", { application: application, part: pkgId, filename: "part-" + pkgId + ".js" });
                return fs.unlinkAsync(uncompressedJs);
              });
          });
      }
      
      var buildDataJson = path.join(appRootDir, "build-data.json");
      p = p
        .then(() => fs.writeFileAsync(buildDataJson, JSON.stringify(compileInfo.build, null, 2), "utf8"));
      p.then(cb).catch((err) => cb(err)); 
    },

    /*
     * @Override
     */
    toString: function() {
      return "Build Target: " + this.getOutputDir();
    }
  }
});
