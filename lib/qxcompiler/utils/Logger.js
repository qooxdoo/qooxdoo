/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2016 Zenesis Limited, http://www.zenesis.com
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

var qx = require("qooxdoo");

require("./LogManager");

qx.Class.define("qxcompiler.utils.Logger", {
  extend: qx.core.Object,

  construct: function(id, minLevel) {
    this.base(arguments);
    this.set({ id: id, minLevel: minLevel });
  },

  properties: {
    id: {
      check: "String"
    },

    minLevel: {
      check: "Integer"
    }
  },

  members: {
    is: function(level) {
      if (typeof level == "string")
        level = qxcompiler.utils.LogManager.getInstance()._levels[level];
      return this.getMinLevel() <= level;
    },

    log: function(level, msg) {
      if (this.is(level)) {
        this._output(level, msg);
      }
    },

    _output: function(level, msg) {
      qxcompiler.utils.LogManager.getInstance().output(this, level, msg);
    },

    trace: function(msg) {
      return this.log("trace", msg);
    },

    debug: function(msg) {
      return this.log("debug", msg);
    },

    info: function(msg) {
      return this.log("info", msg);
    },

    warn: function(msg) {
      return this.log("warn", msg);
    },

    error: function(msg) {
      return this.log("error", msg);
    },

    fatal: function(msg) {
      return this.log("fatal", msg);
    }

  }
});


module.exports = qxcompiler.utils.Logger;
