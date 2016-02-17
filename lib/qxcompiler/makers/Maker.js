/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2013 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

var fs = require("fs");
var path = require("path");
var async = require('async');
var qx = require("qooxdoo");
var util = require("../../util");

var log = util.createLog("makers");

/**
 * Base class for application makers
 */
module.exports = qx.Class.define("qxcompiler.makers.Maker", {
  extend: qx.core.Object,

  properties: {
    /** Target for the compiled application */
    target: {
      nullable: false,
      check: "qxcompiler.targets.Target",
      apply: "__applyTarget"
    },

    /** Supported Locales */
    locales: {
      nullable: false,
      init: [ "en" ],
      apply: "_applyLocales"
    }
  },

  members: {
    _analyser: null,

    /**
     * Apply for target property
     * @param value
     * @param oldValue
     * @private
     */
    __applyTarget: function(value, oldValue) {
      if (this._analyser)
          this._analyser.setOutputDir(value ? value.getOutputDir() : null);
      if (value)
        value.setLocales(this.getLocales());
    },

    /**
     * Apply for locales property
     * @param value
     * @param oldValue
     * @private
     */
    _applyLocales: function(value, oldValue) {
      if (this.getTarget())
        this.getTarget().setLocales(this.getLocales());
    },

    /**
     * Returns the output directory, with a trailing slash
     * @returns {null}
     */
    getOutputDir: function() {
      return this.getTarget().getOutputDir();
    },

    /**
     * Gets the analyser, creating it if necessary
     * @returns {null}
     */
    getAnalyser: function() {
      if (this._analyser)
        return this._analyser;
      this._analyser = this._createAnalyser();
      return this._analyser;
    },

    /**
     * Creates the analyser
     * @returns {*|exports|module.exports}
     * @private
     */
    _createAnalyser: function() {
      var analyser = this._analyser = new (require("../Analyser"))(this.getOutputDir() + "db.json");
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
      var lib = new qxcompiler.Library();
      lib.loadManifest(rootDir, function(err) {
        if (!err)
          t.getAnalyser().addLibrary(lib);
        return cb && cb(err, lib);
      });
    },

    /**
     * Updates the translations
     * @param library
     * @param cb
     */
    updateTranslations: function(library, cb) {
      this.getAnalyser().updateTranslations(library, this.getLocales(), cb);
    }

  }
});


