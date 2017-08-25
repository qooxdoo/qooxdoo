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
var async = require("async");
var path = require("path");
var qx = require("qooxdoo");
var util = require("../../util");

var log = util.createLog("app");

/**
 * Represents a part that the code for an application is to be collected in 
 * (for segmented loading)
 */
qx.Class.define("qxcompiler.app.Part", {
  extend: qx.core.Object,
  
  properties: {
    combine: {
      init: false,
      nullable: false,
      check: "Boolean"
    },
    
    minify: {
      init: false,
      nullable: false,
      check: "Boolean"
    },
    
    classes: {
      nullable: false,
      check: "Array"
    }
  }
});
