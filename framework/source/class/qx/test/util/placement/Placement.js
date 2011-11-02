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


qx.Class.define("qx.test.util.placement.Placement",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testEnoughSpace : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 1000, height: 1000};
      var target = {left: 500, top: 500, right: 600, bottom: 550};
      var offsets = {top: 0, left: 0, bottom: 0, right: 0};

      var modes = ["direct", "keep-align", "best-fit"];
      for (var i=0; i<modes.length; i++)
      {
        var mode = modes[i];

        this.assertJsonEquals(
          {left: 500, top: 200},
          qx.util.placement.Placement.compute(size, area, target, offsets, "top-left", mode, mode)
        );

        this.assertJsonEquals(
          {left: 400, top: 200},
          qx.util.placement.Placement.compute(size, area, target, offsets, "top-right", mode, mode)
        );

        this.assertJsonEquals(
          {left: 500, top: 550},
          qx.util.placement.Placement.compute(size, area, target, offsets, "bottom-left", mode, mode)
        );

        this.assertJsonEquals(
          {left: 400, top: 550},
          qx.util.placement.Placement.compute(size, area, target, offsets, "bottom-right", mode, mode)
        );

        this.assertJsonEquals(
          {left: 300, top: 500},
          qx.util.placement.Placement.compute(size, area, target, offsets, "left-top", mode, mode)
        );

        this.assertJsonEquals(
          {left: 300, top: 250},
          qx.util.placement.Placement.compute(size, area, target, offsets, "left-bottom", mode, mode)
        );

        this.assertJsonEquals(
          {left: 600, top: 500},
          qx.util.placement.Placement.compute(size, area, target, offsets, "right-top", mode, mode)
        );

        this.assertJsonEquals(
          {left: 600, top: 250},
          qx.util.placement.Placement.compute(size, area, target, offsets, "right-bottom", mode, mode)
        );
      }
    },


    testRestrictedBottomKeepAlign : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 1000, height: 600};
      var target = {left: 500, top: 500, right: 600, bottom: 550};
      var offsets = {top: 0, left: 0, bottom: 0, right: 0};

      this.assertJsonEquals(
        {left: 500, top: 200},
        qx.util.placement.Placement.compute(size, area, target, offsets, "bottom-left", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 400, top: 200},
        qx.util.placement.Placement.compute(size, area, target, offsets, "bottom-right", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 300, top: 250},
        qx.util.placement.Placement.compute(size, area, target, offsets, "left-top", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 600, top: 250},
        qx.util.placement.Placement.compute(size, area, target, offsets, "right-top", "keep-align", "keep-align")
      );
    },


    testRestrictedTopKeepAlign : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 1000, height: 1000};
      var target = {left: 500, top: 100, right: 600, bottom: 150};
      var offsets = {top: 0, left: 0, bottom: 0, right: 0};

      this.assertJsonEquals(
        {left: 500, top: 150},
        qx.util.placement.Placement.compute(size, area, target, offsets, "top-left", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 400, top: 150},
        qx.util.placement.Placement.compute(size, area, target, offsets, "top-right", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 300, top: 100},
        qx.util.placement.Placement.compute(size, area, target, offsets, "left-bottom", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 600, top: 100},
        qx.util.placement.Placement.compute(size, area, target, offsets, "right-bottom", "keep-align", "keep-align")
      );
    },


    testRestrictedRightKeepAlign : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 700, height: 1000};
      var target = {left: 500, top: 500, right: 600, bottom: 550};
      var offsets = {top: 0, left: 0, bottom: 0, right: 0};

      this.assertJsonEquals(
        {left: 300, top: 500},
        qx.util.placement.Placement.compute(size, area, target, offsets, "right-top", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 300, top: 250},
        qx.util.placement.Placement.compute(size, area, target, offsets, "right-bottom", "keep-align", "keep-align")
      );
    },


    testRestrictedLeftKeepAlign : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 1000, height: 1000};
      var target = {left: 100, top: 500, right: 200, bottom: 550};
      var offsets = {top: 0, left: 0, bottom: 0, right: 0};

      this.assertJsonEquals(
        {left: 200, top: 500},
        qx.util.placement.Placement.compute(size, area, target, offsets, "left-top", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 200, top: 250},
        qx.util.placement.Placement.compute(size, area, target, offsets, "left-bottom", "keep-align", "keep-align")
      );
    },


    testRestrictedBottomAndTopWithBetterBottomKeepAlign : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 1000, height: 440};
      var target = {left: 500, top: 100, right: 600, bottom: 150};
      var offsets = {top: 10, bottom: 20, left: 0, right: 0};

      this.assertJsonEquals(
        {left: 500, top: 160},
        qx.util.placement.Placement.compute(size, area, target, offsets, "bottom-left", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 500, top: 160},
        qx.util.placement.Placement.compute(size, area, target, offsets, "top-left", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 600, top: 110},
        qx.util.placement.Placement.compute(size, area, target, offsets, "right-top", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 600, top: 110},
        qx.util.placement.Placement.compute(size, area, target, offsets, "right-bottom", "keep-align", "keep-align")
      );
    },


    testRestrictedLeftAndRightWithBetterLeftKeepAlign : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 650, height: 1000};
      var target = {left: 500, top: 500, right: 600, bottom: 550};
      var offsets = {top: 0, bottom: 0, left: 10, right: 20};

      this.assertJsonEquals(
        {left: 280, top: 500},
        qx.util.placement.Placement.compute(size, area, target, offsets, "left-top", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 280, top: 500},
        qx.util.placement.Placement.compute(size, area, target, offsets, "right-top", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 380, top: 550},
        qx.util.placement.Placement.compute(size, area, target, offsets, "bottom-left", "keep-align", "keep-align")
      );

      this.assertJsonEquals(
        {left: 380, top: 550},
        qx.util.placement.Placement.compute(size, area, target, offsets, "bottom-right", "keep-align", "keep-align")
      );
    }
  }
});
