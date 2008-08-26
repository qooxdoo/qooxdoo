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

qx.Class.define("qx.test.bom.Basic",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    setUp : function()
    {
      var div = document.createElement("div");
      div.id = "html_basics"

      div.innerHTML =
        '<div id="test1" class="hello world" title="hello world title">' +
        ' <input id="test2" name="foo2" type="text" maxlength="20" value="hello"/>' +
        '  <input tabindex="2" id="test3" type="checkbox" checked="true" name="foo3" value="bar"/>' +
        '  <input id="test4" type="text" disabled="disabled"/>' +
        '  <input id="test5" type="text" disabled="false" READONLY="true"/>' +  // <- note this div will be disabled!!
        '  <a id="test6" style="color:red;background:blue" href="../foo.html"><b>Foo</b>-Link</a>' +
        '  <table id="test7" valign="bottom"><tr><td colspan="3"></td></tr></table>' +
        '  <span id="test8">Black</span>' +
        '</div>'
      document.body.appendChild(div);
    },


    tearDown : function()
    {
      var div = document.getElementById("html_basics");
      document.body.removeChild(div);
    },


    testElementAttributes : function()
    {
      var attrib = qx.bom.element.Attribute;
      var style = qx.bom.element.Style;
      var opac = qx.bom.element.Opacity;

      var test1 = document.getElementById("test1");

      this.assertEquals("hello world", attrib.get(test1, "class"));
      this.assertEquals("hello world title", attrib.get(test1, "title"));

      var test2 = document.getElementById("test2");
      this.assertEquals("foo2", attrib.get(test2, "name"));
      this.assertEquals("hello", attrib.get(test2, "value"));
      this.assertEquals("text", attrib.get(test2, "type"));
      this.assertEquals(20, attrib.get(test2, "maxlength"));

      var test3 = document.getElementById("test3");
      this.assertEquals("foo3", attrib.get(test3, "name"));
      this.assertEquals("bar", attrib.get(test3, "value"));
      this.assertEquals("checkbox", attrib.get(test3, "type"));
      this.assertEquals(true, attrib.get(test3, "checked"));
      this.assertEquals(false, attrib.get(test3, "disabled"));
      this.assertEquals(2, attrib.get(test3, "tabindex"));

      this.info("test4");
      this.assertEquals(true, attrib.get(document.getElementById("test4"), "disabled"));
      this.assertEquals(false, attrib.get(document.getElementById("test4"), "readonly"));

      this.info("test5");
      this.assertEquals(true, attrib.get(document.getElementById("test5"), "disabled"));
      this.assertEquals(true, attrib.get(document.getElementById("test5"), "readonly"));

      this.info("test6");
      this.assert(qx.lang.String.endsWith(attrib.get(document.getElementById("test6"), "href"), "/foo.html"));

      var test6Color = style.get(document.getElementById("test6"), "color");
      this.assertCssColor("red", test6Color);

      var test6BackgroundColor = style.get(document.getElementById("test6"), "backgroundColor");
      this.assertCssColor("blue", test6BackgroundColor);

      this.assertIdentical("", style.get(document.getElementById("test6"), "font", style.LOCAL_MODE));

      // This test fails in IE, Webkit and Opera but the value is correct
      //this.assertEquals("serif", style.get(document.getElementById("test6"), "fontFamily"));
      this.assertEquals("Foo-Link", attrib.get(document.getElementById("test6"), "text"));
      this.assertEquals("<b>foo</b>-link", attrib.get(document.getElementById("test6"), "html").toLowerCase());
      this.assertEquals(1, opac.get(document.getElementById("test6")));

      this.info("test7");
      this.assertEquals("bottom", attrib.get(document.getElementById("test7"), "valign"));
      this.assertEquals(3, attrib.get(document.getElementById("test7").getElementsByTagName("td")[0], "colspan"));

      this.info("test8");
      style.set(document.getElementById("test8"), "color", "red");
      style.set(document.getElementById("test8"), "backgroundColor", "black");

      opac.set(document.getElementById("test8"), 0.5);

      var test8Color = style.get(document.getElementById("test8"), "color");
      this.assertCssColor("red", test8Color);

      var test8BackgroundColor = style.get(document.getElementById("test8"), "backgroundColor");
      this.assertCssColor("black", test8BackgroundColor);

      this.assertEquals(0.5, opac.get(document.getElementById("test8")));
    }

  }

});
