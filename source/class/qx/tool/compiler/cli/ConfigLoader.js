/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019 The qooxdoo developers

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     *    Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */
const semver = require("semver");
const path = require("upath");
const fs = qx.tool.utils.Promisify.fs;

/**
 * preloading of configurations
 */
qx.Class.define("qx.tool.compiler.cli.ConfigLoader", {
  extend: qx.core.Object,
  type: "singleton",

  members: {
    /** @type {CompilerApi} the CompilerApi instance */
    __compilerApi: null,

    async load() {
      let cmd = await qx.tool.compiler.cli.Command.createCliCommand();
      cmd.parseRoot();
      let argv = cmd.getValues().argv;
      /*
       * Detect and load compile.json and compile.js
       */
      let defaultConfigFilename = qx.tool.config.Compile.config.fileName;
      if (argv.configFile) {
        process.chdir(path.dirname(argv.configFile));
        argv.configFile = path.basename(argv.configFile);
        defaultConfigFilename = argv.configFile;
      }

      var lockfileContent = {
        version: qx.tool.config.Lockfile.getInstance().getVersion()
      };

      let compileJsFilename = "compile.js";
      let compileJsonFilename = qx.tool.config.Compile.config.fileName;
      if (defaultConfigFilename) {
        if (defaultConfigFilename.match(/\.js$/)) {
          compileJsFilename = defaultConfigFilename;
        } else {
          compileJsonFilename = defaultConfigFilename;
        }
      }

      if (await fs.existsAsync(compileJsonFilename)) {
        this._compileJsonFilename = compileJsonFilename;
      }

      /*
       * Create a CompilerAPI
       */

      let CompilerApi = qx.tool.compiler.cli.api.CompilerApi;
      if (await fs.existsAsync(compileJsFilename)) {
        let compileJs = await this.__loadJs(compileJsFilename);
        this._compileJsFilename = compileJsFilename;
        if (compileJs.CompilerApi) {
          CompilerApi = compileJs.CompilerApi;
        }
      }
      let compilerApi = (this.__compilerApi = new CompilerApi().set({
        rootDir: ".",
        configFilename: compileJsonFilename
      }));

      // Boot the compiler API, load the compile.json and create configuration data
      await compilerApi.load();
      let config = compilerApi.getConfiguration();

      // Validate configuration data against the schema
      await qx.tool.config.Compile.getInstance().load(config);

      /*
       * Open the lockfile and check versions
       */
      if (defaultConfigFilename) {
        let lockfile = qx.tool.config.Lockfile.config.fileName;
        try {
          var name = path.join(path.dirname(defaultConfigFilename), lockfile);
          lockfileContent =
            (await qx.tool.utils.Json.loadJsonAsync(name)) || lockfileContent;
        } catch (ex) {
          // Nothing
        }
        // check semver-type compatibility (i.e. compatible as long as major version stays the same)
        let schemaVersion = semver.coerce(
          qx.tool.config.Lockfile.getInstance().getVersion(),
          true
        ).raw;
        let fileVersion =
          lockfileContent && lockfileContent.version
            ? semver.coerce(lockfileContent.version, true).raw
            : "1.0.0";
        if (semver.major(schemaVersion) > semver.major(fileVersion)) {
          if (argv.force) {
            let config = {
              verbose: argv.verbose,
              quiet: argv.quiet,
              save: false
            };

            const installer = new qx.tool.compiler.cli.commands.package.Install();
            installer.argv = config;
            let filepath = installer.getLockfilePath();
            let backup = filepath + ".old";
            await fs.copyFileAsync(filepath, backup);
            if (!argv.quiet) {
              qx.tool.compiler.Console.warn(
                `*** A backup of ${lockfile} has been saved to ${backup}, in case you need to revert to it. ***`
              );
            }
            await installer.deleteLockfile();
            for (let lib of lockfileContent.libraries) {
              if (!(await installer.isInstalled(lib.uri, lib.repo_tag))) {
                if (lib.repo_tag) {
                  await installer.install(lib.uri, lib.repo_tag);
                } else if (lib.path && fs.existsSync(lib.path)) {
                  await installer.installFromLocaPath(lib.path, lib.uri);
                }
              } else if (argv.verbose) {
                qx.tool.compiler.Console.info(
                  `>>> ${lib.uri}@${lib.repo_tag} is already installed.`
                );
              }
            }
            lockfileContent = await installer.getLockfileData();
          } else {
            throw new qx.tool.utils.Utils.UserError(
              `*** Warning ***\n` +
                `The schema of '${lockfile}' has changed. Execute 'qx clean && qx compile --force' to delete and regenerate it.\n` +
                `You might have to re-apply manual modifications to '${lockfile}'.`
            );
          }
        }
      }

      /*
       * Locate and load libraries
       */
      if (!config.libraries) {
        if (fs.existsSync("Manifest.json")) {
          config.libraries = ["."];
        }
      }

      if (lockfileContent.libraries) {
        config.packages = {};
        lockfileContent.libraries.forEach(function (library) {
          config.libraries.push(library.path);
          config.packages[library.uri] = library.path;
        });
      }
      // check if we need to load libraries, needs more robust test
      let needLibraries = !argv.clean;
      // check if libraries are loaded
      if (config.libraries && needLibraries) {
        let neededLibraries = config.libraries.filter(
          libData => !fs.existsSync(libData + "/Manifest.json")
        );

        if (neededLibraries.length) {
          if (!fs.existsSync(qx.tool.config.Manifest.config.fileName)) {
            qx.tool.compiler.Console.error(
              "Libraries are missing and there is no Manifest.json in the current directory so we cannot attempt to install them; the missing libraries are: \n     " +
                neededLibraries.join("\n     ")
            );

            process.exit(1);
          }
          qx.tool.compiler.Console.info(
            "One or more libraries not found - trying to install them from library repository..."
          );

          const installer = new qx.tool.compiler.cli.commands.package.Install();

          await installer.process({
            quiet: true,
            save: false
          });
        }

        for (const aPath of config.libraries) {
          let libCompileJsFilename = path.join(aPath, "compile.js");

          let LibraryApi = qx.tool.compiler.cli.api.LibraryApi;
          if (await fs.existsAsync(libCompileJsFilename)) {
            let compileJs = await this.__loadJs(libCompileJsFilename);
            if (compileJs.LibraryApi) {
              LibraryApi = compileJs.LibraryApi;
            }
          }

          let libraryApi = new LibraryApi().set({
            rootDir: aPath,
            compilerApi: compilerApi
          });

          compilerApi.addLibraryApi(libraryApi);
          await libraryApi.initialize();
          await this.__notifyLibraries();
        }
      }
    },

    /**
     * Loads a .js file using `require`, handling exceptions as best as possible
     *
     * @param aPath {String} the file to load
     * @return {Object} the module
     */
    async __loadJs(aPath) {
      try {
        let module = require(path.resolve(aPath));
        return module;
      } catch (e) {
        let lines = e.stack.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].match(/^\s+at/)) {
            lines.splice(i);
          }
        }
        let lineNumber = lines[0].split("evalmachine.<anonymous>:")[1];
        if (lineNumber !== undefined) {
          lines.shift();
          throw new Error(
            "Error while reading " +
              aPath +
              " at line " +
              lineNumber +
              "\n" +
              lines.join("\n")
          );
        } else {
          throw new Error(
            "Error while reading " + aPath + "\n" + lines.join("\n")
          );
        }
      }
    },

    async __notifyLibraries() {
      for (
        let i = 0, arr = this.getCompilerApi().getLibraryApis();
        i < arr.length;
        i++
      ) {
        let libraryApi = arr[i];
        await libraryApi.load();
      }
      await this.getCompilerApi().afterLibrariesLoaded();
    },

    /**
     * Returns the CompilerApi instance
     *
     * @return {CompilerApi}
     */
    getCompilerApi() {
      return this.__compilerApi;
    }
  }
});
