/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.renderer.Color", {
  extend: qx.dev.unit.TestCase,

  members: {
    testValidColors() {
      var validColors = {
        red: [255, 0, 0], //named
        black: [0, 0, 0], //named
        "#FFF": [255, 255, 255], //hex3
        "#fffa": [255, 255, 255, 0.667], //hex4
        "#Ff1": [255, 255, 17], //hex3
        "#0101FF": [1, 1, 255], //hex6
        "#0101FFef": [1, 1, 255, 0.937], //hex8
        "rgb(123,11,1)": [123, 11, 1], //rgb
        "rgba(123,11,1,0.4)": [123, 11, 1, 0.4] //rgba
      };

      for (var color in validColors) {
        this.assertJsonEquals(
          validColors[color],
          qx.util.ColorUtil.stringToRgb(color)
        );
      }
    },

    testInvalidColors() {
      var invalidColors = ["blau", "1234", "#ff", "#fffff", "rgb(12,13)"];

      for (var i = 0; i < invalidColors.length; i++) {
        this.assertException(
          function () {
            qx.util.ColorUtil.stringToRgb(invalidColors[i]);
          },
          Error,
          "Could not parse color"
        );
      }

      this.assertException(
        function () {
          qx.util.ColorUtil.stringToRgb("inactivecaptiontext");
        },
        Error,
        "Could not convert system colors to RGB"
      );
    }
  }
});
