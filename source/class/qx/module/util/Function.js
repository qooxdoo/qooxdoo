/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)
     * Tobias Oberrauch (toberrauch)

************************************************************************ */
/**
 * Utility module to give some support to work with functions.
 *
 * @group (Utilities)
 */
qx.Bootstrap.define("qx.module.util.Function", {

  statics: {
    /**
     * Returns a debounced version of the given callback. The execution of the callback
     * is delayed by the given delay and after no events were triggered anymore.
     * This mechanism is very useful for event handling: only after a specified delay
     * the event should be handled (e.g. at keyboard input by the user) to prevent flooding
     * the handler with a large amounts of events.
     *
     * @attachStatic{qxWeb, func.debounce}
     * @signature function (callback, delay, immediate)
     * @param callback {Function} the callback which should be executed after the given delay
     * if the wrapper method is *not* called during this delay.
     * @param delay {Number} Delay in milliseconds
     * @param immediate {Boolean?} whether to run the callback at the beginning and then debounce, default is <code>false</code>
     * @return {Function} a wrapper function which <em>shields</em> the given callback function
     */
    debounce: qx.util.Function.debounce,

    /**
     * Returns a throttled version of the given callback. The execution of the callback
     * is throttled which means it is only executed in the given interval.
     * This mechanism is very useful for event handling: only in specified intervals
     * the event should be handled (e.g. at resize of the browser window) to prevent flooding
     * the handler with a large amounts of events.
     * As default the <code>leading</code> and <code>trailing</code> calls are executed.
     *
     * @attachStatic{qxWeb, func.throttle}
     * @signature function (callback, interval, options)
     * @param callback {Function} the callback which should be executed in the given interval
     * @param interval {Number} Interval in milliseconds
     * @param options {Map} the keys are <code>leading</code> and <code>trailing</code> to control the
     * executing of the callback precisely. Default values are <code>true</code> for both options.
     * @return {Function} a wrapper function which <em>shields</em> the given callback function
     */
    throttle: qx.util.Function.throttle
  },

  defer: function (statics) {
    qxWeb.$attachAll(this, "func");
  }
});
