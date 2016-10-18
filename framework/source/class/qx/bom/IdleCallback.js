/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 GONICUS GmbH, Germany, http://www.gonicus.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Cajus Pollmeier (cajus)

************************************************************************ */

/**
 * This is a cross browser wrapper for requestIdleCallback. For further
 * information about the feature, take a look at spec:
 * https://www.w3.org/TR/requestidlecallback/
 *
 * Here is a sample usage:
 * <pre class='javascript'>var clb = function(deadline) {
 *   while (deadline.timeRemaining() > 0) {
 *     // ... do some last tasks
 *   }
 * };
 *
 * qx.bom.IdleCallback.request(clb, this);
 * </pre>
 */
qx.Bootstrap.define("qx.bom.IdleCallback",
{
  extend : qx.core.Object,

  statics :
  {
    /**
     * The default time in ms the timeout fallback implementation uses.
     */
    TIMEOUT : 0,

    /**
     * The default remaining time in ms the timeout fallback implementation uses.
     */
    REMAINING : 250,

    /**
     * Request for an IDLE callback. If the native <code>requestIdleCallback</code>
     * method is supported, it will be used. Otherwise, we use timeouts with a
     * 30ms delay. The HighResolutionTime will be used if supported but the time given
     * to the callback will still be a timestamp starting at 1 January 1970 00:00:00 UTC.
     *
     * @param callback {Function} The callback function which will get a deadline
     *   object. It contains a <code>timeRemaining()</code> call which returns the
     *   remaining milliseconds and the <code>didTimeout</code> flag which indicates
     *   whether the callback was fired due to a timeout. The latter is always false
     *   in case of the emulation.
     * @param context {var} The context of the callback.
     * @param timeout {Number} Timeout in milliseconds.
     * @return {Number} The id of the request.
     */
    request : function(callback, context, timeout) {
      var req = qx.core.Environment.get("client.idle");

      var clb = function(deadline) {
        return callback.call(context, deadline);
      };

      if (req) {
        return window.requestIdleCallback(clb, timeout);
      }
      else {

        var deadline = {
          started : +(new Date()),

          timeRemaining : function() {
            var now = +new Date();
            return Math.max(qx.bom.IdleCallback.REMAINING - (now - this.started), 0);
          },

          didTimeout : false
        };

        // make sure to use an indirection because setTimeout passes a
        // number as first argument as well
        return window.setTimeout(function() {
          clb(deadline);
        }, qx.bom.IdleCallback.TIMEOUT);
      }
    }
  }
});
