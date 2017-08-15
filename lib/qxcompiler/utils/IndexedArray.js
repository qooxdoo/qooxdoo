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
    add: function(name) {
      if (this.__lookup[name] === undefined) {
        this.__array.push(name);
        this.__lookup[name] = this.__array.length - 1;
      }
    },
    
    /**
     * Tests whether the entry exsts
     * 
     * @param name {String} the entry to check for
     * @return {Boolean} true if found
     */
    contains: function(name) {
      return this.__lookup[name];
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
     * Returns a native array
     * 
     * @param name {String} the entry to add
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
    }

  }
});
