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
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * This is a simple handle, which will be returned when an animation is 
 * started using the {@link qx.bom.element.Animation#animate} method. It 
 * basically controls the animation.
 */
qx.Bootstrap.define("qx.bom.element.AnimationHandle",
{
  extend : Object,


  construct : function() {
    var css = qx.core.Environment.get("css.animation");
    this.__playState = css && css["playstate"];
    this.__onEnd = [];
  },


  members :
  {
    __playState : null,
    __playing : false,
    __ended : false,
    __onEnd : null,


    /**
     * Method to add callbacks to the end event of the animation.
     * @param onEnd {Function} The end callback.
     * @param ctx {var?} The context of the handler.
     */
    onEnd : function(onEnd, ctx) {
      this.__onEnd.push({ctx : ctx || this, callback: onEnd});
    },


    /**
     * Internal helper to get all end callbacks.
     * @internal
     * @return {Array} An array of Functions.
     */
    getOnEnd : function() {
      return this.__onEnd;
    },


    /**
     * Accessor of the playing state.
     * @return {Boolean} <code>true</code>, if the animations is playing.
     */
    isPlaying : function() {
      return this.__playing;
    },


    /**
     * Accessor of the ended state.
     * @return {Boolean} <code>true</code>, if the animations has ended.
     */
    isEnded : function() {
      return this.__ended;
    },


    /**
     * Pauses the animation, if running. If not running, it will be ignored.
     */
    pause : function() {
      if (this.el) {
        this.el.style[this.__playState] = "paused";
        this.el.$$animation.__playing = false;
      }
    },


    /**
     * Resumes an animation. This does not start the animation once it has ended.
     */
    play : function() {
      if (this.el) {
        this.el.style[this.__playState] = "running";
        this.el.$$animation.__playing = true;
      }
    },


    /**
     * Stops the animation if running.
     */
    stop : function() {
      if (this.el) {
        this.el.style[this.__playState] = "";
        this.el.style[qx.core.Environment.get("css.animation").name] = "";
        this.el.$$animation.__playing = false;
        this.el.$$animation.__ended = true;
      }
    }
  }
});