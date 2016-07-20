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
  }
});
