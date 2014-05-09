/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

'use strict';

/**
 * @module util
 *
 * @desc
 * Utility methods for CLDR processing.
 */

module.exports = {
  /**
   * Renames a property of the given object.
   *
   * @param {Object} obj
   * @param {string} oldName
   * @param {string} newName
   * @returns {Object}
   */
  renameProperty: function (obj, oldName, newName) {
    if (obj.hasOwnProperty(oldName)) {
      obj[newName] = obj[oldName];
      delete obj[oldName];
    }
    return obj;
  },

  /**
   * Merges two objects - the latter object overrides.
   *
   * @param {Object} obj1
   * @param {Object} obj2
   * @returns {Object}
   */
  mergeObject: function(obj1, obj2) {
    var obj = {};
    var i;
    var il = arguments.length;
    var key;

    for (i=0; i < il; i++) {
      for (key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          obj[key] = arguments[i][key];
        }
      }
    }
    return obj;
  },

  /**
   * Appends the given prefix to all properties (keys) of obj.
   *
   * @param {Object} obj - obj to manipulate
   * @param {string} prefix - prefix to append
   * @returns {Object}
   */
  appendPrefixToProperties: function(obj, prefix) {
    var clonedObj = JSON.parse(JSON.stringify(obj));
    for (var prop in clonedObj) {
      renameProperty(clonedObj, prop, prefix+prop);
    }
    return clonedObj;
  }
};

// shortcuts
var renameProperty = module.exports.renameProperty;
