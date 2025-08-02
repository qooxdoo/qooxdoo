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

/**
 * Abstract base class for JSDoc command parsers
 */
qx.Class.define("qx.tool.compiler.jsdoc.CommandParser", {
  extend: qx.core.Object,
  type: "abstract",

  members: {
    /**
     * Parses the JSDoc command
     *
     * @param {*} jsdoc
     * @param {qx.tool.compiler.jsdoc.ITypeResolver} typeResolver
     */
    parseCommand(pdoc, typeResolver) {
      throw new Error(
        "No implementation for " + this.classname + ".parseCommand"
      );
    }
  }
});
