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
 * This class comes with all relevant informations regarding
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
    CANVAS : false,

    /** {Boolean} Flag to detect if the client supports VML graphics */
    VML : false,

    /** {Boolean} Flag to detect if the client supports XPATH queries */
    XPATH : false,


    /**
     * Internal initialize helper
     *
     * @return {void}
     */
    __init : function()
    {
      this.STANDARD_MODE = document.compatMode === "CSS1Compat";
      this.QUIRKS_MODE = !this.STANDARD_MODE;

      this.CONTENT_BOX = !qx.bom.client.Engine.MSHTML || this.STANDARD_MODE;
      this.BORDER_BOX = !this.CONTENT_BOX;

      this.SVG = document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("org.w3c.dom.svg", "1.0");
      this.CANVAS = !!window.CanvasRenderingContext2D;
      this.VML = qx.bom.client.Engine.MSHTML;

      this.AIR = navigator.userAgent.indexOf("adobeair") !== -1;
      this.GEARS = !!(window.google && window.google.gears);

      this.XPATH = !!document.evaluate;
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
