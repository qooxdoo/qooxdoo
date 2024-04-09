/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
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
 * *********************************************************************** */

var path = require("upath");

/**
 * Base class for makers; does not include anything about targets, locales, etc (see AbstractAppMaker)
 */
qx.Class.define("qx.tool.compiler.makers.Maker", {
  extend: qx.core.Object,
  type: "abstract",

  construct() {
    super();
    this._compiledClasses = {};
  },

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

    /** Blocks automatic deleting of the output directory */
    noErase: {
      init: false,
      check: "Boolean"
    },

    /** Whether the make has succeeded, null during/before make */
    success: {
      init: null,
      nullable: true,
      check: "Boolean"
    },

    /** Whether the make has any warnings, null during/before make */
    hasWarnings: {
      init: null,
      nullable: true,
      check: "Boolean"
    }
  },

  events: {
    making: "qx.event.type.Event",
    made: "qx.event.type.Event",
    writingApplications: "qx.event.type.Event",
    writingApplication: "qx.event.type.Data",
    writtenApplication: "qx.event.type.Data",
    writtenApplications: "qx.event.type.Event"
  },

  members: {
    /** {Analyser} current analyser (created on demand) */
    _analyser: null,

    /** Lookup of classes which have been compiled this session; this is a map where the keys are
     * the class name and the value is `true`, it is erased periodically
     */
    _compiledClasses: null,

    /**
     * Makes the application
     *
     * @abstract
     */
    async make() {
      throw new Error("No implementation for " + this.classname + ".make");
    },

    /**
     * Returns the output directory, with a trailing slash
     *
     * @returns {String}
     * @abstract
     */
    getOutputDir() {
      throw new Error(
        "No implementation for " + this.classname + ".getOutputDir"
      );
    },

    /**
     * Erases the output directory
     */
    async eraseOutputDir() {
      var dir = path.resolve(this.getOutputDir());
      var pwd = path.resolve(process.cwd());
      if (pwd.startsWith(dir) && dir.length <= pwd.length) {
        throw new Error(
          "Output directory (" + dir + ") is a parent directory of PWD"
        );
      }
      await qx.tool.utils.files.Utils.deleteRecursive(this.getOutputDir());
    },

    /**
     * Apply for databaseName property
     * @param value
     * @param oldValue
     * @private
     */
    __applyDbFilename(value, oldValue) {
      if (this._analyser) {
        throw new Error(
          "Cannot change the database filename once an Analyser has been created"
        );
      }
    },

    /**
     * Gets the analyser, creating it if necessary
     * @returns {Analyser}
     */
    getAnalyser() {
      if (this._analyser) {
        return this._analyser;
      }
      this._analyser = this._createAnalyser();
      this._analyser.addListener("compiledClass", evt => {
        let data = evt.getData();
        this._compiledClasses[data.classFile.getClassName()] = true;
      });
      return this._analyser;
    },

    /**
     * Returns a list of classes which have been compiled in this session
     *
     * @param eraseAfter {Boolean?} if true, the list is reset after returning
     * @return {Map} list of class names that have been compiled
     */
    getRecentlyCompiledClasses(eraseAfter) {
      let classes = this._compiledClasses;
      if (eraseAfter) {
        this._compiledClasses = {};
      }
      return classes;
    },

    /**
     * Creates the analyser
     * @returns {Analyser}
     * @protected
     */
    _createAnalyser() {
      var analyser = (this._analyser = new qx.tool.compiler.Analyser(
        path.join(this.getOutputDir(), this.getDbFilename() || "db.json")
      ));

      analyser.setOutputDir(this.getOutputDir());
      return analyser;
    }
  }
});
