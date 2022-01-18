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

/**
 * An implementation of IJavascriptMeta for plain old javascript files
 */
qx.Class.define("qx.tool.compiler.targets.meta.Javascript", {
  extend: qx.tool.compiler.targets.meta.AbstractJavascriptMeta,

  /**
   * Constructor
   *
   * @param appMeta {qx.tool.compiler.targets.meta.ApplicationMeta}
   * @param filename {String} the sourcefile
   * @param originalSourceFile {String?} the URI to give to the source map
   */
  construct(appMeta, filename, originalSourceFile) {
    super(appMeta, filename, originalSourceFile);
  },

  members: {
    /*
     * @Override
     */
    compile() {
      // Nothing
    },

    /*
     * @Override
     */
    async writeSourceCodeToStream(ws) {
      let rs = fs.createReadStream(this.getFilename(), "utf8");
      await new Promise((resolve, reject) => {
        rs.on("end", resolve);
        rs.on("error", reject);
        rs.pipe(ws, { end: false });
      });
    },

    /*
     * @Override
     */
    async getSourceMap() {
      if (!fs.existsSync(this.getFilename() + ".map")) {
        return null;
      }
      return await fs.readFileAsync(this.getFilename() + ".map", "utf8");
    }
  }
});
