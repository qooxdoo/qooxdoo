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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#require(qx.event.handler.Iframe)

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
     * Creates an DOM element.
     *
     * Attributes may be given directly with this call. This is critical
     * for some attributes e.g. name, type, ... in many clients.
     *
     * @param attributes {Map} Map of attributes to apply
     * @param win {Window} Window to create the element for
     * @return {Element} The created iframe node
     */
    create : function(attributes, win)
    {
      // Work on a copy to not modify given attributes map
      var attributes = attributes ? qx.lang.Object.copy(attributes) : {};
      attributes.onload = "qx.event.handler.Iframe.onevent(this)";

      attributes.frameBorder = "0";
      attributes.frameSpacing = "0";

      attributes.marginWidth = "0";
      attributes.marginHeight = "0";

      attributes.hspace = "0";
      attributes.vspace = "0";

      attributes.border = "0";
      attributes.allowTransparency = "true";

      return qx.bom.Element.create("iframe", attributes, win);
    },


    /**
     * Get the DOM window object of an iframe.
     *
     * @param iframe {Element} DOM element of the iframe.
     * @return {Window} The DOM window object of the iframe.
     * @signature function(iframe)
     */
    getWindow : qx.core.Variant.select("qx.client",
    {
      "mshtml|gecko" : function(iframe)
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
          var doc = this.getDocument(iframe);
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
          var win = this.getWindow(iframe);
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
     * @param iframe {Element} DOM element of the iframe.
     * @return {Element} The DOM node of the <code>body</code> element of the iframe.
     */
    getBody : function(iframe)
    {
      var doc = this.getDocument(iframe);
      return doc ? doc.getElementsByTagName("body")[0] : null;
    },


    /**
     * Sets iframe's source attribute to given value
     *
     * @param iframe {Element} DOM element of the iframe.
     * @param source {String} URL to be set.
     * @signature function(iframe, source)
     */
    setSource : function(iframe, source)
    {
      try
      {
        // the guru says ...
        // it is better to use 'replace' than 'src'-attribute, since 'replace' does not interfer
        // with the history (which is taken care of by the history manager), but there
        // has to be a loaded document
        if (this.getWindow(iframe))
        {
          /*
          Some gecko users might have an exception here:
            Exception... "Component returned failure code: 0x805e000a
            [nsIDOMLocation.replace]"  nsresult: "0x805e000a (<unknown>)"
          */
          try
          {
            this.getWindow(iframe).location.replace(source);
          }
          catch(ex)
          {
            iframe.src = source;
          }
        }
        else
        {
          iframe.src = source;
        }
      }
      catch(ex) {
        qx.log.Logger.warn("Iframe source could not be set!");
      }
    },


    /**
     * Returns the current (served) URL inside the iframe
     *
     * @param iframe {Element} DOM element of the iframe.
     * @return {String} Returns the location href or null (if a query is not possible/allowed)
     */
    queryCurrentUrl : function(iframe)
    {
      var doc = this.getDocument(iframe);

      try
      {
        if (doc && doc.location) {
          return doc.location.href;
        }
      }
      catch(ex) {};

      return null;
    }

  }
});
