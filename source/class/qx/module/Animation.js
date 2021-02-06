/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * Cross browser animation layer. It uses feature detection to check if CSS
 * animations are available and ready to use. If not, a JavaScript-based
 * fallback will be used.
 *
 * @require(qx.module.Css)
 * @require(qx.module.Event)
 * @require(qx.module.Environment)
 */
qx.Bootstrap.define("qx.module.Animation", {
  events : {
    /** Fired when an animation starts. */
    "animationStart" : undefined,

    /** Fired when an animation has ended one iteration. */
    "animationIteration" : undefined,

    /** Fired when an animation has ended. */
    "animationEnd" : undefined
  },

  statics :
  {
    /**
     * Animation description used in {@link #fadeOut}.
     */
    _fadeOut : {duration: 700, timing: "ease-out", keep: 100, keyFrames : {
      0: {opacity: 1},
      100: {opacity: 0, display: "none"}
    }},


    /**
     * Animation description used in {@link #fadeIn}.
     */
    _fadeIn : {duration: 700, timing: "ease-in", keep: 100, keyFrames : {
      0: {opacity: 0},
      100: {opacity: 1}
    }},


    /**
     * Animation execute either regular or reversed direction.
     * @param desc {Map} The animation"s description.
     * @param duration {Number?} The duration in milliseconds of the animation,
     *   which will override the duration given in the description.
     * @param reverse {Boolean} <code>true</code>, if the animation should be reversed
     */
    _animate : function(desc, duration, reverse) {
      this._forEachElement(function(el, i) {
        // stop all running animations
        if (el.$$animation) {
          el.$$animation.stop();
        }

        var handle;
        if (reverse) {
          handle = qx.bom.element.Animation.animateReverse(el, desc, duration);
        } else {
          handle = qx.bom.element.Animation.animate(el, desc, duration);
        }

        var self = this;
        // only register for the first element
        if (i == 0) {
          handle.on("start", function() {
            self.emit("animationStart");
          }, handle);

          handle.on("iteration", function() {
            self.emit("animationIteration");
          }, handle);
        }

        handle.on("end", function() {
          for (var i=0; i < self.length; i++) {
            if (self[i].$$animation) {
              return;
            }
          }
          self.emit("animationEnd");
        }, el);
      });
    }
  },

  members :
  {
    /**
     * Returns the stored animation handles. The handles are only
     * available while an animation is running.
     *
     * @internal
     * @return {Array} An array of animation handles.
     */
    getAnimationHandles : function() {
      var animationHandles = [];
      for (var i=0; i < this.length; i++) {
        animationHandles[i] = this[i].$$animation;
      }
      return animationHandles;
    },


    /**
     * Starts the animation with the given description.
     *
     * *duration* is the time in milliseconds one animation cycle should take.
     *
     * *keep* is the key frame to apply at the end of the animation. (optional)
     *
     * *keyFrames* is a map of separate frames. Each frame is defined by a
     *   number which is the percentage value of time in the animation. The value
     *   is a map itself which holds css properties or transforms
     *   (Transforms only for CSS Animations).
     *
     * *origin* maps to the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin">transform origin</a>
     * (Only for CSS animations).
     *
     * *repeat* is the amount of time the animation should be run in
     *   sequence. You can also use "infinite".
     *
     * *timing* takes one of these predefined values:
     *   <code>ease</code> | <code>linear</code> | <code>ease-in</code>
     *   | <code>ease-out</code> | <code>ease-in-out</code> |
     *   <code>cubic-bezier(&lt;number&gt;, &lt;number&gt;, &lt;number&gt;, &lt;number&gt;)</code>
     *   (cubic-bezier only available for CSS animations)
     *
     * *alternate* defines if every other animation should be run in reverse order.
     *
     * *delay* is the time in milliseconds the animation should wait before start.
     *
     * @attach {qxWeb}
     * @param desc {Map} The animation"s description.
     * @param duration {Number?} The duration in milliseconds of the animation,
     *   which will override the duration given in the description.
     * @return {qxWeb} The collection for chaining.
     */
    animate : function(desc, duration) {
      qx.module.Animation._animate.bind(this)(desc, duration, false);
      return this;
    },


    /**
     * Starts an animation in reversed order. For further details, take a look at
     * the {@link #animate} method.
     * @attach {qxWeb}
     * @param desc {Map} The animation"s description.
     * @param duration {Number?} The duration in milliseconds of the animation,
     *   which will override the duration given in the description.
     * @return {qxWeb} The collection for chaining.
     */
    animateReverse : function(desc, duration) {
      qx.module.Animation._animate.bind(this)(desc, duration, true);
      return this;
    },


    /**
     * Manipulates the play state of the animation.
     * This can be used to continue an animation when paused.
     * @attach {qxWeb}
     * @return {qxWeb} The collection for chaining.
     */
    play : function() {
      for (var i=0; i < this.length; i++) {
        var handle = this[i].$$animation;
        if (handle) {
          handle.play();
        }
      }
      return this;
    },


    /**
     * Manipulates the play state of the animation.
     * This can be used to pause an animation when running.
     * @attach {qxWeb}
     * @return {qxWeb} The collection for chaining.
     */
    pause : function() {
      for (var i=0; i < this.length; i++) {
        var handle = this[i].$$animation;
        if (handle) {
          handle.pause();
        }
      }

      return this;
    },


    /**
     * Stops a running animation.
     * @attach {qxWeb}
     * @return {qxWeb} The collection for chaining.
     */
    stop : function() {
      for (var i=0; i < this.length; i++) {
        var handle = this[i].$$animation;
        if (handle) {
          handle.stop();
        }
      }

      return this;
    },


    /**
     * Returns whether an animation is running or not.
     * @attach {qxWeb}
     * @return {Boolean} <code>true</code>, if an animation is running.
     */
    isPlaying : function() {
      for (var i=0; i < this.length; i++) {
        var handle = this[i].$$animation;
        if (handle && handle.isPlaying()) {
          return true;
        }
      }

      return false;
    },


    /**
     * Returns whether an animation has ended or not.
     * @attach {qxWeb}
     * @return {Boolean} <code>true</code>, if an animation has ended.
     */
    isEnded : function() {
      for (var i=0; i < this.length; i++) {
        var handle = this[i].$$animation;
        if (handle && !handle.isEnded()) {
          return false;
        }
      }

      return true;
    },


    /**
     * Fades in all elements in the collection.
     * @attach {qxWeb}
     * @param duration {Number?} The duration in milliseconds.
     * @return {qxWeb} The collection for chaining.
     */
    fadeIn : function(duration) {
      // remove "display: none" style
      this.setStyle("display", "");
      return this.animate(qx.module.Animation._fadeIn, duration);
    },


    /**
     * Fades out all elements in the collection.
     * @attach {qxWeb}
     * @param duration {Number?} The duration in milliseconds.
     * @return {qxWeb} The collection for chaining.
     */
    fadeOut : function(duration) {
      return this.animate(qx.module.Animation._fadeOut, duration);
    }
  },


  defer : function(statics) {
    qxWeb.$attachAll(this);


    /**
     * End value for opacity style. This value is modified for all browsers which are
     * 'optimizing' this style value by not setting it (like IE9). This leads to a wrong
     * end state for the 'fadeIn' animation if a opacity value is set by CSS.
     */
    if (qxWeb.env.get("browser.name") === "ie" && qxWeb.env.get("browser.version") <= 9) {
      // has to be fixed using direct access since we cannot store the value as static member.
      // The 'fadeIn' description is evaluated during class definition
      statics._fadeIn.keyFrames[100].opacity = 0.99;
    }
  }
});
