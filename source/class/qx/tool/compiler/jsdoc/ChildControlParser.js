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
 * Parser for JSDoc "@param"
 */
qx.Class.define("qx.tool.compiler.jsdoc.ChildControlParser", {
  extend: qx.tool.compiler.jsdoc.CommandParser,

  members: {
    /**
     * @Override
     */
    parseCommand(pdoc, typeResolver) {
      var m = pdoc.body.match(/^([\S]+)(\s+\{([^}]+)\}([\s\S]+))??$/);
      if (m) {
        pdoc.controlName = m[1].trim();
        var type = this.resolveType((m[3] || "").trim(), typeResolver);
        pdoc.description = (m[4] || "").trim();
        pdoc.type = type;
      } else {
        delete pdoc.controlName;
        delete pdoc.type;
        delete pdoc.description;
      }
    }
  }
});
