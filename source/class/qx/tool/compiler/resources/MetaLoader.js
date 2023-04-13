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

qx.Class.define("qx.tool.compiler.resources.MetaLoader", {
  extend: qx.tool.compiler.resources.ResourceLoader,

  /**
   * Constructor
   *
   * @param {qx.tool.compiler.resources.Manager} manager resource manager
   */
  construct(manager) {
    super(".meta", manager);
  },

  members: {
    async load(asset) {
      asset.getFileInfo().meta = await qx.tool.utils.Json.loadJsonAsync(
        asset.getSourceFilename()
      );
    }
  }
});
