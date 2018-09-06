/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class is responsible for the normalization of the native Object.
 * It checks if these methods are available and, if not, appends them to
 * ensure compatibility in all browsers.
 * For usage samples, check out the attached links.
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.Object", {

  statics : {

    /**
     * Get the keys of a map as array as returned by a "for ... in" statement.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.2.3.14">Annotated ES5 Spec</a>
     *
     * @signature function(map)
     * @param map {Object} the map
     * @return {Array} array of the keys of the map
     */
    keys : qx.Bootstrap.keys,

    /**
     * Get the values of a map as array
     *
     * @param map {Object} the map
     * @return {Array} array of the values of the map
     */
    values : function(map) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertMap(map, "Invalid argument 'map'");
      }

      var arr = [];
      var keys = Object.keys(map);

      for (var i=0, l=keys.length; i<l; i++) {
        arr.push(map[keys[i]]);
      }

      return arr;
    },


    /**
     * Determines whether two values are the same value.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is">MDN web docs: Object.is()</a>
     *
     * @signature function(x,y)
     * @param x {Object} the first value to compare
     * @param y {Object} the second value to compare
     * @return {Boolean} indicating whether or not the two arguments are the same value.
     */
    is : function(x, y) {
      // SameValue algorithm
      if (x === y) { // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        return x !== 0 || 1 / x === 1 / y;
      } else {
       // Step 6.a: NaN == NaN
       return x !== x && y !== y;
      }
    }
  },

  defer : function(statics) {
    // keys
    if (!qx.core.Environment.get("ecmascript.object.keys")) {
      Object.keys = statics.keys;
    }

    // values
    if (!qx.core.Environment.get("ecmascript.object.values")) {
      Object.values = statics.values;
    }

    // is
    if (!qx.core.Environment.get("ecmascript.object.is")) {
      Object.is = statics.is;
    }
  }
});
