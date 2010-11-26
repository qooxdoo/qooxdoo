/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.dom.Node",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    setUp : function()
    {
      var blockNodeList = [ "body", "h1", "h2", "h3", "h4", "h5", "div", "blockquote",
                            "hr", "form", "textarea", "fieldset", "iframe",
                            "ul", "ol", "li", "dl", "dt", "dd", "p", "quote",
                            "pre", "table", "thead", "tbody", "tfoot", "tr",
                            "td", "th", "iframe", "address" ];

      var inlineNodeList = [ "a", "span", "abbr", "acronym", "dfn", "object", "param",
                             "em", "strong", "code", "b", "i", "tt", "samp",
                             "kbd", "var", "big", "small", "br", "bdo", "cite",
                             "del", "ins", "q", "sub", "sup", "img", "map" ];

      this.__blockNodes = [];

      var blockElement;
      for (var i=0, j=blockNodeList.length; i<j; i++)
      {
        blockElement = document.createElement(blockNodeList[i]);
        document.body.appendChild(blockElement);
        this.__blockNodes.push(blockElement);
      }

      this.__inlineNodes = [];

      var inlineElement;
      for (var i=0, j=inlineNodeList.length; i<j; i++)
      {
        inlineElement = document.createElement(inlineNodeList[i]);
        document.body.appendChild(inlineElement);
        this.__inlineNodes.push(inlineElement);
      }
    },


    tearDown : function()
    {
      for (var i=0, j=this.__blockNodes.length; i<j; i++) {
        document.body.removeChild(this.__blockNodes[i]);
      }
      this.__blockNodes = null;

      for (var i=0, j=this.__inlineNodes.length; i<j; i++) {
        document.body.removeChild(this.__inlineNodes[i]);
      }
      this.__inlineNodes = null;
    },


    testBlockNodes : function()
    {
      var blockNode;
      for (var i=0, j=this.__blockNodes.length; i<j; i++)
      {
        this.info("Testing node " + qx.dom.Node.getName(this.__blockNodes[i]));
        this.assertTrue(qx.dom.Node.isBlockNode(this.__blockNodes[i]));
      }
    },


    testInlineNodes : function()
    {
      var inlineNode;
      for (var i=0, j=this.__inlineNodes.length; i<j; i++)
      {
        this.info("Testing node " + qx.dom.Node.getName(this.__inlineNodes[i]));
        this.assertFalse(qx.dom.Node.isBlockNode(this.__inlineNodes[i]));
      }
    }
  }
});