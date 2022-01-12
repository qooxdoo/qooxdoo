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
 * Provides a simple, array like interface which uses a lookup to provide indexed
 * access.  Each element must be a string
 */
qx.Class.define("qx.tool.utils.IndexedArray", {
  extend: qx.core.Object,

  construct() {
    super();
    this.__array = [];
    this.__lookup = {};
    this.__removed = false;
  },

  properties: {
    keepSorted: {
      init: false,
      nullable: false,
      check: "Boolean"
    }
  },

  members: {
    __dirtySort: false,
    __array: null,
    __lookup: null,
    __removed: false,

    /**
     * Adds an entry
     *
     * @param name {String} the entry to add
     */
    push(name) {
      if (this.__lookup[name] === undefined) {
        this.__array.push(name);
        this.__lookup[name] = this.__array.length - 1;
        this.__dirtySort = true;
      }
    },

    /**
     * Sort the array
     *
     * @param compareFn {Function} sort comparator, if null alphabetic is used
     */
    sort(compareFn) {
      this.__array.sort(compareFn);

      // Remove any undefined from the end of the array
      for (let arr = this.__array, len = arr.length, i = len - 1; i > -1; i--) {
        if (arr[i] !== undefined) {
          if (i < len - 1) {
            arr.splice(i + 1);
          }
          break;
        }
      }

      // Remove undefined from the start of the array
      for (let arr = this.__array, len = arr.length, i = 0; i < len; i++) {
        if (arr[i] !== undefined) {
          if (i > 0) {
            arr.splice(0, i);
          }
          break;
        }
      }

      // Rebuild the lookup
      this.__array.forEach((elem, index) => {
        this.__lookup[elem] = index;
      });

      this.__dirtySort = false;
    },

    /**
     * Tests whether the entry exsts
     *
     * @param name {String} the entry to check for
     * @return {Boolean} true if found
     */
    contains(name) {
      return this.__lookup[name] !== undefined;
    },

    /**
     * Removes an entry
     *
     * @param name {String} the entry to remove
     */
    remove(name) {
      var index = this.__lookup[name];
      if (index !== undefined) {
        delete this.__array[index];
        delete this.__lookup[name];
        this.__removed = true;
      }
    },

    /**
     * Removes the last entry from the array and returns it
     *
     * @returns {String}
     */
    pop() {
      if (this.__array.length == 0) {
        return undefined;
      }
      if (this.__dirtySort && this.isKeepSorted()) {
        this.sort();
      }
      do {
        var elem = this.__array.pop();
        if (elem !== undefined) {
          delete this.__lookup[elem];
          return elem;
        }
      } while (this.__array.length > 0);
      return undefined;
    },

    /**
     * Removes the first entry from the array and returns it
     *
     * @returns {String}
     */
    shift() {
      if (this.__array.length == 0) {
        return undefined;
      }
      if (this.__dirtySort && this.isKeepSorted()) {
        this.sort();
      }
      do {
        var elem = this.__array.shift();
        if (elem !== undefined) {
          delete this.__lookup[elem];
          return elem;
        }
      } while (this.__array.length > 0);
      return undefined;
    },

    /**
     * Returns the length of the array
     *
     * @returns {Integer}
     */
    getLength() {
      return this.__array.length;
    },

    /**
     * Returns the indexed item of the array
     *
     * @returns {String}
     */
    getItem(index) {
      if (this.__dirtySort && this.isKeepSorted()) {
        this.sort();
      }
      return this.__array[index];
    },

    /**
     * Detects whether the array is empty
     *
     * @returns {Boolean}
     */
    isEmpty() {
      return this.__array.length > 0;
    },

    /**
     * Returns a native array (a copy)
     *
     * @returns {String[]}
     */
    toArray() {
      if (this.__dirtySort && this.isKeepSorted()) {
        this.sort();
      }
      if (this.__removed) {
        var result = [];
        this.__array.forEach(function (value) {
          if (value) {
            result.push(value);
          }
        });
        return result;
      }
      return this.__array.slice();
    },

    /**
     * Returns a native object (a copy)
     *
     * @returns {Object}
     */
    toObject() {
      if (this.__dirtySort && this.isKeepSorted()) {
        this.sort();
      }
      var result = {};
      this.__array.forEach(function (value) {
        result[value] = true;
      });
      return result;
    }
  }
});
