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
 * A collection of assertions.
 *
 * These methods can be used to assert incoming parameters, return values, ...
 * If an assertion fails an {@link AssertionError} is thrown.
 *
 * Assertions are used in unit tests as well.
 *
 * @require(qx.lang.Type)
 * @ignore(qx.Class.*)
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
     * @param comment {String} Message to be shown if the assertion fails. This
     *    message is provided by the user.
     * @param msgvarargs {var} any number of parts of a message to show if assertion
     *                         triggers. Each will be converted to a string and all
     *                         parts will be concatenated. E. g. instead of
     *                         "Got invalid value " + this.__toString(val) + "!!!!!"
     *                         use
     *                         "Got invalid value ", val, "!!!!!"
     *                         (much better performance)
     *
     */
    __fail : function(comment, msgvarargs)
    {
      // Build up message from message varargs. It's not really important
      // how long this takes as it is done only when assertion is triggered
      var msg = "";
      for (var i=1, l=arguments.length; i<l; i++)
      {
        msg = msg + this.__toString(arguments[i] === undefined ? "'undefined'" : arguments[i]);
      }

      var fullComment = "";
      if (msg) {
        fullComment = comment + ": " + msg;
      } else {
        fullComment = comment;
      }
      var errorMsg = "Assertion error! " + fullComment;

      if (qx.Class && qx.Class.isDefined("qx.core.AssertionError"))
      {
        var err = new qx.core.AssertionError(comment, msg);
        if (this.__logError) {
          qx.Bootstrap.error(errorMsg + "\n Stack trace: \n" + err.getStackTrace());
        }
        throw err;
      }
      else
      {
        if (this.__logError) {
          qx.Bootstrap.error(errorMsg);
        }
        throw new Error(errorMsg);
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
      } else if ((value instanceof Object) && (value.toString == null))
      {
        stringValue = qx.lang.Json.stringify(value, null, 2);
      } else
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
      condition == true || this.__fail(msg || "", "Called assert with 'false'");
    },


    /**
     * Raise an {@link AssertionError}.
     *
     * @param msg {String} Message to be shown if the assertion fails.
     * @param compact {Boolean} Show less verbose message. Default: false.
     */
    fail : function(msg, compact) {
      var msgvarargs = compact ? "" : "Called fail().";
      this.__fail(msg || "", msgvarargs);
    },


    /**
     * Assert that the value is <code>true</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>true</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertTrue : function(value, msg) {
      (value === true) || this.__fail(msg || "", "Called assertTrue with '", value, "'");
    },


    /**
     * Assert that the value is <code>false</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>false</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertFalse : function(value, msg) {
      (value === false) || this.__fail(msg || "", "Called assertFalse with '", value, "'");
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
      expected == found || this.__fail(
        msg || "",
        "Expected '", expected,
        "' but found '", found, "'!"
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
        expected != found || this.__fail(
        msg || "",
        "Expected '",expected,
        "' to be not equal with '", found, "'!"
      );
    },

    /**
     * Assert that both float values are equal. This might be needed because
     * of the natural floating point inaccuracy of computers.
     *
     * @param expected {Float} Reference value
     * @param found {Float} Found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertEqualsFloat : function(expected, found, msg)
    {
      this.assertNumber(expected);
      this.assertNumber(found);

      qx.lang.Number.equals(expected, found) ||
        this.__fail(msg || "", "Expected '", expected, "' to be equal with '",
        found, "'!"
      );
    },

    /**
     * Assert that both float values are not equal. This might be needed
     * because of the natural floating point inaccuracy of computers.
     *
     * @param expected {Float} Reference value
     * @param found {Float} Found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotEqualsFloat : function(expected, found, msg)
    {
      this.assertNumber(expected);
      this.assertNumber(found);

      !qx.lang.Number.equals(expected, found) ||
        this.__fail(msg || "", "Expected '", expected,
        "' to be not equal with '", found, "'!"
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
      expected === found || this.__fail(
        msg || "",
        "Expected '", expected,
        "' (identical) but found '", found, "'!"
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
      expected !== found || this.__fail(
        msg || "",
        "Expected '", expected,
        "' to be not identical with '", found, "'!"
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
      value !== undefined || this.__fail(
        msg || "",
        "Expected value not to be undefined but found undefined!"
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
      value === undefined || this.__fail(
        msg || "",
        "Expected value to be undefined but found ", value, "!"
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
      value !== null || this.__fail(
        msg || "",
        "Expected value not to be null but found null!"
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
      value === null || this.__fail(
        msg || "",
        "Expected value to be null but found ", value, "!"
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
        qx.lang.Json.stringify(expected),
        qx.lang.Json.stringify(found),
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
      str.search(re) >= 0 || this.__fail(
        msg || "",
        "The String '", str, "' does not match the regular expression '", re.toString(), "'!"
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
      (argCount >= minCount && argCount <= maxCount) || this.__fail(
        msg || "",
        "Wrong number of arguments given. Expected '", minCount, "' to '",
        maxCount, "' arguments but found '", argCount, "' arguments."
      );
    },


    /**
     * Assert that an event is fired.
     *
     * @param obj {Object} The object on which the event should be fired.
     * @param event {String} The event which should be fired.
     * @param invokeFunc {Function} The function which will be invoked and which
     *   fires the event.
     * @param listenerFunc {Function?null} The function which will be invoked in the
     *   listener. The function receives one parameter which is the event.
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

      var id;
      try {
        id = obj.addListener(event, listener, obj);
        invokeFunc.call(obj);
      } catch (ex) {
        throw ex;
      } finally {
        try {
          obj.removeListenerById(id);
        } catch (ex) { /* ignore */ }
      }

      called === true || this.__fail(msg || "", "Event (", event, ") not fired.");
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
      called === false || this.__fail(msg || "", "Event (", event, ") was fired.");

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
        this.__fail(msg || "", "The function did not raise an exception!");
      }

      error instanceof exception || this.__fail(msg || "",
        "The raised exception does not have the expected type! ",
        exception , " != ", error);

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
      array.indexOf(value) !== -1 || this.__fail(
        msg || "",
        "The value '", value,
        "' must have any of the values defined in the array '",
        array, "'"
      );
    },


    /**
     * Assert that the value is NOT an item in the given array
     *
     * @param value {var} Value to check
     * @param array {Array} List of values
     * @param msg {String} Message to be shown if the assertion fails
     */
    assertNotInArray : function(value, array, msg) {
      array.indexOf(value) === -1 || this.__fail(
          msg || "",
          qx.lang.String.format(
            "The value '%1' must not have any of the values defined in the array '%2'",
            [value, array]
          )
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

      msg = msg ||
        "Expected [" + expected.join(", ") +
        "], but found [" + found.join(", ") + "]";

      if (expected.length !== found.length) {
        this.fail(msg, true);
      }

      for (var i=0; i<expected.length; i++) {
        if (expected[i] !== found[i]) {
          this.fail(msg, true);
        }
      }
    },


    /**
     * Assert that the value is a key in the given map.
     *
     * @param value {var} Value to check
     * @param map {Map} Map, where the keys represent the valid values
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertKeyInMap : function(value, map, msg)
    {
      map[value] !== undefined || this.__fail(
        msg || "",
        "The value '", value, "' must must be a key of the map '",
        map, "'"
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
      qx.lang.Type.isFunction(value) || this.__fail(
        msg || "",
        "Expected value to be typeof function but found ", value, "!"
      );
    },

    /**
     * Assert that the value is a function or an async function.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertFunctionOrAsyncFunction : function(value, msg)
    {
      qx.lang.Type.isFunctionOrAsyncFunction(value) || this.__fail(
        msg || "",
        "Expected value to be typeof function or typeof async function but found ", value, "!"
      );
    },

    /**
     * Assert that the value is a string.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertString : function(value, msg) {
      qx.lang.Type.isString(value) || this.__fail(
        msg || "",
        "Expected value to be a string but found ", value, "!"
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
      qx.lang.Type.isBoolean(value) || this.__fail(
        msg || "",
        "Expected value to be a boolean but found ", value, "!"
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
      (qx.lang.Type.isNumber(value) && isFinite(value)) || this.__fail(
        msg || "",
        "Expected value to be a number but found ", value, "!"
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
      (qx.lang.Type.isNumber(value) && isFinite(value) && value >= 0) || this.__fail(
        msg || "",
        "Expected value to be a number >= 0 but found ", value, "!"
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
      (qx.lang.Type.isNumber(value) && isFinite(value) && value % 1 === 0) || this.__fail(
        msg || "",
        "Expected value to be an integer but found ", value, "!"
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
      var condition = (
        qx.lang.Type.isNumber(value) &&
        isFinite(value) &&
        value % 1 === 0 &&
        value >= 0
      );
      condition || this.__fail(
        msg || "",
        "Expected value to be an integer >= 0 but found ", value, "!"
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
      (value >= min && value <= max) || this.__fail(
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
      var condition = value !== null &&
        (qx.lang.Type.isObject(value) || typeof value === "object");
      condition || this.__fail(
        msg || "",
        "Expected value to be typeof object but found ", (value), "!"
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
      qx.lang.Type.isArray(value) || this.__fail(
        msg || "",
        "Expected value to be an array but found ", value, "!"
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
      qx.lang.Type.isObject(value) || this.__fail(
        msg || "",
        "Expected value to be a map but found ", value, "!"
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
     qx.lang.Type.isRegExp(value) || this.__fail(
       msg || "",
       "Expected value to be a regular expression but found ", value, "!"
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

      typeof(value) === type || this.__fail(
        msg || "",
        "Expected value to be typeof '", type, "' but found ", value, "!"
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

      value instanceof clazz || this.__fail(
        msg || "",
        "Expected value to be instanceof '", className, "' but found ", value, "!"
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
      qx.Class && qx.Class.implementsInterface(value, iface) || this.__fail(
        msg || "",
        "Expected object '", value, "' to implement the interface '", iface, "'!"
      );
    },


    /**
     * Assert that the value represents the given CSS color value. This method
     * parses the color strings and compares the RGB values. It is able to
     * parse values supported by {@link qx.util.ColorUtil#stringToRgb}.
     *
     *  @param expected {String} The expected color
     *  @param value {String} The value to check
     *  @param msg {String} Message to be shown if the assertion fails.
     */
    assertCssColor : function(expected, value, msg)
    {
      var ColorUtil = qx.Class ? qx.Class.getByName("qx.util.ColorUtil") : null;
      if (!ColorUtil) {
        throw new Error("qx.util.ColorUtil not available! Your code must have a dependency on 'qx.util.ColorUtil'");
      }

      var expectedRgb = ColorUtil.stringToRgb(expected);
      try
      {
        var valueRgb = ColorUtil.stringToRgb(value);
      }
      catch (ex)
      {
        this.__fail(
          msg || "",
          "Expected value to be the CSS color '", expected,
          "' (rgb(", expectedRgb.join(","),
          ")), but found value '", value, "', which cannot be converted to a CSS color!"
        );
      }

      var condition = expectedRgb[0] == valueRgb[0] && expectedRgb[1] == valueRgb[1] && expectedRgb[2] == valueRgb[2];
      condition || this.__fail(
        msg || "",
          "Expected value to be the CSS color '", expectedRgb,
          "' (rgb(", expectedRgb.join(","),
          ")), but found value '", value,
          "' (rgb(", valueRgb.join(","), "))!"
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
      // see qx.dom.Node.isElement
      !!(value && value.nodeType === 1) || this.__fail(
        msg || "",
        "Expected value to be a DOM element but found  '", value, "'!"
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
      this.__isQxInstance(value, "qx.core.Object") || this.__fail(
        msg || "",
        "Expected value to be a qooxdoo object but found ", value, "!"
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
      this.__isQxInstance(value, "qx.ui.core.Widget") || this.__fail(
        msg || "",
        "Expected value to be a qooxdoo widget but found ", value, "!"
      );
    },


    /**
     * Internal helper for checking the instance of a qooxdoo object using the
     * classname.
     *
     * @param object {var} The object to check.
     * @param classname {String} The classname of the class as string.
     * @return {Boolean} <code>true</code> if the object is an instance of the
     * class
     */
    __isQxInstance : function(object, classname)
    {
      if (!object) {
        return false;
      }
      var clazz = object.constructor;
      while(clazz) {
        if (clazz.classname === classname) {
          return true;
        }
        clazz = clazz.superclass;
      }
      return false;
    }
  }
});
