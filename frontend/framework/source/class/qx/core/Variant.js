/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Andreas Ecker (ecker)
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(core)
#require(qx.core.Bootstrap)
#ignore(auto-require)
#ignore(auto-use)

/* ************************************************************************ */

/**
 * Variant Class
 * 
 * Variants enable the selection and removal of code from the build version.
 * A variant consists of a collection of states from which exactly one is active
 * at load time of the framework. The global map <code>qxvariants</code> can be 
 * used to select a variant before the Framework is loades.
 * 
 * Depending on the selected variant a specific code
 * path can be choosen using the <code>select</code> method.
 * 
 * The generator is able to set a variant and remove all code paths which are not
 * selected by the variant.
 */
qx.Clazz.define("qx.core.Variant",
{
  statics :
  {
    /** {var} TODOC */
    __variants : {},

    /**
     * Define a variant
     *
     * @type static
     * @param key {string} An Unique key for the variant. The key must be prefixed with a
     *   namespace identifier (e.g. <code>"qx.debug"</code>)
     * @param allowedValues {string[]} An array of all allowed values for this variant.
     * @param defaultValue {string} Default value for the variant. Must be one of the values
     *   defined in <code>defaultValues</code>.
     */
    define : function(key, allowedValues, defaultValue)
    {
      if (!this.__isValidArray(allowedValues)) {
        throw new Error('Allowed values of variant "' + key + '" must be defined!');
      }

      if (defaultValue == undefined) {
        throw new Error('Default value of variant "' + key + '" must be defined!');
      }

      if (!this.__variants[key]) {
        this.__variants[key] = {};
      } else if (this.__variants[key].defaultValue !== undefined) {
        throw new Error('Variant "' + key + '" is already defined!');
      }

      this.__variants[key].allowedValues = allowedValues;
      this.__variants[key].defaultValue = defaultValue;
    },

    /**
     * Get the current value of a variant.
     *
     * @param key {string} name of the variant
     * @return {string} current value of the variant
     */
    get : function(key)
    {
      if (this.__variants[key] == undefined) {
        throw new Error('Variant "' + key + '" is not defined.');
      }

      if (this.__variants[key].defaultValue == undefined) {
        throw new Error('Variant "' + key + '" is not supported by API.');
      }

      return this.__variants[key].value || this.__variants[key].defaultValue;
    },

    /**
     * Import settings from global qxvariants into current environment
     */
    init : function()
    {
      if (window.qxvariants)
      {
        for (var key in qxvariants)
        {
          if ((key.split(".")).length !== 2) {
            throw new Error('Malformed settings key "' + key + '". Must be following the schema "namespace.key".');
          }

          if (!this.__variants[key]) {
            this.__variants[key] = {};
          }

          this.__variants[key].value = qxvariants[key];
        }

        window.qxvariants = null;
      }
    },

    /**
     * Select a code path 
     *
     * @param key {string} name of the variant
     * @param variants {var} TODOC
     * @return {call | var} TODOC
     * @throws TODOC
     */
    select : function(key, variants)
    {
      // WARINING: all changes to this function must be duplicated in the generator!!
      // modules/variantoptimizer.py (processVariantSelect)
      if (!this.__isValidObject(this.__variants[key])) {
        throw new Error("Variant \"" + key + "\" is not defined");
      }

      if (typeof variants === "string") {
        return this.__matchKey(key, variants);
      }
      else if (this.__isValidObject(variants))
      {
        for (var variant in variants)
        {
          if (this.__matchKey(key, variant)) {
            return variants[variant];
          }
        }

        if (variants["none"]) {
          return variants["none"];
        }

        throw new Error("No match for variant \"" + key + "\" found, and no default (\"none\") given");
      }
      else
      {
        throw new Error("the second parameter must be a map or a string!");
      }
    },

    /**
     * TODOC
     *
     * @type static
     * @name __matchKey
     * @access private
     * @param variantGroup {var} TODOC
     * @param key {var} TODOC
     * @return {boolean} TODOC
     */
    __matchKey : function(variantGroup, key)
    {
      var keyParts = key.split("|");

      for (var i=0; i<keyParts.length; i++)
      {
        if (keyParts[i] !== "none" && this.get(variantGroup) === keyParts[i]) {
          return true;
        }
      }

      return false;
    },

    /**
     * Whether a value is a valid array. Valid arrays are:
     * <ul>
     *   <li>type is object</li>
     *   <li>instance is Array</li>
     * </ul>
     *
     * @type static
     * @name __isValidArray
     * @access private
     * @param v {var} the value to validate.
     * @return {Boolean} whether the variable is valid
     */
    __isValidArray : function(v) {
      return typeof v === "object" && v !== null && v instanceof Array;
    },

    /**
     * Whether a value is a valid object. Valid object are:
     * <ul>
     *   <li>type is object</li>
     *   <li>instance != Array</li>
     * </ul>
     *
     * @type static
     * @name __isValidObject
     * @access private
     * @param v {var} the value to validate.
     * @return {Boolean} whether the variable is valid
     */
    __isValidObject : function(v) {
      return typeof v === "object" && v !== null && !(v instanceof Array);
    },

    /**
     * Whether the array contains the given element
     *
     * @type static
     * @name __arrayContains
     * @access private
     * @param arr {Array} the array
     * @param obj {var} object to look for
     * @return {Boolean} whether the array contains the element
     */
    __arrayContains : function(arr, obj)
    {
      for (var i=0; i<arr.length; i++)
      {
        if (arr[i] == obj) {
          return true;
        }
      }

      return false;
    }
  }
});

qx.core.Variant.init();
qx.core.Variant.define("qx.debug", [ "on", "off" ], "on");
