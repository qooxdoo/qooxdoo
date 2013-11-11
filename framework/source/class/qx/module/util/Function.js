/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */
/**
 * Utility module to give some support to work with functions.
 */
qx.Bootstrap.define("qx.module.util.Function", {

  statics :
  {
    /**
     * Returns a functions which execution is deferred with the specified delay.
     * Whenever this returned function is called during the delay, the delay is
     * started again.
     * This mechanism is very useful for event handling whenever only after a specified
     * timeout the event should be handled (e.g. at keyboard input by the user).
     *
     * @attachStatic{qxWeb, function.defer}
     * @param callback {Function} the callback which should be executed after the given delay
     * if the wrapper method is *not* called during this delay.
     * @param delay {Number} Delay in milliseconds
     * @return {Function} a wrapper function which <em>shields</em> the given callback function
     */
    defer : function(callback, delay)
    {
      var wrapperFunction = function()
      {
        // it's necessary to store the context to be able to call
        // the callback within the right scope
        var context = this;

        // arguments.callee is the wrapper function itself
        // use this function object to store the 'intervalId' and the 'fired' state
        var id = arguments.callee.intervalId;
        if (typeof id === "undefined" || id === null)
        {
          // setup the interval for the first run
          var intervalId = window.setInterval((function() {

            // if the 'wrapperFunction' was *not* called during the last
            // interval when can call the provided callback and clear the interval
            if (!this.fired)
            {
              window.clearInterval(this.intervalId);
              this.intervalId = null;
              callback.bind(context)();
            }
            this.fired = false;
          }).bind(arguments.callee), delay);

          arguments.callee.intervalId = intervalId;
        }

        // This prevents the logic to clear the interval
        arguments.callee.fired = true;
      };

      return wrapperFunction;
    }
  },

  defer : function(statics) {
    qxWeb.$attachStatic({
      "function" : {
        defer : statics.defer
      }
    });
  }
});