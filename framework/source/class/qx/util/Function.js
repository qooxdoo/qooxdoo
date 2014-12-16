/* ************************************************************************

  qooxdoo - the new era of web development

  http://qooxdoo.org

  Copyright:
    2012 - 2014 1&1 Internet AG, Germany, http://www.1und1.de

 License:
    LGPL: http://www.gnu.org/licenses/lgpl.html
    EPL: http://www.eclipse.org/org/documents/epl-v10.php
    See the LICENSE file in the project's top-level directory for details.

 Authors:
    * Alexander Steitz (aback)
    * Tobias Oberrauch (toberrauch)

 ======================================================================

 This class contains code based on the following work:

 * Underscore.js
    http://underscorejs.org
    Version 1.5.2

 Copyright:
    2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors

 License:
    MIT: http://www.opensource.org/licenses/mit-license.php

 ************************************************************************ */
/**
 * Utility module to give some support to work with functions.
 */
qx.Bootstrap.define("qx.util.Function", {

  statics: {
    /**
     * Returns a debounced version of the given callback. The execution of the callback
     * is delayed by the given delay and after no events were triggered anymore.
     * This mechanism is very useful for event handling: only after a specified delay
     * the event should be handled (e.g. at keyboard input by the user) to prevent flooding
     * the handler with a large amounts of events.
     *
     * @param callback {Function} the callback which should be executed after the given delay
     * if the wrapper method is *not* called during this delay.
     * @param delay {Number} Delay in milliseconds
     * @param immediate {Boolean?} whether to run the callback at the beginning and then debounce, default is <code>false</code>
     * @return {Function} a wrapper function which <em>shields</em> the given callback function
     */
    debounce: function (callback, delay, immediate) {
      var wrapperFunction = function () {
        arguments.callee.immediate = !!(immediate);

        // store the current arguments at the function object
        // to have access inside the interval method
        arguments.callee.args = qx.lang.Array.fromArguments(arguments);

        // it's necessary to store the context to be able to call
        // the callback within the right scope
        var context = this;

        // arguments.callee is the wrapper function itself
        // use this function object to store the 'intervalId' and the 'fired' state
        var id = arguments.callee.intervalId;
        if (typeof id === "undefined") {
          // setup the interval for the first run
          var intervalId = window.setInterval((function () {

            // if the 'wrapperFunction' was *not* called during the last
            // interval then can call the provided callback and clear the interval
            // except for 'immediate' mode
            if (!this.fired) {
              window.clearInterval(this.intervalId);
              delete this.intervalId;

              if (this.immediate === false) {
                callback.apply(context, this.args);
              }
            }
            this.fired = false;
          }).bind(arguments.callee), delay);

          arguments.callee.intervalId = intervalId;

          if (arguments.callee.immediate) {
            callback.apply(context, arguments.callee.args);
          }
        }

        // This prevents the logic to clear the interval
        arguments.callee.fired = true;
      };

      return wrapperFunction;
    },


    /**
     * Returns a throttled version of the given callback. The execution of the callback
     * is throttled which means it is only executed in the given interval.
     * This mechanism is very useful for event handling: only in specified intervals
     * the event should be handled (e.g. at resize of the browser window) to prevent flooding
     * the handler with a large amounts of events.
     * As default the <code>leading</code> and <code>trailing</code> calls are executed.
     *
     * @param callback {Function} the callback which should be executed in the given interval
     * @param interval {Number} Interval in milliseconds
     * @param options {Map} the keys are <code>leading</code> and <code>trailing</code> to control the
     * executing of the callback precisely. Default values are <code>true</code> for both options.
     * @return {Function} a wrapper function which <em>shields</em> the given callback function
     */
    throttle: function (callback, interval, options) {
      if (typeof options === "undefined") {
        options = {};
      }

      var context, args, result;
      var timeout = null;
      var previous = 0;

      var later = function () {
        previous = options.leading === false ? 0 : new Date();
        timeout = null;
        result = callback.apply(context, args);
      };

      return function () {
        var now = new Date();
        if (!previous && options.leading === false) {
          previous = now;
        }

        var remaining = interval - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          window.clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = callback.apply(context, args);
        } else if (!timeout && options.trailing !== false) {
          timeout = window.setTimeout(later, remaining);
        }
        return result;
      };
    }
  }
});
