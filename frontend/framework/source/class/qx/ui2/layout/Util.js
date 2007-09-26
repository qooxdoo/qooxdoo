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
      var fillUp = spaceDifference > 0;
      var remaining = Math.abs(spaceDifference);

      // Initialialize return field
      var flexOffsets = {};
      for (var i=0, l=flexibles.length; i<l; i++) {
        flexOffsets[flexibles[i].id] = 0;
      }


      while (flexibles.length > 0 && remaining != 0)
      {
        qx.core.Log.debug("!! Flex loop, remaining space: " + remaining);

        var minFlexUnit = 32000;
        var minEntry;
        var flexCount = 0;
        var flexLength = flexibles.length;
        var hasFlexPotential = false;

        for (var i=0; i<flexLength; i++)
        {
          child = flexibles[i];

          if (child.potential == 0) {
            continue;
          }

          hasFlexPotential = true;

          flexCount += child.flex;
          flexUnit = child.potential / child.flex; // pixel per flex unit

          qx.core.Log.debug("  - potential: " + child.potential + ", flex unit: " + flexUnit);

          if (flexUnit < minFlexUnit) {
            minFlexUnit = flexUnit;
          }
        }

        if (!hasFlexPotential) {
          break;
        }

        qx.core.Log.debug("Min Flex Unit: " + minFlexUnit);

        pixelIncrement = minFlexUnit * flexCount // pixel to grow
        pixelTodo = Math.min(remaining, pixelIncrement);
        minFlexUnit = pixelTodo / flexCount; // corrected flex unit minimum
        childRounding = 0;

        qx.core.Log.debug("Pixel to grow: " + pixelIncrement);
        qx.core.Log.debug("Pixel todo: " + pixelTodo);
        qx.core.Log.debug("Corrected minFlexUnit: " + minFlexUnit);

        var roundingError = 0;

        for (var i=flexLength-1; i>=0; i--)
        {
          child = flexibles[i];

          if (child.potential == 0) {
            continue;
          }

          childGrow = Math.min(remaining, child.potential, Math.ceil(minFlexUnit * child.flex));
          roundingError += childGrow - (minFlexUnit * child.flex);

          if (roundingError >= 1)
          {
            roundingError -= 1;
            childGrow -= 1;
          }

          qx.core.Log.debug("Rounding error: ", roundingError);

          flexOffsets[child.id] += (fillUp ? childGrow : -childGrow);

          child.potential -= childGrow;
          remaining -= childGrow;

          qx.core.Log.debug("  - grow by: " + childGrow + " (potential: " + child.potential + ")");
        }
      }

      return flexOffsets;
    }
  }
});
