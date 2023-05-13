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

  /**
   * Constructor
   *
   * @param {qx.tool.compiler.resources.Manager} manager resource manager
   */
  construct(manager) {
    super([".png", ".gif", ".jpg", ".jpeg", ".svg"], manager);
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

      if (filename.endsWith(".svg")) {
        let withoutExt = filename.substring(0, filename.length - 3);
        let manager = this.getManager();
        if (
          ["eot", "woff2", "woff", "ttf"].find(
            ext => !!manager.findLibraryForResource(withoutExt + ext)
          )
        ) {
          return false;
        }
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
        // When we can't get the image size, we don't report it because there are SVG types
        //  that have no size (eg fonts) and it's proved quite hard (or impossible) to
        //  suppress the warning accurately in those cases.  Ultimately, if the image is
        //  corrupt it will be found.
        delete fileInfo.width;
        delete fileInfo.height;
      }
    }
  }
});
