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
  extend : String,

  /**
   * @param txt {String?""} Initialize with this string
   */
  construct : function(txt)
  {
    var txt = txt || "";
    
    // no base call needed
    var push = Array.prototype.push;
    push.apply(this, txt.split(""));    
  },

  members :
  {
    /**
     * Returns the value as plain string.
     * Overrides the default implementation.
     *
     * @return {String} The string value
     */
    toString : qx.core.Variant.select("qx.client",
    {
      "gecko|mshtml": function()
      {
        var charList = [];
        var i=0;
        while (this[i] !== undefined) {
          charList[i] = this[i];
          i++;
        }
        
        return charList.join("");        
      },
      
      "default": function() {
        return Array.prototype.join.call(this, "");
      }
    }),
    
    
    /**
     * Returns the value as plain string.
     * Overrides the default implementation.
     *
     * @return {String} The string value
     */
    valueOf : function() {},


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

    // TODO: Add documentation from MDC.
    // charAt : null,
    // charCodeAt : null,
    // concat : null,
    // indexOf : null,
    // lastIndexOf : null,
    // localeCompare : null,
    // replace : null,
    // search : null,
    // substring : null,
    // toLowerCase : null,
    // toLocaleLowerCase : null,
    // toUpperCase : null,
    // toLocaleUpperCase : null

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
     
     members.valueOf = members.toString;
   }
});