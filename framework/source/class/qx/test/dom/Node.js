/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.dom.Node",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    setUp : function() {},


    tearDown : function() {},


    testBlockNodes : function()
    {
      var blockNodeList = [ "body", "h1", "h2", "h3", "h4", "h5", "div", "blockquote",
                            "hr", "form", "textarea", "fieldset", "iframe",
                            "ul", "ol", "li", "dl", "dt", "dd", "p", "quote",
                            "pre", "table", "thead", "tbody", "tfoot", "tr",
                            "td", "th", "iframe", "address" ];

      var blockElement;
      var blockElements = [];
      for (var i=0, j=blockNodeList.length; i<j; i++)
      {
        blockElement = document.createElement(blockNodeList[i]);
        document.body.appendChild(blockElement);

        blockElements.push(blockElement);

        this.info("Testing node " + qx.dom.Node.getName(blockElement));
        this.assertTrue(qx.dom.Node.isBlockNode(blockElement));
      }

      for (var i=0, j=blockElements.length; i<j; i++) {
        document.body.removeChild(blockElements[i]);
      }
    },


    testInlineNodes : function()
    {
      var inlineNodeList = [ "a", "span", "abbr", "acronym", "dfn", "object", "param",
                             "em", "strong", "code", "b", "i", "tt", "samp",
                             "kbd", "var", "big", "small", "br", "bdo", "cite",
                             "del", "ins", "q", "sub", "sup", "img", "map" ];

      var inlineElement;
      var inlineElements = [];
      for (var i=0, j=inlineNodeList.length; i<j; i++)
      {
        inlineElement = document.createElement(inlineNodeList[i]);
        document.body.appendChild(inlineElement);

        inlineElements.push(inlineElement);

        this.info("Testing node " + qx.dom.Node.getName(inlineElement));
        this.assertFalse(qx.dom.Node.isBlockNode(inlineElement));
      }

      for (var i=0, j=inlineElements.length; i<j; i++) {
        document.body.removeChild(inlineElements[i]);
      }
    },


    testTextNodes : function()
    {
      var blockElement = document.createElement("div");
      var blockElementText = document.createTextNode("schokobaer");
      blockElement.appendChild(blockElementText);

      var innerElement = document.createElement("span");
      blockElement.appendChild(innerElement);

      var innerTextNode = document.createTextNode("vanillebaer");
      innerElement.appendChild(innerTextNode);

      document.body.appendChild(blockElement);

      var data = "<Root><foo></foo></Root>";
      var xml = qx.xml.Document.fromString(data);

      var cdataElement = xml.createCDATASection("karamelbaer");
      xml.getElementsByTagName("foo")[0].appendChild(cdataElement);

      this.assertEquals("vanillebaer", qx.dom.Node.getText(innerTextNode), "Failed to get the right value for one text node.");
      this.assertEquals("schokobaervanillebaer", qx.dom.Node.getText(blockElement), "Failed to get the right value for text of an element.");
      this.assertEquals("karamelbaer", qx.dom.Node.getText(xml.getElementsByTagName("foo")[0].firstChild), "Failed to get the text of a CData text node.");
    },


    testGetWindow : function()
    {
      var rendered = document.createElement("div");
      document.body.appendChild(rendered);
      var unrendered = document.createElement("div");
      var text = document.createTextNode("affe");

      this.assertEquals(window, qx.dom.Node.getWindow(rendered));
      this.assertEquals(window, qx.dom.Node.getWindow(unrendered));
      this.assertEquals(window, qx.dom.Node.getWindow(text));
    }
  }
});