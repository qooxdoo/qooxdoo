/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.form.Form",
{
  extend : qx.test.ui.LayoutTestCase,
  include : qx.dev.unit.MMock,

  members :
  {

    __testRequired: function(widget) {
      // check if the interface is implemented
      this.assert(qx.Class.hasInterface(widget.constructor, qx.ui.form.IForm), "Interface not implemented.");
      // test for the default (false)
      this.assertFalse(widget.getRequired(), "Default required state is wrong.");

      // check for the event
      var self = this;
      widget.setRequired(false);
      this.assertEventFired(widget, "changeRequired", function () {
        widget.setRequired(true);
      }, function(e) {
        self.assertTrue(e.getData(), "Wrong data in the event!");
        self.assertFalse(e.getOldData(), "Wrong old data in the event!");
      }, "Change event not fired!");

      // check if the state is set
      this.assertTrue(widget.getRequired(), "Setting of the required flag did not work.");

      widget.dispose();
    },

    __testValid: function(widget, where) {
      // check if the interface is implemented
      this.assert(qx.Class.hasInterface(widget.constructor, qx.ui.form.IForm), "Interface not implemented.");

      this.getRoot().add(widget);

      // test for the default (true)
      this.assertTrue(widget.getValid(), "Default valid state is wrong.");
      this.assertFalse(!!widget.hasState("invalid"), "Should not have the invalid state.");

      widget.setValid(false);

      // check if the state is set
      this.assertFalse(widget.getValid(), "Setting of the valid flag did not work.");
      this.assertTrue(widget.hasState("invalid"), "Should have the invalid state.");

      // check for the event
      var self = this;
      this.assertEventFired(widget, "changeValid", function () {
        widget.setValid(true);
      }, function(e) {
        self.assertTrue(e.getData(), "Wrong data in the event.");
        self.assertFalse(e.getOldData(), "Wrong old data in the event.");
      }, "Change event not fired!");

      // check for the event
      this.assertEventFired(widget, "changeInvalidMessage", function () {
        widget.setInvalidMessage("affe");
      }, function(e) {
        self.assertEquals("affe", e.getData(), "Wrong data in the event.");
        self.assertEquals("", e.getOldData(), "Wrong old data in the event.");
      }, "Change event not fired!");

      // set the widget to invalid
      widget.setValid(false);

      if (where !== "dont") {
        // needs to be tests async because of a strange behavior in opera 9
        var self = this;
        window.setTimeout(function() {
          self.resume(function() {
            this.__testInvalidBorder(widget);

            widget.destroy();
          }, self);
        }, 100);
        this.wait();
      }

      widget.destroy();
    },

    __testInvalidBorder: function(widget) {
      this.flush();

      // check for the invalid decorator
      this.assertNotEquals(-1, widget.getDecorator().indexOf("invalid"), "Decorator not set!");

      // check the focus
      widget.focus();
      this.flush();
      this.assertNotEquals(-1, widget.getDecorator().indexOf("invalid"), "Decorator not set!");
    },

    testRequiredSpinner: function() {
      this.__testRequired(new qx.ui.form.Spinner());
    },

    testValidSpinner: function() {
     this.__testValid(new qx.ui.form.Spinner());
    },

    testRequiredSlider: function() {
      this.__testRequired(new qx.ui.form.Slider());
    },

    testValidSlider: function() {
     this.__testValid(new qx.ui.form.Slider());
    },

    testRequiredTextField: function() {
      this.__testRequired(new qx.ui.form.TextField());
    },

    testValidTextField: function() {
     this.__testValid(new qx.ui.form.TextField());
    },

    testRequiredTextArea: function() {
      this.__testRequired(new qx.ui.form.TextArea());
    },

    testValidTextArea: function() {
     this.__testValid(new qx.ui.form.TextArea());
    },

    testRequiredPasswordField: function() {
      this.__testRequired(new qx.ui.form.PasswordField());
    },

    testValidPasswordField: function() {
     this.__testValid(new qx.ui.form.PasswordField());
    },

    testRequiredComboBox: function() {
      this.__testRequired(new qx.ui.form.ComboBox());
    },

    testValidComboBox: function() {
     this.__testValid(new qx.ui.form.ComboBox());
    },

    testRequiredSelectBox: function() {
      this.__testRequired(new qx.ui.form.SelectBox());
    },

    testValidSelectBox: function() {
      this.__testValid(new qx.ui.form.SelectBox());
    },

    testRequiredCheckBox: function() {
      this.__testRequired(new qx.ui.form.CheckBox());
    },

    testValidCheckBox: function() {
     this.__testValid(new qx.ui.form.CheckBox(), "dont");
    },

    testValidRadioButton: function() {
     this.__testValid(new qx.ui.form.RadioButton(), "dont");
    },

    testRequiredRadioButton: function() {
      this.__testRequired(new qx.ui.form.RadioButton());
    },

    testValidGroupBox: function() {
     this.__testValid(new qx.ui.groupbox.GroupBox(), "dont");
    },

    testRequiredGroupBox: function() {
      this.__testRequired(new qx.ui.groupbox.GroupBox());
    },

    testValidRadioGroupBox: function() {
     this.__testValid(new qx.ui.groupbox.RadioGroupBox(), "dont");
    },

    testRequiredRadioGroupBox: function() {
      this.__testRequired(new qx.ui.groupbox.RadioGroupBox());
    },

    testValidCheckGroupBox: function() {
     this.__testValid(new qx.ui.groupbox.CheckGroupBox(), "dont");
    },

    testRequiredCheckGroupBox: function() {
      this.__testRequired(new qx.ui.groupbox.CheckGroupBox());
    },

    testValidList: function() {
     this.__testValid(new qx.ui.form.List());
    },

    testRequiredList: function() {
      this.__testRequired(new qx.ui.form.List());
    },

    testValidTree: function() {
     this.__testValid(new qx.ui.tree.Tree());
    },

    testRequiredTree: function() {
      this.__testRequired(new qx.ui.tree.Tree());
    },

    testRequiredDateField: function() {
      this.__testRequired(new qx.ui.form.DateField());
    },

    testValidDateField: function() {
     this.__testValid(new qx.ui.form.DateField());
    },

    testRequiredDateChooser: function() {
      this.__testRequired(new qx.ui.form.DateField());
    },

    testValidDateChooser: function() {
     this.__testValid(new qx.ui.form.DateField());
    },

    testValidRadioGroup : function() {
      var group = new qx.ui.form.RadioGroup();
      var rb = new qx.ui.form.RadioButton();
      group.add(rb);

      // check if the interface is implemented
      this.assert(qx.Class.hasInterface(group.constructor, qx.ui.form.IForm), "Interface not implemented.");

      // test for the default (true)
      this.assertTrue(group.getValid(), "Default valid state is wrong.");

      group.setValid(false);

      // check if the state is set
      this.assertFalse(group.getValid(), "Setting of the valid flag did not work.");

      // check for the event
      var self = this;
      this.assertEventFired(group, "changeValid", function () {
        group.setValid(true);
      }, function(e) {
        self.assertTrue(e.getData(), "Wrong data in the event.");
        self.assertFalse(e.getOldData(), "Wrong old data in the event.");
      }, "Change event not fired!");

      // check for the event
      this.assertEventFired(group, "changeInvalidMessage", function () {
        group.setInvalidMessage("affe");
      }, function(e) {
        self.assertEquals("affe", e.getData(), "Wrong data in the event.");
        self.assertEquals("", e.getOldData(), "Wrong old data in the event.");
      }, "Change event not fired!");

      // set the widget to invalid
      group.setValid(false);

      // check if the child is invalid
      this.assertFalse(rb.getValid(), "Child is valid!");
      // check the invalid message of the child
      this.assertEquals("affe", rb.getInvalidMessage(), "Invalid messages not set on child.");

      group.dispose();
      rb.destroy();
    },

    testRequiredRadioGroup : function() {
      this.__testRequired(new qx.ui.form.RadioGroup());
    },

    testRequiredRadioButtonGroup: function() {
      this.__testRequired(new qx.ui.form.RadioButtonGroup());
    },

    testValidRadioButtonGroup: function() {
      var cont = new qx.ui.form.RadioButtonGroup();
      var rb = new qx.ui.form.RadioButton();
      cont.add(rb);

      // check if the interface is implemented
      this.assert(qx.Class.hasInterface(cont.constructor, qx.ui.form.IForm), "Interface not implemented.");

      // test for the default (true)
      this.assertTrue(cont.getValid(), "Default valid state is wrong.");

      cont.setValid(false);

      // check if the state is set
      this.assertFalse(cont.getValid(), "Setting of the valid flag did not work.");

      // check for the event
      var self = this;
      this.assertEventFired(cont, "changeValid", function () {
        cont.setValid(true);
      }, function(e) {
        self.assertTrue(e.getData(), "Wrong data in the event.");
        self.assertFalse(e.getOldData(), "Wrong old data in the event.");
      }, "Change event not fired!");

      // check for the event
      this.assertEventFired(cont, "changeInvalidMessage", function () {
        cont.setInvalidMessage("affe");
      }, function(e) {
        self.assertEquals("affe", e.getData(), "Wrong data in the event.");
        self.assertEquals("", e.getOldData(), "Wrong old data in the event.");
      }, "Change event not fired!");

      // set the widget to invalid
      cont.setValid(false);

      // check if the child is invalid
      this.assertFalse(rb.getValid(), "Child is valid!");
      // check the invalid message of the child
      this.assertEquals("affe", rb.getInvalidMessage(), "Invalid messages not set on child.");

      cont.dispose();
      rb.destroy();
    },


    testRedefineItem : function() {
      var form = new qx.ui.form.Form();
      var resetter = form._resetter;
      resetter.redefineItem = this.spy(resetter.redefineItem);

      var item = new qx.ui.form.TextField();
      form.add(item, "xyz");
      form.redefineResetterItem(item);

      this.assertCalledOnce(resetter.redefineItem);

      item.dispose();
      form.dispose();
    }

  }
});
