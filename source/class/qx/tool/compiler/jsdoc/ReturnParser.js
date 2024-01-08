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
      let chars = pdoc.body.split("");
      let open = 0;
      let firstInclude;
      let firstExclude;
      for (idx in chars) {
        const current = chars[idx];
        if (current == "{") {
          open++;
          if (!firstInclude) {
            firstInclude = idx + 1;
          }
        }
        if (current == "}") {
          open--;
          if (open === 0 && !firstExclude) {
            firstExclude = idx;
          }
        }
      }
      if (!!firstInclude && !!firstExclude) {
        const match = pdoc.body.slice(firstInclude, firstExclude);
        pdoc.type = typeResolver.resolveType(match.trim());
        pdoc.description = pdoc.body
          .slice(firstExclude)
          .replace(/^[\{\}\s]/, "");
      } else {
        delete pdoc.type;
        delete pdoc.description;
      }
    }
  }
});
