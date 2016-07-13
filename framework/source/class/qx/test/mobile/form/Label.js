/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

qx.Class.define("qx.test.mobile.form.Label",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testLabelForTarget : function()
    {
      var label = new qx.ui.mobile.form.Label("foo-label");
      var target = new qx.ui.mobile.form.TextField("foo");
      label.setLabelFor(target.getId());

      var foundValue = label.getContentElement().getAttribute("for");

      this.assertEquals(target.getId(),foundValue,"'For' attribute has an unexpected value.");

      label.destroy();
      target.destroy();
    },


    testDisableTarget : function()
    {
      var label = new qx.ui.mobile.form.Label("foo-label");
      var target = new qx.ui.mobile.form.TextField("foo");

      target.setEnabled(false);

      label.setLabelFor(target.getId());

      // check if state is considered before label.for is set.
      this.assertFalse(label.isEnabled());

      target.setEnabled(true);

      this.assertTrue(label.isEnabled());

      target.setEnabled(false);

      this.assertFalse(label.isEnabled());

      label.destroy();
      target.destroy();
    }
  }

});
