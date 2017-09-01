/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
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

var qx = require("qooxdoo");

/**
 * Provides a simple, array like interface which uses a lookup to provide indexed
 * access.  Each element must be a string
 */
qx.Class.define("qxcompiler.utils.IndexedArray", {
  extend: qx.core.Object,
  
  construct: function() {
    this.base(arguments);
    this.__array = [];
    this.__lookup = {};
    this.__removed = false;
  },
  
  members: {
    
    /**
     * Adds an entry
     * 
     * @param name {String} the entry to add
     */
    push: function(name) {
      if (this.__lookup[name] === undefined) {
        this.__array.push(name);
        this.__lookup[name] = this.__array.length - 1;
      }
    },
    
    /**
     * Sort the array
     * 
     * @param compareFn {Function} sort comparator, if null alphabetic is used
     */
    sort: function(compareFn) {
      this.__array.sort(compareFn);
      this.__array.forEach((elem, index) => {
        this.__lookup[elem] = index;
      });
    },
    
    /**
     * Tests whether the entry exsts
     * 
     * @param name {String} the entry to check for
     * @return {Boolean} true if found
     */
    contains: function(name) {
      return this.__lookup[name] !== undefined;
    },
    
    /**
     * Removes an entry
     * 
     * @param name {String} the entry to remove
     */
    remove: function(name) {
      var index = this.__lookup[name];
      if (index !== undefined) {
        delete this.__array[index];
        delete this.__lookup[name];
        this.__removed = true;
      }
    },
    
    /**
     * Removes the last entry form the array and returns it
     * 
     * @returns {String}
     */
    pop: function() {
      if (this.__array.length == 0)
        return undefined;
      var elem = this.__array.pop();
      delete this.__lookup[elem];
      return elem;
    },
    
    /**
     * Returns the length of the array
     */
    getLength: function() {
      return this.__array.length;
    },
    
    /**
     * Returns the indexed item of the array
     */
    getItem: function(index) {
      return this.__array[index];
    },
    
    /**
     * Returns a native array (a copy)
     * 
     * @returns {String[]}
     */
    toArray: function() {
      if (this.__removed) {
        var result = [];
        this.__array.forEach(function(value) {
          if (value)
            result.push(value);
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
    toObject: function() {
      var result = {};
      this.__array.forEach(function(value) {
        result[value] = true;
      });
      return result;
    }

  }
});
