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

var path = require("upath");
require("qooxdoo");

require("./Target");

/**
 * Compiles a target where source files and resources are loaded in place
 */
module.exports = qx.Class.define("qx.tool.compiler.targets.SourceTarget", {
  extend: qx.tool.compiler.targets.Target,

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
    _writeApplication: async function(compileInfo) {
      var t = this;
      var application = compileInfo.application;
      
      var targetUri = t._getOutputRootUri(application);
      var appRootDir = this.getApplicationRoot(application);


      var mapTo = this.getPathMapping(path.join(appRootDir, this.getOutputDir(), "transpiled"));
      var sourceUri = mapTo ? mapTo : targetUri + "transpiled";
      mapTo = this.getPathMapping(path.join(appRootDir, this.getOutputDir(), "resource"));
      var resourceUri = mapTo ? mapTo : targetUri + "resource";
      

      var libraries = this.getAnalyser().getLibraries();
      var libraryLookup = {};
      libraries.forEach(function(library) {
        libraryLookup[library.getNamespace()] = library;

        compileInfo.configdata.libraries[library.getNamespace()] = {
          sourceUri: sourceUri,
          resourceUri: resourceUri
        };
      });

      var _arguments = arguments;
      if (this.getCopyResources()) {
        await t._syncAssets(compileInfo)
          .then(() => t.base(_arguments, compileInfo));
      } else {
        await t.base(_arguments, compileInfo);
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
