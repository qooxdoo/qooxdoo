/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2021 Zenesis Limited, http://www.zenesis.com
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

/**
 * A Part collects together all of the javascript files required for a single
 * part (load on demand) and merges them together as required.
 */
qx.Class.define("qx.tool.compiler.targets.meta.Part", {
  extend: qx.core.Object,

  /**
   * Constructor
   *
   * @param target {Target} the target doing the compilation
   * @param name {String} the name of the part
   * @param partIndex {Integer}
   */
  construct(target, name, partIndex) {
    super();
    this.__target = target;
    this.__name = name;
    this.__partIndex = partIndex;
    this.__packages = [];
    this.__packageLookup = {};
  },

  members: {
    __target: null,
    __name: null,
    __partIndex: -1,
    __packages: null,
    __packageLookup: null,

    addPackage(pkg) {
      if (!this.__packageLookup[pkg.toHashCode()]) {
        this.__packages.push(pkg);
        this.__packageLookup[pkg.toHashCode()] = pkg;
      }
    },

    hasPackage(pkg) {
      return Boolean(this.__packageLookup[pkg.toHashCode()]);
    },

    getDefaultPackage() {
      return this.__packages[0] || null;
    },

    serializeInto(parts) {
      let arr = (parts[this.__name] = []);
      this.__packages.forEach(pkg => arr.push(String(pkg.getPackageIndex())));
    }
  }
});
