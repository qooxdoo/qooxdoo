/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
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
const fs = qx.tool.compiler.utils.Promisify.fs;
const path = require("upath");
require("qooxdoo");
const UglifyJS = require("uglify-js");
const crypto = require("crypto");
const sourceMap = require("source-map");

require("./Target");

/**
 * Compiles a "build" application, minified and self contained application
 */
module.exports = qx.Class.define("qx.tool.compiler.targets.BuildTarget", {
  extend: qx.tool.compiler.targets.Target,

  properties: {
    /** Whether to minify the output */
    minify: {
      init: "mangle",
      check: [ "off", "minify", "mangle", "beautify" ],
      nullable: false
    },
    
    /** Whether to preserve unminified output */
    saveUnminified: {
      init: false,
      check: "Boolean",
      nullable: false
    }
  },
  
  events: {
    /**
     * Fired when minification begins, data is a map containing:
     *  application {qx.tool.compiler.app.Application} the app being minified
     *  part: {String} the part being minified
     *  filename: {String} the part filename
     */
    "minifyingApplication": "qx.event.type.Data",
    
    /**
     * Fired when minification begins, data is a map containing:
     *  application {qx.tool.compiler.app.Application} the app being minified
     *  part: {String} the part being minified
     *  filename: {String} the part filename
     */
    "minifiedApplication": "qx.event.type.Data"
  },

  members: {
    /*
     * @Override
     */
    _writeApplication: async function(compileInfo) {
      var t = this;
      var _arguments = arguments;
      var application = compileInfo.application;
      var targetUri = t._getOutputRootUri(application);
      var appRootDir = this.getApplicationRoot(application);
      
      // ResourceUri does not have a trailing "/" because qx.util.ResourceManager.toUri always adds one
      var mapTo = this.getPathMapping(path.join(appRootDir, this.getOutputDir(), "resource"));
      var resourceUri = mapTo ? mapTo : targetUri + "resource";
      
      compileInfo.build = { 
          parts: {}
      };
      await qx.tool.compiler.utils.Promisify.forEachOfSeries(compileInfo.configdata.loader.packages,
          (pkg, pkgId) => {
            compileInfo.build.parts[pkgId] = { 
                uris: pkg.uris,
                hashValue: null,
                modified: true
              };
                                          
            pkg.uris = ["__out__:" + t.getScriptPrefix() + "part-" + pkgId + ".js"];
          });

      var libraries = this.getAnalyser().getLibraries();
      var libraryLookup = {};
      libraries.forEach(function(library) {
        libraryLookup[library.getNamespace()] = library;
        compileInfo.configdata.libraries[library.getNamespace()] = {
          sourceUri: ".",
          resourceUri: resourceUri
        };
      });
      
      await qx.Promise.all([
        t._syncAssets(compileInfo),
        
        async () => {
          let buildJson = path.join(appRootDir, "build-data.json");
          let data = await qx.tool.compiler.utils.Json.loadJsonAsync(buildJson);
          if (data !== null) {
            await fs.unlinkAsync(buildJson).catch(() => {});
            try {
              data = data ? JSON.parse(data) : null;
            } catch (ex) {
              // Nothing
            }
            if (data.parts) {
              for (var pkgId in data.parts) {
                if (compileInfo.build.parts[pkgId]) {
                  compileInfo.build.parts[pkgId].hashValue = data.parts[pkgId].hashValue;
                }
              }
            }
          }
        }
      ])
      .then(() => t.base(_arguments, compileInfo));
    },
    
    _writeBootJs: async function(compileInfo, ws) {
      var t = this;
      var application = compileInfo.application;
      var appRootDir = this.getApplicationRoot(application);
      var transpiledDir = path.join(t.getOutputDir(), "transpiled");

      let promises = qx.tool.compiler.utils.Promisify.eachOf(compileInfo.build.parts, async (part, pkgId) => {
        var tmpFilename = path.join(appRootDir, t.getScriptPrefix() + "part-" + pkgId + "-tmp.js"); 
        var partFilename = path.join(appRootDir, t.getScriptPrefix() + "part-" + pkgId + ".js");
        var mapFilename = path.join(appRootDir, t.getScriptPrefix() + "part-" + pkgId + ".js.map"); 
        var ws = fs.createWriteStream(tmpFilename);
        var hash = crypto.createHash("sha256");
        hash.setEncoding("hex");
        function write(str) {
          hash.write(str);
          ws.write(str);
        }
        
        var generator = new sourceMap.SourceMapGenerator({
          file: mapFilename
        });
        var lineOffset = 0;
        
        await qx.tool.compiler.utils.Promisify.eachSeries(part.uris, async uri => {
          var m = uri.match(/^([^:]+):(.*$)/);
          var namespace = m[1];
          var filename = m[2];
          var origJsFilename;
          var jsFilename;
          if (namespace == "__out__") {
            jsFilename = path.join(appRootDir, filename);
            origJsFilename = path.join(appRootDir, filename);
          } else {
            var lib = t.getAnalyser().findLibrary(namespace);
            origJsFilename = lib.getFilename(filename);
            jsFilename = path.join(transpiledDir, filename);
          }
          var jsMapFilename = jsFilename + ".map";
          var numLines = 0;

          let data = await fs.readFileAsync(jsFilename, "utf8");
          data = data.replace(/\/\/[@#]\ssourceMappingURL[^\r\n]*/g, "//");
          data += "\n";
          write(data);
          for (var i = 0; i < data.length; i++) {
            if (data[i] === "\n") {
              numLines++;
            }
          }
          
          let stat = await qx.tool.compiler.files.Utils.safeStat(jsMapFilename);
          if (stat) {
            data = await fs.readFileAsync(jsMapFilename, "utf8");
            var map = new sourceMap.SourceMapConsumer(data);
            var sourcePath = t.mapToUri(origJsFilename, path.dirname(mapFilename));
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
          }
          
          lineOffset += numLines;
        });

        write("\n//# sourceMappingURL=part-" + pkgId + ".js.map\n");
        ws.end();
        hash.end();
        var hashValue = hash.read();
        let stat = await qx.tool.compiler.files.Utils.safeStat(partFilename);
        if (!stat || hashValue !== part.hashValue) {
          part.hashValue = hashValue;
          part.modified = true;
          await fs.renameAsync(tmpFilename, partFilename);
          await fs.writeFileAsync(mapFilename, generator.toString(), "utf8");
        } else {
          part.modified = false;
          await fs.unlinkAsync(tmpFilename);
        }
      });
      await qx.Promise.all(promises);
    },

    _afterWriteApplication: async function(compileInfo) {
      var uglifyOpts = {
      };
      switch (this.getMinify()) {
      case "off":
        return;
        
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
        if (!compileInfo.build.parts[pkgId] || !compileInfo.build.parts[pkgId].modified) {
          return;
        }
        
        var partJs = path.join(appRootDir, t.getScriptPrefix() + "part-" + pkgId + ".js");
        var partSourceCode = null;
        var partSourceMap = null;
        p = p
          .then(() => fs.readFileAsync(partJs, "utf8").then(data => partSourceCode = data))
          .then(() => qx.tool.compiler.files.Utils.safeUnlink(partJs + ".unminified"))
          .then(() => qx.tool.compiler.files.Utils.safeRename(partJs, partJs + ".unminified"))
          
          .then(() => fs.readFileAsync(partJs + ".map", "utf8").then(data => partSourceMap = data))
          .then(() => qx.tool.compiler.files.Utils.safeUnlink(partJs + ".unminified.map"))
          .then(() => qx.tool.compiler.files.Utils.safeRename(partJs + ".map", partJs + ".unminified.map"))
          
          .then(() => {
            t.fireDataEvent("minifyingApplication", { application: application, part: pkgId, filename: "part-" + pkgId + ".js" });
            uglifyOpts.sourceMap = {
                content: partSourceMap, 
                url: "part-" + pkgId + ".js.map"
              };
            var result = UglifyJS.minify(partSourceCode, uglifyOpts);
            var err = result.error;
            if (err) {
              if (err.name == "SyntaxError") {
                qx.tool.compiler.Console.print("qx.tool.compiler.build.uglifyParseError", err.line, err.col, err.message, "part-" + pkgId + ".js");
              }
              throw new Error("UglifyJS failed to minimise");
            }
            return fs.writeFileAsync(partJs, result.code, { encoding: "utf8" })
              .then(() => {
                if (!t.isSaveUnminified()) {
                  return fs.unlinkAsync(partJs + ".unminified")
                    .then(() => fs.unlinkAsync(partJs + ".unminified.map"));
                }
                return undefined;
              })
              .then(() => fs.writeFileAsync(partJs + ".map", result.map, { encoding: "utf8" }))
              .then(() => t.fireDataEvent("minifiedApplication", { application: application, part: pkgId, filename: "part-" + pkgId + ".js" }));
          });
      });
      var buildDataJson = path.join(appRootDir, "build-data.json");
      await p
        .then(() => qx.tool.compiler.utils.Json.saveJsonAsync(buildDataJson, compileInfo.build));
    },

    /*
     * @Override
     */
    toString: function() {
      return "Build Target: " + this.getOutputDir();
    }
  }
});
