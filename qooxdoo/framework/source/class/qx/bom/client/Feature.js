/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class comes with all relevant information regarding
 * the client's implemented features.
 *
 * @deprecated since 1.4: Please use qx.core.Environment to access all feature
 * checks.
 */
qx.Bootstrap.define("qx.bom.client.Feature",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * {BOOLEAN} Whether the client supports the "pointer-events" CSS property
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    CSS_POINTER_EVENTS : false,

    /**
     * {BOOLEAN} Whether the client supports the "text-overflow" CSS property
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    CSS_TEXT_OVERFLOW : false,

    /**
     * {BOOLEAN} Whether the client supports placeholders for input fields
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    PLACEHOLDER : false,

    /**
     * {Boolean} Flag to detect if the current document is rendered in standard mode
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    STANDARD_MODE : false,

    /**
     * {Boolean} Flag to detect if the current document is rendered in quirks mode
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    QUIRKS_MODE : false,

    /**
     * {Boolean} Whether the browser supports CSS class lists
     *   http://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    HTML5_CLASSLIST : !!(document.documentElement.classList &&
      qx.Bootstrap.getClass(document.documentElement.classList) === "DOMTokenList"
    ),

    /**
     * {Boolean} Flag to detect if the client runs in SSL mode
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    SSL : window.location.protocol === "https:",

    /**
     * {Boolean} Flag to detect if is a Gears client
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    GEARS : !!(window.google && window.google.gears),

    /**
     * {Boolean} Flag to detect if the client uses the W3C box model to
     * render the current document
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    CONTENT_BOX : false,

    /**
     * {Boolean} Flag to detect if the client uses the IE box model to render
     * the current document
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    BORDER_BOX : false,

    /**
     * {Boolean} Flag to detect if the client supports SVG graphics
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    SVG : false,

    /**
     * {Boolean} Flag to detect if the client supports Canvas graphics
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    CANVAS : !!window.CanvasRenderingContext2D,

    /**
     * {Boolean} Flag to detect if the client supports VML graphics
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    VML : false,

    /**
     * {Boolean} Flag to detect if the client supports XPATH queries
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    XPATH : !!document.evaluate,

    /**
     * {BOOLEAN} Whether the client supports XUL
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    XUL : false,

    /**
     * {Boolean} Flag to detect if is an AIR client
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    AIR : navigator.userAgent.indexOf("adobeair") !== -1,

    /**
     * {BOOLEAN} Whether the device is touch enabled.
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    TOUCH : false,

    /**
     * {BOOLEAN} Whether the object type supports the
     * <code>__count__</code> property.
     * @deprecated since 1.4: Please use qx.core.Environment.get
     */
    ECMA_OBJECT_COUNT : (({}).__count__ == 0)
  },


  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */
  /**
   * @lint ignoreUndefined(qxvariants)
   */
  defer : function(statics) {
    // @deprecated since 1.4 (this entire defer block)
    statics.PLACEHOLDER = qx.bom.client.Css.getPlaceholder();
    statics.CSS_TEXT_OVERFLOW = qx.bom.client.Css.getTextOverflow();
    statics.CSS_POINTER_EVENTS = qx.bom.client.Event.getPointer();

    statics.QUIRKS_MODE = qx.bom.client.Browser.getQuirksMode();
    statics.STANDARD_MODE = !statics.QUIRKS_MODE;

    statics.BORDER_BOX = qx.bom.client.Css.getBoxModel() == "border";
    statics.CONTENT_BOX = qx.bom.client.Css.getBoxModel() == "content";

    statics.SVG = qx.bom.client.Html.getSvg();
    statics.VML = qx.bom.client.Html.getVml();
    statics.XUL = qx.bom.client.Html.getXul();

    statics.TOUCH = qx.bom.client.Event.getTouch();

    // only when debug is on (@deprecated)
    if (qx.Bootstrap.DEBUG) {
      // add @deprecation warnings
      var keys = ["STANDARD_MODE","QUIRKS_MODE","CONTENT_BOX","BORDER_BOX", "SVG",
        "CANVAS", "VML", "XPATH", "AIR", "GEARS", "SSL", "ECMA_OBJECT_COUNT",
        "CSS_POINTER_EVENTS", "XUL", "CSS_TEXT_OVERFLOW", "HTML5_CLASSLIST",
        "TOUCH", "PLACEHOLDER"];
      for (var i = 0; i < keys.length; i++) {
        // check if __defineGetter__ is available
        if (statics.__defineGetter__) {
          var constantValue = statics[keys[i]];
          statics.__defineGetter__(keys[i], qx.Bootstrap.bind(function(key, c) {
            var warning =
              "The constant '"+ key + "' of '" + statics.classname + "'is deprecated: " +
              "Please check the API documentation of qx.core.Environment."
            if (qx.dev && qx.dev.StackTrace) {
              warning += "\nTrace:" + qx.dev.StackTrace.getStackTrace().join("\n")
            }
            qx.Bootstrap.warn(warning);
            return c;
          }, statics, keys[i], constantValue));
        }
      }
    }
  }
});