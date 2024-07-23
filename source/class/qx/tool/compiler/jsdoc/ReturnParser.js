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
 * Parser for JSDoc "@return"
 */
qx.Class.define("qx.tool.compiler.jsdoc.ReturnParser", {
  extend: qx.tool.compiler.jsdoc.CommandParser,

  members: {
    /**
     * @Override
     */
    parseCommand(pdoc, typeResolver) {
      const match = qx.tool.compiler.jsdoc.Parser.getTypeExpression(pdoc.body);
      if (match) {
        pdoc.type = typeResolver.resolveType(match.expr.trim());
        pdoc.description = pdoc.body.slice(match.end + 1).replace(/^\s/, "");
      } else {
        delete pdoc.type;
        delete pdoc.description;
      }
    }
  }
});
