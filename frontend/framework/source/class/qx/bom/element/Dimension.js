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
     * Returns the (box) width of the given element.
     *
     * @param element {Element} DOM element to query
     * @return {Integer} width of the element
     */
    getWidth : function(element) {
      return element.offsetWidth;
    },

    /**
     * Returns the (box) height of the given element.
     *
     * @param element {Element} DOM element to query
     * @return {Integer} height of the element
     */
    getHeight : function(element) {
      return element.offsetHeight;
    },

    /**
     * Returns the client width of the given element.
     *
     * @param element {Element} DOM element to query
     * @return {Integer} inner width of the element
     */
    getClientWidth : function(element) {
      return element.clientWidth;
    },

    /**
     * Returns the client height of the given element.
     *
     * @param element {Element} DOM element to query
     * @return {Integer} inner height of the element
     */
    getClientHeight : function(element) {
      return element.clientHeight;
    },

    /**
     * Returns the scroll width of the given element.
     *
     * @param element {Element} DOM element to query
     * @return {Integer} scroll width of the element
     */
    getScrollWidth : function(element) {
      return element.scrollWidth;
    },

    /**
     * Returns the scroll height of the given element.
     *
     * @param element {Element} DOM element to query
     * @return {Integer} scroll height of the element
     */
    getScrollHeight : function(element) {
      return element.scrollHeight;
    }
  }
});
