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
    /** {BOOLEAN} Whether the client supports the "pointer-events" CSS property */
    CSS_POINTER_EVENTS : false,
    
    /** {BOOLEAN} Whether the client supports the "text-overflow" CSS property */
    CSS_TEXT_OVERFLOW : false,

    /** {BOOLEAN} Whether the client supports placeholders for input fields */
    PLACEHOLDER : false,

    /** {BOOLEAN} Whether the client supports the css border radius property.*/
    CSS_BORDER_RADIUS : false,

    /** {BOOLEAN} Whether the client supports the css box shadow property.*/    
    CSS_BOX_SHADOW : false,

    /** {BOOLEAN} Whether the client supports gradients as css background.*/
    CSS_GRADIENTS : false,

    /** {Boolean} Flag to detect if the current document is rendered in standard mode */
    STANDARD_MODE : false,

    /** {Boolean} Flag to detect if the current document is rendered in quirks mode */
    QUIRKS_MODE : false,



// TODO below

    /** {Boolean} Flag to detect if the client uses the W3C box model to render the current document */
    CONTENT_BOX : false,

    /** {Boolean} Flag to detect if the client uses the IE box model to render the current document */
    BORDER_BOX : false,



    /** {Boolean} Flag to detect if the client supports SVG graphics */
    SVG : false,

    /** {Boolean} Flag to detect if the client supports Canvas graphics */
    CANVAS : !!window.CanvasRenderingContext2D,

    /** {Boolean} Flag to detect if the client supports VML graphics */
    VML : false,



    /** {Boolean} Flag to detect if the client supports XPATH queries */
    XPATH : !!document.evaluate,



    /** {Boolean} Flag to detect if is an AIR client */
    AIR : navigator.userAgent.indexOf("adobeair") !== -1,



    /** {Boolean} Flag to detect if is a Gears client */
    GEARS : !!(window.google && window.google.gears),



    /** {Boolean} Flag to detect if the client runs in SSL mode */
    SSL : window.location.protocol === "https:",



    /** {BOOLEAN} Whether the object type supports the <code>__count__</code> property */
    ECMA_OBJECT_COUNT : (({}).__count__ == 0),

    /** {BOOLEAN} Whether the client supports XUL */
    XUL : false,



    /**
     * {Boolean} Whether the browser supports CSS class lists
     *   http://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/
     */
    HTML5_CLASSLIST : !!(document.documentElement.classList &&
      qx.Bootstrap.getClass(document.documentElement.classList) === "DOMTokenList"
    ),



    /** {BOOLEAN} Whether the device is touch enabled. */
    TOUCH : ("ontouchstart" in window),


    /** {BOOLEAN} Whether the client supports data urls or not. */
    DATA_URL : false,


    /**
     * Internal initialize helper
     *
     * @return {void}
     */
    __init : function()
    {
      this.CONTENT_BOX = qx.core.Environment.get("engine.name") != "mshtml" || this.STANDARD_MODE;
      this.BORDER_BOX = !this.CONTENT_BOX;

      this.SVG = document.implementation && document.implementation.hasFeature &&
        (document.implementation.hasFeature("org.w3c.dom.svg", "1.0") ||
        document.implementation.hasFeature(
          "http://www.w3.org/TR/SVG11/feature#BasicStructure",
          "1.1"
        )
      );
      this.VML = qx.core.Environment.get("engine.name") == "mshtml";

      try {
        document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
        this.XUL = true;
      } catch (e) {
        this.XUL = false;
      }

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
    statics.CSS_GRADIENTS = qx.bom.client.CssFeature.getGradients();    
    statics.CSS_BOX_SHADOW = qx.bom.client.CssFeature.getBoxShadow();
    statics.CSS_BORDER_RADIUS = qx.bom.client.CssFeature.getBorderRadius();
    statics.PLACEHOLDER = qx.bom.client.CssFeature.getPlaceholder();
    statics.CSS_TEXT_OVERFLOW = qx.bom.client.CssFeature.getTextOverflow();
    statics.CSS_POINTER_EVENTS = qx.bom.client.CssFeature.getPointerEvents();
    
    statics.QUIRKS_MODE = qx.bom.client.Browser.getDocumentMode() == "quirks";
    statics.STANDARD_MODE = !statics.QUIRKS_MODE;


    // TODO add deprecation warning
  }
});
