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

#module(bom)

************************************************************************ */

/**
 * Cross browser abstractions to work with iframes.
 */
qx.Class.define("qx.bom.Iframe",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Callback for some event types on iframes. Automatically route
     * these events to the {@link qx.event.handler.IframeHandler}.
     *
     * @type static
     * @internal
     * @param name {String} Name of the event
     * @param target {Element} DOM element which is the target of this event
     * @return {void}
     */
    __onevent : function(name, target)
    {
      qx.event.handler.IframeEventHandler.onevent(target, name);
    },


    /**
     * Creates an DOM element.
     *
     * Attributes may be given directly with this call. This is critical
     * for some attributes e.g. name, type, ... in many clients.
     *
     * @type static
     * @param attributes {Map} Map of attributes to apply
     * @param win {Window} Window to create document for
     * @return {Element} The created iframe node
     */
    create : function(attributes, win)
    {
      // Work on a copy to not modify given attributes map
      var attributes = attributes ? qx.lang.Object.copy(attributes) : {};
      attributes.onload = "qx.bom.Iframe.__onevent(\"load\", this)";

      return qx.bom.Element.create("iframe", attributes, win);
    },


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
          var doc = qx.legacy.html.Iframe.getDocument(iframe);
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
          var win = qx.legacy.html.Iframe.getWindow(iframe);
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
      var doc = qx.legacy.html.Iframe.getDocument(iframe);
      return doc ? doc.getElementsByTagName("body")[0] : null;
    }
  }
});
