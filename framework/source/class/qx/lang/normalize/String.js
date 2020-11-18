/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class is responsible for the normalization of the native 'String' object.
 * It checks if these methods are available and, if not, appends them to
 * ensure compatibility in all browsers.
 * For usage samples, check out the attached links.
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.String", {

  statics : {

    /**
     * Removes whitespace from both ends of the string.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/Trim">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.5.4.20">Annotated ES5 Spec</a>
     *
     * @return {String} The trimmed string
     */
    trim : function() {
      return this.replace(/^\s+|\s+$/g,'');
    },


    /**
     * Determines whether a string begins with the characters of another
     * string, returning true or false as appropriate.
     *
     * @param searchString {String} The characters to be searched for at the
     *   start of this string.
     * @param position {Integer?0} The position in this string at which to
     *   begin searching for <code>searchString</code>.
     * @return {Boolean} Whether the string begins with the other string.
     */
    startsWith : function (searchString, position)
    {
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
    },


    /**
     * Determines whether a ends with the characters of another string,
     * returning true or false as appropriate.
     *
     * @param searchString {String} The characters to be searched for at the
     *   end of this string.
     * @param position {Integer?length} Search within this string as if this
     *   string were only this long; defaults to this string's actual length,
     *   clamped within the range established by this string's length.
     * @return {Boolean} Whether the string ends with the other string.
     */
    endsWith : function (searchString, position)
    {
      var subjectString = this.toString();
      if (  typeof position !== 'number'
         || !isFinite(position)
         || Math.floor(position) !== position
         || position > subjectString.length ) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    },
    

    /**
     * Returns a non-negative integer that is the Unicode code point value.
     *   see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt
     *
     * @param position {Integer} Position of an element in the string to 
     *   return the code point value from.
     * @return {Integer} A number representing the code point value of 
     *   the character at the given pos. If there is no element at pos, 
     *   returns undefined..
     */
    codePointAt : function (position)
    {
      if (this == null) {
        throw TypeError();
      }
      var string = String(this);
      var size = string.length;
      // `ToInteger`
      var index = position ? Number(position) : 0;
      if (index != index) { // better `isNaN`
        index = 0;
      }
      // Account for out-of-bounds indices:
      if (index < 0 || index >= size) {
        return undefined;
      }
      // Get the first code unit
      var first = string.charCodeAt(index);
      var second;
      if ( // check if it’s the start of a surrogate pair
        first >= 0xD800 && first <= 0xDBFF && // high surrogate
        size > index + 1 // there is a next code unit
      ) {
        second = string.charCodeAt(index + 1);
        if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
          // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }
      return first;
    },
    

    /**
     * Returns a string created by using the specified sequence of code points.
     *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
     *
     * @param var_args {Integer} A sequence of code points as a variable argument list
     *   The undescore is used as a throwaway variable.  
     * @return {String} A string created by using 
     *   the specified sequence of code points.
     */
    fromCodePoint : function (_)
    {
      var codeUnits = [], codeLen = 0, result = "";
      for (var index=0, len = arguments.length; index !== len; ++index) {
        var codePoint = +arguments[index];
        // correctly handles all cases including `NaN`, `-Infinity`, `+Infinity`
        // The surrounding `!(...)` is required to correctly handle `NaN` cases
        // The (codePoint>>>0) === codePoint clause handles decimals and negatives
        if (!(codePoint < 0x10FFFF && (codePoint>>>0) === codePoint))
          throw RangeError("Invalid code point: " + codePoint);
        if (codePoint <= 0xFFFF) { // BMP code point
          codeLen = codeUnits.push(codePoint);
        } else { // Astral code point; split in surrogate halves
          // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          codePoint -= 0x10000;
          codeLen = codeUnits.push(
            (codePoint >> 10) + 0xD800,  // highSurrogate
            (codePoint % 0x400) + 0xDC00 // lowSurrogate
          );
        }
        if (codeLen >= 0x3fff) {
          result += String.fromCharCode.apply(null, codeUnits);
          codeUnits.length = 0;
        }
      }

      return result + String.fromCharCode.apply(null, codeUnits);
    }
  },

  defer : function(statics)
  {
    // trim
    if (!qx.core.Environment.get("ecmascript.string.trim")) {
      String.prototype.trim = statics.trim;
    }
    // startsWith
    if (!qx.core.Environment.get("ecmascript.string.startsWith")) {
      String.prototype.startsWith = statics.startsWith;
    }
    // endsWith
    if (!qx.core.Environment.get("ecmascript.string.endsWith")) {
      String.prototype.endsWith = statics.endsWith;
    }
    // codePointAt
    if (!qx.core.Environment.get("ecmascript.string.codePointAt")) {
      String.prototype.codePointAt = statics.codePointAt;
    }
  }
});
