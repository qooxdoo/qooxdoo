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

qx.Bootstrap.define("qx.lang.Type",
{
  statics :
  {    
    __objectToString : function(value) {
      return Object.prototype.toString.call(value);
    },
  
    
    __classToTypeMap :
    {
      "[object String]": "string",
      "[object Array]": "array",
      "[object Object]": "object"
    },
    
    
    getClass : function(value)
    {
      var classString = this.__objectToString(value)
      return (
        this.__classToTypeMap[classString] ||
        classString.slice(8, -1)
      );
    },
  
  
    isString : function(value)
    {
      return (
        typeof value === "string" ||
        this.getClass(value) == "string" ||
        (!!value && !!value.$$isString)
      );
    },
    
    
    isArray : function(value)
    {
      return (
        value instanceof Array ||
        this.getClass(value) == "array" ||
        (!!value && !!value.$$isArray)
      )
    },
    
    
    isObject : function(value) {
      return this.getClass(value) == "object";
    }    
  }
});