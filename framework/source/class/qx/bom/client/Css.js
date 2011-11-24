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
     * Returns the (possibly vendor-prefixed) name the browser uses for the 
     * <code>textOverflow</code> style property.
     * 
     * @return {String|null} textOverflow property name or <code>null</code> if
     * textOverflow is not supported.
     * @internal
     */
    getTextOverflow : function() {
      return qx.bom.Style.getPropertyName("textOverflow");
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
     * Returns the (possibly vendor-prefixed) name the browser uses for the 
     * <code>appearance</code> style property.
     * 
     * @return {String|null} appearance property name or <code>null</code> if
     * appearance is not supported.
     * @internal
     */
    getAppearance : function() {
      return qx.bom.Style.getPropertyName("appearance");
    },


    /**
     * Returns the (possibly vendor-prefixed) name the browser uses for the 
     * <code>borderRadius</code> style property.
     * 
     * @return {String|null} borderRadius property name or <code>null</code> if
     * borderRadius is not supported.
     * @internal
     */
    getBorderRadius : function() {
      return qx.bom.Style.getPropertyName("borderRadius");
    },


    /**
     * Returns the (possibly vendor-prefixed) name the browser uses for the 
     * <code>boxShadow</code> style property.
     * 
     * @return {String|null} boxShadow property name or <code>null</code> if
     * boxShadow is not supported.
     * @internal
     */
    getBoxShadow : function() {
      return qx.bom.Style.getPropertyName("boxShadow");
    },


    /**
     * Returns the (possibly vendor-prefixed) name the browser uses for the 
     * <code>borderImage</code> style property.
     * 
     * @return {String|null} borderImage property name or <code>null</code> if
     * borderImage is not supported.
     * @internal
     */
    getBorderImage : function() {
      return qx.bom.Style.getPropertyName("borderImage");
    },


    /**
     * Returns the (possibly vendor-prefixed) name the browser uses for the 
     * <code>userSelect</code> style property.
     * 
     * @return {String|null} userSelect property name or <code>null</code> if
     * userSelect is not supported.
     * @internal
     */
    getUserSelect : function() {
      return qx.bom.Style.getPropertyName("userSelect");
    },


    /**
     * Returns the (possibly vendor-prefixed) value for the 
     * <code>userSelect</code> style property that disables selection. For Gecko,
     * "-moz-none" is returned since "none" only makes the target element appear
     * as if its text could not be selected
     * 
     * @internal
     * @return {String|null} the userSelect property value that disables 
     * selection or <code>null</code> if userSelect is not supported
     */
    getUserSelectNone : function() {
      var styleProperty = qx.bom.client.Css.getUserSelect();
      if (styleProperty) {
        var el = document.createElement("span");
        el.style[styleProperty] = "-moz-none";
        return el.style[styleProperty] === "-moz-none" ? "-moz-none" : "none";
      }
      return null;
    },


    /**
     * Returns the (possibly vendor-prefixed) name the browser uses for the 
     * <code>userModify</code> style property.
     * 
     * @return {String|null} userModify property name or <code>null</code> if
     * userModify is not supported.
     * @internal
     */
    getUserModify : function() {
      return qx.bom.Style.getPropertyName("userModify");
    },
    
    /**
     * Returns the vendor-specific name of the <code>float</code> style property 
     * 
     * @return {String|null} <code>cssFloat</code> for standards-compliant 
     * browsers, <code>styleFloat</code> for legacy IEs, <code>null</code> if 
     * the client supports neither property.
     * @internal
     */
    getFloat : function() {
      var style = document.documentElement.style;
      return style.cssFloat !== undefined ? "cssFloat" : 
        style.styleFloat !== undefined ? "styleFloat" : null;
    },


    /**
     * Checks if translate3d can be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     * @lint ignoreUndefined(WebKitCSSMatrix)
     */
    getTranslate3d : function() {
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
        "-webkit-linear-gradient(left, white, black)",
        "-moz-linear-gradient(0deg, white 0%, red 100%)",
        "-o-linear-gradient(0deg, white 0%, red 100%)",
        "-ms-linear-gradient(0deg, white 0%, red 100%)",
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
    },


    /**
     * Returns the (possibly vendor-prefixed) name this client uses for 
     * <code>linear-background</code>.
     * http://dev.w3.org/csswg/css3-images/#linear-gradients
     * 
     * @return {String|null} Prefixed linear-gradient name or <code>null</code>
     * if gradients are not supported
     */
    getLinearGradient : function()
    {
      var value = "linear-gradient(0deg, #fff, #000)";
      var style = qx.bom.Style.getPrefixedValue("background", value);
      if (!style) {
        return null;
      }
      var match = /(.*?)\(/.exec(style);
      return match ? match[1] : null;
    },


    /**
     * Checks if rgba colors can be used:
     * http://www.w3.org/TR/2010/PR-css3-color-20101028/#rgba-color
     *
     * @return {Boolean} <code>true</code>, if rgba colors are supported.
     */
    getRgba : function() {
      var el;
      try {
        el = document.createElement("div");
      } catch (ex) {
        el = document.createElement();
      }

      // try catch for IE
      try {
        el.style["color"] = "rgba(1, 2, 3, 0.5)";
        if (el.style["color"].indexOf("rgba") != -1) {
          return true;
        }
      } catch (ex) {}

      return false;
    },
    
    
    /**
     * Returns the (possibly vendor-prefixed) name the browser uses for the 
     * <code>boxSizing</code> style property.
     * 
     * @return {String|null} boxSizing property name or <code>null</code> if
     * boxSizing is not supported.
     * @internal
     */
    getBoxSizing : function() {
      return qx.bom.Style.getPropertyName("boxSizing");
    },


    /**
     * Returns the browser-specific name used for the <code>display</code> style
     * property's <code>inline-block</code> value.
     * 
     * @internal
     * @return {String|null} 
     */
    getInlineBlock : function() {
      var el = document.createElement("span");
      el.style.display = "inline-block";
      if (el.style.display == "inline-block") {
        return "inline-block";
      }
      el.style.display = "-moz-inline-box";
      if (el.style.display !== "-moz-inline-box") {
        return "-moz-inline-box";
      }
      return null;
    },
    
    
    /**
     * Checks if CSS opacity is supported
     * 
     * @internal
     * @return {Boolean} <code>true</code> if opacity is supported
     */
    getOpacity : function() {
      return (typeof document.documentElement.style.opacity == "string");
    },
    
    
    /**
     * Checks if the overflowX and overflowY style properties are supported
     * 
     * @internal
     * @return {Boolean} <code>true</code> if overflow-x and overflow-y can be
     * used
     */
    getOverflowXY : function() {
      return (typeof document.documentElement.style.overflowX == "string") &&
        (typeof document.documentElement.style.overflowY == "string");
    }
  },



  defer : function(statics) {
    qx.core.Environment.add("css.textoverflow", statics.getTextOverflow);
    qx.core.Environment.add("css.placeholder", statics.getPlaceholder);
    qx.core.Environment.add("css.borderradius", statics.getBorderRadius);
    qx.core.Environment.add("css.boxshadow", statics.getBoxShadow);
    qx.core.Environment.add("css.gradients", statics.getGradients);
    qx.core.Environment.add("css.gradients.linear", statics.getLinearGradient);
    qx.core.Environment.add("css.boxmodel", statics.getBoxModel);
    qx.core.Environment.add("css.rgba", statics.getRgba);
    qx.core.Environment.add("css.borderimage", statics.getBorderImage);
    qx.core.Environment.add("css.usermodify", statics.getUserModify);
    qx.core.Environment.add("css.userselect", statics.getUserSelect);
    qx.core.Environment.add("css.userselect.none", statics.getUserSelectNone);
    qx.core.Environment.add("css.appearance", statics.getAppearance);
    qx.core.Environment.add("css.float", statics.getFloat);
    qx.core.Environment.add("css.boxsizing", statics.getBoxSizing);
    qx.core.Environment.add("css.inlineblock", statics.getInlineBlock);
    qx.core.Environment.add("css.opacity", statics.getOpacity);
    qx.core.Environment.add("css.overflowxy", statics.getOverflowXY);
  }
});
