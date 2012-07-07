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

/**
 * Responsible for checking all relevant animation properties.
 *
 * Spec: http://www.w3.org/TR/css3-animations/
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.CssAnimation",
{
  statics : {
    /**
     * Main check method which returns an object if CSS animations are
     * supported. This object contains all necessary keys to work with CSS
     * animations.
     * <ul>
     *  <li><code>name</code> The name of the css animation style</li>
     *  <li><code>play-state</code> The name of the play-state style</li>
     *  <li><code>end-event</code> The name of the end event</li>
     *  <li><code>keyframes</code> The name of the keyframes selector.</li>
     * </ul>
     *
     * @internal
     * @return {Object|null} The described object or null, if animations are
     *   not supported.
     */
    getSupport : function() {
      var name = qx.bom.client.CssAnimation.getName();
      if (name != null) {
        return {
          "name" : name,
          "play-state" : qx.bom.client.CssAnimation.getPlayState(),
          "end-event" : qx.bom.client.CssAnimation.getAnimationEnd(),
          "keyframes" : qx.bom.client.CssAnimation.getKeyFrames()
        };
      }
      return null;
    },


    /**
     * Checks for the 'animation-play-state' CSS style.
     * @internal
     * @return {String|null} The name of the style or null, if the style is
     *   not supported.
     */
    getPlayState : function() {
      return qx.bom.Style.getPropertyName("AnimationPlayState");
    },


    /**
     * Checks for the style name used for animations.
     * @internal
     * @return {String|null} The name of the style or null, if the style is
     *   not supported.
     */
    getName : function() {
      return qx.bom.Style.getPropertyName("animation");
    },


    /**
     * Checks for the event name of animation end.
     * @internal
     * @return {String} The name of the event.
     */
    getAnimationEnd : function() {
      var mapping = {
        "msAnimation" : "MSAnimationEnd",
        "WebkitAnimation" : "webkitAnimationEnd",
        "MozAnimation" : "animationend",
        "OAnimation" : "oAnimationEnd",
        "animation" : "animationend"
      }

      return mapping[this.getName()];
    },


    /**
     * Checks what selector should be used to add keyframes to stylesheets.
     * @internal
     * @return {String|null} The name of the selector or null, if the selector
     *   is not supported.
     */
    getKeyFrames : function() {
      var prefixes = qx.bom.Style.VENDOR_PREFIXES;
      var keyFrames = [];
      for (var i=0; i < prefixes.length; i++) {
        var key = "@" + qx.lang.String.hyphenate(prefixes[i]) + "-keyframes";
        // special treatment for IE10
        if (key == "@ms-keyframes") {
          key = "@-ms-keyframes";
        }
        keyFrames.push(key);
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