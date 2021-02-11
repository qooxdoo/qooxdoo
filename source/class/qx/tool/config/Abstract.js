/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019 The qooxdoo developers

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

const fs = qx.tool.utils.Promisify.fs;
const process = require("process");
const path = require("upath");
const semver = require("semver");
const get_value = require("get-value");
const set_value = require("set-value");
const unset_value = require("unset-value");

/**
 * An abstract model for config files
 */
qx.Class.define("qx.tool.config.Abstract", {
  extend: qx.core.Object,

  statics: {
    /**
     * The base URL of all json schema definitions
     */
    schemaBaseUrl: "https://qooxdoo.org/schema"
  },

  construct: function(config) {
    this.base(arguments);
    if (qx.lang.Type.isObject(config)) {
      this.set(config);
    }
    for (let prop of ["fileName", "version"]) {
      if (!this.get(prop)) {
        throw new Error(`Property ${prop} must be set when instantiating ${this.classname}`);
      }
    }
    if (!config.baseDir) {
      this.setBaseDir(process.cwd());
    }
  },

  properties: {

    /**
     * Name of the config file
     */
    fileName: {
      check: "String"
    },

    /**
     * The path to the directory containing the config file
     * Defaults to process.cwd()
     */
    baseDir: {
      check: "String"
    },

    /**
     * Schema version of the config file
     * If string, validate all data against this version of the schema
     * If null, do not validate
     */
    version: {
      validate: version => semver.coerce(version) !== null,
      check: "String",
      nullable: true
    },

    /**
     * The config data
     */
    data: {
      check: "Object",
      event: "changeData",
      validate: "_validateData",
      nullable: false
    },

    /**
     * Flag to indicate that data has changed and needs to be saved
     */
    dirty: {
      check: "Boolean",
      init: false,
      event: "changeDirty"
    },

    /**
     * Flag to indicate that data has been loaded
     */
    loaded: {
      check: "Boolean",
      init: false,
      event: "changeLoaded"
    },

    /**
     * Whether to throw an Error if validation fails (false, default),
     * or to simply output a warning to the console (true)
     */
    warnOnly: {
      check: "Boolean",
      init: false
    },

    /**
     * Whether to validate the model data (default: true)
     */
    validate: {
      check: "Boolean",
      init: true
    },

    /**
     * Whether to create the file if it doesn't exist yet (default: false)
     * Setting this to true doesn't automatically create it, you still need to
     * call save(). It just prevents an error during loading the config data.
     * Only works if a "templateFunction" has been set.
     */
    createIfNotExists: {
      check: "Boolean",
      init: false
    },

    /**
     * A function that returns the config file template which is used if no
     * file exists and the "createIfNotExists" property is set to true
     */
    templateFunction: {
      check: "Function",
      nullable: false
    }
  },

  members: {

    /**
     * The json-schema object
     */
    __schema: null,

    /**
     * Validates the given data against the schema that the model has been
     * initialized with. Throws if not valid.
     * @param data The config data
     * @private
     */
    _validateData(data) {
      if (!this.isValidate() || this.getVersion() === null) {
        return;
      }
      if (!this.__schema) {
        throw new Error(`Cannot validate - no schema available! Please load the model first.`);
      }
      try {
        qx.tool.utils.Json.validate(data, this.__schema);
      } catch (e) {
        let msg = `Error validating data for ${this.getRelativeDataPath()}: ${e.message}`;
        if (this.isWarnOnly()) {
          qx.tool.compiler.Console.warn(msg);
        } else {
          throw new qx.tool.utils.Utils.UserError(msg);
        }
      }
    },

    /**
     * The path to the configuration file
     * @return {String}
     */
    getDataPath() {
      return path.join(this.getBaseDir(), this.getFileName());
    },

    /**
     * The path to the configuration file, relative to CWD
     */
    getRelativeDataPath() {
      return path.relative(process.cwd(), this.getDataPath());
    },

    /**
     * Returns the part of the schema URI that is identical for all paths
     * @private
     */
    _getSchemaFileName() {
      let [name, ext] = this.getFileName().split(/\./);
      let version = String(semver.coerce(this.getVersion())).replace(/\./g, "-");
      return `${name}-${version}.${ext}`;
    },

    /**
     * Path to the schema json file in the file system
     * @return {String}
     */
    getSchemaPath() {
      return qx.util.ResourceManager.getInstance().toUri(`qx/tool/schema/${this._getSchemaFileName()}`);
    },

    /**
     * Returns the URL of the JSON schema
     * @return {String}
     */
    getSchemaUri() {
      return qx.tool.config.Abstract.schemaBaseUrl + "/" + this._getSchemaFileName();
    },

    /**
     * Returns the json-schema object
     * @return {Object}
     */
    getSchema() {
      return this.__schema;
    },

    /**
     * Returns true if the config file exists, false if not
     * @return {Promise<Boolean>}
     */
    async exists() {
      return await fs.existsAsync(this.getDataPath());
    },

    /**
     * This method can be used to get the config model singleton in a initialized
     * state. It loads the config data into the model, unless data has already been
     * loaded. If no argument is given, load from the file specified when the
     * instance was created. If an json object is passed, use that data. In both
     * cases, the data is validated against the schema that the model has been
     * initialized with, unless it is missing schema information (for
     * backwards-compatibility). Returns the instance for chaining. To reload
     * the data, set the "loaded" property to false first.
     *
     * @param {Object|undefined} data The json data
     * @return {qx.tool.config.Abstract} Returns the instance for chaining
     */
    async load(data=undefined) {
      if (data === undefined) {
        if (this.isLoaded()) {
          // don't load again
          return this;
        }
        if (await fs.existsAsync(this.getDataPath())) {
          // load data from file
          data = qx.tool.utils.Json.parseJson(await fs.readFileAsync(this.getDataPath(), "utf8"));
        } else if (this.isCreateIfNotExists()) {
          // we're supposed to create it, make sure we're in the library root
          if (await qx.tool.config.Manifest.getInstance().exists()) {
            // but only if we have a template
            let templateFunction = this.getTemplateFunction();
            if (templateFunction) {
              data = templateFunction.bind(this)();
              if (!qx.lang.Type.isObject(data)) {
                throw new Error(`Template for config file ${this.getRelativeDataPath()} is invalid. Must be an object.`);
              }
            } else {
              throw new Error(`Cannot create config file ${this.getRelativeDataPath()} without a template.`);
            }
          } else {
            throw new Error(`Cannot create config file ${this.getRelativeDataPath()} since no Manifest exists. Are you in the library root?`);
          }
        } else {
          throw new Error(`Cannot load config file: ${this.getRelativeDataPath()} does not exist. Are you in the library root?`);
        }
      }
      // load schema if validation is enabled
      if (this.isValidate() && this.getVersion() !== null) {
        if (!this.__schema) {
          let s = this.getSchemaPath();
          if (!fs.existsSync(s)) {
            throw new Error(`No schema file exists at ${this.getSchemaPath()}`);
          }
          this.__schema = await qx.tool.utils.Json.loadJsonAsync(s);
        }
        // check initial data
        let dataSchemaInfo = qx.tool.utils.Json.getSchemaInfo(data);
        if (!dataSchemaInfo) {
          throw new Error(`Invalid data: no schema found, must be of schema ${this.getSchemaUri()}!`);
        }
        let dataVersion = semver.coerce(dataSchemaInfo.version);
        let schemaVersion = semver.coerce(this.getVersion());
        if (dataVersion !== schemaVersion) {
          // migrate the data if possible
          data = this._migrateData(data, dataVersion, schemaVersion);
        }
      }
      // validate and save
      this.setData(data);
      this.setLoaded(true);
      return this;
    },

    /**
     * Migrates the data to a new schema if possible or throws otherwise
     * @param {Object} data
     * @param {String} dataVersion (Semver)
     * @param {String} schemaVersion (Semver)
     * @return {Object}
     * @private
     */
    _migrateData(data, dataVersion, schemaVersion) {
      let dataMjVer = Number(semver.major(dataVersion));
      let schemaMjVer = Number(semver.major(schemaVersion));
      switch (true) {
        // identical
        case (dataMjVer === schemaMjVer):
          return data;
        // 0->1: add schema id
        case (dataMjVer === 0 && schemaMjVer === 1):
          data.$schema = this.getSchemaUri();
          break;
        // throw otherwise
        default:
          throw new Error(`Configuration file schema version mismatch: expected v${schemaMjVer}, found v${dataMjVer}. Could not migrate data.`);
      }
      this.setDirty(true);
      return data;
    },

    /**
     * Returns a value from the configuration map
     * @param prop_path {String|Array} The property path. See https://github.com/jonschlinkert/get-value#usage
     * @param options {*?} See https://github.com/jonschlinkert/get-value#options
     * @return {*}
     */
    getValue(prop_path, options) {
      return get_value(this.getData(), prop_path, options);
    },

    /**
     * Sets a value from the configuration map and validates the result against
     * the json schema of the model
     * @param prop_path {String|Array} The property path. See https://github.com/jonschlinkert/set-value#usage
     * @param value {*}
     * @param options {*?} See https://github.com/jonschlinkert/get-value#options
     * @return {qx.tool.config.Abstract} Returns the instance for chaining
     */
    setValue(prop_path, value, options) {
      let originalValue = this.getValue(prop_path, options);
      set_value(this.getData(), prop_path, value, options);
      try {
        this.validate();
      } catch (e) {
        // revert change
        if (originalValue === undefined) {
          unset_value(this.getData(), prop_path);
        } else {
          set_value(this.getData(), prop_path, originalValue, options);
        }
        // throw
        throw e;
      }
      this.setDirty(true);
      return this;
    },

    /**
     * Unsets a property from the configuration map and validates the model
     * @param prop_path {String|Array} The property path. See https://github.com/jonschlinkert/set-value#usage
     * @param options {*?} See https://github.com/jonschlinkert/get-value#options
     * @return {qx.tool.config.Abstract} Returns the instance for chaining
     */
    unset(prop_path, options) {
      let originalValue = this.getValue(prop_path, options);
      unset_value(this.getData(), prop_path);
      try {
        this.validate();
      } catch (e) {
        // revert value
        set_value(this.getData(), prop_path, originalValue, options);
        // throw
        throw e;
      }
      this.setDirty(true);
      return this;
    },

    /**
     * Transforms a value at a given property path, using a function.
     * @param prop_path {String|Array}
     *    The property path. See https://github.com/jonschlinkert/set-value#usage
     * @param transformFunc {Function}
     *    The transformation function, which receives the value of the property
     *    and returns the transformed value, which then is validated and saved.
     * @param options {*?} See https://github.com/jonschlinkert/get-value#options
     * @return {qx.tool.config.Abstract} Returns the instance for chaining
     */
    transform(prop_path, transformFunc, options) {
      let transformedValue = transformFunc(this.getValue(prop_path, options));
      if (transformedValue === undefined) {
        throw new Error("Return value of transformation fuction must not be undefined.");
      }
      this.setValue(prop_path, transformedValue, options);
      return this;
    },

    /**
     * Given a map containing property paths as keys and arbitrary values,
     * return the map with values that are true if the property path exists
     * and false otherwise.
     * @param propOrMap
     * @return {boolean|*}
     */
    keyExists(propOrMap) {
      if (qx.lang.Type.isString(propOrMap)) {
        return this.getValue(propOrMap) !== undefined;
      } else if (qx.lang.Type.isObject(propOrMap)) {
        let res = false;
        for (let key of Object.getOwnPropertyNames(propOrMap)) {
          propOrMap[key] = this.keyExists(key);
          res = res || propOrMap[key];
        }
        return res;
      }
      throw new TypeError("Invalid argument");
    },

    /**
     * Validates the stored config model data. Used when data is changed
     * outside of the API
     */
    validate() {
      this._validateData(this.getData());
    },

    /**
     * Save the data to the config file
     * @return {Promise<void>}
     */
    async save() {
      this.validate();
      await qx.tool.utils.Json.saveJsonAsync(this.getDataPath(), this.getData());
    }
  }
});
