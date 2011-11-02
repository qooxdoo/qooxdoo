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


qx.Bootstrap.define("qx.bom.client.CssAnimation", 
{
  statics : {
    // TODO use proper implementation
    getSupport : function() {
      return {
        "play-state" : qx.bom.client.CssAnimation.getPlayState(),
        "style" : qx.bom.client.CssAnimation.getStyle(),
        "end-event" : qx.bom.client.CssAnimation.getAnimationEnd(),
        "keyframes" : qx.bom.client.CssAnimation.getKeyFrames()
      };
    },


    // TODO use proper implementation
    getPlayState : function() {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        return "MozAnimationPlayState";
      } else if (qx.core.Environment.get("engine.name") == "webkit") {
        return "WebkitAnimationPlayState";
      }
      // return the names defined in the spec as fallback
      return "AnimationPlayState";
    },


    // TODO use proper implementation
    getStyle : function() {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        return "MozAnimation";
      } else if (qx.core.Environment.get("engine.name") == "webkit") {
        return "WebkitAnimation";
      }
      // return the names defined in the spec as fallback
      return "Animation";
    },

    // TODO use proper implementation
    getAnimationEnd : function() {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        return "animationend";
      } else if (qx.core.Environment.get("engine.name") == "webkit") {
        return "webkitAnimationEnd";
      }
      // return the names defined in the spec as fallback
      return "animationend";
    },


    // TODO use proper implementation
    getKeyFrames : function() {
      if (qx.core.Environment.get("engine.name") == "gecko") {
        return "@-moz-keyframes";
      } else if (qx.core.Environment.get("engine.name") == "webkit") {
        return "@-webkit-keyframes";
      }
      // return the names defined in the spec as fallback
      return "@keyframes";
    }
  },


  defer : function(statics) {
    qx.core.Environment.add("css.animation", statics.getSupport);
  }
});