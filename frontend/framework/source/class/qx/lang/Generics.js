/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)
#ignore(auto-require)
#require(qx.lang.Core)

************************************************************************ */

/**
 * Support string/array generics as introduced with JavaScript 1.6 for
 * all browsers.
 *
 * http://developer.mozilla.org/en/docs/New_in_JavaScript_1.6#Array_and_String_generics
 *
 * *Array*
 *
 * * join
 * * reverse
 * * sort
 * * push
 * * pop
 * * shift
 * * unshift
 * * splice
 * * concat
 * * slice
 * * indexOf
 * * lastIndexOf
 * * forEach
 * * map
 * * filter
 * * some
 * * every
 *
 * *String*
 *
 * * quote
 * * substring
 * * toLowerCase
 * * toUpperCase
 * * charAt
 * * charCodeAt
 * * indexOf
 * * lastIndexOf
 * * toLocaleLowerCase
 * * toLocaleUpperCase
 * * localeCompare
 * * match
 * * search
 * * replace
 * * split
 * * substr
 * * concat
 * * slice
 */
qx.Class.define("qx.lang.Generics",
{
  statics :
  {
    /** Which methods to map */
    __map :
    {
      "Array" : [ "join", "reverse", "sort", "push", "pop", "shift", "unshift", "splice", "concat", "slice", "indexOf", "lastIndexOf", "forEach", "map", "filter", "some", "every" ],
      "String" : [ "quote", "substring", "toLowerCase", "toUpperCase", "charAt", "charCodeAt", "indexOf", "lastIndexOf", "toLocaleLowerCase", "toLocaleUpperCase", "localeCompare", "match", "search", "replace", "split", "substr", "concat", "slice" ]
    },


    /**
     * Make a method of an object generic and return the generic functions.
     * The generic function takes as first parameter the object the method operates on.
     *
     * TODO: maybe mode this function to qx.lang.Function
     *
     * @type static
     * @param obj {Object} the object in which prototype the function is defined.
     * @param func {String} name of the method to wrap.
     * @return {Function} wrapped method. This function takes as first argument an
     *         instance of obj and as following arguments the arguments of the original method.
     */
    __wrap : function(obj, func)
    {
      return function(s) {
        return obj.prototype[func].apply(s, Array.prototype.slice.call(arguments, 1));
      };
    },


    /**
     * Initialize all generic functions as defined in JavaScript 1.6.
     *
     * @type static
     * @return {void}
     */
    __init : function()
    {
      var map = qx.lang.Generics.__map;

      for (var key in map)
      {
        var obj = window[key];
        var arr = map[key];

        for (var i=0, l=arr.length; i<l; i++)
        {
          var func = arr[i];

          if (!obj[func]) {
            obj[func] = qx.lang.Generics.__wrap(obj, func);
          }
        }
      }
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();
  }
});
