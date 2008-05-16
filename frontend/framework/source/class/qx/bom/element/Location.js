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

   ======================================================================

   This class contains code based on the following work:

   * jQuery Dimension Plugin
       http://jquery.com/
       Version 1.1.3

     Copyright:
       (c) 2007, Paul Bakaus & Brandon Aaron

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       Paul Bakaus
       Brandon Aaron

************************************************************************ */


/**
 * Query the location of an arbitrary DOM element in relation to its top
 * level body element. Works in all major browsers:
 *
 * * Mozilla 1.5 + 2.0
 * * Internet Explorer 6.0 + 7.0 (both standard & quirks mode)
 * * Opera 9.2
 * * Safari 3.0 beta
 */
qx.Class.define("qx.bom.element.Location",
{
  statics :
  {
    /**
     * Queries a style property for the given element
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @param style {String} Style property
     * @return {String} Value of given style property
     */
    __style : function(elem, style) {
      return qx.bom.element.Style.get(elem, style, qx.bom.element.Style.COMPUTED_MODE, false);
    },


    /**
     * Queries a style property for the given element and parses it to a integer value
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @param style {String} Style property
     * @return {Integer} Value of given style property
     */
    __num : function(elem, style) {
      return parseInt(qx.bom.element.Style.get(elem, style, qx.bom.element.Style.COMPUTED_MODE, false), 10) || 0;
    },


    /**
     * Computes the scroll offset of the given element relative to the document
     * <code>body</code>.
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @return {Map} Map which contains the <code>left</code> and <code>top</code> scroll offsets
     */
    __computeScroll : function(elem)
    {
      var left = 0, top = 0;

      // Use faster getBoundingClientRect() if available
      // Hint: The viewport workaround here only needs to be applied for
      // MSHTML and gecko clients currently.
      if (elem.getBoundingClientRect)
      {
        // Find window
        var win = qx.dom.Node.getWindow(elem);

        // Reduce by viewport scrolling.
        // Hint: getBoundingClientRect returns the location of the
        // element in relation to the viewport which includes
        // the scrolling
        left -= qx.bom.Viewport.getScrollLeft(win);
        top -= qx.bom.Viewport.getScrollTop(win);
      }
      else
      {
        // Find body element
        var body = qx.dom.Node.getDocument(elem).body;

        // Only the parents are influencing the scroll position
        elem = elem.parentNode;

        // Get scroll offsets
        // stop at the body => the body scroll position is irrelevant
        while (elem && elem != body)
        {
          left += elem.scrollLeft;
          top += elem.scrollTop;

          // One level up (children hierarchy)
          elem = elem.parentNode;
        }
      }

      return {
        left : left,
        top : top
      };
    },


    /**
     * Computes the offset of the given element relative to the document
     * <code>body</code>.
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
     */
    __computeBody : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(elem)
      {
        // Find body element
        var doc = qx.dom.Node.getDocument(elem);
        var body = doc.body;

        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;

        // Substract the body border
        left -= this.__num(body, "borderLeftWidth");
        top -= this.__num(body, "borderTopWidth");

        // Add the margin when running in standard mode
        if (doc.compatMode === "CSS1Compat")
        {
          left += this.__num(body, "marginLeft");
          top += this.__num(body, "marginTop");
        }

        return {
          left : left,
          top : top
        };
      },

      "webkit" : function(elem)
      {
        // Find body element
        var doc = qx.dom.Node.getDocument(elem);
        var body = doc.body;

        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;

        // Correct substracted border
        left += this.__num(body, "borderLeftWidth");
        top += this.__num(body, "borderTopWidth");

        // Add the margin when running in standard mode
        if (doc.compatMode === "CSS1Compat")
        {
          left += this.__num(body, "marginLeft");
          top += this.__num(body, "marginTop");
        }

        return {
          left : left,
          top : top
        };
      },

      "gecko" : function(elem)
      {
        // Find body element
        var body = qx.dom.Node.getDocument(elem).body;

        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;

        // Correct substracted border (only in content-box mode)
        if (qx.bom.element.BoxSizing.get(body) !== "border-box")
        {
          left += this.__num(body, "borderLeftWidth");
          top += this.__num(body, "borderTopWidth");

          // For some unknown reason we must add the border two times
          // when there is no absolute positioned element in the DOM tree

          // This is not neededd if the offset is computed using
          // <code>getBoundingClientRect</code>
          if (!elem.getBoundingClientRect)
          {
            var hasAbs;

            while (elem)
            {
              if (this.__style(elem, "position") === "absolute" || this.__style(elem, "position") === "fixed")
              {
                hasAbs = true;
                break;
              }

              elem = elem.offsetParent;
            }

            if (!hasAbs)
            {
              left += this.__num(body, "borderLeftWidth");
              top += this.__num(body, "borderTopWidth");
            }
          }
        }

        return {
          left : left,
          top : top
        };
      },


      // At the moment only correctly supported by Opera
      "default" : function(elem)
      {
        // Find body element
        var body = qx.dom.Node.getDocument(elem).body;

        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;

        return {
          left : left,
          top : top
        };
      }
    }),


    /**
     * Computes the sum of all offsets of the given element node.
     *
     * Traditionally this is a loop which goes up the whole parent tree
     * and sums up all found offsets.
     *
     * But both <code>mshtml</code> and <code>gecko >= 1.9</code> support
     * <code>getBoundingClientRect</code> which allows a
     * much faster access to the offset position.
     *
     * Please note: When gecko 1.9 does not use the <code>getBoundingClientRect</code>
     * implementation, and therefor use the tranditional offset calculation
     * the gecko 1.9 fix in <code>__computeBody</code> must not be applied.
     *
     * @type static
     * @signature function(elem)
     * @param elem {Element} DOM element to query
     * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
     */
    __computeOffset : qx.core.Variant.select("qx.client",
    {
      "mshtml|webkit" : function(elem)
      {
        var doc = qx.dom.Node.getDocument(elem);

        // Use faster getBoundingClientRect() if available
        // Note: This is not yet supported by Webkit.
        if (elem.getBoundingClientRect)
        {
          var rect = elem.getBoundingClientRect();

          var left = rect.left;
          var top = rect.top;

          // Internet Explorer (at least version 7.0) adds the border
          // when running in standard mode
          if (doc.compatMode === "CSS1Compat")
          {
            left -= this.__num(elem, "borderLeftWidth");
            top -= this.__num(elem, "borderTopWidth");
          }
        }
        else
        {
          // Offset of the incoming element
          var left = elem.offsetLeft;
          var top = elem.offsetTop;

          // Start with the first offset parent
          elem = elem.offsetParent;

          // Stop at the body
          var body = doc.body;

          // Border correction is only needed for each parent
          // not for the incoming element itself
          while (elem && elem != body)
          {
            // Add node offsets
            left += elem.offsetLeft;
            top += elem.offsetTop;

            // Fix missing border
            left += this.__num(elem, "borderLeftWidth");
            top += this.__num(elem, "borderTopWidth");

            // One level up (offset hierarchy)
            elem = elem.offsetParent;
          }
        }

        return {
          left : left,
          top : top
        }
      },

      "gecko" : function(elem)
      {
        // Use faster getBoundingClientRect() if available (gecko >= 1.9)
        if (elem.getBoundingClientRect)
        {
          var rect = elem.getBoundingClientRect();

          // Firefox 3.0 alpha 6 (gecko 1.9) returns floating point numbers
          // use Math.round() to round them to style compatible numbers
          // MSHTML returns integer numbers, maybe gecko will fix this in
          // the future, too
          var left = Math.round(rect.left);
          var top = Math.round(rect.top);
        }
        else
        {
          var left = 0;
          var top = 0;

          // Stop at the body
          var body = qx.dom.Node.getDocument(elem).body;
          var box = qx.bom.element.BoxSizing;

          if (box.get(elem) !== "border-box")
          {
            left -= this.__num(elem, "borderLeftWidth");
            top -= this.__num(elem, "borderTopWidth");
          }

          while (elem && elem !== body)
          {
            // Add node offsets
            left += elem.offsetLeft;
            top += elem.offsetTop;

            // Mozilla does not add the borders to the offset
            // when using box-sizing=content-box
            if (box.get(elem) !== "border-box")
            {
              left += this.__num(elem, "borderLeftWidth");
              top += this.__num(elem, "borderTopWidth");
            }

            // Mozilla does not add the border for a parent that has
            // overflow set to anything but visible
            if (elem.parentNode && this.__style(elem.parentNode, "overflow") != "visible")
            {
              left += this.__num(elem.parentNode, "borderLeftWidth");
              top += this.__num(elem.parentNode, "borderTopWidth");
            }

            // One level up (offset hierarchy)
            elem = elem.offsetParent;
          }
        }

        return {
          left : left,
          top : top
        }
      },

      // At the moment only correctly supported by Opera
      "default" : function(elem)
      {
        var left = 0;
        var top = 0;

        // Stop at the body
        var body = qx.dom.Node.getDocument(elem).body;

        // Add all offsets of parent hierarchy, do not include
        // body element.
        while (elem && elem !== body)
        {
          // Add node offsets
          left += elem.offsetLeft;
          top += elem.offsetTop;

          // One level up (offset hierarchy)
          elem = elem.offsetParent;
        }

        return {
          left : left,
          top : top
        }
      }
    }),


    /**
     * Computes the location of the given element in context of
     * the document dimensions.
     *
     * Supported modes:
     *
     * * <code>margin</code>: Calculate from the margin box of the element (bigger than the visual appearance: including margins of given element)
     * * <code>box</code>: Calculates the offset box of the element (default, uses the same size as visible)
     * * <code>border</code>: Calculate the border box (useful to align to border edges of two elements).
     * * <code>scroll</code>: Calculate the scroll box (relevant for absolute positioned content).
     * * <code>padding</code>: Calculate the padding box (relevant for static/relative positioned content).
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @param mode {String} A supported option. See comment above.
     * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
     *   <code>right</code> and <code>bottom</code> which contains the distance
     *   of the element relative to the document.
     */
    get : function(elem, mode)
    {
      var body = this.__computeBody(elem);

      if (elem.tagName == "BODY")
      {
        var left = body.left;
        var top = body.top;
      }
      else
      {
        var offset = this.__computeOffset(elem);
        var scroll = this.__computeScroll(elem);

        var left = offset.left + body.left - scroll.left;
        var top = offset.top + body.top - scroll.top;
      }

      // qx.log.Logger.debug(this, "Details left: " + offset.left + " | " + body.left + " | " + scroll.left);
      // qx.log.Logger.debug(this, "Details top: " + offset.top + " | " + body.top + " | " + scroll.top);

      var right = left + elem.offsetWidth;
      var bottom = top + elem.offsetHeight;

      if (mode)
      {
        // In this modes we want the size as seen from a child what means that we want the full width/height
        // which may be higher than the outer width/height when the element has scrollbars.
        if (mode == "padding" || mode == "scroll")
        {
          var overX = qx.bom.element.Overflow.getX(elem);
          if (overX == "scroll" || overX == "auto") {
            right += elem.scrollWidth - elem.offsetWidth + this.__num(elem, "borderLeftWidth") + this.__num(elem, "borderRightWidth");
          }

          var overY = qx.bom.element.Overflow.getY(elem);
          if (overY == "scroll" || overY == "auto") {
            bottom += elem.scrollHeight - elem.offsetHeight + this.__num(elem, "borderTopWidth") + this.__num(elem, "borderBottomWidth");
          }
        }

        switch(mode)
        {
          case "padding":
            left += this.__num(elem, "paddingLeft");
            top += this.__num(elem, "paddingTop");
            right -= this.__num(elem, "paddingRight");
            bottom -= this.__num(elem, "paddingBottom");
            // no break here

          case "scroll":
            left -= elem.scrollLeft;
            top -= elem.scrollTop;
            right -= elem.scrollLeft;
            bottom -= elem.scrollTop;
            // no break here

          case "border":
            left += this.__num(elem, "borderLeftWidth");
            top += this.__num(elem, "borderTopWidth");
            right -= this.__num(elem, "borderRightWidth");
            bottom -= this.__num(elem, "borderBottomWidth");
            break;

          case "margin":
            left -= this.__num(elem, "marginLeft");
            top -= this.__num(elem, "marginTop");
            right += this.__num(elem, "marginRight");
            bottom += this.__num(elem, "marginBottom");
            break;
        }
      }

      return {
        left : left,
        top : top,
        right : right,
        bottom : bottom
      };
    },


    /**
     * Computes the location of the given element in context of
     * the document dimensions. For supported modes please
     * have a look at the {@link qx.bom.element.Location#get} method.
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @param mode {String} A supported option. See comment above.
     * @return {Integer} The left distance
     *   of the element relative to the document.
     */
    getLeft : function(elem, mode) {
      return this.get(elem, mode).left;
    },


    /**
     * Computes the location of the given element in context of
     * the document dimensions.For supported modes please
     * have a look at the {@link qx.bom.element.Location#get} method.
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @param mode {String} A supported option. See comment above.
     * @return {Integer} The top distance
     *   of the element relative to the document.
     */
    getTop : function(elem, mode) {
      return this.get(elem, mode).top;
    },


    /**
     * Computes the location of the given element in context of
     * the document dimenions.For supported modes please
     * have a look at the {@link qx.bom.element.Location#get} method.
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @param mode {String} A supported option. See comment above.
     * @return {Integer} The right distance
     *   of the element relative to the document.
     */
    getRight : function(elem, mode) {
      return this.get(elem, mode).right;
    },


    /**
     * Computes the location of the given element in context of
     * the document dimenions.For supported modes please
     * have a look at the {@link qx.bom.element.Location#get} method.
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @param mode {String} A supported option. See comment above.
     * @return {Integer} The bottom distance
     *   of the element relative to the document.
     */
    getBottom : function(elem, mode) {
      return this.get(elem, mode).bottom;
    },


    /**
     * Returns the distance between two DOM elements. For supported modes please
     * have a look at the {@link qx.bom.element.Location#get} method.
     *
     * @type static
     * @param elem1 {Element} First element
     * @param elem2 {Element} Second element
     * @param mode1 {String?null} Mode for first element
     * @param mode2 {String?null} Mode for second element
     * @return {Map} Returns a map with <code>left</code> and <code>top</code>
     *   which contains the distance of the elements from each other.
     */
    getRelative : function(elem1, elem2, mode1, mode2)
    {
      var loc1 = this.get(elem1, mode1);
      var loc2 = this.get(elem2, mode2);

      return {
        left : loc1.left - loc2.left,
        top : loc1.top - loc2.top,
        right : loc1.right - loc2.right,
        bottom : loc1.bottom - loc2.bottom
      };
    }
  }
});
