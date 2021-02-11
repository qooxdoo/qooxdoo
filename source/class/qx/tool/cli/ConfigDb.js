/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2018 Zenesis Ltd

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */


const path = require("path");

/**
 * Controls access to the local configuration
 */
qx.Class.define("qx.tool.cli.ConfigDb", {
  extend: qx.core.Object,
  
  construct: function() {
    this.base(arguments);
    this.__overrides = {};
  },

  properties: {
    path: {
      nullable: false,
      check: "String",
      apply: "_applyPath"
    }
  },

  members: {
    __db: null,
    __overrides: null,

    /**
     * Apply for path property
     * @returns
     */
    _applyPath: async function(value, oldValue) {
      this.__db = {};
    },

    /**
     * Loads the configuration
     */
    load: async function() {
      this.__db = (await qx.tool.utils.Json.loadJsonAsync(this.getPath())) || {};
    },

    /**
     * Saves the configuration
     */
    save: async function() {
      await qx.tool.utils.Utils.makeParentDir(this.getPath());
      await qx.tool.utils.Json.saveJsonAsync(this.getPath(), this.__db);
    },
    
    /**
     * Sets a temporary override
     */
    setOverride(key, value) {
      if (value === undefined) {
        delete this.__overrides[key];
      } else {
        this.__overrides[key] = value;
      }
    },

    /**
     * Returns the database root.  If the `path` parameter is provided, this will try and locate it;
     * if `defaultValue` is provided then it will create the object and also any intermediate objects
     * along the way.  If `path` is not returned, then the root object is returned
     *
     * @param path {String?} optional path into the database; note array subscripts are not supported
     * @param defaultValue {Object?} optional value to assign if it does not exist.
     * @return {Object?} the value
     */
    db: function(path, defaultValue) {
      if (path) {
        let override = this.__overrides[path];
        if (override) {
          return override;
        }
        var result = this.__db;
        var segs = path.split(".");
        for (var i = 0; i < segs.length; i++) {
          let seg = segs[i];
          var tmp = result[seg];
          if (tmp === undefined) {
            if (defaultValue === undefined) {
              return undefined;
            }
            if (i == segs.length - 1) {
              tmp = result[seg] = defaultValue;
            } else {
              tmp = result[seg] = {};
            }
          }
          result = tmp;
        }
        return result;
      }
      return this.__db;
    }
  },

  defer: function(statics) {
    statics.__directory = path.join(require("os").homedir(), ".qooxdoo/");
  },

  statics: {
    /** Singleton default instance */
    __instance: null,

    /** The directory where config files (any any other temporary/cached data) is kept */
    __directory: null,

    /**
     * Gets the default instance of ConfigDb, loaded with the global config
     *
     * @returns {ConfigDb}
     */
    getInstance: async function() {
      let db = qx.tool.cli.ConfigDb.__instance;
      if (!db) {
        db = qx.tool.cli.ConfigDb.__instance = new qx.tool.cli.ConfigDb();
        db.setPath(path.join(qx.tool.cli.ConfigDb.getDirectory(), "config.json"));
        await db.load();
      }
      return db;
    },

    /**
     * Returns the local directory, where cache and configuration are kept
     */
    getDirectory: function() {
      return this.__directory;
    },

    /**
     * Wrapper for non-static version of db
     *
     * @see qx.tool.cli.ConfigDb.db
     */
    db: function(path, defaultValue) {
      return qx.tool.cli.ConfigDb.getInstance().db(path, defaultValue);
    }
  }
});
