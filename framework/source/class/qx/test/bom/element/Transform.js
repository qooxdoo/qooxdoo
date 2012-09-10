/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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



    /**
     * ARRAY VALUES
     */
    test3D : function() {
      // 2d case
      qx.bom.element.Transform.translate(this.__el, ["1", "2"]);
      this.assertTrue(this.__el.style[this.__keys.name].indexOf("translateX(1)") != -1);
      this.assertTrue(this.__el.style[this.__keys.name].indexOf("translateY(2)") != -1);

      // 3d case
      qx.bom.element.Transform.translate(this.__el, ["1", "2", "3"]);
      this.assertTrue(this.__el.style[this.__keys.name].indexOf("translateX(1)") != -1);
      this.assertTrue(this.__el.style[this.__keys.name].indexOf("translateY(2)") != -1);
      this.assertTrue(this.__el.style[this.__keys.name].indexOf("translateZ(3)") != -1);
    },

    /**
     * CSS HELPER
     */

    testGetCss : function() {
      var value = qx.bom.element.Transform.getCss({scale: 1.2});
      var expected = qx.lang.String.hyphenate(this.__keys.name) + ":scale(1.2) ;";
      this.assertEquals(expected, value);
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
      qx.bom.element.Transform.setPerspective(this.__el, "affe");
      this.assertEquals("affe", this.__el.style[this.__keys["perspective"]]);
      this.assertEquals("affe", qx.bom.element.Transform.getPerspective(this.__el));
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
    }
  }
});