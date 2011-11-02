/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.bom.Label",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      this.__boldStyle = { fontWeight: "bold" };
      this.__italicStyle = { fontStyle: "italic" };
      this.__boldItalicStyle = { fontWeight: "bold", fontStyle: "italic" };
      this.__familyStyle = { fontFamily: [ "Verdana" ] };
      this.__fontSizeStyle = { fontSize: "20px" };
      this.__paddingStyle = { padding: "10px" };
      this.__marginStyle = { margin: "10px" };

      this.__allTogetherStyle = {};
      qx.lang.Object.mergeWith(this.__allTogetherStyle, this.__boldStyle);
      qx.lang.Object.mergeWith(this.__allTogetherStyle, this.__italicStyle);
      qx.lang.Object.mergeWith(this.__allTogetherStyle, this.__boldItalicStyle);
      qx.lang.Object.mergeWith(this.__allTogetherStyle, this.__familyStyle);
      qx.lang.Object.mergeWith(this.__allTogetherStyle, this.__fontSizeStyle);
      qx.lang.Object.mergeWith(this.__allTogetherStyle, this.__paddingStyle);
      qx.lang.Object.mergeWith(this.__allTogetherStyle, this.__marginStyle);
    },

    tearDown : function()
    {
      this.__boldStyle = null;
      this.__italicStyle = null;
      this.__familyStyle = null;
      this.__fontSizeStyle = null;
      this.__paddingStyle = null;
      this.__marginStyle = null;
      this.__allTogetherStyle = null;
    },

    // test only XUL labels under windows to get comparable results
    // to ensure the change of bug #5011 does not break anything

    testMeasureSizeTextNormal : function()
    {
      if (!qx.core.Environment.get("css.textoverflow") &&
          qx.core.Environment.get("html.xul") &&
          qx.core.Environment.get("os.name") == "win")
      {
        var text = "vanillebaer";
        var size = null;

        size = qx.bom.Label.getTextSize(text);
        this.assertEquals(53, size.width);
        this.assertEquals(14, size.height);

        return;

        size = qx.bom.Label.getTextSize(text, this.__fontSizeStyle);
        this.assertEquals(91, size.width);
        this.assertEquals(23, size.height);

        size = qx.bom.Label.getTextSize(text, this.__familyStyle);
        this.assertEquals(91, size.width);
        this.assertEquals(18, size.height);

        size = qx.bom.Label.getTextSize(text, this.__paddingStyle);
        this.assertEquals(65, size.width);
        this.assertEquals(20, size.height);

        size = qx.bom.Label.getTextSize(text, this.__marginStyle);
        this.assertEquals(65, size.width);
        this.assertEquals(20, size.height);

        size = qx.bom.Label.getTextSize(text, this.__allTogetherStyle);
        this.assertEquals(125, size.width);
        this.assertEquals(25, size.height);
      }
      else
      {
        this.assertTrue(true);
      }
    },

    testMeasureSizeTextBold : function()
    {
      if (!qx.core.Environment.get("css.textoverflow") &&
          qx.core.Environment.get("html.xul") &&
          qx.core.Environment.get("os.name") == "win")
      {
        var text = "vanillebaer";
        var size = null;

        size = qx.bom.Label.getTextSize(text, this.__boldStyle);
        this.assertEquals(61, size.width);
        this.assertEquals(14, size.height);
      }
      else
      {
        this.assertTrue(true);
      }
    },


    testMeasureSizeTextItalic : function()
    {
      if (!qx.core.Environment.get("css.textoverflow") &&
          qx.core.Environment.get("html.xul") &&
          qx.core.Environment.get("os.name") == "win")
      {
        var text = "vanillebaer";
        var size = null;

        size = qx.bom.Label.getTextSize(text, this.__italicStyle);
        this.assertEquals(56, size.width);
        this.assertEquals(14, size.height);
      }
      else
      {
        this.assertTrue(true);
      }
    },


    testMeasureSizeTextBoldItalic : function()
    {
      if (!qx.core.Environment.get("css.textoverflow") &&
          qx.core.Environment.get("html.xul") &&
          qx.core.Environment.get("os.name") == "win")
      {
        var text = "vanillebaer";
        var size = null;

        size = qx.bom.Label.getTextSize(text, this.__boldItalicStyle);
        this.assertEquals(64, size.width);
        this.assertEquals(13, size.height);
      }
      else
      {
        this.assertTrue(true);
      }
    },


    testMeasureSizeTextFontSize : function()
    {
      if (!qx.core.Environment.get("css.textoverflow") &&
          qx.core.Environment.get("html.xul") &&
          qx.core.Environment.get("os.name") == "win")
      {
        var text = "vanillebaer";
        var size = null;

        size = qx.bom.Label.getTextSize(text, this.__fontSize);
        this.assertEquals(53, size.width);
        this.assertEquals(14, size.height);
      }
      else
      {
        this.assertTrue(true);
      }
    },


    testMeasureSizeTextFontFamily : function()
    {
      if (!qx.core.Environment.get("css.textoverflow") &&
          qx.core.Environment.get("html.xul") &&
          qx.core.Environment.get("os.name") == "win")
      {
        var text = "vanillebaer";
        var size = null;

        size = qx.bom.Label.getTextSize(text, this.__familyStyle);
        this.assertEquals(64, size.width);
        this.assertEquals(13, size.height);
      }
      else
      {
        this.assertTrue(true);
      }
    },


    testMeasureSizeTextPadding : function()
    {
      if (!qx.core.Environment.get("css.textoverflow") &&
          qx.core.Environment.get("html.xul") &&
          qx.core.Environment.get("os.name") == "win")
      {
        var text = "vanillebaer";
        var size = null;

        size = qx.bom.Label.getTextSize(text, this.__paddingStyle);
        this.assertEquals(53, size.width);
        this.assertEquals(14, size.height);
      }
      else
      {
        this.assertTrue(true);
      }
    },


    testMeasureSizeTextMargin : function()
    {
      if (!qx.core.Environment.get("css.textoverflow") &&
          qx.core.Environment.get("html.xul") &&
          qx.core.Environment.get("os.name") == "win")
      {
        var text = "vanillebaer";
        var size = null;

        size = qx.bom.Label.getTextSize(text, this.__marginStyle);
        this.assertEquals(53, size.width);
        this.assertEquals(14, size.height);
      }
      else
      {
        this.assertTrue(true);
      }
    },


    testMeasureSizeTextAllTogether : function()
    {
      if (!qx.core.Environment.get("css.textoverflow") &&
          qx.core.Environment.get("html.xul") &&
          qx.core.Environment.get("os.name") == "win")
      {
        var text = "vanillebaer";
        var size = null;

        size = qx.bom.Label.getTextSize(text, this.__allTogetherStyle);
        this.assertEquals(125, size.width);
        this.assertEquals(25, size.height);
      }
      else
      {
        this.assertTrue(true);
      }
    }
  }
});