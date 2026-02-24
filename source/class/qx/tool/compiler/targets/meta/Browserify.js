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
      const { commonjsModules, references } = this.__getCommonjsModules();

      // Warn about missing npm modules on every compile, not just when the bundle is rebuilt
      if (this.getAppMeta().getEnvironmentValue("qx.compiler.applicationType") == "browser") {
        for (const moduleName of commonjsModules) {
          try {
            require.resolve(moduleName, { paths: [process.cwd()] });
          } catch (_) {
            const msg = [`WARNING: could not locate require()d module: "${moduleName}"`, "  required from:"];
            const modRefs = references[moduleName];
            if (modRefs) {
              for (const mr of modRefs) {
                for (const ref of mr) {
                  msg.push("    " + ref);
                }
              }
            }
            qx.tool.compiler.Console.error(msg.join("\n"));
          }
        }
      }

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

    async __browserify(commonjsModules, references, localModules, ws) {
      const esbuild = require("esbuild");
      const { polyfillNode } = require("esbuild-plugin-polyfill-node");

      // Convert a module name to a valid JS identifier
      const safeName = name => "_m_" + name.replace(/[^a-zA-Z0-9_$]/g, "_");

      // esbuild equivalent of browserify's ignoreMissing:true — logs a warning and
      // returns an empty module stub so the bundle is still produced
      const missingModulePlugin = {
        name: "qx-missing-module",
        setup(build) {
          const onResolveHandler = async args => {
            if (args.namespace === "qx-missing") { return null; }
            const searchPaths = [args.resolveDir, process.cwd()].filter(Boolean);
            for (const dir of searchPaths) {
              try {
                require.resolve(args.path, { paths: [dir] });
                return null;
              } catch (_) {}
            }
            return { path: args.path, namespace: "qx-missing" };
          };
          build.onResolve({ filter: /^[^./]/ }, onResolveHandler);
          build.onLoad({ filter: /.*/, namespace: "qx-missing" }, args => ({
            contents: `// Missing module: ${args.path}\nmodule.exports = {};`,
            loader: "js"
          }));
        }
      };

      const allModules = [
        ...commonjsModules.map(m => ({ require: m, file: m })),
        ...Object.entries(localModules || {}).map(([name, file]) => ({ require: name, file }))
      ];

      // Build a virtual entry that imports all required modules and exposes
      // them via a global require() function compatible with Qooxdoo's runtime require() calls
      const entryContent = [
        ...allModules.map(m => `import * as ${safeName(m.require)} from ${JSON.stringify(m.file)};`),
        `const __qx_mods = {`,
        ...allModules.map(m => `  ${JSON.stringify(m.require)}: ${safeName(m.require)},`),
        `};`,
        `const __prev = typeof globalThis.require === "function" ? globalThis.require : null;`,
        `globalThis.require = function(name) {`,
        `  if (name in __qx_mods) return __qx_mods[name];`,
        `  if (__prev) return __prev(name);`,
        `  throw new Error("Module not found: " + name);`,
        `};`
      ].join("\n");

      // Merge in any user-provided esbuild options from compile.json's "browserify" key
      const browserifyConfig = this.getAppMeta().getAnalyser().getBrowserifyConfig() || {};
      const userOptions = { ...(browserifyConfig.options || {}) };

      // Filter out browserify-only options that esbuild doesn't understand
      const BROWSERIFY_ONLY_OPTS = ["noParse", "ignoreMissing", "insertGlobals", "detectGlobals", "builtins"];
      for (const opt of BROWSERIFY_ONLY_OPTS) {
        if (opt in userOptions) {
          qx.tool.compiler.Console.warn(
            `WARNING: compile.json browserify.options.${opt} is a browserify-only option and is not supported by esbuild — it will be ignored.` +
              (opt === "noParse" ? ' Use esbuild\'s "external" option instead if needed.' : "")
          );
          delete userOptions[opt];
        }
      }

      // polyfillNode is enabled by default; set browserify.polyfillNode: false in compile.json to disable
      const usePolyfillNode = browserifyConfig.polyfillNode !== false;

      // Extract define and plugins manually (object rest destructuring is not supported by the qx parser)
      const userDefine = userOptions.define || {};
      const userPlugins = Array.isArray(userOptions.plugins) ? userOptions.plugins : [];
      delete userOptions.define;
      delete userOptions.plugins;
      const basePlugins = usePolyfillNode ? [polyfillNode()] : [];

      let result;
      try {
        result = await esbuild.build(
          Object.assign(
            {
              stdin: {
                contents: entryContent,
                resolveDir: process.cwd()
              },
              bundle: true,
              platform: "browser",
              format: "iife",
              write: false,
              sourcemap: false,
              logLevel: "silent",
              // Preserve .name property of classes/functions even when esbuild renames bindings to
              // avoid scope conflicts inside already-bundled packages (e.g. browserified bundles that
              // have duplicate identifier names across inlined modules).
              keepNames: true,
              // Replace global with globalThis so Node.js packages using `global.<x>` work in browsers
              define: Object.assign({ global: "globalThis" }, userDefine),
              plugins: basePlugins.concat([missingModulePlugin], userPlugins)
            },
            userOptions
          )
        );
      } catch (e) {
        // Report missing/unresolvable modules with context from the analyser database
        for (const err of e.errors || []) {
          const id = err.text?.match(/Cannot resolve "([^"]+)"/)?.[1] || err.text;
          let message = [`ERROR: could not bundle module: "${id || err.text}"`];
          if (id && references[id]) {
            message.push("  required from:");
            try {
              for (const refs of references[id]) {
                for (const ref of refs) {
                  message.push("    " + ref);
                }
              }
            } catch (_) {}
          }
          qx.tool.compiler.Console.error(message.join("\n"));
        }
        qx.tool.compiler.Console.error(`Unable to bundle CommonJS modules: ${e.message}`);
        return;
      }

      try {
        ws.write(Buffer.from(result.outputFiles[0].contents));
      } catch (_) {}
    },

    /**
     * @Override
     */
    async getSourceMap() {
      return null;
    }
  }
});
