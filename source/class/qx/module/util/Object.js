/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

/**
 * Helper functions to handle an Object as a Hash map.
 *
 * @group (Utilities)
 * @require (qx.module.util.Array)
 */
qx.Bootstrap.define("qx.module.util.Object", {
  statics : {
    /**
     * Return a copy of an Object
     *
     * @signature function(source, deep)
     * @attachStatic {qxWeb, object.clone}
     *
     * @param source {Object} Object to copy
     * @param deep {Boolean} If the clone should be a deep clone.
     * @return {Object} A copy of the object
     */
    clone : qx.lang.Object.clone,

    /**
     * Get the values of a map as array
     *
     * @signature function(map)
     * @attachStatic {qxWeb, object.getValues}
     *
     * @param map {Object} the map
     * @return {Array} array of the values of the map
     */
    getValues : qx.lang.Object.getValues,

    /**
     * Inverts a map by exchanging the keys with the values.
     *
     * @signature function(map)
     * @attachStatic {qxWeb, object.invert}
     *
     * If the map has the same values for different keys, information will get lost.
     * The values will be converted to strings using the toString methods.
     *
     * @param map {Object} Map to invert
     * @return {Object} inverted Map
     */
    invert : qx.lang.Object.invert,


    /**
     * Whether the map contains the given value.
     *
     * @signature function(map, value)
     * @attachStatic {qxWeb, object.contains}
     *
     * @param map {Object} Map to search for the value
     * @param value {var} Value to look for
     * @return {Boolean} Whether the value was found in the map.
     */
    contains : qx.lang.Object.contains,


    /**
     * Merges one or more objects into the 'target' object.
     * *The objects are merged by overwriting existing keys.*
     *
     * @attachStatic {qxWeb, object.merge}
     *
     * @param target {Object} target object to merge into
     * @param varargs {var} As many items as you want to merge.
     * @return {Object} the merged object
     */
    merge : function(target, varargs) {

      var varargs = qxWeb.array.fromArguments(arguments);
      var target = varargs.shift();

      varargs.forEach(function(sourceObject) {
        target = qx.Bootstrap.objectMergeWith(target, sourceObject);
      });

      return target;
    }
  },

  defer : function(statics) {
    qxWeb.$attachAll(this, "object");
  }
});
