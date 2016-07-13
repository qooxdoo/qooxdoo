/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * An extended array class which adds a lot of often used
 * convenience methods to the regular array like <code>remove</code> or
 * <code>contains</code>.
 */
qx.Class.define("qx.type.Array",
{
  extend : qx.type.BaseArray,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new Array with the given length or the listed items.
   *
   * <pre class="javascript">
   * var arr1 = new qx.type.Array(length);
   * var arr2 = new qx.type.Array(elem0, elem1, ..., elemN);
   * </pre>
   *
   * * <code>length</code>: The initial length of the array.
   * * <code>item1, item2. .. itemN</code>:  the items that will make up the newly created array
   *
   * @param length_or_items {Integer|var?null} The initial size of the collection
   *        OR an argument list of elements.
   */
  construct : function(length_or_items) {
    qx.type.BaseArray.apply(this,arguments);
  },


  members :
  {
    /**
     * Returns a clone of the array. Primitive values are copied.
     * Others are referenced.
     *
     * @return {Array} Cloned array instance
     * @signature function()
     */
    clone : qx.type.BaseArray.prototype.concat,


    /**
     * Insert an element at a given position
     *
     * @param obj {var} the element to insert
     * @param i {Integer} position where to insert the element into the arr
     * @return {Array} the array
     */
    insertAt : function(obj, i)
    {
      this.splice(i, 0, obj);
      return this;
    },


    /**
     * Insert an element before a given second element
     *
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 before this object
     * @return {Array} the array
     */
    insertBefore : function(obj, obj2)
    {
      var i = this.indexOf(obj2);

      if (i == -1) {
        this.push(obj);
      } else {
        this.splice(i, 0, obj);
      }

      return this;
    },


    /**
     * Insert an element after a given second element
     *
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 after this object
     * @return {Array} the array
     */
    insertAfter : function(obj, obj2)
    {
      var i = this.indexOf(obj2);

      if (i == -1 || i == (this.length - 1)) {
        this.push(obj);
      } else {
        this.splice(i + 1, 0, obj);
      }

      return this;
    },


    /**
     * Remove an element at the given index
     *
     * @param i {Integer} index of the element to be removed
     * @return {var} The removed element.
     */
    removeAt : function(i) {
      return this.splice(i, 1)[0];
    },


    /**
     * Remove all elements
     *
     * @return {Array} empty array
     */
    removeAll : function()
    {
      this.length = 0;
      return this;
    },


    /**
     * Append the elements of the given array
     *
     * @param arr {Array} the elements of this array will be appended to other one
     * @return {Array} The modified array.
     * @throws {Error} if one of the arguments is not an array
     */
    append : function(arr)
    {
      var arg = this.__toPlainArray(arr);
      Array.prototype.push.apply(this, arg);
      return this;
    },


    /**
     * Prepend the elements of the given array.
     *
     * @param arr {Array} The elements of this array will be prepended to other one
     * @return {Array} The modified array.
     * @throws {Error} if one of the arguments is not an array
     */
    prepend : function(arr)
    {
      var arg = this.__toPlainArray(arr);
      Array.prototype.splice.apply(this, [0, 0].concat(arg));
      return this;
    },


    /**
     * Helper which checks for the given element and converts that to a
     * native array if necessary.
     *
     * @param arr {Array} Native or qx.type.BaseArray to convert.
     * @return {Array} A native array.
     */
    __toPlainArray : function(arr) {
      // this check is important because Opera throws an uncatchable error if
      // apply is called without an arr as second argument.
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertArray(arr, "The parameter must be an array.");
      }

      var arg = arr;
      // concat needs a plain array as argument [BUG #4488]
      if (arr instanceof qx.type.BaseArray) {
        arg = [];
        for (var i=0; i < arr.length; i++) {
          arg[i] = arr[i];
        };
      }
      return arg;
    },


    /**
     * Remove an element
     *
     * @param obj {var} element to be removed from the array
     * @return {var} the removed element
     */
    remove : function(obj)
    {
      var i = this.indexOf(obj);
      if (i != -1)
      {
        this.splice(i, 1);
        return obj;
      }
    },


    /**
     * Whether the array contains the given element
     *
     * @param obj {var} object to look for
     * @return {Boolean} whether the array contains the element
     */
    contains : function(obj) {
      return this.indexOf(obj) !== -1;
    }
  }
});
