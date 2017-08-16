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

var qx = require("qooxdoo");
require("./CommandParser");

/**
 * Parser for JSDoc "@param"
 */
qx.Class.define("qxcompiler.jsdoc.ParamParser", {
  extend: qxcompiler.jsdoc.CommandParser,
  
  members: {
    parseCommand: function(pdoc, classname, analyser) {
      var m = pdoc.body.match(/^([\S]+)(\s+\{([^}]+)\}(\s+(.+)))??$/);
      if (m) {
        pdoc.paramName = m[1].trim();
        var type = this.resolveType((m[3]||"").trim(), classname, analyser);
        var pos = type.indexOf('?');
        if (pos > -1) {
          pdoc.defaultValue = type.substring(pos + 1).trim();
          type = type.substring(0, pos).trim();
          var segs = type.split('|');
          if (segs.length > 1) {
            type = segs.map((str) => str.trim());
          }
        }
        pdoc.type = type;
        pdoc.description = m[5];
      } else {
        delete pdoc.paramName;
        delete pdoc.type;
        delete pdoc.description;
      }
    }
  }
});
