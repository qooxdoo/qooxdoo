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

const path = require("path");
const fs = qx.tool.utils.Promisify.fs;

/**
 * Provides an API for the compiler
 *
 */
qx.Class.define("qx.tool.cli.api.CompilerApi", {
  extend: qx.tool.cli.api.AbstractApi,

  construct() {
    super();
    this.__libraryApis = {};
    this.__compileJsonExists = true;
    this.addListener("changeCommand", () => {
      this.afterCommandLoaded(this.getCommand());
    });
  },

  properties: {
    /** Default filename to load from */
    configFilename: {
      check: "String",
      nullable: false
    },

    /** The current command */
    command: {
      init: null,
      nullable: true,
      check: "qx.tool.cli.commands.Command",
      event: "changeCommand"
    }
  },

  members: {
    __libraryApis: null,

    /**
     * Called after the command is loaded
     * @param cmd {qx.tool.cli.commands.Command} current command
     */
    afterCommandLoaded(cmd) {
      // Nothing
    },

    /**
     * Register compiler tests
     * @param cmd {qx.tool.cli.commands.Command} current command
     */
    async beforeTests(cmd) {
      // Nothing
    },

    /**
     * called after deployment happens
     *
     * @param data {Object}  contains deployment infos with the following properties:
     *           targetDir  : {String}  The target dir of the build
     *           deployDir  : {String}  The output dir for the deployment
     *           argv       : {Object}  Arguments
     *           application: {Object}  application to build
     * @return {Promise<void>}
     */
    async afterDeploy(data) {
      // Nothing
    },

    /**
     * Loads the configuration data
     *
     * @overridden
     */
    async load() {
      let compileJsonPath = path.join(
        this.getRootDir(),
        this.getConfigFilename()
      );

      let config = {};
      if (await fs.existsAsync(compileJsonPath)) {
        config = await qx.tool.utils.Json.loadJsonAsync(compileJsonPath);
      } else {
        this.__compileJsonExists = false;
      }
      this.setConfiguration(config);
      return super.load();
    },

    compileJsonExists() {
      return this.__compileJsonExists;
    },

    /**
     * runs after the whole process is finished
     * @param cmd {qx.tool.cli.commands.Command} current command
     * @param res {boolean} result of the just finished process
     */
    async afterProcessFinished(cmd, res) {
      // Nothing
    },

    /**
     * Called after all libraries have been loaded and added to the compilation data
     */
    async afterLibrariesLoaded() {
      for (let arr = this.getLibraryApis(), i = 0; i < arr.length; i++) {
        await arr[i].afterLibrariesLoaded();
      }
    },

    /**
     * Adds a library configuration
     *
     * @param libraryApi {LibraryApi} the configuration for the library
     */
    addLibraryApi(libraryApi) {
      let dir = path.resolve(libraryApi.getRootDir());
      this.__libraryApis[dir] = libraryApi;
    },

    /**
     * Returns an array of library configurations
     *
     * @return {LibraryApi[]}
     */
    getLibraryApis() {
      return Object.values(this.__libraryApis);
    }
  }
});
