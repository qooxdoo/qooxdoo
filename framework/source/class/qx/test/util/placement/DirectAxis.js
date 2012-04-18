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

qx.Class.define("qx.test.util.placement.DirectAxis",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function() {
      this.axis = qx.util.placement.DirectAxis;
    },

    tearDown : function() {
      delete this.axis;
    },

    testEnoughSpace : function()
    {
      var size = 50;
      var target = {start: 500, end: 600};
      var offsets = {start: 10, end: 20};
      var areaSize = 1000;

      this.assertEquals(
        430,
        this.axis.computeStart(size, target, offsets, areaSize, "edge-start")
      );

      this.assertEquals(
        610,
        this.axis.computeStart(size, target, offsets, areaSize, "edge-end")
      );

      this.assertEquals(
        510,
        this.axis.computeStart(size, target, offsets, areaSize, "align-start")
      );

      this.assertEquals(
        530,
        this.axis.computeStart(size, target, offsets, areaSize, "align-end")
      );
    }
  }
});
