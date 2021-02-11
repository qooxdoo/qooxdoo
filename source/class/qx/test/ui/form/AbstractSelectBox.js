/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */
qx.Class.define("qx.test.ui.form.AbstractSelectBox",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function()
    {
      this.__selectBox = new qx.ui.form.SelectBox;
      this.getRoot().add(this.__selectBox);

      this.__comboBox = new qx.ui.form.ComboBox;
      this.getRoot().add(this.__comboBox);

      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);

      this.__selectBox.dispose();
      this.__selectBox = null;

      this.__comboBox.dispose();
      this.__comboBox = null;
    },

    testStatePopupOpen : function()
    {
      this.__selectBox.open();
      this.flush();
      this.assertTrue(this.__selectBox.hasState("popupOpen"));

      this.__selectBox.close();
      this.flush();
      this.assertFalse(this.__selectBox.hasState("popupOpen"));

      this.__comboBox.open();
      this.flush();
      this.assertTrue(this.__comboBox.hasState("popupOpen"));

      this.__comboBox.close();
      this.flush();
      this.assertFalse(this.__comboBox.hasState("popupOpen"));
    }
  }
});