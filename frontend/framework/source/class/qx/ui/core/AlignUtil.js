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
     *
     *
     *
     *
     *
     */
    align : function(widget, target, value)
    {
      var parent = widget.getLayoutParent();
      var parentBounds = parent.getBounds();

      var widgetHint = widget.getSizeHint();
      var targetPosition = target.getContainerLocation() || this.getLayoutLocation(target);

      console.debug("Target: ", targetPosition);

      var left = 0;
      var top = 0;

      var attach = value.split("-")[0];
      var align = value.split("-")[1];

      switch(attach)
      {
        case "left":
          left = targetPosition.left - widgetHint.width;
          break;

        case "top":
          top = targetPosition.top - widgetHint.height;
          break;

        case "right":
          left = targetPosition.right;
          break;

        case "bottom":
          top = targetPosition.bottom;
          break;
      }

      switch(align)
      {
        case "left":
          left = targetPosition.left;
          break;

        case "top":
          top = targetPosition.top;
          break;

        case "right":
          left = targetPosition.right - widgetHint.width;
          break;

        case "bottom":
          top = targetPosition.bottom - widgetHint.height;
          break;
      }

      var right = left + widgetHint.width;
      var bottom = top + widgetHint.height;


      var validX = left >= 0 && right <= parentBounds.width;
      var validY = top >= 0 && bottom <= parentBounds.height;

      var fixed;
      var tweakedX = false;
      var tweakedY = false;

      if (!validX)
      {

      }

      if (!validY)
      {
        if (top < 0)
        {
          if (align == "bottom") {
            fixed = targetPosition.top;
          } else if (attach == "top") {
            fixed = targetPosition.bottom;
          }
        }
        else if (bottom > parentBounds.height)
        {
          if (align == "top") {
            fixed = targetPosition.bottom - widgetHint.height;
          } else if (attach == "bottom") {
            fixed = targetPosition.top - widgetHint.height;
          }
        }

        bottom = fixed + widgetHint.height;
        validY = fixed >= 0 && bottom <= parentBounds.height;

        if (validY)
        {
          top = fixed;
          tweakedY = true;
        }
      }


      return {
        left : left,
        top : top,
        validX : validX,
        validY : validY,
        tweakedX : tweakedX,
        tweakedY : tweakedY
      }
    }
  }
});
