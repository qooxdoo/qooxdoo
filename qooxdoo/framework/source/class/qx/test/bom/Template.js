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
    testReplace : function() {
      var template = "{{name}} xyz";
      var view = {name: "abc"};
      var result = qx.bom.Template.toHtml(template, view);
      var expected = "abc xyz";
      
      this.assertEquals(expected, result);
    },


    testFunc : function() {
      var template = "{{name}} xyz";
      var view = {name: function() {return "abc"}};
      var result = qx.bom.Template.toHtml(template, view);
      var expected = "abc xyz";
      
      this.assertEquals(expected, result);
    },


    testList : function() {
      var template = "{{#l}}{{.}}{{/l}}";
      var view = {l : ["a", "b", "c"]};
      var result = qx.bom.Template.toHtml(template, view);
      var expected = "abc";
      
      this.assertEquals(expected, result);
    },


    conditional : function() {
      var template = "{{#b}}yo{{/b}}";
      var view = {b: true};
      var result = qx.bom.Template.toHtml(template, view);
      var expected = "yo";
      
      this.assertEquals(expected, result);
      
      template = "{{#b}}yo{{/b}}";
      view = {b: false};
      result = qx.bom.Template.toHtml(template, view);
      expected = "";
      
      this.assertEquals(expected, result);
    },


    testObject : function() {
      var template = "{{#o}}{{b}}{{a}}{{/o}}";
      var view = {o: {a: 1, b: 2}};
      var result = qx.bom.Template.toHtml(template, view);
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
      var result = qx.bom.Template.toHtml(template, view);
      var expected = "!yo!";
      
      this.assertEquals(expected, result);
    },


    testInvertedSelection : function() {
      var template = "{{^a}}yo{{/a}}";
      var view = {a: []};
      var result = qx.bom.Template.toHtml(template, view);
      var expected = "yo";

      this.assertEquals(expected, result);
    },


    testEscaping : function() {
      var template = "{{a}}";
      var view = {a: "<a>"};
      var result = qx.bom.Template.toHtml(template, view);
      var expected = "&lt;a&gt;";

      this.assertEquals(expected, result);

      var template = "{{{a}}}";
      var view = {a: "<a>"};
      var result = qx.bom.Template.toHtml(template, view);
      var expected = "<a>";

      this.assertEquals(expected, result);
    }
  }
});
