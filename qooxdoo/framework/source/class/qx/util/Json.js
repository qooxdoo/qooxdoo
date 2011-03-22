/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2006 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Andreas Junghans (lucidcake)
     * Derrell Lipman (derrell)
   ________________________________________________________________________

   This class contains code based on the following work:

     JSON (JavaScript Object Notation) is a lightweight data-interchange format.
     http://json.org

     Copyright:
       2005 JSON.org

     License:
       Permission is hereby granted, free of charge, to any person obtaining a copy
       of this software and associated documentation files (the "Software"), to deal
       in the Software without restriction, including without limitation the rights
       to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
       copies of the Software, and to permit persons to whom the Software is
       furnished to do so, subject to the following conditions:

       The Software shall be used for Good, not Evil.

       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
       IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
       FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
       AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
       LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
       SOFTWARE.

************************************************************************ */

/**
 * JSON (JavaScript Object Notation) for qooxdoo
 */
qx.Class.define("qx.util.Json",
{
  statics :
  {
    __nativeDateToJSON : null,

    /** indent string for JSON pretty printing */
    BEAUTIFYING_INDENT : "  ",

    /** new line string for JSON pretty printing */
    BEAUTIFYING_LINE_END : "\n",

    /**
     * Boolean flag which controls the stringification of date objects.
     * <code>null</code> for the default behavior, acts like false
     * <code>true</code> for stringifying dates the old, qooxdoo specific way
     * <code>false</code> using the native toJSON of date objects.
     *
     * As the default value changes, its a good idea to set the constant to
     * a specific value.
     */
    CONVERT_DATES : null,

    /**
     * Mapping from types to function names.
     *
     * @internal
     */
    __map :
    {
      "function"  : "__convertFunction",
      "boolean"   : "__convertBoolean",
      "number"    : "__convertNumber",
      "string"    : "__convertString",
      "object"    : "__convertObject",
      "undefined" : "__convertUndefined"
    },


    /**
     * Single instance of number format for the JSON serialization.
     */
    NUMBER_FORMAT : new qx.util.format.NumberFormat(),


    /**
     * Converts the incoming value from Function to String.
     *
     * @param incoming {function} The incoming value
     * @param key {String} The key under which the value is stored
     * @return {String} value converted to a JSON string
     */
    __convertFunction : function(incoming, key) {
      return String(incoming);
    },


    /**
     * Converts the incoming value from Boolean to String.
     *
     * @param incoming {Boolean} The incoming value
     * @param key {String} The key under which the value is stored
     * @return {String} value converted to a JSON string
     */
    __convertBoolean : function(incoming, key) {
      return String(incoming);
    },


    /**
     * Converts the incoming value from Number to String.
     *
     * @param incoming {Number} The incoming value
     * @param key {String} The key under which the value is stored
     * @return {String} value converted to a JSON string
     */
    __convertNumber : function(incoming, key) {
      return isFinite(incoming) ? String(incoming) : "null";
    },


    /**
     * Converts the incoming value from String to JSON String.
     *
     * @param incoming {String} The incoming value
     * @param key {String} The key under which the value is stored
     * @return {String} value converted to a JSON string
     */
    __convertString : function(incoming, key)
    {
      var result;

      if (/["\\\x00-\x1f]/.test(incoming)) {
        result = incoming.replace(/([\x00-\x1f\\"])/g, qx.util.Json.__convertStringHelper);
      } else {
        result = incoming;
      }

      return '"' + result + '"';
    },

    /**
     * Mapping for string escape.
     *
     * @internal
     */
    __convertStringEscape :
    {
      '\b' : '\\b',
      '\t' : '\\t',
      '\n' : '\\n',
      '\f' : '\\f',
      '\r' : '\\r',
      '"'  : '\\"',
      '\\' : '\\\\'
    },


    /**
     * callback for JavaScript string escaping
     *
     * @param a {Array} incoming array
     * @param b {String} character to convert
     * @return {String} converted character
     */
    __convertStringHelper : function(a, b)
    {
      var result = qx.util.Json.__convertStringEscape[b];

      if (result) {
        return result;
      }

      result = b.charCodeAt();
      return '\\u00' + Math.floor(result / 16).toString(16) + (result % 16).toString(16);
    },


    /**
     * Converts the incoming value from Array to String.
     *
     * @param incoming {Array} The incoming value
     * @param key {String} The key under which the value is stored
     * @return {String} value converted to a JSON string
     */
    __convertArray : function(incoming, key)
    {
      var stringBuilder = [], first = true, func, obj;

      var beautify = qx.util.Json.__beautify;
      stringBuilder.push("[");

      if (beautify)
      {
        qx.util.Json.__indent += qx.util.Json.BEAUTIFYING_INDENT;
        stringBuilder.push(qx.util.Json.__indent);
      }

      for (var i=0, l=incoming.length; i<l; i++)
      {
        obj = incoming[i];
        func = this.__map[typeof obj];

        if (func)
        {
          obj = this[func](obj, i+"");

          if (typeof obj == "string")
          {
            if (!first)
            {
              stringBuilder.push(",");

              if (beautify) {
                stringBuilder.push(qx.util.Json.__indent);
              }
            }

            stringBuilder.push(obj);
            first = false;
          }
        }
      }

      if (beautify)
      {
        qx.util.Json.__indent = qx.util.Json.__indent.substring(0, qx.util.Json.__indent.length - qx.util.Json.BEAUTIFYING_INDENT.length);
        stringBuilder.push(qx.util.Json.__indent);
      }

      stringBuilder.push("]");

      return stringBuilder.join("");
    },


    /**
     * Implemented by Derrell L. and Andreas J.
     *
     * The Date object is a primitive type in Javascript,
     * but the Javascript specification neglects to provide
     * a literal form for it.  The only way to generate a
     * Date object is with "new Date()".  For fast
     * processing by Javascript, we want to be able to
     * eval() a JSON response.  If Date objects are to be
     * passed to the client using JSON, about the only
     * reasonable way to do it is to have "new Date()"
     * in the JSON message.  See this page for a proposal to
     * add a Date literal syntax to Javascript which,
     * if/when implemented in Javascript, would eliminate
     * the need to pass "new Date() in JSON":
     *
     *   http://www.nikhilk.net/DateSyntaxForJSON.aspx
     *
     * Sending a JSON message from client to server, we have
     * no idea what language the server will be written in,
     * what size integers it supports, etc.  We do want to
     * be able to represent as large a range of dates as
     * possible, though.  If we were to send the number of
     * milliseconds since the beginning of the epoch, the
     * value would exceed, in many cases, what can fit in a
     * 32-bit integer.  Even if one were to simply strip off
     * the last three digits (milliseconds), the number of
     * seconds could exceed a 32-bit signed integer's range
     * with very distant past or distant future dates.  To
     * make it easier for any generic server to handle a
     * date without risk of loss of precision due to
     * automatic type casting, we'll send a UTC date with
     * separated fields, in the form:
     *
     *  new Date(Date.UTC(year,month,day,hour,min,sec,ms))
     *
     * The server can fairly easily parse this in its JSON
     * implementation by stripping off "new Date(Date.UTC("
     * from the beginning of the string, and "))" from the
     * end of the string.  What remains is the set of
     * comma-separated date components, which are also very
     * easy to parse.
     *
     * The server should send this same format to the
     * client, which can simply eval() it just as with the
     * remainder of JSON.
     *
     * A requirement of the implementation of the server is
     * that after a date has been sent from the client to
     * the server, converted by the server into whatever
     * native type the date will be stored or manipulated
     * in, converted back to JSON, and received back at the
     * client, a comparison of the sent and received Date
     * object should yield identity.  This means that even
     * if the server does not natively operate on
     * milliseconds, it must maintain milliseconds in dates
     * sent to it by the client.
     *
     * @param incoming {Date} incoming value
     * @param key {String} The key under which the value is stored
     *
     * @return {String} value converted to a JSON string
     */
    __convertDate : function(incoming, key)
    {
      // if its set to false or not set at all
      if (!qx.util.Json.CONVERT_DATES) {
        // use the native toJSON if available but not on IE [BUG #4674]
        if (
          incoming.toJSON && qx.core.Environment.get("engine.name") != "opera"
          && qx.core.Environment.get("engine.name") != "mshtml"
        ) {
          return '"' + incoming.toJSON() + '"';
        }

        // fallback implementation
        var formatter = this.NUMBER_FORMAT;
        formatter.setMinimumIntegerDigits(2);

        var formated = incoming.getUTCFullYear() + '-' +
          formatter.format(incoming.getUTCMonth() + 1) + '-' +
          formatter.format(incoming.getUTCDate()) + 'T' +
          formatter.format(incoming.getUTCHours()) + ':' +
          formatter.format(incoming.getUTCMinutes()) + ':' +
          formatter.format(incoming.getUTCSeconds()) + '.';

        formatter.setMinimumIntegerDigits(3);
        return '"' + formated + formatter.format(incoming.getUTCMilliseconds())   + 'Z"';

      // if its set to true
      } else {
        var dateParams =
          incoming.getUTCFullYear() + "," +
          incoming.getUTCMonth() + "," +
          incoming.getUTCDate() + "," +
          incoming.getUTCHours() + "," +
          incoming.getUTCMinutes() + "," +
          incoming.getUTCSeconds() + "," +
          incoming.getUTCMilliseconds();
        return "new Date(Date.UTC(" + dateParams + "))";
      }
    },


    /**
     * Converts the incoming value from Map to String.
     *
     * @param incoming {Map} The incoming value
     * @param key {String} The key under which the value is stored
     * @return {String} value converted to a JSON string
     */
    __convertMap : function(incoming, key)
    {
      var stringBuilder = [], first = true, func, obj;

      var beautify = qx.util.Json.__beautify;
      stringBuilder.push("{");

      if (beautify)
      {
        qx.util.Json.__indent += qx.util.Json.BEAUTIFYING_INDENT;
        stringBuilder.push(qx.util.Json.__indent);
      }

      for (var key in incoming)
      {
        obj = incoming[key];
        func = this.__map[typeof obj];

        if (func)
        {
          obj = this[func](obj, key);

          if (typeof obj == "string")
          {
            if (!first)
            {
              stringBuilder.push(",");

              if (beautify) {
                stringBuilder.push(qx.util.Json.__indent);
              }
            }

            stringBuilder.push(this.__convertString(key), ":", obj);
            first = false;
          }
        }
      }

      if (beautify)
      {
        qx.util.Json.__indent = qx.util.Json.__indent.substring(0, qx.util.Json.__indent.length - qx.util.Json.BEAUTIFYING_INDENT.length);
        stringBuilder.push(qx.util.Json.__indent);
      }

      stringBuilder.push("}");

      return stringBuilder.join("");
    },


    /**
     * Converts the incoming value from Object to String.
     *
     * @param incoming {Object} The incoming value
     * @param key {String} The key under which the value is stored
     * @return {String} value converted to a JSON string
     */
    __convertObject : function(incoming, key)
    {
      if (incoming)
      {
        // we ignore the native toJSON of Date objects in favour of our own
        // date serializer
        if (qx.lang.Type.isFunction(incoming.toJSON) && incoming.toJSON !== this.__nativeDateToJSON) {
          return this.__convert(incoming.toJSON(key), key);
        } else if (qx.lang.Type.isDate(incoming)) {
          return this.__convertDate(incoming, key);
        } else if (qx.lang.Type.isArray(incoming)) {
          return this.__convertArray(incoming, key);
        } else if (qx.lang.Type.isObject(incoming)) {
          return this.__convertMap(incoming, key);
        }

        return "";
      }

      return "null";
    },


    /**
     * Converts the incoming value from undefined to String.
     *
     * @param incoming {undefined} The incoming value
     * @param key {String} The key under which the value is stored
     * @return {String} value converted to a JSON string
     */
    __convertUndefined : function(incoming, key)
    {
      if (qx.core.Environment.get("qx.jsonEncodeUndefined")) {
        return "null";
      }
    },


    /**
     * Converts any value to JSON
     *
     * @param incoming {var} The incoming value
     * @param key {String} The key under which the value is stored
     * @return {String} value converted to a JSON string
     */
    __convert : function(incoming, key) {
      return this[this.__map[typeof incoming]](incoming, key);
    },


    /**
     * Stringify a JavaScript value, producing a JSON text.
     *
     * @param obj {var} the object to serialize.
     * @param beautify {Boolean ? false} whether to beautify the serialized string
     *          by adding some white space that indents objects and arrays.
     * @return {String} the serialized object.
     */
    stringify : function(obj, beautify)
    {
      // Hints for converter process
      this.__beautify = beautify;
      this.__indent = this.BEAUTIFYING_LINE_END;

      // Start conversion
      var result = this.__convert(obj, "");
      if (typeof result != "string") {
        result = null;
      }

      // Debugging support
      if (qx.core.Environment.get("qx.jsonDebugging")) {
        qx.log.Logger.debug(this, "JSON request: " + result);
      }

      return result;
    },


    /**
     * Parse a JSON text, producing a JavaScript value.
     * It triggers an exception if there is a syntax error.
     *
     * @lint ignoreDeprecated(eval)
     *
     * @param text {String} JSON string
     * @param validate {Boolean ? true} <code>true</code> if the passed JSON string
     *    should be validated, <code>false</code> otherwise.
     * @return {Object|null} Returns the object
     * @throws an error if the text could not be parsed or evaluated
     */
    parse : function(text, validate)
    {
      // Set default value if validate is not defined
      if (validate === undefined) {
        validate = true;
      }

      if (qx.core.Environment.get("qx.jsonDebugging")) {
        qx.log.Logger.debug(this, "JSON response: " + text);
      }

      if (validate) {
        if (/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(text.replace(/"(\\.|[^"\\])*"/g, ""))) {
          throw new Error("Could not parse JSON string!");
        }
      }

      try {
        var result = (text && text.length > 0) ? eval('(' + text + ')') : null;
        return result;
      } catch(ex) {
        throw new Error("Could not evaluate JSON string: " + ex.message);
      }
    }
  },


  environment :
  {
    "qx.jsonEncodeUndefined" : true,
    "qx.jsonDebugging"       : false
  },


  defer : function(statics) {
    statics.__nativeDateToJSON = Date.prototype.toJSON;
  }
});
