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

/* ************************************************************************

#ignore(qx.bom.element.AnimationJs)

************************************************************************ */

/**
 * This is a simple handle, which will be returned when an animation is
 * started using the {@link qx.bom.element.Animation#animate} method. It
 * basically controls the animation.
 */
qx.Bootstrap.define("qx.bom.element.AnimationHandle",
{
  extend : qx.event.Emitter,


  construct : function() {
    var css = qx.core.Environment.get("css.animation");
    this.__playState = css && css["play-state"];
    this.__playing = true;
  },


  events: {
    /**
     * Fired when the animation started via {@link qx.bom.element.Animation} has
     * ended.
     */
    "end" : "Element"
  },


  members :
  {
    __playState : null,
    __playing : false,
    __ended : false,


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
        // in case the animation is based on JS
        if (this.animationId && qx.bom.element.AnimationJs) {
          qx.bom.element.AnimationJs.pause(this);
        }
      }
    },


    /**
     * Resumes an animation. This does not start the animation once it has ended.
     */
    play : function() {
      if (this.el) {
        this.el.style[this.__playState] = "running";
        this.el.$$animation.__playing = true;
        // in case the animation is based on JS
        if (this.i != undefined && qx.bom.element.AnimationJs) {
          qx.bom.element.AnimationJs.play(this);
        }
      }
    },


    /**
     * Stops the animation if running.
     */
    stop : function() {
      if (this.el && qx.core.Environment.get("css.animation")) {
        this.el.style[this.__playState] = "";
        this.el.style[qx.core.Environment.get("css.animation").name] = "";
        this.el.$$animation.__playing = false;
        this.el.$$animation.__ended = true;
      }
      // in case the animation is based on JS
      if (qx.bom.element.AnimationJs) {
        qx.bom.element.AnimationJs.stop(this);
      }
    }
  }
});