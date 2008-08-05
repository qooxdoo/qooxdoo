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
 * Contains methods to control and query the element's scroll properties
 */
qx.Class.define("qx.bom.element.Scroll",
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
      SCROLL INTO VIEW
    ---------------------------------------------------------------------------
    */

    /**
     * The method scrolls the element into view (x-axis only).
     *
     * @param element {Element} DOM element to scroll into view
     * @param stop {Element?null} Any parent element which functions as
     *   outest element to scroll. Default is the HTML document.
     * @param align {String?null} Alignment of the element. Allowed values:
     *   <code>left</code> or <code>right</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     */
    intoViewX : function(element, stop, align)
    {
      var parent = element.parentNode;
      var doc = qx.dom.Node.getDocument(element);
      var body = doc.body;

      var parentLocation, parentLeft, parentRight;
      var parentOuterWidth, parentClientWidth, parentScrollWidth;
      var parentLeftBorder, parentRightBorder, parentScrollBarWidth;
      var elementLocation, elementLeft, elementRight, elementWidth;
      var leftOffset, rightOffset, scrollDiff;

      var alignLeft = align === "left";
      var alignRight = align === "right";

      // Correcting stop position
      stop = stop ? stop.parentNode : doc;

      // Go up the parent chain
      while (parent && parent != stop)
      {
        // "overflow" is always visible for both: document.body and document.documentElement
        if (parent.scrollWidth > parent.clientWidth && (parent === body || qx.bom.element.Overflow.getY(parent) != "visible"))
        {
          // console.debug("Process: " + parent.$$hash);

          // Calculate parent data
          // Special handling for body element
          if (parent === body)
          {
            parentLeft = parent.scrollLeft;
            parentRight = parentLeft + qx.bom.Viewport.getWidth();
            parentOuterWidth = qx.bom.Viewport.getWidth();
            parentClientWidth = parent.clientWidth;
            parentScrollWidth = parent.scrollWidth;
            parentLeftBorder = 0;
            parentRightBorder = 0;
            parentScrollBarWidth = 0;
          }
          else
          {
            parentLocation = qx.bom.element.Location.get(parent);
            parentLeft = parentLocation.left;
            parentRight = parentLocation.right;
            parentOuterWidth = parent.offsetWidth;
            parentClientWidth = parent.clientWidth;
            parentScrollWidth = parent.scrollWidth;
            parentLeftBorder = parseInt(qx.bom.element.Style.get(parent, "borderLeftWidth"), 10) || 0;
            parentRightBorder = parseInt(qx.bom.element.Style.get(parent, "borderRightWidth"), 10) || 0;
            parentScrollBarWidth = parentOuterWidth - parentClientWidth - parentLeftBorder - parentRightBorder;
          }

          // Calculate element data
          elementLocation = qx.bom.element.Location.get(element);
          elementLeft = elementLocation.left;
          elementRight = elementLocation.right;
          elementWidth = element.offsetWidth;

          // Relative position from each other
          leftOffset = elementLeft - parentLeft - parentLeftBorder;
          rightOffset = elementRight - parentRight + parentRightBorder;

          // Scroll position rearrangment
          scrollDiff = 0;

          // be sure that element is on left edge
          if (alignLeft)
          {
            // console.debug("Align left...");
            scrollDiff = leftOffset;
          }

          // be sure that element is on right edge
          else if (alignRight)
          {
            // console.debug("Align right...");
            scrollDiff = rightOffset + parentScrollBarWidth;
          }

          // element must go down
          // * when current left offset is smaller than 0
          // * when width is bigger than the inner width of the parent
          else if (leftOffset < 0 || elementWidth > parentClientWidth)
          {
            // console.debug("Go Down...");
            scrollDiff = leftOffset;
          }

          // element must go up
          // * when current right offset is bigger than 0
          else if (rightOffset > 0)
          {
            // console.debug("Go Up...");
            scrollDiff = rightOffset + parentScrollBarWidth;
          }

          // console.log("Scroll by: " + scrollDiff);
          parent.scrollLeft += scrollDiff;

          // Firefox 3 seems to fire the scroll event asynchronously
          // We fire another one a bit earlier here
          if (qx.bom.client.Engine.GECKO) {
            qx.event.Registration.fireNonBubblingEvent(parent, "scroll");
          }
        }

        if (parent === body) {
          break;
        }

        parent = parent.parentNode;
      }
    },


    /**
     * The method scrolls the element into view (y-axis only).
     *
     * @param element {Element} DOM element to scroll into view
     * @param stop {Element?null} Any parent element which functions as
     *   outest element to scroll. Default is the HTML document.
     * @param align {String?null} Alignment of the element. Allowed values:
     *   <code>top</code> or <code>bottom</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     */
    intoViewY : function(element, stop, align)
    {
      var parent = element.parentNode;
      var doc = qx.dom.Node.getDocument(element);
      var body = doc.body;

      var parentLocation, parentTop, parentBottom;
      var parentOuterHeight, parentClientHeight, parentScrollHeight;
      var parentTopBorder, parentBottomBorder, parentScrollBarHeight;
      var elementLocation, elementTop, elementBottom, elementHeight;
      var topOffset, bottomOffset, scrollDiff;

      var alignTop = align === "top";
      var alignBottom = align === "bottom";

      // Correcting stop position
      stop = stop ? stop.parentNode : doc;

      // Go up the parent chain
      while (parent && parent != stop)
      {
        // "overflow" is always visible for both: document.body and document.documentElement
        if (parent.scrollHeight > parent.clientHeight && (parent === body || qx.bom.element.Overflow.getY(parent) != "visible"))
        {
          // console.debug("Process: " + parent.$$hash);

          // Calculate parent data
          // Special handling for body element
          if (parent === body)
          {
            parentTop = parent.scrollTop;
            parentBottom = parentTop + qx.bom.Viewport.getHeight();
            parentOuterHeight = qx.bom.Viewport.getHeight();
            parentClientHeight = parent.clientHeight;
            parentScrollHeight = parent.scrollHeight;
            parentTopBorder = 0;
            parentBottomBorder = 0;
            parentScrollBarHeight = 0;
          }
          else
          {
            parentLocation = qx.bom.element.Location.get(parent);
            parentTop = parentLocation.top;
            parentBottom = parentLocation.bottom;
            parentOuterHeight = parent.offsetHeight;
            parentClientHeight = parent.clientHeight;
            parentScrollHeight = parent.scrollHeight;
            parentTopBorder = parseInt(qx.bom.element.Style.get(parent, "borderTopWidth"), 10) || 0;
            parentBottomBorder = parseInt(qx.bom.element.Style.get(parent, "borderBottomWidth"), 10) || 0;
            parentScrollBarHeight = parentOuterHeight - parentClientHeight - parentTopBorder - parentBottomBorder;
          }

          // Calculate element data
          elementLocation = qx.bom.element.Location.get(element);
          elementTop = elementLocation.top;
          elementBottom = elementLocation.bottom;
          elementHeight = element.offsetHeight;

          // Relative position from each other
          topOffset = elementTop - parentTop - parentTopBorder;
          bottomOffset = elementBottom - parentBottom + parentBottomBorder;

          // Scroll position rearrangment
          scrollDiff = 0;

          // be sure that element is on top edge
          if (alignTop)
          {
            // console.debug("Align top...");
            scrollDiff = topOffset;
          }

          // be sure that element is on bottom edge
          else if (alignBottom)
          {
            // console.debug("Align bottom...");
            scrollDiff = bottomOffset + parentScrollBarHeight;
          }

          // element must go down
          // * when current top offset is smaller than 0
          // * when height is bigger than the inner height of the parent
          else if (topOffset < 0 || elementHeight > parentClientHeight)
          {
            // console.debug("Go Down...");
            scrollDiff = topOffset;
          }

          // element must go up
          // * when current bottom offset is bigger than 0
          else if (bottomOffset > 0)
          {
            // console.debug("Go Up...");
            scrollDiff = bottomOffset + parentScrollBarHeight;
          }

          parent.scrollTop += scrollDiff;

          // Firefox 3 seems to fire the scroll event asynchronously
          // We fire another one a bit earlier here
          if (qx.bom.client.Engine.GECKO) {
            qx.event.Registration.fireNonBubblingEvent(parent, "scroll");
          }
        }

        if (parent === body) {
          break;
        }

        parent = parent.parentNode;
      }
    },


    /**
     * The method scrolls the element into view.
     *
     * @param element {Element} DOM element to scroll into view
     * @param stop {Element?null} Any parent element which functions as
     *   outest element to scroll. Default is the HTML document.
     * @param alignX {String} Alignment of the element. Allowed values:
     *   <code>left</code> or <code>right</code>. Could also be undefined.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     * @param alignY {String} Alignment of the element. Allowed values:
     *   <code>top</code> or <code>bottom</code>. Could also be undefined.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     */
    intoView : function(element, stop, alignX, alignY)
    {
      this.intoViewX(element, stop, alignX);
      this.intoViewY(element, stop, alignY);
    }
  }
});
