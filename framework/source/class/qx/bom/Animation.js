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

qx.Bootstrap.define("qx.bom.Animation",
{
  statics : {
    // initialization
    __sheet : null,
    __rules : {},
    __rulePrefix : "Anni",
    __id : 0,

    __transitionKeys : {
      "scale": true,
      "rotate" : true,
      "skew" : true,
      "translate" : true
    },


    __cssAnimationKeys : qx.core.Environment.get("css.animation"),


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
      var name = this.__addKeyFrames(keyFrames, desc.reverse);

      var style = 
        name + " " + 
        desc.duration + "ms " + 
        desc.repeat + " " + 
        desc.timing + " " +
        (desc.alternate ? "alternate" : "");

      var animation = new qx.bom.AnimationHandle();
      animation.desc = desc;
      animation.el = el;
      el.$$animation = animation;
      var eventName = this.__cssAnimationKeys["end-event"];
      qx.bom.Event.addNativeListener(el, eventName, this.__onAnimationEnd);

      el.style[this.__cssAnimationKeys["name"]] = style;

      // additional transform keys
      if (desc.origin != null) {
        qx.bom.element.Transform.setOrigin(el, desc.origin);
      }

      return animation;
    },


    __onAnimationEnd : function(e) {
      var el = e.target;
      var animation = el.$$animation;
      var desc = animation.desc;
      // reset the styling
      el.style[qx.bom.Animation.__cssAnimationKeys["name"]] = "";
      if (desc.origin != null) {
        qx.bom.element.Transform.transform(el);
      }

      if (desc.keep != null) {
        // keep the element at this animation step
        var endFrame = desc.keyFrames[desc.keep];
        var transforms;
        for (var style in endFrame) {
          if (style in qx.bom.Animation.__transitionKeys) {
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
      }

      qx.bom.Event.removeNativeListener(
        el, 
        qx.bom.Animation.__cssAnimationKeys["name"],
        qx.bom.Animation.__onAnimationEnd
      );

      var onEnd = animation.getOnEnd();
      for (var i=0; i < onEnd.length; i++) {
        onEnd[i].call(animation, el);
      };

      delete el.$$animation;
      animation.el = null;
      animation.ended = true;
    },


    __normalizeDesc : function(desc) {
      if (!desc.hasOwnProperty("alterante")) {
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
     * @signature function(desc)
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