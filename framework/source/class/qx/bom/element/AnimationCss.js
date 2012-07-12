/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class is responsible for applying CSS3 animations to plain DOM elements.
 *
 * The implementation is mostly a cross-browser wrapper for applying the
 * animations, including transforms. If the browser does not support
 * CSS animations, but you have set a keep frame, the keep frame will be applied
 * immediately, thus making the animations optional.
 *
 * The API aligns closely to the spec wherever possible.
 *
 * http://www.w3.org/TR/css3-animations/
 *
 * {@link qx.bom.element.Animation} is the class, which takes care of the
 * feature detection for CSS animations and decides which implementation
 * (CSS or JavaScript) should be used. Most likely, this implementation should
 * be the one to use.
 */
qx.Bootstrap.define("qx.bom.element.AnimationCss",
{
  statics : {
    // initialization
    __sheet : null,
    __rulePrefix : "Anni",
    __id : 0,
    /** Static map of rules */
    __rules : {},

    /** The used keys for transforms. */
    __transitionKeys : {
      "scale": true,
      "rotate" : true,
      "skew" : true,
      "translate" : true
    },

    /** Map of cross browser CSS keys. */
    __cssAnimationKeys : qx.core.Environment.get("css.animation"),


    /**
     * This is the main function to start the animation in reverse mode.
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
     * Internal method to start an animation either reverse or not.
     * {@link qx.bom.element.Animation}.
     * @param el {Element} The element to animate.
     * @param desc {Map} Animation description.
     * @param duration {Integer?} The duration of the animation which will
     *   override the duration given in the description.
     * @param reverse {Boolean} <code>true</code>, if the animation should be
     *   reversed.
     * @return {qx.bom.element.AnimationHandle} The handle.
     */
    _animate : function(el, desc, duration, reverse) {
      this.__normalizeDesc(desc);

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

      // debug validation
      if (qx.core.Environment.get("qx.debug")) {
        this.__validateDesc(desc);
      }

      // reverse the keep property if the animation is reverse as well
      var keep = desc.keep;
      if (keep != null && (reverse || (desc.alternate && desc.repeat % 2 == 0))) {
        keep = 100 - keep;
      }

      if (!this.__sheet) {
        this.__sheet = qx.bom.Stylesheet.createElement();
      }
      var keyFrames = desc.keyFrames;

      if (duration == undefined) {
        duration = desc.duration;
      }

      // if animations are supported
      if (this.__cssAnimationKeys != null) {
        var name = this.__addKeyFrames(keyFrames, reverse);

        var style =
          name + " " +
          duration + "ms " +
          desc.repeat + " " +
          desc.timing + " " +
          (desc.alternate ? "alternate" : "");

        var eventName = this.__cssAnimationKeys["end-event"];
        qx.bom.Event.addNativeListener(el, eventName, this.__onAnimationEnd);

        el.style[qx.lang.String.camelCase(this.__cssAnimationKeys["name"])] = style;
        // use the fill mode property if available and suitable
        if (keep && keep == 100 && this.__cssAnimationKeys["fill-mode"]) {
          el.style[this.__cssAnimationKeys["fill-mode"]] = "forwards";
        }
      }

      var animation = new qx.bom.element.AnimationHandle();
      animation.desc = desc;
      animation.el = el;
      animation.keep = keep;
      el.$$animation = animation;

      // additional transform keys
      if (desc.origin != null) {
        qx.bom.element.Transform.setOrigin(el, desc.origin);
      }

      // fallback for browsers not supporting animations
      if (this.__cssAnimationKeys == null) {
        window.setTimeout(function() {
          qx.bom.element.AnimationCss.__onAnimationEnd({target: el});
        }, 0);
      }

      return animation;
    },


    /**
     * Handler for the animation end.
     * @param e {Event} The native event from the browser.
     */
    __onAnimationEnd : function(e) {
      var el = e.target;
      var animation = el.$$animation;

      // ignore events when already cleaned up
      if (!animation) {
        return;
      }

      var desc = animation.desc;

      if (qx.bom.element.AnimationCss.__cssAnimationKeys != null) {
        // reset the styling
        var key = qx.lang.String.camelCase(
          qx.bom.element.AnimationCss.__cssAnimationKeys["name"]
        );
        el.style[key] = "";

        qx.bom.Event.removeNativeListener(
          el,
          qx.bom.element.AnimationCss.__cssAnimationKeys["name"],
          qx.bom.element.AnimationCss.__onAnimationEnd
        );
      }

      if (desc.origin != null) {
        qx.bom.element.Transform.setOrigin(el, "");
      }

      qx.bom.element.AnimationCss.__keepFrame(el, desc.keyFrames[animation.keep]);

      el.$$animation = null;
      animation.el = null;
      animation.ended = true;

      animation.emit("end", el);
    },


    /**
     * Helper method which takes an element and a key frame description and
     * applies the properties defined in the given frame to the element. This
     * method is used to keep the state of the animation.
     * @param el {Element} The element to apply the frame to.
     * @param endFrame {Map} The description of the end frame, which is basically
     *   a map containing CSS properties and values including transforms.
     */
    __keepFrame : function(el, endFrame) {
      // keep the element at this animation step
      var transforms;
      for (var style in endFrame) {
        if (style in qx.bom.element.AnimationCss.__transitionKeys) {
          if (!transforms) {
            transforms = {};
          }
          transforms[style] = endFrame[style];
        } else {
          el.style[qx.lang.String.camelCase(style)] = endFrame[style];
        }
      }

      // transform keeping
      if (transforms) {
        qx.bom.element.Transform.transform(el, transforms);
      }
    },


    /**
     * Preprocessing of the description to make sure every necessary key is
     * set to its default.
     * @param desc {Map} The description of the animation.
     */
    __normalizeDesc : function(desc) {
      if (!desc.hasOwnProperty("alternate")) {
        desc.alternate = false;
      }
      if (!desc.hasOwnProperty("keep")) {
        desc.keep = null;
      }
      if (!desc.hasOwnProperty("repeat")) {
        desc.repeat = 1;
      }
      if (!desc.hasOwnProperty("timing")) {
        desc.timing = "linear";
      }
      if (!desc.hasOwnProperty("origin")) {
        desc.origin = null;
      }
    },


    /**
     * Debugging helper to validate the description.
     * @signature function(desc)
     * @param desc {Map} The description of the animation.
     */
    __validateDesc : qx.core.Environment.select("qx.debug", {
      "true" : function(desc) {
        var possibleKeys = [
          "origin", "duration", "keep", "keyFrames",
          "repeat", "timing", "alternate", "reverse"
          //@deprecated since 2.0 (reverse key)
        ];

        // check for unknown keys
        for (var name in desc) {
          if (!(possibleKeys.indexOf(name) != -1)) {
            qx.Bootstrap.warn("Unknown key '" + name + "' in the animation description.");
          }
        };

        if (desc.keyFrames == null) {
          qx.Bootstrap.warn("No 'keyFrames' given > 0");
        } else {
          // check the key frames
          for (var pos in desc.keyFrames) {
            if (pos < 0 || pos > 100) {
              qx.Bootstrap.warn("Keyframe position needs to be between 0 and 100");
            }
          }
        }
      },

      "default" : null
    }),


    /**
     * Helper to add the given frames to an internal CSS stylesheet. It parses
     * the description and adds the key frames to the sheet.
     * @param frames {Map} A map of key frames that describe the animation.
     * @param reverse {Boolean} <code>true</code>, if the key frames should
     *   be added in reverse order.
     */
    __addKeyFrames : function(frames, reverse) {
      var rule = "";

      // for each key frame
      for (var position in frames) {
        rule += (reverse ? -(position - 100) : position) + "% {";

        var frame = frames[position];
        var transforms;
        // each style
        for (var style in frame) {
          if (style in this.__transitionKeys) {
            if (!transforms) {
              transforms = {};
            }
            transforms[style] = frame[style];
          } else {
            rule += style + ":" + frame[style] + ";";
          }
        }

        // transform handling
        if (transforms) {
          rule += qx.bom.element.Transform.getCss(transforms);
        }

        rule += "} ";
      }

      // cached shorthand
      if (this.__rules[rule]) {
        return this.__rules[rule];
      }

      var name = this.__rulePrefix + this.__id++;
      var selector = this.__cssAnimationKeys["keyframes"] + " " + name;
      qx.bom.Stylesheet.addRule(this.__sheet, selector, rule);

      this.__rules[rule] = name;

      return name;
    }
  }
});