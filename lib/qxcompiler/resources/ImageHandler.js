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
var async = require('async');
var qx = require("qooxdoo");
var util = require("../../util");
var imageSize = require("image-size");
require("./Handler");

var log = util.createLog("resource-manager");

qx.Class.define("qxcompiler.resources.ImageHandler", {
  extend: qxcompiler.resources.Handler,
  
  construct: function() {
    this.base(arguments, /\.(png|gif|jpg|jpeg)$/);
  },
  
  members: {
    needsCompile: function(filename, fileInfo, stat) {
      if (!fileInfo || fileInfo.width === undefined || fileInfo.height === undefined)
        return true;
      return this.base(arguments, filename, fileInfo, stat);
    },
    
    compile: function(filename, library, fileInfo) {
      return new Promise((resolve, reject) => {
        log.trace('Getting size of ' + filename);
        imageSize(filename, function (err, dimensions) {
          if (err) {
            log.warn("Cannot get image size of " + filename + ": " + err);
            return resolve();
            delete fileInfo.width;
            delete fileInfo.height;
          }
          fileInfo.width = dimensions.width;
          fileInfo.height = dimensions.height;
          return resolve();
        });
      });
    }
  }
});
