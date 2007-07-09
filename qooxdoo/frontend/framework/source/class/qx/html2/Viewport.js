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
 * Includes library functions to work with the client's viewport.
 *
 */
qx.Class.define("qx.html2.Viewport",
{
  statics :
  {
    /**
     * Returns the current width of the viewport.
     *
     * @type static
     * @return {Integer} The width of the viewable area of the page (excludes scrollbars).
     */
    getWidth : qx.core.Variant.select("qx.client",
    {
      "webkit419" : function() { // TODO: Nonexisting key
        return self.innerWidth;
      },

      "opera" : function() {
        return document.body.clientWidth;
      },

      "default" : qx.lang.Object.select(qx.html2.client.Features.STANDARD_MODE ? "standard" : "quirks",
      {
        "standard" : function() {
          return document.documentElement.clientWidth;
        },

        "quirks" : function() {
          return document.body.clientWidth;
        }
      })
    }),


    /**
     * Returns the current height of the viewport.
     *
     * @type static
     * @return {Integer} The height of the viewable area of the page (excludes scrollbars).
     */
    getHeight : qx.core.Variant.select("qx.client",
    {
      "webkit419" : function() { // TODO: Nonexisting key
        return self.innerHeight;
      },

      "opera" : function() {
        return document.body.clientHeight;
      },

      "default" : qx.lang.Object.select(qx.html2.client.Features.STANDARD_MODE ? "standard" : "quirks",
      {
        "standard" : function() {
          return document.documentElement.clientHeight;
        },

        "quirks" : function() {
          return document.body.clientHeight;
        }
      })
    }),

    getScrollLeft: function(){
      // TODO: quirks mode
      return window.pageXOffset || document.documentElement.scrollLeft;
    },

    getScrollTop: function(){
      // TODO: quirks mode
      return window.pageYOffset || document.documentElement.scrollTop;
    }
  }
});
