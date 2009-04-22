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
    },
  
  
    tearDown : function() {
      document.body.removeChild(this._el);
    },
  
    
    testSetAttribute : function()
    {
      var Attribute = qx.bom.element.Attribute;
      
      Attribute.set(this._el, "maxLength", 10);
      this.assertEquals(10, this._el["maxLength"]);
      
      Attribute.set(this._el, "checked", true);
      this.assertEquals("checked", this._el.getAttribute("checked"));
      
      Attribute.set(this._el, "className", "vanillebaer");
      this.assertEquals("vanillebaer", this._el["className"]);
    },

    testGetAttribute : function()
    {
      var Attribute = qx.bom.element.Attribute;
      
      this._el.setAttribute("maxLength", 10);
      this.assertEquals(10, Attribute.get(this._el, "maxLength"));
      
      this._el.setAttribute("checked", "checked");
      this.assertEquals(true, Attribute.get(this._el, "checked"));
      
      this._el["className"] = "vanillebaer";
      this.assertEquals("vanillebaer", Attribute.get(this._el, "className"));
    },
    
    testRemoveAttribute : function()
    {
      var Attribute = qx.bom.element.Attribute;
      
      Attribute.set(this._el, "maxLength", 10);
      Attribute.set(this._el, "maxLength", null);
      this.assertNull(this._el.getAttribute("maxLength"));
      
      Attribute.set(this._el, "checked", true);
      Attribute.set(this._el, "checked", null);
      this.assertNull(this._el.getAttribute("checked"));
      
      Attribute.set(this._el, "html", "vanillebaer");
      Attribute.set(this._el, "html", null);
      this.assertNull(this._el.getAttribute("html"));
    },
    
    testResetAttribute : function()
    {
      var Attribute = qx.bom.element.Attribute;
      
      Attribute.set(this._el, "maxLength", 10);
      Attribute.reset(this._el, "maxLength");
      this.assertNull(this._el.getAttribute("maxLength"));
      
      Attribute.set(this._el, "checked", true);
      Attribute.reset(this._el, "checked");
      this.assertNull(this._el.getAttribute("checked"));
    }
  }
});