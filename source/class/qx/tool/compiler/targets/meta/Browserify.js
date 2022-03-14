/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2022 Derrell Lipman
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * Derrell Lipman (@derrell)
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
      let commonjsModules = new Set();
      const db = this.__appMeta.getAnalyser().getDatabase();

      // Get a Set of unique `require`d CommonJS module names from all classes
      for (let className in db.classInfo) {
        let classInfo = db.classInfo[className];
        if (classInfo.commonjsModules) {
          classInfo.commonjsModules.forEach(
            (moduleName) =>
            {
              commonjsModules.add(moduleName);
            });
        }
      }

      // Convert the Set to an array
      commonjsModules = [...commonjsModules];

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
      let b;
      const browserify = require("browserify");

      return new Promise((resolve) =>
        {
          b = browserify([], { ignoreMissing : true });
          b._mdeps.on("missing", (id, parent) =>
            {
              qx.tool.compiler.Console.error(`ERROR: could not locate require()ed module: "${id}"`);
              throw new qx.tool.compiler.TargetError(`ERROR: could not locate require()ed module: "${id}"`);
            });
          b.require(commonjsModules);
          b.bundle((e, output) => {
            if (e) {
              // We've already handled the case of missing module. This is something else.
              qx.tool.compiler.Console.error(`Failed: ${e}`);
              throw(e);
            }

            ws.write(output);
            resolve(null);
          });
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
