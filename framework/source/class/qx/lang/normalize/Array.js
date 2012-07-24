/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class takes care of the normalization of the native 'Array' object.
 * Therefore it checks the availability of the following methods and appends
 * it, if not available. This means you can use the methods during
 * development in every browser. For usage samples, check out the attached links.
 *
 * *indexOf*:
 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.14">Annotated ES5 Spec</a>
 *
 * *lastIndexOf*:
 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.15">Annotated ES5 Spec</a>
 *
 * *forEach*:
 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.18">Annotated ES5 Spec</a>
 *
 * *filter*:
 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.20">Annotated ES5 Spec</a>
 *
 * *map*:
 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.19">Annotated ES5 Spec</a>
 *
 * *some*:
 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.17">Annotated ES5 Spec</a>
 *
 * *every*:
 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.16">Annotated ES5 Spec</a>
 *
 * *reduce*:
 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.21">Annotated ES5 Spec</a>
 *
 * *reduceRight*:
 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduceRight">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.4.4.22">Annotated ES5 Spec</a>
 *
 * Here is a little sample of how to use <code>indexOf</code> e.g.
 * <pre class="javascript">var a = ["a", "b", "c"];
 * a.indexOf("b"); // returns 1</pre>
 */
qx.Bootstrap.define("qx.lang.normalize.Array", {

  defer : function() {

    // fix indexOf
    if (!qx.core.Environment.get("ecmascript.array.indexof")) {
      Array.prototype.indexOf = function(searchElement, fromIndex) {
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
      }
    }


    // lastIndexOf
    if (!qx.core.Environment.get("ecmascript.array.lastindexof")) {
      Array.prototype.lastIndexOf = function(searchElement, fromIndex)
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
      }
    }


    // forEach
    if (!qx.core.Environment.get("ecmascript.array.foreach")) {
      Array.prototype.forEach = function(callback, obj)
      {
        var l = this.length;
        for (var i=0; i<l; i++)
        {
          var value = this[i];
          if (value !== undefined)  {
            callback.call(obj || window, value, i, this);
          }
        }
      }
    }


    // filter
    if (!qx.core.Environment.get("ecmascript.array.filter")) {
      Array.prototype.filter = function(callback, obj)
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
      }
    }


    // map
    if (!qx.core.Environment.get("ecmascript.array.map")) {
      Array.prototype.map = function(callback, obj)
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
      }
    }


    // some
    if (!qx.core.Environment.get("ecmascript.array.some")) {
      Array.prototype.some = function(callback, obj)
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
      }
    }


    // every
    if (!qx.core.Environment.get("ecmascript.array.every")) {
      Array.prototype.every = function(callback, obj)
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
      }
    }


    // reduce
    if (!qx.core.Environment.get("ecmascript.array.reduce")) {
      Array.prototype.reduce = function(callback, init) {
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
      };
    }


    // reduceRight
    if (!qx.core.Environment.get("ecmascript.array.reduceright")) {
      Array.prototype.reduceRight = function(callback, init) {
        if(typeof callback !== "function") {
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
      };
    }
  }
});