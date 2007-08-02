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

************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

/**
 * Contains methods to control and query the element's scroll properties
 */
qx.Class.define("qx.html2.element.Scroll",
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
      SCROLL POSITION
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls the given element to the given X-position (distance from left edge)
     *
     * @type static
     * @param element {Element} The element which should be modified
     * @param x {var} New X-position
     * @return {void}
     */
    setX : function(element, x) {
      element.scrollLeft = x;
    },


    /**
     * Scrolls the given element to the given Y-position (distance from top edge)
     *
     * @type static
     * @param element {Element} The element which should be modified
     * @param y {var} New Y-position
     * @return {void}
     */
    setY : function(element, y) {
      element.scrollTop = y;
    },
    
    
    /**
     * Returns the scroll position of the X-axis of the given element.
     *
     * @type static
     * @param element {Element} The element which should be queried
     * @return {Integer} current X-position (distance from left edge)
     */
    getX : function(element) {
      return parseInt(element.scrollLeft);
    },


    /**
     * Returns the scroll position of the Y-axis of the given element.
     *
     * @type static
     * @param element {Element} The element which should be queried
     * @return {Integer} current Y-position (distance from top edge)
     */
    getY : function(element) {
      return parseInt(element.scrollTop);
    }    
  }
});    
    