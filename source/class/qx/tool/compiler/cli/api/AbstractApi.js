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
 *      * Henner Kollmann (henner.kollmann@gmx.de, @hkollmann)
 *
 * *********************************************************************** */
const path = require("path");
const fs = require("fs");

/**
 * Base class for the compiler API classes
 */
qx.Class.define("qx.tool.compiler.cli.api.AbstractApi", {
  extend: qx.core.Object,

  properties: {
    rootDir: {
      check: "String",
      nullable: false
    },

    /** Configuration data for the compiler */
    configuration: {
      init: {}
    }
  },

  members: {
    /**
     * Loads the configuration
     *
     * @return {Map} configuration data
     */
    async load() {
      return this.getConfiguration();
    },

    /**
     * Loads an npm module, resolving it with the standard Node module
     * resolution starting at the current working directory, so hoisted
     * packages, npm workspaces and nested `node_modules` are found.
     *
     * A module that the project does not provide is installed into a
     * separate npm project inside the project's `qx_packages` directory,
     * so the project's own `package.json`, lockfile and `node_modules` are
     * never changed.
     *
     * @param module {String} name of the npm module to load
     * @return {var} the exports of the module
     * @throws {qx.tool.utils.Utils.UserError} if the module cannot be installed
     */
    require(module) {
      let resolved = this.__resolveNpmModule(module, process.cwd());
      if (!resolved) {
        let npmDir = this._getLocalNpmDir();
        resolved = this.__resolveNpmModule(module, npmDir);
        if (!resolved) {
          try {
            this._installNpmModule(module, npmDir);
          } catch (ex) {
            throw new qx.tool.utils.Utils.UserError(
              `The npm module '${module}' is required but could not be installed into ${npmDir}: ${ex.message}. Please run: npm install --save-dev ${module}`
            );
          }
          resolved = this.__resolveNpmModule(module, npmDir);
        }
        if (!resolved) {
          throw new qx.tool.utils.Utils.UserError(
            `The npm module '${module}' is required but not installed. Please run: npm install --save-dev ${module}`
          );
        }
      }
      return require(resolved);
    },

    /**
     * Resolves an npm module from a directory
     *
     * @param module {String} name of the npm module
     * @param dir {String} directory to start the resolution from
     * @return {String|null} path of the module's entry point, null if not found
     */
    __resolveNpmModule(module, dir) {
      try {
        return require.resolve(module, { paths: [dir] });
      } catch (ex) {
        if (ex.code !== "MODULE_NOT_FOUND") {
          throw ex;
        }
        return null;
      }
    },

    /**
     * Directory of the npm project that receives modules the project does
     * not provide itself
     *
     * @return {String} absolute path
     */
    _getLocalNpmDir() {
      return path.join(process.cwd(), qx.tool.compiler.cli.commands.Package.cache_dir, ".npm");
    },

    /**
     * Installs an npm module into a separate npm project. The module is
     * saved in that project's `package.json` and lockfile, so later
     * installs do not remove modules that were installed before.
     *
     * @param module {String} name of the npm module
     * @param npmDir {String} directory of the npm project
     */
    _installNpmModule(module, npmDir) {
      const { execSync } = require("child_process");
      fs.mkdirSync(npmDir, { recursive: true });
      let packageJson = path.join(npmDir, "package.json");
      if (!fs.existsSync(packageJson)) {
        fs.writeFileSync(packageJson, JSON.stringify({ private: true }, null, 2) + "\n");
      }
      let cmd = `npm install --prefix "${npmDir}" ${module}`;
      qx.tool.compiler.Console.info(cmd);
      execSync(cmd, {
        stdio: "inherit"
      });
    }
  }
});
