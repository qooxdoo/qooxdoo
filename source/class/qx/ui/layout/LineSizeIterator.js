/* ************************************************************************

   qooxdoo - the new era of web development
   http://qooxdoo.org

   Copyright:
     2008 Dihedrals.com, http://www.dihedrals.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Chris Banford (zermattchris)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This class iterates over the lines in a flow layout.
 *
 * @internal
 */
qx.Class.define("qx.ui.layout.LineSizeIterator",
{
  extend : Object,

  /**
   * @param children {qx.ui.core.Widget[]} The children of the flow layout to
   *    compute the lines from
   * @param spacing {Integer} The horizontal spacing between the children
   */
  construct : function(children, spacing)
  {
    this.__children = children;
    this.__spacing = spacing;

    this.__hasMoreLines = children.length > 0;
    this.__childIndex = 0;
  },

  members :
  {
    __children : null,
    __spacing : null,
    __hasMoreLines : null,
    __childIndex : null,


    /**
     * Computes the properties of the next line taking the available width into
     * account
     *
     * @param availWidth {Integer} The available width for the next line
     * @return {Map} A map containing the line's properties.
     */
    computeNextLine : function(availWidth)
    {
      var availWidth = availWidth || Infinity;

      if (!this.__hasMoreLines) {
        throw new Error("No more lines to compute");
      }

      var children = this.__children;
      var lineHeight = 0;
      var lineWidth = 0;
      var lineChildren = [];
      var gapsBefore = [];

      for (var i=this.__childIndex; i<children.length; i++)
      {
        var child = children[i];
        var size = child.getSizeHint();

        var gapBefore = this.__computeGapBeforeChild(i);
        var childWidth = size.width + gapBefore;
        var isFirstChild = i == this.__childIndex;
        if (!isFirstChild && lineWidth + childWidth > availWidth)
        {
          this.__childIndex = i;
          break;
        }

        var childHeight = size.height + child.getMarginTop() + child.getMarginBottom();
        lineChildren.push(child);
        gapsBefore.push(gapBefore);
        lineWidth += childWidth;
        lineHeight = Math.max(lineHeight, childHeight);

        if (child.getLayoutProperties().lineBreak) {
          this.__childIndex = i+1;
          break;
        }
      }

      if (i >= children.length) {
        this.__hasMoreLines = false;
      }

      return {
        height: lineHeight,
        width: lineWidth,
        children: lineChildren,
        gapsBefore : gapsBefore
      };
    },


    /**
     * Computes the gap before the child at the given index
     *
     * @param childIndex {Integer} The index of the child widget
     * @return {Integer} The gap before the given child
     */
    __computeGapBeforeChild : function(childIndex)
    {
      var isFirstInLine = childIndex == this.__childIndex;
      if (isFirstInLine) {
        return this.__children[childIndex].getMarginLeft();
      } else {
        return Math.max(
          this.__children[childIndex-1].getMarginRight(),
          this.__children[childIndex].getMarginLeft(),
          this.__spacing
        );
      }
    },


    /**
     * Whether there are more lines
     *
     * @return {Boolean} Whether there are more lines
     */
    hasMoreLines : function() {
      return this.__hasMoreLines;
    }
  }
});