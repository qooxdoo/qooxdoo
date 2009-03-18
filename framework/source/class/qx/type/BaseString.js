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
     * Jonathan Weiß (jonathan_rass)

   ======================================================================

     This class uses documentation of the native String methods from the MDC
     documentation of Mozilla. 

     License:
       CC Attribution-Sharealike License: 
       http://creativecommons.org/licenses/by-sa/2.5/

************************************************************************ */

/**
 * This class extends the built-in JavaScript String class. It can be used as
 * base class for classes, which need to derive from String.
 *
 * Instances of this class can be used in any place a JavaScript string can.
 */
qx.Class.define("qx.type.BaseString",
{
  extend : Object,

  /**
   * @param txt {String?""} Initialize with this string
   */
  construct : function(txt)
  {
    var txt = txt || "";
    
    // no base call needed

    this.__txt = txt;
    this.length = txt.length;
  },

  members :
  {
    $$isString : true,
    length : 0,

    toString : function() {
      return this.__txt;
    },
    
  
    /**
     *  Returns the specified character from a string.
     * 
     * Characters in a string are indexed from left to right. The index of the 
     * first character is 0, and the index of the last character in a string 
     * called stringName is stringName.length - 1. If the index you supply is 
     * out of range, JavaScript returns an empty string.
     *
     * @signature function(index)
     * @param index {Integer} An integer between 0 and 1 less than the length
     *   of the string.
     * @return {String} The character.
     */
     charAt : null,

     valueOf : null,


    /**
     * Returns a number indicating the Unicode value of the character at the given index.
     *
     * @signature function(index)
     * @param index {Integer} An integer greater than 0 and less than the length
     *   of the string; if it is not a number, it defaults to 0.
     * @return {Integer} The number.
     */
    charCodeAt : null,


    /**
     * Combines the text of two or more strings and returns a new string.
     * Changes to the text in one string do not affect the other string.
     *
     * @signature function(stringN)
     * @param stringN {String} One or more strings to be combined.
     * @return {String} The combined string.
     */
    concat : null,


    /**
     * Returns the index within the calling String object of the first 
     * occurrence of the specified value, starting the search at fromIndex, 
     * returns -1 if the value is not found.
     *
     * @signature function(searchValue, fromIndex)
     * @param index {String} A string representing the value to search for.
     * @param offset {Integer?0} The location within the calling string to start
     *   the search from. It can be any integer between 0 and the length of the 
     *   string. The default value is 0.
     * @return {Integer} The index or -1.
     */
    indexOf : null,


    /**
     * Returns the index within the calling String object of the last occurrence
     * of the specified value, or -1 if not found. The calling string is 
     * searched backward, starting at fromIndex.
     * 
     * @signature function(searchValue, fromIndex)
     * @param index {String} A string representing the value to search for.
     * @param offset {Integer?0} The location within the calling string to start
     *   the search from, indexed from left to right. It can be any integer 
     *   between 0 and the length of the string. The default value is the length
     *    of the string.
     * @return {Integer} The index or -1.
     */
    lastIndexOf : null,


    // TODOC
    localeCompare : null,

    /**
     * Used to retrieve the matches when matching a string against a regular 
     * expression.
     * 
     * If the regular expression does not include the g flag, returns the same 
     * result as regexp.exec(string). If the regular expression includes the g 
     * flag, the method returns an Array containing all matches.
     * 
     * @signature function(regexp)
     * @param index {regexp} A regular expression object. If a non-RegExp object
     *  obj is passed, it is implicitly converted to a RegExp by using
     *   new RegExp(obj).
     * @return {Object} The matching RegExp object or an array containing all
     *   matches.
     */
    match : null,

    /**
     * Finds a match between a regular expression and a string, and replaces the
     * matched substring with a new substring.
     *
     * @signature function(regexp, aFunction)
     * @param regexp {Object} A RegExp object. The match is replaced by the 
     *   return value of parameter #2. Or a String that is to be replaced by 
     *   newSubStr.
     * @param howMany {aFunction} A function to be invoked to create the new
     *   substring (to put in place of the substring received from parameter
     *   #1).
     * @return {String} The new substring.
     */
    replace : null,


    /**
     * Executes the search for a match between a regular expression and this
     * String object.
     * 
     * If successful, search returns the index of the regular expression inside
     * the string. Otherwise, it returns -1.
     * 
     * @signature function(regexp)
     * @param index {regexp} A regular expression object. If a non-RegExp object
     *  obj is passed, it is implicitly converted to a RegExp by using
     *   new RegExp(obj).
     * @return {Object} The matching RegExp object or -1.
     *   matches.
     */
    search : null,
    
    /**
     * Extracts a section of a string and returns a new string.
     * 
     * Slice extracts the text from one string and returns a new string. Changes
     * to the text in one string do not affect the other string.
     * As a negative index, endSlice indicates an offset from the end of the 
     * string.
     * 
     * @signature function(beginslice, endSlice)
     * @param beginslice {Integer} The zero-based index at which to begin
     *   extraction.
     * @param endSlice {Integer?null} The zero-based index at which to end
     *   extraction. If omitted, slice extracts to the end of the string.
     * @return {String} The extracted string.
     */
    slice : null,

    /**
     * Splits a String object into an array of strings by separating the string
     * into substrings.
     * 
     * When found, separator is removed from the string and the substrings are
     * returned in an array. If separator is omitted, the array contains one
     * element consisting of the entire string.
     * 
     * If separator is a regular expression that contains capturing parentheses,
     * then each time separator is matched the results (including any undefined
     * results) of the capturing parentheses are spliced into the output array.
     * However, not all browsers support this capability.
     * 
     * Note: When the string is empty, split returns an array containing one
     * 
     * @signature function(separator, limit)
     * @param separator {String?null} Specifies the character to use for
     *   separating the string. The separator is treated as a string or a regular
     *   expression. If separator is omitted, the array returned contains one
     *   element consisting of the entire string.
     * @param limit {Integer?null} Integer specifying a limit on the number of
     *   splits to be found.
     * @return {Array} The Array containing substrings.
     */
    split : null,

  /**
   * Returns the characters in a string beginning at the specified location
   * through the specified number of characters.
   * 
   * Start is a character index. The index of the first character is 0, and the 
   * index of the last character is 1 less than the length of the string. substr
   *  begins extracting characters at start and collects length characters
   * (unless it reaches the end of the string first, in which case it will
   * return fewer).
   * If start is positive and is greater than or equal to the length of the
   * string, substr returns an empty string.
   * 
   * @signature function(start, length)
   * @param start {Integer} Location at which to begin extracting characters
   *   (an integer between 0 and one less than the length of the string).
   * @param length {Integer?null} The number of characters to extract.
   * @return {String} The substring.
   */
    substr : null,

    substring : null,

    toLowerCase : null,

    toLocaleLowerCase : null,

    toUpperCase : null,

    toLocaleUpperCase : null,

    /**
     * Return unique hash code of object
     *
     * @return {Integer} unique hash code of the object
     */
    toHashCode : function() {
      return qx.core.ObjectRegistry.toHashCode(this);
    },


    /**
     * Call the same method of the super class.
     *
     * @param args {arguments} the arguments variable of the calling method
     * @param varags {var} variable number of arguments passed to the overwritten function
     * @return {var} the return value of the method of the base class.
     */
    base : function(args, varags) {
      return qx.core.Object.prototype.base.apply(this, arguments);
    }


  },

  /*
   *****************************************************************************
      DEFER
   *****************************************************************************
   */

   defer : function(statics, members)
   {
     // add asserts into each debug build
     if (qx.core.Variant.isSet("qx.debug", "on")) {
       qx.Class.include(statics, qx.core.MAssert);
     }

     var mappedFunctions = [
       'charAt',
       'charCodeAt',
       'concat',
       'indexOf',
       'lastIndexOf',
       'localeCompare',
       'match',
       'replace',
       'search',
       'slice',
       'split',
       'substr',
       'substring',
       'toLowerCase',
       'toLocaleLowerCase',
       'toUpperCase',
       'toLocaleUpperCase'
     ];
     


     members.valueOf = members.toString;
     for (var i=0, l=mappedFunctions.length; i<l; i++) {
       members[mappedFunctions[i]] = String.prototype[mappedFunctions[i]];
     }
     
   }

});