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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.bom.Template",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __tmpl: null,

    tearDown : function() {
      if (this.__tmpl) {
        qx.dom.Element.removeChild(this.__tmpl, document.body);
      }
    },


    testReplace : function() {
      var template = "{{name}} xyz";
      var view = {name: "abc"};
      var result = qx.bom.Template.render(template, view);
      var expected = "abc xyz";

      this.assertEquals(expected, result);
    },


    testFunc : function() {
      var template = "{{name}} xyz";
      var view = {name: function() {return "abc"}};
      var result = qx.bom.Template.render(template, view);
      var expected = "abc xyz";

      this.assertEquals(expected, result);
    },


    testList : function() {
      var template = "{{#l}}{{.}}{{/l}}";
      var view = {l : ["a", "b", "c"]};
      var result = qx.bom.Template.render(template, view);
      var expected = "abc";

      this.assertEquals(expected, result);
    },


    conditional : function() {
      var template = "{{#b}}yo{{/b}}";
      var view = {b: true};
      var result = qx.bom.Template.render(template, view);
      var expected = "yo";

      this.assertEquals(expected, result);

      template = "{{#b}}yo{{/b}}";
      view = {b: false};
      result = qx.bom.Template.render(template, view);
      expected = "";

      this.assertEquals(expected, result);
    },


    testObject : function() {
      var template = "{{#o}}{{b}}{{a}}{{/o}}";
      var view = {o: {a: 1, b: 2}};
      var result = qx.bom.Template.render(template, view);
      var expected = "21";

      this.assertEquals(expected, result);
    },


    testWrapper : function() {
      var template = "{{#b}}yo{{/b}}";
      var view = {
        b: function() {
          return function(text, render) {
            return "!" + render(text) + "!";
          }
        }
      };
      var result = qx.bom.Template.render(template, view);
      var expected = "!yo!";

      this.assertEquals(expected, result);
    },


    testInvertedSelection : function() {
      var template = "{{^a}}yo{{/a}}";
      var view = {a: []};
      var result = qx.bom.Template.render(template, view);
      var expected = "yo";

      this.assertEquals(expected, result);
    },


    testEscaping : function() {
      var template = "{{a}}";
      var view = {a: "<a>"};
      var result = qx.bom.Template.render(template, view);
      var expected = "&lt;a&gt;";

      this.assertEquals(expected, result);

      var template = "{{{a}}}";
      var view = {a: "<a>"};
      var result = qx.bom.Template.render(template, view);
      var expected = "<a>";

      this.assertEquals(expected, result);
    },


    /**
     * TEST THE GET METHOD
     */

    testGet : function() {
      // add template
      this.__tmpl = qx.dom.Element.create("div");
      qx.bom.element.Attribute.set(this.__tmpl, "id", "qx-test-template");
      qx.bom.element.Style.set(this.__tmpl, "display", "none");
      this.__tmpl.innerHTML = "<div>{{a}}</div>";
      qx.dom.Element.insertEnd(this.__tmpl, document.body);

      // test the get method
      var el = qx.bom.Template.get("qx-test-template", {a: 123});

      this.assertEquals("DIV", el.tagName);
      this.assertEquals("123", el.innerHTML);
    },


    testPlainText : function() {
      // add template
      this.__tmpl = qx.dom.Element.create("div");
      qx.bom.element.Attribute.set(this.__tmpl, "id", "qx-test-template");
      qx.bom.element.Style.set(this.__tmpl, "display", "none");
      this.__tmpl.innerHTML = "{{a}}.{{b}}";
      qx.dom.Element.insertEnd(this.__tmpl, document.body);

      // test the get method
      var el = qx.bom.Template.get("qx-test-template", {a: 123, b: 234});
      this.assertEquals("123.234", el);
    },


    testGetMixed : function() {
      // add template
      this.__tmpl = qx.dom.Element.create("div");
      qx.bom.element.Attribute.set(this.__tmpl, "id", "qx-test-template");
      qx.bom.element.Style.set(this.__tmpl, "display", "none");
      this.__tmpl.innerHTML = "<div>{{a}}<span>{{b}}</span></div>";
      qx.dom.Element.insertEnd(this.__tmpl, document.body);

      // test the get method
      var el = qx.bom.Template.get("qx-test-template", {a: 123, b: 234});

      // IE uses uppercase tag names
      this.assertEquals("123<span>234</span>", el.innerHTML.toLowerCase());
    }
  }
});
