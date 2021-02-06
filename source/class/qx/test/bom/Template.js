/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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

    /**
     * render()
     */

    testReplace : function() {
      var template = "{{name}} xyz";
      var view = {name: "abc"};
      var result = qx.bom.Template.render(template, view);
      var expected = "abc xyz";

      this.assertEquals(expected, result);
    },


    testFunc : function() {
      var template = "{{name}} xyz";
      var view = {name: function() {return "abc";}};
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
          };
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
     * renderToNode()
     */

    testRenderToNode : function() {
      var el = qx.bom.Template.renderToNode("<div>{{a}}</div>", {a: 123});

      this.assertEquals("DIV", el.tagName);
      this.assertEquals("123", el.innerHTML);
    },


    testRenderToNodePlainText : function() {
      var tmpl = "{{a}}.{{b}}";
      var el = qx.bom.Template.renderToNode(tmpl, {a: 123, b: 234});

      this.assertEquals("123.234", el.data);
    },


    testRenderToNodeMixed : function() {
      var tmpl = "<div>{{a}}<span>{{b}}</span></div>";
      var el = qx.bom.Template.renderToNode(tmpl, {a: 123, b: 234});

      this.assertEquals("123<span>234</span>", el.innerHTML.toLowerCase());
    },

    /**
     * _createNodeFromTemplate()
     */

    testCreateNodeFromTemplateTextNode : function() {
      var tmpl = "{{a}}.{{b}}";
      var el = qx.bom.Template._createNodeFromTemplate(tmpl);

      // Node.TEXT_NODE === 3 (IE <= 8 doesn't know 'Node')
      this.assertEquals(3, el.nodeType);
    },

    testCreateNodeFromTemplateElementNode : function() {
      var tmpl = "<div>{{a}}</div>";
      var el = qx.bom.Template._createNodeFromTemplate(tmpl);

      // Node.ELEMENT_NODE === 1 (IE <= 8 doesn't know 'Node')
      this.assertEquals(1, el.nodeType);
    },

    /**
     * get()
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
      this.assertEquals("123.234", el.data);
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
    },

    // test a potential exploit https://nodesecurity.io/advisories/62
    testHtmlEscaping : function() {
        var template = "<a href={{foo}}/>";
        var view = {foo: 'test.com onload=alert(1)'};
        var result = qx.bom.Template.render(template, view);
        var expected = "<a href=test.com onload&#x3D;alert(1)/>";

        this.assertEquals(expected, result);
    }
  }
});
