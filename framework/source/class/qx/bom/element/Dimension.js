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

************************************************************************ */


/**
 * Contains support for calculating dimensions of HTML elements.
 */
qx.Class.define("qx.bom.element.Dimension",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      QUERY
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the rendered width of the given element.
     *
     * @param element {Element} DOM element to query
     * @return {Integer} width of the element
     */
    getWidth : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(element)
      {
        // offsetWidth in Firefox does not always return the rendered pixel size
        // of an element.
        // Starting with Firefox 3 the rendered size can be determined by using
        // getBoundingClientRect
        // https://bugzilla.mozilla.org/show_bug.cgi?id=450422
        if (element.getBoundingClientRect)
        {
          var rect = element.getBoundingClientRect();
          return Math.round(rect.right) - Math.round(rect.left);
        }
        else
        {
          return element.offsetWidth;
        }
      },

      "default" : function(element) {
        return element.offsetWidth;
      }
    }),


    /**
     * Returns the rendered height of the given element.
     *
     * @param element {Element} DOM element to query
     * @return {Integer} height of the element
     */
    getHeight : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(element)
      {
        if (element.getBoundingClientRect)
        {
          var rect = element.getBoundingClientRect();
          return Math.round(rect.bottom) - Math.round(rect.top);
        }
        else
        {
          return element.offsetHeight;
        }
      },

      "default" : function(element) {
        return element.offsetHeight;
      }
    }),


    /**
     * Returns the rendered size of the given element.
     *
     * @param element {Element} DOM element to query
     * @return {Map} map containing the height and width  of the element
     */
    getSize : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(element)
      {
        // Why not use offsetWidth/offsetHeight in every browser?!? 
        if (element.getBoundingClientRect)
        {
          var rect = element.getBoundingClientRect();
          return {
            width: Math.round(rect.right) - Math.round(rect.left),
            height: Math.round(rect.bottom) - Math.round(rect.top)
          };
        }
        else
        {
          return {
            width: element.offsetWidth,
            height: element.offsetHeight
          };
        }
      },

      "default" : function(element) {
        return {
          width: element.offsetWidth,
          height: element.offsetHeight
        };
      }
    }),


    /**
     * Returns the client width of the given element
     * (https://developer.mozilla.org/En/DOM/Element.clientWidth).
     *
     * @param element {Element} DOM element to query
     * @return {Integer} inner width of the element
     */
    getClientWidth : function(element) {
      return element.clientWidth;
    },

    /**
     * Returns the client height of the given element
     * (https://developer.mozilla.org/En/DOM/Element.clientHeight).
     *
     * @param element {Element} DOM element to query
     * @return {Integer} inner height of the element
     */
    getClientHeight : function(element) {
      return element.clientHeight;
    },

    /**
     * Returns the scroll width of the given element
     * (https://developer.mozilla.org/En/DOM/Element.scrollWidth).
     *
     * @param element {Element} DOM element to query
     * @return {Integer} scroll width of the element
     */
    getScrollWidth : function(element) {
      return element.scrollWidth;
    },

    /**
     * Returns the scroll height of the given element
     * (https://developer.mozilla.org/En/DOM/Element.scrollHeight).
     *
     *
     * @param element {Element} DOM element to query
     * @return {Integer} scroll height of the element
     */
    getScrollHeight : function(element) {
      return element.scrollHeight;
    }
  }
});
