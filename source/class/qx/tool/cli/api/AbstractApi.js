/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
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
const fs = require("fs");      

/**
 * Base class for the compiler API classes
 */
qx.Class.define("qx.tool.cli.api.AbstractApi", {
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
     * Called by the compiler API during initialisation - this is an ideal
     * place to install additional commands, because a command has not yet
     * been selected 
     */
    async initialize() {
      // Nothing
    },

    /**
     * 
     * helper to load an npm module. Check if it can be loaded before
     * If not install the module with 'npm install --no-save --no-package-lock' to the current library
     * 
     * @param module {String} module to check
     */
    require: function(module) {
      let mod = path.join(process.cwd(), "node_modules");
      if (!fs.existsSync(mod)) {
        fs.mkdirSync(mod);
      }        
      mod = path.join(mod, module);
      let exists = fs.existsSync(mod);
      if (!exists) {
        this.loadNpmModule(module);
      }
      return require(mod);
    },
    /**
      * 
      * install an npm module with 'npm install --no-save --no-package-lock' to the current library
      * 
      * @param module {String} module to load
      */
    loadNpmModule: function(module) {
      const {execSync} = require("child_process");
      let s = `npm install --no-save --no-package-lock ${module}`;
      qx.tool.compiler.Console.info(s);
      execSync(s, {
        stdio: "inherit"
      });
    }
	

  }
});
