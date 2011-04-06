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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#ignore(WebKitCSSMatrix)

************************************************************************ */

/**
 * The purpose of this class is to contain all checks about css.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Css",
{
  statics :
  {
    /**
     * Checks what box model is used in the current environemnt.
     * @return {String} It either returns "content" or "border".
     * @internal
     */
    getBoxModel : function() {
      var content = qx.bom.client.Engine.getName() !== "mshtml" ||
        !qx.bom.client.Browser.getQuirksMode() ;

      return content ? "content" : "border";
    },


    /**
     * Checks if text overflow could be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getTextOverflow : function() {
      return "textOverflow" in document.documentElement.style ||
        "OTextOverflow" in document.documentElement.style;
    },


    /**
     * Checks if a placeholder could be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getPlaceholder : function() {
      var i = document.createElement("input");
      return "placeholder" in i;
    },


    /**
     * Checks if border radius could be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getBorderRadius : function() {
      return "borderRadius" in document.documentElement.style ||
        "MozBorderRadius" in document.documentElement.style ||
        "WebkitBorderRadius" in document.documentElement.style;
    },


    /**
     * Checks if box shadow could be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getBoxShadow : function() {
      return "boxShadow" in document.documentElement.style ||
        "MozBoxShadow" in document.documentElement.style ||
        "WebkitBoxShadow" in document.documentElement.style;
    },


    /**
     * Checks if translate3d can be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     * @lint ignoreUndefined(WebKitCSSMatrix)
     */
    getTranslate3d : function()
    {
      return 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
    },


    /**
     * Checks if background gradients could be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getGradients : function() {
      var el;
      try {
        el = document.createElement("div");
      } catch (ex) {
        el = document.createElement();
      }

      var style = [
        "-webkit-gradient(linear,0% 0%,100% 100%,from(white), to(red))",
        "-moz-linear-gradient(0deg, white 0%, red 100%)",
        "-o-linear-gradient(0deg, white 0%, red 100%)",
        "linear-gradient(0deg, white 0%, red 100%)"
      ];

      for (var i=0; i < style.length; i++) {
        // try catch for IE
        try {
          el.style["background"] = style[i];
          if (el.style["background"].indexOf("gradient") != -1) {
            return true;
          }
        } catch (ex) {}
      };

      return false;
    }
  }
});
