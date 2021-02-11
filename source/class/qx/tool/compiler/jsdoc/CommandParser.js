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
 * Abstract base class for JSDoc command parsers
 */
qx.Class.define("qx.tool.compiler.jsdoc.CommandParser", {
  extend: qx.core.Object,
  type: "abstract",
  
  members: {
    parseCommand: function(pdoc, classname, analyser) {
      throw new Error("No implementation for " + this.classname + ".parseCommand");
    },
    
    resolveType: function(type, classname, analyser) {
      if (type) {
        var pos = type.indexOf(".");
        if (pos < 0) {
          pos = classname.lastIndexOf(".");
          if (pos > -1) {
            var pkg = classname.substring(0, pos + 1);
            if (analyser) {
              var match = analyser.getCachedClassInfo(pkg + type);
              if (match) {
                return pkg + type; 
              }
            }
          }
        }
      }
      return type;
    }
    
  }
});
