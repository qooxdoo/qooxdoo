/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qxunit.test.renderer.Color", {
  extend: qxunit.TestCase,

  members : {
    testColor: function() {
          this.assertNotUndefined(qx.renderer.color.Color);
          var Color = qx.renderer.color.Color;

          var c = new Color("red");
          this.assertEquals("red", c.getStyle());
          this.assertEquals("red", c.getValue());
          //this.assertEquals("#ff0000", c.getHex());
          this.assertEquals(255, c.getRed());
          this.assertEquals(0, c.getGreen());
          this.assertEquals(0, c.getBlue());

          var c = new Color("sienna");
          this.assertEquals("sienna", c.getStyle());
          this.assertEquals("sienna", c.getValue());
          this.assertEquals("#a0522d", c.getHex());
          this.assertEquals(160, c.getRed());
          this.assertEquals(82, c.getGreen());
          this.assertEquals(45, c.getBlue());

          var c = new Color("#a0522d");
          this.assertTrue(
              ("rgb(160,82,45)" == c.getStyle()) ||
              ("#a0522d" == c.getStyle())
          );
          this.assertEquals("#a0522d", c.getValue());
          this.assertEquals("#a0522d", c.getHex());
          this.assertEquals(160, c.getRed());
          this.assertEquals(82, c.getGreen());
          this.assertEquals(45, c.getBlue());

          var c = new Color("rgb(160,82,45)");
          this.assertEquals("rgb(160,82,45)", c.getStyle());
          this.assertEquals("rgb(160,82,45)", c.getValue());
          this.assertEquals("#a0522d", c.getHex());
          this.assertEquals(160, c.getRed());
          this.assertEquals(82, c.getGreen());
          this.assertEquals(45, c.getBlue());

          var c = new Color([160, 82, 45]);
          this.assertEquals("rgb(160,82,45)", c.getStyle());
          //this.assertEquals(
          //    qx.io.Json.stringify([160, 82, 45]),
          //    qx.io.Json.stringify(c.getValue())
          //);
          this.assertEquals("#a0522d", c.getHex());
          this.assertEquals(160, c.getRed());
          this.assertEquals(82, c.getGreen());
          this.assertEquals(45, c.getBlue());

          var c = new Color("#FF0101");
          this.assertTrue(
              ("rgb(255,1,1)" == c.getStyle()) ||
              ("#FF0101" == c.getStyle())
          );
          //this.assertEquals("#FF0101", c.getValue());
          this.assertEquals("#ff0101", c.getHex().toLowerCase());
          this.assertEquals(255, c.getRed());
          this.assertEquals(1, c.getGreen());
          this.assertEquals(1, c.getBlue());

          var c = new Color("#FED");
          this.assertTrue(
              ("rgb(255,238,221)" == c.getStyle()) ||
              ("#FED" == c.getStyle())
          );
          //this.assertEquals("#FED", c.getValue());
          //this.assertEquals("#ffeedd", c.getHex());
          this.assertEquals(255, c.getRed());
          this.assertEquals(238, c.getGreen());
          this.assertEquals(221, c.getBlue());

          var error = false;
          try {
              var c = new Color("activeborder");
          } catch (e) {
              error = true;
          }
          this.assertTrue(error);

          var error = false;
          try {
              var c = new Color("#FFGFF");
          } catch (e) {
              error = true;
          }
          this.assertTrue(error);

          var error = false;
          try {
              var c = new Color("bla");
          } catch (e) {
              error = true;
          }
          this.assertTrue(error);

          var error = false;
          try {
              var c = new Color([1,2]);
          } catch (e) {
              error = true;
          }
          this.assertTrue(error);

          var error = false;
          try {
              var c = new Color([1,2,3,4]);
          } catch (e) {
              error = true;
          }
          this.assertTrue(error);

          var error = false;
          try {
              var c = new Color([1,2,300]);
          } catch (e) {
              error = true;
          }
          this.assertTrue(error);

          var c = Color.fromRandom();
          this.assertTrue(c instanceof Color);

          var c = Color.fromString("#123");
          this.assertTrue(c instanceof Color);

          this.assertEquals("rgb(1,2,3)", Color.rgb2style(1,2,3));
      },

      testColorObject: function() {
          var ColorObject = qx.renderer.color.ColorObject;
          var Manager = qx.manager.object.ColorManager.getInstance();

          Manager.setColorTheme(qx.theme.color.WindowsRoyale);
          var c1 = new ColorObject("activecaption");
          this.assertEquals("rgb(51,94,168)", c1.getStyle());
          this.assertEquals("activecaption", c1.getValue());
          this.assertEquals("#335ea8", c1.getHex());
          this.assertEquals(51, c1.getRed());
          this.assertEquals(94, c1.getGreen());
          this.assertEquals(168, c1.getBlue());

          var c2 = new ColorObject("sienna");
          this.assertEquals("sienna", c2.getStyle());
          this.assertEquals("sienna", c2.getValue());
          this.assertEquals("#a0522d", c2.getHex());
          this.assertEquals(160, c2.getRed());
          this.assertEquals(82, c2.getGreen());
          this.assertEquals(45, c2.getBlue());

          Manager.setColorTheme(qx.theme.color.WindowsClassic);
          this.assertEquals("rgb(10,36,106)", c1.getStyle());
          this.assertEquals("activecaption", c1.getValue());
          this.assertEquals("#0a246a", c1.getHex());
          this.assertEquals(10, c1.getRed());
          this.assertEquals(36, c1.getGreen());
          this.assertEquals(106, c1.getBlue());

          this.assertEquals("#a0522d", c2.getHex());
      },

      testColorThemeSwitch: function() {
          var ColorObject = qx.renderer.color.ColorObject;
          var Manager = qx.manager.object.ColorManager.getInstance();

          var c1 = new ColorObject("activecaption");
          var c2 = new ColorObject("sienna");

          Manager.setColorTheme(qx.theme.color.WindowsClassic);
          var calledStyle = "";
          var dpendendObj = {
              _updateColors: function(color, style) {
                  calledStyle = style;
              },
              toHashCode: function() { return 4711; }
          }
          c1.add(dpendendObj);
          Manager.setColorTheme(qx.theme.color.WindowsRoyale);
          this.assertEquals("rgb(51,94,168)", calledStyle);

          Manager.setColorTheme(qx.theme.color.WindowsClassic);
          var calledStyle2 = "";
          var dpendendObj = {
              _updateColors: function(color, style) {
                  calledStyle2 = style;
              },
              toHashCode: function() { return 4712; }
          }
          c2.add(dpendendObj);
          Manager.setColorTheme(qx.theme.color.WindowsRoyale);
          this.assertEquals("", calledStyle2);
          this.assertEquals("#a0522d", c2.getHex());
      }
  }
});
