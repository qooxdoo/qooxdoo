/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
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
qx.Class.define("qx.tool.utils.Logger", {
  extend: qx.core.Object,

  construct(id, minLevel) {
    super();
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
    is(level) {
      if (typeof level == "string") {
        level = qx.tool.utils.LogManager.getInstance()._levels[level];
      }
      return this.getMinLevel() <= level;
    },

    log(level, msg) {
      if (this.is(level)) {
        this._output(level, msg);
      }
    },

    _output(level, msg) {
      qx.tool.utils.LogManager.getInstance().output(this, level, msg);
    },

    trace(msg) {
      return this.log("trace", msg);
    },

    debug(msg) {
      return this.log("debug", msg);
    },

    info(msg) {
      return this.log("info", msg);
    },

    warn(msg) {
      return this.log("warn", msg);
    },

    error(msg) {
      return this.log("error", msg);
    },

    fatal(msg) {
      return this.log("fatal", msg);
    }
  }
});
