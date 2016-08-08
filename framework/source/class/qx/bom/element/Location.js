/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
 *
 * @ignore(SVGElement)
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
     * @signature function(elem)
     * @param elem {Element} DOM element to query
     * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
     */
    __computeOffset : function(elem)
    {
      var rect = elem.getBoundingClientRect();

      // Firefox 3.0 alpha 6 (gecko 1.9) returns floating point numbers
      // use Math.round() to round them to style compatible numbers
      // MSHTML returns integer numbers
      return {
        left : Math.round(rect.left),
        top : Math.round(rect.top)
      };
    },


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

      var elementWidth;
      var elementHeight;
      if (elem instanceof SVGElement) {
        var rect = elem.getBoundingClientRect();
        elementWidth = rect.width;
        elementHeight = rect.height;
      }
      else {
        elementWidth = elem.offsetWidth;
        elementHeight = elem.offsetHeight;
      }

      var right = left + elementWidth;
      var bottom = top + elementHeight;

      if (mode)
      {
        // In this modes we want the size as seen from a child what means that we want the full width/height
        // which may be higher than the outer width/height when the element has scrollbars.
        if (mode == "padding" || mode == "scroll")
        {
          var overX = qx.bom.element.Style.get(elem, "overflowX");
          if (overX == "scroll" || overX == "auto") {
            right += elem.scrollWidth - elementWidth + this.__num(elem, "borderLeftWidth") + this.__num(elem, "borderRightWidth");
          }

          var overY = qx.bom.element.Style.get(elem, "overflowY");
          if (overY == "scroll" || overY == "auto") {
            bottom += elem.scrollHeight - elementHeight + this.__num(elem, "borderTopWidth") + this.__num(elem, "borderBottomWidth");
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
     * @return {Map} map with the keys <code>left</code> and <code>top</code>
     */
    __getBodyLocation : function(body)
    {
      var top = body.offsetTop;
      var left = body.offsetLeft;

      top += this.__num(body, "marginTop");
      left += this.__num(body, "marginLeft");

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
      // Ther is no offsetParent for SVG elements
      if (element instanceof SVGElement) {
        return document.body;
      }

      var offsetParent = element.offsetParent || document.body;
      var Style = qx.bom.element.Style;

      while (offsetParent && (!/^body|html$/i.test(offsetParent.tagName) && Style.get(offsetParent, "position") === "static")) {
        offsetParent = offsetParent.offsetParent;
      }

      return offsetParent;
    }
  }
});
