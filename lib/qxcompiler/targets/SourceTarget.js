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
      init: true
    }
  },

  members: {
    /*
     * @Override
     */
    _writeApplication: function(compileInfo, cb) {
      var t = this;
      var application = compileInfo.application;
      var targetUri = t._getOutputRootUri(application);

      var libraries = this.getAnalyser().getLibraries();
      var libraryLookup = {};
      libraries.forEach(function(library) {
        libraryLookup[library.getNamespace()] = library;

        compileInfo.configdata.libraries[library.getNamespace()] = {
          sourceUri: targetUri + "transpiled",
          resourceUri: targetUri + "resource"
        };
      });

      var _arguments = arguments;
      if (this.getCopyResources()) {
        t._syncAssets(compileInfo, function(err) {
          if (err)
            return cb(err);
          t.base(_arguments, compileInfo, cb);
        });
      } else {
        t.base(_arguments, compileInfo, cb);
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
