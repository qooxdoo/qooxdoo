/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)
     * Christian Hagendorn (cs)

************************************************************************ */

qx.Class.define("qx.test.util.ColorUtil", {
  extend: qx.dev.unit.TestCase,

  members: {
    testRgbToRgbString() {
      this.assertEquals(
        "rgba(255,0,0,1)",
        qx.util.ColorUtil.rgbToRgbString([255, 0, 0, 1])
      );

      this.assertEquals(
        "rgba(255,0,0,0.5)",
        qx.util.ColorUtil.rgbToRgbString([255, 0, 0, 0.5])
      );

      this.assertEquals(
        "rgba(255,0,0,0)",
        qx.util.ColorUtil.rgbToRgbString([255, 0, 0, 0])
      );

      this.assertEquals(
        "rgb(255,0,0)",
        qx.util.ColorUtil.rgbToRgbString([255, 0, 0])
      );
    },

    testCssStringToRgb() {
      this.assertEquals(
        "255,0,0",
        qx.util.ColorUtil.cssStringToRgb("rgba(255,0,0,1)")
      );

      this.assertEquals(
        "201,23,120,0.3",
        qx.util.ColorUtil.cssStringToRgb("rgba(201,23,120,0.3)")
      );

      this.assertEquals(
        "255,0,0",
        qx.util.ColorUtil.cssStringToRgb("rgb(255,0,0)")
      );

      this.assertEquals(
        "201,23,120",
        qx.util.ColorUtil.cssStringToRgb("rgb(201,23,120)")
      );
    },

    testHex3StringToHex6String() {
      this.assertEquals(
        "#FFFFFF",
        qx.util.ColorUtil.hex3StringToHex6String("#fff")
      );

      this.assertEquals(
        "#ffff",
        qx.util.ColorUtil.hex3StringToHex6String("#ffff")
      );

      this.assertEquals(
        "#ffffffe1",
        qx.util.ColorUtil.hex3StringToHex6String("#ffffffe1")
      );

      this.assertEquals(
        "#FFFFFFA1",
        qx.util.ColorUtil.rgbToHexString(
          qx.util.ColorUtil.hexStringToRgb("#ffFFffa1")
        )
      );

      this.assertEquals(
        "#FFFFFFEE",
        qx.util.ColorUtil.rgbToHexString(
          qx.util.ColorUtil.hexStringToRgb("#fffe")
        )
      );
    },

    testRgbToHexString() {
      this.assertEquals(
        "#FFFFFF",
        qx.util.ColorUtil.rgbToHexString([255, 255, 255])
      );

      this.assertEquals(
        "#FFFFFF",
        qx.util.ColorUtil.rgbToHexString([255, 255, 255, 1])
      );

      this.assertEquals("#000000", qx.util.ColorUtil.rgbToHexString([0, 0, 0]));
      this.assertEquals(
        "#00000066",
        qx.util.ColorUtil.rgbToHexString([0, 0, 0, 0.4])
      );
    },

    testStringToRgbString() {
      this.assertEquals(
        "rgba(0,0,0,0.5)",
        qx.util.ColorUtil.stringToRgbString("rgba(0,0,0,0.5)")
      );

      this.assertEquals(
        "rgb(-1,-1,-1)",
        qx.util.ColorUtil.stringToRgbString("rgba(0,0,0,0)")
      );

      this.assertEquals(
        "rgba(11,0,0,0.5)",
        qx.util.ColorUtil.stringToRgbString("rgba(11,0,0,0.5)")
      );
    },

    testScale() {
      this.assertEquals(
        "rgba(64,191.5,255,0.5)",
        qx.util.ColorUtil.scale("rgba(128,128,40,0.5)", {
          red: -50,
          green: 50,
          blue: 100
        })
      );
    },
    testAdjust() {
      this.assertEquals(
        "rgba(65,193,33,0.6)",
        qx.util.ColorUtil.adjust("rgba(64,194,32,0.5)", {
          red: 1,
          green: -1,
          blue: 1,
          alpha: 0.1
        })
      );
    },

    testIsCssVariable() {
      this.assertTrue(qx.util.ColorUtil.isCssVariable("var(--foo)"), "einfache Variable");
      this.assertTrue(qx.util.ColorUtil.isCssVariable("var(--vza-focus-color)"), "Bindestrich-Name");
      this.assertTrue(qx.util.ColorUtil.isCssVariable("var(--foo, #8cadd5)"), "mit Fallback");
      this.assertTrue(qx.util.ColorUtil.isCssVariable("var(--foo, var(--bar))"), "mit verschachteltem Fallback");

      this.assertFalse(qx.util.ColorUtil.isCssVariable("#fff"), "Hex darf nicht erkannt werden");
      this.assertFalse(qx.util.ColorUtil.isCssVariable("red"), "Named Color darf nicht erkannt werden");
      this.assertFalse(qx.util.ColorUtil.isCssVariable("rgb(0,0,0)"), "RGB darf nicht erkannt werden");
      this.assertFalse(qx.util.ColorUtil.isCssVariable("var(foo)"), "fehlendes -- muss fehlschlagen");
      this.assertFalse(qx.util.ColorUtil.isCssVariable(""), "Leerstring muss fehlschlagen");
      this.assertFalse(qx.util.ColorUtil.isCssVariable(null), "null muss fehlschlagen");
    },

    testIsCssStringWithCssVariable() {
      this.assertTrue(qx.util.ColorUtil.isCssString("var(--vza-focus-color)"), "CSS-Variable muss als CSS-String gelten");
      this.assertTrue(qx.util.ColorUtil.isCssString("var(--foo, #ccc)"), "CSS-Variable mit Fallback muss als CSS-String gelten");
      this.assertTrue(qx.util.ColorUtil.isCssString("#fff"), "Hex bleibt gültig");
      this.assertTrue(qx.util.ColorUtil.isCssString("red"), "Named Color bleibt gültig");
      this.assertTrue(qx.util.ColorUtil.isCssString("rgb(0,0,0)"), "RGB bleibt gültig");
    }
  }
});
