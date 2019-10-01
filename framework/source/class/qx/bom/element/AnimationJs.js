/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * This class offers the same API as the CSS3 animation layer in
 * {@link qx.bom.element.AnimationCss} but uses JavaScript to fake the behavior.
 *
 * {@link qx.bom.element.Animation} is the class, which takes care of the
 * feature detection for CSS animations and decides which implementation
 * (CSS or JavaScript) should be used. Most likely, this implementation should
 * be the one to use.
 *
 * @ignore(qx.bom.element.Style.*)
 * @use(qx.bom.element.AnimationJs#play)
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

    /** The used keys for transforms. */
    __transitionKeys : {
      "scale": true,
      "rotate" : true,
      "skew" : true,
      "translate" : true
    },

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
        return el.$$animation;
      }

      desc = qx.lang.Object.clone(desc, true);

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
      handle.jsAnimation = true;

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

      var delay = desc.delay || 0;
      var self = this;
      handle.delayId = window.setTimeout(function() {
        handle.delayId = null;
        self.play(handle);
      }, delay);
      return handle;
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
          // prefixed key calculation
          var prefixed = qx.bom.Style.getPropertyName(name);
          if (prefixed && prefixed != name) {
            var prefixedName = qx.bom.Style.getCssName(prefixed);
            keyFrames[percent][prefixedName] = keyFrames[percent][name];
            delete keyFrames[percent][name];
            name = prefixedName;
          }
          // check for the available units
          if (units[name] == undefined) {
            var item = keyFrames[percent][name];
            if (typeof item == "string") {
              units[name] = this.__getUnit(item);
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
            if (name in el.style) {
              // get the computed style if possible
              if (window.getComputedStyle) {
                frame[name] = window.getComputedStyle(el, null)[name];
              } else {
                frame[name] = el.style[name];
              }
            } else {
              frame[name] = el[name];
            }
            // if its a unit we know, set 0 as fallback
            if (frame[name] === "" && this.__units.indexOf(units[name]) != -1) {
              frame[name] = "0" + units[name];
            }
          }
        };
      };
    },


    /**
     * Checks for transform keys and returns a cloned frame
     * with the right transform style set.
     * @param frame {Map} A single key frame of the description.
     * @return {Map} A modified clone of the given frame.
     */
    __normalizeKeyFrameTransforms : function(frame) {
      frame = qx.lang.Object.clone(frame);
      var transforms;
      for (var name in frame) {
        if (name in this.__transitionKeys) {
          if (!transforms) {
            transforms = {};
          }
          transforms[name] = frame[name];
          delete frame[name];
        }
      };
      if (transforms) {
        var transformStyle = qx.bom.element.Transform.getCss(transforms).split(":");
        if (transformStyle.length > 1) {
          frame[transformStyle[0]] = transformStyle[1].replace(";", "");
        }
      }
      return frame;
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
      delta[0] = this.__normalizeKeyFrameTransforms(keyFrames[0]);
      var last = keyFrames[0];
      var next = keyFrames[keys[keyIndex]];
      var stepsToNext = Math.floor(keys[keyIndex] / (stepTime / duration * 100));

      var calculationIndex = 1; // is used as counter for the timing calculation
      // for every step
      for (var i=1; i < delta.length; i++) {
        // switch key frames if we crossed a percent border
        if (i * stepTime / duration * 100 > keys[keyIndex]) {
          last = next;
          keyIndex++;
          next = keyFrames[keys[keyIndex]];
          stepsToNext = Math.floor(keys[keyIndex] / (stepTime / duration * 100)) - stepsToNext;
          calculationIndex = 1;
        }

        delta[i] = {};

        var transforms;
        // for every property
        for (var name in next) {
          var nItem = next[name] + "";

          // transform values
          if (name in this.__transitionKeys) {
            if (!transforms) {
              transforms = {};
            }

            if (qx.Bootstrap.isArray(last[name])) {
              if (!qx.Bootstrap.isArray(next[name])) {
                next[name] = [next[name]];
              }
              transforms[name] = [];
              for (var j = 0; j < next[name].length; j++) {
                var item = next[name][j] + "";
                var x = calculationIndex / stepsToNext;
                transforms[name][j] = this.__getNextValue(item, last[name], timing, x);
              }
            } else {
              var x = calculationIndex / stepsToNext;
              transforms[name] = this.__getNextValue(nItem, last[name], timing, x);
            }

          // color values
          } else if (nItem.charAt(0) == "#") {
            // get the two values from the frames as RGB arrays
            var value0 = qx.util.ColorUtil.cssStringToRgb(last[name]);
            var value1 = qx.util.ColorUtil.cssStringToRgb(nItem);
            var stepValue = [];
            // calculate every color channel
            for (var j=0; j < value0.length; j++) {
              var range = value0[j] - value1[j];
              var x = calculationIndex / stepsToNext;
              var timingX = qx.bom.AnimationFrame.calculateTiming(timing, x);
              stepValue[j] = parseInt(value0[j] - range * timingX, 10);
            }

            delta[i][name] = qx.util.ColorUtil.rgbToHexString(stepValue);

          } else if (!isNaN(parseFloat(nItem))) {
            var x = calculationIndex / stepsToNext;
            delta[i][name] = this.__getNextValue(nItem, last[name], timing, x);
          } else {
            delta[i][name] = last[name] + "";
          }
        }
        // save all transformations in the delta values
        if (transforms) {
          var transformStyle = qx.bom.element.Transform.getCss(transforms).split(":");
          if (transformStyle.length > 1) {
            delta[i][transformStyle[0]] = transformStyle[1].replace(";", "");
          }
        }

        calculationIndex++;
      }
      // make sure the last key frame is right
      delta[delta.length -1] = this.__normalizeKeyFrameTransforms(keyFrames[100]);

      return delta;
    },


    /**
     * Ties to parse out the unit of the given value.
     *
     * @param item {String} A CSS value including its unit.
     * @return {String} The unit of the given value.
     */
    __getUnit : function(item) {
      return item.substring((parseFloat(item) + "").length, item.length);
    },


    /**
     * Returns the next value based on the given arguments.
     *
     * @param nextItem {String} The CSS value of the next frame
     * @param lastItem {String} The CSS value of the last frame
     * @param timing {String} The timing used for the calculation
     * @param x {Number} The x position of the animation on the time axis
     * @return {String} The calculated value including its unit.
     */
    __getNextValue : function(nextItem, lastItem, timing, x) {
      var range = parseFloat(nextItem) - parseFloat(lastItem);
      return (parseFloat(lastItem) + range * qx.bom.AnimationFrame.calculateTiming(timing, x)) + this.__getUnit(nextItem);
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
      handle.emit("start", handle.el);
      var id = window.setInterval(function() {
        handle.repeatSteps--;
        var values = handle.delta[handle.i % handle.steps];
        // save the init values
        if (handle.i === 0) {
          for (var name in values) {
            if (handle.initValues[name] === undefined) {
              // animate element property
              if (handle.el[name] !== undefined) {
                handle.initValues[name] = handle.el[name];
              }
              // animate CSS property
              else if (qx.bom.element.Style) {
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
          handle.emit("iteration", handle.el);
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

      return handle;
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

      // clear the delay if the animation has not been started
      if (handle.delayId) {
        window.clearTimeout(handle.delayId);
      }

      // check if animation is already stopped
      if (el == undefined) {
        return handle;
      }

      // if we should keep a frame
      var keep = desc.keep;
      if (keep != undefined && !handle.stopped) {
        if (handle.reverse || (desc.alternate && desc.repeat && desc.repeat % 2 == 0)) {
          keep = 100 - keep;
        }
        this.__applyStyles(el, this.__normalizeKeyFrameTransforms(desc.keyFrames[keep]));
      } else {
        this.__applyStyles(el, initValues);
      }

      el.$$animation = null;
      handle.el = null;
      handle.ended = true;
      handle.animationId = null;

      handle.emit("end", el);

      return handle;
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
     * Central method to apply css styles and element properties.
     * @param el {Element} The DOM element to apply the styles.
     * @param styles {Map} A map containing styles and values.
     */
    __applyStyles : function(el, styles) {
      for (var key in styles) {
        // ignore undefined values (might be a bad detection)
        if (styles[key] === undefined) {
          continue;
        }

        // apply element property value - only if a CSS property
        // is *not* available
        if (typeof el.style[key] === "undefined" && key in el) {
          el[key] = styles[key];
          continue;
        }

        var name = qx.bom.Style.getPropertyName(key) || key;
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
     * @param keys {Array} An array containing the ordered set of key frame keys.
     * @return {Integer} The best suited step time.
     */
    __getStepTime : function(duration, keys) {
      // get min difference
      var minDiff = 100;
      for (var i=0; i < keys.length - 1; i++) {
        minDiff = Math.min(minDiff, keys[i+1] - keys[i]);
      };

      var stepTime = duration * minDiff / 100;
      while (stepTime > this.__maxStepTime) {
        stepTime = stepTime / 2;
      }
      return Math.round(stepTime);
    },


    /**
     * Helper which returns the ordered keys of the key frame map.
     * @param keyFrames {Map} The map of key frames.
     * @return {Array} An ordered list of keys.
     */
    __getOrderedKeys : function(keyFrames) {
      var keys = Object.keys(keyFrames);
      for (var i=0; i < keys.length; i++) {
        keys[i] = parseInt(keys[i], 10);
      };
      keys.sort(function(a,b) {return a-b;});
      return keys;
    }
  }
});
