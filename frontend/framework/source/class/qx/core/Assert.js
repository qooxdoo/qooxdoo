/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#optional(qx.ui.core.Widget)

************************************************************************ */

qx.Mixin.define("qx.core.Assert",
{
  statics :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    assertJsonEquals : function(expected, found, msg) {
      this.assertEquals(qx.util.Json.stringify(expected), qx.util.Json.stringify(found), msg);
    },


    /**
     * TODOC
     *
     * @type member
     * @param str {String} TODOC
     * @param re {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertMatch : function(str, re, msg) {
      this.__assert(str.search(re) >= 0 ? true : false, msg || "", "The String '" + str + "' does not match the regular expression '" + re.toString() + "'!");
    },


    assertArgumentsCount : function(args, minCount, maxCount, msg)
    {
      var argCount = args.length;
      this.__assert(
        (argCount >= minCount && argCount <= maxCount),
        msg || "",
        "Wrong number of arguments given. Expected '" + minCount + "' to '" + maxCount + "' arguments but found '" + arguments.length + "' arguments."
      )
    },


    /**
     * Asserts that the callback raises a matching exception.
     *
     * @type member
     * @param callback {Function} function to check
     * @param exception {Error?Error} Expected constructor of the exception.
     *   The assertion fails if the raised exception is not an instance of the
     *   parameter.
     * @param re {String|RegExp} The assertion fails if the error message does
     *   not match this parameter
     * @param msg {String} Message to be shown if the assertion failes.
     */
    assertException : function(callback, exception, re, msg)
    {
      var exception = exception || Error;
      var error;

      try {
        callback();
      } catch(e) {
        error = e;
      }

      if (error == null) {
        this.__assert(false, msg || "", "The function did not raise an exception!");
      }

      this.__assert(error instanceof exception, msg || "", "The raised exception does not have the expected type!");

      if (re) {
        this.assertMatch(error.toString(), re, msg);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param condition {var} TODOC
     * @param comment {var} TODOC
     * @param failMsg {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    __assert : function(condition, comment, failMsg)
    {
      if (!condition) {
        throw new qx.core.AssertionError(comment, failMsg);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param bool {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assert : function(bool, msg) {
      this.__assert(bool == true, msg || "", "Called assert with 'false'");
    },


    /**
     * TODOC
     *
     * @type member
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    fail : function(msg) {
      this.__assert(false, msg || "", "Called fail().");
    },


    /**
     * TODOC
     *
     * @type member
     * @param bool {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertTrue : function(bool, msg) {
      this.__assert(bool === true, msg || "", "Called assertTrue with 'false'");
    },


    /**
     * TODOC
     *
     * @type member
     * @param bool {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertFalse : function(bool, msg) {
      this.__assert(bool === false, msg || "", "Called assertFalse with 'true'");
    },


    /**
     * TODOC
     *
     * @type member
     * @param expected {var} TODOC
     * @param found {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertEquals : function(expected, found, msg) {
      this.__assert(expected == found, msg || "", "Expected '" + expected + "' but found '" + found + "'!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param expected {var} TODOC
     * @param found {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertIdentical : function(expected, found, msg) {
      this.__assert(expected === found, msg || "", "Expected '" + expected + "' (identical) but found '" + found + "'!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param expected {var} TODOC
     * @param found {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertNotIdentical : function(expected, found, msg) {
      this.__assert(expected !== found, msg || "", "Expected '" + expected + "' to be not identical with '" + found + "'!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertNotUndefined : function(value, msg) {
      this.__assert(value !== undefined, msg || "", "Expected value not to be undefined but found " + value + "!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertUndefined : function(value, msg) {
      this.__assert(value === undefined, msg || "", "Expected value to be undefined but found " + value + "!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertNotNull : function(value, msg) {
      this.__assert(value !== null, msg || "", "Expected value not to be null but found " + value + "!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertNull : function(value, msg) {
      this.__assert(value === null, msg || "", "Expected value to be null but found " + value + "!");
    },


    assertInArray : function(value, array, msg)
    {
      this.__assert(
        array.indexOf(value) > -1,
        msg || "",
        "The value '" + value + "' must have any of the values defined in the array '"
        + qx.util.Json.stringify(array) + "'"
      );
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertFunction : function(value, msg) {
      this.__assert(typeof value === "function", msg || "", "Expected value to be typeof function but found " + value + "!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertString : function(value, msg) {
      this.__assert(typeof value === "string", msg || "", "Expected value to be typeof string but found " + value + "!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertNumber : function(value, msg) {
      this.__assert(typeof value === "number", msg || "", "Expected value to be typeof number but found " + value + "!");
    },


    assertInteger : function(value, msg) {
      this.__assert(
        typeof value === "number" && isFinite(value) && value % 1 === 0,
        msg || "",
        "Expected value to be an integer but found " + value + "!"
      );
    },


    assertInRange : function(value, min, max, msg) {
      this.__assert(
        value >= min && value <= max,
        msg || "",
        qx.lang.String.format("Expected value '%1' to be in the range '%2'..'%3'!", value, min, max)
      );
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertObject : function(value, msg) {
      this.__assert(typeof value === "object" && value !== null, msg || "", "Expected value to be typeof object but found " + value + "!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertArray : function(value, msg) {
      this.__assert(value instanceof Array, msg || "", "Expected value to be an array but found " + value + "!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertMap : function(value, msg) {
      this.__assert(typeof value === "object" && !(value instanceof Array) && !(value instanceof qx.core.Object), msg || "", "Expected value to be a map but found " + value + "!");
    },

    assertType : function(value, type, msg) {
      this.__assert(typeof(value) === type, msg || "", "Expected value to be typeof '" + type + "' but found " + value + "!");
    },

    assertInstance : function(value, clazz, msg) {
      this.__assert(value instanceof clazz, msg || "", "Expected value to be instanceof '" + clazz + "' but found " + value + "!");
    },

    assertInterface : function(object, iface, msg) {
      this.__assert(qx.Class.hasInterface(object, iface), msg || "", "Expected object '" + object + "' to implement the interface '" + iface + "'!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertQxObject : function(value, msg) {
      this.__assert(value instanceof qx.core.Object, msg || "", "Expected value to be a qooxdoo object but found " + value + "!");
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertQxWidget : function(value, msg) {
      this.__assert(value instanceof qx.ui.core.Widget, msg || "", "Expected value to be a qooxdoo widget but found " + value + "!");
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function(expected, found, msg)
     */
    assertJsonEqualsDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function(expected, found, msg) {
        this.assertJsonEquals(expected, found, msg);
      },

      "off" : function(expected, found, msg) {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function(str, re, msg)
     */
    assertMatchDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function(str, re, msg) {
        this.assertMatch(str, re, msg);
      },

      "off" : function(str, re, msg) {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function(callback, exception, re, msg)
     */
    assertExceptionDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function(callback, exception, re, msg) {
        this.assertException(callback, exception, re, msg);
      },

      "off" : function(callback, exception, re, msg) {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function(bool, msg)
     */
    assertDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function(bool, msg) {
        this.assert(bool, msg);
      },

      "off" : function(bool, msg) {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function(bool, msg)
     */
    assertTrueDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function(bool, msg) {
        this.assertTrue(bool, msg);
      },

      "off" : function(bool, msg) {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function(expected, found, msg)
     */
    assertEqualsDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function(expected, found, msg) {
        this.assertEquals(expected, found, msg);
      },

      "off" : function(expected, found, msg) {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function(value, msg)
     */
    assertNotUndefinedDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function(value, msg) {
        this.assertNotUndefined(value, msg);
      },

      "off" : function(value, msg) {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function(value, msg)
     */
    assertUndefinedDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function(value, msg) {
        this.assertUndefined(value, msg);
      },

      "off" : function(value, msg) {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function(value, msg)
     */
    assertNotNullDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function(value, msg) {
        this.assertNotNull(value, msg);
      },

      "off" : function(value, msg) {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function(value, msg)
     */
    assertNullDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function(value, msg) {
        this.assertNull(value, msg);
      },

      "off" : function(value, msg) {}
    })
  }
});
