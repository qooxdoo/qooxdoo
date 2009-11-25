/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Places the object to the target. If parts of the object are outside of the
 * range this class places the object at the best "edge", "alignment"
 * combination so that the overlap between object and range is maximized.
 */
qx.Class.define("qx.util.placement.KeepAlignAxis",
{
  extend : qx.util.placement.AbstractAxis,

  members :
  {
    //overridden
    computeStart : function(size, target, offsets, areaSize, position)
    {
      var start = this._moveToEdgeAndAlign(size, target, offsets, position);
      var range1End, range2Start;

      if (this._isInRange(start, size, areaSize)) {
        return start;
      }

      if (position == "edge-start" || position == "edge-end")
      {
        range1End = target.start - offsets.end;
        range2Start = target.end + offsets.start;
      }
      else
      {
        range1End = target.end - offsets.end;
        range2Start = target.start + offsets.start;
      }

      if (range1End > areaSize - range2Start) {
        start = range1End - size;
      } else {
        start = range2Start;
      }

      return start;
    }
  }
});