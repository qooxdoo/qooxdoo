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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * EXPERIMENTAL!
 */
qx.Class.define("qx.data.Array", 
{
  extend : qx.core.Object,


  construct : function(param)
  {
    this.base(arguments);
    // if no argument is given
    if (param == undefined) {
      this.__array = [];
    
    // check for elements (create the array)
    } else if (arguments.length > 1) {
      // creaete an empty array and go through every argument and push it
      this.__array = [];
      for (var i = 0; i < arguments.length; i++) {
        this.__array.push(arguments[i]);
      }
    
    // check for a number (length)        
    } else if (typeof param == "number") {
      this.__array = new Array(param);
    // check for a array itself      
    } else if (param instanceof Array) {
      this.__array = param;
      
    // error case
    } else {
      throw new Error("Type of the parameter not supported!");
    }
    
    // update the length at startup
    this.__updateLength();
  },


  members :
  {
    concat: function(array) {
      var newArray = this.__array.concat(array);
      return new qx.data.Array(newArray);
    },
    
    
    join: function(connector) {
      return this.__array.join(connector);
    },
    
    
    pop: function() {
      var obj = this.__array.pop();
      this.__updateLength();
      return obj;
    },
    
    
    push: function(varargs) {
      this.__array.push.apply(this.__array, arguments);
      this.__updateLength();
      return this.length;
    },
    
    
    reverse: function() {
      this.__array.reverse();
    },
    
    
    shift: function() {
      var value = this.__array.shift();
      this.__updateLength();
      return value;
    },
    
    
    slice: function(from, to) {
      return new qx.data.Array(this.__array.slice(from, to));
    },
    
    
    splice: function(from, amount) {
      var newArray = this.__array.splice.apply(this.__array, arguments);
      this.__updateLength();
      return new qx.data.Array(newArray);
    },
    
    
    sort: function(func) {
      this.__array.sort.apply(this.__array, arguments);        
    },
    
    
    unshift: function(varargs) {
      this.__array.unshift.apply(this.__array, arguments);        
      this.__updateLength();
      return this.length;
    },
    
    
    // return the array
    getArray: function() {
      return this.__array;
    },
    
    
    getValueAt: function(index) {
      return this.__array[index];
    },
    
    
    __updateLength : function() {
      this.length = this.__array.length;
    }
  }
});
