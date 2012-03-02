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
 * Pure JavaScript implementation of the EcmaScript 3.1 JSON object. This class
 * is used, if the browser does not support it natively.
 *
 * @internal
 */
qx.Bootstrap.define("qx.lang.JsonImpl",
{
  extend : Object,


  construct : function()
  {
    // bind parse and stringify so they can be called without a context.
    this.stringify = qx.lang.Function.bind(this.stringify, this);
    this.parse = qx.lang.Function.bind(this.parse, this);
  },

  members :
  {
    __gap: null,
    __indent: null,
    __rep: null,
    __stack : null,


    /**
     * This method produces a JSON text from a JavaScript value.
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
    stringify : function(value, replacer, space)
    {
      this.__gap = '';
      this.__indent = '';
      this.__stack = [];

      if (qx.lang.Type.isNumber(space))
      {
        // If the space parameter is a number, make an indent string containing that
        // many spaces.
        var space = Math.min(10, Math.floor(space));
        for (var i = 0; i < space; i += 1) {
          this.__indent += ' ';
        }
      }
      else if (qx.lang.Type.isString(space))
      {
        if (space.length > 10) {
          space = space.slice(0, 10);
        }
        // If the space parameter is a string, it will be used as the indent string.
        this.__indent = space;
      }

      // If there is a replacer, it must be a function or an array.
      // Otherwise, ignore it.
      if (
        replacer &&
        (qx.lang.Type.isFunction(replacer) || qx.lang.Type.isArray(replacer))
      ) {
        this.__rep = replacer;
      } else {
        this.__rep = null;
      }

      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.
      return this.__str('', {'': value});
    },


    /**
     * Produce a string from holder[key].
     *
     * @param key {String} the map key
     * @param holder {Object} an object with the given key
     * @return {String} The string representation of holder[key]
     */
    __str : function(key, holder)
    {
      var mind = this.__gap, partial, value = holder[key];

      // If the value has a toJSON method, call it to obtain a replacement value.
      if (value && qx.lang.Type.isFunction(value.toJSON)) {
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

      if (value === undefined) {
        return undefined;
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
            throw new TypeError("Cannot stringify a recursive object.")
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
            throw new TypeError("Cannot stringify a recursive object.")
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


    /**
     * Convert a date to JSON
     *
     * @param date {Date} The date to convert
     * @return {String} The JSON representation of the date
     */
    dateToJSON : function(date)
    {
      // Format integers to have at least two digits.
      var f2 = function(n) {
        return n < 10 ? '0' + n : n;
      }

      var f3 = function(n) {
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
     *
     * @param string {String} The string to quote
     * @return {String} The quoted string
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
     * @param text {String} JSON string to parse
     *
     * @param reviver {Function?} Optional reviver function to filter and
     *    transform the results
     *
     * @return {Object} The parsed JSON object
     *
     * @lint ignoreDeprecated(eval)
     */
    parse : function(text, reviver)
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
    },


    /**
     * The walk method is used to recursively walk the resulting structure so
     * that modifications can be made.
     *
     * @param holder {Object} the root object
     * @param key {String} walk holder[key]
     * @param reviver {Function} callback, which is called on every node.
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