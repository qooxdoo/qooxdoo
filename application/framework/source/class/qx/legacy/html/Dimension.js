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

/**
 * <pre>
 * +-Outer----------------------------------------+
 * |  Margin                                      |
 * |  +-Box------------------------------+        |
 * |  |  Border (+ Scrollbar)            |        |
 * |  |  +-Area--------------------+     |        |
 * |  |  |  Padding                |     |        |
 * |  |  |  +-Inner----------+     |     |        |
 * |  |  |  |                |     |     |        |
 * |  |  |  +----------------+     |     |        |
 * |  |  +-------------------------+     |        |
 * |  +----------------------------------+        |
 * +----------------------------------------------+
 * </pre>
 */

/**
 * @deprecated: Use qx.bom.element.Dimension instead
 *
 */
qx.Class.define("qx.legacy.html.Dimension",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    // Dimensions
    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getOuterWidth : function(el) {
      return qx.legacy.html.Dimension.getBoxWidth(el) + qx.legacy.html.Style.getMarginLeft(el) + qx.legacy.html.Style.getMarginRight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getOuterHeight : function(el) {
      return qx.legacy.html.Dimension.getBoxHeight(el) + qx.legacy.html.Style.getMarginTop(el) + qx.legacy.html.Style.getMarginBottom(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getBoxWidthForZeroHeight : function(el)
    {
      var h = el.offsetHeight;

      if (h == 0)
      {
        var o = el.style.height;
        el.style.height = "1px";
      }

      var v = el.offsetWidth;

      if (h == 0) {
        el.style.height = o;
      }

      return v;
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getBoxHeightForZeroWidth : function(el)
    {
      var w = el.offsetWidth;

      if (w == 0)
      {
        var o = el.style.width;
        el.style.width = "1px";
      }

      var v = el.offsetHeight;

      if (w == 0) {
        el.style.width = o;
      }

      return v;
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getBoxWidth : function(el) {
      return el.offsetWidth;
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getBoxHeight : function(el) {
      return el.offsetHeight;
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getAreaWidth : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el)
      {
        // 0 in clientWidth could mean both: That it is really 0 or
        // that the element is not rendered by the browser and
        // therefore it is 0, too
        // In Gecko based browsers there is sometimes another
        // behaviour: The clientHeight is equal to the border
        // sum. This is normally not correct and so we
        // fix this value with a more complex calculation.
        // (Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.6) Gecko/20050223 Firefox/1.0.1)
        if (el.clientWidth != 0 && el.clientWidth != (qx.legacy.html.Style.getBorderLeft(el) + qx.legacy.html.Style.getBorderRight(el))) {
          return el.clientWidth;
        } else {
          return qx.legacy.html.Dimension.getBoxWidth(el) - qx.legacy.html.Dimension.getInsetLeft(el) - qx.legacy.html.Dimension.getInsetRight(el);
        }
      },

      "default" : function(el)
        {
          // 0 in clientWidth could mean both: That it is really 0 or
          // that the element is not rendered by the browser and
          // therefore it is 0, too
          return el.clientWidth != 0 ? el.clientWidth : (qx.legacy.html.Dimension.getBoxWidth(el) - qx.legacy.html.Dimension.getInsetLeft(el) - qx.legacy.html.Dimension.getInsetRight(el));
        }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getAreaHeight : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el)
      {
        // 0 in clientHeight could mean both: That it is really 0 or
        // that the element is not rendered by the browser and
        // therefore it is 0, too
        // In Gecko based browsers there is sometimes another
        // behaviour: The clientHeight is equal to the border
        // sum. This is normally not correct and so we
        // fix this value with a more complex calculation.
        // (Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.6) Gecko/20050223 Firefox/1.0.1)
        if (el.clientHeight != 0 && el.clientHeight != (qx.legacy.html.Style.getBorderTop(el) + qx.legacy.html.Style.getBorderBottom(el))) {
          return el.clientHeight;
        } else {
          return qx.legacy.html.Dimension.getBoxHeight(el) - qx.legacy.html.Dimension.getInsetTop(el) - qx.legacy.html.Dimension.getInsetBottom(el);
        }
      },

      "default" : function(el)
      {
        // 0 in clientHeight could mean both: That it is really 0 or
        // that the element is not rendered by the browser and
        // therefore it is 0, too
        return el.clientHeight != 0 ? el.clientHeight : (qx.legacy.html.Dimension.getBoxHeight(el) - qx.legacy.html.Dimension.getInsetTop(el) - qx.legacy.html.Dimension.getInsetBottom(el));
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getInnerWidth : function(el) {
      return qx.legacy.html.Dimension.getAreaWidth(el) - qx.legacy.html.Style.getPaddingLeft(el) - qx.legacy.html.Style.getPaddingRight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getInnerHeight : function(el) {
      return qx.legacy.html.Dimension.getAreaHeight(el) - qx.legacy.html.Style.getPaddingTop(el) - qx.legacy.html.Style.getPaddingBottom(el);
    },

    // Insets
    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getInsetLeft : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return el.clientLeft;
      },

      "default" : function(el) {
        return qx.legacy.html.Style.getBorderLeft(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getInsetTop : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return el.clientTop;
      },

      "default" : function(el) {
        return qx.legacy.html.Style.getBorderTop(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getInsetRight : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el)
      {
        if (qx.legacy.html.Style.getStyleProperty(el, "overflowY") == "hidden" || el.clientWidth == 0) {
          return qx.legacy.html.Style.getBorderRight(el);
        }

        return Math.max(0, el.offsetWidth - el.clientLeft - el.clientWidth);
      },

      "default" : function(el)
      {
        // Alternative method if clientWidth is unavailable
        // clientWidth == 0 could mean both: unavailable or really 0
        if (el.clientWidth == 0)
        {
          var ov = qx.legacy.html.Style.getStyleProperty(el, "overflow");
          var sbv = ov == "scroll" || ov == "-moz-scrollbars-vertical" ? 16 : 0;
          return Math.max(0, qx.legacy.html.Style.getBorderRight(el) + sbv);
        }

        return Math.max(0, el.offsetWidth - el.clientWidth - qx.legacy.html.Style.getBorderLeft(el));
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getInsetBottom : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el)
      {
        if (qx.legacy.html.Style.getStyleProperty(el, "overflowX") == "hidden" || el.clientHeight == 0) {
          return qx.legacy.html.Style.getBorderBottom(el);
        }

        return Math.max(0, el.offsetHeight - el.clientTop - el.clientHeight);
      },

      "default" : function(el)
      {
        // Alternative method if clientHeight is unavailable
        // clientHeight == 0 could mean both: unavailable or really 0
        if (el.clientHeight == 0)
        {
          var ov = qx.legacy.html.Style.getStyleProperty(el, "overflow");
          var sbv = ov == "scroll" || ov == "-moz-scrollbars-horizontal" ? 16 : 0;
          return Math.max(0, qx.legacy.html.Style.getBorderBottom(el) + sbv);
        }

        return Math.max(0, el.offsetHeight - el.clientHeight - qx.legacy.html.Style.getBorderTop(el));
      }
    }),

    // Scrollbar
    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {int} TODOC
     */
    getScrollBarSizeLeft : function(el) {
      return 0;
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {int} TODOC
     */
    getScrollBarSizeTop : function(el) {
      return 0;
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScrollBarSizeRight : function(el) {
      return qx.legacy.html.Dimension.getInsetRight(el) - qx.legacy.html.Style.getBorderRight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScrollBarSizeBottom : function(el) {
      return qx.legacy.html.Dimension.getInsetBottom(el) - qx.legacy.html.Style.getBorderBottom(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScrollBarVisibleX : function(el) {
      return qx.legacy.html.Dimension.getScrollBarSizeRight(el) > 0;
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScrollBarVisibleY : function(el) {
      return qx.legacy.html.Dimension.getScrollBarSizeBottom(el) > 0;
    }
  }
});
