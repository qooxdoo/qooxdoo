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
qx.Bootstrap.define("qx.bom.element.Location",
{
  statics :
  {
    /**
     * Queries a style property for the given element
     *
     * @param elem {Element} DOM element to query
     * @param style {String} Style property
     * @return {String} Value of given style property
     */
    __style : function(elem, style) {
      return qx.bom.element.Style.get(elem, style, qx.bom.element.Style.COMPUTED_MODE, false);
    },


    /**
     * Queries a style property for the given element and parses it to an integer value
     *
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
     * @param elem {Element} DOM element to query
     * @return {Map} Map which contains the <code>left</code> and <code>top</code> scroll offsets
     */
    __computeScroll : function(elem)
    {
      var left = 0, top = 0;
      // Find window
      var win = qx.dom.Node.getWindow(elem);

      left -= qx.bom.Viewport.getScrollLeft(win);
      top -= qx.bom.Viewport.getScrollTop(win);

      return {
        left : left,
        top : top
      };
    },


    /**
     * Computes the offset of the given element relative to the document
     * <code>body</code>.
     *
     * @param elem {Element} DOM element to query
     * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
     */
    __computeBody : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(elem)
      {
        // Find body element
        var doc = qx.dom.Node.getDocument(elem);
        var body = doc.body;

        var left = 0;
        var top = 0;

        left -= body.clientLeft + doc.documentElement.clientLeft;
        top -= body.clientTop + doc.documentElement.clientTop;

        if (!qx.core.Environment.get("browser.quirksmode"))
        {
          left += this.__num(body, "borderLeftWidth");
          top += this.__num(body, "borderTopWidth");
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

        // only for safari < version 4.0
        if (parseFloat(qx.core.Environment.get("engine.version")) < 530.17)
        {
          left += this.__num(body, "borderLeftWidth");
          top += this.__num(body, "borderTopWidth");
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

        // add the body margin for firefox 3.0 and below
        if (parseFloat(qx.core.Environment.get("engine.version")) < 1.9) {
          left += this.__num(body, "marginLeft");
          top += this.__num(body, "marginTop");
        }

        // Correct substracted border (only in content-box mode)
        if (qx.bom.element.BoxSizing.get(body) !== "border-box")
        {
          left += this.__num(body, "borderLeftWidth");
          top += this.__num(body, "borderTopWidth");
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
     * implementation, and therefore use the traditional offset calculation
     * the gecko 1.9 fix in <code>__computeBody</code> must not be applied.
     *
     * @signature function(elem)
     * @param elem {Element} DOM element to query
     * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
     */
    __computeOffset : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(elem)
      {
        // Use faster getBoundingClientRect() if available (gecko >= 1.9)
        if (elem.getBoundingClientRect)
        {
          var rect = elem.getBoundingClientRect();

          // Firefox 3.0 alpha 6 (gecko 1.9) returns floating point numbers
          // use Math.round() to round them to style compatible numbers
          // MSHTML returns integer numbers
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

      "default" : function(elem)
      {
        var doc = qx.dom.Node.getDocument(elem);

        // Use faster getBoundingClientRect() if available
        if (elem.getBoundingClientRect)
        {
          var rect = elem.getBoundingClientRect();

          var left = Math.round(rect.left);
          var top = Math.round(rect.top);
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
     * @param elem {Element} DOM element to query
     * @param mode {String?box} A supported option. See comment above.
     * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
     *   <code>right</code> and <code>bottom</code> which contains the distance
     *   of the element relative to the document.
     */
    get : function(elem, mode)
    {
      if (elem.tagName == "BODY")
      {
        var location = this.__getBodyLocation(elem);
        var left = location.left;
        var top = location.top;
      }
      else
      {
        var body = this.__computeBody(elem);
        var offset = this.__computeOffset(elem);
        // Reduce by viewport scrolling.
        // Hint: getBoundingClientRect returns the location of the
        // element in relation to the viewport which includes
        // the scrolling
        var scroll = this.__computeScroll(elem);

        var left = offset.left + body.left - scroll.left;
        var top = offset.top + body.top - scroll.top;
      }

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
     * Get the location of the body element relative to the document.
     * @param body {Element} The body element.
     */
    __getBodyLocation : function(body)
    {
      var top = body.offsetTop;
      var left = body.offsetLeft;

      if (qx.core.Environment.get("engine.name") !== "mshtml" ||
         !((parseFloat(qx.core.Environment.get("engine.version")) < 8 ||
          qx.core.Environment.get("browser.documentmode") < 8) &&
          !qx.core.Environment.get("browser.quirksmode")))
      {
        top += this.__num(body, "marginTop");
        left += this.__num(body, "marginLeft");
      }

      if (qx.core.Environment.get("engine.name") === "gecko") {
        top += this.__num(body, "borderLeftWidth");
        left +=this.__num(body, "borderTopWidth");
      }

      return {left: left, top: top};
    },


    /**
     * Computes the location of the given element in context of
     * the document dimensions. For supported modes please
     * have a look at the {@link qx.bom.element.Location#get} method.
     *
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
     * the document dimensions. For supported modes please
     * have a look at the {@link qx.bom.element.Location#get} method.
     *
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
     * the document dimensions. For supported modes please
     * have a look at the {@link qx.bom.element.Location#get} method.
     *
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
     * the document dimensions. For supported modes please
     * have a look at the {@link qx.bom.element.Location#get} method.
     *
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
    },


    /**
     * Returns the distance between the given element to its offset parent.
     *
     * @param elem {Element} DOM element to query
     * @return {Map} Returns a map with <code>left</code> and <code>top</code>
     *   which contains the distance of the elements from each other.
     */
    getPosition: function(elem) {
      return this.getRelative(elem, this.getOffsetParent(elem));
    },


    /**
     * Detects the offset parent of the given element
     *
     * @param element {Element} Element to query for offset parent
     * @return {Element} Detected offset parent
     */
    getOffsetParent : function(element)
    {
      var offsetParent = element.offsetParent || document.body;
      var Style = qx.bom.element.Style;

      while (offsetParent && (!/^body|html$/i.test(offsetParent.tagName) && Style.get(offsetParent, "position") === "static")) {
        offsetParent = offsetParent.offsetParent;
      }

      return offsetParent;
    }
  }
});
