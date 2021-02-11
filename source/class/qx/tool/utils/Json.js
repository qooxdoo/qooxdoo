/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2018 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *      * oetiker
 *      * cboulanger
 *
 * *********************************************************************** */


const Ajv = require("ajv");
const betterAjvErrors = require("better-ajv-errors");
const fs = qx.tool.utils.Promisify.fs;

qx.Class.define("qx.tool.utils.Json", {

  statics: {
    /**
     * Parses JSON string into an object
     * @param str {String} the data to parse
     * @return {Object}
     */
    parseJson: function(str) {
      if (str === null || !str.trim()) {
        return null;
      }
      let ast = qx.tool.utils.json.Parser.parseToAst(str.trim());
      return qx.tool.utils.json.Stringify.astToObject(ast);
    },

    /**
     * Validates a json object against the given schema signature and outputs
     * diagnostic information if validation failed
     * @param json {Object} The json object to check
     * @param schema {Array|Object}
     *    The json-schema object or an array of schema objects. If array,
     *    only the first is used to validate, but the first schema can
     *    refer to the others.
     * @param warnOnly {Boolean} If true, do not throw a fatal error
     * @return {Boolean}
     *    Returns true if successful and false on failure if the
     *    'warnOnly' parameter is true
     */
    validate(json, schema, warnOnly=false) {
      let ajv = new Ajv({
        allErrors: true,
        jsonPointers: true
      });
      if (qx.lang.Type.isArray(schema)) {
        ajv.addSchema(schema);
        schema = schema[0].$id;
      }
      if (ajv.validate(schema, json)) {
        // success!
        return true;
      }
      if (warnOnly) {
        const message = betterAjvErrors(schema.$id, json, ajv.errors, {format: "cli", indent: 2});
        qx.tool.compiler.Console.warn("JSON data does not validate against "+ schema.$id + ":\n" + message);
        return false;
      }
      // throw fatal error
      let err = betterAjvErrors(schema.$id, json, ajv.errors, {format: "js"});
      let msg;
      if (Array.isArray(err) && err.length) {
        msg = err.reduce((prev, curr, index) => `${prev} ${index+1}) ${curr.error}`, "").trim();
      } else if (Array.isArray(ajv.errors)) {
        msg = ajv.errors.reduce((prev, curr, index) => `${prev} ${index+1}) ${curr.dataPath} ${curr.message}`, "").trim();
      } else {
        msg = "Unknown error during validation.";
      }
      throw new Error(msg);
    },

    /**
     * Identify the type and version of the config file schema in the data that
     * has been passed. Return an object containing type and version of the json
     * schema, or null if no schema could been detected
     * Todo: This needs to be rewritten.
     * @param data {Object} JSON data
     * @return {{type,version}|null}
     */
    getSchemaInfo: function(data) {
      let schemaInfo = {};
      if (data.$schema) {
        let match = data.$schema.match(/\/([^-]+)-([^.]+)\.json$/);
        if (match) {
          schemaInfo.type = match[1].toLocaleLowerCase();
          schemaInfo.version = match[2].replace(/-/g, ".");
        } else {
          // deprecated schema url
          let match = data.$schema.match(/\/v([^/]+)\/([^.]+)\.json$/);
          if (match) {
            schemaInfo.type = match[2].toLocaleLowerCase();
            schemaInfo.version = match[1];
          }
        }
        // guess file type, this would be easy with the file name!
      } else if (data.targets) {
        schemaInfo.type = "compile";
        schemaInfo.version = "0";
      } else if (data.info && data.provides) {
        schemaInfo.type = "manifest";
        schemaInfo.version = "0";
      } else if (data.libraries || data.contribs) {
        schemaInfo.type = "qooxdoo";
        schemaInfo.version = "0";
      }
      // no schema was found
      if (Object.getOwnPropertyNames(schemaInfo).length === 0) {
        return null;
      }
      return schemaInfo;
    },

    /**
     * Loads JSON data from a file and returns it as an object; if the file does not exist, then
     * null is returned
     *
     * @param filename {String} the filename to load
     * @return {Object|null} the parsed contents, or null if the file does not exist
     */
    loadJsonAsync: async function(filename) {
      if (!await fs.existsAsync(filename)) {
        return null;
      }
      let data = await fs.readFileAsync(filename, "utf8");
      try {
        return qx.tool.utils.Json.parseJson(data);
      } catch (ex) {
        throw new Error("Failed to load " + filename + ": " + ex);
      }
    },

    /**
     * Saves JSON data to a file, or erases the file if data is null
     *
     * @param filename {String} filename to write to
     * @param data {Object|null} the data to write. If null, remove the file
     */
    saveJsonAsync: async function(filename, data) {
      if (data !== null) {
        await fs.writeFileAsync(filename, JSON.stringify(data, null, 2), "utf8");
      } else if (await fs.existsAsync(filename)) {
        fs.unlinkAsync(filename);
      }
    }
  }
});
