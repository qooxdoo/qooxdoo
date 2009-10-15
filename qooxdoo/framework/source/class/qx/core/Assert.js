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

/**
 * A collection of assertions.
 *
 * These methods can be used to assert incoming parameters, return values, ...
 * If an assertion fails an {@link AssertionError} is thrown.
 *
 * Assertions are used in unit tests as well.
 */
qx.Bootstrap.define("qx.core.Assert",
{
  statics :
  {
    __logError : true,

    /**
     * Assert that the condition evaluates to <code>true</code>. An
     * {@link AssertionError} is thrown if otherwise.
     *
     * @param condition {var} Condition to check for. Must evaluate to
     *    <code>true</code>.
     * @param comment {String} Message to be shown if the assertion fails. This
     *    message is provided by the user.
     * @param msg {String} Fail message defined in the calling assertion
     */
    __assert : function(condition, comment, msg)
    {
      if (!condition)
      {
        var errorMsg = "Assertion error! " + comment + ": " + msg;
        if (this.__logError) {
          qx.log.Logger.error(errorMsg);
        }
        if (qx.Class.isDefined("qx.core.AssertionError"))
        {
          var err = new qx.core.AssertionError(comment, msg);
          if (this.__logError) {
            qx.log.Logger.error("Stack trace: \n" + err.getStackTrace());
          }
          throw err;
        } else {
          throw new Error(errorMsg);
        }
      }
    },


    /**
     * Convert an unknown value to a string to display in error messages
     *
     * @param value {var} any value
     * @return {String} a string representation of the value
     */
    __toString : function(value)
    {
      var stringValue;

      if (value === null)
      {
        stringValue = "null";
      }
      else if (qx.lang.Type.isArray(value) && value.length > 10)
      {
        stringValue = "Array[" + value.length + "]";
      }
      else
      {
        try {
          stringValue = value.toString();
        } catch(e) {
          stringValue = "";
        }
      }
      return stringValue;
    },


    /**
     * Assert that the condition evaluates to <code>true</code>.
     *
     * @param condition {var} Condition to check for. Must evaluate to
     *    <code>true</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assert : function(condition, msg) {
      this.__assert(condition == true, msg || "", "Called assert with 'false'");
    },


    /**
     * Raise an {@link AssertionError}
     *
     * @param msg {String} Message to be shown if the assertion fails.
     */
    fail : function(msg) {
      this.__assert(false, msg || "", "Called fail().");
    },


    /**
     * Assert that the value is <code>true</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>true</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertTrue : function(value, msg) {
      this.__assert(value === true, msg || "", "Called assertTrue with '" + this.__toString(value) + "'");
    },


    /**
     * Assert that the value is <code>false</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>false</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertFalse : function(value, msg) {
      this.__assert(value === false, msg || "", "Called assertFalse with '" + this.__toString(value) + "'");
    },


    /**
     * Assert that both values are equal. (Uses the equality operator
     * <code>==</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertEquals : function(expected, found, msg)
    {
      this.__assert(
        expected == found,
        msg || "",
        "Expected '" + this.__toString(expected) +
        "' but found '" + this.__toString(found) + "'!"
      );
    },

    /**
     * Assert that both values are not equal. (Uses the not equality operator
     * <code>!=</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotEquals : function(expected, found, msg)
    {
      this.__assert(
        expected != found,
        msg || "",
        "Expected '" + this.__toString(expected) +
        "' to be not equal with '" + this.__toString(found) + "'!"
      );
    },

    /**
     * Assert that both values are identical. (Uses the identity operator
     * <code>===</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertIdentical : function(expected, found, msg)
    {
      this.__assert(
        expected === found,
        msg || "",
        "Expected '" + this.__toString(expected) +
        "' (identical) but found '" + this.__toString(found) + "'!"
      );
    },


    /**
     * Assert that both values are not identical. (Uses the not identity operator
     * <code>!==</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotIdentical : function(expected, found, msg)
    {
      this.__assert(
        expected !== found,
        msg || "",
        "Expected '" + this.__toString(expected) +
        "' to be not identical with '" + this.__toString(found) + "'!"
      );
    },


    /**
     * Assert that the value is not <code>undefined</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotUndefined : function(value, msg)
    {
      this.__assert(
        value !== undefined,
        msg || "",
        "Expected value not to be undefined but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is <code>undefined</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertUndefined : function(value, msg)
    {
      this.__assert(
        value === undefined,
        msg || "",
        "Expected value to be undefined but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is not <code>null</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotNull : function(value, msg)
    {
      this.__assert(
        value !== null,
        msg || "",
        "Expected value not to be null but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is <code>null</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNull : function(value, msg)
    {
      this.__assert(value === null,
        msg || "",
        "Expected value to be null but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the first two arguments are equal, when serialized into
     * JSON.
     *
     * @param expected {var} The the expected value
     * @param found {var} The found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertJsonEquals : function(expected, found, msg) {
      this.assertEquals(
        qx.util.Json.stringify(expected),
        qx.util.Json.stringify(found),
        msg
      );
    },


    /**
     * Assert that the given string matches the regular expression
     *
     * @param str {String} String, which should match the regular expression
     * @param re {String|RegExp} Regular expression to match
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertMatch : function(str, re, msg)
    {
      this.assertString(str);
      this.assert(
        qx.lang.Type.isRegExp(re) || qx.lang.Type.isString(re),
        "The parameter 're' must be a string or a regular expression."
      );
      this.__assert(
        str.search(re) >= 0 ? true : false,
        msg || "",
        "The String '" + str + "' does not match the regular expression '" + re.toString() + "'!"
      );
    },


    /**
     * Assert that the number of arguments is within the given range
     *
     * @param args {arguments} The <code>arguments<code> variable of a function
     * @param minCount {Integer} Minimal number of arguments
     * @param maxCount {Integer} Maximum number of arguments
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArgumentsCount : function(args, minCount, maxCount, msg)
    {
      var argCount = args.length;
      this.__assert(
        (argCount >= minCount && argCount <= maxCount),
        msg || "",
        "Wrong number of arguments given. Expected '" + minCount + "' to '" +
        maxCount + "' arguments but found '" + arguments.length + "' arguments."
      )
    },


    /**
     * Assert that an event is fired.
     *
     * @param obj {Object} The object on which the event should be fired.
     * @param event {String} The event which should be fired.
     * @param invokeFunc {Function} The function which will be invoked and which
     *   fires the event.
     * @param listenerFunc {Function?null} The function which will be invoked in the
     *   listener. The function has one parameter called e which is the event.
     * @param msg {String?""} Message to be shows if the assertion fails.
     */
    assertEventFired : function(obj, event, invokeFunc, listenerFunc, msg)
    {
      var called = false;
      var listener = function(e)
      {
        if (listenerFunc) {
          listenerFunc.call(obj, e);
        }
        called = true;
      };

      var id = obj.addListener(event, listener, obj);

      invokeFunc.call();
      this.__assert(called === true, msg || "", "Event (" + event + ") not fired.");

      obj.removeListenerById(id);
    },


    /**
     * Assert that an event is not fired.
     *
     * @param obj {Object} The object on which the event should be fired.
     * @param event {String} The event which should be fired.
     * @param invokeFunc {Function} The function which will be invoked and which
     *   should not fire the event.
     * @param msg {String} Message to be shows if the assertion fails.
     */
    assertEventNotFired : function(obj, event, invokeFunc, msg)
    {
      var called = false;
      var listener = function(e) {
        called = true;
      };
      var id = obj.addListener(event, listener, obj);

      invokeFunc.call();
      this.__assert(called === false, msg || "", "Event (" + event + ") was fired.");

      obj.removeListenerById(id);
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
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertException : function(callback, exception, re, msg)
    {
      var exception = exception || Error;
      var error;

      try {
        this.__logError = false;
        callback();
      } catch(ex) {
        error = ex;
      } finally {
        this.__logError = true;
      }

      if (error == null) {
        this.__assert(false, msg || "", "The function did not raise an exception!");
      }

      this.__assert(error instanceof exception, msg || "",
        "The raised exception does not have the expected type! " + exception);

      if (re) {
        this.assertMatch(error.toString(), re, msg);
      }
    },


    /**
     * Assert that the value is an item in the given array.
     *
     * @param value {var} Value to check
     * @param array {Array} List of valid values
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInArray : function(value, array, msg)
    {
      this.__assert(
        array.indexOf(value) !== -1,
        msg || "",
        "The value '" + this.__toString(value) +
        "' must have any of the values defined in the array '"
        + this.__toString(array) + "'"
      );
    },


    /**
     * Assert that both array have identical array items.
     *
     * @param expected {Array} The expected array
     * @param found {Array} The found array
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArrayEquals : function(expected, found, msg)
    {
      this.assertArray(expected, msg);
      this.assertArray(found, msg);

      this.assertEquals(expected.length, found.length, msg);
      for (var i=0; i<expected.length; i++) {
        this.assertIdentical(expected[i], found[i], msg);
      }
    },


    /**
     * Assert that the value is a key in the given map.
     *
     * @param value {var} Value to check
     * @param map {map} Map, where the keys represent the valid values
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertKeyInMap : function(value, map, msg)
    {
      this.__assert(
        map[value] !== undefined,
        msg || "",
        "The value '" + this.__toString(value) + "' must must be a key of the map '"
        + qx.util.Json.stringify(map) + "'"
      );
    },


    /**
     * Assert that the value is a function.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertFunction : function(value, msg)
    {
      this.__assert(
        qx.lang.Type.isFunction(value),
        msg || "",
        "Expected value to be typeof function but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is a string.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertString : function(value, msg) {
      this.__assert(
        qx.lang.Type.isString(value),
        msg || "",
        "Expected value to be a string but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is a boolean.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertBoolean : function(value, msg)
    {
      this.__assert(
        qx.lang.Type.isBoolean(value),
        msg || "",
        "Expected value to be a boolean but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is a number.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNumber : function(value, msg)
    {
      this.__assert(
        qx.lang.Type.isNumber(value) && isFinite(value),
        msg || "",
        "Expected value to be a number but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is a number >= 0.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertPositiveNumber : function(value, msg)
    {
      this.__assert(
        qx.lang.Type.isNumber(value) && isFinite(value) && value >= 0,
        msg || "",
        "Expected value to be a number >= 0 but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is an integer.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInteger : function(value, msg)
    {
      this.__assert(
        (
          qx.lang.Type.isNumber(value) &&
          isFinite(value) &&
          value % 1 === 0
        ),
        msg || "",
        "Expected value to be an integer but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is an integer >= 0.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertPositiveInteger : function(value, msg)
    {
      this.__assert(
        (
          qx.lang.Type.isNumber(value) &&
          isFinite(value) &&
          value % 1 === 0 &&
          value >= 0
        ),
        msg || "",
        "Expected value to be an integer >= 0 but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is inside the given range.
     *
     * @param value {var} Value to check
     * @param min {Number} lower bound
     * @param max {Number} upper bound
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInRange : function(value, min, max, msg)
    {
      this.__assert(
        value >= min && value <= max,
        msg || "",
        qx.lang.String.format("Expected value '%1' to be in the range '%2'..'%3'!", [value, min, max])
      );
    },


    /**
     * Assert that the value is an object.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertObject : function(value, msg)
    {
      this.__assert(
        value !== null && (qx.lang.Type.isObject(value) || typeof value === "object"),
        msg || "",
        "Expected value to be typeof object but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is an array.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArray : function(value, msg)
    {
      this.__assert(
        qx.lang.Type.isArray(value),
        msg || "",
        "Expected value to be an array but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is a map either created using <code>new Object</code>
     * or by using the object literal notation <code>{ ... }</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertMap : function(value, msg)
    {
      this.__assert(
        qx.lang.Type.isObject(value),
        msg || "",
        "Expected value to be a map but found " + this.__toString(value) + "!"
      );
    },


    /**
    * Assert that the value is a regular expression.
    *
    * @param value {var} Value to check
    * @param msg {String} Message to be shown if the assertion fails.
    */
   assertRegExp : function(value, msg)
   {
     this.__assert(
       qx.lang.Type.isRegExp(value),
       msg || "",
       "Expected value to be a regular expression but found " + this.__toString(value) + "!"
     );
   },


    /**
     * Assert that the value has the given type using the <code>typeof</code>
     * operator. Because the type is not always what it is supposed to be it is
     * better to use more explicit checks like {@link #assertString} or
     * {@link #assertArray}.
     *
     * @param value {var} Value to check
     * @param type {String} expected type of the value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertType : function(value, type, msg)
    {
      this.assertString(type, "Invalid argument 'type'");

      this.__assert(
        typeof(value) === type,
        msg || "",
        "Expected value to be typeof '" + type + "' but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is an instance of the given class.
     *
     * @param value {var} Value to check
     * @param clazz {Class} The value must be an instance of this class
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInstance : function(value, clazz, msg)
    {
      var className = clazz.classname || clazz + "";

      this.__assert(
        value instanceof clazz,
        msg || "",
        "Expected value to be instanceof '" + className + "' but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value implements the given interface.
     *
     * @param value {var} Value to check
     * @param iface {Class} The value must implement this interface
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInterface : function(value, iface, msg) {
      this.__assert(
        qx.Class.implementsInterface(value, iface),
        msg || "",
        "Expected object '" + this.__toString(value) + "' to implement the interface '" + iface + "'!"
      );
    },


    /**
     * Assert that the value represents the given CSS color value. This method
     * parses the color strings and compares the RGB values. It is able to
     * parse values supported by {@link qx.util.ColorUtil.stringToRgb}.
     *
     *  @param expected {String} The expected color
     *  @param value {String} The value to check
     *  @param msg {String} Message to be shown if the assertion fails.
     */
    assertCssColor : function(expected, value, msg)
    {
      var ColorUtil = qx.util.ColorUtil;

      var expectedRgb = ColorUtil.stringToRgb(expected);
      try
      {
        var valueRgb = ColorUtil.stringToRgb(value);
      }
      catch (ex)
      {
        this.__assert(
          false,
          msg || "",
          qx.lang.String.format(
              "Expected value to be the CSS color '%1' (rgb(%2)), but found value '%3', which cannot be converted to a CSS color!",
              [expected, expectedRgb.join(","), this.__toString(value)]
            )
        );
      }

      this.__assert(
        expectedRgb[0] == valueRgb[0] && expectedRgb[1] == valueRgb[1] && expectedRgb[2] == valueRgb[2],
        msg || "",
        qx.lang.String.format(
          "Expected value to be the CSS color '%1' (rgb(%2)), but found value '%3' (rgb(%4))!",
          [this.__toString(expected), expectedRgb.join(","), this.__toString(value), valueRgb.join(",")]
        )
      );
    },


    /**
     * Assert that the value is a DOM element.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertElement : function(value, msg)
    {
      this.__assert(
        qx.dom.Node.isElement(value),
        msg || "",
        qx.lang.String.format(
          "Expected value to be a DOM element but found  '%1'!",
          [this.__toString(value)]
        )
      );
    },


    /**
     * Assert that the value is an instance of {@link qx.core.Object}.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertQxObject : function(value, msg)
    {
      this.__assert(
        value instanceof qx.core.Object,
        msg || "",
        "Expected value to be a qooxdoo object but found " + this.__toString(value) + "!"
      );
    },


    /**
     * Assert that the value is an instance of {@link qx.ui.core.Widget}.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertQxWidget : function(value, msg)
    {
      this.__assert(
        value instanceof qx.ui.core.Widget,
        msg || "",
        "Expected value to be a qooxdoo widget but found " + this.__toString(value) + "!"
      );
    }
  }
});
