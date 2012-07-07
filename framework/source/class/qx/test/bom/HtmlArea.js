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
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.bom.HtmlArea",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      this.__htmlAreaContainer = qx.dom.Element.create("div");
      qx.bom.element.Style.setStyles(this.__htmlAreaContainer, { width: "840px",
                                                                 height: "350px",
                                                                 border: "1px solid #AAA",
                                                                 borderTop: "0px",
                                                                 backgroundColor: "white" });
      var demoContent = 'vanillebaer';
      this.__htmlArea = new qx.bom.htmlarea.HtmlArea(this.__htmlAreaContainer, demoContent, null, "blank.html");
    },


    tearDown : function() {
      this.__htmlArea.dispose();
    },


    testStartup : function()
    {
      qx.dom.Element.insertEnd(this.__htmlAreaContainer, document.body);

      this.__htmlArea.addListener("ready", function(e) {
        this.resume(function()
        {
          qx.dom.Element.remove(this.__htmlAreaContainer);
          this.assertTrue(true);
        }, this);
      }, this);

      this.wait(5000);
    },


    testSettingValueBeforeRendered : function()
    {
      this.__htmlArea.setValue("alterkeks");
      this.assertEquals("alterkeks", this.__htmlArea.getValue(), "Setting the value before the htmlarea was rendered failed!");

      qx.dom.Element.remove(this.__htmlAreaContainer);
    }
  }
});