/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2025 Zenesis Limited, http://www.zenesis.com
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
 *      * Patryk Malinowski (pmalinowski@vmn.digital, @patryk-m-malinowski)
 *
 * *********************************************************************** */

/**
 * This class represents the configuration for the ClassFile transpiler. It contains various
 * settings that control how classes are transpiled, including Babel configuration, application
 * types, font names, environment variables, and more.
 *
 * The principal is that the `qx.tool.compiler.ClassFile` class does not need anything except
 * the values in this class, so that the config can be serialized and passed to the worker thread;
 * specifically, the `qx.tool.compiler.ClassFile` does not need to know about the `qx.tool.compiler.Analyzer`
 * or `qx.tool.compiler.Maker` instances, which are not serializable and cannot be passed to the worker thread.
 */
qx.Class.define("qx.tool.compiler.ClassFileConfig", {
  extend: qx.core.Object,

  properties: {
    babelConfig: {
      check: "Object"
    },

    applicationTypes: {
      init: ["browser", "node"],
      check: "Array"
    },

    fontNames: {
      init: [],
      check: "Array"
    },

    environment: {},

    addCreatedAt: {
      init: false,
      check: "Boolean"
    },

    verboseCreatedAt: {
      init: false,
      check: "Boolean"
    },

    ignores: {
      init: [],
      check: "Array"
    },

    manglePrivates: {
      init: "readable",
      check: ["off", "readable", "unreadable"]
    },

    symbols: {
      init: {},
      check: "Object"
    }
  },

  members: {
    /**
     * Converts the config to a native object
     * @returns {Object}
     */
    serialize() {
      //We will use the qx.util.Serializer for now, but this may change later
      return qx.util.Serializer.toNativeObject(this);
    }
  },

  statics: {
    createFromAnalyzer(analyzer) {
      let config = new qx.tool.compiler.ClassFileConfig();
      config.setBabelConfig(analyzer.getBabelConfig());
      config.setApplicationTypes(analyzer.getApplicationTypes());
      config.setFontNames(Object.keys(analyzer.getFonts()));
      config.setEnvironment(analyzer.getEnvironment());
      config.setAddCreatedAt(analyzer.getAddCreatedAt());
      config.setVerboseCreatedAt(analyzer.getVerboseCreatedAt());
      config.setIgnores(analyzer.getIgnores());

      let symbols;
      if (analyzer.getGlobalSymbols().length) {
        symbols = analyzer.getGlobalSymbols();
      } else {
        const CF = qx.tool.compiler.ClassFile;
        symbols = [...CF.QX_GLOBALS, ...CF.COMMON_GLOBALS, ...CF.BROWSER_GLOBALS];
      }
      config.setSymbols(symbols);
      config.setManglePrivates(analyzer.getManglePrivates());

      return config;
    },

    /**
     * Reconstructs a ClassFileConfig from a native object
     * @param {Object} obj
     * @returns {qx.tool.compiler.ClassFileConfig}
     */
    deserialize(obj) {
      return new qx.tool.compiler.ClassFileConfig().set(obj);
    }
  }
});
