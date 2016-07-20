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
qx.Class.define("qx.test.ui.dialog.Confirm", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    _dialog: null,
    _yesNoCancelDialog: null,
    _objForContext: null,

    _autoInitContext: null,
    _mustSetContext: null,
    _settedContext: null,

    setUp: function() {
      this.base(arguments);

      this._objForContext = new qx.ui.basic.Label("SimpleLabel");

      this._dialog = new qx.ui.dialog.Confirm();

      this._yesNoCancelDialog = new qx.ui.dialog.Confirm("QxTitle", "QxMessage", ["yes", "no", "cancel"]);

      this._autoInitContext = new qx.ui.dialog.Confirm("QxTitle", "QxMessage", [
        {
          button: "ok",
          callback: function() {
            // empty
          }
        }
      ]);

      this._settedContext = new qx.ui.dialog.Confirm("QxTitle", "QxMessage", [
        {
          button: "no",
          label: "YayButton",
          callback: function() {
            this.setValue("ChangedLabel");
          },
          context: this._objForContext
        }
      ]);

      this._settedContext.setAutoDispose(false);

      this._mustSetContext = new qx.ui.dialog.Confirm("QxTitle", "QxMessage", [
        {
          button: "yes",
          callback: function() {
            this.setValue("ChangedLabel");
          }
        }
      ]);

      this._mustSetContext.setAutoDispose(false);
    },

    tearDown : function() {
      this.base(arguments);
      this._disposeObjects(
        "_objForContext", "_dialog", "_yesNoCancelDialog", "_autoInitContext",
        "_settedContext", "_mustSetContext"
      );
    },

    testEmptyConstructor: function() {
      var c = this._dialog;

      this.assertEquals("", c.getCaption());
      this.assertEquals("", c.getMessage());

      // Test default ok and cancel
      this.assertEquals("ok", c.getChildControl("ok").getUserData("id"));
      this.assertEquals("cancel", c.getChildControl("cancel").getUserData("id"));
    },

    testSimpleConstruction: function() {
      var c = this._yesNoCancelDialog;

      this.assertEquals("QxTitle", c.getCaption());
      this.assertEquals("QxMessage", c.getMessage());

      // Test default ok and cancel
      this.assertEquals("yes", c.getChildControl("yes").getUserData("id"));
      this.assertEquals("no", c.getChildControl("no").getUserData("id"));
      this.assertEquals("cancel", c.getChildControl("cancel").getUserData("id"));
    },

    testComplexConstruction: function() {
      var someLabel = new qx.ui.basic.Label("InitialText");

      var initContext = this._autoInitContext;
      var settedContext = this._settedContext;
      var mustSetContext = this._mustSetContext;

      var ofSettedButton = settedContext.getChildControl("no");
      var ofMustSetButton = mustSetContext.getChildControl("yes");

      // Test init context
      this.assertEquals(initContext, initContext.getContext());

      // Test Setted context
      this.assertEquals("YayButton", ofSettedButton.getLabel());
      ofSettedButton.execute();
      this.assertEquals("ChangedLabel", this._objForContext.getValue());

      // Test setting global context
      mustSetContext.setContext(someLabel);
      ofMustSetButton.execute();
      this.assertEquals("ChangedLabel", someLabel.getValue());
    }
  }
});
