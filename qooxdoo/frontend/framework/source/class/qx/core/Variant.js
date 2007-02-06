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

qx.Clazz.define("qx.core.Variant",
{
  statics :
  {
    /** {var} TODOC */
    __variants : {},

    /**
     * TODOC
     *
     * @type static
     * @name define
     * @access public
     * @param name {var} TODOC
     * @param allowedValues {var} TODOC
     * @return {void} 
     * @throws TODOC
     */
    define : function(name, allowedValues)
    {
      if (typeof this.__variants[name] !== "undefined") {
        throw new Error("Variant \"" + name + "\" is already defined");
      }

      this.__variants[name] = {};

      if (typeof allowedValues !== "undefined")
      {
        if (this.__isValidArray(allowedValues)) {
          this.__variants[name].allowedValues = allowedValues;
        } else {
          throw new Error("allowedValues is not an array");
        }
      }
    },

    /**
     * TODOC
     *
     * @type static
     * @name set
     * @access public
     * @param name {var} TODOC
     * @param value {var} TODOC
     * @return {void} 
     * @throws TODOC
     */
    set : function(name, value)
    {
      if (!this.__isValidObject(this.__variants[name])) {
        throw new Error("Variant \"" + name + "\" is not defined");
      }

      var allowedValues = this.__variants[name].allowedValues;

      if (this.__isValidArray(allowedValues))
      {
        if (!this.__arrayContains(allowedValues, value)) {
          throw new Error("Value \"" + value + "\" for variant \"" + name + "\" is not one of the allowed values \"" + allowedValues.join("\", \"") + "\"");
        }
      }

      this.__variants[name].value = value;
    },

    /**
     * TODOC
     *
     * @type static
     * @name get
     * @access public
     * @param name {var} TODOC
     * @return {var} TODOC
     * @throws TODOC
     */
    get : function(name)
    {
      if (typeof this.__variants[name] !== "undefined") {
        return this.__variants[name].value;
      } else {
        throw new Error("Variant \"" + name + "\" is not defined");
      }
    },

    /**
     * TODOC
     *
     * @type static
     * @name select
     * @access public
     * @param name {var} TODOC
     * @param variants {var} TODOC
     * @return {call | var} TODOC
     * @throws TODOC
     */
    select : function(name, variants)
    {
      // WARINING: all changes to this function must be duplicated in the generator!!
      // modules/variantoptimizer.py (processVariantSelect)
      if (!this.__isValidObject(this.__variants[name])) {
        throw new Error("Variant \"" + name + "\" is not defined");
      }

      if (typeof variants === "string") {
        return this.__matchKey(name, variants);
      }
      else if (this.__isValidObject(variants))
      {
        for (var key in variants)
        {
          if (this.__matchKey(name, key)) {
            return variants[key];
          }
        }

        if (variants["none"]) {
          return variants["none"];
        }

        throw new Error("No match for variant \"" + name + "\" found, and no default (\"none\") given");
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

/**
 * enable debugging
 */
qx.core.Variant.define("qx.debug", [ "on", "off" ]);
qx.core.Variant.set("qx.debug", "on");
