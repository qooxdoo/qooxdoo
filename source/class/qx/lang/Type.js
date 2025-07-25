/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Utility class with type check for all native JavaScript data types.
 *
 */
qx.Bootstrap.define("qx.lang.Type", {
  statics: {
    /**
     * Get the internal class of the value. See
     * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
     * for details.
     *
     * @signature function(value)
     * @param value {var} value to get the class for
     * @return {String} the internal class of the value
     */
    getClass: qx.Bootstrap.getClass,

    /**
     * Whether the value is a string.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a string.
     */
    isString: qx.Bootstrap.isString,

    /**
     * Whether the value is an array.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an array.
     */
    isArray: qx.Bootstrap.isArray,

    /**
     *
     * Whether the value is an POJO (ie {})
     * or an object which is created from a ES6-style class or prototypical-inheritance-based class;
     * if you need to determine whether something is a POJO and not created from a class, use isPojo instead
     *
     * Note that built-in types like Window are not deemed to be objects.
     * @signature function(value)
     * @param {*} value value to check.
     * @return {Boolean} Whether the value is an object.
     */
    isObject: qx.Bootstrap.isObject,

    /**
     * Whether the value is strictly a POJO.
     * Its prototype chain must not contain any constructors which are not the Object constructor i.e. traditional prototype-based classes or ES6 classes.
     *
     * @param {*} value
     * @returns {Boolean} Whether the value is strictly a POJO.
     */
    isPojo(value) {
      if (qx.Bootstrap.getClass(value) != "Object") {
        return false;
      }

      let prototype = Object.getPrototypeOf(value);
      while (true) {
        if (prototype === Object.prototype) {
          return true;
        }

        if (
          prototype.constructor &&
          prototype.constructor !== Object.prototype.constructor
        ) {
          return false;
        }

        //loop tail
        prototype = Object.getPrototypeOf(prototype);
      }
    },

    /**
     * Whether the value is a function.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a function.
     */
    isFunction: qx.Bootstrap.isFunction,

    /**
     * Whether the value is a function or an async function.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a function or an async function.
     */
    isFunctionOrAsyncFunction: qx.Bootstrap.isFunctionOrAsyncFunction,

    /**
     * Whether the value is a regular expression.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a regular expression.
     */
    isRegExp(value) {
      return this.getClass(value) === "RegExp";
    },

    /**
     * Whether the value is a number.
     *
     * This function checks if the _type_ of the value is Number.
     * Global properties *NaN*, *-Infinity*, *+Infinity*,
     * *Number.POSITIVE_INFINITY* and *Number.NEGATIVE_INFINITY*
     * return true.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a number.
     */
    isNumber(value) {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Number" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null &&
        (this.getClass(value) === "Number" || value instanceof Number)
      );
    },

    /**
     * Whether the value is a boolean.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a boolean.
     */
    isBoolean(value) {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Boolean" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null &&
        (this.getClass(value) === "Boolean" || value instanceof Boolean)
      );
    },

    /**
     * Whether the value is a date.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a date.
     */
    isDate(value) {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Date" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null &&
        (this.getClass(value) === "Date" || value instanceof Date)
      );
    },

    /**
     * Whether the value is a Error.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a Error.
     */
    isError(value) {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Error" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null &&
        (this.getClass(value) === "Error" || value instanceof Error)
      );
    },

    /**
     * Whether the value is a Promise.
     *
     * checks if value exists and has a function 'then'
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a Promise.
     *
     */
    isPromise(value) {
      return value != null && this.isFunction(value.then);
    }
  }
});
