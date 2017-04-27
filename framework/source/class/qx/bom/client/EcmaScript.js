/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The main purpose of this class to hold all checks about ECMAScript.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.EcmaScript",
{
  statics :
  {
    /**
     * Returns the name of the Error object property that holds stack trace
     * information or null if the client does not provide any.
     *
     * @internal
     * @return {String|null} <code>stack</code>, <code>stacktrace</code> or
     * <code>null</code>
     */
    getStackTrace : function()
    {
      var propName;
      var e = new Error("e");
      propName = e.stack ? "stack" : e.stacktrace ? "stacktrace" : null;

      // only thrown errors have the stack property in IE10 and PhantomJS
      if (!propName) {
        try {
          throw e;
        } catch(ex) {
          e = ex;
        }
      }

      return e.stacktrace ? "stacktrace" : e.stack ? "stack" : null;
    },


    /**
     * Checks if 'MutationObserver' is supported.
     * @internal
     * @ignore(MutationObserver)
     * @return {Boolean} <code>true</code>, if MutationObserver is available.
     */
    getMutationObserver : function() {
      return typeof MutationObserver != "undefined";
    },


    /**
     * Checks if 'indexOf' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayIndexOf : function() {
      return !!Array.prototype.indexOf;
    },


    /**
     * Checks if 'lastIndexOf' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayLastIndexOf : function() {
      return !!Array.prototype.lastIndexOf;
    },


    /**
     * Checks if 'forEach' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayForEach : function() {
      return !!Array.prototype.forEach;
    },


    /**
     * Checks if 'filter' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayFilter : function() {
      return !!Array.prototype.filter;
    },


    /**
     * Checks if 'map' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayMap : function() {
      return !!Array.prototype.map;
    },


    /**
     * Checks if 'some' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArraySome : function() {
      return !!Array.prototype.some;
    },


    /**
     * Checks if 'find' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayFind : function() {
      return !!Array.prototype.find;
    },


    /**
     * Checks if 'findIndex' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayFindIndex : function() {
      return !!Array.prototype.findIndex;
    },


    /**
     * Checks if 'every' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayEvery : function() {
      return !!Array.prototype.every;
    },


    /**
     * Checks if 'reduce' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayReduce : function() {
      return !!Array.prototype.reduce;
    },


    /**
     * Checks if 'reduceRight' is supported on the Array object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getArrayReduceRight : function() {
      return !!Array.prototype.reduceRight;
    },


    /**
     * Checks if 'toString' is supported on the Error object and
     * its working as expected.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getErrorToString : function() {
      return typeof Error.prototype.toString == "function" &&
        Error.prototype.toString() !== "[object Error]";
    },


    /**
     * Checks if 'bind' is supported on the Function object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getFunctionBind : function() {
      return typeof Function.prototype.bind === "function";
    },

    /**
     * Checks if creating async functions are supported
     *
     * @lint ignoreDeprecated(alert, eval)
     *
     * @internal
     * @return {Boolean} <code>true</code>, if async functions are supported
     */
    getAsyncFunction : function() {
      var f;
      try { eval("f = async function(){};") } catch(e) { return false; };
      return qx.Bootstrap.getClass(f) === "AsyncFunction";
    },

    /**
     * Checks if 'keys' is supported on the Object object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getObjectKeys : function() {
      return !!Object.keys;
    },


    /**
     * Checks if 'now' is supported on the Date object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getDateNow : function() {
      return !!Date.now;
    },


    /**
     * Checks if 'parse' is supported on the Date object and whether it
     * supports ISO-8601 parsing. Additionally it checks if 'parse' takes
     * ISO-8601 date strings without timezone specifier and treats them as
     * local (as per specification)
     * @internal
     * @return {Boolean} <code>true</code>, if the method supports ISO-8601
     *   dates.
     */
    getDateParse : function ()
    {
      return typeof Date.parse === "function"     // Date.parse() is present...
         && (Date.parse("2001-02-03T04:05:06.007") != // ...and it treats local
             Date.parse("2001-02-03T04:05:06.007Z")); // dates as expected
    },


    /**
     * Checks if 'startsWith' is supported on the String object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getStringStartsWith : function() {
      return typeof String.prototype.startsWith === "function";
    },


    /**
     * Checks if 'endsWith' is supported on the String object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getStringEndsWith : function() {
      return typeof String.prototype.endsWith === "function";
    },


    /**
     * Checks if 'trim' is supported on the String object.
     * @internal
     * @return {Boolean} <code>true</code>, if the method is available.
     */
    getStringTrim : function() {
      return typeof String.prototype.trim === "function";
    },
    
    
    /**
     * Checks whether Native promises are available
     */
    getPromiseNative: function() {
      return typeof window.Promise !== "undefined" && window.Promise.toString().indexOf("[native code]") !== -1;
    }
  },


  defer : function(statics) {
    // array polyfill
    qx.core.Environment.add("ecmascript.array.indexof", statics.getArrayIndexOf);
    qx.core.Environment.add("ecmascript.array.lastindexof", statics.getArrayLastIndexOf);
    qx.core.Environment.add("ecmascript.array.foreach", statics.getArrayForEach);
    qx.core.Environment.add("ecmascript.array.filter", statics.getArrayFilter);
    qx.core.Environment.add("ecmascript.array.map", statics.getArrayMap);
    qx.core.Environment.add("ecmascript.array.some", statics.getArraySome);
    qx.core.Environment.add("ecmascript.array.find", statics.getArrayFind);
    qx.core.Environment.add("ecmascript.array.findIndex", statics.getArrayFindIndex);
    qx.core.Environment.add("ecmascript.array.every", statics.getArrayEvery);
    qx.core.Environment.add("ecmascript.array.reduce", statics.getArrayReduce);
    qx.core.Environment.add("ecmascript.array.reduceright", statics.getArrayReduceRight);

    // date polyfill
    qx.core.Environment.add("ecmascript.date.now", statics.getDateNow);
    qx.core.Environment.add("ecmascript.date.parse", statics.getDateParse);

    // error bugfix
    qx.core.Environment.add("ecmascript.error.toString", statics.getErrorToString);
    qx.core.Environment.add("ecmascript.error.stacktrace", statics.getStackTrace);

    // function polyfill
    qx.core.Environment.add("ecmascript.function.bind", statics.getFunctionBind);

    // object polyfill
    qx.core.Environment.add("ecmascript.object.keys", statics.getObjectKeys);

    // string polyfill
    qx.core.Environment.add("ecmascript.string.startsWith", statics.getStringStartsWith);
    qx.core.Environment.add("ecmascript.string.endsWith", statics.getStringEndsWith);
    qx.core.Environment.add("ecmascript.string.trim", statics.getStringTrim);

    // ES7 async function support
    qx.core.Environment.add("ecmascript.function.async", statics.getAsyncFunction);

    // MutationObserver
    qx.core.Environment.add("ecmascript.mutationobserver", statics.getMutationObserver);

    // Promises
    qx.core.Environment.add("ecmascript.promise.native", statics.getPromiseNative);
  }
});
