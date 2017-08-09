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

var path = require("path");
var util = require("../../util");
var log = util.createLog("app");

qx.Class.define("qxcompiler.app.ServerApplication", {
  extend: qxcompiler.app.Application,
  
  properties: {
    theme: {
      init: null,
      refine: true
    }
  },
  
  members: {
    /**
     * Returns the application boot loader template to use
     */
    getLoaderTemplate: function() {
      return path.join(__dirname, "ServerApplication-loader.tmpl.js");
    }    
  }

});