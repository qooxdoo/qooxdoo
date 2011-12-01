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
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************
#asset(qx/test/style.css)
************************************************************************ */

qx.Class.define("qx.test.bom.Stylesheet",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    tearDown : function()
    {
      if (this.__sheet) {
        var ownerNode = this.__sheet.ownerNode || this.__sheet.owningNode;
        if (ownerNode && ownerNode.parentNode) {
          ownerNode.parentNode.removeChild(ownerNode);
        }
        else {
          qx.bom.Stylesheet.removeAllRules(this.__sheet);
        }
      }
    },

    testAddImport : function()
    {
      var sheet = this.__sheet = qx.bom.Stylesheet.createElement();
      var uri = qx.util.ResourceManager.getInstance().toUri("qx/test/style.css");
      qx.bom.Stylesheet.addImport(sheet, uri);
      if (sheet.cssRules) {
        var rules = sheet.cssRules || sheet.rules;
        this.assertEquals(1, sheet.cssRules.length);
        this.assertNotUndefined(sheet.cssRules[0].href);
      }
      else if (sheet.cssText) {
        this.assertMatch(sheet.cssText, /@import/);
      }
    },

    testAddRule : function()
    {
      var sheet = this.__sheet = qx.bom.Stylesheet.createElement();
      qx.bom.Stylesheet.addRule(sheet, "#foo", "color: red;");
      var rules = sheet.cssRules || sheet.rules;
      this.assertEquals(1, rules.length);
      this.assertEquals("#foo", rules[0].selectorText);
    },

    testCreateElement : function()
    {
      var sheet = this.__sheet = qx.bom.Stylesheet.createElement();
      var rules = sheet.cssRules || sheet.rules;
      this.assertNotUndefined(rules, "Created element is not a stylesheet!");
      this.assertEquals(0, rules.length);
    },

    testCreateElementWithText : function()
    {
      var cssText = "#foo { color: red; }";
      var sheet = this.__sheet = qx.bom.Stylesheet.createElement(cssText);
      var rules = sheet.cssRules || sheet.rules;
      this.assertNotUndefined(rules, "Created element is not a stylesheet!");
      this.assertEquals(1, rules.length);
      this.assertEquals("#foo", rules[0].selectorText);
    },

    testIncludeFile : function()
    {
      var uri = qx.util.ResourceManager.getInstance().toUri("qx/test/style.css");
      qx.bom.Stylesheet.includeFile(uri);
      var linkElems = document.getElementsByTagName("link");
      var found = false;
      for (var i=0, l=linkElems.length; i<l; i++) {
        if (linkElems[i].href.match(/test\/style\.css/)) {
          found = true;
          break;
        }
      }
      this.assert(found, "Link element was not added to the document!");
    },

    testRemoveAllImports : function()
    {
      var sheet = this.__sheet = qx.bom.Stylesheet.createElement();
      var uri = qx.util.ResourceManager.getInstance().toUri("qx/test/style.css");
      qx.bom.Stylesheet.addImport(sheet, uri);
      qx.bom.Stylesheet.addImport(sheet, uri);
      qx.bom.Stylesheet.removeAllImports(sheet);
      if (sheet.cssRules) {
        var rules = sheet.cssRules || sheet.rules;
        this.assertEquals(0, sheet.cssRules.length);
      }
      else if (typeof sheet.cssText == "string") {
        this.assertEquals("", sheet.cssText);
      }
    },

    testRemoveAllRules : function()
    {
      var sheet = this.__sheet = qx.bom.Stylesheet.createElement();
      qx.bom.Stylesheet.addRule(sheet, "#foo", "color: red;");
      qx.bom.Stylesheet.addRule(sheet, "#bar", "color: blue;");
      var rules = sheet.cssRules || sheet.rules;
      this.assertEquals(2, rules.length);

      qx.bom.Stylesheet.removeAllRules(sheet);
      rules = sheet.cssRules || sheet.rules;
      this.assertEquals(0, rules.length);
    },

    testRemoveImport : function()
    {
      var sheet = this.__sheet = qx.bom.Stylesheet.createElement();
      var uri = qx.util.ResourceManager.getInstance().toUri("qx/test/style.css");
      qx.bom.Stylesheet.addImport(sheet, uri);

      qx.bom.Stylesheet.removeImport(sheet, uri);
      if (sheet.cssRules) {
        var rules = sheet.cssRules || sheet.rules;
        this.assertEquals(0, sheet.cssRules.length);
      }
      else if (typeof sheet.cssText == "string") {
        this.assertEquals("", sheet.cssText);
      }
    },

    testRemoveRule : function()
    {
      var sheet = this.__sheet = qx.bom.Stylesheet.createElement("#foo { color: red; }");
      qx.bom.Stylesheet.removeRule(sheet, "#foo");
      var rules = sheet.cssRules || sheet.rules;
      this.assertEquals(0, rules.length);
    }
  }
});