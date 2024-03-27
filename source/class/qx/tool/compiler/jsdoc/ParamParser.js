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
qx.Class.define("qx.tool.compiler.jsdoc.ParamParser", {
  extend: qx.tool.compiler.jsdoc.CommandParser,

  members: {
    /**
     * @Override
     */
    parseCommand(pdoc, typeResolver) {
      var m = pdoc.body.match(/^([\S]+)(\s+\{([^}]+)\}([\s\S]+)?)??$/);
      var type;
      if (m) {
        pdoc.paramName = m[1].trim();
        type = typeResolver.resolveType((m[3] || "").trim());
        pdoc.description = m[4];
      } else {
        m = pdoc.body.match(/^(\{([^}]+)\}([\s]+))(\S+)(\s+[\s\S]*)?$/);
        if (m) {
          pdoc.paramName = m[4].trim();
          type = typeResolver.resolveType((m[2] || "").trim());
          pdoc.description = m[5]?.trim() ?? "";
        }
      }
      if (m) {
        var pos = type.indexOf("?");
        if (pos > -1) {
          pdoc.optional = true;
          var tmp = type.substring(pos + 1).trim();
          if (tmp) {
            pdoc.defaultValue = tmp;
          }
          type = type.substring(0, pos).trim();
        }
        var segs = type.split("|");
        if (segs.length > 1) {
          type = segs.map(str => {
            var result;
            str = str.trim();
            var pos = str.indexOf("[]");
            if (pos > -1) {
              var dims = str.substring(pos);
              result = {
                type: str.substring(0, pos)
              };

              var count = 1;
              pos = 0;
              while (dims.length && dims.substring(pos, 2) == "[]") {
                pos += 2;
                count++;
              }
              result.dimensions = count;
            } else {
              result = str;
            }
            return result;
          });
        }
        pdoc.type = type;
      } else {
        delete pdoc.paramName;
        delete pdoc.type;
        delete pdoc.description;
      }
    }
  }
});
