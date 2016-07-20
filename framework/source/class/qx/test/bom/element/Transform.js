/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
qx.Class.define("qx.test.bom.element.Transform",
{
  extend : qx.dev.unit.TestCase,
  include : [qx.dev.unit.MRequirements],

  members :
  {
    __el : null,
    __keys : null,

    setUp : function() {
      this.__keys = qx.core.Environment.get("css.transform");
      if (this.__keys == null) {
        // skip the test
        throw new qx.dev.unit.RequirementError("css.transform");
      }
      this.__el = {style: {}};
    },


    tearDown : function() {
      this.__el = null;
    },


    /**
     * TRANSFORM FUNCTIONS
     */

    testTranslate : function() {
      qx.bom.element.Transform.translate(this.__el, "123px");

      this.assertTrue(this.__el.style[this.__keys.name].indexOf("translate(123px)") != -1);
    },

    testRotate : function() {
      qx.bom.element.Transform.rotate(this.__el, "123deg");

      this.assertTrue(this.__el.style[this.__keys.name].indexOf("rotate(123deg)") != -1);
    },

    testSkew : function() {
      qx.bom.element.Transform.skew(this.__el, "123deg");

      this.assertTrue(this.__el.style[this.__keys.name].indexOf("skew(123deg)") != -1);
    },

    testScale : function() {
      qx.bom.element.Transform.scale(this.__el, 1.5);

      this.assertTrue(this.__el.style[this.__keys.name].indexOf("scale(1.5)") != -1);
    },

    testTransform : function() {
      qx.bom.element.Transform.transform(this.__el, {scale: 1.2, translate: "123px"});

      this.assertTrue(this.__el.style[this.__keys.name].indexOf("translate(123px)") != -1);
      this.assertTrue(this.__el.style[this.__keys.name].indexOf("scale(1.2)") != -1);
    },

    "testAddStyleSheetRuleWith-X-Axis" : function() {
      var css = qx.bom.element.Transform.getCss({scale: 1.2, translate: "123px"});
      var sheet = qx.bom.Stylesheet.createElement();
      qx.bom.Stylesheet.addRule(sheet, ".test", css);
      var computedRule = sheet.cssRules[0].cssText;

      this.assertTrue(computedRule.indexOf("translate(123px)") != -1, "Found: " + computedRule);
      this.assertTrue(computedRule.indexOf("scale(1.2)") != -1, "Found: " + computedRule);
    },

    "testAddStyleSheetRuleWith-XY-Axis" : function() {
      var css = qx.bom.element.Transform.getCss({scale: "1.2, 1", translate: "123px,234px"});
      var sheet = qx.bom.Stylesheet.createElement();
      qx.bom.Stylesheet.addRule(sheet, ".test", css);

      var computedRule = sheet.cssRules[0].cssText;

      this.assertTrue(computedRule.indexOf("translate(123px, 234px)") != -1, "Found: " + computedRule);
      this.assertTrue(computedRule.indexOf("scale(1.2, 1)") != -1, "Found: " + computedRule);
    },



    /**
     * ARRAY VALUES
     */
    test3D : function() {
      qx.bom.element.Transform.translate(this.__el, ["1px", "2px", "3px"]);

      // 3d property
      if (qx.core.Environment.get("css.transform.3d")) {
        this.assertTrue(this.__el.style[this.__keys.name].indexOf("translate3d(1px, 2px, 3px)") != -1, "translate3d");
      }

      // 2d property
      else {
        this.assertTrue(this.__el.style[this.__keys.name].indexOf("translateX(1px) translateY(2px)") != -1);
      }
    },


    "testAddStyleSheetRuleWith-XYZ-Axis" : function() {
      var css = qx.bom.element.Transform.getCss({scale: [1.2, 1, 0], translate: ["123px", "234px", "345em"]});
      var sheet = qx.bom.Stylesheet.createElement();
      qx.bom.Stylesheet.addRule(sheet, ".test", css);

      var computedRule = sheet.cssRules[0].cssText;

      // 3d property
      if (qx.core.Environment.get("css.transform.3d")) {
        this.assertTrue(computedRule.indexOf("translate3d(123px, 234px, 345em)") != -1, "Found: " + computedRule);
        this.assertTrue(computedRule.indexOf("scale3d(1.2, 1, 0)") != -1, "Found: " + computedRule);
      }

      // 2d property
      else {
        this.assertTrue(computedRule.indexOf("translateX(123px)") != -1, "Found: " + computedRule);
        this.assertTrue(computedRule.indexOf("translateY(234px)") != -1, "Found: " + computedRule);
        this.assertFalse(computedRule.indexOf("translateY(345em)") != -1, "Found: " + computedRule);

        this.assertTrue(computedRule.indexOf("scaleX(1.2)") != -1, "Found: " + computedRule);
        this.assertTrue(computedRule.indexOf("scaleY(1)") != -1, "Found: " + computedRule);
        this.assertFalse(computedRule.indexOf("scaleZ(0)") != -1, "Found: " + computedRule);
      }
    },



    /**
     * CSS HELPER
     */

    testGetCss : function() {
      var value = qx.bom.element.Transform.getCss({scale: 1.2});
      this.assertEquals(qx.bom.Style.getCssName(this.__keys.name) + ":scale(1.2);", value);
    },


    /**
     * ADDITIONAL CSS TRANSFORM PROPERTIES
     */

    testOrigin : function() {
      qx.bom.element.Transform.setOrigin(this.__el, "30% 20%");
      this.assertEquals("30% 20%", this.__el.style[this.__keys["origin"]]);
      this.assertEquals("30% 20%", qx.bom.element.Transform.getOrigin(this.__el));
    },

    testStyle : function() {
      qx.bom.element.Transform.setStyle(this.__el, "affe");
      this.assertEquals("affe", this.__el.style[this.__keys["style"]]);
      this.assertEquals("affe", qx.bom.element.Transform.getStyle(this.__el));
    },

    testPerspective : function() {
      qx.bom.element.Transform.setPerspective(this.__el, 123);
      this.assertEquals("123px", this.__el.style[this.__keys["perspective"]]);
      this.assertEquals("123px", qx.bom.element.Transform.getPerspective(this.__el));
    },

    testPerspectiveOrigin : function() {
      qx.bom.element.Transform.setPerspectiveOrigin(this.__el, "30% 10%");
      this.assertEquals("30% 10%", this.__el.style[this.__keys["perspective-origin"]]);
      this.assertEquals("30% 10%", qx.bom.element.Transform.getPerspectiveOrigin(this.__el));

    },

    testBackfaceVisibility : function() {
      qx.bom.element.Transform.setBackfaceVisibility(this.__el, true);
      this.assertEquals("visible", this.__el.style[this.__keys["backface-visibility"]]);
      this.assertTrue(qx.bom.element.Transform.getBackfaceVisibility(this.__el));
    },

    testGetTransformValue : function() {
      var cssValue;

      // one axis
      cssValue = qx.bom.element.Transform.getTransformValue({
        scale : [1]
      });

      this.assertEquals(cssValue, "scaleX(1)");


      // two axis
      cssValue = qx.bom.element.Transform.getTransformValue({
        scale : [1, 2]
      });

      this.assertEquals(cssValue, "scaleX(1) scaleY(2)");

      // three axis
      cssValue = qx.bom.element.Transform.getTransformValue({
        scale : [1, 2, 3]
      });

      // 3d property
      if (qx.core.Environment.get("css.transform.3d")) {
        this.assertEquals(cssValue, "scale3d(1, 2, 3)");
      }

      // 2d property
      else {
        this.assertEquals(cssValue, "scaleX(1) scaleY(2)");
      }
    },

    testTransformArray : function() {
      qx.bom.element.Transform.transform(this.__el, {
        translate : ["1px", "2px", "3px"],
        scale : [1, 2, 3],
        rotate : ["1deg", "2deg", "3deg"],
        skew : ["1deg", "2deg"]
      });

      // 3d property
      if (qx.core.Environment.get("css.transform.3d")) {
        this.assertTrue(this.__el.style[this.__keys.name].indexOf("translate3d(1px, 2px, 3px)") != -1, "translate3d");
        this.assertTrue(this.__el.style[this.__keys.name].indexOf("scale3d(1, 2, 3)") != -1, "scale3d");

        this.assertTrue(this.__el.style[this.__keys.name].indexOf("rotateZ(3deg)") != -1, "rotate");
        this.assertTrue(this.__el.style[this.__keys.name].indexOf("skewX(1deg) skewY(2deg)") != -1, "skew");
      }

      // 2d property
      else {
        this.assertTrue(this.__el.style[this.__keys.name].indexOf("translateX(1px) translateY(2px)") != -1, "translate");
        this.assertTrue(this.__el.style[this.__keys.name].indexOf("scaleX(1) scaleY(2)") != -1, "scale");

        this.assertTrue(this.__el.style[this.__keys.name].indexOf("skewX(1deg) skewY(2deg)") != -1, "skew");
      }
    }
  }
});
