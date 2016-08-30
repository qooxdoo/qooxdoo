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
 * Compiles a target where source files and resources are loaded in place
 */
module.exports = qx.Class.define("qxcompiler.targets.SourceTarget", {
  extend: qxcompiler.targets.Target,

  properties: {
    /**
     * Whether to copy resources in source builds.
     */
    copyResources: {
      check: "Boolean",
      init: false
    }
  },

  members: {
    /*
     * @Override
     */
    _writeApplication: function(compileInfo, cb) {
      var t = this;
      var application = compileInfo.application;


      if (!this.getCopyResources()) {
        this.getAnalyser().getLibraries().forEach(function (library) {
          var targetUri = t.getTargetUri()||"";
          if (targetUri && !targetUri.match(/\/$/))
            targetUri += "/";
          var libraryUri = t.getUri(library.getNamespace());
          if (!libraryUri) {
            libraryUri = path.relative(t.getOutputDir() + "/", library.getRootDir()) + "/";
          }

          compileInfo.configdata.libraries[library.getNamespace()] = {
            sourceUri: targetUri + "transpiled/",
            resourceUri: targetUri + libraryUri + "/" + library.getResourcePath()
          };
        });

        this.base(arguments, compileInfo, cb);
      } else {
        var _arguments = arguments;
        var libraries = this.getAnalyser().getLibraries();
        var libraryLookup = {};
        libraries.forEach(function(library) {
          libraryLookup[library.getNamespace()] = library;

          var targetUri = t.getTargetUri()||"";
          if (targetUri && !targetUri.match(/\/$/))
            targetUri += "/";

          compileInfo.configdata.libraries[library.getNamespace()] = {
            sourceUri: targetUri + "transpiled/",
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
          t.base(_arguments, compileInfo, cb);
        };
        queue.push(compileInfo.assets);
      }
    },

    /*
     * @Override
     */
    toString: function() {
      return "Source Target: " + this.getOutputDir();
    }
  }
});
