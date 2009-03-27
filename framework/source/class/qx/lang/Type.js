/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Utility class with type check for all native JavaScript data types.
 */
qx.Bootstrap.define("qx.lang.Type",
{
  statics :
  {    
    __classToTypeMap :
    {
      "[object String]": "String",
      "[object Array]": "Array",
      "[object Object]": "Object",
      "[object RegExp]": "RegExp",
      "[object Number]": "Number",
      "[object Boolean]": "Boolean",
      "[object Function]": "Function"
    },
    
    
    /**
     * Get the internal class of the value. See 
     * http://thinkweb2.com/projects/prototype/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
     * for details.
     * 
     * @param value {var} value to get the class for
     * @return {String} the internal class of the value
     */
    getClass : function(value)
    {
      var classString = Object.prototype.toString.call(value);
      return (
        this.__classToTypeMap[classString] ||
        classString.slice(8, -1)
      );
    },
  
  
    /**
     * Whether the value is a string.
     * 
     * @return {Boolean} Whether the value is a string. 
     */
    isString : function(value)
    {
      return (
        typeof value === "string" ||
        this.getClass(value) == "String" ||
        value instanceof String ||
        (!!value && !!value.$$isString)
      );
    },
    
    
    /**
    * Whether the value is an array.
    * 
    * @return {Boolean} Whether the value is an array. 
    */    
    isArray : function(value)
    {
      return (
        value instanceof Array ||
        this.getClass(value) == "Array" ||
        (!!value && !!value.$$isArray)
      )
    },
    
    
    /**
    * Whether the value is an object. Note that buildin types like Window are 
    * not reported to be objects.
    * 
    * @return {Boolean} Whether the value is an object. 
    */    
    isObject : function(value) {
      return this.getClass(value) == "Object";
    },
    
    
    /**
    * Whether the value is a regular expression.
    * 
    * @return {Boolean} Whether the value is a regular expression. 
    */
    isRegExp : function(value) {
      return this.getClass(value) == "RegExp";
    },
    
    
    /**
    * Whether the value is a number.
    * 
    * @return {Boolean} Whether the value is a number. 
    */    
    isNumber : function(value) {
      return (
        this.getClass(value) == "Number" ||
        value instanceof Number
      );
    },


    /**
    * Whether the value is a boolean.
    * 
    * @return {Boolean} Whether the value is a boolean. 
    */    
    isBoolean : function(value) 
    {
      return (
        this.getClass(value) == "Boolean" ||
        value instanceof Boolean
      );
    },
    

    /**
    * Whether the value is a function.
    * 
    * @return {Boolean} Whether the value is a function. 
    */    
    isFunction : function(value) {
      return this.getClass(value) == "Function";
    }      
  }
});