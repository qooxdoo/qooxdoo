/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
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
 * ************************************************************************/

var fs = require("fs");
var path = require("path");
var async = require('async');
var qx = require("qooxdoo");
var util = require("../../util");

var log = util.createLog("resource-manager");

/**
 * Instances of Handler are used by the resource manager to handle different types of resources that 
 *  need compilation.
 */
qx.Class.define("qxcompiler.resources.Handler", {
  extend: qx.core.Object,
  type: "abstract",
  
  /**
   * Constructor
   * 
   * @param matchEx {RegEx?} the reg ex to match filenames
   */
  construct: function(matchEx) {
    this.base(arguments);
    this.__matchEx = matchEx||null;
  },
  
  members: {
    /**
     * Called to determine whether this handler is appropriate for the given filename;
     * default implementation is to check the RegEx passed to the constructor
     */
    matches: function(filename) {
      return this.__matchEx !== null && this.__matchEx.test(filename);
    },

    /**
     * Detects whether the file needs to be recompiled/coverted/analysed/ etc; this should
     * not take any time or be asynchronous, if you need to do any real work it should be 
     * in `compile` because that is throttled.
     * 
     * @param filename {String} absolute path to the file
     * @param fileInfo {Map?} this is the object in the resource database, contains info about the resource;
     *  this will be null if not yet in the resource database
     * @param stat {fs.Stats} Stats object from fs.stat
     * 
     * @return {Boolean}
     */
    needsCompile: function(filename, fileInfo, stat) {
      if (this.matches(filename)) {
        var mtime = null;
        try {
          mtime = fileInfo.mtime && new Date(fileInfo.mtime);
        } catch (e) {
        }
        return !mtime || mtime.getTime() != stat.mtime.getTime()
      }
      return false;
    },
    
    /**
     * Allows a file to be recompiled/coverted/analysed/ etc; must return a Promise which resolves
     * when complete.  Data can be stored in the resource database by modifying the fileInfo
     * 
     * @param filename {String} absolute path to the file
     * @param library {Library} library which contains the resource
     * @param fileInfo {Map} this is the object in the resource database, contains info about the resource;
     *  guaranteed to not be null
     *  @return {Promise}
     */
    compile: function(filename, library, fileInfo) {
      throw new Error("No implementation for " + this.classname + ".compile");
    }
  }
});
