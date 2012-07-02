/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Common FCE utilities
 */
qx.Class.define("fce.Util", {

  statics :
  {
    /**
     * Stringifies a map and does a little pretty-printing.
     *
     * @param data {Map} Map to be serialized
     * @return {String} Formatted JSON representation of the data
     */
    getFormattedJson : function(data)
    {
      var temp = {};
      // sort the map by key names. May or may not work depending on JS engine.
      var sortedKeys = qx.lang.Object.getKeys(data).sort();
      for (var i=0,l=sortedKeys.length; i<l; i++) {
        var key = sortedKeys[i];
        //convert non-primitive values that were serialized to allow editing back into objects
        if (data[key] === "null" ||
          /^(?:\{|\[)".*(?:\}|\])$/.test(data[key]))
        {
          temp[key] = qx.lang.Json.parse(data[key]);
        }
        else {
          temp[key] = data[key];
        }
      }
      return qx.lang.Json.stringify(temp, null, 2);
    },


    /**
     * Compares two maps.
     *
     * @param a {Map} First map
     * @param b {Map} Second map
     * @return {Boolean} <code>true</code> if the maps have equal values
     */
    mapsEqual : function(a, b)
    {
      if (qx.lang.Object.getLength(a) !== qx.lang.Object.getLength(b)) {
        return false;
      }

      for (var prop in a) {
        if (typeof b[prop] == "undefined") {
          return false;
        }
      }

      for (var prop in b) {
        if (typeof a[prop] == "undefined") {
          return false;
        }
      }

      for (var prop in a) {
        var equal = fce.Util.valuesEqual(a[prop], b[prop]);
        if (!equal) {
          return false;
        }
      }

      return true;
    },


    /**
     * Compares two values of any type.
     *
     * @param a {var} First value
     * @param b {var} Second value
     * @return {Boolean} <code>true</code> if the values are equal
     * (may not be identical)
     */
    valuesEqual : function(a, b) {
      //debugger;
      if (typeof a !== typeof b) {
        return false;
      }
      // primitives
      if (typeof a !== "object") {
        if (a !== b) {
          return false;
        }
      }
      // reference types
      else {
        // types differ
        if (a instanceof Array && !(b instanceof Array) ||
          b instanceof Array && !(a instanceof Array))
        {
          return false;
        }
        // Arrays
        if (a instanceof Array) {
          if (a.length !== b.length) {
            return false;
          }
          for (var i=0, l=a.length; i<l; i++) {
            var equal = fce.Util.valuesEqual(a[i], b[i]);
            if (!equal) {
              return false;
            }
          }
        }
        // Maps
        else {
          var equal = fce.Util.mapsEqual(a, b);
          if (!equal) {
            return false;
          }
        }
      }

      return true;
    }
  }
});