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
 * *********************************************************************** */

/**
 * Base class for application makers, add targets, locales etc
 */
qx.Class.define("qx.tool.compiler.makers.AbstractAppMaker", {
  extend: qx.tool.compiler.makers.Maker,
  type: "abstract",

  properties: {
    /** Target for the compiled application */
    target: {
      nullable: false,
      check: "qx.tool.compiler.targets.Target",
      apply: "__applyTarget"
    },

    /** Supported Locales */
    locales: {
      nullable: false,
      init: [ "en" ],
      apply: "_applyLocales"
    },

    /** Whether to write all translation strings (as opposed to just those used by the classes) */
    writeAllTranslations: {
      init: false,
      nullable: false,
      check: "Boolean",
      apply: "__applyWriteAllTranslations"
    }
  },

  members: {

    /*
     * @Override
     */
    getOutputDir: function() {
      return this.getTarget().getOutputDir();
    },

    /**
     * Apply for target property
     * @param value
     * @param oldValue
     * @private
     */
    __applyTarget: function(value, oldValue) {
      if (this._analyser) {
        this._analyser.setOutputDir(value ? value.getOutputDir() : null);
      }
      if (value) {
        value.set({
          locales: this.getLocales(),
          writeAllTranslations: this.getWriteAllTranslations()
        });
      }
    },

    /**
     * Apply for writeAllTranslations
     * @param value
     * @param oldValue
     * @private
     */
    __applyWriteAllTranslations: function(value, oldValue) {
      if (this.getTarget()) {
        this.getTarget().setWriteAllTranslations(value);
      }
    },

    /**
     * Apply for locales property
     * @param value
     * @param oldValue
     * @private
     */
    _applyLocales: function(value, oldValue) {
      if (this.getTarget()) {
        this.getTarget().setLocales(value);
      }
    }
  }
});
