/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * Collection of methods to compare two values.
 */
qx.Class.define("qx.util.Compare",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Compare two Strings
     *
     * @type static
     * @param a {String} first value
     * @param b {String} second value
     * @return {Number} 0 if both values are equal
     *       a number > 0 if the first value if greater than the second one
     *       a value < 0  otherwise
     */
    byString : function(a, b) {
      return a == b ? 0 : a > b ? 1 : -1;
    },


    /**
     * Compare two Strings ignoring the letter case.
     *
     * @type static
     * @param a {String} first value
     * @param b {String} second value
     * @return {Number} 0 if both values are equal
     *       a number > 0 if the first value if greater than the second one
     *       a value < 0  otherwise
     */
    byStringCaseInsensitive : function(a, b) {
      return qx.util.Compare.byString(a.toLowerCase(), b.toLowerCase());
    },


    /**
     * Compare two Strings but first convert umlauts to an ascii character.
     *
     * @type static
     * @param a {String} first value
     * @param b {String} second value
     * @return {Number} 0 if both values are equal
     *       a number > 0 if the first value if greater than the second one
     *       a value < 0  otherwise
     */
    byStringUmlautsShort : function(a, b) {
      return qx.util.Compare.byString(qx.util.Normalization.umlautsShort(a), qx.util.Normalization.umlautsShort(b));
    },


    /**
     * Compare two Strings but first convert umlauts to an ascii character and ignore letter case.
     *
     * @type static
     * @param a {String} first value
     * @param b {String} second value
     * @return {Number} 0 if both values are equal
     *       a number > 0 if the first value if greater than the second one
     *       a value < 0  otherwise
     */
    byStringUmlautsShortCaseInsensitive : function(a, b) {
      return qx.util.Compare.byString(qx.util.Normalization.umlautsShort(a).toLowerCase(), qx.util.Normalization.umlautsShort(b).toLowerCase());
    },


    /**
     * Compare two Strings but first convert umlauts to ascii characters.
     *
     * @type static
     * @param a {String} first value
     * @param b {String} second value
     * @return {Number} 0 if both values are equal
     *       a number > 0 if the first value if greater than the second one
     *       a value < 0  otherwise
     */
    byStringUmlautsLong : function(a, b) {
      return qx.util.Compare.byString(qx.util.Normalization.umlautsLong(a), qx.util.Normalization.umlautsLong(b));
    },


    /**
     * Compare two Strings but first convert umlauts to ascii characters and ignore letter case.
     *
     * @type static
     * @param a {String} first value
     * @param b {String} second value
     * @return {Number} 0 if both values are equal
     *       a number > 0 if the first value if greater than the second one
     *       a value < 0  otherwise
     */
    byStringUmlautsLongCaseInsensitive : function(a, b) {
      return qx.util.Compare.byString(qx.util.Normalization.umlautsLong(a).toLowerCase(), qx.util.Normalization.umlautsLong(b).toLowerCase());
    },


    /**
     * Compare two Float numbers.
     *
     * @type static
     * @param a {Float} first value
     * @param b {Float} second value
     * @return {Number} 0 if both values are equal
     *       a number > 0 if the first value if greater than the second one
     *       a value < 0  otherwise
     */
    byFloat : function(a, b) {
      return a - b;
    },


    /**
     * Compare two Strings representing integers. First convert the strings to  an interger.
     *
     * @type static
     * @param a {String} first value
     * @param b {String} second value
     * @return {Number} 0 if both values are equal
     *       a number > 0 if the first value if greater than the second one
     *       a value < 0  otherwise
     */
    byIntegerString : function(a, b) {
      return parseInt(a) - parseInt(b);
    },


    /**
     * Compare two Strings representing floats. First convert the strings to  an float.
     *
     * @type static
     * @param a {String} first value
     * @param b {String} second value
     * @return {Number} 0 if both values are equal
     *       a number > 0 if the first value if greater than the second one
     *       a value < 0  otherwise
     */
    byFloatString : function(a, b) {
      return parseFloat(a) - parseFloat(b);
    },


    /**
     * Compare two Strings representing IPv4 adresses.
     * Example: "192.168.1.2"
     *
     * @type static
     * @param a {String} first value
     * @param b {String} second value
     * @return {Number} 0 if both values are equal
     *       a number > 0 if the first value if greater than the second one
     *       a value < 0  otherwise
     */
    byIPv4 : function(a, b)
    {
      var ipa = a.split(".", 4);
      var ipb = b.split(".", 4);

      for (var i=0; i<3; i++)
      {
        a = parseInt(ipa[i]);
        b = parseInt(ipb[i]);

        if (a != b) {
          return a - b;
        }
      }

      return parseInt(ipa[3]) - parseInt(ipb[3]);
    },


    /**
     * Compare the zIndex property of two widgets.
     *
     * @type static
     * @param a {qx.ui.core.Widget} first value
     * @param b {qx.ui.core.Widget} second value
     * @return {Number} 0 if both values are equal
     *       a number > 0 if the first value if greater than the second one
     *       a value < 0  otherwise
     */
    byZIndex : function(a, b) {
      return a.getZIndex() - b.getZIndex();
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    // define alias
    statics.byInteger = statics.byNumber = statics.byFloat;
    statics.byNumberString = statics.byFloatString;
  }

});
