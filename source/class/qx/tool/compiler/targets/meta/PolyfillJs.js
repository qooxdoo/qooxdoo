/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2021 Zenesis Limited, http://www.zenesis.com
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

const fs = qx.tool.utils.Promisify.fs;
const path = require("upath");

/**
 * Represents a "polyfill.js" that is generated as part of a compile
 */
qx.Class.define("qx.tool.compiler.targets.meta.PolyfillJs", {
  extend: qx.tool.compiler.targets.meta.AbstractJavascriptMeta,

  construct(appMeta) {
    super(appMeta, `${appMeta.getApplicationRoot()}polyfill.js`);
  },

  properties: {
    needsWriteToDisk: {
      init: true,
      refine: true
    }
  },

  members: {
    /**
     * @Override
     */
    async writeSourceCodeToStream(ws) {
      await this.__write(
        path.join(require.resolve("core-js-bundle"), "../minified.js"),
        ws
      );

      await new Promise(resolve => {
        ws.write("\n", resolve);
      });
      await this.__write(
        path.join(require.resolve("regenerator-runtime"), "../runtime.js"),
        ws
      );
    },

    async __write(srcFilename, ws) {
      let rs = fs.createReadStream(srcFilename, "utf8");
      await new Promise((resolve, reject) => {
        rs.on("end", resolve);
        rs.on("error", reject);
        rs.pipe(ws, { end: false });
      });
    },

    /**
     * @Override
     */
    async getSourceMap() {
      return null;
    }
  }
});
