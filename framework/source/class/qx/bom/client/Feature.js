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
    /** {Boolean} Flag to detect if the current document is rendered in standard mode */
    STANDARD_MODE : false,

    /** {Boolean} Flag to detect if the current document is rendered in quirks mode */
    QUIRKS_MODE : false,

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

    /** {BOOLEAN} Whether the client supports the "pointer-events" CSS property */
    CSS_POINTER_EVENTS : "pointerEvents" in document.documentElement.style,


    /**
     * Internal initialize helper
     *
     * @return {void}
     */
    __init : function()
    {
      this.QUIRKS_MODE = this.__isQuirksMode();
      this.STANDARD_MODE = !this.QUIRKS_MODE;

      this.CONTENT_BOX = !qx.bom.client.Engine.MSHTML || this.STANDARD_MODE;
      this.BORDER_BOX = !this.CONTENT_BOX;

      this.SVG = document.implementation && document.implementation.hasFeature && (document.implementation.hasFeature("org.w3c.dom.svg", "1.0") || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"));
      this.VML = qx.bom.client.Engine.MSHTML;
    },


    /**
     * Whether the document is in quirks mode (e.g. non XHTML, HTML4 Strict or missing doctype)
     *
     * @return {Boolean} true when containing document is in quirks mode
     */
    __isQuirksMode : function()
    {
      if(qx.bom.client.Engine.MSHTML && qx.bom.client.Engine.VERSION >= 8) {
        return qx.bom.client.Engine.DOCUMENT_MODE === 5;
      } else {
        return document.compatMode !== "CSS1Compat";
      }
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();
  }
});
