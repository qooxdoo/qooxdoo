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
 *
 * Mapping class of the native JavaScript array. This does have all the native
 * methods but fires event if the content of the array changes in any way.
 * Also the <code>.length</code> property is available on the array.
 */
qx.Class.define("qx.data.Array",
{
  extend : qx.core.Object,

  /**
   * Creates a new instance of an array.
   *
   * @param param {var} The parameter can be some types.<br/>
   *   Without a parameter a new blank array will be created.<br/>
   *   If there is more than one parameter ist given, the parameter will be
   *   added directly to the new array.<br/>
   *   If the parameter is a number, a new Array with the given lenght will be
   *   created.<br/>
   *   If the paramter is a javascript array, a new array containing the given
   *   elements will be created.
   */
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
      this.__array = qx.lang.Array.copy(param);

    // error case
    } else {
      throw new Error("Type of the parameter not supported!");
    }

    // update the length at startup
    this.__updateLength();
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * The change event which will be fired if there is a change in the array.
     * The data contains a map with three key value pairs:
     * <li>start: The start index of the change.</li>
     * <li>end: The end index of the change.</li>
     * <li>type: The type of the change as a String. This can be 'add',  
     * 'remove' or 'order'</li>
     */
    "change" : "qx.event.type.Data",
    
    /**
     * The changeLength event will be fired every time the length of the
     * array changes.
     */
    "changeLength": "qx.event.type.Event"
  },


  members :
  {
    /**
     * Concatenates the current and the given array into a new one.
     *
     * @param array {Array} The javaScript array which should be concatinated
     *   to the current array.
     *
     * @return {qx.data.Array} A new array containing the values of both former
     *   arrays.
     */
    concat: function(array) {
      var newArray = this.__array.concat(array);
      return new qx.data.Array(newArray);
    },


    /**
     * Returns the array as a string usting the given connerctor string to
     * connect the values.
     *
     * @param connector {String} the string which should be used to past in
     *  between of the array values.
     *
     * @return {String} The array as a string.
     */
    join: function(connector) {
      return this.__array.join(connector);
    },


    /**
     * Removes and returns the last element of the array.
     * An change event will be fired.
     *
     * @return {var} The last element of the array.
     */
    pop: function() {
      var item = this.__array.pop();
      this.__updateLength();
      this.fireDataEvent("change", 
        {start: this.length - 1, end: this.length - 1, type: "remove"}, null
      );
      return item;
    },


    /**
     * Adds a element at the end of the array.
     *
     * @param varargs {var} Multiple elements. Every element will be added to
     *   the end of the array. An change event will be fired.
     *
     * @return {Number} The new length of the array.
     */
    push: function(varargs) {
      for (var i = 0; i < arguments.length; i++) {
        this.__array.push(arguments[i]);
        this.__updateLength();
        this.fireDataEvent("change", 
          {start: this.length - 1, end: this.length - 1, type: "add"}, null
        );
      }
      return this.length;
    },


    /**
     * Reverses the order of the array. An change event will be fired.
     */
    reverse: function() {
      this.__array.reverse();
      this.fireDataEvent("change", 
        {start: 0, end: this.length - 1, type: "order"}, null
      );
    },


    /**
     * Removes the first element of the array and returns it. An change event
     * will be fired.
     *
     * @return {var} the former first element.
     */
    shift: function() {
      var value = this.__array.shift();
      this.__updateLength();
      this.fireDataEvent("change", 
        {start: 0, end: this.length -1, type: "remove"}, null
      );
      return value;
    },


    /**
     * Returns a new array with the values specified by the parameter.
     *
     * @param from {Number} The start index.
     * @param to {Number} The end index.
     *
     * @return {qx.data.Array} A new array containing the given range of values.
     */
    slice: function(from, to) {
      return new qx.data.Array(this.__array.slice(from, to));
    },


    /**
     * Method to remove and add new element to the array. For every remove or
     * add an event will be fired.
     *
     * @param varargs {var} The first parameter defines the start index.
     *   The second parameter defines number of element which will be removed
     *   at the given position.
     *   All folloing parameters will be added at the given position to the
     *   array.
     * @return {qx.data.Array} An array containing the removed elements.
     */
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
        this.fireDataEvent("change", 
          {start: startIndex, end: this.length - 1, type: "remove"}, null
        );
      }

      // if there are objects which should be added
      if (arguments.length > 2) {
        // go threw all objects which should be added
        for (var i = arguments.length - 1; i >= 2 ; i--) {
          // add every single object and fire an add event
          this.__array.splice(startIndex, 0, arguments[i]);
          this.__updateLength();
          this.fireDataEvent("change", 
            {start: startIndex, end: this.length - 1, type: "add"}, null
          );
        }
      }

      return returnArray;
    },


    /**
     * Sorts the array. If a sort function is given, this will be used to
     * compare the items.
     *
     * @param func {Function} A compare function comparing two parameters and
     *   sould return a number.
     */
    sort: function(func) {
      this.__array.sort.apply(this.__array, arguments);
      this.fireDataEvent("change", 
        {start: 0, end: this.length - 1, type: "order"}, null
      );
    },


    /**
     * Adds the given items to the beginning of the array. For every element,
     * a change event will be fired.
     *
     * @param varargs {var} As many elements as you want to add to the beginning.
     */
    unshift: function(varargs) {
      for (var i = arguments.length - 1; i >= 0; i--) {
        this.__array.unshift(arguments[i])
        this.__updateLength();
        this.fireDataEvent("change", 
          {start: 0, end: this.length - 1, type: "add"}, null
        );
      }
      return this.length;
    },


    /**
     * Returns the native array.
     *
     * @return {Array} The native array.
     */
    getArray: function() {
      return this.__array;
    },


    /**
     * Replacement function for the getting of the array value.
     * array[0] should be array.getItem(0).
     *
     * @param index {Number} The index requested of the array element.
     *
     * @return {var} The element at the given index.
     */
    getItem: function(index) {
      return this.__array[index];
    },


    /**
     * Replacement function for the setting of a array value.
     * array[0] = "a" sould be array.setItem(0, "a").
     * A change event will be fired.
     *
     * @param index {Number} The index of the array element.
     * @param item {var} The new item to set.
     */
    setItem: function(index, item) {
      this.__array[index] = item;
      // only update the length if its changed
      if (this.length != this.__array.length) {
        this.__updateLength();        
      }
      this.fireDataEvent("change", 
        {start: index, end: index, type: "add"}, null
      );
    },
    
    
    /**
     * Returns the index of the item in the array. If the item is not in the
     * array, -1 will be returned.
     * 
     * @return {number} The Index of the given item.
     */
    indexOf: function(item) {
      return this.__array.indexOf(item);
    },
    
    
    /**
     * Returns the toString of the original Array
     * @return {String} The array as a string.
     */
    toString: function() {
      return this.__array.toString();
    },
    
    
    /**
     * Check if the given item is in the current array.
     * 
     * @return {boolean} true, if the array contains the given item.
     */
    contains: function(item) {
      return this.__array.indexOf(item) !== -1;
    },
    
    
    /**
     * Internal function wich updates the length property of the array.
     * Every time the length will be updated, a {@link #changeLength} data 
     * event will be fired.
     */
    __updateLength: function() {
      this.length = this.__array.length;
      this.fireEvent("changeLength", qx.event.type.Event);
    }    
  }
});
