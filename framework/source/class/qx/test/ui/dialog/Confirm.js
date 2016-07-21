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

      this._mustSetContext = new qx.ui.dialog.Confirm("QxTitle", "QxMessage", [
        {
          button: "yes",
          callback: function() {
            this.setValue("ChangedLabel");
          }
        }
      ]);
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

      this.assertEquals("", c.getTitle());
      this.assertEquals("", c.getMessage());
      this.assertEquals("icon/48/status/dialog-warning.png", c._getAtom().getIcon());

      // Test default ok and cancel
      var buttonsOnBar =  c._getButtonsBar().getChildren();
      this.assertEquals("ok", buttonsOnBar[0].getUserData("id"));
      this.assertEquals("cancel", buttonsOnBar[1].getUserData("id"));
    },

    testSimpleConstruction: function() {
      var c = this._yesNoCancelDialog;

      this.assertEquals("QxTitle", c.getTitle());
      this.assertEquals("QxMessage", c.getMessage());

      // Test default ok and cancel
      var buttonsOnBar =  c._getButtonsBar().getChildren();
      this.assertEquals("yes", buttonsOnBar[0].getUserData("id"));
      this.assertEquals("no", buttonsOnBar[1].getUserData("id"));
      this.assertEquals("cancel", buttonsOnBar[2].getUserData("id"));
    },

    testComplexConstruction: function() {
      var someLabel = new qx.ui.basic.Label("InitialText");

      var initContext = this._autoInitContext;
      var settedContext = this._settedContext;
      var mustSetContext = this._mustSetContext;

      // Hack close methods for do not dispose.
      settedContext.close = function(){};
      mustSetContext.close = function(){};

      var ofSettedButton = settedContext._getButtonsBar().getChildren()[0];
      var ofMustSetButton = mustSetContext._getButtonsBar().getChildren()[0];

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
