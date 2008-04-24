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

qx.Class.define("qx.ui.layout.Util",
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
     * @return {Map} A map which contains the calculated offsets under the key
     *   which is identical to the ID given in the incoming map.
     */
    computeFlexOffsets : function(flexibles, avail, used)
    {
      var child, key, flexSum, flexStep, flexValue;
      var grow = avail > used;
      var remaining = Math.abs(avail - used);
      var roundingOffset, currentOffset;

      var result = {};

      // Preprocess data
      for (key in flexibles)
      {
        child = flexibles[key];
        result[key] =
        {
          potential : grow ? child.max - child.value : child.value - child.min,
          flex : grow ? child.flex : 1 / child.flex,
          offset : 0
        }
      }


      // Continue as long as we need to do anything
      while (remaining != 0)
      {
        // Find minimum potential for next correction
        flexStep = Infinity;
        flexSum = 0;
        for (key in result)
        {
          child = result[key];

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


        // Start with correction
        roundingOffset = 0;
        for (key in result)
        {
          child = result[key];

          if (child.potential > 0)
          {
            // Compute offset for this step
            currentOffset = Math.min(remaining, child.potential, Math.ceil(flexStep * child.flex));

            // Fix rounding issues
            roundingOffset += currentOffset - flexStep * child.flex;
            if (roundingOffset >= 1)
            {
              roundingOffset -= 1;
              currentOffset -= 1;
            }

            // Update child status
            child.potential -= currentOffset;

            if (grow) {
              child.offset += currentOffset;
            } else {
              child.offset -= currentOffset;
            }

            // Update parent status
            remaining -= currentOffset;
          }
        }
      }

      return result;
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
     * @return {Integer} The collapsed margin
     */
    collapseMargins : function(varargs)
    {
      var max=0, min=0;
      for (var i=0, l=arguments.length; i<l; i++)
      {
        value = arguments[i];

        if (value < 0) {
          min = Math.min(min, value);
        } else if (value > 0) {
          max = Math.max(max, value);
        }
      }

      return max + min;
    },


    computeHorizontalGaps : function(children, spacing, collapse)
    {
      if (spacing == null) {
        spacing = 0;
      }

      var gaps = 0;

      if (collapse)
      {
        // Add first child
        gaps += children[0].getMarginLeft();

        for (var i=1, l=children.length; i<l; i+=1) {
          gaps += this.collapseMargins(spacing, children[i-1].getMarginRight(), children[i].getMarginLeft());
        }

        // Add last child
        gaps += children[l-1].getMarginRight();
      }
      else
      {
        // Simple adding of all margins
        for (var i=1, l=children.length; i<l; i+=1) {
          gaps += children[i].getMarginLeft() + children[i].getMarginRight();
        }

        // Add spacing
        gaps += (spacing * (l-1))
      }

      return gaps;
    },


    computeVerticalGaps : function(children, spacing, collapse)
    {
      if (spacing == null) {
        spacing = 0;
      }

      var gaps = 0;

      if (collapse)
      {
        // Add first child
        gaps += children[0].getMarginTop();

        for (var i=1, l=children.length; i<l; i+=1) {
          gaps += this.collapseMargins(spacing, children[i-1].getMarginBottom(), children[i].getMarginTop());
        }

        // Add last child
        gaps += children[l-1].getMarginBottom();
      }
      else
      {
        // Simple adding of all margins
        for (var i=1, l=children.length; i<l; i+=1) {
          gaps += children[i].getMarginTop() + children[i].getMarginBottom();
        }

        // Add spacing
        gaps += (spacing * (l-1))
      }

      return gaps;
    }
  }
});
