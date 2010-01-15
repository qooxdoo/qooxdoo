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
     * Fabian Jakobs (fjakobs)
   ________________________________________________________________________

   This class contains code based on the following work:

    http://www.JSON.org/json2.js
    2009-06-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

************************************************************************ */

/**
 * JSON (JavaScript Object Notation) parser, serializer for qooxdoo
 *
 * This class implements EcmaScript 3.1 JSON support.
 *
 * http://wiki.ecmascript.org/doku.php?id=es3.1:json_support
 *
 * If the browser supports native JSON the browser implementation is used.
 */
qx.Class.define("qx.bom.Json",
{
  statics :
  {
    /**
     * This method produces a JSON text from a JavaScript value.
     *
     * When an object value is found, if the object contains a toJSON
     * method, its toJSON method will be called and the result will be
     * stringified. A toJSON method does not serialize: it returns the
     * value represented by the name/value pair that should be serialized,
     * or undefined if nothing should be serialized. The toJSON method
     * will be passed the key associated with the value, and this will be
     * bound to the object holding the key.
     *
     * For example, this would serialize Dates as ISO strings.
     *
     * <pre class="javascript">
     *     Date.prototype.toJSON = function (key) {
     *         function f(n) {
     *             // Format integers to have at least two digits.
     *             return n < 10 ? '0' + n : n;
     *         }
     *
     *         return this.getUTCFullYear()   + '-' +
     *              f(this.getUTCMonth() + 1) + '-' +
     *              f(this.getUTCDate())      + 'T' +
     *              f(this.getUTCHours())     + ':' +
     *              f(this.getUTCMinutes())   + ':' +
     *              f(this.getUTCSeconds())   + 'Z';
     *     };
     * </pre>
     *
     * You can provide an optional replacer method. It will be passed the
     * key and value of each member, with this bound to the containing
     * object. The value that is returned from your method will be
     * serialized. If your method returns undefined, then the member will
     * be excluded from the serialization.
     *
     * If the replacer parameter is an array of strings, then it will be
     * used to select the members to be serialized. It filters the results
     * such that only members with keys listed in the replacer array are
     * stringified.
     *
     * Values that do not have JSON representations, such as undefined or
     * functions, will not be serialized. Such values in objects will be
     * dropped; in arrays they will be replaced with null. You can use
     * a replacer function to replace those with JSON values.
     * JSON.stringify(undefined) returns undefined.
     *
     * The optional space parameter produces a stringification of the
     * value that is filled with line breaks and indentation to make it
     * easier to read.
     *
     * If the space parameter is a non-empty string, then that string will
     * be used for indentation. If the space parameter is a number, then
     * the indentation will be that many spaces.
     *
     * Example:
     *
     * <pre class="javascript">
     * text = JSON.stringify(['e', {pluribus: 'unum'}]);
     * // text is '["e",{"pluribus":"unum"}]'
     *
     *
     * text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
     * // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'
     *
     * text = JSON.stringify([new Date()], function (key, value) {
     *     return this[key] instanceof Date ?
     *         'Date(' + this[key] + ')' : value;
     * });
     * // text is '["Date(---current time---)"]'
     * </pre>
     *
     * @signature function(value, replacer, space)
     *
     * @param value {var} any JavaScript value, usually an object or array.
     *
     * @param replacer {Function?} an optional parameter that determines how
     *    object values are stringified for objects. It can be a function or an
     *    array of strings.
     *
     * @param space {String?} an optional parameter that specifies the
     *    indentation of nested structures. If it is omitted, the text will
     *    be packed without extra whitespace. If it is a number, it will specify
     *    the number of spaces to indent at each level. If it is a string
     *    (such as '\t' or '&nbsp;'), it contains the characters used to indent
     *    at each level.
     *
     * @return {String} The JSON string of the value
     */
    stringify : qx.lang.Object.select(window.JSON && JSON.stringify ? "native" : "emulated",
    {
      "native" : window.JSON ? JSON.stringify : null,

      "emulated" : function(value, replacer, space)
      {
        this.__gap = '';
        this.__indent = '';
        this.__stack = [];

        if (typeof space === 'number')
        {
          // If the space parameter is a number, make an indent string containing that
          // many spaces.
          for (var i = 0; i < space; i += 1) {
            this.__indent += ' ';
          }
        }
        else if (typeof space === 'string')
        {
          // If the space parameter is a string, it will be used as the indent string.
          this.__indent = space;
        }

        // If there is a replacer, it must be a function or an array.
        // Otherwise, throw an error.

        this.__rep = replacer;
        if (
          replacer &&
          typeof replacer !== 'function' &&
          (typeof replacer !== 'object' || typeof replacer.length !== 'number')
         ) {
           throw new Error('JSON.stringify');
        }

        // Make a fake root object containing our value under the key of ''.
        // Return the result of stringifying the value.
        return this.__str('', {'': value});
      }
    }),


    __gap: null,
    __indent: null,
    __rep: null,
    __stack : null,


    /**
     * Produce a string from holder[key].
     */
    __str : function(key, holder)
    {
      var mind = this.__gap, partial, value = holder[key];

      // If the value has a toJSON method, call it to obtain a replacement value.
      if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
        value = value.toJSON(key);
      } else if (qx.lang.Type.isDate(value)) {
        value = this.dateToJSON(value);
      }

      // If we were called with a replacer function, then call the replacer to
      // obtain a replacement value.
      if (typeof this.__rep === 'function') {
        value = this.__rep.call(holder, key, value);
      }

      if (value === null) {
        return 'null';
      }

      // What happens next depends on the value's type.
      switch (qx.lang.Type.getClass(value))
      {
        case 'String':
          return this.__quote(value);

        case 'Number':
          // JSON numbers must be finite. Encode non-finite numbers as null.
          return isFinite(value) ? String(value) : 'null';

        case 'Boolean':
          // If the value is a boolean or null, convert it to a string. Note:
          // typeof null does not produce 'null'. The case is included here in
          // the remote chance that this gets fixed someday.
          return String(value);

        case 'Array':
          // Make an array to hold the partial results of stringifying this array value.
          this.__gap += this.__indent;
          partial = [];

          if (this.__stack.indexOf(value) !== -1) {
            throw new Error("Cannot stringify a recursive object.")
          }
          this.__stack.push(value);

          // The value is an array. Stringify every element. Use null as a placeholder
          // for non-JSON values.
          var length = value.length;
          for (var i = 0; i < length; i += 1) {
            partial[i] = this.__str(i, value) || 'null';
          }

          this.__stack.pop();

          // Join all of the elements together, separated with commas, and wrap them in
          // brackets.
          if (partial.length === 0) {
            var string = '[]';
          } else if (this.__gap) {
            string = '[\n' + this.__gap + partial.join(',\n' + this.__gap) + '\n' + mind + ']'
          } else {
            string = '[' + partial.join(',') + ']';
          }
          this.__gap = mind;
          return string;

        case 'Object':
          // Make an array to hold the partial results of stringifying this object value.
          this.__gap += this.__indent;
          partial = [];

          if (this.__stack.indexOf(value) !== -1) {
            throw new Error("Cannot stringify a recursive object.")
          }
          this.__stack.push(value);

          // If the replacer is an array, use it to select the members to be stringified.
          if (this.__rep && typeof this.__rep === 'object')
          {
            var length = this.__rep.length;
            for (var i = 0; i < length; i += 1)
            {
              var k = this.__rep[i];
              if (typeof k === 'string')
              {
                var v = this.__str(k, value);
                if (v) {
                  partial.push(this.__quote(k) + (this.__gap ? ': ' : ':') + v);
                }
              }
            }
          }
          else
          {
            // Otherwise, iterate through all of the keys in the object.
            for (var k in value)
            {
              if (Object.hasOwnProperty.call(value, k))
              {
                var v = this.__str(k, value);
                if (v) {
                  partial.push(this.__quote(k) + (this.__gap ? ': ' : ':') + v);
                }
              }
            }
          }

          this.__stack.pop();

          // Join all of the member texts together, separated with commas,
          // and wrap them in braces.
          if (partial.length === 0) {
            var string =  '{}';
          } else if (this.__gap) {
            string = '{\n' + this.__gap + partial.join(',\n' + this.__gap) + '\n' + mind + '}';
          } else {
            string = '{' + partial.join(',') + '}';
          }
          this.__gap = mind;
          return string;
      }
    },


    __convertArray : function(array)
    {
      var stepback = this.gap;
    },


    dateToJSON : function(date)
    {
      // Format integers to have at least two digits.
      f2 = function(n) {
        return n < 10 ? '0' + n : n;
      }

      f3 = function(n) {
        var value = f2(n);
        return n < 100 ? '0' + value : value;
      }

      return isFinite(date.valueOf()) ?
         date.getUTCFullYear()   + '-' +
       f2(date.getUTCMonth() + 1) + '-' +
       f2(date.getUTCDate())      + 'T' +
       f2(date.getUTCHours())     + ':' +
       f2(date.getUTCMinutes())   + ':' +
       f2(date.getUTCSeconds())   + '.' +
       f3(date.getUTCMilliseconds()) + 'Z' : null;
    },


    /**
     * If the string contains no control characters, no quote characters, and no
     * backslash characters, then we can safely slap some quotes around it.
     * Otherwise we must also replace the offending characters with safe escape
     * sequences.
     */
    __quote : function(string)
    {
      var meta = {    // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"' : '\\"',
          '\\': '\\\\'
      };

      var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
      escapable.lastIndex = 0;

      if (escapable.test(string))
      {
        return '"' + string.replace(escapable, function (a) {
          var c = meta[a];
          return typeof c === 'string' ? c :
            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
      }
      else
      {
        return '"' + string + '"';
      }
    },


    /**
     * This method parses a JSON text to produce an object or array.
     * It can throw a SyntaxError exception.
     *
     * The optional reviver parameter is a function that can filter and
     * transform the results. It receives each of the keys and values,
     * and its return value is used instead of the original value.
     * If it returns what it received, then the structure is not modified.
     * If it returns undefined then the member is deleted.
     *
     * Example:
     *
     * <pre class="javascript">
     * // Parse the text. Values that look like ISO date strings will
     * // be converted to Date objects.
     *
     * myData = JSON.parse(text, function (key, value)
     * {
     *   if (typeof value === 'string')
     *   {
     *     var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
     *     if (a) {
     *       return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
     *     }
     *   }
     *   return value;
     * });
     *
     * myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
     *     var d;
     *     if (typeof value === 'string' &&
     *             value.slice(0, 5) === 'Date(' &&
     *             value.slice(-1) === ')') {
     *         d = new Date(value.slice(5, -1));
     *         if (d) {
     *             return d;
     *         }
     *     }
     *     return value;
     * });
     * </pre>
     *
     * @param test {String} JSON string to parse
     *
     * @param reviver {Function?} Optional reviver function to filter and
     *    transform the results
     *
     * @return {Object} The parsed JSON object
     */
    parse : qx.lang.Object.select(window.JSON && JSON.parse ? "native" : "emulated",
    {
      "native" : window.JSON ? JSON.parse : null,

      "emulated" : function(text, reviver)
      {
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        cx.lastIndex = 0;

        // Parsing happens in four stages. In the first stage, we replace certain
        // Unicode characters with escape sequences. JavaScript handles many characters
        // incorrectly, either silently deleting them, or treating them as line endings.
        if (cx.test(text))
        {
          text = text.replace(cx, function (a) {
            return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
        }

        // In the second stage, we run the text against regular expressions that look
        // for non-JSON patterns. We are especially concerned with '()' and 'new'
        // because they can cause invocation, and '=' because it can cause mutation.
        // But just to be safe, we want to reject all unexpected forms.

        // We split the second stage into 4 regexp operations in order to work around
        // crippling inefficiencies in IE's and Safari's regexp engines. First we
        // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
        // replace all simple value tokens with ']' characters. Third, we delete all
        // open brackets that follow a colon or comma or that begin the text. Finally,
        // we look to see that the remaining characters are only whitespace or ']' or
        // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
        if (
          /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
        ) {
          // In the third stage we use the eval function to compile the text into a
          // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
          // in JavaScript: it can begin a block or an object literal. We wrap the text
          // in parens to eliminate the ambiguity.
          var j = eval('(' + text + ')');

          // In the optional fourth stage, we recursively walk the new structure, passing
          // each name/value pair to a reviver function for possible transformation.
          return typeof reviver === 'function' ?  this.__walk({'': j}, '', reviver) : j;
        }

        // If the text is not JSON parseable, then a SyntaxError is thrown.
        throw new SyntaxError('JSON.parse');
      }
    }),


    /**
     * The walk method is used to recursively walk the resulting structure so
     * that modifications can be made.
     */
    __walk : function(holder, key, reviver)
    {
      var value = holder[key];
      if (value && typeof value === 'object')
      {
        for (var k in value)
        {
          if (Object.hasOwnProperty.call(value, k))
          {
            var v = this.__walk(value, k, reviver);
            if (v !== undefined) {
              value[k] = v;
            } else {
              delete value[k];
            }
          }
        }
      }
      return reviver.call(holder, key, value);
    }
  }
});