/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.test.bom.Font",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function() {
      this.__font = new qx.bom.Font;
    },


    tearDown : function() {
      this.__font.dispose();
    },


    testBold : function()
    {
      this.__font.setBold(true);

      var styles = this.__font.getStyles();
      this.assertEquals("bold", styles.fontWeight, "Wrong style value for 'bold' property!");
    },


    testItalic : function()
    {
      this.__font.setItalic(true);

      var styles = this.__font.getStyles();
      this.assertEquals("italic", styles.fontStyle, "Wrong style value for 'italic' property!");
    },


    testDecorationUnderline : function()
    {
      this.__font.setDecoration("underline");

      var styles = this.__font.getStyles();
      this.assertEquals("underline", styles.textDecoration, "Wrong style value for 'decoration' property!");
    },


    testDecorationLineThrough : function()
    {
      this.__font.setDecoration("line-through");

      var styles = this.__font.getStyles();
      this.assertEquals("line-through", styles.textDecoration, "Wrong style value for 'decoration' property!");
    },


    testDecorationOverline : function()
    {
      this.__font.setDecoration("overline");

      var styles = this.__font.getStyles();
      this.assertEquals("overline", styles.textDecoration, "Wrong style value for 'decoration' property!");
    },


    testFontFamily : function()
    {
      this.__font.setFamily( ["Arial"] );

      var styles = this.__font.getStyles();
      this.assertEquals("Arial", styles.fontFamily, "Wrong style value for 'family' property!");
    },


    testFontFamilyMultipleWords : function()
    {
      this.__font.setFamily( ['Times New Roman'] );

      var styles = this.__font.getStyles();
      this.assertEquals('"Times New Roman"', styles.fontFamily, "Wrong style value for 'family' property!");
    },


    testLineHeight : function()
    {
      this.__font.setLineHeight(1.5);

      var styles = this.__font.getStyles();
      this.assertEquals(1.5, styles.lineHeight, "Wrong style value for 'lineHeight' property!");
    },


    testSize : function()
    {
      this.__font.setSize(20);

      var styles = this.__font.getStyles();
      this.assertEquals("20px", styles.fontSize, "Wrong style value for 'size' property!");
    },


    testColor : function()
    {
      this.__font.setColor("red");

      var styles = this.__font.getStyles();
      this.assertEquals("red", styles.textColor, "Wrong style value for 'color' property!");
    },


    testGetStyles : function()
    {
      var styles = this.__font.getStyles();

      this.assertKeyInMap("fontFamily", styles, "Key 'fontFamily' is missing in map!");
      this.assertKeyInMap("fontSize", styles, "Key 'fontSize' is missing in map!");
      this.assertKeyInMap("textDecoration", styles, "Key 'textDecoration' is missing in map!");
      this.assertKeyInMap("fontWeight", styles, "Key 'fontWeight' is missing in map!");
      this.assertKeyInMap("fontStyle", styles, "Key 'fontStyle' is missing in map!");
      this.assertKeyInMap("lineHeight", styles, "Key 'lineHeight' is missing in map!");
      this.assertKeyInMap("textColor", styles, "Key 'textColor' is missing in map!");
    },


    testFromConfig : function()
    {
      var config =
      {
        bold: true,
        italic: false,
        decoration: "underline",
        lineHeight: 1.2,
        size: 20,
        family: [ "Arial" ],
        color: "red"
      };
      var font = qx.bom.Font.fromConfig(config);

      var expected =
      {
        fontWeight: "bold",
        fontStyle: "normal",
        textDecoration: "underline",
        lineHeight: 1.2,
        fontSize: "20px",
        fontFamily: "Arial",
        textColor: "red"
      };
      var found = font.getStyles();

      this.assertEquals(expected.fontWeight, found.fontWeight, "Wrong value for 'fontWeight'");
      this.assertEquals(expected.fontStyle, found.fontStyle, "Wrong value for 'fontStyle'");
      this.assertEquals(expected.fontSize, found.fontSize, "Wrong value for 'fontSize'");
      this.assertEquals(expected.lineHeight, found.lineHeight, "Wrong value for 'lineHeight'");
      this.assertEquals(expected.textDecoration, found.textDecoration, "Wrong value for 'textDecoration'");
      this.assertEquals(expected.fontFamily, found.fontFamily, "Wrong value for 'fontFamily'");
      this.assertEquals(expected.textColor, found.textColor, "Wrong value for 'textColor'");
    },


    testFromString : function()
    {
      var config = "bold italic underline 20px Arial";
      var font = qx.bom.Font.fromString(config);

      var expected =
      {
        fontWeight: "bold",
        fontStyle: "italic",
        textDecoration: "underline",
        fontSize: "20px",
        fontFamily: "Arial"
      };
      var found = font.getStyles();

      this.assertEquals(expected.fontWeight, found.fontWeight, "Wrong value for 'fontWeight'");
      this.assertEquals(expected.fontStyle, found.fontStyle, "Wrong value for 'fontStyle'");
      this.assertEquals(expected.fontSize, found.fontSize, "Wrong value for 'fontSize'");
      this.assertEquals(expected.textDecoration, found.textDecoration, "Wrong value for 'textDecoration'");
      this.assertEquals(expected.fontFamily, found.fontFamily, "Wrong value for 'fontFamily'");
    }
  }
});
