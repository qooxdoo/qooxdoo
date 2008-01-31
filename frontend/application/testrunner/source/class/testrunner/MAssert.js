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

qx.Mixin.define("testrunner.MAssert",
{
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    assertJsonEquals : function()
    {
      if (arguments.length == 3) {
        this.assertEquals(arguments[0], qx.io.Json.stringify(arguments[1]), qx.io.Json.stringify(arguments[2]));
      } else {
        this.assertEquals(qx.io.Json.stringify(arguments[0]), qx.io.Json.stringify(arguments[1]));
      }
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


    /**
     * Asserts that the callback raises a matching exception.
     *
     * @type member
     * @param callback {Function} function to check
     * @param exception {Error?Error} Required constructor of the exception.
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
        throw new testrunner.AssertionError(comment, failMsg);
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
     * @param value {var} TODOC
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    assertNotUndefined : function(value, msg) {
      this.__assert(value !== undefined, msg || "", "Expected value not to be undefined but found " + qx.io.Json.stringify(value) + "!");
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
      this.__assert(value === undefined, msg || "", "Expected value to be undefined but found " + qx.io.Json.stringify(value) + "!");
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
      this.__assert(value !== null, msg || "", "Expected value not to be null but found " + qx.io.Json.stringify(value) + "!");
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
      this.__assert(value === null, msg || "", "Expected value to be null but found " + qx.io.Json.stringify(value) + "!");
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
      this.__assert(typeof value === "function", msg || "", "Expected value to be typeof function but found " + qx.io.Json.stringify(value) + "!");
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
      this.__assert(typeof value === "string", msg || "", "Expected value to be typeof string but found " + qx.io.Json.stringify(value) + "!");
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
      this.__assert(typeof value === "number", msg || "", "Expected value to be typeof number but found " + qx.io.Json.stringify(value) + "!");
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
      this.__assert(typeof value === "object" && value !== null, msg || "", "Expected value to be typeof object but found " + qx.io.Json.stringify(value) + "!");
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
      this.__assert(value instanceof Array, msg || "", "Expected value to be an array but found " + qx.io.Json.stringify(value) + "!");
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
      this.__assert(typeof value === "object" && !(value instanceof Array) && !(value instanceof qx.core.Object), msg || "", "Expected value to be a map but found " + qx.io.Json.stringify(value) + "!");
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
      this.__assert(value instanceof qx.core.Object, msg || "", "Expected value to be a qooxdoo object but found " + qx.io.Json.stringify(value) + "!");
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
      this.__assert(value instanceof qx.ui.core.Widget, msg || "", "Expected value to be a qooxdoo widget but found " + qx.io.Json.stringify(value) + "!");
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertJsonEqualsDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function() {
        this.assertJsonEquals.apply(this, arguments);
      },

      "off" : function() {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertMatchDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function() {
        this.assertMatch.apply(this, arguments);
      },

      "off" : function() {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertExceptionDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function() {
        this.assertException.apply(this, arguments);
      },

      "off" : function() {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function() {
        this.assert.apply(this, arguments);
      },

      "off" : function() {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertTrueDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function() {
        this.assertTrue.apply(this, arguments);
      },

      "off" : function() {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertEqualsDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function() {
        this.assertEquals.apply(this, arguments);
      },

      "off" : function() {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertNotUndefinedDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function() {
        this.assertNotUndefined.apply(this, arguments);
      },

      "off" : function() {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertUndefinedDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function() {
        this.assertUndefined.apply(this, arguments);
      },

      "off" : function() {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertNotNullDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function() {
        this.assertNotNull.apply(this, arguments);
      },

      "off" : function() {}
    }),


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertNullDebugOn : qx.core.Variant.select("qx.debug",
    {
      "on" : function() {
        this.assertNull.apply(this, arguments);
      },

      "off" : function() {}
    })
  }
});
