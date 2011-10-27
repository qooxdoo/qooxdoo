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

/* ************************************************************************
#ignore(qx.test.propA)
************************************************************************ */

qx.Class.define("qx.test.util.PropertyUtil",
{
  extend : qx.test.ui.LayoutTestCase,


  members :
  {
    setUp : function()
    {
      this.button = new qx.ui.form.Button();
      this.getRoot().add(this.button);
      this.flush();
    },


    tearDown : function() {
      this.base(arguments);
      this.button.destroy();
    },


    testGetUserValue : function()
    {
      var Prop = qx.util.PropertyUtil;
      this.assertUndefined(Prop.getUserValue(this.button, "label"));

      this.button.setLabel("juhu");
      this.assertEquals("juhu", Prop.getUserValue(this.button, "label"));

      // center has a themed value
      this.assertUndefined(Prop.getUserValue(this.button, "center"));
    },


    testGetThemeValue : function()
    {
      var Prop = qx.util.PropertyUtil;
      this.assertUndefined(Prop.getThemeValue(this.button, "content"));
      this.assertEquals(true, Prop.getThemeValue(this.button, "center"));
    },


    testGetInitValue : function()
    {
      var Prop = qx.util.PropertyUtil;
      this.assertUndefined(Prop.getInitValue(this.button, "content"));
      this.assertEquals(false, Prop.getInitValue(this.button, "rich"));
    },


    testSetThemed : function()
    {
      var Prop = qx.util.PropertyUtil;
      this.assertNull(this.button.getIcon());

      Prop.setThemed(this.button, "icon", "right.png");
      this.assertEquals("right.png", this.button.getIcon());
      this.assertEquals("right.png", Prop.getThemeValue(this.button, "icon"));

      Prop.resetThemed(this.button, "icon");
      this.assertNull(this.button.getIcon());
      this.assertUndefined(Prop.getThemeValue(this.button, "icon"));
    },

    testGetProperties : function()
    {
      qx.Class.define("qx.test.propA", {
        extend : qx.core.Object,
        properties : {
          a : {}
        }
      });

      qx.Class.define("qx.test.propB", {
        extend : qx.test.propA,
        properties : {
          b : {}
        }
      });

      // check getProperties
      this.assertKeyInMap("a", qx.util.PropertyUtil.getProperties(qx.test.propA));
      this.assertKeyInMap("b", qx.util.PropertyUtil.getProperties(qx.test.propB));

      // check getAllProperties
      this.assertKeyInMap("a", qx.util.PropertyUtil.getAllProperties(qx.test.propB));
      this.assertKeyInMap("b", qx.util.PropertyUtil.getAllProperties(qx.test.propB));

      delete qx.test.propB;
      delete qx.test.propA;
    }
  }
});