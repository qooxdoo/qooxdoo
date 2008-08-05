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
 * @deprecated: Use qx.bom.element.Location instead
 *
 */
qx.Class.define("qx.legacy.html.Location",
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
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getPageOuterLeft : function(el) {
      return qx.legacy.html.Location.getPageBoxLeft(el) - qx.legacy.html.Style.getMarginLeft(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getPageOuterTop : function(el) {
      return qx.legacy.html.Location.getPageBoxTop(el) - qx.legacy.html.Style.getMarginTop(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getPageOuterRight : function(el) {
      return qx.legacy.html.Location.getPageBoxRight(el) + qx.legacy.html.Style.getMarginRight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getPageOuterBottom : function(el) {
      return qx.legacy.html.Location.getPageBoxBottom(el) + qx.legacy.html.Style.getMarginBottom(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getClientOuterLeft : function(el) {
      return qx.legacy.html.Location.getClientBoxLeft(el) - qx.legacy.html.Style.getMarginLeft(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getClientOuterTop : function(el) {
      return qx.legacy.html.Location.getClientBoxTop(el) - qx.legacy.html.Style.getMarginTop(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getClientOuterRight : function(el) {
      return qx.legacy.html.Location.getClientBoxRight(el) + qx.legacy.html.Style.getMarginRight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getClientOuterBottom : function(el) {
      return qx.legacy.html.Location.getClientBoxBottom(el) + qx.legacy.html.Style.getMarginBottom(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getClientBoxLeft : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return el.getBoundingClientRect().left;
      },

      "gecko" : function(el) {
        return qx.legacy.html.Location.getClientAreaLeft(el) - qx.legacy.html.Style.getBorderLeft(el);
      },

      "default" : function(el)
      {
        var sum = el.offsetLeft;

        while (el.tagName.toLowerCase() != "body")
        {
          el = el.offsetParent;
          sum += el.offsetLeft - el.scrollLeft;
        }

        return sum;
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getClientBoxTop : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return el.getBoundingClientRect().top;
      },

      "gecko" : function(el) {
        return qx.legacy.html.Location.getClientAreaTop(el) - qx.legacy.html.Style.getBorderTop(el);
      },

      "default" : function(el)
      {
        var sum = el.offsetTop;

        while (el.tagName.toLowerCase() != "body")
        {
          el = el.offsetParent;
          sum += el.offsetTop - el.scrollTop;
        }

        return sum;
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getClientBoxRight : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return el.getBoundingClientRect().right;
      },

      "default" : function(el) {
        return qx.legacy.html.Location.getClientBoxLeft(el) + qx.legacy.html.Dimension.getBoxWidth(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getClientBoxBottom : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return el.getBoundingClientRect().bottom;
      },

      "default" : function(el) {
        return qx.legacy.html.Location.getClientBoxTop(el) + qx.legacy.html.Dimension.getBoxHeight(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getPageBoxLeft : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return qx.legacy.html.Location.getClientBoxLeft(el) + qx.legacy.html.Scroll.getLeftSum(el);
      },

      "gecko" : function(el) {
        return qx.legacy.html.Location.getPageAreaLeft(el) - qx.legacy.html.Style.getBorderLeft(el);
      },

      "default" : function(el)
      {
        var sum = el.offsetLeft;

        while (el.tagName.toLowerCase() != "body")
        {
          el = el.offsetParent;
          sum += el.offsetLeft;
        }

        return sum;
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getPageBoxTop : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return qx.legacy.html.Location.getClientBoxTop(el) + qx.legacy.html.Scroll.getTopSum(el);
      },

      "gecko" : function(el) {
        return qx.legacy.html.Location.getPageAreaTop(el) - qx.legacy.html.Style.getBorderTop(el);
      },

      "default" : function(el)
      {
        var sum = el.offsetTop;

        while (el.tagName.toLowerCase() != "body")
        {
          el = el.offsetParent;
          sum += el.offsetTop;
        }

        return sum;
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getPageBoxRight : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return qx.legacy.html.Location.getClientBoxRight(el) + qx.legacy.html.Scroll.getLeftSum(el);
      },

      "default" : function(el) {
        return qx.legacy.html.Location.getPageBoxLeft(el) + qx.legacy.html.Dimension.getBoxWidth(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getPageBoxBottom : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el) {
        return qx.legacy.html.Location.getClientBoxBottom(el) + qx.legacy.html.Scroll.getTopSum(el);
      },

      "default" : function(el) {
        return qx.legacy.html.Location.getPageBoxTop(el) + qx.legacy.html.Dimension.getBoxHeight(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getClientAreaLeft : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el) {
        // We need to subtract the scroll position of all parent containers (bug #186229).
        return qx.legacy.html.Location.getPageAreaLeft(el) - qx.legacy.html.Scroll.getLeftSum(el);
      },

      "default" : function(el) {
        return qx.legacy.html.Location.getClientBoxLeft(el) + qx.legacy.html.Style.getBorderLeft(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getClientAreaTop : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el) {
        // We need to subtract the scroll position of all parent containers (bug #186229).
        return qx.legacy.html.Location.getPageAreaTop(el) - qx.legacy.html.Scroll.getTopSum(el);
      },

      "default" : function(el) {
        return qx.legacy.html.Location.getClientBoxTop(el) + qx.legacy.html.Style.getBorderTop(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getClientAreaRight : function(el) {
      return qx.legacy.html.Location.getClientAreaLeft(el) + qx.legacy.html.Dimension.getAreaWidth(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getClientAreaBottom : function(el) {
      return qx.legacy.html.Location.getClientAreaTop(el) + qx.legacy.html.Dimension.getAreaHeight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getPageAreaLeft : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el) {
        return el.ownerDocument.getBoxObjectFor(el).x;
      },

      "default" : function(el) {
        return qx.legacy.html.Location.getPageBoxLeft(el) + qx.legacy.html.Style.getBorderLeft(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getPageAreaTop : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el) {
        return el.ownerDocument.getBoxObjectFor(el).y;
      },

      "default" : function(el) {
        return qx.legacy.html.Location.getPageBoxTop(el) + qx.legacy.html.Style.getBorderTop(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getPageAreaRight : function(el) {
      return qx.legacy.html.Location.getPageAreaLeft(el) + qx.legacy.html.Dimension.getAreaWidth(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getPageAreaBottom : function(el) {
      return qx.legacy.html.Location.getPageAreaTop(el) + qx.legacy.html.Dimension.getAreaHeight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getClientInnerLeft : function(el) {
      return qx.legacy.html.Location.getClientAreaLeft(el) + qx.legacy.html.Style.getPaddingLeft(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getClientInnerTop : function(el) {
      return qx.legacy.html.Location.getClientAreaTop(el) + qx.legacy.html.Style.getPaddingTop(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getClientInnerRight : function(el) {
      return qx.legacy.html.Location.getClientInnerLeft(el) + qx.legacy.html.Dimension.getInnerWidth(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getClientInnerBottom : function(el) {
      return qx.legacy.html.Location.getClientInnerTop(el) + qx.legacy.html.Dimension.getInnerHeight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getPageInnerLeft : function(el) {
      return qx.legacy.html.Location.getPageAreaLeft(el) + qx.legacy.html.Style.getPaddingLeft(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getPageInnerTop : function(el) {
      return qx.legacy.html.Location.getPageAreaTop(el) + qx.legacy.html.Style.getPaddingTop(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getPageInnerRight : function(el) {
      return qx.legacy.html.Location.getPageInnerLeft(el) + qx.legacy.html.Dimension.getInnerWidth(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getPageInnerBottom : function(el) {
      return qx.legacy.html.Location.getPageInnerTop(el) + qx.legacy.html.Dimension.getInnerHeight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getScreenBoxLeft : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el)
      {
        // screenX and screenY seem to return the distance to the box
        // and not to the area. Confusing, especially as the x and y properties
        // of the BoxObject return the distance to the area.

        // We need to subtract the scroll position of all
        // parent containers (bug #186229).
        var sum = 0;
        var p = el.parentNode;

        while (p.nodeType == 1)
        {
          sum += p.scrollLeft;
          p = p.parentNode;
        }

        return el.ownerDocument.getBoxObjectFor(el).screenX - sum;
      },

      "default" : function(el) {
        // Hope this works in khtml, too (opera 7.6p3 seems to be ok)
        return qx.legacy.html.Location.getScreenDocumentLeft(el) + qx.legacy.html.Location.getPageBoxLeft(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getScreenBoxTop : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el)
      {
        // We need to subtract the scroll position of all
        // parent containers (bug #186229).
        var sum = 0;
        var p = el.parentNode;

        while (p.nodeType == 1)
        {
          sum += p.scrollTop;
          p = p.parentNode;
        }

        return el.ownerDocument.getBoxObjectFor(el).screenY - sum;
      },

      "default" : function(el) {
        return qx.legacy.html.Location.getScreenDocumentTop(el) + qx.legacy.html.Location.getPageBoxTop(el);
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenBoxRight : function(el) {
      return qx.legacy.html.Location.getScreenBoxLeft(el) + qx.legacy.html.Dimension.getBoxWidth(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenBoxBottom : function(el) {
      return qx.legacy.html.Location.getScreenBoxTop(el) + qx.legacy.html.Dimension.getBoxHeight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenOuterLeft : function(el) {
      return qx.legacy.html.Location.getScreenBoxLeft(el) - qx.legacy.html.Style.getMarginLeft(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenOuterTop : function(el) {
      return qx.legacy.html.Location.getScreenBoxTop(el) - qx.legacy.html.Style.getMarginTop(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenOuterRight : function(el) {
      return qx.legacy.html.Location.getScreenBoxRight(el) + qx.legacy.html.Style.getMarginRight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenOuterBottom : function(el) {
      return qx.legacy.html.Location.getScreenBoxBottom(el) + qx.legacy.html.Style.getMarginBottom(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenAreaLeft : function(el) {
      return qx.legacy.html.Location.getScreenBoxLeft(el) + qx.legacy.html.Dimension.getInsetLeft(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenAreaTop : function(el) {
      return qx.legacy.html.Location.getScreenBoxTop(el) + qx.legacy.html.Dimension.getInsetTop(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenAreaRight : function(el) {
      return qx.legacy.html.Location.getScreenBoxRight(el) - qx.legacy.html.Dimension.getInsetRight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenAreaBottom : function(el) {
      return qx.legacy.html.Location.getScreenBoxBottom(el) - qx.legacy.html.Dimension.getInsetBottom(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenInnerLeft : function(el) {
      return qx.legacy.html.Location.getScreenAreaLeft(el) + qx.legacy.html.Style.getPaddingLeft(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenInnerTop : function(el) {
      return qx.legacy.html.Location.getScreenAreaTop(el) + qx.legacy.html.Style.getPaddingTop(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenInnerRight : function(el) {
      return qx.legacy.html.Location.getScreenAreaRight(el) - qx.legacy.html.Style.getPaddingRight(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {var} TODOC
     */
    getScreenInnerBottom : function(el) {
      return qx.legacy.html.Location.getScreenAreaBottom(el) - qx.legacy.html.Style.getPaddingBottom(el);
    },


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getScreenDocumentLeft : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el) {
        // Tested in Gecko 1.7.5
        //
        //  Notice:
        //    This doesn't work like the mshtml method:
        //    el.ownerDocument.defaultView.screenX;
        return qx.legacy.html.Location.getScreenOuterLeft(el.ownerDocument.body);
      },

      "default" : function(el) {
        // Tested in Opera 7.6b3 and Mshtml 6.0 (XP-SP2)
        // What's up with khtml (Safari/Konq)?
        return el.document.parentWindow.screenLeft;
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getScreenDocumentTop : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el) {
        return qx.legacy.html.Location.getScreenOuterTop(el.ownerDocument.body);
      },

      "default" : function(el) {
        return el.document.parentWindow.screenTop;
      }
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getScreenDocumentRight : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el) {
        return qx.legacy.html.Location.getScreenOuterRight(el.ownerDocument.body);
      },

      "default" : function(el) {}
    }),


    /**
     * TODOC
     *
     * @param el {Element} TODOC
     * @return {void}
     * @signature function(el)
     */
    getScreenDocumentBottom : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(el) {
        return qx.legacy.html.Location.getScreenOuterBottom(el.ownerDocument.body);
      },

      "default" : function(el) {}
    })
  }
});
