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
 * Includes library functions to work with the client's viewport (window).
 */
qx.Class.define("qx.html2.Viewport",
{
  statics :
  {
    /**
     * Returns the current width of the viewport (excluding a eventually visible scrollbar).
     *
     * <code>clientWidth</code> is the inner width of an element in pixels. It includes padding 
     * but not the vertical scrollbar (if present, if rendered), border or margin.
     *
     * <code>innerWidth</code> is not useable as defined by the standard as it includes the scrollbars
     * which is not the indented behavior of this method. We can decrement the size by the scrollbar
     * size but there are easier possibilities to work around this.
     *
     * Safari 2 do not correctly implement clientWidth on documentElement, but innerWidth works 
     * there. Interesting is that in this version, webkit do not correctly implement 
     * <code>innerWidth</code>, too. It calculates the size excluding the scroll bars and this 
     * differs from the behavior of Opera & Mozilla - but this is exactly what we want to have
     * in this case.
     *
     * @type static
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} The width of the viewable area of the page (excludes scrollbars).
     */
    getWidth : qx.core.Variant.select("qx.client", 
    {
      // clientWidth on documentElement seems to be buggy in Opera, at least width 9.2x
      "opera" : function(win) {
        return (win||window).document.body.clientWidth;
      },
      
      // Older webkits do not implement clientWidth, fallback to innerWidth there
      "webkit" : function(win) 
      {
        win = win||window; 
        return win.document.documentElement.clientWidth || win.innerWidth;
      },
      
      // MSHTML stores the property on documentElement in standardmode, otherwise on the body
      "mshtml" : function(win) 
      {
        var doc = (win||window).document;
        return doc.documentElement.clientWidth || doc.body.clientWidth;
      },
      
      // Ideal implementation. Currently only supported by gecko based clients
      "default" : function(win) {
        return (win||window).document.documentElement.clientWidth;
      }
    }),
    

    /**
     * Returns the current height of the viewport (excluding a eventually visible scrollbar).
     *
     * <code>clientHeight</code> is the inner height of an element in pixels. It includes padding 
     * but not the vertical scrollbar (if present, if rendered), border or margin.
     *
     * <code>innerHeight</code> is not useable as defined by the standard as it includes the scrollbars
     * which is not the indented behavior of this method. We can decrement the size by the scrollbar
     * size but there are easier possibilities to work around this.
     *
     * Safari 2 do not correctly implement clientHeight on documentElement, but innerHeight works 
     * there. Interesting is that in this version, webkit do not correctly implement 
     * <code>innerHeight</code>, too. It calculates the size excluding the scroll bars and this 
     * differs from the behavior of Opera & Mozilla - but this is exactly what we want to have
     * in this case.
     *
     * @type static
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} The Height of the viewable area of the page (excludes scrollbars).
     */
    getHeight : qx.core.Variant.select("qx.client", 
    {
      // clientHeight on documentElement seems to be buggy in Opera, at least Height 9.2x
      "opera" : function(win) {
        return (win||window).document.body.clientHeight;
      },

      // Older webkits do not implement clientHeight, fallback to innerHeight there
      "webkit" : function(win) 
      {
        win = win||window;
        return win.document.documentElement.clientHeight || win.innerHeight;
      },

      // MSHTML stores the property on documentElement in standardmode, otherwise on the body
      "mshtml" : function(win) 
      {
        var doc = (win||window).document;
        return doc.documentElement.clientHeight || doc.body.clientHeight;
      },

      // Ideal implementation. Currently only supported by gecko based clients
      "default" : function(win) {
        return (win||window).document.documentElement.clientHeight;
      }
    }),


    /**
     * Returns the scroll position of the viewport
     *
     * All clients except MSHTML supports the non-standard property <code>pageXOffset</code>.
     * As this is easier to evaluate we prefer this property over <code>scrollLeft</code>.
     *
     * For MSHTML the access method differs between standard and quirks mode;
     * as this can differ from document to document this test must be made on
     * each query.
     *
     * @type static
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} Scroll position from left edge, always a positive integer
     */
    getScrollLeft : qx.core.Variant.select("qx.client", 
    {
      "mshtml" : function(win) 
      {
        var doc = (win||window).document;
        return doc.documentElement.scrollLeft || doc.body.scrollLeft;
      },
      
      "default" : function(win) {
        return (win||window).pageXOffset;
      }
    }),


    /**
     * Returns the scroll position of the viewport
     *
     * All clients except MSHTML supports the non-standard property <code>pageYOffset</code>.
     * As this is easier to evaluate we prefer this property over <code>scrollTop</code>.
     *
     * For MSHTML the access method differs between standard and quirks mode;
     * as this can differ from document to document this test must be made on
     * each query.
     *
     * @type static
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} Scroll position from left edge, always a positive integer
     */
    getScrollTop : qx.core.Variant.select("qx.client", 
    {
      "mshtml" : function(win) 
      {
        var doc = (win||window).document;
        return doc.documentElement.scrollTop || doc.body.scrollTop;
      },      

      "default" : function(win) {
        return (win||window).pageYOffset;
      }
    })
  }
});
