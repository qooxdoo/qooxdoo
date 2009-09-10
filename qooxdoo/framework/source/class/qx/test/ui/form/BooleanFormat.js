/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.form.BooleanFormat",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __test: function(widget, initValue) {
      // check if the interface is implemented
      this.assertTrue(qx.Class.hasInterface(widget.constructor, qx.ui.form.IBooleanForm), "Interface is not implemented.");

      // check for the init value
      this.assertEquals(initValue, widget.getValue(), "Wrong init value set.");

      // just check if the method is available
      widget.resetValue();

      // check the getter and setter
      widget.setValue(true);
      this.assertEquals(true, widget.getValue(), "Set or get does not work.");

      var self = this;
      this.assertEventFired(widget, "changeValue", function() {
        widget.setValue(false);
      }, function(e) {
        self.assertEquals(false, e.getData(), "Not the right data in the event.");
        self.assertEquals(true, e.getOldData(), "Wrong old data in the event.");
      }, "Event is wrong!");

      // test for null values
      widget.setValue(null);

      widget.destroy();
    },

    testCheckBox: function() {
     this.__test(new qx.ui.form.CheckBox(), false);
    },

    testToggleButton: function() {
     this.__test(new qx.ui.form.ToggleButton(), false);
    },

    testMenuCheckBox: function() {
     this.__test(new qx.ui.menu.CheckBox(), false);
    },

    testRadioButton: function() {
      this.__test(new qx.ui.form.RadioButton(), false);
    },

    testMenuRadioButton: function() {
      this.__test(new qx.ui.menu.RadioButton(), false);
    },

    testRadioGroupBox: function() {
      this.__test(new qx.ui.groupbox.RadioGroupBox(), true);
    },

    testCheckGroupBox: function() {
      this.__test(new qx.ui.groupbox.CheckGroupBox(), true);
    }

  }
});