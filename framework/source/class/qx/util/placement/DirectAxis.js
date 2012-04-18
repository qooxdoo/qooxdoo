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
 * Places the object directly at the specified position. It is not moved if
 * parts of the object are outside of the axis' range.
 */
qx.Bootstrap.define("qx.util.placement.DirectAxis",
{
  statics :
  {
    _moveToEdgeAndAlign : qx.util.placement.AbstractAxis._moveToEdgeAndAlign,
    
    computeStart : function(size, target, offsets, areaSize, position) {
      return this._moveToEdgeAndAlign(size, target, offsets, position);
    }
  }
});