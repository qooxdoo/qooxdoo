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
     * Webkit, even as of Safari 3 beta, have no working 
     * <code>clientWidth</code> property - but <code>innerWidth</code> does the job
     *
     * Mozilla and Opera include the scrollbar width in <code>innerWidth</code>. As this is
     * not the indented behavior of this method we correcting this property. TODO
     *
     * <code>clientWidth</code> is the inner width of an element in pixels. It includes padding 
     * but not the vertical scrollbar (if present, if rendered), border or margin.
     *
     * @type static
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} The width of the viewable area of the page (excludes scrollbars).
     */
    getWidth : qx.core.Variant.select("qx.client", 
    {
      "mshtml" : function(win) 
      {
        if (!win) {
          win = window; 
        }
              
        if (qx.html2.Document.isStandardMode(win)) {
          return win.document.documentElement.clientWidth;
        } else {
          return win.document.body.clientWidth;
        }        
      },
      
      "default" : function(win) {
        return (win||window).innerWidth;
      }
    }),
    

    /**
     * Returns the current height of the viewport (excluding a eventually visible scrollbar).
     *
     * Webkit, even as of Safari 3 beta, have no working 
     * <code>clientHeight</code> property - but <code>innerWidth</code> does the job
     *
     * Mozilla and Opera include the scrollbar width in <code>innerWidth</code>. As this is
     * not the indented behavior of this method we correcting this property. TODO
     *
     * <code>clientHeight</code> is the inner height of an element in pixels. It includes padding 
     * but not the horizontal scrollbar (if present, if rendered), border or margin.
     *     
     * @type static
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} The height of the viewable area of the page (excludes scrollbars).
     */
    getHeight : qx.core.Variant.select("qx.client", 
    {
      "mshtml" : function(win) 
      {
        if (!win) {
          win = window; 
        }
              
        if (qx.html2.Document.isStandardMode(win)) {
          return win.document.documentElement.clientHeight;
        } else {
          return win.document.body.clientHeight;
        }        
      },
      
      "default" : function(win) {
        return (win||window).innerHeight;
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
        if (!win) {
          win = window; 
        }
              
        if (qx.html2.Document.isStandardMode(win)) {
          return win.document.documentElement.scrollLeft;
        } else {
          return win.document.body.scrollLeft;
        }  
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
        if (!win) {
          win = window; 
        }
              
        if (qx.html2.Document.isStandardMode(win)) {
          return win.document.documentElement.scrollTop;
        } else {
          return win.document.body.scrollTop;
        }        
      },      

      "default" : function(win) {
        return (win||window).pageYOffset;
      }
    })
  }
});
