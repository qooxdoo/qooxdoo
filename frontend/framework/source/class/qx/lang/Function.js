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

************************************************************************ */

/**
 * Collection of helper methods operating on functions.
 */
qx.Class.define("qx.lang.Function",
{
  statics :
  {
    /**
     * TODOC
     *
     * @type static
     * @param data {var} TODOC
     * @return {void}
     */
    globalEval : function(data)
    {
      if (window.execScript) {
        window.execScript(data);
      } else {
        eval.call(window, data);
      }
    },


    /**
     * Simply return true.
     *
     * @type static
     * @return {Boolean} Always returns true.
     */
    returnTrue : function() {
      return true;
    },


    /**
     * Simply return false.
     *
     * @type static
     * @return {Boolean} Always returns false.
     */
    returnFalse : function() {
      return false;
    },


    /**
     * Simply return null.
     *
     * @type static
     * @return {var} Always returns null.
     */
    returnNull : function() {
      return null;
    },


    /**
     * Return "this".
     *
     * @type static
     * @return {Object} Always returns "this".
     */
    returnThis : function() {
      return this;
    },


    /**
     * Used to return a refernce to an singleton. Classes which should act as singletons can use this
     * function to implement the "getInstance" methods.
     *
     * @type static
     * @return {Object} TODOC
     */
    returnInstance : function()
    {
      if (!this._instance) {
        this._instance = new this;
      }

      /*
      if (this._instance.debug) {
        this._instance.debug("Created...");
      } */

      return this._instance;
    },


    /**
     * Simply return 0.
     *
     * @type static
     * @return {Number} Always returns 0.
     */
    returnZero : function() {
      return 0;
    },


    /**
     * Simply return a negative index (-1).
     *
     * @type static
     * @return {Number} Always returns -1.
     */
    returnNegativeIndex : function() {
      return -1;
    },


    /**
     * Bind a function to an object. Each time the bound method is called the
     * 'this' variable is guaranteed to be 'self'.
     *
     * @param fcn {Function} function to bind
     * @param self {Object} object, which shuold act as the 'this' variable inside the bound function
     * @param varargs {arguments} multiple arguments which should be static arguments for the given function
     * @return {Function} the bound function
     */
    bind: function(fcn, self, varargs)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (typeof fcn !== "function") {
          throw new Error("First parameter to bind() needs to be of type function!");
        }

        if (typeof self !== "object") {
          throw new Error("Second parameter to bind() needs to be of type object!");
        }
      }

      // Create wrapper method
      if (arguments.length > 2)
      {
        // Static arguments
        var args = Array.prototype.slice.call(arguments, 2);

        var wrap = function()
        {
          fcn.context = self;
          var ret = fcn.apply(self, args.concat(qx.lang.Array.fromArguments(arguments)));
          fcn.context = null;
          return ret;
        }
      }
      else
      {
        var wrap = function()
        {
          fcn.context = self;
          var ret = fcn.apply(self, arguments);
          fcn.context = null;
          return ret;
        }
      }

      // Correcting self
      wrap.self = fcn.self ? fcn.self.constructor : self;

      // Return wrapper method
      return wrap;
    },


    /**
     * Bind a function which works as an event listener to an object. Each time
     * the bound method is called the 'this' variable is guaranteed to be 'self'.
     *
     * @param fcn {Function} function to bind
     * @param self {Object} object, which shuold act as the 'this' variable inside the bound function
     * @return {Function} the bound function
     */
    bindEvent: function(fcn, self)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (typeof fcn !== "function") {
          throw new Error("First parameter to bindEvent() needs to be of type function!");
        }

        if (typeof self !== "object") {
          throw new Error("Second parameter to bindEvent() needs to be of type object!");
        }
      }

      // Create wrapper method
      var wrap = function(event)
      {
        fcn.context = self;
        var ret = fcn.call(self, event||window.event);
        fcn.context = null;
        return ret;
      }

      // Correcting self
      wrap.self = fcn.self ? fcn.self.constructor : self;

      // Return wrapper method
      return wrap;
    },


    /**
     * Extract the caller of a function from the arguments variable.
     * This will not work in Opera.
     *
     * @param args {arguments} The local arguments variable
     * @return {Function|undefined} A reference to the calling function or "undefined" if caller is not supported.
     */
    getCaller: function(args) {
      return args.caller ? args.caller.callee : args.callee.caller;
    }
  }
});
