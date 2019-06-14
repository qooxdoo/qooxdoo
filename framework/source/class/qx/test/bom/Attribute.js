/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

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
 * @asset(qx/icon/${qx.icontheme}/48/places/folder.png)
 */

qx.Class.define("qx.test.bom.Attribute",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __maxLengthValues : null,

    setUp : function()
    {
      var div = document.createElement("div");
      div.id = "el";

      this._el = div;
      document.body.appendChild(div);

      var input = document.createElement("input");
      this._input = input;
      document.body.appendChild(input);

      var checkBox = document.createElement("input");
      checkBox.type = "checkbox";

      this._checkBox = checkBox;
      document.body.appendChild(checkBox);

      var img = document.createElement("img");
      this._img = img;
      document.body.appendChild(img);

      this.__maxLengthValues = {
        "mshtml": 2147483647,
        "default": -1
      };
    },


    tearDown : function() {
      document.body.removeChild(this._el);
      document.body.removeChild(this._checkBox);
      document.body.removeChild(this._img);
      document.body.removeChild(this._input);
    },


    testSetAttribute : function()
    {
      var Attribute = qx.bom.element.Attribute;

      Attribute.set(this._el, "maxLength", 10);
      this.assertEquals(10, this._el.getAttribute("maxLength"));

      Attribute.set(this._checkBox, "checked", true);
      this.assertTrue(this._checkBox["checked"]);

      Attribute.set(this._el, "className", "vanillebaer");
      this.assertEquals("vanillebaer", this._el["className"]);

      Attribute.set(this._el, "selected", true);
      this.assertEquals("selected", this._el.getAttribute("selected"));

      var imgSrc = qx.util.ResourceManager.getInstance().toUri("qx/icon/Tango/48/places/folder.png");
      Attribute.set(this._img, "src", imgSrc);
      this.assertEquals(imgSrc, this._img.getAttribute("src", 2));

      Attribute.set(this._el, "data-foo", true);
      this.assertEquals("true", this._el.getAttribute("data-foo"));

    },

    testSetAttributeWithUndefinedValue : function()
    {
      var Attribute = qx.bom.element.Attribute;

      Attribute.set(this._el, "src", undefined);
      this.assertNotEquals("undefined", this._el.getAttribute("src"));
    },

    testGetAttribute : function()
    {
      var Attribute = qx.bom.element.Attribute;

      if (qx.core.Environment.get("browser.name") == "edge") {
        this.assertEquals(Attribute.get(this._input, "maxLength"), this.__maxLengthValues.mshtml);
      }
      else if (qx.core.Environment.get("browser.name") == "chrome" || 
               qx.core.Environment.get("browser.name") == "safari") {
        this.assertEquals(Attribute.get(this._input, "maxLength"), this.__maxLengthValues["default"]);
      } else {
        this.assertNull(Attribute.get(this._input, "maxLength"));
      }
      this.assertFalse(Attribute.get(this._checkBox, "checked"));
      this.assertNull(Attribute.get(this._el, "className"));
      this.assertNull(Attribute.get(this._el, "innerHTML"));
      this.assertNull(Attribute.get(this._checkBox, "tabIndex"));
      this.assertFalse(Attribute.get(this._checkBox, "readOnly"));
      this.assertNull(Attribute.get(this._input, "value"));

      this._checkBox.setAttribute("checked", true);
      this.assertEquals(true, Attribute.get(this._checkBox, "checked"));

      this._checkBox.removeAttribute("checked");
      this.assertFalse(Attribute.get(this._checkBox, "checked"));

      this._el["className"] = "vanillebaer";
      this.assertEquals("vanillebaer", Attribute.get(this._el, "className"));

      this._el.innerHTML = "vanillebaer";
      this.assertEquals("vanillebaer", Attribute.get(this._el, "innerHTML"));

      this._checkBox["tabIndex"] = 1000;
      this.assertEquals(1000, Attribute.get(this._checkBox, "tabIndex"));

      this._checkBox["tabIndex"] = 0;
      this.assertNull(Attribute.get(this._checkBox, "tabIndex"));

      this._checkBox["tabIndex"] = -1;
      this.assertEquals(-1, Attribute.get(this._checkBox, "tabIndex"));

      this._checkBox["readOnly"] = true;
      this.assertTrue(Attribute.get(this._checkBox, "readonly"));

      this._checkBox["value"] = "vanillebaer";
      this.assertEquals("vanillebaer", Attribute.get(this._checkBox, "value"));

      var imgSrc = qx.util.ResourceManager.getInstance().toUri("qx/icon/Tango/48/places/folder.png");
      Attribute.set(this._img, "src", imgSrc);
      this.assertEquals(imgSrc, Attribute.get(this._img, "src"));
    },

    testRemoveAttribute : function()
    {
      var Attribute = qx.bom.element.Attribute;

      Attribute.set(this._input, "maxLength", 10);
      Attribute.set(this._input, "maxLength", null);

      var maxLengthValue = qx.core.Environment.select("engine.name", this.__maxLengthValues);

      if (qx.core.Environment.get("browser.name") == "edge") {
        maxLengthValue = this.__maxLengthValues.mshtml;
      }
      else if (qx.core.Environment.get("browser.name") == "chrome" ||
               qx.core.Environment.get("browser.name") == "safari") {
        maxLengthValue = this.__maxLengthValues["default"];
      }

      this.assertEquals(maxLengthValue, this._input["maxLength"]);
      if (qx.core.Environment.get("browser.name") == "edge") {
        this.assertEquals(Attribute.get(this._input, "maxLength"), this.__maxLengthValues.mshtml);
      }
      else if (qx.core.Environment.get("browser.name") == "chrome" ||
               qx.core.Environment.get("browser.name") == "safari") {
        this.assertEquals(Attribute.get(this._input, "maxLength"), this.__maxLengthValues["default"]);
      } else {
        this.assertNull(Attribute.get(this._input, "maxLength"));
      }

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

      Attribute.set(this._input, "maxLength", 10);
      Attribute.reset(this._input, "maxLength");
      if (qx.core.Environment.get("browser.name") == "edge") {
        this.assertEquals(Attribute.get(this._input, "maxLength"), this.__maxLengthValues.mshtml);
      }
      else if (qx.core.Environment.get("browser.name") == "chrome" ||
               qx.core.Environment.get("browser.name") == "safari") {
        this.assertEquals(Attribute.get(this._input, "maxLength"), this.__maxLengthValues["default"]);
      } else {
        this.assertNull(Attribute.get(this._input, "maxLength"));
      }

      Attribute.set(this._checkBox, "disabled", true);
      Attribute.reset(this._checkBox, "disabled");
      this.assertFalse(Attribute.get(this._checkBox, "disabled"));

      Attribute.set(this._checkBox, "multiple", true);
      Attribute.reset(this._checkBox, "multiple");
      this.assertFalse(Attribute.get(this._checkBox, "multiple"));

      Attribute.set(this._el, "innerHTML", "<b>foo</b>");
      Attribute.reset(this._el, "innerHTML");
      this.assertNull(Attribute.get(this._el, "innerHTML"));
      Attribute.set(this._el, "tabIndex", 10);
      Attribute.reset(this._el, "tabIndex");
      this.assertNull(Attribute.get(this._el, "tabIndex"));

      Attribute.set(this._input, "tabIndex", 20);
      Attribute.reset(this._input, "tabIndex");
      this.assertNull(Attribute.get(this._input, "tabIndex"));

      Attribute.set(this._checkBox, "checked", true);
      Attribute.reset(this._checkBox, "checked");
      this.assertFalse(Attribute.get(this._checkBox, "checked"));

      Attribute.set(this._checkBox, "readOnly", true);
      Attribute.reset(this._checkBox, "readonly");
      this.assertFalse(Attribute.get(this._checkBox, "readonly"));

      Attribute.set(this._input, "value", "foo");
      Attribute.reset(this._input, "value");
      this.assertNull(Attribute.get(this._input, "value"));

    }
  }
});
