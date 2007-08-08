/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(io_remote)

************************************************************************ */

/**
 * Cross browser abstractions to work with iframes.
 */
qx.Class.define("qx.html2.element.Iframe",
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
     * @type static
     * @param iframe {Element} DOM element of the iframe.
     * @return {Window} The DOM window object of the iframe.
     * @signature function(iframe)
     */
    getWindow : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(iframe)
      {
        try {
          return iframe.contentWindow;
        } catch(ex) {
          return null;
        }
      },

      "default" : function(iframe)
      {
        try
        {
          var doc = qx.html.Iframe.getDocument(iframe);
          return doc ? doc.defaultView : null;
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
     * @type static
     * @param iframe {Element} DOM element of the iframe.
     * @return {Document} The DOM document object of the iframe.
     * @signature function(iframe)
     */
    getDocument : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(iframe)
      {
        try
        {
          var win = qx.html.Iframe.getWindow(iframe);
          return win ? win.document : null;
        }
        catch(ex)
        {
          return null;
        }
      },

      "default" : function(iframe)
      {
        try {
          return iframe.contentDocument;
        } catch(ex) {
          return null;
        }
      }
    }),


    /**
     * Get the HTML body element of the iframe.
     *
     * @type static
     * @param iframe {Element} DOM element of the iframe.
     * @return {Element} The DOM node of the <code>body</code> element of the iframe.
     */
    getBody : function(iframe)
    {
      var doc = qx.html.Iframe.getDocument(iframe);
      return doc ? doc.getElementsByTagName("body")[0] : null;
    }
  }
});
