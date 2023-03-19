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

var imageSize = qx.tool.utils.Promisify.promisify(require("image-size"));

var log = qx.tool.utils.LogManager.createLog("resource-manager");

qx.Class.define("qx.tool.compiler.resources.ImageLoader", {
  extend: qx.tool.compiler.resources.ResourceLoader,

  construct() {
    super([".png", ".gif", ".jpg", ".jpeg", ".svg"]);
  },

  members: {
    /**
     * @Override
     */
    needsLoad(filename, fileInfo, stat) {
      if (
        !fileInfo ||
        fileInfo.width === undefined ||
        fileInfo.height === undefined
      ) {
        return true;
      }
      return super.needsLoad(filename, fileInfo, stat);
    },

    /**
     * @Override
     */
    matches(filename, library) {
      if (library.isFontAsset(filename)) {
        return false;
      }

      return super.matches(filename, library);
    },

    /**
     * @Override
     */
    async load(asset) {
      let filename = asset.getSourceFilename();
      let fileInfo = asset.getFileInfo();
      log.trace("Getting size of " + filename);
      try {
        let dimensions = await imageSize(filename);
        fileInfo.width = dimensions.width;
        fileInfo.height = dimensions.height;
      } catch (ex) {
        log.warn("Cannot get image size of " + filename + ": " + ex);
        delete fileInfo.width;
        delete fileInfo.height;
      }
    }
  }
});
