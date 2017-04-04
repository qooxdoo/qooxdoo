/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * This is a cross browser wrapper for requestAnimationFrame. For further
 * information about the feature, take a look at spec:
 * http://www.w3.org/TR/animation-timing/
 *
 * This class offers two ways of using this feature. First, the plain
 * API the spec describes.
 *
 * Here is a sample usage:
 * <pre class='javascript'>var start = Date.now();
 * var cb = function(time) {
 *   if (time >= start + duration) {
 *     // ... do some last tasks
 *   } else {
 *     var timePassed = time - start;
 *     // ... calculate the current step and apply it
 *     qx.bom.AnimationFrame.request(cb, this);
 *   }
 * };
 * qx.bom.AnimationFrame.request(cb, this);
 * </pre>
 *
 * Another way of using it is to use it as an instance emitting events.
 *
 * Here is a sample usage of that API:
 * <pre class='javascript'>var frame = new qx.bom.AnimationFrame();
 * frame.on("end", function() {
 *   // ... do some last tasks
 * }, this);
 * frame.on("frame", function(timePassed) {
 *   // ... calculate the current step and apply it
 * }, this);
 * frame.startSequence(duration);
 * </pre>
 *
 * @require(qx.lang.normalize.Date)
 */
qx.Bootstrap.define("qx.bom.AnimationFrame",
{
  extend : qx.event.Emitter,

  events : {
    /** Fired as soon as the animation has ended. */
    "end" : undefined,

    /**
     * Fired on every frame having the passed time as value
     * (might be a float for higher precision).
     */
    "frame" : "Number"
  },

  members : {
    __canceled : false,

    /**
     * Method used to start a series of animation frames. The series will end as
     * soon as the given duration is over.
     *
     * @param duration {Number} The duration the sequence should take.
     *
     * @ignore(performance.*)
     */
    startSequence : function(duration) {
      this.__canceled = false;

      var start = (window.performance && performance.now) ? (performance.now() + qx.bom.AnimationFrame.__start) : Date.now();
      var cb = function(time) {
        if (this.__canceled) {
          this.id = null;
          return;
        }

        // final call
        if (time >= start + duration) {
          this.emit("end");
          this.id = null;
        } else {
          var timePassed = Math.max(time - start, 0);
          this.emit("frame", timePassed);
          this.id = qx.bom.AnimationFrame.request(cb, this);
        }
      };

      this.id = qx.bom.AnimationFrame.request(cb, this);
    },


    /**
     * Cancels a started sequence of frames. It will do nothing if no
     * sequence is running.
     */
    cancelSequence : function() {
      this.__canceled = true;
    }
  },

  statics :
  {
    /**
     * The default time in ms the timeout fallback implementation uses.
     */
    TIMEOUT : 30,


    /**
     * Calculation of the predefined timing functions. Approximation of the real
     * bezier curves has been used for easier calculation. This is good and close
     * enough for the predefined functions like <code>ease</code> or
     * <code>linear</code>.
     *
     * @param func {String} The defined timing function. One of the following values:
     *   <code>"ease-in"</code>, <code>"ease-out"</code>, <code>"linear"</code>,
     *   <code>"ease-in-out"</code>, <code>"ease"</code>.
     * @param x {Integer} The percent value of the function.
     * @return {Integer} The calculated value
     */
    calculateTiming : function(func, x) {
      if (func == "ease-in") {
        var a = [3.1223e-7, 0.0757, 1.2646, -0.167, -0.4387, 0.2654];
      } else if (func == "ease-out") {
        var a = [-7.0198e-8, 1.652, -0.551, -0.0458, 0.1255, -0.1807];
      } else if (func == "linear") {
        return x;
      } else if (func == "ease-in-out") {
        var a = [2.482e-7, -0.2289, 3.3466, -1.0857, -1.7354, 0.7034];
      } else {
        // default is 'ease'
        var a = [-0.0021, 0.2472, 9.8054, -21.6869, 17.7611, -5.1226];
      }

      // A 6th grade polynomial has been used as approximation of the original
      // bezier curves  described in the transition spec
      // http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
      // (the same is used for animations as well)
      var y = 0;
      for (var i=0; i < a.length; i++) {
        y += a[i] * Math.pow(x, i);
      };
      return y;
    },


    /**
     * Request for an animation frame. If the native <code>requestAnimationFrame</code>
     * method is supported, it will be used. Otherwise, we use timeouts with a
     * 30ms delay. The HighResolutionTime will be used if supported but the time given
     * to the callback will still be a timestamp starting at 1 January 1970 00:00:00 UTC.
     *
     * @param callback {Function} The callback function which will get the current
     *   time as argument (which could be a float for higher precision).
     * @param context {var} The context of the callback.
     * @return {Number} The id of the request.
     */
    request : function(callback, context) {
      var req = qx.core.Environment.get("css.animation.requestframe");

      var cb = function(time) {
        // check for high resolution time
        if (time < 1e10) {
          time = qx.bom.AnimationFrame.__start + time;
        }

        time = time || Date.now();
        callback.call(context, time);
      };
      if (req) {
        return window[req](cb);
      } else {
        // make sure to use an indirection because setTimeout passes a
        // number as first argument as well
        return window.setTimeout(function() {
          cb();
        }, qx.bom.AnimationFrame.TIMEOUT);
      }
    }
  },

  /**
   * @ignore(performance.timing.*)
   */
  defer : function(statics) {
    // check and use the high resolution start time if available
    statics.__start = window.performance && performance.timing && performance.timing.navigationStart;
    // if not, simply use the current time
    if (!statics.__start) {
      statics.__start = Date.now();
    }
  }
});
