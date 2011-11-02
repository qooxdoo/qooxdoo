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

qx.Class.define("qx.test.dom.Hierarchy",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    setUp : function()
    {
      this.__renderedElement = qx.bom.Element.create("div");
      document.body.appendChild(this.__renderedElement);

      this.__unRenderedElement = qx.bom.Element.create("div");
    },


    tearDown : function()
    {
      document.body.removeChild(this.__renderedElement);
      this.__renderedElement = null;

      this.__unRenderedElement = null;

      if (this.__iframe) {
        document.body.removeChild(this.__iframe);
        this.__iframe = null;
      }
    },


    testIsRendered : function()
    {
      this.assertTrue(qx.dom.Hierarchy.isRendered(this.__renderedElement));
      this.assertFalse(qx.dom.Hierarchy.isRendered(this.__unRenderedElement));
    },


    testIsRenderedIframe : function()
    {
      this.__iframe = qx.bom.Iframe.create();
      qx.bom.Iframe.setSource(this.__iframe, "http://qooxdoo.org");
      document.body.appendChild(this.__iframe);

      qx.event.Registration.addListener(this.__iframe, "load", function(e) {
        this.resume(function() {
          this.assertTrue(qx.dom.Hierarchy.isRendered(this.__iframe));
        }, this);
      }, this);

      this.wait(10000);
    }
  }
});