/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * mw (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.RadioItems",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testTwiceClickForm : function() {
      var item = new qx.ui.form.RadioButton();
      this.__testTwiceClick(item);
      item.destroy();
    },


    testTwiceClickMenu : function() {
      var item = new qx.ui.menu.RadioButton();
      this.__testTwiceClick(item);
      item.destroy();
    },


    testTwiceClickToolbar : function() {
      var item = new qx.ui.toolbar.RadioButton();
      this.__testTwiceClick(item);
      item.destroy();
    },


    __testTwiceClick : function(widget) {
      this.assertFalse(widget.getValue());
      // execute the widget
      widget.execute();
      this.assertTrue(widget.getValue(), "1");

      // execute again to see that it is still selected
      widget.execute();
      this.assertTrue(widget.getValue(), "2");
    },




    testTwiceClickEmptySelectionForm : function() {
      var item = new qx.ui.form.RadioButton();
      this.__testTwiceClickEmptySelection(item);
      item.destroy();
    },


    testTwiceClickEmptySelectionMenu : function() {
      var item = new qx.ui.menu.RadioButton();
      this.__testTwiceClickEmptySelection(item);
      item.destroy();
    },


    testTwiceClickEmptySelectionToolbar : function() {
      var item = new qx.ui.toolbar.RadioButton();
      this.__testTwiceClickEmptySelection(item);
      item.destroy();
    },


    __testTwiceClickEmptySelection : function(widget) {
      var grp = new qx.ui.form.RadioGroup();
      grp.setAllowEmptySelection(true);
      widget.setGroup(grp);

      this.assertFalse(widget.getValue());
      // execute the widget
      widget.execute();
      this.assertTrue(widget.getValue(), "1");

      // execute again to see that it is still selected
      widget.execute();
      this.assertFalse(widget.getValue(), "2");

      grp.dispose();
    }
  }
});
