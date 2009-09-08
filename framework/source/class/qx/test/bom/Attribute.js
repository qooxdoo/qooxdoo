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
     * Alexander Back (aback)

************************************************************************ */

qx.Class.define("qx.test.bom.Attribute",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      var div = document.createElement("div");
      div.id = "el";

      this._el = div;
      document.body.appendChild(div);

      var checkBox = document.createElement("input");
      checkBox.type = "checkbox";

      this._checkBox = checkBox;
      document.body.appendChild(checkBox);
    },


    tearDown : function() {
      document.body.removeChild(this._el);
      document.body.removeChild(this._checkBox);
    },


    testSetAttribute : function()
    {
      var Attribute = qx.bom.element.Attribute;

      Attribute.set(this._el, "maxLength", 10);
      this.assertEquals(10, this._el["maxLength"]);

      Attribute.set(this._checkBox, "checked", true);
      this.assertTrue(this._checkBox["checked"]);

      Attribute.set(this._el, "className", "vanillebaer");
      this.assertEquals("vanillebaer", this._el["className"]);
    },

    testGetAttribute : function()
    {
      var Attribute = qx.bom.element.Attribute;

      this._el.setAttribute("maxLength", 10);
      this.assertEquals(10, Attribute.get(this._el, "maxLength"));

      this._checkBox.setAttribute("checked", "checked");
      this.assertEquals(true, Attribute.get(this._checkBox, "checked"));

      this._el["className"] = "vanillebaer";
      this.assertEquals("vanillebaer", Attribute.get(this._el, "className"));
    },

    testRemoveAttribute : function()
    {
      var Attribute = qx.bom.element.Attribute;

      Attribute.set(this._el, "maxLength", 10);
      Attribute.set(this._el, "maxLength", null);
      this.assertEquals(10000000, this._el["maxLength"]);

      Attribute.set(this._checkBox, "checked", true);
      Attribute.set(this._checkBox, "checked", null);
      this.assertFalse(this._checkBox["checked"]);

      Attribute.set(this._el, "html", "vanillebaer");
      Attribute.set(this._el, "html", null);
      this.assertNull(this._el.getAttribute("html"));
    },

    testResetAttribute : function()
    {
      var Attribute = qx.bom.element.Attribute;

      Attribute.set(this._el, "maxLength", 10);
      Attribute.reset(this._el, "maxLength");
      this.assertEquals(10000000, this._el["maxLength"]);

      Attribute.set(this._checkBox, "checked", true);
      Attribute.reset(this._checkBox, "checked");
      this.assertFalse(this._checkBox["checked"]);
    }
  }
});