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

qx.Class.define("testrunner.test.renderer.Color",
{
  extend : testrunner.TestCase,

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    __testColor : function()
    {
      this.assertNotUndefined(qx.renderer.color.Color);
      var Color = qx.renderer.color.Color;

      var c = new Color("red");
      this.assertEquals("red", c.getStyle());
      this.assertEquals("red", c.getValue());

      // this.assertEquals("#ff0000", c.getHex());
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
      this.assertTrue(("rgb(160,82,45)" == c.getStyle()) || ("#a0522d" == c.getStyle()));
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

      var c = new Color([ 160, 82, 45 ]);
      this.assertEquals("rgb(160,82,45)", c.getStyle());

      // this.assertEquals(
      //    qx.io.Json.stringify([160, 82, 45]),
      //    qx.io.Json.stringify(c.getValue())
      // );
      this.assertEquals("#a0522d", c.getHex());
      this.assertEquals(160, c.getRed());
      this.assertEquals(82, c.getGreen());
      this.assertEquals(45, c.getBlue());

      var c = new Color("#FF0101");
      this.assertTrue(("rgb(255,1,1)" == c.getStyle()) || ("#FF0101" == c.getStyle()));

      // this.assertEquals("#FF0101", c.getValue());
      this.assertEquals("#ff0101", c.getHex().toLowerCase());
      this.assertEquals(255, c.getRed());
      this.assertEquals(1, c.getGreen());
      this.assertEquals(1, c.getBlue());

      var c = new Color("#FED");
      this.assertTrue(("rgb(255,238,221)" == c.getStyle()) || ("#FED" == c.getStyle()));

      // this.assertEquals("#FED", c.getValue());
      // this.assertEquals("#ffeedd", c.getHex());
      this.assertEquals(255, c.getRed());
      this.assertEquals(238, c.getGreen());
      this.assertEquals(221, c.getBlue());

      var error = false;

      try {
        var c = new Color("activeborder");
      } catch(e) {
        error = true;
      }

      this.assertTrue(error);

      var error = false;

      try {
        var c = new Color("#FFGFF");
      } catch(e) {
        error = true;
      }

      this.assertTrue(error);

      var error = false;

      try {
        var c = new Color("bla");
      } catch(e) {
        error = true;
      }

      this.assertTrue(error);

      var error = false;

      try {
        var c = new Color([ 1, 2 ]);
      } catch(e) {
        error = true;
      }

      this.assertTrue(error);

      var error = false;

      try {
        var c = new Color([ 1, 2, 3, 4 ]);
      } catch(e) {
        error = true;
      }

      this.assertTrue(error);

      var error = false;

      try {
        var c = new Color([ 1, 2, 300 ]);
      } catch(e) {
        error = true;
      }

      this.assertTrue(error);

      var c = Color.fromRandom();
      this.assertTrue(c instanceof Color);

      var c = Color.fromString("#123");
      this.assertTrue(c instanceof Color);

      this.assertEquals("rgb(1,2,3)", Color.rgb2style(1, 2, 3));
    }
  }
});
