/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)
     * Mustafa Sak (msak)

************************************************************************ */

qx.Class.define("qx.test.bom.Font",
{
  extend : qx.test.ui.LayoutTestCase,

  include : [qx.dev.unit.MRequirements],

  members :
  {
    hasNoIe : function()
    {
      return qx.core.Environment.get("engine.name") !== "mshtml";
    },


    setUp : function() {
      this.__font = new qx.bom.Font;
    },


    tearDown : function() {
      this.base(arguments);
      this.__font.dispose();
    },


    testBold : function()
    {
      this.__font.setBold(true);

      var styles = this.__font.getStyles();
      this.assertEquals("bold", styles.fontWeight, "Wrong style value for 'bold' property!");
    },
    
    testWeight : function()
    {
      this.__font.setWeight("400");
      var styles = this.__font.getStyles();
      this.assertEquals("400", styles.fontWeight, "something went wrong settng the 'font weight'");
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
      this.assertEquals("red", styles.color, "Wrong style value for 'color' property!");
    },


    testTextShadow : function()
    {
      this.require(["noIe"]);

      this.__font.setTextShadow("red 1px 1px 3px, green -1px -1px 3px, white -1px 1px 3px, white 1px -1px 3px");

      var styles = this.__font.getStyles();
      this.assertEquals("red 1px 1px 3px, green -1px -1px 3px, white -1px 1px 3px, white 1px -1px 3px", styles.textShadow, "Wrong style value for 'textShadow' property!");
    },


    testColorAtWidget : function()
    {
      this.__font.setColor("#ff0000");

      var label= new qx.ui.basic.Label("myLabel");
      label.setFont(this.__font);

      this.getRoot().add(label);
      this.flush();

      var useRgbValue = true;

      if (qx.core.Environment.get("browser.name") == "ie" &&
          qx.core.Environment.get("browser.documentmode") < 9) {
        useRgbValue = false;
      }

      var checkValue = useRgbValue ? "rgb(26, 26, 26)" : "#1a1a1a";
      var color = label.getContentElement().getDomElement().style["color"];

      // the current implementation has a higher priority for the color which is
      // set using the color theme. So this default color should show up and not
      // the defined color of the font.
      this.assertEquals(checkValue, color, "Wrong style applied for 'color' property!");
      label.destroy();
    },


    testGetStyles : function()
    {
      var styles = this.__font.getStyles();

      // we expect a map with only 'fontFamily' set, otherwise the null values
      // which are returned are overwriting styles. Only return styles which are set.
      var keys = Object.keys(styles);

      this.assertMap(styles, "Method 'getStyles' should return a map!");
      this.assertEquals(8, qx.lang.Object.getLength(styles), "Map should contain 8 key!");
      this.assertNotUndefined(styles.fontFamily, "Key 'fontFamily' has to be present!");
      this.assertNotUndefined(styles.fontStyle, "Key 'fontStyle' has to be present!");
      this.assertNotUndefined(styles.fontWeight, "Key 'fontWeight' has to be present!");
      this.assertNotUndefined(styles.fontSize, "Key 'fontSize' has to be present!");
      this.assertNotUndefined(styles.lineHeight, "Key 'lineHeight' has to be present!");
      this.assertNotUndefined(styles.textDecoration, "Key 'textDecoration' has to be present!");
      this.assertNotUndefined(styles.color, "Key 'color' has to be present!");
      this.assertNotUndefined(styles.textShadow, "Key 'textShadow' has to be present!");
    },


    testGetSomeStyles : function()
    {
      this.__font.setBold(true);
      this.__font.setItalic(true);
      this.__font.setColor("#3f3f3f");
      this.__font.setDecoration("underline");

      var styles = this.__font.getStyles();
      var keys = Object.keys(styles);

      this.assertMap(styles, "Method 'getStyles' should return a map!");
      this.assertEquals("fontFamily", keys[0], "Key 'fontFamily' has to be present!");
      this.assertEquals("", styles.fontFamily, "'fontFamily' has to have the value ''!");
      this.assertEquals("italic", styles.fontStyle, "Wrong value for 'fontStyle'!");
      this.assertEquals("bold", styles.fontWeight, "Wrong value for 'fontWeight'!");
      this.assertEquals("#3f3f3f", styles.color, "Wrong value for 'color'!");
      this.assertEquals("underline", styles.textDecoration, "Wrong value for 'textDecoration'!");
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
        color: "red"
      };
      var found = font.getStyles();

      this.assertEquals(expected.fontWeight, found.fontWeight, "Wrong value for 'fontWeight'");
      this.assertEquals(expected.fontStyle, found.fontStyle, "Wrong value for 'fontStyle'");
      this.assertEquals(expected.fontSize, found.fontSize, "Wrong value for 'fontSize'");
      this.assertEquals(expected.lineHeight, found.lineHeight, "Wrong value for 'lineHeight'");
      this.assertEquals(expected.textDecoration, found.textDecoration, "Wrong value for 'textDecoration'");
      this.assertEquals(expected.fontFamily, found.fontFamily, "Wrong value for 'fontFamily'");
      this.assertEquals(expected.textColor, found.textColor, "Wrong value for 'textColor'");

      font.dispose();
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

      font.dispose();
    }
  }
});
