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
     * Andreas Ecker (ecker)
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.core.Setting)

/* ************************************************************************ */

/**
 * Manage variants of source code. May it be for different debug options,
 * browsers or other environment flags.
 *
 * Variants enable the selection and removal of code from the build version.
 * A variant consists of a collection of states from which exactly one is active
 * at load time of the framework. The global map <code>qxvariants</code> can be
 * used to select a variant before the Framework is loades.
 *
 * Depending on the selected variant a specific code
 * path can be choosen using the <code>select</code> method. The generator is
 * able to set a variant and remove all code paths which are
 * not selected by the variant.
 *
 * Variants are used to implement browser optimized builds and to remove
 * debugging code from the build version. It is very similar to conditional
 * compilation in C/C++.
 *
 * Here is a list of pre-defined variant names, the possilbe values they take,
 * and their system default:
 * <table>
 *  <tr>
 *  <th>Variant name</th><th>Possible values</th><th>System default</th>
 *  </tr><tr>
 *  <td>qx.client          <td>[ "gecko", "mshtml", "opera", "webkit" ]   <td>&lt;auto-detected&gt;
 *  </tr><tr>
 *  <td>qx.debug                   <td>[ "on", "off" ]                    <td>"on"
 *  </tr><tr>
 *  <td>qx.compatibility           <td>[ "on", "off" ]                    <td>"on"
 *  </tr><tr>
 *  <td>qx.eventMonitorNoListeners <td>[ "on", "off" ]                    <td>"off"
 *  </tr><tr>
 *  <td>qx.aspects                 <td>[ "on", "off" ]                    <td>"off"
 *  </tr><tr>
 *  <td>qx.deprecationWarnings     <td>[ "on", "off" ]                    <td>"on"
 *  </tr><tr>
 *  <td>qx.dynamicLocaleSwitch     <td>[ "on", "off" ]                    <td>"on"
 *  </tr>
 * </table>
 */
qx.Bootstrap.define("qx.core.Variant",
{
  statics :
  {
    /** {Map} stored variants */
    __variants : {},


    /** {Map} cached results */
    __cache : {},


    /**
     * Pseudo function as replacement for isSet() which will only be handled by the optimizer
     *
     * @return {Boolean}
     */
    compilerIsSet : function() {
      return true;
    },


    /**
     * Define a variant
     *
     * @param key {String} An Unique key for the variant. The key must be prefixed with a
     *   namespace identifier (e.g. <code>"qx.debug"</code>)
     * @param allowedValues {String[]} An array of all allowed values for this variant.
     * @param defaultValue {String} Default value for the variant. Must be one of the values
     *   defined in <code>defaultValues</code>.
     */
    define : function(key, allowedValues, defaultValue)
    {
      if (qx.core.Variant.compilerIsSet("qx.debug", "on"))
      {
        if (!this.__isValidArray(allowedValues)) {
          throw new Error('Allowed values of variant "' + key + '" must be defined!');
        }

        if (defaultValue === undefined) {
          throw new Error('Default value of variant "' + key + '" must be defined!');
        }
      }

      if (!this.__variants[key])
      {
        this.__variants[key] = {};
      }
      else if (qx.core.Variant.compilerIsSet("qx.debug", "on"))
      {
        if (this.__variants[key].defaultValue !== undefined) {
          throw new Error('Variant "' + key + '" is already defined!');
        }
      }

      this.__variants[key].allowedValues = allowedValues;
      this.__variants[key].defaultValue = defaultValue;
    },


    /**
     * Get the current value of a variant.
     *
     * @param key {String} name of the variant
     * @return {String} current value of the variant
     */
    get : function(key)
    {
      var data = this.__variants[key];

      if (qx.core.Variant.compilerIsSet("qx.debug", "on"))
      {
        if (data === undefined) {
          throw new Error('Variant "' + key + '" is not defined.');
        }
      }

      if (data.value !== undefined) {
        return data.value;
      }

      return data.defaultValue;
    },


    /**
     * Import settings from global qxvariants into current environment
     *
     * @return {void}
     */
    __init : function()
    {
      if (window.qxvariants)
      {
        for (var key in qxvariants)
        {
          if (qx.core.Variant.compilerIsSet("qx.debug", "on"))
          {
            if ((key.split(".")).length < 2) {
              throw new Error('Malformed settings key "' + key + '". Must be following the schema "namespace.key".');
            }
          }

          if (!this.__variants[key]) {
            this.__variants[key] = {};
          }

          this.__variants[key].value = qxvariants[key];
        }

        window.qxvariants = undefined;

        try {
          delete window.qxvariants;
        } catch(ex) {};

        this.__loadUrlVariants(this.__variants);
      }
    },


    /**
     * Load variants from URL parameters if the setting <code>"qx.allowUrlSettings"</code>
     * is set to true.
     *
     * The url scheme for variants is: <code>qxvariant:VARIANT_NAME:VARIANT_VALUE</code>.
     */
    __loadUrlVariants : function()
    {
      if (qx.core.Setting.get("qx.allowUrlVariants") != true) {
        return;
      }

      var urlVariants = document.location.search.slice(1).split("&");

      for (var i=0; i<urlVariants.length; i++)
      {
        var variant = urlVariants[i].split(":");
        if (variant.length != 3 || variant[0] != "qxvariant") {
          continue;
        }

        var key = variant[1];
        if (!this.__variants[key]) {
          this.__variants[key] = {};
        }

        this.__variants[key].value = decodeURIComponent(variant[2]);
      }
    },


    /**
     * Select a function depending on the value of the variant.
     *
     * Example:
     *
     * <pre class='javascript'>
     * var f = qx.Variant.select("qx.client", {
     *   "gecko": fucntion() { ... },
     *   "mshtml|opera": function() { ... },
     *   "default": function() { ... }
     * });
     * </pre>
     *
     * Depending on the value of the <code>"qx.client"</code> variant whit will select the
     * corresponding function. The first case is selected if the variant is "gecko", the second
     * is selected if the variant is "mshtml" or "opera" and the third function is selected if
     * none of the other keys match the variant. "default" is the default case.
     *
     * @param key {String} name of the variant. To enable the generator to optimize
     *   this selection, the key must be a string literal.
     * @param variantFunctionMap {Map} map with variant names as keys and functions as values.
     * @return {Function} The selected function from the map.
     */
    select : function(key, variantFunctionMap)
    {
      if (qx.core.Variant.compilerIsSet("qx.debug", "on"))
      {
        // WARINING: all changes to this function must be duplicated in the generator!!
        // modules/variantoptimizer.py (processVariantSelect)
        if (!this.__isValidObject(this.__variants[key])) {
          throw new Error("Variant \"" + key + "\" is not defined");
        }

        if (!this.__isValidObject(variantFunctionMap)) {
          throw new Error("the second parameter must be a map!");
        }
      }

      for (var variant in variantFunctionMap)
      {
        if (this.isSet(key, variant)) {
          return variantFunctionMap[variant];
        }
      }

      if (variantFunctionMap["default"] !== undefined) {
        return variantFunctionMap["default"];
      }

      if (qx.core.Variant.compilerIsSet("qx.debug", "on"))
      {
        throw new Error('No match for variant "' + key +
          '" in variants [' + qx.lang.Object.getKeysAsString(variantFunctionMap) +
          '] found, and no default ("default") given');
      }
    },


    /**
     * Check whether a variant is set to a given value. To enable the generator to optimize
     * this selection, both parameters must be string literals.
     *
     * This method is meant to be used in if statements to select code paths. If the condition of
     * an if statement is only this method, the generator is able to optimize the if
     * statement.
     *
     * Example:
     *
     * <pre class='javascript'>
     * if (qx.core.Variant.isSet("qx.client", "mshtml")) {
     *   // some Internet Explorer specific code
     * } else if(qx.core.Variant.isSet("qx.client", "opera")){
     *   // Opera specific code
     * } else {
     *   // common code for all other browsers
     * }
     * </pre>
     *
     * @param key {String} name of the variant
     * @param variants {String} value to check for. Several values can be "or"-combined by separating
     *   them with a "|" character. A value of "mshtml|opera" would for example check if the variant is
     *   set to "mshtml" or "opera"
     * @return {Boolean} whether the variant is set to the given value
     */
    isSet : function(key, variants)
    {
      var access = key + "$" + variants;
      if (this.__cache[access] !== undefined) {
        return this.__cache[access];
      }

      var retval = false;

      // fast path
      if (variants.indexOf("|") < 0)
      {
        retval = this.get(key) === variants;
      }
      else
      {
        var keyParts = variants.split("|");

        for (var i=0, l=keyParts.length; i<l; i++)
        {
          if (this.get(key) === keyParts[i])
          {
            retval = true;
            break;
          }
        }
      }

      this.__cache[access] = retval;
      return retval;
    },


    /**
     * Whether a value is a valid array. Valid arrays are:
     *
     * * type is object
     * * instance is Array
     *
     * @name __isValidArray
     * @param v {var} the value to validate.
     * @return {Boolean} whether the variable is valid
     */
    __isValidArray : function(v) {
      return typeof v === "object" && v !== null && v instanceof Array;
    },


    /**
     * Whether a value is a valid object. Valid object are:
     *
     * * type is object
     * * instance != Array
     *
     * @name __isValidObject
     * @param v {var} the value to validate.
     * @return {Boolean} whether the variable is valid
     */
    __isValidObject : function(v) {
      return typeof v === "object" && v !== null && !(v instanceof Array);
    },


    /**
     * Whether the array contains the given element
     *
     * @name __arrayContains
     * @param arr {Array} the array
     * @param obj {var} object to look for
     * @return {Boolean} whether the array contains the element
     */
    __arrayContains : function(arr, obj)
    {
      for (var i=0, l=arr.length; i<l; i++)
      {
        if (arr[i] == obj) {
          return true;
        }
      }

      return false;
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    statics.define("qx.client", [ "gecko", "mshtml", "opera", "webkit" ], qx.bom.client.Engine.NAME);
    statics.define("qx.debug", [ "on", "off" ], "on");
    statics.define("qx.compatibility", [ "on", "off" ], "on");
    statics.define("qx.eventMonitorNoListeners", [ "on", "off" ], "off");
    statics.define("qx.aspects", [ "on", "off" ], "off");
    statics.define("qx.deprecationWarnings", [ "on", "off" ], "on");
    statics.define("qx.dynamicLocaleSwitch", [ "on", "off" ], "on");

    statics.__init();
  }
});
