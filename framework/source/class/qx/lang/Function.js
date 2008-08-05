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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

   ======================================================================

   This class contains code based on the following work:

   * Mootools
     http://mootools.net/
     Version 1.1.1

     Copyright:
       (c) 2007 Valerio Proietti

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/* ************************************************************************

#require(qx.lang.Array)

************************************************************************ */

/**
 * Collection of helper methods operating on functions.
 */
qx.Bootstrap.define("qx.lang.Function",
{
  statics :
  {
    /**
     * Extract the caller of a function from the arguments variable.
     * This will not work in Opera.
     *
     * @param args {arguments} The local arguments variable
     * @return {Function | undefined} A reference to the calling function or "undefined" if caller is not supported.
     */
    getCaller : function(args) {
      return args.caller ? args.caller.callee : args.callee.caller;
    },


    /**
     * Try to get a sensible textual description of a function object.
     * This may be the class/mixin and method name of a function
     * or at least the signature of the function.
     *
     * @param fcn {Function} function the get the name for.
     * @return {String} Name of the function.
     */
    getName : function(fcn)
    {
      if (fcn.$$original) {
        return fcn.classname + ":constructor wrapper";
      }

      if (fcn.wrapper) {
        return fcn.wrapper.classname + ":constructor";
      }

      if (fcn.classname) {
        return fcn.classname + ":constructor";
      }

      if (fcn.mixin)
      {
        //members
        for(var key in fcn.mixin.$$members)
        {
          if (fcn.mixin.$$members[key] == fcn) {
            return fcn.mixin.name + ":" + key;
          }
        }

        // statics
        for(var key in fcn.mixin)
        {
          if (fcn.mixin[key] == fcn) {
            return fcn.mixin.name + ":" + key;
          }
        }
      }

      if (fcn.self)
      {
        var clazz = fcn.self.constructor;
        if (clazz)
        {
          // members
          for(var key in clazz.prototype)
          {
            if (clazz.prototype[key] == fcn) {
              return clazz.classname + ":" + key;
            }
          }
          // statics
          for(var key in clazz)
          {
            if (clazz[key] == fcn) {
              return clazz.classname + ":" + key;
            }
          }
        }
      }

      var fcnReResult = fcn.toString().match(/(function\s*\w*\(.*?\))/);
      if (fcnReResult && fcnReResult.length >= 1 && fcnReResult[1]) {
        return fcnReResult[1];
      }
      var fcnReResult = fcn.toString().match(/(function\s*\(.*?\))/);
      if (fcnReResult && fcnReResult.length >= 1 && fcnReResult[1]) {
        return "anonymous: " + fcnReResult[1];
      }

      return 'anonymous';
    },


    /**
     * Evaluates JavaScript code globally
     *
     * @param data {String} JavaScript commands
     * @return {var} Result of the execution
     */
    globalEval : function(data)
    {
      if (window.execScript) {
        return window.execScript(data);
      } else {
        return eval.call(window, data);
      }
    },


    /**
     * Simply return true.
     *
     * @return {Boolean} Always returns true.
     */
    returnTrue : function() {
      return true;
    },


    /**
     * Simply return false.
     *
     * @return {Boolean} Always returns false.
     */
    returnFalse : function() {
      return false;
    },


    /**
     * Simply return null.
     *
     * @return {var} Always returns null.
     */
    returnNull : function() {
      return null;
    },


    /**
     * Return "this".
     *
     * @return {Object} Always returns "this".
     */
    returnThis : function() {
      return this;
    },


    /**
     * Simply return 0.
     *
     * @return {Number} Always returns 0.
     */
    returnZero : function() {
      return 0;
    },


    /**
     * Base function for creating functional closures which is used by most other methods here.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var createdFunction = qx.lang.Function.create(myFunction, [options]);</pre>
     *
     * @param func {Function} Original function to wrap
     * @param options? {Map} Map of options
     * <ul>
     * <li><strong>self</strong>: The object that the "this" of the function will refer to. Default is the same as the wrapper function is called.</li>
     * <li><strong>args</strong>: An array of arguments that will be passed as arguments to the function when called.
     *     Default is no custom arguments; the function will receive the standard arguments when called.</li>
     * <li><strong>delay</strong>: If set, the returned function will delay the actual execution by this amount of milliseconds and return a timer handle when called.
     *     Default is no delay.</li>
     * <li><strong>periodical</strong>: If set the returned function will periodically perform the actual execution with this specified interval
     *      and return a timer handle when called. Default is no periodical execution.</li>
     * <li><strong>attempt</strong>: If set to true, the returned function will try to execute and return either the results or false on error. Default is false.</li>
     * </ul>
     *
     * @return {Function} Wrapped function
     */
    create : function(func, options)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.core.Assert.assertFunction(func, "Invalid parameter 'func'.");
      }

      // Nothing to be done when there are no options.
      if (!options) {
        return func;
      }

      // Check for at least one attribute.
      if (!(options.self || options.args || options.delay != null || options.periodical != null || options.attempt)) {
        return func;
      }

      return function(event)
      {
        // Convert (and copy) incoming arguments
        var args = qx.lang.Array.fromArguments(arguments);

        // Prepand static arguments
        if (options.args) {
          args = options.args.concat(args);
        }

        if (options.delay || options.periodical)
        {
          var returns = function() {
            return func.apply(options.self||this, args);
          };

          if (options.delay) {
            return setTimeout(returns, options.delay);
          }

          if (options.periodical) {
            return setInterval(returns, options.periodical);
          }
        }
        else if (options.attempt)
        {
          var ret = false;

          try {
            ret = func.apply(options.self||this, args);
          } catch(ex) {}

          return ret;
        }
        else
        {
          return func.apply(options.self||this, args);
        }
      };
    },


    /**
     * Returns a function whose "this" is altered.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.lang.Function.self(myFunction, [self, [varargs...]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * function myFunction()
     * {
     *   this.setStyle('color', 'red');
     *   // note that 'this' here refers to myFunction, not an element
     *   // we'll need to bind this function to the element we want to alter
     * };
     *
     * var myBoundFunction = qx.lang.Function.bind(myFunction, myElement);
     * myBoundFunction(); // this will make the element myElement red.
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {var} The binded function.
     */
    bind : function(func, self, varargs)
    {
      return this.create(func,
      {
        self  : self,
        args  : varargs !== undefined ? qx.lang.Array.fromArguments(arguments, 2) : null
      });
    },


    /**
     * Returns a function whose arguments are pre-configured.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.lang.Function.curry(myFunction, [varargs...]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * function myFunction(elem) {
     *   elem.setStyle('color', 'red');
     * };
     *
     * var myBoundFunction = qx.lang.Function.curry(myFunction, myElement);
     * myBoundFunction(); // this will make the element myElement red.
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param varargs {arguments} The arguments to pass to the function.
     * @return {var} The pre-configured function.
     */
    curry : function(func, varargs)
    {
      return this.create(func, {
        args  : varargs !== undefined ? qx.lang.Array.fromArguments(arguments, 1) : null
      });
    },


    /**
     * Returns a function which could be used as a listener for a native event callback.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.lang.Function.listener(myFunction, [self, [varargs...]]);</pre>
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {var} The binded function.
     */
    listener : function(func, self, varargs)
    {
      if (varargs === undefined)
      {
        return function(event)
        {
          // Directly execute, but force first parameter to be the event object.
          return func.call(self||this, event||window.event);
        }
      }
      else
      {
        var optargs = qx.lang.Array.fromArguments(arguments, 2);

        return function(event)
        {
          var args = [event||window.event];

          // Append static arguments
          args.push.apply(args, optargs);

          // Finally execute original method
          func.apply(self||this, args);
        };
      }
    },


    /**
     * Tries to execute the function.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var result = qx.lang.Function.attempt(myFunction, [self, [varargs...]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * var myObject = {
     *   'cow': 'moo!'
     * };
     *
     * var myFunction = function()
     * {
     *   for(var i = 0; i < arguments.length; i++) {
     *     if(!this[arguments[i]]) throw('doh!');
     *   }
     * };
     *
     * var result = qx.lang.Function.attempt(myFunction, myObject, 'pig', 'cow'); // false
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Boolean|var} <code>false</code> if an exception is thrown, else the function's return.
     */
    attempt : function(func, self, varargs)
    {
      return this.create(func,
      {
        self    : self,
        attempt : true,
        args    : varargs !== undefined ? qx.lang.Array.fromArguments(arguments, 2) : null
      })();
    },


    /**
     * Delays the execution of a function by a specified duration.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var timeoutID = qx.lang.Function.delay(myFunction, [delay, [self, [varargs...]]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * var myFunction = function(){ alert('moo! Element id is: ' + this.id); };
     * //wait 50 milliseconds, then call myFunction and bind myElement to it
     * qx.lang.Function.delay(myFunction, 50, myElement); // alerts: 'moo! Element id is: ... '
     *
     * // An anonymous function, example
     * qx.lang.Function.delay(function(){ alert('one second later...'); }, 1000); //wait a second and alert
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param delay {Integer} The duration to wait (in milliseconds).
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Integer} The JavaScript Timeout ID (useful for clearing delays).
     */
    delay : function(func, delay, self, varargs)
    {
      return this.create(func,
      {
        delay : delay,
        self  : self,
        args  : varargs !== undefined ? qx.lang.Array.fromArguments(arguments, 3) : null
      })();
    },


    /**
     * Executes a function in the specified intervals of time
     *
     * *Syntax*
     *
     * <pre class='javascript'>var intervalID = qx.lang.Function.periodical(myFunction, [period, [self, [varargs...]]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * var Site = { counter: 0 };
     * var addCount = function(){ this.counter++; };
     * qx.lang.Function.periodical(addCount, 1000, Site); // will add the number of seconds at the Site
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param interval {Integer} The duration of the intervals between executions.
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Integer} The Interval ID (useful for clearing a periodical).
     */
    periodical : function(func, interval, self, varargs)
    {
      return this.create(func,
      {
        periodical : interval,
        self       : self,
        args       : varargs !== undefined ? qx.lang.Array.fromArguments(arguments, 3) : null
      })();
    }
  }
});
