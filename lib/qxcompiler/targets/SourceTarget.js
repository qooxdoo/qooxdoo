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

  members: {
    /*
     * @Override
     */
    _writeApplication: function(compileInfo, cb) {
      var t = this;
      var application = compileInfo.application;

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
    },

    /*
     * @Override
     */
    toString: function() {
      return "Source Target: " + this.getOutputDir();
    }
  }
});



