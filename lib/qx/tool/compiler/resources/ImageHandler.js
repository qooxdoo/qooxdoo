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
 * *********************************************************************** */

require("@qooxdoo/framework");
var util = require("../util");
var imageSize = require("image-size");
require("./Handler");

var log = util.createLog("resource-manager");

qx.Class.define("qx.tool.compiler.resources.ImageHandler", {
  extend: qx.tool.compiler.resources.Handler,
  
  construct: function() {
    this.base(arguments, /\.(png|gif|jpg|jpeg)$/);
  },
  
  members: {
    needsCompile: function(filename, fileInfo, stat) {
      if (!fileInfo || fileInfo.width === undefined || fileInfo.height === undefined) {
        return true; 
      }
      return this.base(arguments, filename, fileInfo, stat);
    },
    
    compile: function(filename, library, fileInfo) {
      return new Promise((resolve, reject) => {
        log.trace("Getting size of " + filename);
        imageSize(filename, function(err, dimensions) {
          if (err) {
            log.warn("Cannot get image size of " + filename + ": " + err);
            delete fileInfo.width;
            delete fileInfo.height;
            resolve();
            return;
          }
          fileInfo.width = dimensions.width;
          fileInfo.height = dimensions.height;
          resolve();
        });
      });
    }
  }
});
