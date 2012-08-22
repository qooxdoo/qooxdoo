/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
 * <pre class='javascript'>var start = +(new Date());
 * var clb = function(time) {
 *   if (time >= start + duration) {
 *     // ... do some last tasks
 *   } else {
 *     var timePassed = time - start;
 *     // ... calculate the current step and apply it
 *     qx.bom.AnimationFrame.request(clb, this);
 *   }
 * };
 * qx.bom.AnimationFrame.request(clb, this);
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
 * frame.start(duration);
 * </pre>
 */
qx.Bootstrap.define("qx.bom.AnimationFrame", 
{
  extend : qx.event.Emitter,

  events : {
    /** Fired as soon as the animation has ended. */
    "end" : undefined,
    /** Fired on every frame having the passed time as value. */
    "frame" : "Number"
  },

  members : {
    /**
     * Method used to start a series of animation frames. The series will end as
     * soon as the given duration is over.
     *
     * @param duration {Number} The duration the sequence should take.
     */
    startSequence : function(duration) {
      var start = +(new Date());
      var clb = function(time) {
        // final call
        if (time >= start + duration) {
          this.emit("end");
          this.id = null;
        } else {
          var timePassed = time - start;
          this.emit("frame", timePassed);
          this.id = qx.bom.AnimationFrame.request(clb, this);
        }
      }

      this.id = qx.bom.AnimationFrame.request(clb, this);
    }
  },

  statics :
  {
    /**
     * The default time in ms the timeout fallback implementation uses.
     */
    TIMEOUT : 30,

    /**
     * Request for an animation frame. If the native <code>requestAnimationFrame</code>
     * method is supported, it will be used. Otherwise, we use timeouts with a
     * 30ms delay.
     * @param callback {Function} The callback function which will get the current
     *   time as argument.
     * @param context {var} The context of the callback.
     * @return {Number} The id of the request.
     */
    request : function(callback, context) {
      var req = qx.core.Environment.get("css.animation.requestframe");

      var clb = function(time) {
        time = time || +(new Date());
        callback.call(context, time);
      };
      if (req) {
        return window[req](clb);
      } else {
        return window.setTimeout(clb, qx.bom.AnimationFrame.TIMEOUT);
      }
    }
  }
});