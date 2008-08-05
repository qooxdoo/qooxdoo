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

/* ************************************************************************

************************************************************************ */

/**
 * @deprecated: Use qx.bom.Viewport instead
 */
qx.Class.define("qx.legacy.html.Window",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Get the inner width of the given browser window
     *
     * @param vWindow {window} browser window
     * @return {Integer} the window's inner width
     * @signature function(vWindow)
     */
    getInnerWidth  : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vWindow)
      {
        if (vWindow.document.documentElement && vWindow.document.documentElement.clientWidth) {
          return vWindow.document.documentElement.clientWidth;
        } else if (vWindow.document.body) {
          return vWindow.document.body.clientWidth;
        }

        return 0;
      },

      "default" : function(vWindow) {
        return vWindow.innerWidth;
      }
    }),


    /**
     * Get the inner height of the given browser window
     *
     * @param vWindow {window} browser window
     * @return {Integer} the window's inner height
     * @signature function(vWindow)
     */
    getInnerHeight : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vWindow)
      {
        if (vWindow.document.documentElement && vWindow.document.documentElement.clientHeight) {
          return vWindow.document.documentElement.clientHeight;
        } else if (vWindow.document.body) {
          return vWindow.document.body.clientHeight;
        }

        return 0;
      },

      "default" : function(vWindow) {
        return vWindow.innerHeight;
      }
    }),


    /**
     * Get the left scroll position of the given browser window
     *
     * @param vWindow {window} browser window
     * @return {Integer} the window's left scroll position
     * @signature function(vWindow)
     */
    getScrollLeft  : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vWindow)
      {
        if (vWindow.document.documentElement && vWindow.document.documentElement.scrollLeft) {
          return vWindow.document.documentElement.scrollLeft;
        } else if (vWindow.document.body) {
          return vWindow.document.body.scrollTop;
        }

        return 0;
      },

      "default" : function(vWindow) {
        return vWindow.document.body.scrollLeft;
      }
    }),


    /**
     * Get the top scroll position of the given browser window
     *
     * @param vWindow {window} browser window
     * @return {Integer} the window's top scroll position
     * @signature function(vWindow)
     */
    getScrollTop   : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vWindow)
      {
        if (vWindow.document.documentElement && vWindow.document.documentElement.scrollTop) {
          return vWindow.document.documentElement.scrollTop;
        } else if (vWindow.document.body) {
          return vWindow.document.body.scrollTop;
        }

        return 0;
      },

      "default" : function(vWindow) {
        return vWindow.document.body.scrollTop;
      }
    })
  }
});
