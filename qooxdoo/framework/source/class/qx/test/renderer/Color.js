/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.renderer.Color",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    testValidColors : function()
    {
      var validColors = {
        "red" : [255,0,0], //named
        "black" : [0,0,0], //named
        "#FFF" : [255,255,255], //hex3
        "#Ff1" : [255,255,17], //hex3
        "#0101FF" : [1,1,255], //hex6
        "rgb(123,11,1)" : [123, 11, 1] //rgb
      }

      for (var color in validColors) {
        this.assertJsonEquals(validColors[color], qx.util.ColorUtil.stringToRgb(color));
      }
    },

    testInvalidColors : function()
    {
      var invalidColors = [
        "blau",
        "1234",
        "#ff",
        "#ffff",
        "rgb(12,13)"
      ];

      for (var i=0; i<invalidColors.length; i++)
      {
        this.assertException(
          function() {
            qx.util.ColorUtil.stringToRgb(invalidColors[i])
          },
          Error,
          "Could not parse color"
        );
      }

      this.assertException(
        function() {
          qx.util.ColorUtil.stringToRgb("inactivecaptiontext")
        },
        Error,
        "Could not convert system colors to RGB"
      );
    }


/*
    testThemedColors : function()
    {
      var colorMgr = qx.theme.manager.Color.getInstance();
      var oldTheme = colorMgr.getColorTheme();

      colorMgr.setColorTheme(qx.theme.ext.Color);
      this.assertJsonEquals([ 101, 147, 207 ], qx.util.ColorUtil.stringToRgb("border-dark-shadow"));

      colorMgr.setColorTheme(qx.theme.classic.color.LunaBlue);
      this.assertJsonEquals([ 172, 168, 153 ], qx.util.ColorUtil.stringToRgb("border-dark-shadow"));

      colorMgr.setColorTheme(oldTheme);
    }
*/

  }
});
