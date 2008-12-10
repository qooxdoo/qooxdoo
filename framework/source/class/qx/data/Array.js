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
      var item = this.__array.pop();
      this.__updateLength();
      this.fireDataEvent("change", {start: this.length - 1, end: this.length, type: "remove"}, null);
      return item;
    },
    
    
    push: function(varargs) {
      for (var i = 0; i < arguments.length; i++) {
        this.__array.push(arguments[i]);
        this.__updateLength();
        this.fireDataEvent("change", {start: this.length - 1, end: this.length - 1, type: "add"}, null);
      }
      return this.length;
    },
    
    
    reverse: function() {
      this.__array.reverse();
      this.fireDataEvent("change", {start: 0, end: this.length - 1, type: "order"}, null);      
    },
    
    
    shift: function() {
      var value = this.__array.shift();
      this.__updateLength();
      this.fireDataEvent("change", {start: 0, end: this.length -1, type: "remove"}, null);      
      return value;
    },
    
    
    slice: function(from, to) {
      return new qx.data.Array(this.__array.slice(from, to));
    },
    
    
    splice: function(varargs) {
      // get the important arguments
      var startIndex = arguments[0];
      var amount = arguments[1];
      
      // create a return array
      var returnArray = new qx.data.Array();

      // get the right end
      if (arguments.length >= 2) {
        var end = amount + startIndex;
      } else {
        var end = this.__array.length;          
      }
      
      // remove the objects
      for (var i = startIndex; i < end; i++) {
        // remove the last element
        returnArray.push(this.__array.splice(startIndex, 1)[0]);
        this.__updateLength();
        this.fireDataEvent("change", {start: startIndex, end: this.length - 1, type: "remove"}, null);        
      }
                  
      // if there are objects which should be added
      if (arguments.length > 2) {
        // go threw all objects which should be added
        for (var i = arguments.length - 1; i >= 2 ; i--) {
          // add every single object and fire an add event
          this.__array.splice(startIndex, 0, arguments[i]);
          this.__updateLength();
          this.fireDataEvent("change", {start: startIndex, end: this.length - 1, type: "add"}, null);          
        }
      }
            
      return returnArray;
    },
    
    
    sort: function(func) {
      this.__array.sort.apply(this.__array, arguments);   
      this.fireDataEvent("change", {start: 0, end: this.length - 1, type: "order"}, null);           
    },
    
    
    unshift: function(varargs) {
      for (var i = arguments.length - 1; i >= 0; i--) {
        this.__array.unshift(arguments[i])
        this.__updateLength();
        this.fireDataEvent("change", {start: 0, end: this.length - 1, type: "add"}, null);
      }
      return this.length;
    },
    
    
    getArray: function() {
      return this.__array;
    },
    
    
    getItem: function(index) {
      return this.__array[index];
    },
    
    
    setItem: function(index, item) {
      this.__array[index] = item;
      this.fireDataEvent("change", {start: index, end: index, type: "add"}, null);      
    },
    
    
    __updateLength : function() {
      this.length = this.__array.length;
    }
  }
});
