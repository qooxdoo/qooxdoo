/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Yeshua Rodas, http://yybalam.net

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yeshua Rodas (yybalam)

************************************************************************ */
qx.Class.define("qx.test.ui.dialog.Message", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    _dialog: null,
    _cDialog: null,

    setUp: function() {
      this.base(arguments);
      this._dialog = new qx.ui.dialog.Message();
      this._cDialog = new qx.ui.dialog.Message("QxTitle", "QxMessage");
    },

    tearDown : function() {
      this.base(arguments);
      this._disposeObjects("_dialog", "_cDialog");
    },

    testFactoryMethods: function() {
      var d = this._dialog;

      this.assertInstance(d._getAtom(), qx.ui.basic.Atom);
      this.assertInstance(d._getButtonsBar(), qx.ui.container.Composite);
      this.assertInstance(d._getButtonsBar().getChildren()[0], qx.ui.form.Button);
    },

    testInitialState: function() {
      // Test empty constructor
      var d = this._dialog;

      this.assertEquals("Message", d.getTitle());
      this.assertEquals("", d.getMessage());

      // Test setter
      d.setTitle("QxDialog");
      d.setMessage("QxMessage");

      var expexted = "<b>QxDialog</b><br/>QxMessage";
      this.assertEquals(expexted, d._getAtom().getLabel());

      // Test contructor arguments
      var dd = this._cDialog;

      this.assertEquals("QxTitle", dd.getTitle());
      this.assertEquals("QxMessage", dd.getMessage());
    }
  }
});
