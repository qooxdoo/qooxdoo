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
var path = require("path");
var qx = require("qooxdoo");
var async = require("async");
var util = require("../../util");

var log = util.createLog("target");

require("./Target");

/**
 * Compiles a "hybrid" application, where libraries are compiled into as small a number
 * of files as possible to reduce load time with the exception of classes which match
 * a given specification; resources are left in their normal place
 */
qx.Class.define("qxcompiler.targets.HybridTarget", {
  extend: qxcompiler.targets.Target,

  members: {
    /*
     * @Override
     */
    _writeApplication: function(compileInfo, cb) {
      var t = this;
      var _arguments = arguments;

      var application = compileInfo.application;
      var analyser = this.getAnalyser();

      this.getAnalyser().getLibraries().forEach(function (library) {
        var libraryUri = t.getUri(library.getNamespace());
        if (!libraryUri) {
          libraryUri = path.relative(t.getOutputDir() + "/", library.getRootDir());
        }

        compileInfo.configdata.libraries[library.getNamespace()] = {
          sourceUri: libraryUri + "/" + library.getSourcePath(),
          resourceUri: libraryUri + "/" + library.getResourcePath()
        };
      });

      async.forEachOfSeries(compileInfo.configdata.loader.packages,
          function(package, pkgId, cb) {
            var uris = package.uris;
            package.uris = [];

            var ws = null;
            var currentNamespace = null;
            var index = 0;
            async.eachSeries(uris,
                function (uri, cb) {
                  var m = uri.match(/^([^:]+):(.*$)/);
                  var namespace = m[1];
                  var filename = m[2];
                  if (namespace == "__out__") {
                    package.uris.push("__out__:" + filename);
                    return cb();
                  }
                  var library = analyser.findLibrary(namespace);
                  if (!library)
                    return cb(new Error("Cannot find library with namespace " + namespace));
                  if (!currentNamespace || currentNamespace != namespace) {
                    if (ws) {
                      ws.end();
                    }
                    var outputFilename = t.getScriptPrefix() + "combined-" + pkgId + "-" + (++index) + ".js";
                    ws = fs.createWriteStream(t.getOutputDir() + "/" + application.getName() + "/" + outputFilename);
                    package.uris.push("__out__:" + outputFilename);
                    currentNamespace = namespace;
                  }
                  var rs = fs.createReadStream(library.getRootDir() + "/" + library.getSourcePath() + "/" + filename);
                  rs.on('end', function () {
                    ws.write("\n");
                    cb();
                  });
                  rs.on('data', function (chunk) {
                    ws.write(chunk);
                  });
                },
                function (err) {
                  if (ws)
                    ws.end();
                  cb(err);
                });
          },
          function(err) {
            if (err)
              return cb(err);
            t.base(_arguments, compileInfo, cb);
          });
    },

    /*
     * @Override
     */
    toString: function() {
      return "Hybrid Target: " + this.getOutputDir();
    }
  }
});

module.exports = qxcompiler.targets.HybridTarget;

