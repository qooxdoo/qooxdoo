/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */
require("qooxdoo");
const {promisify} = require('util');
const path = require('path');
require("../compiler/utils/Promisify");
const util = require("../compiler/util");
const JsonToAst = require("json-to-ast");

const fs = qx.tool.compiler.utils.Promisify.fs;

/**
 * Utility methods
 */
qx.Class.define("qx.tool.cli.Utils", {
  extend: qx.core.Object,
  
  statics: {
    /**
     * Creates a Promise which can be resolved/rejected externally - it has
     * the resolve/reject methods as properties
     * 
     * @return {Promise}
     */
    newExternalPromise: function() {
      var resolve, reject;
      var promise = new Promise((resolve_, reject_) => {
        resolve = resolve_;
        reject = reject_;
      });
      promise.resolve = resolve;
      promise.reject = reject;
      return promise;
    },

    /**
     * Error that can be thrown to indicate wrong user input  and which doesn't 
     * need a stack trace
     * @param {string} message
     * @return {Error}
     */
    UserError : function(message) {
      var error = new Error(message);
      error.name = 'UserError';
      error.stack = null;
      return error;
    },
    
    /**
     * Formats the time in a human readable format, eg "1h 23m 45.678s"
     * 
     * @param {Integer} milliseconds
     * @return {String} formatted string
     */
    formatTime: function (millisec) {
      var seconds = Math.floor(millisec / 1000);
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);
      millisec = millisec % 1000;
      
      var result = "";
      if (hours) {
        result += ((hours > 9) ? hours : "0" + hours) + "h ";
      }
      if (hours || minutes) {
        result += ((minutes > 9) ? minutes : "0" + minutes) + "m ";
      }
      if (seconds > 9 || (!hours && !minutes))
        result += seconds;
      else if (hours || minutes)
        result += "0" + seconds;
      result +=  "." + ((millisec > 99) ? "" : millisec > 9 ? "0" : "00") + millisec + "s";
      return result;
    },
    
    /**
     * Parses JSON string into an object
     * 
     * @param str {String} the data to parse
     * @return {Object}
     */
    parseJson: function(str) {
      if (str === null)
        return null;
      str = str.trim();
      if (!str)
        return null;
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
      if (! await fs.existsAsync(filename))
        return null;
      var data = await fs.readFileAsync(filename, "utf8");
      try {
        return qx.tool.cli.Utils.parseJson(data);
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
        if (await fs.existsAsync(filename))
          fs.unlinkAsync(filename);
      } else
        await fs.writeFileAsync(filename, JSON.stringify(data, null, 2), "utf8");
    },
    
    /**
     * Creates the parent directory of a filename, if it does not already exist
     * 
     * @param filename {String}
     */
    makeParentDir: async function(filename) {
      var parentDir = path.dirname(filename);
      await qx.tool.cli.Utils.makeDirs(parentDir);
    },
    
    /**
     * Creates a directory, if it does not exist, including all intermediate paths
     * 
     * @param filename {String}
     */
    makeDirs: async function(filename) {
      const mkpath = promisify(util.mkpath)
      return await mkpath(filename);
    },
    
    /*  Function to test if an object is a plain object, i.e. is constructed
    **  by the built-in Object constructor and inherits directly from Object.prototype
    **  or null. Some built-in objects pass the test, e.g. Math which is a plain object
    **  and some host or exotic objects may pass also.
    **
    **  @param {} obj - value to test
    **  @returns {Boolean} true if passes tests, false otherwise
    *
    * @see https://stackoverflow.com/a/5878101/2979698
    */
    isPlainObject: function(obj) {

      // Basic check for Type object that's not null
      if (typeof obj == 'object' && obj !== null) {

        // If Object.getPrototypeOf supported, use it
        if (typeof Object.getPrototypeOf == 'function') {
          var proto = Object.getPrototypeOf(obj);
          return proto === Object.prototype || proto === null;
        }
        
        // Otherwise, use internal class
        // This should be reliable as if getPrototypeOf not supported, is pre-ES5
        return Object.prototype.toString.call(obj) == '[object Object]';
      }
      
      // Not an object
      return false;
    }
    
  }
});
