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
/**
 * Parser for JSDoc "@return"
 */
qx.Class.define("qx.tool.compiler.jsdoc.ThrowsParser", {
  extend:qx.tool.compiler.jsdoc.CommandParser,

  members: {
    parseCommand: function(pdoc, classname, analyser) {
      var m = pdoc.body.match(/^(\{([^}]+)\}([\s\S]+)?)?$/);
      if (m) {
        pdoc.type = this.resolveType((m[2]||"").trim(), classname, analyser);
        pdoc.description = m[3]||"";
      } else {
        delete pdoc.type;
        delete pdoc.description;
      }
    }
  }
});
