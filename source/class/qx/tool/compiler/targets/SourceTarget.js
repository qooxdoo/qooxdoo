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
 * ************************************************************************/
/**
 * Compiles a target where source files and resources are loaded in place
 */
qx.Class.define("qx.tool.compiler.targets.SourceTarget", {
  extend: qx.tool.compiler.targets.Target,

  properties: {
    /**
     * Whether to copy resources in source builds.
     */
    copyResources: {
      check: "Boolean",
      init: true
    }
  },

  members: {
    /*
     * @Override
     */
    async _writeApplication() {
      if (this.getCopyResources()) {
        let appMeta = this.getAppMeta();
        await appMeta.syncAssets();
      }
      return await this.base(arguments);
    },

    /*
     * @Override
     */
    toString: function() {
      return "Source Target: " + this.getOutputDir();
    }
  }
});
