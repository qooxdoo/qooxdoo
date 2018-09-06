/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class is responsible for the normalization of the native 'Array' object.
 * It checks if these methods are available and, if not, appends them to
 * ensure compatibility in all browsers.
 * For usage samples, check out the attached links.
 *
 * MDN documentation &copy; Mozilla Contributors.
 *
 * @group (Polyfill)
 * @use(qx.bom.client.EcmaScript)
 */
qx.Bootstrap.define("qx.lang.normalize.Array", {

  statics : {

    /**
     * The <code>indexOf()</code> method returns the first index at which a given
     * element can be found in the array, or -1 if it is not present.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.4.4.14">Annotated ES5 Spec</a>
     *
     * @param searchElement {var} Element to locate in the array.
     * @param fromIndex {Integer?} The index to start the search at.
     * If the index is greater than or equal to the array's length,
     * -1 is returned, which means the array will not be searched.
     * If the provided index value is a negative number, it is taken
     * as the offset from the end of the array. Note: if the provided
     * index is negative, the array is still searched from front to
     * back. If the calculated index is less than 0, then the whole
     * array will be searched. Default: 0 (Entire array is searched)
     * @return {Integer} The first index at which the element was found or -1
     * if the element was not found in the array
     */
    indexOf : function(searchElement, fromIndex) {
      if (fromIndex == null) {
        fromIndex = 0;
      } else if (fromIndex < 0) {
        fromIndex = Math.max(0, this.length + fromIndex);
      }

      for (var i=fromIndex; i<this.length; i++) {
        if (this[i] === searchElement) {
          return i;
        }
      }

      return -1;
    },


    /**
     * The <code>lastIndexOf()</code> method returns the last index
     * at which a given element can be found in the array, or -1 if
     * it is not present. The array is searched backwards, starting at
     * <code>fromIndex</code>.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.4.4.15">Annotated ES5 Spec</a>
     *
     * @param searchElement {var} Element to locate in the array.
     * @param fromIndex {Integer?} The index at which to start
     * searching backwards. Defaults to the array's length, i.e. the
     * whole array will be searched. If the index is greater than or
     * equal to the length of the array, the whole array will be
     * searched. If negative, it is taken as the offset from the end
     * of the array. Note that even when the index is negative, the
     * array is still searched from back to front. If the calculated
     * index is less than 0, -1 is returned, i.e. the array will not
     * be searched.
     * @return {Integer} The last index at which the element was found or -1
     * if the element was not found in the array
     */
    lastIndexOf : function(searchElement, fromIndex)
    {
      if (fromIndex == null) {
        fromIndex = this.length - 1;
      } else if (fromIndex < 0) {
        fromIndex = Math.max(0, this.length + fromIndex);
      }

      for (var i=fromIndex; i>=0; i--) {
        if (this[i] === searchElement) {
          return i;
        }
      }

      return -1;
    },


    /**
     * The <code>forEach()</code> method executes a provided function
     * once per array element. You can not break the loop with this function.
     * If you want to do so, use {@link #some} or {@link #every}.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.4.4.18">Annotated ES5 Spec</a>
     *
     * @param callback {Function} Function to execute for each element.
     * @param obj {Object?} Value to use as <code>this</code> when executing <code>callback</code>.
     */
    forEach : function(callback, obj)
    {
      var l = this.length;
      for (var i=0; i<l; i++)
      {
        var value = this[i];
        if (value !== undefined)  {
          callback.call(obj || window, value, i, this);
        }
      }
    },


    /**
     * The <code>filter()</code> method creates a new array with
     * all elements that pass the test implemented by the provided
     * function.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.4.4.20">Annotated ES5 Spec</a>
     *
     * @param callback {Function} Function to test each element of the array.
     * @param obj {Object?} Value to use as <code>this</code> when executing <code>callback</code>.
     * @return {Array} filtered array
     */
    filter : function(callback, obj)
    {
      var res = [];

      var l = this.length;
      for (var i=0; i<l; i++)
      {
        var value = this[i];
        if (value !== undefined)
        {
          if (callback.call(obj || window, value, i, this)) {
            res.push(this[i]);
          }
        }
      }

      return res;
    },

    /**
     * The <code>map()</code> method creates a new array with
     * the results of calling a provided function on every
     * element in this array.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.4.4.19">Annotated ES5 Spec</a>
     *
     * @param callback {Function} Function that produces an element of the new Array,
     * taking three arguments:
     * <ul>
     *   <li><code>currentValue</code> The current element being processed in the array.</li>
     *   <li><code>index</code> The index of the current element being processed in the array.</li>
     *   <li><code>array</code> The array map was called upon.</li>
     * </ul>
     * @param obj {Object?} Value to use as <code>this</code> when executing <code>callback</code>.
     * @return {Array} result array
     */
    map : function(callback, obj)
    {
      var res = [];

      var l = this.length;
      for (var i=0; i<l; i++)
      {
        var value = this[i];
        if (value !== undefined) {
          res[i] = callback.call(obj || window, value, i, this);
        }
      }

      return res;
    },

    /**
     * The <code>some()</code> method tests whether some
     * element in the array passes the test implemented by
     * the provided function.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.4.4.17">Annotated ES5 Spec</a>
     *
     * @param callback {Function} Function to test for each element.
     * @param obj {Object?} Value to use as <code>this</code> when executing <code>callback</code>.
     * @return {Array} result array
     */
    some : function(callback, obj)
    {
      var l = this.length;
      for (var i=0; i<l; i++)
      {
        var value = this[i];
        if (value !== undefined)
        {
          if (callback.call(obj || window, value, i, this)) {
            return true;
          }
        }
      }

      return false;
    },

    /**
     * The <code>every()</code> method tests whether all elements
     * in the array pass the test implemented by the provided function.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.4.4.16">Annotated ES5 Spec</a>
     *
     * @param callback {Function} Function to test for each element.
     * @param obj {Object?} Value to use as <code>this</code> when executing <code>callback</code>.
     * @return {Array} result array
     */
    every : function(callback, obj)
    {
      var l = this.length;
      for (var i=0; i<l; i++)
      {
        var value = this[i];
        if (value !== undefined)
        {
          if (!callback.call(obj || window, value, i, this)) {
            return false;
          }
        }
      }

      return true;
    },
    
    /**
     * The <code>find()</code> method returns a value in the array, if an element in the 
     * array satisfies the provided testing function. Otherwise undefined is returned.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find">MDN documentation</a> |
     *
     * @param callback {Function} Function to test for each element.
     * @param obj {Object?} Value to use as <code>this</code> when executing <code>callback</code>.
     * @return {Object} result, undefined if not found
     */
    find : function(callback, obj) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertFunction(callback);
      }
      
      var l = this.length;
      for (var i = 0; i < l; i++) {
        var value = this[i];
        if (callback.call(obj || window, value, i, this)) {
          return value;
        }
      }
      
      return undefined;
    },

    /**
     * The <code>findIndex()</code> method returns an index in the array, if an element in the 
     * array satisfies the provided testing function. Otherwise -1 is returned.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex">MDN documentation</a> |
     *
     * @param callback {Function} Function to test for each element.
     * @param obj {Object?} Value to use as <code>this</code> when executing <code>callback</code>.
     * @return {Integer} the index in the array, -1 if not found
     */
    findIndex : function(callback, obj) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertFunction(callback);
      }
      
      var l = this.length;
      for (var i = 0; i < l; i++) {
        var value = this[i];
        if (callback.call(obj || window, value, i, this)) {
          return i;
        }
      }
      
      return -1;
    },

    /**
     * The <code>reduce()</code> method applies a function against
     * an accumulator and each value of the array (from left-to-right)
     * has to reduce it to a single value.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.4.4.21">Annotated ES5 Spec</a>
     *
     * @param callback {Function} Function to execute on each value in
     * the array, taking four arguments:
     * <ul>
     *   <li><code>previousValue</code> The value previously returned in
     *   the last invocation of the callback, or initialValue, if supplied.
     *   (See below.)</li>
     *   <li><code>currentValue</code> The current element being processed in the array.</li>
     *   <li><code>index</code> The index of the current element being processed in the array.</li>
     *   <li><code>array</code> The array <code>reduce</code> was called upon.</li>
     * </ul>
     * @param init {Object?} Object to use as the first argument to the first call of the callback.
     * @return {var} result value
     */
    reduce : function(callback, init) {
      if(typeof callback !== "function") {
        throw new TypeError("First argument is not callable");
      }

      if (init === undefined && this.length === 0) {
        throw new TypeError("Length is 0 and no second argument given");
      }

      var ret = init === undefined ? this[0] : init;
      for (var i = init === undefined ? 1 : 0; i < this.length; i++) {
        if (i in this) {
          ret = callback.call(undefined, ret, this[i], i, this);
        }
      }

      return ret;
    },

    /**
     * The reduceRight() method applies a function against an
     * accumulator and each value of the array (from right-to-left)
     * as to reduce it to a single value.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.4.4.22">Annotated ES5 Spec</a>
     *
     * @param callback {Function} Function to execute on each value in
     * the array, taking four arguments:
     * <ul>
     *   <li><code>previousValue</code> The value previously returned in
     *   the last invocation of the callback, or initialValue, if supplied.
     *   (See below.)</li>
     *   <li><code>currentValue</code> The current element being processed in the array.</li>
     *   <li><code>index</code> The index of the current element being processed in the array.</li>
     *   <li><code>array</code> The array <code>reduce</code> was called upon.</li>
     * </ul>
     * @param init {Object?} Object to use as the first argument to the first call of the callback.
     * @return {var} return value
     */
    reduceRight : function(callback, init) {
      if (typeof callback !== "function") {
        throw new TypeError("First argument is not callable");
      }

      if (init === undefined && this.length === 0) {
        throw new TypeError("Length is 0 and no second argument given");
      }

      var ret = init === undefined ? this[this.length - 1] : init;
      for (var i = init === undefined ? this.length - 2 : this.length - 1; i >= 0; i--) {
        if (i in this) {
          ret = callback.call(undefined, ret, this[i], i, this);
        }
      }

      return ret;
    },

    /**
     * The includes() method determines whether an array includes a certain element, returning
     * true or false as appropriate.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes">MDN documentation</a> |
     *
     * @param searchElement {var} Element which is checked for.
     * @param fromIndex {Number} Index to start search from
     * @return {bool} true if element is included
     */
    includes : function(searchElement, fromIndex)
    {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        // c. Increase k by 1. 
        k++;
      }

      // 8. Return false
      return false;
    }
  },

  /**
   * @lint environmentNonLiteralKey()
   */
  defer : function(statics) {
    var install = function(key, name) {
      if (!qx.core.Environment.get(key)) {
        Object.defineProperty(Array.prototype, name, {
          enumerable: false,
          value: statics[name]
        });
      }
    };
    
    install("ecmascript.array.indexof", "indexOf");
    install("ecmascript.array.lastindexof", "lastIndexOf");
    install("ecmascript.array.foreach", "forEach");
    install("ecmascript.array.filter", "filter");
    install("ecmascript.array.map", "map");
    install("ecmascript.array.some", "some");
    install("ecmascript.array.find", "find");
    install("ecmascript.array.findIndex", "findIndex");
    install("ecmascript.array.every", "every");
    install("ecmascript.array.reduce", "reduce");
    install("ecmascript.array.reduceright", "reduceRight");
    install("ecmascript.array.includes", "includes");
  }
});
