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
const UglifyJS = require("uglify-es");
const crypto = require("crypto");
const sourceMap = require("source-map");

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
            var partFilename = path.join(appRootDir, t.getScriptPrefix(), "part-" + pkgId + ".js");
            var mapFilename = path.join(appRootDir, t.getScriptPrefix(), "part-" + pkgId + ".js.map"); 
            var ws = fs.createWriteStream(tmpFilename);
            var hash = crypto.createHash('sha256');
            hash.setEncoding('hex');
            function write(str) {
              hash.write(str);
              ws.write(str);
            }
            
            var generator = new sourceMap.SourceMapGenerator({
              file: mapFilename
            });
            var lineOffset = 0;
            
            async.eachSeries(part.uris,
                function (uri, cb) {
                  var m = uri.match(/^([^:]+):(.*$)/);
                  var namespace = m[1];
                  var filename = m[2];
                  if (namespace == "__out__") {
                    var jsFilename = path.join(appRootDir, filename);
                    var origJsFilename = path.join(appRootDir, filename);
                  } else {
                    var lib = t.getAnalyser().findLibrary(namespace);
                    var origJsFilename = lib.getFilename(filename);
                    var jsFilename = path.join(transpiledDir, filename);
                  }
                  var jsMapFilename = jsFilename + ".map";
                  var numLines = 0;

                  var p = fs.readFileAsync(jsFilename, "utf8")
                    .then((data) => {
                      data = data.replace(/\/\/[@#]\ssourceMappingURL[^\r\n]*/g, '//');
                      data += "\n";
                      write(data);
                      for (var i = 0; i < data.length; i++)
                        if (data[i] === '\n')
                          numLines++;
                    })
                    .then(() => qxcompiler.files.Utils.safeStat(jsMapFilename))
                    .then(stat => {
                      if (!stat)
                        return;
                      return fs.readFileAsync(jsMapFilename, "utf8")
                        .then((data) => {
                          var map = new sourceMap.SourceMapConsumer(data);
                          var sourcePath = path.relative(path.dirname(mapFilename), origJsFilename);
                          map.eachMapping(function(mapping) {
                            mapping = {
                              generated: {
                                line: mapping.generatedLine + lineOffset,
                                column: mapping.generatedColumn
                              },
                              original: {
                                line: mapping.originalLine || 1,
                                column: mapping.originalColumn || 1
                              },
                              source: sourcePath
                            };
                            return generator.addMapping(mapping);
                          });
                        });
                    })
                    .then(() => lineOffset += numLines)
                    .then(() => cb()).catch(cb);
                },
                function (err) {
                  if (err)
                    return cb(err);
                  write("\n//# sourceMappingURL=part-" + pkgId + ".js.map\n");
                  ws.end();
                  hash.end();
                  var hashValue = hash.read();
                  return Promise.resolve()
                    .then(() => qxcompiler.files.Utils.safeStat(partFilename))
                    .then((stat) => {
                      if (!stat || hashValue !== part.hashValue) {
                        part.hashValue = hashValue;
                        part.modified = true;
                        return fs.renameAsync(tmpFilename, partFilename)
                          .then(() => fs.writeFileAsync(mapFilename, generator.toString(), "utf8"));
                      } else {
                        part.modified = false;
                        return fs.unlinkAsync(tmpFilename, cb);
                      }
                    })
                    .then(() => cb()).catch(cb);
                });
          }, 
          cb);
    },

    _afterWriteApplication: function(compileInfo, cb) {
      var uglifyOpts = {
      };
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
      Object.keys(compileInfo.configdata.loader.packages).forEach(pkgId => {
        var package = compileInfo.configdata.loader.packages[pkgId];
        if (!compileInfo.build.parts[pkgId] || !compileInfo.build.parts[pkgId].modified)
          return;
        
        var partJs = path.join(appRootDir, t.getScriptPrefix() + "part-" + pkgId + ".js");
        var partSourceCode = null;
        var partSourceMap = null;
        p = p
          .then(() => fs.readFileAsync(partJs, "utf8").then(data => partSourceCode = data))
          .then(() => qxcompiler.files.Utils.safeUnlink(partJs + ".uncompressed"))
          .then(() => qxcompiler.files.Utils.safeRename(partJs, partJs + ".uncompressed"))
          
          .then(() => fs.readFileAsync(partJs + ".map", "utf8").then(data => partSourceMap = data))
          .then(() => qxcompiler.files.Utils.safeUnlink(partJs + ".uncompressed.map"))
          .then(() => qxcompiler.files.Utils.safeRename(partJs + ".map", partJs + ".uncompressed.map"))
          
          .then(() => {
            t.fireDataEvent("minifyingApplication", { application: application, part: pkgId, filename: "part-" + pkgId + ".js" });
            uglifyOpts.sourceMap = {
                content: partSourceMap, 
                url: "part-" + pkgId + ".js.map"
              };
            var result = UglifyJS.minify(partSourceCode, uglifyOpts);
            if (result.error)
              throw result.error;
            return fs.writeFileAsync(partJs, result.code, { encoding: "utf8" })
              .then(() => fs.unlinkAsync(partJs + ".uncompressed"))
              .then(() => fs.unlinkAsync(partJs + ".uncompressed.map"))
              .then(() => fs.writeFileAsync(partJs + ".map", result.map, { encoding: "utf8" }))
              .then(() => t.fireDataEvent("minifiedApplication", { application: application, part: pkgId, filename: "part-" + pkgId + ".js" }));
          });
      });
    },

    /*
     * @Override
     */
    toString: function() {
      return "Build Target: " + this.getOutputDir();
    }
  }
});
