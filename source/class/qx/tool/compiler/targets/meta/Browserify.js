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
 * 
 */
qx.Class.define("qx.tool.compiler.targets.meta.Browserify", {
  extend: qx.tool.compiler.targets.meta.AbstractJavascriptMeta,

  construct(appMeta) {
    super(appMeta, `${appMeta.getApplicationRoot()}commonjs-browserify.js`);
    this.__appMeta = appMeta;
    this.setNeedsWriteToDisk(true);
  },

  members: {
    __appMeta : null,

    /**
     * @Override
     */
    async writeSourceCodeToStream(ws) {
      let commonjsModules = this.__appMeta.getAnalyser().getCommonjsModules();

      // If there are any CommonJS modules required, browserify them
      if (commonjsModules.length > 0) {
        await this.__browserify(
          commonjsModules,
          ws
        );
      }

      await new Promise(resolve => {
        ws.write("\n", resolve);
      });
    },

    async __browserify(commonjsModules, ws) {
      let command;
      let output;
      const childProcess = require("child_process");

      command = `browserify -r ${commonjsModules.join(" -r ")}`;
      try {
        output = childProcess.execSync(command);
        ws.write(output);
      } catch (e) {
        qx.tool.compiler.Console.log(`Failed: ${output}`);
        throw e;
      }
    },

    /**
     * @Override
     */
    async getSourceMap() {
      return null;
    }
  }
});
