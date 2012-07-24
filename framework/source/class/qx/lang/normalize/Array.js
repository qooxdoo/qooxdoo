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