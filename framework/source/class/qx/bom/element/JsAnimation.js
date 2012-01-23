/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

qx.Bootstrap.define("qx.bom.element.JsAnimation", 
{
  statics :
  {
    __maxStepTime : 30,

    animate : function(el, desc) {
      // stop if an animation is already running
      if (el.$$animation) {
        return;
      }

      var duration = desc.duration;
      var keyFrames = desc.keyFrames;

      var keys = this.__getOrderedKeys(keyFrames);
      var stepTime = this.__getStepTime(duration, keys);
      var steps = parseInt(duration / stepTime, 10);

      var delta = this.__calculateDelta(steps, stepTime, keys, keyFrames, duration, desc.timing);
      if (desc.reverse) {
        delta.reverse();
      }

      var handle = new qx.bom.element.AnimationHandle();
      handle.desc = desc;
      handle.el = el;
      handle.delta = delta;
      handle.stepTime = stepTime;
      handle.steps = steps;
      el.$$animation = handle;

      handle.i = 0;
      handle.initValues = {};
      handle.repeatSteps = this.__applyRepeat(steps, desc.repeat);

      return this.play(handle);
    },


    __calculateDelta : function(steps, stepTime, keys, keyFrames, duration, timing) {
      var delta = new Array(steps);

      var keyIndex = 1;
      delta[0] = keyFrames[0];
      var last = keyFrames[0];
      var next = keyFrames[keys[keyIndex]];

      // for every step
      for (var i=1; i < delta.length; i++) {
        // switch key frames if we crossed a percent border
        if (i * stepTime / duration * 100 > keys[keyIndex]) {
          last = next;
          keyIndex++;
          next = keyFrames[keys[keyIndex]];
        }

        delta[i] = {};
        // for every property
        for (var name in next) {
          var nItem = next[name] + "";

          // color values
          if (nItem.charAt(0) == "#") {
            // get the two values from the frames as RGB arrays
            var value0 = qx.util.ColorUtil.cssStringToRgb(last[name]);
            var value1 = qx.util.ColorUtil.cssStringToRgb(nItem);
            var stepValue = [];
            // calculate every color chanel
            for (var j=0; j < value0.length; j++) {
              var range = value0[j] - value1[j];
              stepValue[j] = parseInt(value0[j] - range * this.__calculateTiming(timing, i / steps));
            };

            delta[i][name] = "#" + qx.util.ColorUtil.rgbToHexString(stepValue);

          } else {
            var unit = nItem.substring((parseInt(nItem, 10)+"").length, nItem.length)
            var range = parseFloat(nItem, 10) - parseFloat(last[name], 10);
            delta[i][name] = (parseFloat(last[name]) + range * this.__calculateTiming(timing, i / steps)) + unit;
          }

        };
      };
      // make sure the last key frame is right
      delta[delta.length -1] = keyFrames[100];
      return delta;
    },


    /**
     * @internal
     */
    play : function(handle) {
      var self = this;
      var id = window.setInterval(function() {
        handle.repeatSteps--;
        var values = handle.delta[handle.i % handle.steps];
        // save the init values
        if (handle.i == 0) {
          for (var name in values) {
            if (handle.initValues[name] == undefined) {
              handle.initValues[name] = handle.el.style[name];
            }
          }
        }
        self.__applyStyles(handle.el, values);

        handle.i++;
        // iteration condition
        if (handle.i % handle.steps == 0) {
          if (handle.desc.alternate) {
            handle.delta.reverse();
          }
        }
        // end condition
        if (handle.repeatSteps < 0) {
          self.stop(handle);
        }
      }, handle.stepTime);

      handle.animationId = id;

      return handle;
    },


    /**
     * @internal
     */
    pause : function(handle) {
      // stop the interval
      window.clearInterval(handle.animationId);
      handle.animationId = null;
    },



    /**
     * @internal
     */
    stop : function(handle) {
      var desc = handle.desc;
      var el = handle.el;
      var initValues = handle.initValues;
      window.clearInterval(handle.animationId);

      // if we should keep a frame
      if (desc.keep != undefined) {
        this.__applyStyles(el, desc.keyFrames[desc.keep]);
      } else {
        this.__applyStyles(el, initValues);
      }

      el.$$animation = null;
      handle.el = null;
      handle.ended = true;
      handle.animationId = null;

      var onEnd = handle.getOnEnd();
      for (var j=0; j < onEnd.length; j++) {
        onEnd[j].callback.call(onEnd[j].ctx, el);
      };
    },


    /**
     * Calculation of the predefined timing functions. Aproximitations of the real
     * bezier curves has ben used for easier calculation. This is good and close
     * enough for the predefined functions like <code>ease</code> or
     * <code>linear</code>.
     *
     * @param func {String} The defined timing function. One of the following values:
     *   <code>"ease-in"</code>, <code>"ease-out"</code>, <code>"linear"</code>,
     *   <code>"ease-in-out"</code>, <code>"ease"</code>.
     * @param x {Integer} The percent value of the function.
     */
    __calculateTiming : function(func, x) {
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

      // A 6th grade polynom has been used to approximation function
      // of the original bezier curves  described in the transition spec
      // http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
      // (the same is used for animations as well)
      var y = 0;
      for (var i=0; i < a.length; i++) {
        y += a[i] * Math.pow(x, i);
      };
      return y;
    },


    __applyRepeat : function(steps, repeat) {
      if (repeat == undefined) {
        return steps;
      }
      if (repeat == "infinite") {
        return Number.MAX_VALUE;
      }
      return steps * repeat;
    },


    __applyStyles : function(el, styles) {
      for (var name in styles) {
        el.style[name] = styles[name];
      }
    },


    __getStepTime : function(duration, keys) {
      // get min difference
      var minDiff = 100;
      for (var i=0; i < keys.length - 1; i++) {
        minDiff = Math.min(minDiff, keys[i+1] - keys[i])
      };

      var stepTime = duration * minDiff / 100;
      while (stepTime > this.__maxStepTime) {
        stepTime = stepTime / 2;
      }
      return Math.round(stepTime);
    },


    __getOrderedKeys : function(keyFrames) {
      var keys = qx.Bootstrap.getKeys(keyFrames);
      for (var i=0; i < keys.length; i++) {
        keys[i] = parseInt(keys[i], 10);
      };
      keys.sort(function(a,b) {return a>b;});
      return keys;
    }
  }
});