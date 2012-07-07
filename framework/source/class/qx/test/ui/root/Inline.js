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
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.ui.root.Inline",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      this.__inlineIsleElement = qx.dom.Element.create("div");
      var inlineStyle = "position:absolute;top:50px;left:50px;width:200px;height:200px";
      qx.bom.element.Style.setCss(this.__inlineIsleElement, inlineStyle);

      qx.dom.Element.insertBegin(this.__inlineIsleElement, document.body);
    },


    tearDown : function() {
      qx.dom.Element.remove(this.__inlineIsleElement);
    },


    testAppearEvent : function()
    {
      var inlineRoot = new qx.ui.root.Inline(this.__inlineIsleElement);
      inlineRoot.addListener("appear", function(e)
      {
        this.resume(function() {
          this.assertTrue(qx.dom.Element.isInDom(inlineRoot.getContainerElement().getDomElement()));
        }, this);
      }, this);

      this.wait();
    }
  }
});