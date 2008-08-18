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

************************************************************************ */

/**
 * This class extends the buildin JavaScript String class. It can be used as
 * base class for classes, which need to derive from String.
 *
 * Instances of this class can be used everywhere, where a JavaScript string is
 * valid.
 */
qx.Class.define("qx.core.BaseString",
{
  extend : String,

  /**
   * @param txt {String} Initialize with this string
   */
  construct : function(txt)
  {
    if (qx.core.Variant.isSet("qx.debug", "on")) {
      this.assertType(txt, "string", "Invalid argument 'txt'.");
    }

    // no base call needed
    this._txt = txt;
  },

  members :
  {
    /**
     * Returns the value as plain string.
     * Overrides the default implementation.
     *
     * @return {String} The string value
     */
    toString : function() {
      return this._txt;
    },


    /**
     * Returns the value as plain string.
     * Overrides the default implementation.
     *
     * @return {String} The string value
     */
    valueOf : function() {
      return this._txt;
    },


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

   defer : function(statics)
   {
     // add asserts into each debug build
     if (qx.core.Variant.isSet("qx.debug", "on")) {
       qx.Class.include(statics, qx.core.MAssert);
     }
   }
});