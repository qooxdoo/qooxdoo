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

var readFile = util.promisify(fs.readFile);
var writeFile = util.promisify(fs.writeFile);
const mkParentPath = util.promisify(util.mkParentPath);

var log = util.createLog("makers");

/**
 * Base class for makers; does not include anything about targets, locales, etc (see AbstractAppMaker)
 */
module.exports = qx.Class.define("qxcompiler.makers.Maker", {
  extend: qx.core.Object,
  type: "abstract",

  properties: {
    /** Database filename relative to the target's output directory; if null, defaults to db.json; absolute paths can be used */
    dbFilename: {
      init: null,
      nullable: true,
      check: "String",
      apply: "__applyDbFilename"
    },
    
    /** Map of environment settings */
    environment: {
      init: null,
      nullable: true
    },

    /** Whether to write a typescript .d.ts file for all classes */
    outputTypescript: {
      init: false,
      nullable: false,
      check: "Boolean"
    },
    
    /** Filename for the typescript, if `outputTypescript == true` */
    outputTypescriptTo: {
      init: "qooxdoo.d.ts",
      nullable: false,
      check: "String"
    },
    
    /** Blocks automatic deleting of the output directory */
    noErase: {
      init: false,
      check: "Boolean"
    }
  },
  
  events: {
    "writingApplications": "qx.event.type.Event",
    "writingApplication": "qx.event.type.Data",
    "writtenApplication": "qx.event.type.Data",
    "writtenApplications" :"qx.event.type.Event"
  },

  members: {
    _analyser: null,
    
    /**
     * Makes the application
     * 
     * @param cb {Function} callback when complete
     * @abstract
     */
    make: function(cb) {
      throw new Error("No implementation for " + this.classname + ".make");
    },

    /**
     * Returns the output directory, with a trailing slash
     * 
     * @returns {String}
     * @abstract
     */
    getOutputDir: function() {
      throw new Error("No implementation for " + this.classname + ".getOutputDir");
    },
    
    /**
     * Erases the output directory
     */
    eraseOutputDir: async function() {
      var dir = path.resolve(this.getOutputDir());
      var pwd = path.resolve(process.cwd());
      if (pwd.startsWith(dir) && dir.length <= pwd.length)
        throw new Error("Output directory (" + dir + ") is a parent directory of PWD");
      return qxcompiler.files.Utils.deleteRecursive(this.getOutputDir());
    },
    
    /**
     * Checks the version used to compile the output directory, and deletes it if it was compiled
     * by an out of date compiler 
     */
    checkCompileVersion: async function() {
      if (this.isNoErase())
        return;
      try {
        var version = await readFile(path.join(this.getOutputDir(), "version.txt"), { encoding: "utf8" });
        if (version && version.trim() === qxcompiler.Version.VERSION)
          return;
      }catch(err) {
        if (err.code !== "ENOENT")
          throw err;
      }
      return this.eraseOutputDir();
    },
    
    /**
     * Writes the compiler version into the output directory
     */
    writeCompileVersion: async function() {
      return mkParentPath(this.getOutputDir())
        .then(() => writeFile(path.join(this.getOutputDir(), "version.txt"), qxcompiler.Version.VERSION, { encoding: "utf8" }));
    },

    /**
     * Apply for databaseName property
     * @param value
     * @param oldValue
     * @private
     */
    __applyDbFilename: function(value, oldValue) {
      if (this._analyser)
        throw new Error("Cannot change the database filename once an Analyser has been created");
    },

    /**
     * Gets the analyser, creating it if necessary
     * @returns {Analyser}
     */
    getAnalyser: function() {
      if (this._analyser)
        return this._analyser;
      this._analyser = this._createAnalyser();
      return this._analyser;
    },

    /**
     * Creates the analyser
     * @returns {Analyser}
     * @protected
     */
    _createAnalyser: function() {
      var analyser = this._analyser = new (require("../Analyser"))(this.getDbFilename());
      analyser.setOutputDir(this.getOutputDir());
      return analyser;
    },

    /**
     * Adds a library
     * @param rootDir
     * @param cb
     */
    addLibrary: function(rootDir, cb) {
      var t = this;
      var lib = new qxcompiler.app.Library();
      lib.loadManifest(rootDir, function(err) {
        if (!err)
          t.getAnalyser().addLibrary(lib);
        return cb && cb(err, lib);
      });
    }  
  }
});
