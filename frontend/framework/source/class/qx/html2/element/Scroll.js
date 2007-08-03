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
    },
    
    
    
    
    
    intoViewY : function(element, align)
    {
      var parent = element.parentNode;
      var body = qx.html2.node.Util.getDocument(element).body;
      
      var alignTop = align == "top";
      var alignBottom = align == "bottom";
              
      while(parent && parent !== body)
      {
        var parentLocation = qx.html2.element.Location.get(parent);
        var parentTop = parentLocation.top;
        var parentBottom = parentLocation.bottom;
        var parentHeight = parent.offsetHeight;
        var parentFrameHeight = parent.offsetHeight - parent.clientHeight;
        
        var elementLocation = qx.html2.element.Location.get(element);
        var elementTop = elementLocation.top;
        var elementBottom = elementLocation.bottom;
        var elementHeight = element.offsetHeight;
        
        var topBorder = parseInt(qx.html2.element.Style.getComputed(parent, "borderTopWidth")) || 0;
        
        var topOffset = elementTop - parentTop - topBorder;
        var bottomOffset = elementBottom - parentBottom + topBorder;
        
        var scrollDiff = 0;
        
        
        
        
        
        
        // the bottom variants needs to add the horizontal scrollbar to the scrollDiff
        
        // be sure that element is on top edge
        if (alignTop)
        {
          console.debug("Align top...");
          scrollDiff = topOffset;
        }
        
        // be sure that element is on bottom edge
        else if (alignBottom)
        {
          console.debug("Align bottom...");
          scrollDiff = bottomOffset + parentFrameHeight;
        }
        
        // element must go down
        // * when current top offset is smaller than 0
        // * when height is bigger than the inner height of the parent
        else if (topOffset < 0 || element.offsetHeight > parent.clientHeight)
        {
          console.debug("Go Down...");
          scrollDiff = topOffset;
        }
        
        // element must go up
        // * when current bottom offset is bigger than 0
        else if (bottomOffset > 0)
        {
          console.debug("Go Up...");
          scrollDiff = bottomOffset + parentFrameHeight;
        }
        
        console.log("Scroll by: " + scrollDiff);
        parent.scrollTop += scrollDiff;
        
        parent = parent.parentNode;
      }
    }
  }
});
