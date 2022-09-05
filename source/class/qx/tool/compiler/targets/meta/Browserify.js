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
    __appMeta: null,

    /**
     * @Override
     */
    async writeSourceCodeToStream(ws) {
      let hasCommonjsModules = false;
      let commonjsModules = new Set();
      let references = {};
      const localModules =
        this.__appMeta.getApplication().getLocalModules() || {};
      const db = this.__appMeta.getAnalyser().getDatabase();

      // Only include discovered `require()`d Node modules if the
      // target application type is browser.
      if (
        this.__appMeta.getEnvironmentValue("qx.compiler.applicationType") ==
        "browser"
      ) {
        // Get a Set of unique `require`d CommonJS module names from classes needed by the application
        let classnames = this.__appMeta__P_44_0
          .getApplication()
          .getDependencies();
        for (let className of classnames) {
          let classInfo = db.classInfo[className];
          if (classInfo.commonjsModules) {
            Object.keys(classInfo.commonjsModules).forEach(moduleName => {
              // Ignore this found `require()` if its a local modules
              if (moduleName in localModules) {
                return;
              }

              // Add this module name to the set of module names
              commonjsModules.add(moduleName);

              // Add the list of references from which this module was require()d
              if (!references[moduleName]) {
                references[moduleName] = new Set();
              }
              references[moduleName].add([
                ...classInfo.commonjsModules[moduleName]
              ]);

              // There is at least one module
              hasCommonjsModules = true;
            });
          }
        }
      }

      // If there are any CommonJS modules required to be bundled, or
      // any local modules specified for the application in
      // compile.json, browserify them
      if (hasCommonjsModules || localModules) {
        await this.__browserify(commonjsModules, references, localModules, ws);
      }

      await new Promise(resolve => {
        ws.write("\n", resolve);
      });
    },

    async __browserify(commonjsModules, references, localModules, ws) {
      const babelify = require("babelify");
      const preset = require("@babel/preset-env");
      const browserify = require("browserify");
      const builtins = require("browserify/lib/builtins.js");

      // For some reason, `process` is not require()able, but `_process` is.
      // Make them equivalent.
      builtins.process = builtins._process;

      // Convert the Set of CommonJS module names to an array
      commonjsModules = [...commonjsModules];

      return new Promise(resolve => {
        let b = browserify([], {
          builtins: builtins,
          ignoreMissing: true,
          insertGlobals: true,
          detectGlobals: true
        });

        b._mdeps.on("missing", (id, parent) => {
          let message = [];

          message.push(`ERROR: could not locate require()d module: "${id}"`);
          if (references[id]) {
            message.push("  required from:");

            try {
              [...references[id]].forEach(refs => {
                refs.forEach(ref => {
                  message.push(`    ${ref}`);
                });
              });
            } catch (e) {
              message.push(`    <compile.json:application.localModules'>`);
            }
          }

          qx.tool.compiler.Console.error(message.join("\n"));
        });

        // Include any dynamically determined `require()`d modules
        if (commonjsModules.length > 0) {
          b.require(commonjsModules);
        }

        // Include any local modules specified for the application
        // in compile.json
        if (localModules) {
          for (let requireName in localModules) {
            b.require(localModules[requireName], { expose: requireName });
          }
        }

        // Ensure ES6 local modules are converted to CommonJS format
        b.transform(babelify, {
          presets: [preset],
          sourceMaps: false,
          global: true
        });

        b.bundle((e, output) => {
          if (e) {
            // We've already handled the case of missing module. This is something else.
            qx.tool.compiler.Console.error(
              `Unable to browserify - this is probably because a module is being require()'d which is not compatible with Browserify: ${e.message}`
            );

            // Do not throw an error here, otherwise a problem in the users code will kill the watch with pages of error
            resolve(null);
            return;
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
