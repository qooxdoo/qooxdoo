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

var fs = require("fs");
var path = require("path");
var async = require('async');
require("qooxdoo");
var util = require("../util");
var jsonlint = require("jsonlint");
require("./Handler");

var log = util.createLog("resource-manager");

qx.Class.define("qx.tool.compiler.resources.MetaHandler", {
  extend: qx.tool.compiler.resources.Handler,
  
  construct: function() {
    this.base(arguments, /\.meta$/);
  },
  
  members: {
    compile: function(filename, library, fileInfo) {
      return new Promise((resolve, reject) => {
        fs.readFile(filename, { encoding: "utf-8" }, function (err, data) {
          if (err)
            return reject(err);
          fileInfo.meta = jsonlint.parse(data);
          resolve();
        });
      });
    }
  }
});
