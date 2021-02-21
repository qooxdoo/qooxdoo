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
    async getApplicationPath(dir) {
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
     * The path will be resolved via the following strategies:
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
     * If all strategies fail, an error is thrown.
     *
     * @param {String?} dir The working directory. If not given, the current working dir is used
     * @return {Promise<*string>}
     * @throws {qx.tool.utils.Utils.UserError} if no qooxdoo library can be found
     */
    async getQxPath(dir=null) {
      dir = path.resolve(dir || process.cwd());
      let root = path.parse(dir).root;
      while (dir !== root) {
        // 1. Manifest.json files
        if (await this.isQxLibrary(dir)) {
          return dir;
        }
        // 2. node_modules folders
        let npmdir = path.join(dir, "node_modules", "@qooxdoo", "framework")
        if (await fs.existsAsync(path.join(npmdir, "Manifest.json"))) {
          return npmdir;
        }
        // walk up the directory tree
        dir = path.resolve(path.join(dir, ".."));
        //root = path.parse(dir).root;
      }
      // 3. global npm package
      let npmdir = await qx.tool.utils.Utils.exec("npm root -g");
      dir = path.join(npmdir, "@qooxdoo", "framework");
      if (!this.isQxLibrary(dir)) {
        throw new qx.tool.utils.Utils.UserError(`Path to the qx library cannot be determined.`);
      }
      return dir;
    },

    /**
     * Returns true if a compilable application exists in the given directory by checking
     * if there is a "compile.json" file.
     *
     * @param {String} dir
     * @return {Promise<*>}
     */
    async applicationExists(dir){
      return await fs.existsAsync(path.join(dir, qx.tool.config.Compile.config.fileName))
    },

    /**
     * Returns the absolute path to the qooxdoo framework
     * used by the current project, If the application does
     * not specify a path, it is taken from the environment.
     *
     * @param {String?} baseDir The base directory. If not given, the current working dir is used
     * @return {Promise<String>} Promise that resolves with the path {String}
     * @throws {qx.tool.utils.Utils.UserError}
     */
    async getAppQxPath(baseDir=null) {
      baseDir = baseDir || process.cwd();
      // if there is no compile.json file, throw
      if (!await this.applicationExists(baseDir)) {
        throw new qx.tool.utils.Utils.UserError(`No compilable application exists in ${baseDir}.`);
      }
      // 1. check `libraries` key of compile.json which overrides anything else
      let compileJsonModel = await qx.tool.config.Compile.getInstance().set({baseDir}).load();
      let appPath = await this.getApplicationPath();
      let libraries = compileJsonModel.getValue("libraries");
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
      // 2. node_modules etc.
      return this.getQxPath(baseDir);
    },

    /**
     * Returns the qooxdoo version from the current environment (not the application)
     * @param {String?} dir The base directory. If not given, the current working dir is used
     * @return {Promise<String>}
     */
    async getQxVersion(dir=null) {
      let qxpath = await this.getQxPath(dir);
      return this.getLibraryVersion(qxpath);
    },

    /**
     * Returns the qooxdoo version used in the application in the current or given
     * directory
     * @param {String?} baseDir The base directory. If not given, the current working dir is used
     * @return {Promise<String>}
     * @throws {qx.tool.utils.Utils.UserError}
     */
    async getAppQxVersion(baseDir=null) {
      baseDir = baseDir || process.cwd();
      let manifestRequiresKey="@qooxdoo/framework";
      let manifestModel = await qx.tool.config.Manifest.getInstance()
        .set({
          baseDir,
          warnOnly: true,
          validate: false
        })
        .load();
      let qxVersionRange = manifestModel.getValue("requires."+manifestRequiresKey);
      let qxVersion = qxVersionRange && qxVersionRange.match(/[\^~]?([-0-9a-z._]+)/);
      if (!qxVersion || !semver.valid(qxVersion[1])) {
        throw new qx.tool.utils.Utils.UserError(
          `Cannot determine the qooxdoo version used to compile the application. `+
          `Please specify a caret or tilde range for the requires[${manifestRequiresKey}] key in the Manifest")`
        );
      }
      return qxVersion[1];
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
     * Returns an array of {@link qx.tool.config.Abstract} Objects which contain
     * metadata on the `Manifest.json` file(s) in the current project/package.
     * @param {String?} cwd The working directory. If not given, the current working dir is used
     * @return {Promise<qx.tool.config.Manifest[]>}
     */
    async getManifestModels(cwd=null) {
      cwd = cwd || process.cwd();
      const registryModel = qx.tool.config.Registry.getInstance();
      let manifestModels = [];
      if (await registryModel.exists()) {
        // we have a qooxdoo.json index file containing the paths of libraries in the repository
        await registryModel.load();
        let libraries = registryModel.getLibraries();
        for (let library of libraries) {
          manifestModels.push(new qx.tool.config.Abstract(qx.tool.config.Manifest.config).set({
            baseDir: path.join(cwd, library.path)
          }));
        }
      } else if (await fs.existsAsync(qx.tool.config.Manifest.config.fileName)) {
        manifestModels.push(qx.tool.config.Manifest.getInstance());
      }
      return manifestModels;
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
