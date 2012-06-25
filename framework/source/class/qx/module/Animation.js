/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/* ************************************************************************

#require(qx.module.Css)

************************************************************************ */
/**
 * Cross browser animation layer. It uses feature detection to check if CSS
 * animations are available and ready to use. If not, a JavaScript-based
 * fallback will be used.
 */
qx.Bootstrap.define("qx.module.Animation", {
  events : {
    /**
     * Fired when an animation has ended.
     */
    "animationEnd" : undefined
  },

  statics :
  {
    /**
     * Internal initializer to make sure we always have a plain array
     * for storing animation handles.
     * @internal
     */
    $init : function() {
      this.__animationHandles = [];
    },


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
     * Starts the animation with the given description.
     * The description should be a map, which could look like this:
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
     *   (Transforms only for CSS Animations).
     *
     * *origin* maps to the transform origin {@link qx.bom.element.Transform#setOrigin}
     *   (Only for CSS animations).
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
     * @attach {q}
     * @param desc {Map} The animation's description.
     * @param duration {Number?} The duration in milliseconds of the animation,
     *   which will override the duration given in the description.
     * @return {q} The collection for chaining.
     */
    animate : function(desc, duration) {
      if (this.__animationHandles.length > 0) {
        throw new Error("Only one animation at a time.");
      }
      for (var i=0; i < this.length; i++) {
        var handle = qx.bom.element.Animation.animate(this[i], desc, duration);

        var self = this;
        handle.on("end", function() {
          var handles = self.__animationHandles;
          handles.splice(self.indexOf(handle), 1);
          if (handles.length == 0) {
            self.emit("animationEnd");
          }
        }, handle);
        this.__animationHandles.push(handle);
      };
      return this;
    },


    /**
     * Starts an animation in reversed order. For further details, take a look at
     * the {@link #animate} method.
     * @attach {q}
     * @param desc {Map} The animation's description.
     * @param duration {Number?} The duration in milliseconds of the animation,
     *   which will override the duration given in the description.
     * @return {q} The collection for chaining.
     */
    animateReverse : function(desc, duration) {
      if (this.__animationHandles.length > 0) {
        throw new Error("Only one animation at a time.");
      }
      for (var i=0; i < this.length; i++) {
        var handle = qx.bom.element.Animation.animateReverse(this[i], desc, duration);

        var self = this;
        handle.on("end", function() {
          var handles = self.__animationHandles;
          handles.splice(self.indexOf(handle), 1);
          if (handles.length == 0) {
            self.emit("animationEnd");
          }
        }, handle);
        this.__animationHandles.push(handle);
      };
      return this;
    },



    /**
     * Manipulates the play state of the animation.
     * This can be used to continue an animation when paused.
     * @attach {q}
     * @return {q} The collection for chaining.
     */
    play : function() {
      for (var i=0; i < this.__animationHandles.length; i++) {
        this.__animationHandles[i].play();
      };
      return this;
    },


    /**
     * Manipulates the play state of the animation.
     * This can be used to pause an animation when running.
     * @attach {q}
     * @return {q} The collection for chaining.
     */
    pause : function() {
      for (var i=0; i < this.__animationHandles.length; i++) {
        this.__animationHandles[i].pause();
      };
      return this;
    },


    /**
     * Stops a running animation.
     * @attach {q}
     * @return {q} The collection for chaining.
     */
    stop : function() {
      for (var i=0; i < this.__animationHandles.length; i++) {
        this.__animationHandles[i].stop();
      };
      this.__animationHandles = [];
      return this;
    },


    /**
     * Returns whether an animation is running or not.
     * @attach {q}
     * @return {Boolean} <code>true</code>, if an animation is running.
     */
    isPlaying : function() {
      for (var i=0; i < this.__animationHandles.length; i++) {
        if (this.__animationHandles[i].isPlaying()) {
          return true;
        }
      };
      return false;
    },


    /**
     * Returns whether an animation has ended or not.
     * @attach {q}
     * @return {Boolean} <code>true</code>, if an animation has ended.
     */
    isEnded : function() {
      for (var i=0; i < this.__animationHandles.length; i++) {
        if (!this.__animationHandles[i].isEnded()) {
          return false;
        }
      };
      return true;
    },


    /**
     * Fades in all elements in the collection.
     * @attach {q}
     * @param duration {Number?} The duration in milliseconds.
     * @return {q} The collection for chaining.
     */
    fadeIn : function(duration) {
      // remove 'display: none' style
      this.setStyle("display", "");
      return this.animate(qx.module.Animation._fadeIn, duration);
    },


    /**
     * Fades out all elements in the collection.
     * @attach {q}
     * @param duration {Number?} The duration in milliseconds.
     * @return {q} The collection for chaining.
     */
    fadeOut : function(duration) {
      return this.animate(qx.module.Animation._fadeOut, duration);
    }
  },


  defer : function(statics) {
    q.$attach({
      "animate" : statics.animate,
      "animateReverse" : statics.animateReverse,
      "fadeIn" : statics.fadeIn,
      "fadeOut" : statics.fadeOut,
      "play" : statics.play,
      "pause" : statics.pause,
      "stop" : statics.stop,
      "isEnded" : statics.isEnded,
      "isPlaying" : statics.isPlaying
    });

    q.$attachInit(statics.$init);
  }
});
