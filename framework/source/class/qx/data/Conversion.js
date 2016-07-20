/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class offers a set of default conversion methods and whole options
 * packs for {@link qx.data.SingleValueBinding}. The binding offers a conversion
 * itself if it can determinate which types should be used. In all other cases,
 * you can you this methods / options for the default conversion.
 */
qx.Class.define("qx.data.Conversion",
{
  statics :
  {
    /**
     * Converts the given value to a string via <code> + ""</code>.
     *
     * @param value {var} The value to convert.
     * @return {String} The converted value.
     */
    toString : function(value) {
      return value + "";
    },


    /**
     * Options for the {@link qx.data.SingleValueBinding}
     * containing the {@link #toString} converter.
     */
    TOSTRINGOPTIONS : { converter : null },


    /**
     * Converts the given value to a number via <code>parseFloat</code>.
     *
     * @param value {var} The value to convert.
     * @return {Number} The converted value.
     */
    toNumber : function(value) {
      return parseFloat(value);
    },


    /**
     * Options for the {@link qx.data.SingleValueBinding}
     * containing the {@link #toNumber} converter.
     */
    TONUMBEROPTIONS : { converter : null },


    /**
     * Converts the given value to a boolean via <code>!!value</code>.
     *
     * @param value {var} The value to convert.
     * @return {Boolean} The converted value.
     */
    toBoolean : function(value) {
      return !!value;
    },


    /**
     * Options for the {@link qx.data.SingleValueBinding}
     * containing the {@link #toBoolean} converter.
     */
    TOBOOLEANOPTIONS : { converter : null }
  },


  defer : function() {
    // the converter need to be set in the defer because the reference to
    // the converter function is not available during the class create
    qx.data.Conversion.TOSTRINGOPTIONS.converter = qx.data.Conversion.toString;
    qx.data.Conversion.TONUMBEROPTIONS.converter = qx.data.Conversion.toNumber;
    qx.data.Conversion.TOBOOLEANOPTIONS.converter = qx.data.Conversion.toBoolean;
  }
});
