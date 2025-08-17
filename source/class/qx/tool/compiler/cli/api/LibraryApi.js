/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2011-2019 Zenesis Limited, http://www.zenesis.com
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
 * Provides an API for an individual library
 */
qx.Class.define("qx.tool.compiler.cli.api.LibraryApi", {
  extend: qx.tool.compiler.cli.api.AbstractApi,

  properties: {
    /** The Compiler API */
    compilerApi: {
      nullable: false,
      check: "qx.tool.compiler.cli.api.CompilerApi"
    }
  },

  members: {
    /**
     * Called by the compiler API during initialisation - this is an ideal
     * place to install additional commands, because a command has not yet
     * been selected
     */
    async initialize(cmd) {
      // Nothing
    },

    /**
     * Called to load any library-specific configuration and update the compilerConfig
     *
     * @Override
     */
    async load() {
      return super.load();
    },

    /**
     * Called after all libraries have been loaded and added to the compilation data
     */
    async afterLibrariesLoaded() {
      // Nothing
    }
  }
});
