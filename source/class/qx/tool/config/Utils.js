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
     * Returns data on the project in the currect working directory.
     * If a qooxdoo.json file exists, the data is taken from there.
     * If not, the relies on the following assumptions:
     *
     * 1. If a Manifest.json exists in the current working directory,
     * it is assumed to be the main library directory.
     *
     * 2. If a compile.json file exists in the current working directory,
     * it is assumed to be the directory in which the application can be found.
     *
     * The method returns a promise that resolves to a map containing the following keys:
     * 'libraries': an array of maps containing a 'path' property with a relative path to a library folder,
     * 'applications': an array of maps containing a 'path' property with a relative path to an
     * application folder.
     *
     * If no libraries or applications can be found, empty arrays are returned.
     *
     * @return {Promise<Object>}
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
     * Returns the path to the library in the current working directory. If that
     * directory contains several libraries, the first one found is returned.
     *
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
     * Returns the path to the current application, depending on
     * the current working directory. If a directory contains
     * several applications, the first one found is returned.
     *
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
     * Compute the path to the qooxdoo library (the `qx` namespace)
     * which is used independently of the application being compiled.
     *
     * The path will be resolved the following way:
     *
     * 1. finding a `Manifest.json` in the current working directory that provides
     * the `qx` library, or such a file in the parent directory, its parent dir,
     * etc., up to the root.
     *
     * 2. The qx library contained in the projects `node_modules` folder, if it exists,
     * or in the parent directory's, etc.
     *
     * 3. A globally installed `@qooxdoo/framework` NPM package.
     *
     * @param {String?} cwd The working directory. If not given, the current working dir is used
     * @return {Promise<*|never|string>}
     */
    async getQxPath(cwd=null) {
      cwd = cwd || process.cwd();
      let dir = cwd;
      do {
        // 1. Manifest.json files
        if (this.isQxLibrary(dir)) {
          return dir;
        }
        // 2. node_modules folders
        let npmdir = path.join(dir, "node_modules", "@qooxdoo", "framework")
        if (await fs.existsAsync(path.join(npmdir, qx.tool.config.Manifest.config.fileName))) {
          return npmdir;
        }
      } while (dir !== "/"); // TODO Windows!
      // global npm package
      let npmdir = await qx.tool.utils.Utils.exec("npm root -g");
      return path.join(npmdir, "@qooxdoo", "framework");
    },

    /**
     * Returns the absolute path to the qooxdoo framework
     * used by the current project, If the application does
     * not specify a path, it is taken from the environment.
     *
     * @param {String?} cwd The working directory. If not given, the current working dir is used
     * @return {Promise<String>} Promise that resolves with the path {String}
     */
    async getAppQxPath(cwd=null) {
      cwd = cwd || process.cwd();
      if (!await fs.existsAsync(path.join(cwd, qx.tool.config.Compile.config.fileName))) {
        return this.getQxPath(cwd);
      }
      let compileConfig = await qx.tool.config.Compile.getInstance().load();
      let qxpath = false;
      let appPath = await this.getApplicationPath();
      let libraries = compileConfig.getValue("libraries");
      if (libraries) {
        for (let somepath of libraries) {
          let libraryPath = somepath;
          if (!path.isAbsolute(somepath)) {
            libraryPath = path.join(appPath, libraryPath);
          }
          if (await this.isQxLibrary(libraryPath)) {
            return libraryPath;
          }
        }
      }
      return this.getQxPath(cwd);
    },

    /**
     * Returns true if the library in the given path provides the "qx" library
     * @param {String} libraryPath
     * @return {Promise<boolean>}
     */
    async isQxLibrary(libraryPath) {
      let manifestPath = path.join(libraryPath, qx.tool.config.Manifest.config.fileName);
      if (!await fs.existsAsync(manifestPath)) {
        return false;
      }
      try {
        let manifest = await qx.tool.utils.Json.loadJsonAsync(manifestPath);
        if (manifest.provides && manifest.provides.namespace === "qx") {
          return true;
        }
      } catch (e) {
        throw new qx.tool.utils.Utils.UserError(`Invalid manifest file ${manifestPath}.`);
      }
      return false;
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
