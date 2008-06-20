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

qx.Mixin.define("qx.core.MAssert",
{
  members :
  {
    assertJsonEquals : function(expected, found, msg) {
      qx.core.Assert.assertJsonEquals(expected, found, msg);
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
      qx.core.Assert.assertMatch(str, re, msg);
    },


    assertArgumentsCount : function(args, minCount, maxCount, msg) {
      qx.core.Assert.assertArgumentsCount(args, minCount, maxCount, msg);
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
    assertException : function(callback, exception, re, msg) {
      qx.core.Assert.assertException(callback, exception, re, msg);
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
      qx.core.Assert.assert(bool, msg);
    },


    /**
     * TODOC
     *
     * @type member
     * @param msg {String} Message to be shown if the assertion failes.
     * @return {void}
     */
    fail : function(msg) {
      qx.core.Assert.fail(msg);
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
      qx.core.Assert.assertTrue(bool, msg);
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
      qx.core.Assert.assertFalse(bool, msg);
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
      qx.core.Assert.assertEquals(expected, found, msg);
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
      qx.core.Assert.assertIdentical(expected, found, msg);
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
      qx.core.Assert.assertNotIdentical(expected, found, msg);
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
      qx.core.Assert.assertNotUndefined(value, msg);
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
      qx.core.Assert.assertUndefined(value, msg);
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
      qx.core.Assert.assertNotNull(value, msg);
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
      qx.core.Assert.assertNull(value, msg);
    },


    assertInArray : function(value, array, msg) {
      qx.core.Assert.assertInArray(value, array, msg);
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
      qx.core.Assert.assertFunction(value, msg);
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
      qx.core.Assert.assertString(value, msg);
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
      qx.core.Assert.assertNumber(value, msg);
    },


    assertInteger : function(value, msg) {
      qx.core.Assert.assertInteger(value, msg);
    },


    assertInRange : function(value, min, max, msg) {
      qx.core.Assert.assertInRange(value, min, max, msg);
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
      qx.core.Assert.assertObject(value, msg);
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
      qx.core.Assert.assertArray(value, msg);
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
      qx.core.Assert.assertMap(value, msg);
    },

    assertType : function(value, type, msg) {
      qx.core.Assert.assertType(value, type, msg);
    },

    assertInstance : function(value, clazz, msg) {
      qx.core.Assert.assertInstance(value, clazz, msg);
    },

    assertInterface : function(object, iface, msg) {
      qx.core.Assert.assertInterface(object, iface, msg);
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
      qx.core.Assert.assertQxObject(value, msg);
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
      qx.core.Assert.assertQxWidget(value, msg);
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertJsonEqualsDebugOn : function(value, msg) {
      qx.core.Assert.assertJsonEqualsDebugOn(expected, found, msg);
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertMatchDebugOn : function(value, msg) {
      qx.core.Assert.assertMatchDebugOn(str, re, msg);
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertExceptionDebugOn : function(callback, exception, re, msg) {
      qx.core.Assert.assertExceptionDebugOn(callback, exception, re, msg);
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertDebugOn : function(bool, msg) {
      qx.core.Assert.assertDebugOn(bool, msg);
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertTrueDebugOn : function(bool, msg) {
      qx.core.Assert.assertTrueDebugOn(bool, msg);
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertEqualsDebugOn : function(expected, found, msg) {
      qx.core.Assert.assertEqualsDebugOn(expected, found, msg);
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertNotUndefinedDebugOn : function(value, msg) {
      qx.core.Assert.assertNotUndefinedDebugOn(value, msg);
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertUndefinedDebugOn : function(value, msg) {
      qx.core.Assert.assertUndefinedDebugOn(value, msg);
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertNotNullDebugOn : function(value, msg) {
      qx.core.Assert.assertNotNullDebugOn(value, msg);
    },


    /**
     *
     * This assertion is only evaluated if "qx.debug" if "on"
     * @signature function()
     */
    assertNullDebugOn : function(value, msg) {
      qx.core.Assert.assertNullDebugOn(value, msg);
    }
  }
});
