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
 * This mixin includes all assertions from {@link qx.core.Assert} to conveniently
 * call assertions. It is included into {@link qx.core.Object} if debugging code
 * is enabled. It is further included into all unit tests
 * {@link qx.dev.unit.TestCase}.
 *
 * @require(qx.core.Assert)
 */
qx.Mixin.define("qx.core.MAssert", {
  members: {
    /**
     * Assert that the condition evaluates to <code>true</code>.
     *
     * @param condition {var} Condition to check for. Must evaluate to
     *    <code>true</code>.
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assert(condition, msg) {
      qx.core.Assert.assert(condition, msg);
    },

    /**
     * Raise an {@link AssertionError}
     *
     * @param msg {String} Message to be shown if the assertion fails.
     * @param compact {Boolean?false} Show less verbose message. Default: false.
     */
    fail(msg, compact) {
      qx.core.Assert.fail(msg, compact);
    },

    /**
     * Assert that the value is <code>true</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>true</code>.
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertTrue(value, msg) {
      qx.core.Assert.assertTrue(value, msg);
    },

    /**
     * Assert that the value is <code>false</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>false</code>.
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertFalse(value, msg) {
      qx.core.Assert.assertFalse(value, msg);
    },

    /**
     * Assert that both values are equal. (Uses the equality operator
     * <code>==</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertEquals(expected, found, msg) {
      qx.core.Assert.assertEquals(expected, found, msg);
    },

    /**
     * Assert that both values are not equal. (Uses the not equality operator
     * <code>!=</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertNotEquals(expected, found, msg) {
      qx.core.Assert.assertNotEquals(expected, found, msg);
    },

    /**
     * Assert that both float values are equal. This might be needed because
     * of the natural floating point inaccuracy of computers.
     *
     * @param expected {Float} Reference value
     * @param found {Float} Found value
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertEqualsFloat(expected, found, msg) {
      qx.core.Assert.assertEqualsFloat(expected, found, msg);
    },

    /**
     * Assert that both float values are not equal. This might be needed
     * because of the natural floating point inaccuracy of computers.
     *
     * @param expected {Float} Reference value
     * @param found {Float} Found value
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertNotEqualsFloat(expected, found, msg) {
      qx.core.Assert.assertNotEqualsFloat(expected, found, msg);
    },

    /**
     * Assert that both values are identical. (Uses the identity operator
     * <code>===</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertIdentical(expected, found, msg) {
      qx.core.Assert.assertIdentical(expected, found, msg);
    },

    /**
     * Assert that both values are not identical. (Uses the not identity operator
     * <code>!==</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertNotIdentical(expected, found, msg) {
      qx.core.Assert.assertNotIdentical(expected, found, msg);
    },

    /**
     * Assert that the value is not <code>undefined</code>.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertNotUndefined(value, msg) {
      qx.core.Assert.assertNotUndefined(value, msg);
    },

    /**
     * Assert that the value is <code>undefined</code>.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertUndefined(value, msg) {
      qx.core.Assert.assertUndefined(value, msg);
    },

    /**
     * Assert that the value is not <code>null</code>.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertNotNull(value, msg) {
      qx.core.Assert.assertNotNull(value, msg);
    },

    /**
     * Assert that the value is <code>null</code>.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertNull(value, msg) {
      qx.core.Assert.assertNull(value, msg);
    },

    /**
     * Assert that the first two arguments are equal, when serialized into
     * JSON.
     *
     * @param expected {var} The expected value
     * @param found {var} The found value
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertJsonEquals(expected, found, msg) {
      qx.core.Assert.assertJsonEquals(expected, found, msg);
    },

    /**
     * Assert that the given string matches the regular expression
     *
     * @param str {String} String, which should match the regular expression
     * @param re {RegExp} Regular expression to match
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertMatch(str, re, msg) {
      qx.core.Assert.assertMatch(str, re, msg);
    },

    /**
     * Assert that the number of arguments is within the given range
     *
     * @param args {arguments} The <code>arguments<code> variable of a function
     * @param minCount {Integer} Minimal number of arguments
     * @param maxCount {Integer} Maximum number of arguments
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertArgumentsCount(args, minCount, maxCount, msg) {
      qx.core.Assert.assertArgumentsCount(args, minCount, maxCount, msg);
    },

    /**
     * Assert that an event is fired.
     *
     * @param obj {Object} The object on which the event should be fired.
     * @param event {String} The event which should be fired.
     * @param invokeFunc {Function} The function which will be invoked and which
     *   fires the event.
     * @param listener {Function?null} The function which will be invoked in the
     *   listener. The function has one parameter called e which is the event.
     * @param msg {String?""} Message to be shows if the assertion fails.
     */
    assertEventFired(obj, event, invokeFunc, listener, msg) {
      qx.core.Assert.assertEventFired(obj, event, invokeFunc, listener, msg);
    },

    /**
     * Assert that an event is not fired.
     *
     * @param obj {Object} The object on which the event should be fired.
     * @param event {String} The event which should be fired.
     * @param invokeFunc {Function} The function which will be invoked and which
     *   should not fire the event.
     * @param msg {String?} Message to be shows if the assertion fails.
     */
    assertEventNotFired(obj, event, invokeFunc, msg) {
      qx.core.Assert.assertEventNotFired(obj, event, invokeFunc, msg);
    },

    /**
     * Asserts that the callback raises a matching exception.
     *
     * @param callback {Function} function to check
     * @param exception {Error?Error} Expected constructor of the exception.
     *   The assertion fails if the raised exception is not an instance of the
     *   parameter.
     * @param re {String|RegExp} The assertion fails if the error message does
     *   not match this parameter
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertException(callback, exception, re, msg) {
      qx.core.Assert.assertException(callback, exception, re, msg);
    },

    /**
     * Assert that the value is an item in the given array.
     *
     * @param value {var} Value to check
     * @param array {Array} List of valid values
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertInArray(value, array, msg) {
      qx.core.Assert.assertInArray(value, array, msg);
    },

    /**
     * Assert that the value is NOT an item in the given array
     *
     * @param value {var} Value to check
     * @param array {Array} List of values
     * @param msg {String?} Message to be shown if the assertion fails
     */
    assertNotInArray(value, array, msg) {
      qx.core.Assert.assertNotInArray(value, array, msg);
    },

    /**
     * Assert that both array have identical array items.
     *
     * @param expected {Array} The expected array
     * @param found {Array} The found array
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertArrayEquals(expected, found, msg) {
      qx.core.Assert.assertArrayEquals(expected, found, msg);
    },

    /**
     * Assert that the value is a key in the given map.
     *
     * @param value {var} Value to check
     * @param map {Map} Map, where the keys represent the valid values
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertKeyInMap(value, map, msg) {
      qx.core.Assert.assertKeyInMap(value, map, msg);
    },

    /**
     * Assert that the value is a function.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertFunction(value, msg) {
      qx.core.Assert.assertFunction(value, msg);
    },

    /**
     * Assert that the value is a string.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertString(value, msg) {
      qx.core.Assert.assertString(value, msg);
    },

    /**
     * Assert that the value is a boolean.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertBoolean(value, msg) {
      qx.core.Assert.assertBoolean(value, msg);
    },

    /**
     * Assert that the value is a number.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertNumber(value, msg) {
      qx.core.Assert.assertNumber(value, msg);
    },

    /**
     * Assert that the value is a number >= 0.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertPositiveNumber(value, msg) {
      qx.core.Assert.assertPositiveNumber(value, msg);
    },

    /**
     * Assert that the value is an integer.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertInteger(value, msg) {
      qx.core.Assert.assertInteger(value, msg);
    },

    /**
     * Assert that the value is an integer >= 0.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertPositiveInteger(value, msg) {
      qx.core.Assert.assertPositiveInteger(value, msg);
    },

    /**
     * Assert that the value is inside the given range.
     *
     * @param value {var} Value to check
     * @param min {Number} lower bound
     * @param max {Number} upper bound
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertInRange(value, min, max, msg) {
      qx.core.Assert.assertInRange(value, min, max, msg);
    },

    /**
     * Assert that the value is an object.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertObject(value, msg) {
      qx.core.Assert.assertObject(value, msg);
    },

    /**
     * Assert that the value is an array.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertArray(value, msg) {
      qx.core.Assert.assertArray(value, msg);
    },

    /**
     * Assert that the value is a map either created using <code>new Object</code>
     * or by using the object literal notation <code>{ ... }</code>.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertMap(value, msg) {
      qx.core.Assert.assertMap(value, msg);
    },

    /**
     * Assert that the value is a regular expression.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertRegExp(value, msg) {
      qx.core.Assert.assertRegExp(value, msg);
    },

    /**
     * Assert that the value has the given type using the <code>typeof</code>
     * operator. Because the type is not always what it is supposed to be it is
     * better to use more explicit checks like {@link #assertString} or
     * {@link #assertArray}.
     *
     * @param value {var} Value to check
     * @param type {String} expected type of the value
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertType(value, type, msg) {
      qx.core.Assert.assertType(value, type, msg);
    },

    /**
     * Assert that the value is an instance of the given class.
     *
     * @param value {var} Value to check
     * @param clazz {Class} The value must be an instance of this class
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertInstance(value, clazz, msg) {
      qx.core.Assert.assertInstance(value, clazz, msg);
    },

    /**
     * Assert that the value implements the given interface.
     *
     * @param value {var} Value to check
     * @param iface {Class} The value must implement this interface
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertInterface(value, iface, msg) {
      qx.core.Assert.assertInterface(value, iface, msg);
    },

    /**
     * Assert that the value represents the given CSS color value. This method
     * parses the color strings and compares the RGB values. It is able to
     * parse values supported by {@link qx.util.ColorUtil#stringToRgb}.
     *
     *  @param expected {String} The expected color
     *  @param value {String} The value to check
     *  @param msg {String?} Message to be shown if the assertion fails.
     */
    assertCssColor(expected, value, msg) {
      qx.core.Assert.assertCssColor(expected, value, msg);
    },

    /**
     * Assert that the value is a DOM element.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertElement(value, msg) {
      qx.core.Assert.assertElement(value, msg);
    },

    /**
     * Assert that the value is an instance of {@link qx.core.Object}.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertQxObject(value, msg) {
      qx.core.Assert.assertQxObject(value, msg);
    },

    /**
     * Assert that the value is an instance of {@link qx.ui.core.Widget}.
     *
     * @param value {var} Value to check
     * @param msg {String?} Message to be shown if the assertion fails.
     */
    assertQxWidget(value, msg) {
      qx.core.Assert.assertQxWidget(value, msg);
    }
  }
});
