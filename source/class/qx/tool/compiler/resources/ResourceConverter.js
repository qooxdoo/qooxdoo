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
 * Instances of ResourceConverter are used by the resource manager to transfer resources into
 * the target output, where they require something more than just copying (eg SCSS compilation)
 */
qx.Class.define("qx.tool.compiler.resources.ResourceConverter", {
  extend: qx.tool.compiler.resources.AbstractMatcher,
  type: "abstract",

  members: {
    /**
     * Allows the converter to decide to not copy the resource at all
     */
    isDoNotCopy(filename) {
      return false;
    },

    /**
     * Detects whether the file needs to be recompiled/coverted/analysed/ etc, and is done after
     * checks determine whether the file datetime stamp indicate it's necessary
     *
     * @param target {qx.tool.compiler.targets.Target} the target
     * @param asset {qx.tool.compiler.resources.Asset} the asset to copy
     * @param srcFilename {String} full path to the file
     * @param destFilename {String} full path to the destination file
     * @param isThemeFile {Boolean} true if the file is a theme file (as opposed to a normal resource file)
     *
     * @return {Boolean}
     */
    async needsConvert(target, asset, srcFilename, destFilename, isThemeFile) {
      return false;
    },

    /**
     * Returns the destination filename, or null if default is to be used
     *
     * @param target {qx.tool.compiler.targets.Target} the target
     * @param asset {qx.tool.compiler.resources.Asset} the asset to copy
     * @return {String?} full path to the file
     */
    getDestFilename(target, asset) {
      return null;
    },

    /**
     * Allows a file to be recompiled/coverted/analysed/ etc; must return a Promise which resolves
     * when complete.  Data can be stored in the resource database by modifying the fileInfo
     *
     * @param target {qx.tool.compiler.targets.Target} the target
     * @param asset {qx.tool.compiler.resources.Asset} the asset to copy
     * @param srcFilename {String} full path to the file
     * @param destFilename {String} full path to the destination file
     * @param isThemeFile {Boolean} whether the file is in a theme
     * @return {String[]} list of filenames that are required for the compilation (dependencies); may be null
     */
    async compile(target, asset, srcFilename, destFilename, isThemeFile) {
      throw new Error("No implementation for " + this.classname + ".convert");
    }
  }
});
