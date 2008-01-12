/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)
#ignore(auto-require)
#require(qx.core.Client)
#require(qx.core.Variant)

************************************************************************ */

/**
 * Helper functions to handle Object as a Hash map.
 */
qx.Class.define("qx.lang.Object",
{
  statics :
  {
    /**
     * Check if the hash has any keys
     *
     * @type static
     * @param map {Object} the map to check
     * @return {Boolean} whether the map has any keys
     */
    isEmpty : function(map)
    {
      for (var key in map) {
        return false;
      }

      return true;
    },


    /**
     * Check whether the number of objects in the maps is at least "length"
     *
     * @type static
     * @param map {Object} the map to check
     * @param length {Integer} minimum number of objects in the map
     * @return {Boolean} whether the map contains at least "length" objects.
     */
    hasMinLength : function(map, length)
    {
      var i = 0;

      for (var key in map)
      {
        if ((++i) >= length) {
          return true;
        }
      }

      return false;
    },


    /**
     * Get the number of objects in the map
     *
     * @type static
     * @param map {Object} the map
     * @return {Integer} number of objects in the map
     */
    getLength : function(map)
    {
      var i = 0;

      for (var key in map) {
        i++;
      }

      return i;
    },


    _shadowedKeys :
    [
      "isPrototypeOf",
      "hasOwnProperty",
      "toLocaleString",
      "toString",
      "valueOf"
    ],


    /**
     * Get the keys of a map as array as returned by a "for ... in" statement.
     *
     * TODO: Rename to keys() like in prototype and python
     *
     * @type static
     * @param map {Object} the map
     * @return {Array} array of the keys of the map
     */
    getKeys : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(map)
      {
        var arr = [];
        for (var key in map) {
          arr.push(key);
        }

        // IE does not return "shadowed" keys even if they are defined directly
        // in the object. This is incompatible to the ECMA standard!!
        // This is why this checks are needed.
        for (var i=0, a=this._shadowedKeys, l=a.length; i<l; i++)
        {
          if (map.hasOwnProperty(a[i])) {
            arr.push(a[i]);
          }
        }

        return arr;
      },

      "default" : function(map)
      {
        var arr = [];

        for (var key in map) {
          arr.push(key);
        }

        return arr;
      }
    }),


    /**
     * Get the keys of a map as string
     *
     * @type static
     * @param map {Object} the map
     * @return {String} String of the keys of the map
     *         The keys are separated by ", "
     */
    getKeysAsString : function(map)
    {
      var keys = qx.lang.Object.getKeys(map);
      if (keys.length == 0) {
        return "";
      }

      return '"' + keys.join('\", "') + '"';
    },


    /**
     * Get the values of a map as array
     *
     * TODO: Rename to values() like in prototype and python
     *
     * @type static
     * @param map {Object} the map
     * @return {Array} array of the values of the map
     */
    getValues : function(map)
    {
      var arr = [];

      for (var key in map) {
        arr.push(map[key]);
      }

      return arr;
    },


    /**
     * Inserts all keys of the source object into the
     * target objects. Attention: The target map gets modified.
     *
     * @type static
     * @param target {Object} target object
     * @param source {Object} object to be merged
     * @param overwrite {Boolean ? true} If enabled existing keys will be overwritten
     * @return {Object} Target with merged values from the source object
     */
    mergeWith : function(target, source, overwrite)
    {
      if (overwrite === undefined) {
        overwrite = true;
      }

      for (var key in source)
      {
        if (overwrite || target[key] === undefined) {
          target[key] = source[key];
        }
      }

      return target;
    },


    /**
     * Inserts all keys of the source object into the
     * target objects.
     *
     * @type static
     * @param target {Object} target object
     * @param source {Object} object to be merged
     * @return {Object} target with merged values from source
     * @deprecated
     */
    carefullyMergeWith : function(target, source) {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee);
      return qx.lang.Object.mergeWith(target, source, false);
    },


    /**
     * Merge a number of objects.
     *
     * @type static
     * @param target {Object} target object
     * @param varargs {Object} variable number of objects to merged with target
     * @return {Object} target with merged values from the other objects
     */
    merge : function(target, varargs)
    {
      var len = arguments.length;

      for (var i=1; i<len; i++) {
        qx.lang.Object.mergeWith(target, arguments[i]);
      }

      return target;
    },


    /**
     * Return a copy of an Object
     *
     * TODO: Rename to clone() like in prototype and python
     *
     * @type static
     * @param source {Object} Object to copy
     * @return {Object} copy of vObject
     */
    copy : function(source)
    {
      var clone = {};

      for (var key in source) {
        clone[key] = source[key];
      }

      return clone;
    },


    /**
     * Inverts a Map by exchanging the keys with the values.
     * If the map has the same values for different keys, information will get lost.
     * The values will be converted to Strings using the toString methos.
     *
     * @type static
     * @param map {Object} Map to invert
     * @return {Object} inverted Map
     */
    invert : function(map)
    {
      var result = {};

      for (var key in map) {
        result[map[key].toString()] = key;
      }

      return result;
    },


    /**
     * Get the key of the given value from a map.
     * If the map has more than one key matching the value the fist match is returned.
     * If the map does not contain the value <code>null</code> is returned.
     *
     * @param obj {Object} Map to search for the key
     * @param value {var} Value to look for
     * @return {String|null} Name of the key (null if not found).
     */
    getKeyFromValue: function(obj, value)
    {
      for (var key in obj)
      {
        if (obj[key] === value) {
          return key;
        }
      }

      return null;
    },


    /**
    * Selects the value with the given key from the map.
    *
    * @param key {String} name of the key to get the value from
    * @param map {Object} map to get the value from
    * @return {var} value for the given key from the map
    */
    select: function(key, map) {
      return map[key];
    },


    /**
    * Convert an array into a map.
    *
    * All elements of the array become keys of the returned map by
    * calling "toString" on the array elements. The values of the
    * map are set to "true"
    *
    * @param array {Array} array to convert
    * @return {Map} the array converted to a map.
    */
    fromArray: function(array)
    {
      var obj = {};

      for (var i=0, l=array.length; i<l; i++)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          switch(typeof array[i])
          {
            case "object":
            case "function":
            case "undefined":
              throw new Error("Could not convert complex objects like " + array[i] + " at array index "+ i +" to map syntax");
          }
        }

        obj[array[i].toString()] = true;
      }

      return obj;
    }
  }
});
