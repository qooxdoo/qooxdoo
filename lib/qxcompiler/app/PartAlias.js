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
 * The client can instruct the part loader to load classes based on an alias, this class
 * represents one of those aliases to class names mapping
 */
qx.Class.define("qxcompiler.app.PartAlias", {
  extend: qx.core.Object,
  
  construct: function(name, classes) {
    this.base(arguments);
    this.set({
      name: name,
      classes: classes
    });
  }
  
  properties: {
    name: {
      nullable: false,
      check: "String"
    },
    
    classes: {
      nullable: false,
      check: "Array"
    }
  }
});
