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

qx.Clazz.define("qx.html.Iframe",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * TODOC
     *
     * @type static
     * @param vIframe {var} TODOC
     * @return {void}
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
          var vDoc = qx.html.Iframe.getDocument(vIframe);
          return vDoc ? vDoc.defaultView : null;
        }
        catch(ex)
        {
          return null;
        }
      }
    }),


    /**
     * TODOC
     *
     * @type static
     * @param vIframe {var} TODOC
     * @return {void}
     */
    getDocument : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vIframe)
      {
        try
        {
          var vWin = qx.html.Iframe.getWindow(vIframe);
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
     * TODOC
     *
     * @type static
     * @param vIframe {var} TODOC
     * @return {var} TODOC
     */
    getBody : function(vIframe)
    {
      var vDoc = qx.html.Iframe.getDocument(vIframe);
      return vDoc ? vDoc.getElementsByTagName("body")[0] : null;
    }
  }
});