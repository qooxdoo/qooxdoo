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
 * Server implementation of the IShadowMetaDatabaseApi.  This is used by the compiler pool workers to receive meta data about parsed classes
 *
 * @ignore(TextDecoder)
 * @ignore(SharedArrayBuffer)
 */
qx.Class.define("qx.tool.compiler.meta.ShadowMetaDatabaseApi", {
  extend: qx.core.Object,
  implement: qx.tool.compiler.meta.IShadowMetaDatabaseApi,

  construct() {
    super();
    this.__metaByClassname = {};
    this.__packages = {};
  },

  members: {
    /** @type{Object<String, qx.tool.compiler.meta.StdClassParser.MetaData>} the raw data meta data, indexed by classname */
    __metaByClassname: null,

    /** @type{Object<String, Boolean>} the packages, indexed by package name */
    __packages: null,

    /**
     * Returns the raw meta data for the given classname
     *
     * @param {String} classname
     * @returns {qx.tool.compiler.meta.StdClassParser.MetaData?} the meta data for the given classname, or null if not found
     */
    getMetaData(classname) {
      return this.__metaByClassname[classname];
    },

    /**
     * Finds all the classnames in the given package
     *
     * @param {String} packageName
     * @returns {String[]} the classnames in the given package
     */
    getPackageClasses(packageName) {
      let classnames = [];
      for (let classname in this.__metaByClassname) {
        if (classname.startsWith(packageName + ".")) {
          classnames.push(classname);
        }
      }
      return classnames;
    },

    /**
     * Detects the type of a symbol, eg whether it is a class, package, member, environment etc
     *
     * @typedef {Object} SymbolType
     * @property {String} symbolType - the type of the symbol, one of "class", "package", "member", "environment"
     * @property {String?} className - the name of the class that the symbol belongs to, if applicable
     * @property {String} name - the name of the symbol
     *
     * @property {String} name - the name of the symbol to detect
     * @returns {SymbolType}
     */
    getSymbolType(name) {
      let classInfo = this.__metaByClassname[name];
      let packageInfo = this.__packages[name];

      if (classInfo || packageInfo) {
        return {
          symbolType: classInfo ? "class" : "package",
          className: classInfo ? name : null,
          name
        };
      }

      function testEnvironment(check) {
        let match = false;
        if (check.startsWith) {
          match = name.startsWith(check.matchString);
        } else {
          match = name == check.matchString;
        }
        if (match) {
          return {
            symbolType: "environment",
            className: check.className,
            name
          };
        }
        return null;
      }

      let envCheck = this.__environmentChecks[name];
      if (envCheck) {
        let result = testEnvironment(envCheck);
        if (result) {
          return result;
        }
      }
      for (let envCheck of Object.values(this.__environmentChecks)) {
        let result = testEnvironment(envCheck);
        if (result) {
          return result;
        }
      }

      let segs = name.split(".");
      while (segs.length > 1) {
        segs.pop();
        let tmpname = segs.join(".");
        classInfo = this.__metaByClassname[tmpname];
        if (classInfo) {
          return {
            symbolType: "member",
            className: tmpname,
            name: name
          };
        }
      }

      return null;
    },

    /**
     * @Override
     */
    async setEnvironmentChecks(environmentChecks) {
      this.__environmentChecks = environmentChecks;
    },

    /**
     * @Override
     */
    async updateClassMeta(sharedBufferMetaData) {
      let json = new TextDecoder().decode(new Uint8Array(sharedBufferMetaData));

      // @type{qx.tool.compiler.meta.StdClassParser.MetaData}
      let rawMetaData = JSON.parse(json);

      this.__metaByClassname[rawMetaData.className] = rawMetaData;

      let segs = rawMetaData.className.split(".");

      for (let i = 0; i < segs.length - 1; i++) {
        let seg = segs.slice(0, i + 1).join(".");
        this.__packages[seg] = true;
      }
    }
  }
});
