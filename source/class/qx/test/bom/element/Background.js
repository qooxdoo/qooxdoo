/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

/* ************************************************************************
************************************************************************ */
/**
 *
 * @asset(qx/static/blank.gif)
 */

qx.Class.define("qx.test.bom.element.Background",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      this.__divElement = document.createElement("div");
      document.body.appendChild(this.__divElement);

      this.__backgroundUrlBase64 = "data:image/gif;base64,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";
    },


    tearDown : function()
    {
      document.body.removeChild(this.__divElement);
      this.__divElement = null;
    },


    testGetStyles : function()
    {
      var styles = qx.bom.element.Background.getStyles("foo/bar/baz.gif", "no-repeat", null, null);

      this.assertKeyInMap("backgroundImage", styles, "Key 'backgroundImage' is not present!");
      this.assertKeyInMap("backgroundPosition", styles, "Key 'backgroundPosition' is not present!");

      // check for "url(IMAGE-URL)" to be sure that "'" chars are used
      // for normal images. Image names with spaces will then also work
      this.assertEquals("url('foo/bar/baz.gif')", styles.backgroundImage, "Do always use \"'\" for image urls!");    },


    testGetStylesBase64 : function()
    {
      var styles = qx.bom.element.Background.getStyles(this.__backgroundUrlBase64, "no-repeat", null, null);

      this.assertKeyInMap("backgroundImage", styles, "Key 'backgroundImage' is not present!");
      this.assertKeyInMap("backgroundPosition", styles, "Key 'backgroundPosition' is not present!");

      this.assertEquals("url('" + this.__backgroundUrlBase64 + "')", styles['backgroundImage'], "Wrong value for base64 encoded background image!");
    },


    testCompile : function()
    {
      var cssString = qx.bom.element.Background.compile("foo/bar/baz", "no-repeat", null, null);

      var expected = "background-image:url('foo/bar/baz');background-position:0 0;" +
                     "background-repeat:no-repeat;";
      this.assertEquals(expected, cssString, "Compiled CSS string is not valid!");
    },


    testCompileBase64 : function()
    {
      var cssStringBase64 = qx.bom.element.Background.compile(this.__backgroundUrlBase64, "no-repeat", null, null);

      var expected = "background-image:url('" + this.__backgroundUrlBase64 + "');" +
                     "background-position:0 0;background-repeat:no-repeat;";

      this.assertEquals(expected, cssStringBase64, "Compiled CSS string for base64 image is not valid!");
    }
  }
});
