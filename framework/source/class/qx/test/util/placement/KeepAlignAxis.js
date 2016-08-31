/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.util.placement.KeepAlignAxis", {
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function() {
      this.axis = qx.util.placement.KeepAlignAxis;
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
        535,
        this.axis.computeStart(size, target, offsets, areaSize, "align-center")
      );

      this.assertEquals(
        530,
        this.axis.computeStart(size, target, offsets, areaSize, "align-end")
      );
    },


    testNotEnoughSpaceStart : function()
    {
      var size = 260;
      var target = {start: 30, end: 200};
      var offsets = {start: 10, end: 20};
      var areaSize = 1000;

      this.assertEquals(
        210,
        this.axis.computeStart(size, target, offsets, areaSize, "edge-start")
      );

      this.assertEquals(
        210,
        this.axis.computeStart(size, target, offsets, areaSize, "edge-end")
      );

      this.assertEquals(
        40,
        this.axis.computeStart(size, target, offsets, areaSize, "align-start")
      );

      this.assertEquals(
        40,
        this.axis.computeStart(size, target, offsets, areaSize, "align-center")
      );

      this.assertEquals(
        40,
        this.axis.computeStart(size, target, offsets, areaSize, "align-end")
      );
    },


    testNotEnoughSpaceEnd : function()
    {
      var size = 290;
      var target = {start: 300, end: 400};
      var offsets = {start: 10, end: 20};
      var areaSize = 500;

      this.assertEquals(
        0,
        this.axis.computeStart(size, target, offsets, areaSize, "edge-start")
      );

      this.assertEquals(
        0,
        this.axis.computeStart(size, target, offsets, areaSize, "edge-end")
      );

      this.assertEquals(
        90,
        this.axis.computeStart(size, target, offsets, areaSize, "align-start")
      );

      this.assertEquals(
        90,
        this.axis.computeStart(size, target, offsets, areaSize, "align-center")
      );

      this.assertEquals(
        90,
        this.axis.computeStart(size, target, offsets, areaSize, "align-end")
      );
    },


    testNotEnoughSpaceBothSides : function()
    {
      var size = 250;
      var target = {start: 50, end: 100};
      var offsets = {start: 10, end: 20};
      var areaSize = 200;

      this.assertEquals(
        110,
        this.axis.computeStart(size, target, offsets, areaSize, "edge-start")
      );

      this.assertEquals(
        110,
        this.axis.computeStart(size, target, offsets, areaSize, "edge-end")
      );

      this.assertEquals(
        60,
        this.axis.computeStart(size, target, offsets, areaSize, "align-start")
      );

      this.assertEquals(
        60,
        this.axis.computeStart(size, target, offsets, areaSize, "align-center")
      );

      this.assertEquals(
        60,
        this.axis.computeStart(size, target, offsets, areaSize, "align-end")
      );
    }
  }
});
