/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017-2021 The authors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

const fs = qx.tool.utils.Promisify.fs;
const process = require("process");
const path = require("upath");
const semver = require("semver");

/**
 * NOTE: some of the names of the methods in this class do not express very clearly
 * what they do and might be renamed before 7.0.0
 */
qx.Class.define("qx.tool.config.Utils", {
  type: "static",
  statics: {

    /**
     * Returns data on the project in which the CLI commands are executed. If a qooxdoo.json file
     * exists, the data is taken from there. If not, it tries the following:
     * 1) If a Manifest.json exists in the current dir, it is assumed to be the main library dir.
     * 2) if a compile.json file exists in the current dir, it is assumed to be the application dir
     * 3) if not, the subdir demo/default is checked for a compile.json file.
     *
     * @return {Promise<Object>} A promise that resolves to a map containing the following keys:
     * 'libraries': an array of maps containing a 'path' property with a relative path to a library folder,
     * 'applications': an array of maps containing a 'path' property with a relative path to an
     * application folder. If no project data can be determined, resolves to an empty map.
     */
    async getProjectData() {
      let qooxdooJsonPath = path.join(process.cwd(), qx.tool.config.Registry.config.fileName);
      let data = {
        libraries: [],
        applications: []
      };
      if (await fs.existsAsync(qooxdooJsonPath)) {
        let qooxdooJson = await qx.tool.utils.Json.loadJsonAsync(qooxdooJsonPath);
        if (qx.lang.Type.isArray(qooxdooJson.libraries)) {
          data.libraries = qooxdooJson.libraries;
        }
        if (qx.lang.Type.isArray(qooxdooJson.applications)) {
          data.applications = qooxdooJson.applications;
        }
      }
      if (await fs.existsAsync(path.join(process.cwd(), qx.tool.config.Manifest.config.fileName))) {
        if (!data.libraries.find(lib => lib.path === ".")) {
          data.libraries.push({path : "."});
        }
      }
      if (await fs.existsAsync(path.join(process.cwd(), qx.tool.config.Compile.config.fileName))) {
        if (!data.applications.find(app => app.path === ".")) {
          data.applications.push({path : "."});
        }
      }
      return data;
    },

    /**
     * Returns the path to the current library. If the current directory contains several libraries,
     * the first one found is returned.
     * @throws {Error} Throws an error if no library can be found.
     * @return {String} A promise that resolves with the absolute path to the library
     */
    async getLibraryPath() {
      let {libraries} = await this.getProjectData();
      if (libraries instanceof Array && libraries.length) {
        return path.resolve(process.cwd(), libraries[0].path);
      }
      throw new qx.tool.utils.Utils.UserError("Cannot find library path - are you in the right directory?");
    },

    /**
     * Returns the path to the current application, depending on the current
     * working directory. If a directory contains several applications, the first one found is
     * returned.
     * @throws {Error} Throws an error if no application can be found.
     * @return {Promise<String>} A promise that resolves with the absolute path to the application
     */
    async getApplicationPath() {
      let {applications} = await this.getProjectData();
      if (applications instanceof Array && applications.length) {
        return path.resolve(process.cwd(), applications[0].path);
      }
      throw new qx.tool.utils.Utils.UserError("Cannot find application path - are you in the right directory?");
    },

    /**
     * Compute the path to the qooxdoo library which will be used
     * by default.
     *
     * @param {Boolean} ignoreGlobalFramework If true, ignore the global framework
     * path set in the "qx.library" configuration value.
     * @return {Promise<*|never|string>}
     */
    async getQxPath(ignoreGlobalFramework=false) {
      if (!ignoreGlobalFramework) {
        // Config override
        let cfg = await qx.tool.cli.ConfigDb.getInstance();
        let dir = cfg.db("qx.library");
        if (dir) {
          let manifestPath = path.join(dir, qx.tool.config.Manifest.config.fileName);
          if (await fs.existsAsync(manifestPath)) {
            return dir;
          }
        }
      }
      // This project's node_modules
      if (await fs.existsAsync("node_modules/@qooxdoo/framework/" + qx.tool.config.Manifest.config.fileName)) {
        return path.resolve("node_modules/@qooxdoo/framework");
      }
      // The compiler's qooxdoo
      let filename = require.resolve("@qooxdoo/framework/package.json");
      return path.dirname(filename);
    },

    /**
     * Returns the absolute path to the qooxdoo framework used by the current project
     * @param {Boolean} ignoreGlobalFramework If true, ignore the global framework
     * path set in the "qx.library" configuration value.
     * @return {Promise<String>} Promise that resolves with the path {String}
     */
    async getAppQxPath(ignoreGlobalFramework=false) {
      if (!await fs.existsAsync(path.join(process.cwd(), qx.tool.config.Compile.config.fileName))) {
        return this.getQxPath(ignoreGlobalFramework);
      }
      let compileConfig = await qx.tool.config.Compile.getInstance().load();
      let qxpath = false;
      let appPath = await this.getApplicationPath();
      let libraries = compileConfig.getValue("libraries");
      if (libraries) {
        for (let somepath of libraries) {
          let manifestPath = somepath;
          if (!path.isAbsolute(somepath)) {
            manifestPath = path.join(appPath, manifestPath);
          }
          manifestPath = path.join(manifestPath, qx.tool.config.Manifest.config.fileName);
          let manifest = await qx.tool.utils.Json.loadJsonAsync(manifestPath);
          try {
            if (manifest.provides && manifest.provides.namespace === "qx") {
              qxpath = path.dirname(manifestPath);
              return qxpath;
            }
          } catch (e) {
            qx.tool.compiler.Console.warn(`Invalid manifest file ${manifestPath}.`);
          }
        }
      }
      return this.getQxPath(ignoreGlobalFramework);
    },

    /**
     * Returns the absolute path to the qooxdoo framework used by the current project, unless
     * the user provided a CLI option "qxpath", in which case this value is returned.
     * @param {Boolean} ignoreGlobalFramework If true, ignore the global framework
     * path set in the "qx.library" configuration value.
     * @return {Promise<String>} Promise that resolves with the absolute path
     */
    async getUserQxPath(ignoreGlobalFramework=false) {
      let qxpath = await this.getAppQxPath(ignoreGlobalFramework);
      return path.isAbsolute(qxpath) ? qxpath : path.resolve(qxpath);
    },

    /**
     * Returns the version of the qooxdoo framework used by the current project#
     * @param {Boolean} ignoreGlobalFramework If true, ignore the global framework
     * path set in the "qx.library" configuration value.
     * @throws {Error} If the version cannot be determined
     * @return {Promise<String>} Promise that resolves with the version string
     */
    async getUserQxVersion(ignoreGlobalFramework=false) {
      let qxpath = await this.getUserQxPath(ignoreGlobalFramework);
      let qxversion = await this.getLibraryVersion(qxpath);
      return qxversion;
    },

    /**
     * Given the path to a library folder, returns the library version from its manifest
     * @param {String} libPath
     * @return {Promise<String>} Version
     */
    async getLibraryVersion(libPath) {
      let manifestPath = path.join(libPath, qx.tool.config.Manifest.config.fileName);
      let manifest = await qx.tool.utils.Json.loadJsonAsync(manifestPath);
      let version;
      try {
        version = manifest.info.version;
      } catch (e) {
        throw new qx.tool.utils.Utils.UserError(`No valid version data in manifest.`);
      }
      if (!semver.valid(version)) {
        throw new qx.tool.utils.Utils.UserError(`Manifest at ${manifestPath} contains invalid version number "${version}". Please use a semver compatible version.`);
      }
      return version;
    }
  }
});
