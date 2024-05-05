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

/**
 * Instances of Handler are used by the resource manager to handle different types of resources that
 *  need compilation.
 */
qx.Class.define("qx.tool.compiler.resources.ResourceLoader", {
  extend: qx.tool.compiler.resources.AbstractMatcher,
  type: "abstract",

  /**
   * Constructor
   *
   * @param {String} match the match for the filename
   * @param {qx.tool.compiler.resources.Manager} manager resource manager
   */
  construct(match, manager) {
    super(match);
    this.__manager = manager;
  },

  members: {
    /** @type{qx.tool.compiler.resources.Manager} the resource manager this loader belongs to */
    __manager: null,

    /**
     * Detects whether the file needs to be recompiled/coverted/analysed/ etc; this should
     * not take any time or be asynchronous, if you need to do any real work it should be
     * in `compile` because that is throttled.
     *
     * @param filename {String} absolute path to the file
     * @param fileInfo {Map?} this is the object in the resource database, contains info about the resource;
     *  this will be null if not yet in the resource database
     * @param stat {import("node:fs").Stats} Stats object from fs.stat
     *
     * @return {Boolean}
     */
    needsLoad(filename, fileInfo, stat) {
      var mtime = null;
      try {
        mtime = fileInfo.mtime && new Date(fileInfo.mtime);
      } catch (e) {}
      return !mtime || mtime.getTime() != stat.mtime.getTime();
    },

    /**
     * Allows a file to be loadeddata can be stored in the resource database by modifying the fileInfo
     *
     * @param asset {Asset} the asset to load
     */
    async load(asset) {
      throw new Error("No implementation for " + this.classname + ".compile");
    },

    /**
     * @return {qx.tool.compiler.resources.Manager} the manager
     */
    getManager() {
      return this.__manager;
    }
  }
});
