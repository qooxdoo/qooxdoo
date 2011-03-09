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

/* ************************************************************************

#require(qx.bom.client.Engine)

************************************************************************ */

/**
 * This class comes with all relevant information regarding
 * the client's implemented features.
 *
 * The listed constants are automatically filled on the initialization
 * phase of the class. The defaults listed in the API viewer need not
 * to be identical to the values at runtime.
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
     * @deprecated since 1.4: Plese use qx.core.Environment.get
     */
    CSS_POINTER_EVENTS : false,
    
    /** 
     * {BOOLEAN} Whether the client supports the "text-overflow" CSS property 
     * @deprecated since 1.4: Plese use qx.core.Environment.get
     */
    CSS_TEXT_OVERFLOW : false,

    /** 
     * {BOOLEAN} Whether the client supports placeholders for input fields 
     * @deprecated since 1.4: Plese use qx.core.Environment.get
     */
    PLACEHOLDER : false,

    /** 
     * {BOOLEAN} Whether the client supports the css border radius property.
     * @deprecated since 1.4: Plese use qx.core.Environment.get
     */
    CSS_BORDER_RADIUS : false,

    /** 
     * {BOOLEAN} Whether the client supports the css box shadow property.
     * @deprecated since 1.4: Plese use qx.core.Environment.get
     */    
    CSS_BOX_SHADOW : false,

    /** 
     * {BOOLEAN} Whether the client supports gradients as css background.
     * @deprecated since 1.4: Plese use qx.core.Environment.get
     */
    CSS_GRADIENTS : false,

    /** 
     * {Boolean} Flag to detect if the current document is rendered in standard mode 
     * @deprecated since 1.4: Plese use qx.core.Environment.get
     */
    STANDARD_MODE : false,

    /** 
     * {Boolean} Flag to detect if the current document is rendered in quirks mode 
     * @deprecated since 1.4: Plese use qx.core.Environment.get
     */
    QUIRKS_MODE : false,

    /**
     * {Boolean} Whether the browser supports CSS class lists
     *   http://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/
     * @deprecated since 1.4: Plese use qx.core.Environment.get
     */
    HTML5_CLASSLIST : !!(document.documentElement.classList &&
      qx.Bootstrap.getClass(document.documentElement.classList) === "DOMTokenList"
    ),

    /** 
     * {Boolean} Flag to detect if the client runs in SSL mode 
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    SSL : window.location.protocol === "https:",
    
    /** 
     * {Boolean} Flag to detect if is a Gears client 
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    GEARS : !!(window.google && window.google.gears),

    /** 
     * {Boolean} Flag to detect if the client uses the W3C box model to 
     * render the current document 
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    CONTENT_BOX : false,

    /** 
     * {Boolean} Flag to detect if the client uses the IE box model to render 
     * the current document 
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    BORDER_BOX : false,

    /** 
     * {Boolean} Flag to detect if the client supports SVG graphics 
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    SVG : false,

    /** 
     * {Boolean} Flag to detect if the client supports Canvas graphics 
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    CANVAS : !!window.CanvasRenderingContext2D,

    /** 
     * {Boolean} Flag to detect if the client supports VML graphics 
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    VML : false,

    /** 
     * {Boolean} Flag to detect if the client supports XPATH queries 
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    XPATH : !!document.evaluate,

    /** 
     * {BOOLEAN} Whether the client supports XUL 
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    XUL : false,

    /** 
     * {Boolean} Flag to detect if is an AIR client 
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    AIR : navigator.userAgent.indexOf("adobeair") !== -1,

    /** 
     * {BOOLEAN} Whether the device is touch enabled. 
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    TOUCH : false,

    /** 
     * {BOOLEAN} Whether the object type supports the 
     * <code>__count__</code> property.
     * @deprecated since 1.4: Plese use qx.core.Environemnt.get
     */
    ECMA_OBJECT_COUNT : (({}).__count__ == 0),


// TODO below

    // to HTML
    /** {BOOLEAN} Whether the client supports data urls or not. */
    DATA_URL : false,


    /**
     * Internal initialize helper
     *
     * @return {void}
     */
    __init : function()
    {
      var data = new Image();
      data.onload = data.onerror = function() {
        if (data.width == 1 && data.height == 1) {
          qx.bom.client.Feature.DATA_URL = true;
        }
      }
      data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    }
  },


  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();

    // @deprecated
    statics.CSS_GRADIENTS = qx.bom.client.Css.getGradients();    
    statics.CSS_BOX_SHADOW = qx.bom.client.Css.getBoxShadow();
    statics.CSS_BORDER_RADIUS = qx.bom.client.Css.getBorderRadius();
    statics.PLACEHOLDER = qx.bom.client.Css.getPlaceholder();
    statics.CSS_TEXT_OVERFLOW = qx.bom.client.Css.getTextOverflow();
    statics.CSS_POINTER_EVENTS = qx.bom.client.Css.getPointerEvents();
    
    statics.QUIRKS_MODE = qx.bom.client.Browser.getDocumentMode() == "quirks";
    statics.STANDARD_MODE = !statics.QUIRKS_MODE;

    statics.BORDER_BOX = qx.bom.client.Css.getBoxModel() == "border";
    statics.CONTENT_BOX = qx.bom.client.Css.getBoxModel() == "content";

    statics.SVG = qx.bom.client.Html.getSVG();
    statics.VML = qx.bom.client.Html.getVML();
    statics.XUL = qx.bom.client.Html.getXUL();
    
    statics.TOUCH = qx.bom.client.Event.getTouch();
    // TODO add deprecation warning
  }
});
