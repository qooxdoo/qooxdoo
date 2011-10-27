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
qx.Class.define("qx.test.ui.form.NumberFormat",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __test: function(widget) {
      // check if the interface is implemented
      this.assertTrue(qx.Class.hasInterface(widget.constructor, qx.ui.form.INumberForm), "Interface not implemented");

      // check for the init value
      this.assertEquals(0, widget.getValue(), "Wrong init value set.");

      // just check if the method is available
      widget.resetValue();

      // check the getter and setter
      widget.setValue(10);
      this.assertEquals(10, widget.getValue(), "Set or get does not work.");

      var self = this;
      this.assertEventFired(widget, "changeValue", function() {
        widget.setValue(11);
      }, function(e) {
        self.assertEquals(11, e.getData(), "Not the right number in the event.");
        self.assertEquals(10, e.getOldData(), "Wrong old data in the event.");
      }, "Event is wrong!");

      // test for null values
      widget.setValue(null);

      // get rid of the widget
      widget.destroy();
    },

    testSpinner: function() {
     this.__test(new qx.ui.form.Spinner());
    },

    testSlider: function() {
     this.__test(new qx.ui.form.Slider());
    }

  }
});