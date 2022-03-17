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
      let hasCommonjsModules = false;
      let commonjsModules = new Set();
      let references = {};
      const db = this.__appMeta.getAnalyser().getDatabase();

      // Get a Set of unique `require`d CommonJS module names from all classes
      for (let className in db.classInfo) {
        let classInfo = db.classInfo[className];
        if (classInfo.commonjsModules) {
          Object.keys(classInfo.commonjsModules).forEach(
            moduleName =>
            {
              // Add this module name to the set of module names
              commonjsModules.add(moduleName);

              // Add the list of references from which this module was require()d
              if (! references[moduleName]) {
                references[moduleName] = new Set();
              }
              references[moduleName].add([ ...classInfo.commonjsModules[moduleName] ]);

              // There is at least one module
              hasCommonjsModules = true;
            });
        }
      }

      // If there are any CommonJS modules required, browserify them
      if (hasCommonjsModules) {
        await this.__browserify(
          commonjsModules,
          references,
          ws
        );
      }

      await new Promise(resolve => {
        ws.write("\n", resolve);
      });
    },

    async __browserify(commonjsModules, references, ws) {
      let b;
      const browserify = require("browserify");
      const builtins = require("browserify/lib/builtins.js");

      // For some reason, `process` is not require()able, but `_process` is.
      // Make them equivalent.
      builtins.process = builtins._process;

      // Convert the Set of CommonJS module names to an array
      commonjsModules = [...commonjsModules];

      return new Promise(resolve =>
        {
          b = browserify(
            [],
            {
              builtins      : builtins,
              ignoreMissing : true,
              insertGlobals : true,
              detectGlobals : true
            });
          b._mdeps.on("missing", (id, parent) => {
              let message = [];

              message.push(`ERROR: could not locate require()d module: "${id}"`);
              message.push("  required from:");
              [ ...references[id] ].forEach(refs => {
                refs.forEach(ref =>
                  {
                    message.push(`    ${ref}`);
                  });
              });

              qx.tool.compiler.Console.error(message.join("\n"));
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
