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
     * Returns the current width of the viewport.
     *
     * Opera always implements the quirks mode handler.
     * Webkit, even as of Safari 3 beta, have no working 
     *   clientWidth property - but innerWidth does the job
     *
     * @type static
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} The width of the viewable area of the page (excludes scrollbars).
     */
    getWidth : qx.core.Variant.select("qx.client", 
    {
      "webkit" : function(win) {
        return (win||window).innerWidth;
      },
      
      "opera" : function(win) {
        return (win||window).document.body.clientWidth;
      },
      
      "default" : function(win) 
      {
        if (!win) {
          win = window; 
        }
              
        if (qx.html2.Document.isStandardMode(win)) {
          return Math.max(win.document.documentElement.scrollWidth, qx.html2.Viewport.getWidth(win));
        } else {
          return Math.max(win.document.body.scrollWidth, qx.html2.Viewport.getWidth(win));
        }        
      }
    }),
    

    /**
     * Returns the current height of the viewport.
     *
     * Opera always implements the quirks mode handler.
     * Webkit, even as of Safari 3 beta, have no working 
     *   clientHeight property - but innerWidth does the job
     *
     * @type static
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} The height of the viewable area of the page (excludes scrollbars).
     */
    getHeight : qx.core.Variant.select("qx.client", 
    {
      "webkit" : function(win) {
        return (win||window).innerHeight;
      },
      
      "opera" : function(win) {
        return (win||window).document.body.clientHeight;
      },
      
      "default" : function(win) 
      {
        if (!win) {
          win = window; 
        }
              
        if (qx.html2.Document.isStandardMode(win)) {
          return Math.max(win.document.documentElement.scrollHeight, qx.html2.Viewport.getHeight(win));
        } else {
          return Math.max(win.document.body.scrollHeight, qx.html2.Viewport.getHeight(win));
        }        
      }
    }),


    /**
     * Returns the scroll position of the viewport
     *
     * @type static
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} Scroll position from left edge, always a positive integer
     */
    getScrollLeft : qx.html2.Client.select("qx.client", 
    {
      "gecko" : function(win) {
        return (win||window).pageXOffset;
      },
      
      "default" : function(win) 
      {
        if (!win) {
          win = window; 
        }
              
        if (qx.html2.Document.isStandardMode(win)) {
          return win.document.documentElement.scrollLeft;
        } else {
          return win.document.body.scrollLeft;
        }  
      }
    }),


    /**
     * Returns the scroll position of the viewport
     *
     * @type static
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} Scroll position from left edge, always a positive integer
     */
    getScrollTop : qx.html2.Client.select("qx.client", 
    {
      "gecko" : function(win) {
        return (win||window).pageYOffset;
      },
      
      "default" : function(win) 
      {
        if (!win) {
          win = window; 
        }
              
        if (qx.html2.Document.isStandardMode(win)) {
          return win.document.documentElement.scrollTop;
        } else {
          return win.document.body.scrollTop;
        }        
      }      
    })
  }
});
