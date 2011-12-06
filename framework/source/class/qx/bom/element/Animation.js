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
 */
qx.Bootstrap.define("qx.bom.element.Animation",
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
     * This function starts the animation. It takes a DOM element to apply the
     * animation to, and a description. The description should be a map, which
     * could look like this:
     *
     * <pre class="javascript">
     * {
     *   "duration": 1000,
     *   "keep": 100,
     *   "keyFrames": {
     *     0 : {"opacity": 1, "scale": 1},
     *     100 : {"opacity": 0, "scale": 0}
     *   },
     *   "origin": "50% 50%",
     *   "repeat": 1,
     *   "timing": "ease-out",
     *   "alternate": false,
     *   "reverse": false
     * }
     * </pre>
     *
     * *duration* is the time in milliseconds one animation cycle should take.
     *
     * *keep* is the key frame to apply at the end of the animation. (optional)
     *
     * *keyFrames* is a map of separate frames. Each frame is defined by a
     *   number which is the percentage value of time in the animation. The value
     *   is a map itself which holds css properties or transforms
     *   {@link qx.bom.element.Transform}.
     *
     * *origin* maps to the transform origin {@link qx.bom.element.Transform#setOrigin}
     *
     * *repeat* is the amount of time the animation should be run in
     *   sequence. You can also use "infinite".
     *
     * *alternate* defines if every other animation should be run in reverse order.
     *
     * *reverse* defines if the animation should run in reverse order.
     *
     * @param el {Element} The element to animate.
     * @param desc {Map} The animations description.
     * @return {qx.bom.element.AnimationHandle} AnimationHandle instance to control
     *   the animation.
     */
    animate : function(el, desc) {
      this.__normalizeDesc(desc);

      // debug validation
      if (qx.core.Environment.get("qx.debug")) {
        this.__validateDesc(desc);
      }

      if (!this.__sheet) {
        this.__sheet = qx.bom.Stylesheet.createElement();
      }
      var keyFrames = desc.keyFrames;

      // if animations are supported
      if (this.__cssAnimationKeys != null) {
        var name = this.__addKeyFrames(keyFrames, desc.reverse);

        var style =
          name + " " +
          desc.duration + "ms " +
          desc.repeat + " " +
          desc.timing + " " +
          (desc.alternate ? "alternate" : "");

        var eventName = this.__cssAnimationKeys["end-event"];
        qx.bom.Event.addNativeListener(el, eventName, this.__onAnimationEnd);

        el.style[this.__cssAnimationKeys["name"]] = style;
      }

      var animation = new qx.bom.element.AnimationHandle();
      animation.desc = desc;
      animation.el = el;
      el.$$animation = animation;

      // additional transform keys
      if (desc.origin != null) {
        qx.bom.element.Transform.setOrigin(el, desc.origin);
      }

      // fallback for browsers not supporting animations
      if (this.__cssAnimationKeys == null) {
        window.setTimeout(function() {
          qx.bom.element.Animation.__onAnimationEnd({target: el});
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

      if (qx.bom.element.Animation.__cssAnimationKeys != null) {
        // reset the styling
        el.style[qx.bom.element.Animation.__cssAnimationKeys["name"]] = "";

        qx.bom.Event.removeNativeListener(
          el,
          qx.bom.element.Animation.__cssAnimationKeys["name"],
          qx.bom.element.Animation.__onAnimationEnd
        );
      }

      if (desc.origin != null) {
        qx.bom.element.Transform.setOrigin(el, "");
      }

      if (desc.keep != null) {
        qx.bom.element.Animation.__keepFrame(el, desc.keyFrames[desc.keep]);
      }

      el.$$animation = null;
      animation.el = null;
      animation.ended = true;

      var onEnd = animation.getOnEnd();
      for (var i=0; i < onEnd.length; i++) {
        onEnd[i].callback.call(onEnd[i].ctx, el);
      };
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
        if (style in qx.bom.element.Animation.__transitionKeys) {
          if (!transforms) {
            transforms = {};
          }
          transforms[style] = endFrame[style];
        } else {
          el.style[style] = endFrame[style];
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
      if (!desc.hasOwnProperty("reverse")) {
        desc.reverse = false;
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
        ];

        // check for unknown keys
        for (var name in desc) {
          if (!(possibleKeys.indexOf(name) != -1)) {
            qx.Bootstrap.warn("Unknown key '" + name + "' in the animation description.");
          }
        };

        // check for mandatory keys
        if (desc.duration == null || desc.duration <= 0) {
          qx.Bootstrap.warn("No 'duration' given > 0");
        }
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