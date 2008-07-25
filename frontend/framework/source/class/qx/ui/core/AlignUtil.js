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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.core.AlignUtil",
{
  statics :
  {
    /**
     * Returns the location data like {qx.bom.element.Location#get} does
     * but do not rely on DOM elements to be rendered. Instead this method
     * works with the available layout data in the moment executed. This works
     * best when called in some type of <code>resize</code> or <code>move</code>
     * event which are supported by all widgets out of the box.
     *
     * @param widget {qx.ui.core.Widget} Any widget
     * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
     *   <code>right</code> and <code>bottom</code> which contains the distance
     *   of the element relative to the document.
     */
    getLayoutLocation : function(widget)
    {
      // Use post-layout dimensions
      // which do not rely on the final rendered DOM element
      var insets, bounds, left, top;

      // Pre-cache hint before modifying the widget variable
      var hint = widget.getBounds();

      // Add bounds of the widget itself
      bounds = widget.getBounds();
      left = bounds.left;
      top = bounds.top;

      // Now loop up with parents until reaching the root
      widget = widget.getLayoutParent();
      while (widget && !widget.isRootWidget())
      {
        // Add coordinates
        bounds = widget.getBounds();
        left += bounds.left;
        top += bounds.top;

        // Add insets
        insets = widget.getInsets();
        left += insets.left;
        top += insets.top;

        // Next parent
        widget = widget.getLayoutParent();
      }

      // Add the rendered location of the root widget
      if (widget.isRootWidget())
      {
        var rootCoords = widget.getContainerLocation();
        if (rootCoords)
        {
          left += rootCoords.left;
          top += rootCoords.top;
        }
      }

      // Build location data
      return {
        left : left,
        top : top,
        right : left + hint.width,
        bottom : top + hint.height
      };
    },


    /**
     * Returns coordinates to align a widget to another one.
     *
     * @param widget {qx.ui.core.Widget} Widget to align
     * @param target {qx.ui.core.Widget} Target to align to
     * @param align {String} Alignment to respect
     * @param correct {Boolean?false} Whether the position should be auto-corrected
     *   depending on the available space
     */
    alignToWidget : function(widget, target, align, correct)
    {
      var coords = target.getContainerLocation() || this.getLayoutLocation(target);
      return this.__align(widget, coords, align, correct);
    },


    /**
     * Returns coordinates to align a widget to the mouse cursor
     *
     * @param widget {qx.ui.core.Widget} Widget to align
     * @param event {qx.event.type.Mouse} Mouse event to align to
     * @param align {String} Alignment to respect
     * @param correct {Boolean?false} Whether the position should be auto-corrected
     *   depending on the available space
     */
    alignToMouse : function(widget, event, align, correct)
    {
      var left = event.getDocumentLeft();
      var top = event.getDocumentTop();

      return this.alignToPoint(widget, left, top, align, correct);
    },


    /**
     * Returns coordinates to align a widget to the mouse cursor
     *
     * @param widget {qx.ui.core.Widget} Widget to align
     * @param left {Integer} Left coordinate
     * @param top {Integer} Top coordinate
     * @param align {String} Alignment to respect
     * @param correct {Boolean?false} Whether the position should be auto-corrected
     *   depending on the available space
     */
    alignToPoint : function(widget, left, top, align, correct)
    {
      var coords = { left: left, top: top, right: left+1, bottom:top+1 };
      return this.__align(widget, coords, align, correct);
    },


    /**
     *
     *
     *
     * @param align {String} Alignment to respect
     * @param correct {Boolean?false} Whether the position should be auto-corrected
     *   depending on the available space
     */
    __align : function(widget, coords, value, correct)
    {
      var parent = widget.getLayoutParent();
      var parentBounds = parent.getBounds();
      var widgetHint = widget.getSizeHint();

      var left = 0;
      var top = 0;

      var edge = value.split("-")[0];
      var align = value.split("-")[1];

      // Process edge part
      switch(edge)
      {
        case "left":
          left = coords.left - widgetHint.width;
          break;

        case "top":
          top = coords.top - widgetHint.height;
          break;

        case "right":
          left = coords.right;
          break;

        case "bottom":
          top = coords.bottom;
          break;
      }

      // Process align part
      switch(align)
      {
        case "left":
          left = coords.left;
          break;

        case "top":
          top = coords.top;
          break;

        case "right":
          left = coords.right - widgetHint.width;
          break;

        case "bottom":
          top = coords.bottom - widgetHint.height;
          break;
      }

      if (correct === false)
      {
        return {
          left : left,
          top : top
        };
      }
      else
      {
        var ratingX = Math.min(left, parentBounds.width-left-widgetHint.width);
        if (ratingX < 0)
        {
          var fixedLeft = left;

          if (left < 0)
          {
            if (edge == "left") {
              fixedLeft = coords.right;
            } else if (align == "right") {
              fixedLeft = coords.left;
            }
          }
          else
          {
            if (edge == "right") {
              fixedLeft = coords.left - widgetHint.width;
            } else if (align == "left") {
              fixedLeft = coords.right - widgetHint.width;
            }
          }

          // Review fixed rating result
          fixedRatingX = Math.min(fixedLeft, parentBounds.width-fixedLeft-widgetHint.width);
          if (fixedRatingX > ratingX)
          {
            left = fixedLeft;
            ratingX = fixedRatingX;
          }
        }

        var ratingY = Math.min(top, parentBounds.height-top-widgetHint.height);
        if (ratingY < 0)
        {
          var fixedTop = top;

          if (top < 0)
          {
            if (edge == "top") {
              fixedTop = coords.bottom;
            } else if (align == "bottom") {
              fixedTop = coords.top;
            }
          }
          else
          {
            if (edge == "bottom") {
              fixedTop = coords.top - widgetHint.height;
            } else if (align == "top") {
              fixedTop = coords.bottom - widgetHint.height;
            }
          }

          // Review fixed rating result
          fixedRatingY = Math.min(fixedTop, parentBounds.height-fixedTop-widgetHint.height);
          if (fixedRatingY > ratingY)
          {
            top = fixedTop;
            ratingY = fixedRatingY;
          }
        }

        return {
          left : left,
          top : top,
          ratingX : ratingX,
          ratingY : ratingY
        }
      }
    }
  }
});
