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


qx.Bootstrap.define("qx.bom.element.AnimationHandle", 
{
  extend : Object,


  construct : function() {
    this.__playState = qx.core.Environment.get("css.animation")["playstate"];
    this.__onEnd = [];
  },


  members :
  {
    __playState : null,
    __playing : false,
    __ended : false,
    __onEnd : null,


    onEnd : function(onEnd) {
      this.__onEnd.push(onEnd);
    },


    /**
     * @internal
     */
    getOnEnd : function() {
      return this.__onEnd;
    },


    isPlaying : function() {
      return this.__playing;
    },


    isEnded : function() {
      return this.__ended;
    },

    pause : function() {
      if (this.el) {
        this.el.style[this.__playState] = "paused";
        this.el.$$animation.__playing = false;
      }
    },


    play : function() {
      if (this.el) {
        this.el.style[this.__playState] = "running";
        this.el.$$animation.__playing = true;
      }
    },


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