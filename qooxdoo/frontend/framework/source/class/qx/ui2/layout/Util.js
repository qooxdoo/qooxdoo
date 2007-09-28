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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui2.layout.Util",
{
  statics :
  {
    computeFlexOffsets : function(flexibles, spaceDifference)
    {
      var child;
      var flexSum, flexStep;
      var roundingOffset, childOffset;
      var flexLength = flexibles.length;


      // Normalize space difference
      var fillUp = spaceDifference > 0;
      var remaining = Math.abs(spaceDifference);


      // Initialialize return field
      var offsets = [];
      for (var i=0, l=flexLength; i<l; i++)
      {
        child = flexibles[i];
        offsets[child.id] = 0;
      }


      // Continue as long as we need to do anything
      while (remaining != 0)
      {
        // qx.core.Log.debug("Flex loop, remaining: " + remaining);

        // Find minimum potential for next correction
        flexStep = 32000;
        flexSum = 0;
        for (var i=0; i<flexLength; i++)
        {
          child = flexibles[i];

          if (child.potential > 0)
          {
            flexSum += child.flex;
            flexStep = Math.min(flexStep, child.potential / child.flex);
          }
        }


        // No potential found, quit here
        if (flexSum == 0) {
          break;
        }


        // Respect maximum potential given through remaining space
        // The parent should always win in such conflicts.
        flexStep = Math.min(remaining, flexStep * flexSum) / flexSum;
        // qx.core.Log.debug("Flex Step (corrected): " + flexStep);


        // Start with correction
        roundingOffset = 0;
        for (var i=flexLength-1; i>=0; i--)
        {
          child = flexibles[i];

          if (child.potential > 0)
          {
            // Compute offset for this step
            childOffset = Math.min(remaining, child.potential, Math.ceil(flexStep * child.flex));

            // Fix rounding issues
            roundingOffset += childOffset - (flexStep * child.flex);
            if (roundingOffset >= 1)
            {
              roundingOffset -= 1;
              childOffset -= 1;
            }

            // Update child status
            child.potential -= childOffset;
            offsets[child.id] += (fillUp ? childOffset : -childOffset);

            // Update parent status
            remaining -= childOffset;

            // qx.core.Log.debug("  - grow by: " + childOffset + " (potential: " + child.potential + ")");
          }
        }
      }

      return offsets;
    },


    computeHorizontalAlignOffset : function(hAlign, widgetWidth, outerWidth)
    {
      if (widgetWidth !== outerWidth)
      {
        switch (hAlign)
        {
          case "left":
            return 0;
            break;

          case "center":
            return Math.floor((outerWidth - widgetWidth) / 2);
            break;

          case "right":
            return outerWidth - widgetWidth;
            break;

          default:
            throw new Error("Invalid state!")
        }
      }

      return 0;
    },


    computeVerticalAlignOffset : function(vAlign, widgetHeight, outerHeight)
    {
      if (widgetHeight !== outerHeight)
      {
        switch (vAlign)
        {
          case "top":
            return 0;

          case "middle":
            return Math.floor((outerHeight - widgetHeight) / 2);
            break;

          case "bottom":
            return outerHeight - widgetHeight;
            break;

          default:
            throw new Error("Invalid state!")
        }
      }

      return 0;
    }
  }
});
