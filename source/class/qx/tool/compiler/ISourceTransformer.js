/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2025 Zenesis Limited, http://www.zenesis.com
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
 *      * Patryk Malinowski (pmalinowski@vmn.digital, @patryk-m-malinowski)
 *
 * *********************************************************************** */

/**
 * Interface for source transformers used in the compilation process.
 * The can intercept the compilation, and translate the original source code to the source code that will be passed down to Babel.
 */
qx.Interface.define("qx.tool.compiler.ISourceTransformer", {
  members: {
    /**
     * Function called once to initialize the source transformer.
     */
    async initialise() {},

    /**
     * Whether this transformer should transform the given source,
     * or leave it as is.
     * @param {qx.tool.compiler.IClassTranspilerApi.TranspileConfiguration} sourceInfo
     * @returns {boolean}
     */
    async shouldTransform(sourceInfo) {},

    /**
     * Transforms the given source.
     * @param {qx.tool.compiler.IClassTranspilerApi.TranspileConfiguration} sourceInfo
     * @param {string} source The original source code
     * @returns {string} The resulting source code
     */
    async transform(sourceInfo, source) {}
  }
});
