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
 *      * Henner Kollmann (henner.kollmann@gmx.de)
 *
 * *********************************************************************** */

var path = require("upath");

qx.Class.define("qx.tool.compiler.resources.ScssIncludeConverter", {
  extend: qx.tool.compiler.resources.ResourceConverter,

  members: {
    matches(filename) {
      filename = path.basename(filename);
      return filename[0] == "_" && filename.endsWith(".scss");
    },
    
    isDoNotCopy(filename) {
      if (qx.tool.compiler.resources.ScssConverter.COPY_ORIGINAL_FILES) {
        return false; 
      }
      return true;
    },
    
    async convert(target, asset, srcFilename, destFilename, isThemeFile) {
      await qx.tool.utils.files.Utils.copyFile(srcFilename, destFilename);
    }
  }
});
