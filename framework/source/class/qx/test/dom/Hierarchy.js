/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.dom.Hierarchy",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    setUp : function()
    {
      this.__renderedElement = qx.dom.Element.create("div");
      document.body.appendChild(this.__renderedElement);

      this.__unRenderedElement = qx.dom.Element.create("div");

      this.__notDisplayedElement = qx.dom.Element.create("div");
      document.body.appendChild(this.__notDisplayedElement);
      qx.bom.element.Style.set(this.__notDisplayedElement, "display", "none");

      this.__childOfNotDisplayedElement = qx.dom.Element.create("div");
      this.__notDisplayedElement.appendChild(this.__childOfNotDisplayedElement);
    },


    tearDown : function()
    {
      if (this.__childElement) {
        this.__renderedElement.removeChild(this.__childElement);
        this.__childElement = null;
      }

      if (this.__siblingElement) {
        document.body.removeChild(this.__siblingElement);
        this.__siblingElement = null;
      }

      document.body.removeChild(this.__renderedElement);
      this.__renderedElement = null;

      this.__unRenderedElement = null;

      document.body.removeChild(this.__notDisplayedElement);
      this.__notDisplayedElement = null;

      if (this.__iframe) {
        document.body.removeChild(this.__iframe);
        this.__iframe = null;
      }
    },


    testIsRendered : function()
    {
      this.assertTrue(qx.dom.Hierarchy.isRendered(this.__renderedElement));
      this.assertFalse(qx.dom.Hierarchy.isRendered(this.__unRenderedElement));
      this.assertTrue(qx.dom.Hierarchy.isRendered(this.__notDisplayedElement));
      this.assertTrue(qx.dom.Hierarchy.isRendered(this.__childOfNotDisplayedElement));
    },


    testIsRenderedIframe : function()
    {
      this.__iframe = qx.bom.Iframe.create();
      var src = qx.util.ResourceManager.getInstance().toUri("qx/static/blank.html");
      src = qx.util.Uri.getAbsolute(src);
      qx.bom.Iframe.setSource(this.__iframe, src);
      document.body.appendChild(this.__iframe);

      qx.event.Registration.addListener(this.__iframe, "load", function(e) {
        this.resume(function() {
          this.assertTrue(qx.dom.Hierarchy.isRendered(this.__iframe));
        }, this);
      }, this);

      this.wait(10000);
    },


    testContains : function()
    {
      this.assertTrue(qx.dom.Hierarchy.contains(document.body, this.__renderedElement));

      this.__childElement = qx.dom.Element.create("div");
      this.__renderedElement.appendChild(this.__childElement);
      this.assertTrue(qx.dom.Hierarchy.contains(this.__renderedElement, this.__childElement));
      this.assertFalse(qx.dom.Hierarchy.contains(this.__childElement, this.__renderedElement));

      this.__siblingElement = qx.dom.Element.create("div");
      document.body.appendChild(this.__siblingElement);
      this.assertFalse(qx.dom.Hierarchy.contains(this.__renderedElement, this.__siblingElement));
    },


    testGetCommonParent : function()
    {
      this.__siblingElement = qx.dom.Element.create("div");
      document.body.appendChild(this.__siblingElement);

      this.assertEquals(document.body,
      qx.dom.Hierarchy.getCommonParent(this.__renderedElement, this.__siblingElement));

      this.__childElement = qx.dom.Element.create("div");
      this.__renderedElement.appendChild(this.__childElement);
      this.assertEquals(this.__renderedElement,
      qx.dom.Hierarchy.getCommonParent(this.__renderedElement, this.__childElement));
    }
  }
});
