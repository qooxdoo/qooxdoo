/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.form.ModelProperty",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __test : function(widget)
    {
      // check for the interface
      this.assertTrue(qx.Class.hasInterface(widget.constructor, qx.ui.form.IModel), "Interface not implemented");

      // test the init value (null)
      this.assertNull(widget.getModel());

      // set a string
      widget.setModel("affe");
      this.assertEquals("affe", widget.getModel());

      // set a number (check that no check is implemented)
      widget.setModel(123);
      this.assertEquals(123, widget.getModel());

      // test the reset
      widget.resetModel();
      this.assertNull(widget.getModel());

      // check the event
      var self = this;
      this.assertEventFired(widget, "changeModel", function() {
        widget.setModel(true);
      }, function(e) {
        self.assertEquals(true, e.getData());
        self.assertEquals(null, e.getOldData());
      }, "Event is wrong!");

      // check the event again with data in the event
      var self = this;
      this.assertEventFired(widget, "changeModel", function() {
        widget.setModel("abc");
      }, function(e) {
        self.assertEquals("abc", e.getData());
        self.assertEquals(true, e.getOldData());
      }, "Event is wrong!");

      widget.dispose();
    },


    testListItem : function()
    {
      this.__test(new qx.ui.form.ListItem());
    },

    testRadioButton : function()
    {
      this.__test(new qx.ui.form.RadioButton());
    },

    testRadioGroupBox : function()
    {
      this.__test(new qx.ui.groupbox.RadioGroupBox());
    },

    testCheckBox : function()
    {
      this.__test(new qx.ui.form.CheckBox());
    },

    testCheckGroupBox : function()
    {
      this.__test(new qx.ui.groupbox.CheckGroupBox());
    },

    testTreeFolder : function()
    {
      this.__test(new qx.ui.tree.TreeFolder());
    },

    testTreeFile : function()
    {
      this.__test(new qx.ui.tree.TreeFile());
    }
  }
});
