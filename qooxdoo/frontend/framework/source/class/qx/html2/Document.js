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

   ======================================================================

   This class contains code based on the following work:

   * Yahoo! UI Library
       http://developer.yahoo.com/yui
       Version 2.2.0

     Copyright:
       (c) 2007, Yahoo! Inc.

     License:
       BSD: http://developer.yahoo.com/yui/license.txt


************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

/**
 * Includes library functions to work with the current document.
 */
qx.Class.define("qx.html2.Document",
{
  statics :
  {
    /**
     * Whether the document is in quirks mode (e.g. non XHTML, HTML4 Strict or missing doctype)
     *
     * @type static
     * @param win {Window?window} The window to query
     * @return {Boolean} true when containing document is in quirks mode
     */
    isQuirksMode : function(win) {
      return (win||window).document.compatMode !== "CSS1Compat";
    },
    

    /**
     * Whether the document is in quirks mode (e.g. non XHTML, HTML4 Strict or missing doctype)
     *
     * @type static
     * @param win {Window?window} The window to query
     * @return {Boolean} true when containing document is in quirks mode
     */
    isStandardMode : function(win) {
      return (win||window).document.compatMode === "CSS1Compat";
    },
    
    
    /**
     * Returns the width of the document.
     *
     * MSHTML in standard mode stores the properitary <code>scrollWidth</code> property
     * on the <code>documentElement</code>, but in quirks mode on the body element. All
     * other known browsers simply store the correct value on the <code>documentElement</code>.
     *
     * Note: If the viewport is wider than the document the viewport width is returned.
     *
     * @type static
     * @param win {Window?window} The window to query
     * @return {Integer} The width of the actual document (which includes the body and its margin).
     */
    getWidth : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(win)
      {
        var doc = (win||window).document;
        var view = qx.html2.Viewport.getWidth(win);
        return Math.max(doc.documentElement.scrollWidth||doc.body.scrollWidth), view);
      },
      
      "default" : function(win)
      {
        var doc = (win||window).document;
        var view = qx.html2.Viewport.getWidth(win);
        return Math.max(doc.documentElement.scrollWidth, view);
      }
    },


    /**
     * Returns the height of the document.
     *
     * MSHTML in standard mode stores the properitary <code>scrollHeight</code> property
     * on the <code>documentElement</code>, but in quirks mode on the body element. All
     * other known browsers simply store the correct value on the <code>documentElement</code>.
     *
     * Note: If the viewport is higher than the document the viewport height is returned.
     *     
     * @type static
     * @param win {Window?window} The window to query
     * @return {Integer} The height of the actual document (which includes the body and its margin).
     */
    getHeight :  qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(win)
      {
        var doc = (win||window).document;
        var view = qx.html2.Viewport.getHeight(win);
        return Math.max(doc.documentElement.scrollHeight||doc.body.scrollHeight), view);
      },
      
      "default" : function(win)
      {
        var doc = (win||window).document;
        var view = qx.html2.Viewport.getHeight(win);
        return Math.max(doc.documentElement.scrollHeight, view);
      }
    }      
  }
});
