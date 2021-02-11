/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2018 The Qooxdoo Project

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */
qx.Class.define("qx.test.ui.groupbox.CheckGroupBox",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    _checkGroupBox : null,
    _label : null,

    setUp : function()
    {
      this.base(arguments);

      var groupBox = this._checkGroupBox = new qx.ui.groupbox.CheckGroupBox;
      this.getRoot().add(groupBox);
      groupBox.setLayout(new qx.ui.layout.HBox);
      this._label = new qx.ui.basic.Label;
      groupBox.add(this._label);

      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);
      this._disposeObjects("_checkGroupBox");
    },

    /**
     * Tests whether 'enabled' is in consistent state for both groupbox content widgets
     * and groupbox parent, i.e. after groupbox legend is unchecked and then checked
     * again, disabling groupbox parent must disable groupbox content widgets (see [1]).
     * 1. https://github.com/qooxdoo/qooxdoo/issues/9350
     */
    testEnabledConsistencyBetweenContentAndParent : function()
    {
      this.assertTrue(this._checkGroupBox.isEnabled());
      this.assertTrue(this._label.isEnabled());

      // Uncheck/check legend
      this._checkGroupBox.setValue(false);
      this.assertFalse(this._label.isEnabled());
      this._checkGroupBox.setValue(true);
      this.assertTrue(this._label.isEnabled());

      // Disable parent, content label must switch to disabled
      this._checkGroupBox.getLayoutParent().setEnabled(false);
      this.assertFalse(this._checkGroupBox.isEnabled());
      this.assertFalse(this._label.isEnabled());

      // Enable parent, content label must switch to enabled
      this._checkGroupBox.getLayoutParent().setEnabled(true);
      this.assertTrue(this._checkGroupBox.isEnabled());
      this.assertTrue(this._label.isEnabled());
    }
  }
});
