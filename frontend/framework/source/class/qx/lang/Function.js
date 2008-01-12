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

#module(core)

************************************************************************ */

/**
 * Collection of helper methods operating on functions.
 */
qx.Bootstrap.define("qx.lang.Function",
{
  statics :
  {
    /**
     * Evaluates JavaScript code globally
     *
     * @type static
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
     * Simply return 0.
     *
     * @type static
     * @return {Number} Always returns 0.
     */
    returnZero : function() {
      return 0;
    },


    /**
     * Base function for creating functional closures which is used by all other Function prototypes.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var createdFunction = qx.lang.Function.create(myFunction, [options]);</pre>
     *
     * @type static
     * @param func {Function} Original function to wrap
     * @param options? {Map} Map of options
     * <ul>
     * <li><strong>bind</strong>: The object that the "this" of the function will refer to. Default is the current function.</li>
     * <li><strong>event</strong>: If set to true, the function will act as an event listener and receive an event as its first argument.
     *    If set to a class name, the function will receive a new instance of this class (with the event passed as argument's constructor) as first argument.</li>
     *    Default is false.
     * <li><strong>args</strong>: A single argument or array of arguments that will be passed as arguments to the function when called.
     *     If both the event and arguments options are set, the event is passed as first argument and the arguments array will follow.
     *     Default is no custom arguments; the function will receive the standard arguments when called.</li>
     * <li><strong>delay</strong>: if set, the returned function will delay the actual execution by this amount of milliseconds and return a timer handle when called.
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
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (typeof func !== "function")
        {
          qx.core.Log.trace();
          throw new Error("Could not bind non-function: " + func);
        }
      }

      var options = options || {};

      if (!options.bind) {
        options.bind = func;
      }

      return function(event)
      {
        // Convert incoming arguments
        var args = options.event ? [] : Array.prototype.slice.call(arguments, 0);

        // Prepand static arguments
        if (options.args) {
          args.unshift.apply(args, options.args);
        }

        // Prepand event object
        if (options.event) {
          args.unshift(event || window.event);
        }

        if (options.delay || options.periodical)
        {
          var returns = function()
          {
            func.context = options.bind;

            var ret = func.apply(options.bind, args);

            func.context = null;
            return ret;
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
          func.context = options.bind;

          try {
            ret = func.apply(options.bind, args);
          } catch(ex) {}

          func.context = null;
          return ret;
        }
        else
        {
          func.context = options.bind;

          var ret = func.apply(options.bind, args);

          func.context = null;
          return ret;
        }
      };
    },


    /**
     * Returns a closure with arguments and bind.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var newFunction = qx.lang.Function.pass(myFunction, [args[, bind]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * var myFunction = function()
     * {
     *   var result = 'Passed: ';
     *   for(var i = 0, l = arguments.length; i < l; i++){
     *     result += (arguments[i] + ' ');
     *   }
     *   return result;
     * }
     * var myHello = qx.lang.Function.pass(myFunction, 'hello');
     * var myItems = qx.lang.Function.pass(myFunction, ['peach', 'apple', 'orange']);
     *
     * //when ready I can execute the functions.
     * alert(myHello());
     * alert(myItems());
     * </pre>
     *
     * @type static
     * @param func {Function} Original function to wrap
     * @param args {Array ? []} The arguments to pass to the function (must be an array if passing more than one argument).
     * @param bind {Object ? null} The object that the "this" of the function will refer to.
     * @return {var} The function whose arguments are passed when called.
     */
    pass : function(func, args, bind)
    {
      return this.create(func,
      {
        args : args,
        bind : bind
      });
    },


    /**
     * Tries to execute the function.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var result = qx.lang.Function.attempt(myFunction, [args[, bind]]);</pre>
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
     * var result = qx.lang.Function.attempt(myFunction, ['pig', 'cow'], myObject); // false
     * </pre>
     *
     * @type static
     * @param func {Function} Original function to wrap
     * @param args {Array ? []} The arguments to pass to the function (must be an array if passing more than one argument).
     * @param bind {Object ? null} The object that the "this" of the function will refer to.
     * @return {Boolean|var} <code>false</code> if an exception is thrown, else the function's return.
     */
    attempt : function(func, args, bind)
    {
      return this.create(func,
      {
        args    : args,
        bind    : bind,
        attempt : true
      })();
    },


    /**
     * Returns a function whose "this" is altered.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.lang.Function.bind(myFunction, [bind[, args[, evt]]]);</pre>
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
     * @type static
     * @param func {Function} Original function to wrap
     * @param bind {Object ? null} The object that the "this" of the function will refer to.
     * @param evt {Boolean ? false} Used to signifiy that the function is an Event Listener. See <Function.create> Options section for more information.
     * @param args {Array ? []} The arguments to pass to the function (must be an array if passing more than one argument).
     * @return {var} The binded function.
     */
    bind : function(func, bind, evt, args)
    {
      return this.create(func,
      {
        bind  : bind,
        args  : args,
        event : evt
      });
    },


    /**
     * Delays the execution of a function by a specified duration.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var timeoutID = qx.lang.Function.delay(myFunction, [delay[, bind[, args]]]);</pre>
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
     * @type static
     * @param func {Function} Original function to wrap
     * @param delay {Integer} The duration to wait (in milliseconds).
     * @param bind {Object ? null} The object that the "this" of the function will refer to.
     * @param args {Array ? []} The arguments to pass to the function (must be an array if passing more than one argument).
     * @return {Integer} The JavaScript Timeout ID (useful for clearing delays).
     */
    delay : function(func, delay, bind, args)
    {
      return this.create(func,
      {
        delay : delay,
        bind  : bind,
        args  : args
      })();
    },


    /**
     * Executes a function in the specified intervals of time
     *
     * *Syntax*
     *
     * <pre class='javascript'>var intervalID = qx.lang.Function.periodical(myFunction, [period[, bind[, args]]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * var Site = { counter: 0 };
     * var addCount = function(){ this.counter++; };
     * qx.lang.Function.periodical(addCount, 1000, Site); // will add the number of seconds at the Site
     * </pre>
     *
     * @type static
     * @param func {Function} Original function to wrap
     * @param interval {Integer} The duration of the intervals between executions.
     * @param bind {Object ? null} The object that the "this" of the function will refer to.
     * @param args {Array ? []} The arguments to pass to the function (must be an array if passing more than one argument).
     * @return {Integer} The Interval ID (useful for clearing a periodical).
     */
    periodical : function(func, interval, bind, args)
    {
      return this.create(func,
      {
        periodical : interval,
        bind       : bind,
        args       : args
      })();
    },


    /**
     * Extract the caller of a function from the arguments variable.
     * This will not work in Opera.
     *
     * @type static
     * @param args {arguments} The local arguments variable
     * @return {Function | undefined} A reference to the calling function or "undefined" if caller is not supported.
     */
    getCaller : function(args) {
      return args.caller ? args.caller.callee : args.callee.caller;
    }
  }
});
