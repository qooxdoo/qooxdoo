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

qx.Class.define("qx.test.ui.embed.HtmlArea",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function()
    {
      var demoContent = 'vanillebaer';
      this.__htmlArea = new qx.ui.embed.HtmlArea(demoContent, null, "blank.html");
      this.__htmlArea.set( { width: 600, height: 400 } );
    },


    tearDown : function() {
      this.__htmlArea.dispose();
    },


    testStartup : function()
    {
      this.getRoot().add(this.__htmlArea);

      this.__htmlArea.addListener("ready", function(e) {
        this.resume(function()
        {
          this.getRoot().remove(this.__htmlArea);
          this.assertTrue(true);
        }, this);
      }, this);

      this.wait(5000);
    },


    testSettingValueBeforeRendered : function()
    {
      this.__htmlArea.setValue("schokobaer");
      this.assertEquals("schokobaer", this.__htmlArea.getValue(), "Setting the value before the htmlarea was rendered failed!");

      this.__htmlArea.setValue("karamelbaer");
      this.assertEquals("karamelbaer", this.__htmlArea.getValue(), "Setting the value before the htmlarea was rendered failed!");
    }
  }
});