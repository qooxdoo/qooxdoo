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

const hash = require("object-hash");

/**
 *
 */
qx.Class.define("qx.tool.compiler.targets.meta.Browserify", {
  extend: qx.tool.compiler.targets.meta.AbstractJavascriptMeta,

  construct(appMeta) {
    super(appMeta, `${appMeta.getApplicationRoot()}commonjs-browserify.js`);
    this.setNeedsWriteToDisk(true);
  },

  members: {
    __commonjsModules: null,
    __references: null,

    __getCommonjsModules() {
      if (this.__commonjsModules === null) {
        let commonjsModules = new Set();
        let references = {};
        const db = this.getAppMeta().getAnalyser().getDatabase();
        const localModules =
          this.getAppMeta().getApplication().getLocalModules() || {};
        // Get a Set of unique `require`d CommonJS module names from
        // all classes
        for (let className in db.classInfo) {
          let classInfo = db.classInfo[className];
          if (classInfo.commonjsModules) {
            Object.keys(classInfo.commonjsModules).forEach(moduleName => {
              // Ignore this found `require()` if its a local modules
              if (!(moduleName in localModules)) {
                // Add this module name to the set of module names
                commonjsModules.add(moduleName);
              }
              // Add the list of references from which this module was require()d
              if (!references[moduleName]) {
                references[moduleName] = new Set();
              }
              references[moduleName].add([
                ...classInfo.commonjsModules[moduleName]
              ]);
            });
          }
        }
        this.__commonjsModules = [...commonjsModules];
        this.__references = references;
      }
      return {
        commonjsModules: this.__commonjsModules,
        references: this.__references
      };
    },

    /**
     * @Override
     */
    async writeToDisk() {
      const localModules = this.getAppMeta().getApplication().getLocalModules();
      let db = this.getAppMeta().getAnalyser().getDatabase();
      const { commonjsModules } = this.__getCommonjsModules();

      let modules = [];
      let modulesInfo = {};
      let doIt = !!!(await qx.tool.utils.files.Utils.safeStat(
        this.getFilename()
      ));

      // Include any dynamically determined `require()`d modules
      if (commonjsModules.length > 0) {
        modules.push(commonjsModules);
      }
      // Include any local modules specified for the application
      // in compile.json
      if (localModules) {
        modulesInfo.localModules = {};
        for (let requireName in localModules) {
          modules.push(requireName);
          let stat = await qx.tool.utils.files.Utils.safeStat(
            localModules[requireName]
          );

          modulesInfo.localModules[requireName] = stat.mtime.getTime();
          doIt ||=
            modulesInfo.localModules[requireName] >
            (db?.modulesInfo?.localModules[requireName] || 0);
        }
      }
      modulesInfo.modulesHash = hash(modules);
      doIt ||= modulesInfo.modulesHash !== (db?.modulesInfo?.modulesHash || "");
      if (doIt) {
        db.modulesInfo = modulesInfo;
        await this.getAppMeta().getAnalyser().saveDatabase();
      }
      this.setNeedsWriteToDisk(doIt);
      return super.writeToDisk();
    },

    /**
     * @Override
     */
    async writeSourceCodeToStream(ws) {
      // If there are any CommonJS modules required to be bundled, or
      // any local modules specified for the application in
      // compile.json, browserify them
      if (
        this.getAppMeta().getEnvironmentValue("qx.compiler.applicationType") ==
        "browser"
      ) {
        const localModules = this.getAppMeta()
          .getApplication()
          .getLocalModules();
        const { commonjsModules, references } = this.__getCommonjsModules();
        if (commonjsModules.length > 0 || localModules) {
          await this.__browserify(
            commonjsModules,
            references,
            localModules,
            ws
          );
        }
      }
      await new Promise(resolve => {
        ws.write("\n", resolve);
      });
    },

    __browserify(commonjsModules, references, localModules, ws) {
      const babelify = require("babelify");
      const preset = require("@babel/preset-env");
      const browserify = require("browserify");
      const builtins = require("browserify/lib/builtins.js");

      // For some reason, `process` is not require()able, but `_process` is.
      // Make them equivalent.
      builtins.process = builtins._process;

      return new Promise((resolve, reject) => {
        const options = {
          builtins: builtins,
          ignoreMissing: true,
          insertGlobals: true,
          detectGlobals: true
        };
        qx.lang.Object.mergeWith(
          options,
          this.getAppMeta().getAnalyser().getBrowserifyConfig()?.options || {},
          false
        );
        let b = browserify([], options);

        b._mdeps.on("missing", (id, parent) => {
          let message = [];
          message.push(`ERROR: could not locate require()d module: "${id}"`);
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

        b.bundle(function (e, output) {
          if (e) {
            // THIS IS A HACK!
            // In case of error dependency walker never returns from
            // ```if (self.inputPending > 0) return setTimeout(resolve);```
            // because inputPending is not decremented anymore.
            // so set it to 0 here.
            let d = b.pipeline.get("deps");
            d.get(0).inputPending = 0;
            qx.tool.compiler.Console.error(
              `Unable to browserify - this is probably because a module is being require()'d which is not compatible with Browserify:\n${e.message}`
            );

            setTimeout(() => {
              this.emit("end");
            });
            return;
          }
          // in case of end event output can not be writen.
          // so catch the error and ignore it
          try {
            ws.write(output);
          } catch (err) {}
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
