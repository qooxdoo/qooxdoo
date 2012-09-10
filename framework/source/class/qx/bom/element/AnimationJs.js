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
/* ************************************************************************

#ignore(qx.bom.element.Style)

************************************************************************ */

/**
 * This class offers the same API as the CSS3 animation layer in
 * {@link qx.bom.element.AnimationCss} but uses JavaScript to fake the behavior.
 *
 * {@link qx.bom.element.Animation} is the class, which takes care of the
 * feature detection for CSS animations and decides which implementation
 * (CSS or JavaScript) should be used. Most likely, this implementation should
 * be the one to use.
 */
qx.Bootstrap.define("qx.bom.element.AnimationJs",
{
  statics :
  {
    /**
     * The maximal time a frame should take.
     */
    __maxStepTime : 30,

    /**
     * The supported CSS units.
     */
    __units : ["%", "in", "cm", "mm", "em", "ex", "pt", "pc", "px"],


    /**
     * This is the main function to start the animation. For further details,
     * take a look at the documentation of the wrapper
     * {@link qx.bom.element.Animation}.
     * @param el {Element} The element to animate.
     * @param desc {Map} Animation description.
     * @param duration {Integer?} The duration of the animation which will
     *   override the duration given in the description.
     * @return {qx.bom.element.AnimationHandle} The handle.
     */
    animate : function(el, desc, duration) {
      return this._animate(el, desc, duration, false);
    },


    /**
     * This is the main function to start the animation in reversed mode.
     * For further details, take a look at the documentation of the wrapper
     * {@link qx.bom.element.Animation}.
     * @param el {Element} The element to animate.
     * @param desc {Map} Animation description.
     * @param duration {Integer?} The duration of the animation which will
     *   override the duration given in the description.
     * @return {qx.bom.element.AnimationHandle} The handle.
     */
    animateReverse : function(el, desc, duration) {
      return this._animate(el, desc, duration, true);
    },


    /**
     * Helper to start the animation, either in reversed order or not.
     *
     * @param el {Element} The element to animate.
     * @param desc {Map} Animation description.
     * @param duration {Integer?} The duration of the animation which will
     *   override the duration given in the description.
     * @param reverse {Boolean} <code>true</code>, if the animation should be
     *   reversed.
     * @return {qx.bom.element.AnimationHandle} The handle.
     */
    _animate : function(el, desc, duration, reverse) {
      // stop if an animation is already running
      if (el.$$animation) {
        return;
      }

      // @deprecated since 2.0
      if (desc.hasOwnProperty("reverse")) {
        reverse = desc.reverse;
        if (qx.core.Environment.get("qx.debug")) {
          qx.log.Logger.warn(
            "The key 'reverse' is deprecated: Please use the method " +
            "'animateReverse' instead."
          );
          qx.log.Logger.trace();
        }
      }

      if (duration == undefined) {
        duration = desc.duration;
      }

      var keyFrames = desc.keyFrames;

      var keys = this.__getOrderedKeys(keyFrames);
      var stepTime = this.__getStepTime(duration, keys);
      var steps = parseInt(duration / stepTime, 10);

      this.__normalizeKeyFrames(keyFrames, el);

      var delta = this.__calculateDelta(steps, stepTime, keys, keyFrames, duration, desc.timing);
      var handle = new qx.bom.element.AnimationHandle();

      if (reverse) {
        delta.reverse();
        handle.reverse = true;
      }

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


    /**
     * Try to normalize the keyFrames by adding the default / set values of the
     * element.
     * @param keyFrames {Map} The map of key frames.
     * @param el {Element} The element to animate.
     */
    __normalizeKeyFrames : function(keyFrames, el) {
      // collect all possible keys and its units
      var units = {};
      for (var percent in keyFrames) {
        for (var name in keyFrames[percent]) {
          if (units[name] == undefined) {
            var item = keyFrames[percent][name];
            if (typeof item == "string") {
              units[name] = item.substring((parseInt(item, 10)+"").length, item.length);
            } else {
              units[name] = "";
            }
          }
        };
      }
      // add all missing keys
      for (var percent in keyFrames) {
        var frame = keyFrames[percent];
        for (var name in units) {
          if (frame[name] == undefined) {
            // get the computed style if possible
            if (window.getComputedStyle) {
              frame[name] = getComputedStyle(el, null)[name];
            } else {
              frame[name] = el.style[name];
            }
            // if its a unit we know, set 0 as fallback
            if (frame[name] == "" && this.__units.indexOf(units[name]) != -1) {
              frame[name] = "0" + units[name];
            }
          }
        };
      };
    },


    /**
     * Precalculation of the delta which will be applied during the animation.
     * The whole deltas will be calculated prior to the animation and stored
     * in a single array. This method takes care of that calculation.
     *
     * @param steps {Integer} The amount of steps to take to the end of the
     *   animation.
     * @param stepTime {Integer} The amount of milliseconds each step takes.
     * @param keys {Array} Ordered list of keys in the key frames map.
     * @param keyFrames {Map} The map of key frames.
     * @param duration {Integer} Time in milliseconds the animation should take.
     * @param timing {String} The given timing function.
     * @return {Array} An array containing the animation deltas.
     */
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
              stepValue[j] = parseInt(value0[j] - range * this.__calculateTiming(timing, i / steps), 10);
            };

            delta[i][name] = qx.util.ColorUtil.rgbToHexString(stepValue);

          } else if (!isNaN(parseInt(nItem, 10))) {
            var unit = nItem.substring((parseInt(nItem, 10)+"").length, nItem.length);
            var range = parseFloat(nItem) - parseFloat(last[name]);
            delta[i][name] = (parseFloat(last[name]) + range * this.__calculateTiming(timing, i / steps)) + unit;
          } else {
            delta[i][name] = last[name] + "";
          }

        };
      };
      // make sure the last key frame is right
      delta[delta.length -1] = keyFrames[100];
      return delta;
    },


    /**
     * Internal helper for the {@link qx.bom.element.AnimationHandle} to play
     * the animation.
     * @internal
     * @param handle {qx.bom.element.AnimationHandle} The hand which
     *   represents the animation.
     * @return {qx.bom.element.AnimationHandle} The handle for chaining.
     */
    play : function(handle) {
      var id = window.setInterval(function() {
        handle.repeatSteps--;
        var values = handle.delta[handle.i % handle.steps];
        // save the init values
        if (handle.i == 0) {
          for (var name in values) {
            if (handle.initValues[name] == undefined) {
              if (qx.bom.element.Style) {
                handle.initValues[name] = qx.bom.element.Style.get(
                  handle.el, qx.lang.String.camelCase(name)
                );
              } else {
                handle.initValues[name] = handle.el.style[qx.lang.String.camelCase(name)];
              }
            }
          }
        }
        qx.bom.element.AnimationJs.__applyStyles(handle.el, values);

        handle.i++;
        // iteration condition
        if (handle.i % handle.steps == 0) {
          if (handle.desc.alternate) {
            handle.delta.reverse();
          }
        }
        // end condition
        if (handle.repeatSteps < 0) {
          qx.bom.element.AnimationJs.stop(handle);
        }
      }, handle.stepTime);

      handle.animationId = id;

      return handle;
    },


    /**
     * Internal helper for the {@link qx.bom.element.AnimationHandle} to pause
     * the animation.
     * @internal
     * @param handle {qx.bom.element.AnimationHandle} The hand which
     *   represents the animation.
     * @return {qx.bom.element.AnimationHandle} The handle for chaining.
     */

    pause : function(handle) {
      // stop the interval
      window.clearInterval(handle.animationId);
      handle.animationId = null;
    },


    /**
     * Internal helper for the {@link qx.bom.element.AnimationHandle} to stop
     * the animation.
     * @internal
     * @param handle {qx.bom.element.AnimationHandle} The hand which
     *   represents the animation.
     * @return {qx.bom.element.AnimationHandle} The handle for chaining.
     */
    stop : function(handle) {
      var desc = handle.desc;
      var el = handle.el;
      var initValues = handle.initValues;
      if (handle.animationId) {
        window.clearInterval(handle.animationId);
      }

      // check if animation is already stopped
      if (el == undefined) {
        return;
      }

      // if we should keep a frame
      var keep = desc.keep;
      if (keep != undefined) {
        if (handle.reverse || (desc.alternate && desc.repeat && desc.repeat % 2 == 0)) {
          keep = 100 - keep;
        }
        this.__applyStyles(el, desc.keyFrames[keep]);
      } else {
        this.__applyStyles(el, initValues);
      }

      el.$$animation = null;
      handle.el = null;
      handle.ended = true;
      handle.animationId = null;

      handle.emit("end", el);
    },


    /**
     * Calculation of the predefined timing functions. Approximations of the real
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


    /**
     * Takes care of the repeat key of the description.
     * @param steps {Integer} The number of steps one iteration would take.
     * @param repeat {Integer|String} It can be either a number how often the
     * animation should be repeated or the string 'infinite'.
     * @return {Integer} The number of steps to animate.
     */
    __applyRepeat : function(steps, repeat) {
      if (repeat == undefined) {
        return steps;
      }
      if (repeat == "infinite") {
        return Number.MAX_VALUE;
      }
      return steps * repeat;
    },


    /**
     * Central method to apply css styles.
     * @param el {Element} The DOM element to apply the styles.
     * @param styles {Map} A map containing styles and values.
     */
    __applyStyles : function(el, styles) {
      for (var key in styles) {
        // ignore undefined values (might be a bad detection)
        if (styles[key] === undefined) {
          continue;
        }
        var name = qx.lang.String.camelCase(key);
        if (qx.bom.element.Style) {
          qx.bom.element.Style.set(el, name, styles[key]);
        } else {
          el.style[name] = styles[key];
        }
      }
    },


    /**
     * Dynamic calculation of the steps time considering a max step time.
     * @param duration {Number} The duration of the animation.
     * @param keys {Array} An array containing the orderd set of key frame keys.
     * @return {Integer} The best suited step time.
     */
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


    /**
     * Helper which returns the orderd keys of the key frame map.
     * @param keyFrames {Map} The map of key frames.
     * @return {Array} An orderd list of kyes.
     */
    __getOrderedKeys : function(keyFrames) {
      var keys = qx.Bootstrap.getKeys(keyFrames);
      for (var i=0; i < keys.length; i++) {
        keys[i] = parseInt(keys[i], 10);
      };
      keys.sort(function(a,b) {return a-b;});
      return keys;
    }
  }
});