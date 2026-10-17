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

qx.Interface.define("qx.tool.compiler.IClassTranspilerApi", {
  members: {
    async test() {},

    /**
     * Transpiles a class definition
     *
     * @typedef {Object} TranspileConfiguration Information regarding the source file to be compiled
     * @property {String} classname
     * @property {String} sourceFilename Absolute path of source file
     * @property {String} outputFilename Absolute path of output file
     * @property {String} manglePrefix The prefix used for mangling privates to make them distinct across different classes
     * @property {String} sourceTransformer the classname of the source transformer to use for this class, or null if no source transformer should be used
     * @property {Object} classFileConfig serialized version of `qx.tool.compiler.ClassFileConfig`
     *
     * @param {qx.tool.compiler.IClassTranspilerApi.TranspileConfiguration} transpileConfig
     * @returns {Promise<qx.tool.compiler.ClassFile.DbClassInfo>}
     */
    async transpileClass(transpileConfig) {}
  }
});
