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


qx.Class.define("qx.test.util.PlaceUtil",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testEnoughSpace : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 1000, height: 1000};
      var target = {left: 500, top: 500, right: 600, bottom: 550};

      var modes = [null, "direct", "keep-align"];
      for (var i=0; i<modes.length; i++)
      {
        var mode = modes[i];

        this.assertJsonEquals(
          {left: 500, top: 200},
          qx.util.PlaceUtil.compute(size, area, target, "top-left", mode)
        );

        this.assertJsonEquals(
          {left: 400, top: 200},
          qx.util.PlaceUtil.compute(size, area, target, "top-right", mode)
        );

        this.assertJsonEquals(
          {left: 500, top: 550},
          qx.util.PlaceUtil.compute(size, area, target, "bottom-left", mode)
        );

        this.assertJsonEquals(
          {left: 400, top: 550},
          qx.util.PlaceUtil.compute(size, area, target, "bottom-right", mode)
        );

        this.assertJsonEquals(
          {left: 300, top: 500},
          qx.util.PlaceUtil.compute(size, area, target, "left-top", mode)
        );

        this.assertJsonEquals(
          {left: 300, top: 250},
          qx.util.PlaceUtil.compute(size, area, target, "left-bottom", mode)
        );

        this.assertJsonEquals(
          {left: 600, top: 500},
          qx.util.PlaceUtil.compute(size, area, target, "right-top", mode)
        );

        this.assertJsonEquals(
          {left: 600, top: 250},
          qx.util.PlaceUtil.compute(size, area, target, "right-bottom", mode)
        );
      }
    },


    testRestrictedBottomKeepAlign : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 1000, height: 600};
      var target = {left: 500, top: 500, right: 600, bottom: 550};

      this.assertJsonEquals(
        {left: 500, top: 200},
        qx.util.PlaceUtil.compute(size, area, target, "bottom-left", "keep-align")
      );

      this.assertJsonEquals(
        {left: 400, top: 200},
        qx.util.PlaceUtil.compute(size, area, target, "bottom-right", "keep-align")
      );

      this.assertJsonEquals(
        {left: 300, top: 250},
        qx.util.PlaceUtil.compute(size, area, target, "left-top", "keep-align")
      );

      this.assertJsonEquals(
        {left: 600, top: 250},
        qx.util.PlaceUtil.compute(size, area, target, "right-top", "keep-align")
      );
    },


    testRestrictedTop : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 1000, height: 1000};
      var target = {left: 500, top: 100, right: 600, bottom: 150};

      this.assertJsonEquals(
        {left: 500, top: 150},
        qx.util.PlaceUtil.compute(size, area, target, "top-left", "keep-align")
      );

      this.assertJsonEquals(
        {left: 400, top: 150},
        qx.util.PlaceUtil.compute(size, area, target, "top-right", "keep-align")
      );

      this.assertJsonEquals(
        {left: 300, top: 100},
        qx.util.PlaceUtil.compute(size, area, target, "left-bottom", "keep-align")
      );

      this.assertJsonEquals(
        {left: 600, top: 100},
        qx.util.PlaceUtil.compute(size, area, target, "right-bottom", "keep-align")
      );
    },


    testRestrictedRight : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 700, height: 1000};
      var target = {left: 500, top: 500, right: 600, bottom: 550};

      this.assertJsonEquals(
        {left: 300, top: 500},
        qx.util.PlaceUtil.compute(size, area, target, "right-top", "keep-align")
      );

      this.assertJsonEquals(
        {left: 300, top: 250},
        qx.util.PlaceUtil.compute(size, area, target, "right-bottom", "keep-align")
      );
    },


    testRestrictedLeft : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 1000, height: 1000};
      var target = {left: 100, top: 500, right: 200, bottom: 550};

      this.assertJsonEquals(
        {left: 200, top: 500},
        qx.util.PlaceUtil.compute(size, area, target, "left-top", "keep-align")
      );

      this.assertJsonEquals(
        {left: 200, top: 250},
        qx.util.PlaceUtil.compute(size, area, target, "left-bottom", "keep-align")
      );
    },


    testRestrictedBottomAndTopWithBetterBottom : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 1000, height: 440};
      var target = {left: 500, top: 100, right: 600, bottom: 150};
      var offsets = {top: 10, bottom: 20, left: 0, right: 0};

      this.assertJsonEquals(
        {left: 500, top: 160},
        qx.util.PlaceUtil.compute(size, area, target, "bottom-left", "keep-align", offsets)
      );

      this.assertJsonEquals(
        {left: 500, top: 160},
        qx.util.PlaceUtil.compute(size, area, target, "top-left", "keep-align", offsets)
      );

      this.assertJsonEquals(
        {left: 600, top: 110},
        qx.util.PlaceUtil.compute(size, area, target, "right-top", "keep-align", offsets)
      );

      this.assertJsonEquals(
        {left: 600, top: 110},
        qx.util.PlaceUtil.compute(size, area, target, "right-bottom", "keep-align", offsets)
      );
    },


    testRestrictedLeftAndRightWithBetterLeft : function()
    {
      var size = {width: 200, height: 300};
      var area = {width: 650, height: 1000};
      var target = {left: 500, top: 500, right: 600, bottom: 550};
      var offsets = {top: 0, bottom: 0, left: 10, right: 20};

      this.assertJsonEquals(
        {left: 280, top: 500},
        qx.util.PlaceUtil.compute(size, area, target, "left-top", "keep-align", offsets)
      );

      this.assertJsonEquals(
        {left: 280, top: 500},
        qx.util.PlaceUtil.compute(size, area, target, "right-top", "keep-align", offsets)
      );

      this.assertJsonEquals(
        {left: 380, top: 550},
        qx.util.PlaceUtil.compute(size, area, target, "bottom-left", "keep-align", offsets)
      );

      this.assertJsonEquals(
        {left: 380, top: 550},
        qx.util.PlaceUtil.compute(size, area, target, "bottom-right", "keep-align", offsets)
      );
    }
  }
});
