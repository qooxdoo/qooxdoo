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
qx.Class.define("qx.test.ui.form.StringFormat",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __test: function(widget) {
      // check if the interface is implemented
      this.assertTrue(qx.Class.hasInterface(widget.constructor, qx.ui.form.IStringForm), "Interface is not implemented.");

      // check for the init value
      this.assertNull(widget.getValue(), "Wrong init value set.");

      // just check if the method is available
      widget.resetValue();

      // check the getter and setter
      widget.setValue("affe");
      this.assertEquals("affe", widget.getValue(), "Set or get does not work.");

      var self = this;
      // event with value
      this.assertEventFired(widget, "changeValue", function() {
        widget.setValue("affen");
      }, function(e) {
        self.assertEquals("affen", e.getData(), "Not the right number in the event.");
        self.assertEquals("affe", e.getOldData(), "Wrong old data in the event.");
      }, "Event is wrong!");

      // event with null
      this.assertEventFired(widget, "changeValue", function() {
        widget.setValue(null);
      }, function(e) {
        self.assertEquals(null, e.getData(), "Not the right number in the event.");
        self.assertEquals("affen", e.getOldData(), "Wrong old data in the event.");
      }, "Event is wrong!");

      // get rid of the widget
      widget.destroy();
    },

    testTextField: function() {
     this.__test(new qx.ui.form.TextField());
    },

    testPasswordField: function() {
     this.__test(new qx.ui.form.PasswordField());
    },

    testTextArea: function() {
     this.__test(new qx.ui.form.TextArea());
    },

    testComboBox: function() {
     this.__test(new qx.ui.form.ComboBox());
    },

    testLabel: function() {
      this.__test(new qx.ui.basic.Label());
    }

  }
});