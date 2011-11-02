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
    getSupport : function() {
      var style = qx.bom.client.CssAnimation.getStyle();
      if (style != null) {
        return {
          "style" : style,
          "play-state" : qx.bom.client.CssAnimation.getPlayState(),
          "end-event" : qx.bom.client.CssAnimation.getAnimationEnd(),
          "keyframes" : qx.bom.client.CssAnimation.getKeyFrames()
        };
      }
      return null;
    },


    getPlayState : function() {
      return qx.bom.Style.getPropertyName("AnimationPlayState");
    },


    getStyle : function() {
      return qx.bom.Style.getPropertyName("animation");
    },


    getAnimationEnd : function() {
      if (qx.core.Environment.get("engine.name") == "webkit") {
        return "webkitAnimationEnd";
      }
      // return the names defined in the spec as fallback (works for gecko)
      return "animationend";
    },


    getKeyFrames : function() {
      var prefixes = qx.bom.Style.VENDOR_PREFIXES;
      var keyFrames = [];
      for (var i=0; i < prefixes.length; i++) {
        keyFrames.push("@" + qx.lang.String.hyphenate(prefixes[i]) + "-keyframes");
      };
      keyFrames.unshift("@keyframes");

      var sheet = qx.bom.Stylesheet.createElement();
      for (var i=0; i < keyFrames.length; i++) {
        try {
          qx.bom.Stylesheet.addRule(sheet, keyFrames[i] + " name", "");
          return keyFrames[i];
        } catch (e) {}
      };

      return null;
    }
  },


  defer : function(statics) {
    qx.core.Environment.add("css.animation", statics.getSupport);
  }
});