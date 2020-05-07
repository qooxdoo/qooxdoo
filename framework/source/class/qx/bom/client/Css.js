/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The purpose of this class is to contain all checks about css.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 * @ignore(WebKitCSSMatrix)
 * @require(qx.bom.Style)
 */
qx.Bootstrap.define("qx.bom.client.Css",
{
  statics :
  {
    __WEBKIT_LEGACY_GRADIENT : null,

    /**
     * Checks what box model is used in the current environment.
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
      if (qx.core.Environment.get("engine.name") === "mshtml") {
        return false;
      }
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
     * Returns the type of syntax this client supports for its CSS border-image
     * implementation. Some browsers do not support the "fill" keyword defined
     * in the W3C draft (http://www.w3.org/TR/css3-background/) and will not
     * show the border image if it's set. Others follow the standard closely and
     * will omit the center image if "fill" is not set.
     *
     * @return {Boolean|null} <code>true</code> if the standard syntax is supported.
     * <code>null</code> if the supported syntax could not be detected.
     * @internal
     */
    getBorderImageSyntax : function() {
      var styleName = qx.bom.client.Css.getBorderImage();
      if (!styleName) {
        return null;
      }

      var el = document.createElement("div");

      if (styleName === "borderImage") {
        // unprefixed implementation: check individual properties
        el.style[styleName] = 'url("foo.png") 4 4 4 4 fill stretch';
        if (el.style.borderImageSource.indexOf("foo.png") >= 0 &&
            el.style.borderImageSlice.indexOf("4 fill") >= 0 &&
            el.style.borderImageRepeat.indexOf("stretch") >= 0)
        {
          return true;
        }
      }
      else {
        // prefixed implementation, assume no support for "fill"
        el.style[styleName] = 'url("foo.png") 4 4 4 4 stretch';
        // serialized value is unreliable, so just a simple check
        if (el.style[styleName].indexOf("foo.png") >= 0) {
          return false;
        }
      }

      // unable to determine syntax
      return null;
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
     * Returns the (possibly vendor-prefixed) name this client uses for
     * <code>linear-gradient</code>.
     * http://dev.w3.org/csswg/css3-images/#linear-gradients
     *
     * @return {String|null} Prefixed linear-gradient name or <code>null</code>
     * if linear gradients are not supported
     * @internal
     */
    getLinearGradient : function()
    {
      qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT = false;
      var value = "linear-gradient(0deg, #fff, #000)";
      var el = document.createElement("div");
      var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value);

      if (!style) {
        //try old WebKit syntax (versions 528 - 534.16)
        value = "-webkit-gradient(linear,0% 0%,100% 100%,from(white), to(red))";
        var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value, false);
        if (style) {
          qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT = true;
        }
      }

      // not supported
      if (!style) {
        return null;
      }

      var match = /(.*?)\(/.exec(style);
      return match ? match[1] : null;
    },


    /**
     * Returns the (possibly vendor-prefixed) name this client uses for
     * <code>radial-gradient</code>.
     *
     * @return {String|null} Prefixed radial-gradient name or <code>null</code>
     * if radial gradients are not supported
     * @internal
     */
    getRadialGradient : function()
    {
      var value = "radial-gradient(0px 0px, cover, red 50%, blue 100%)";
      var el = document.createElement("div");
      var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value);
      if (!style) {
        return null;
      }
      var match = /(.*?)\(/.exec(style);
      return match ? match[1] : null;
    },


    /**
     * Checks if **only** the old WebKit (version < 534.16) syntax for
     * linear gradients is supported, e.g.
     * <code>linear-gradient(0deg, #fff, #000)</code>
     *
     * @return {Boolean} <code>true</code> if the legacy syntax must be used
     * @internal
     */
    getLegacyWebkitGradient : function()
    {
      if (qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT === null) {
        qx.bom.client.Css.getLinearGradient();
      }
      return qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT;
    },

    /**
     * Checks if rgba colors can be used:
     * http://www.w3.org/TR/2010/PR-css3-color-20101028/#rgba-color
     *
     * @return {Boolean} <code>true</code>, if rgba colors are supported.
     * @internal
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
     * Checks if CSS texShadow is supported
     *
     * @internal
     * @return {Boolean} <code>true</code> if textShadow is supported
     */
    getTextShadow : function()
    {
      return !!qx.bom.Style.getPropertyName("textShadow");
    },


    /**
     * Checks if the Alpha Image Loader must be used to display transparent PNGs.
     *
     * @return {Boolean} <code>true</code> if the Alpha Image Loader is required
     */
    getAlphaImageLoaderNeeded : function()
    {
      return qx.bom.client.Engine.getName() == "mshtml" &&
             qx.bom.client.Browser.getDocumentMode() < 9;
    },


    /**
     * Checks if pointer events are available.
     *
     * @internal
     * @return {Boolean} <code>true</code> if pointer events are supported.
     */
    getPointerEvents : function() {
      var el = document.documentElement;
      // Check if browser reports that pointerEvents is a known style property
      if ("pointerEvents" in el.style) {
        // The property is defined in Opera and IE9 but setting it has no effect
        var initial = el.style.pointerEvents;
        el.style.pointerEvents = "auto";
        // don't assume support if a nonsensical value isn't ignored
        el.style.pointerEvents = "foo";
        var supported = el.style.pointerEvents == "auto";
        el.style.pointerEvents = initial;

        return supported;

      }
      return false;
    },


    /**
     * Returns which Flexbox syntax is supported by the browser.
     * <code>display: box;</code> old 2009 version of Flexbox.
     * <code>display: flexbox;</code> tweener phase in 2011.
     * <code>display: flex;</code> current specification.
     * @internal
     * @return {String} <code>flex</code>,<code>flexbox</code>,<code>box</code> or <code>null</code>
     */
    getFlexboxSyntax : function() {
      var detectedSyntax = null;

      var detector = document.createElement("detect");
      var flexSyntax = [{
        value: "flex",
        syntax: "flex"
      }, {
        value: "-ms-flexbox",
        syntax: "flexbox"
      }, {
        value: "-webkit-flex",
        syntax: "flex"
      }];

      for (var i = 0; i < flexSyntax.length; i++) {
        // old IEs will throw an "Invalid argument" exception here
        try {
          detector.style.display = flexSyntax[i].value;
        } catch(ex) {
          return null;
        }
        if (detector.style.display === flexSyntax[i].value) {
          detectedSyntax = flexSyntax[i].syntax;
          break;
        }
      }

      detector = null;

      return detectedSyntax;
    }
  },



  defer : function(statics) {
    qx.core.Environment.add("css.textoverflow", statics.getTextOverflow);
    qx.core.Environment.add("css.placeholder", statics.getPlaceholder);
    qx.core.Environment.add("css.borderradius", statics.getBorderRadius);
    qx.core.Environment.add("css.boxshadow", statics.getBoxShadow);
    qx.core.Environment.add("css.gradient.linear", statics.getLinearGradient);
    qx.core.Environment.add("css.gradient.radial", statics.getRadialGradient);
    qx.core.Environment.add("css.gradient.legacywebkit", statics.getLegacyWebkitGradient);
    qx.core.Environment.add("css.boxmodel", statics.getBoxModel);
    qx.core.Environment.add("css.rgba", statics.getRgba);
    qx.core.Environment.add("css.borderimage", statics.getBorderImage);
    qx.core.Environment.add("css.borderimage.standardsyntax", statics.getBorderImageSyntax);
    qx.core.Environment.add("css.usermodify", statics.getUserModify);
    qx.core.Environment.add("css.userselect", statics.getUserSelect);
    qx.core.Environment.add("css.userselect.none", statics.getUserSelectNone);
    qx.core.Environment.add("css.appearance", statics.getAppearance);
    qx.core.Environment.add("css.float", statics.getFloat);
    qx.core.Environment.add("css.boxsizing", statics.getBoxSizing);
    qx.core.Environment.add("css.inlineblock", statics.getInlineBlock);
    qx.core.Environment.add("css.opacity", statics.getOpacity);
    qx.core.Environment.add("css.textShadow", statics.getTextShadow);
    qx.core.Environment.add("css.alphaimageloaderneeded", statics.getAlphaImageLoaderNeeded);
    qx.core.Environment.add("css.pointerevents", statics.getPointerEvents);
    qx.core.Environment.add("css.flexboxSyntax", statics.getFlexboxSyntax);
  }
});
