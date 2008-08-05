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
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Cross browser abstractions to work with iframes.
 *
 * @deprecated: Use qx.bom.Iframe instead
 */
qx.Class.define("qx.legacy.html.Iframe",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Get the DOM window object of an iframe.
     *
     * @param vIframe {Element} DOM element of the iframe.
     * @return {DOMWindow} The DOM window object of the iframe.
     * @signature function(vIframe)
     */
    getWindow : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vIframe)
      {
        try {
          return vIframe.contentWindow;
        } catch(ex) {
          return null;
        }
      },

      "default" : function(vIframe)
      {
        try
        {
          var vDoc = qx.legacy.html.Iframe.getDocument(vIframe);
          return vDoc ? vDoc.defaultView : null;
        }
        catch(ex)
        {
          return null;
        }
      }
    }),


    /**
     * Get the DOM document object of an iframe.
     *
     * @param vIframe {Element} DOM element of the iframe.
     * @return {DOMDocument} The DOM document object of the iframe.
     * @signature function(vIframe)
     */
    getDocument : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vIframe)
      {
        try
        {
          var vWin = qx.legacy.html.Iframe.getWindow(vIframe);
          return vWin ? vWin.document : null;
        }
        catch(ex)
        {
          return null;
        }
      },

      "default" : function(vIframe)
      {
        try {
          return vIframe.contentDocument;
        } catch(ex) {
          return null;
        }
      }
    }),


    /**
     * Get the HTML body element of the iframe.
     *
     * @param vIframe {Element} DOM element of the iframe.
     * @return {Element} The DOM node of the <code>body</code> element of the iframe.
     */
    getBody : function(vIframe)
    {
      var vDoc = qx.legacy.html.Iframe.getDocument(vIframe);
      return vDoc ? vDoc.getElementsByTagName("body")[0] : null;
    }
  }
});
