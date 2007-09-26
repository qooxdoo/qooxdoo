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
      var minFlexUnit, flexCount, hasFlexPotential;
      var roundingError, childOffset;
      var flexLength = flexibles.length;


      // Normalize space difference
      var fillUp = spaceDifference > 0;
      var remaining = Math.abs(spaceDifference);


      // Initialialize return field
      var offsets = {};
      for (var i=0, l=flexLength; i<l; i++) {
        offsets[flexibles[i].id] = 0;
      }


      // Continue as long as we need to do anything
      while (remaining != 0)
      {
        // qx.core.Log.debug("Flex loop, remaining space: " + remaining);

        minFlexUnit = 32000;
        flexCount = 0;
        hasFlexPotential = false;

        // Find minimum potential for next correction
        for (var i=0; i<flexLength; i++)
        {
          child = flexibles[i];

          if (child.potential == 0) {
            continue;
          }

          hasFlexPotential = true;

          flexCount += child.flex;
          flexUnit = child.potential / child.flex;

          // qx.core.Log.debug("  - potential: " + child.potential + ", flex unit: " + flexUnit);

          if (flexUnit < minFlexUnit) {
            minFlexUnit = flexUnit;
          }
        }

        if (!hasFlexPotential) {
          break;
        }

        // qx.core.Log.debug("Min Flex Unit: " + minFlexUnit);

        pixelIncrement = minFlexUnit * flexCount;
        pixelTodo = Math.min(remaining, pixelIncrement);
        minFlexUnit = pixelTodo / flexCount;

        // qx.core.Log.debug("Pixel to grow: " + pixelIncrement);
        // qx.core.Log.debug("Pixel todo: " + pixelTodo);
        // qx.core.Log.debug("Corrected minFlexUnit: " + minFlexUnit);

        roundingError = 0;
        for (var i=flexLength-1; i>=0; i--)
        {
          child = flexibles[i];

          if (child.potential == 0) {
            continue;
          }

          childOffset = Math.min(remaining, child.potential, Math.ceil(minFlexUnit * child.flex));

          // Fix rounding issue
          roundingError += childOffset - (minFlexUnit * child.flex);
          if (roundingError >= 1)
          {
            roundingError -= 1;
            childOffset -= 1;
          }

          // qx.core.Log.debug("Rounding error: ", roundingError);

          // Update child status
          child.potential -= childOffset;

          // Update parent status
          remaining -= childOffset;

          // Store child offset
          offsets[child.id] += (fillUp ? childOffset : -childOffset);

          // qx.core.Log.debug("  - grow by: " + childOffset + " (potential: " + child.potential + ")");
        }
      }

      return offsets;
    }
  }
});
