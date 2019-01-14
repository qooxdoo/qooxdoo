/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
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
var path = require("upath");
var async = require('async');
require("qooxdoo");
var util = require("../util");

var readFile = util.promisify(fs.readFile);
var writeFile = util.promisify(fs.writeFile);
const mkParentPath = util.promisify(util.mkParentPath);

/**
 * Base class for makers; does not include anything about targets, locales, etc (see AbstractAppMaker)
 */
module.exports = qx.Class.define("qx.tool.compiler.makers.Maker", {
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
      return qx.tool.compiler.files.Utils.deleteRecursive(this.getOutputDir());
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
        if (version && version.trim() === qx.tool.compiler.Version.VERSION)
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
        .then(() => {
          writeFile(path.join(this.getOutputDir(), "version.txt"), qx.tool.compiler.Version.VERSION, { encoding: "utf8" })
          let s = {};
          s["compiler"] = qx.tool.compiler.Version.VERSION;
          s.libraries = {};
          let libs = this.getAnalyser().getLibraries();
          libs.forEach(lib => {
             s.libraries[lib.getNamespace()] = lib.getVersion();
          });
          writeFile(path.join(this.getOutputDir(), "versions.json"), JSON.stringify(s, null, 2), { encoding: "utf8" })
        });
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
      var analyser = this._analyser = new (require("../Analyser"))(path.join(this.getOutputDir(), (this.getDbFilename()||"db.json")));
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
      var lib = new qx.tool.compiler.app.Library();
      lib.loadManifest(rootDir, function(err) {
        if (!err)
          t.getAnalyser().addLibrary(lib);
        return cb && cb(err, lib);
      });
    }
   
  }
});
