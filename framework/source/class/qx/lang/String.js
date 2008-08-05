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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

   ======================================================================

   This class contains code based on the following work:

   * Mootools
     http://mootools.net/
     Version 1.1.1

     Copyright:
       (c) 2007 Valerio Proietti

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/**
 * String helper functions
 *
 * The native JavaScript String is not modified by this class. However,
 * there are modifications to the native String in {@link qx.lang.Core} for
 * browsers that do not support certain features.
 *
 * The additions implemented here may be added directly to native String by
 * a setting in {@link qx.lang.Prototypes}. This feature is not enabled by
 * default.
 *
 * The string/array generics introduced in JavaScript 1.6 are supported by
 * {@link qx.lang.Generics}.
 */
qx.Bootstrap.define("qx.lang.String",
{
  statics :
  {
    /**
     * Converts a hyphenated string (seperated by '-') to camel case.
     *
     * Example:
     * <pre class='javascript'>qx.lang.String.camelCase("I-like-cookies"); //returns "ILikeCookies"</pre>
     *
     * @param str {String} hyphenated string
     * @return {String} camelcase string
     */
    camelCase : function(str)
    {
      return str.replace(/\-([a-z])/g, function(match, chr) {
        return chr.toUpperCase();
      });
    },


    /**
     * Converts a camelcased string to a hyphenated (seperated by '-') string.
     *
     * Example:
     * <pre class='javascript'>qx.lang.String.camelCase("ILikeCookies"); //returns "I-like-cookies"</pre>
     *
     * @param str {String} camelcased string
     * @return {String} hyphenated string
     */
    hyphenate: function(str)
    {
      return str.replace(/[A-Z]/g, function(match){
        return ('-' + match.charAt(0).toLowerCase());
      });
    },


    /**
     * Converts a string to camel case.
     *
     * Example:
     * <pre class='javascript'>qx.lang.String.camelCase("i like cookies"); //returns "I Like Cookies"</pre>
     *
     * @param str {String} any string
     * @return {String} capitalized string
     */
    capitalize: function(str){
      return str.replace(/\b[a-z]/g, function(match) {
        return match.toUpperCase();
      });
    },


    /**
     * removes white space from the left side of a string
     *
     * @param str {String} the string to trim
     * @return {String} the trimmed string
     */
    trimLeft : function(str) {
      return str.replace(/^\s+/, "");
    },


    /**
     * removes white space from the right side of a string
     *
     * @param str {String} the string to trim
     * @return {String} the trimmed string
     */
    trimRight : function(str) {
      return str.replace(/\s+$/, "");
    },


    /**
     * removes white space from the left and the right side of a string
     *
     * @param str {String} the string to trim
     * @return {String} the trimmed string
     */
    trim : function(str) {
      return str.replace(/^\s+|\s+$/g, "");
    },


    /**
     * Check whether the string starts with the given substring
     *
     * @param fullstr {String} the string to search in
     * @param substr {String} the substring to look for
     * @return {Boolean} whether the string starts with the given substring
     */
    startsWith : function(fullstr, substr) {
      return fullstr.substring(0, substr.length) === substr;
    },


    /**
     * Check whether the string ends with the given substring
     *
     * @param fullstr {String} the string to search in
     * @param substr {String} the substring to look for
     * @return {Boolean} whether the string ends with the given substring
     */
    endsWith : function(fullstr, substr) {
      return fullstr.substring(fullstr.length - substr.length, fullstr.length) === substr;
    },


    /**
     * Pad a string up to a given length. Padding characters are added to the left of the string.
     *
     * @param str {String} the string to pad
     * @param length {Integer} the final length of the string
     * @param ch {String} character used to fill up the string
     * @return {String} paddded string
     */
    pad : function(str, length, ch)
    {
      if (typeof ch === "undefined") {
        ch = "0";
      }

      var temp = "";

      for (var i=str.length; i<length; i++) {
        temp += ch;
      }

      return temp + str;
    },


    /**
     * Convert the first character of the string to upper case.
     *
     * @param str {String} the string
     * @return {String} the string with a upper case first character
     */
    firstUp : function(str) {
      return str.charAt(0).toUpperCase() + str.substr(1);
    },


    /**
     * Convert the first character of the string to lower case.
     *
     * @param str {String} the string
     * @return {String} the string with a lower case first character
     */
    firstLow : function(str) {
      return str.charAt(0).toLowerCase() + str.substr(1);
    },


    /**
     * Check whether the string contains a given substring
     *
     * @param str {String} the string
     * @param substring {String} substring to search for
     * @return {Boolean} whether the string contains the substring
     */
    contains : function(str, substring) {
      return str.indexOf(substring) != -1;
    },


    /**
     * Print a list of arguments using a format string
     * In the format string occurences of %n are replaced by the n'th element of the args list.
     * Example:
     * <pre class='javascript'>qx.lang.String.format("Hello %1, my name is %2", ["Egon", "Franz"]) == "Hello Egon, my name is Franz"</pre>
     *
     * @param pattern {String} format string
     * @param args {Array} array of arguments to insert into the format string
     * @return {String} the formatted string
     */
    format : function(pattern, args)
    {
      var str = pattern;

      for (var i=0; i<args.length; i++) {
        str = str.replace(new RegExp("%" + (i + 1), "g"), args[i]);
      }

      return str;
    },


    /**
     * Escapes all chars that have a special meaning in regular expressions
     *
     * @param str {String} the string where to escape the chars.
     * @return {String} the string with the escaped chars.
     */
    escapeRegexpChars : function(str) {
      return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
    },


    /**
     * Converts a string to an array of characters.
     * <pre>"hello" => [ "h", "e", "l", "l", "o" ];</pre>
     *
     * @param str {String} the string which should be splitted
     * @return {Array} the result array of characters
     */
    toArray : function(str) {
      return str.split(/\B|\b/g);
    },


    /**
     * Remove HTML/XML tags from a string
     * Example:
     * <pre class='javascript'>qx.lang.String.stripTags("&lt;h1>Hello&lt;/h1>") == "Hello"</pre>
     *
     * @param str {String} string containing tags
     * @return {String} the string with stripped tags
     */
    stripTags : function(str) {
      return str.replace(/<\/?[^>]+>/gi, "");
    }
  }
});
