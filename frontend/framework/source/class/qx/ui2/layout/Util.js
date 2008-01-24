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

qx.Class.define("qx.ui2.layout.Util",
{
  statics :
  {
    /** {Regexp} Regular expression to match percent values */
    PERCENT_VALUE : /[0-9.]+%/,


    /** {Regexp} Regular expression to match flex values */
    FLEX_VALUE : /[0-9]+\*/,


    /**
     * Computes the flex offsets needed to reduce the space
     * difference as much as possible by respecting the
     * potential of the given elements (being in the range of
     * their min/max values)
     *
     * @type static
     * @param flexibles {Map[]) Each entry must have these keys:
     *   <code>id</code>, <code>potential</code> and <code>flex</code>.
     *   The ID is used in the result map as the key for the user to work
     *   with later (e.g. upgrade sizes etc. to respect the given offset)
     *   The potential is an integer value which is the difference of the
     *   currently interesting direction (e.g. shrinking=width-minWidth, growing=
     *   maxWidth-width). The flex key holds the flex value of the item.
     * @param spaceDifference {Integer} The difference which should be reduced.
     * @return {Map} A map which contains the calculated offsets under the key
     *   which is identical to the ID given in the incoming map.
     */
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
      var offsets = {};
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
        flexStep = Infinity;
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


    /**
     * Computes the offset which needs to be added to the left position
     * to result in the stated horizontal alignment.
     *
     * @type static
     * @param hAlign {String} One of <code>left</code>, <code>center</code> or <code>right</code>.
     * @param widgetWidth {Integer} The absolute (outer) width of the widget
     * @param parentWidth {Integer} The absolute (inner) width of the parent
     * @return {Integer} Computed offset left
     */
    computeHorizontalAlignOffset : function(hAlign, widgetWidth, parentWidth)
    {
      var value = 0;

      if (widgetWidth !== parentWidth && hAlign && hAlign !== "left")
      {
        value = parentWidth - widgetWidth;

        if (hAlign === "center") {
          value = Math.round(value / 2);
        }
      }

      return value;
    },


    /**
     * Computes the offset which needs to be added to the top position
     * to result in the stated vertical alignment.
     *
     * @type static
     * @param vAlign {String} One of <code>top</code>, <code>middle</code> or <code>bottom</code>.
     * @param widgetHeight {Integer} The absolute (outer) height of the widget
     * @param parentHeight {Integer} The absolute (inner) height of the parent
     * @return {Integer} Computed offset top
     */
    computeVerticalAlignOffset : function(vAlign, widgetHeight, parentHeight)
    {
      var value = 0;

      if (widgetHeight !== parentHeight && vAlign && vAlign !== "top")
      {
        value = parentHeight - widgetHeight;

        if (vAlign === "middle") {
          value = Math.round(value / 2);
        }
      }

      return value;
    },


    /**
     * Collapses two margins.
     *
     * @type member
     * @param end {Integer} End margin (right or bottom)
     * @param start {Integer} Start margin (left or top)
     * @return {Integer} The collapsed margin
     */
    collapseMargins : function(end, start)
    {
      // Math.max detects 'null' as more ('0') than '-1'
      // we need to work around this
      if (end && start) {
        return Math.max(end, start);
      } else if (start) {
        return start;
      } else if (end) {
        return end;
      }

      return 0;
    }
  }
});
