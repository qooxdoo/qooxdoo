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

require("./SourceTarget");

/**
 * Extends SourceTarget to dump out information about the build into JSON files
 * so that they can be inspected by the unit tests
 */
qx.Class.define("qxcompiler.targets.SelfTestTarget", {
  extend: qxcompiler.targets.SourceTarget,
  
  members: {
    /*
     * @Override
     */
    _writeApplication: function(compileInfo, cb) {
      var t = this;
      var application = compileInfo.application;
      var appRootDir = this._getApplicationRoot(application);
      var outputDir = path.join(appRootDir, t.getScriptPrefix());
      
      this.base(arguments, compileInfo, function(err) {
        var MAP = {
            EnvSettings: compileInfo.configdata.environment,
            Libinfo: compileInfo.configdata.libraries,
            UrisBefore: compileInfo.configdata.urisBefore,
            CssBefore: compileInfo.configdata.cssBefore,
            Assets: compileInfo.assets,
            Parts: compileInfo.parts
          };

        fs.writeFileSync(path.join(outputDir, "compile-info.json"), JSON.stringify(MAP, null, 2) + "\n", { encoding: "utf8" });
        fs.writeFileSync(path.join(outputDir, "resources.json"), JSON.stringify(compileInfo.pkgdata, null, 2) + "\n", { encoding: "utf8" });
        
        cb();
      });
    }
  }
});
