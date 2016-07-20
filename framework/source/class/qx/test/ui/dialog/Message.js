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

      this.assertInstance(d.getChildControl("atom"), qx.ui.basic.Atom);
      this.assertInstance(d.getChildControl("buttons-bar"), qx.ui.container.Composite);
      this.assertInstance(d.getChildControl("ok"), qx.ui.form.Button);
    },

    testEmptyConstructor: function() {
      // Test empty constructor
      var d = this._dialog;

      this.assertEquals("Message", d.getCaption());
      this.assertEquals("", d.getMessage());

      // Test setter
      d.setCaption("QxDialog");
      d.setMessage("QxMessage");

      this.assertEquals("QxDialog", d.getCaption());
      this.assertEquals("QxMessage", d.getMessage());
    },

    testContructorWithParameters: function() {
      // Test contructor arguments
      var dd = this._cDialog;

      this.assertEquals("QxTitle", dd.getCaption());
      this.assertEquals("QxMessage", dd.getMessage());
    }
  }
});
