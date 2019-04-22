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
 *
 * *********************************************************************** */

require("@qooxdoo/framework");
const fs = qx.tool.compiler.utils.Promisify.fs;
const JsonToAst = require("json-to-ast");

qx.Class.define("qx.tool.compiler.utils.Json", {
  
  statics: {
    /**
     * Parses JSON string into an object
     * 
     * @param str {String} the data to parse
     * @return {Object}
     */
    parseJson: function(str) {
      if (str === null) {
        return null;
      }
      str = str.trim();
      if (!str) {
        return null;
      }
      var ast = JsonToAst.parseToAst(str);
      var json = JsonToAst.astToObject(ast);
      return json;
    },
    
    /**
     * Loads JSON data from a file and returns it as an object; if the file does not exist, then
     * null is returned
     * 
     * @param filename {String} the filename to load
     * @return {Object?} the parsed contents, or null if the file does not exist
     */
    loadJsonAsync: async function(filename) {
      if (!await fs.existsAsync(filename)) {
        return null;
      }
      var data = await fs.readFileAsync(filename, "utf8");
      try {
        return qx.tool.compiler.utils.Json.parseJson(data);
      } catch (ex) {
        throw new Error("Failed to load " + filename + ": " + ex);
      }
    },
    
    /**
     * Saves JSON data to a file, or erases the file if data is null
     * 
     * @param filename {String} filename to write to
     * @param data {Object?} the data to write
     */
    saveJsonAsync: async function(filename, data) {
      if (!data) {
        if (await fs.existsAsync(filename)) {
          fs.unlinkAsync(filename);
        }
      } else {
        await fs.writeFileAsync(filename, JSON.stringify(data, null, 2), "utf8");
      }
    }
    
  }
});
