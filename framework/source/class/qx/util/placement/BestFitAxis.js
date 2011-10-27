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
 * Places the object according to the target. If parts of the object are outside
 * of the axis' range the object's start is adjusted so that the overlap between
 * the object and the axis is maximized.
 */
qx.Class.define("qx.util.placement.BestFitAxis",
{
  extend : qx.util.placement.AbstractAxis,

  members :
  {
    // overridden
    computeStart : function(size, target, offsets, areaSize, position)
    {
      var start = this._moveToEdgeAndAlign(size, target, offsets, position);

      if (this._isInRange(start, size, areaSize)) {
        return start;
      }

      if (start < 0) {
        start = Math.min(0, areaSize-size);
      }

      if (start + size > areaSize) {
        start = Math.max(0, areaSize - size);
      }

      return start;
    }
  }
});
