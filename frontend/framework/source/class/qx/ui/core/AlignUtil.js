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
    getPosition : function(widget)
    {
      var hint = widget.getSizeHint();
      var bounds, insets;

      bounds = widget.getBounds();
      var left = bounds.left;
      var top = bounds.top;

      widget = widget.getLayoutParent()
      while (widget && !widget.isRootWidget())
      {
        bounds = widget.getBounds();
        left += bounds.left;
        top += bounds.top;

        insets = widget.getInsets();
        left += insets.left;
        top += insets.top;

        // next parent
        widget = widget.getLayoutParent();
      }

      if (widget.isRootWidget())
      {
        var rootCoords = widget.getContainerLocation();
        if (rootCoords)
        {
          left += rootCoords.left;
          top += rootCoords.top;
        }
      }

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
    align : function(widget, target, attach, align)
    {
      var parent = widget.getLayoutParent();
      var layout = parent.getLayout();
      var parentBounds = parent.getBounds();

      var widgetHint = widget.getSizeHint();
      var targetPosition = this.getPosition(target);

      console.debug("Target: ", targetPosition);

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!(layout instanceof qx.ui.layout.Basic || layout instanceof qx.ui.layout.Canvas)) {
          throw new Error("Invalid layout to align to found: " + layout);
        }
      }

      var left = 0;
      var top = 0;

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
