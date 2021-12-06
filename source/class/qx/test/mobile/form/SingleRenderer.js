/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.test.mobile.form.SingleRenderer",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    __form : null,
    __b : null,
    __t : null,
    __s : null,


    setUp : function() {
      this.base(arguments);
      this.__form = new qx.ui.mobile.form.Form();
      this.__b = new qx.ui.mobile.form.Button("a");
      this.__form.addButton(this.__b);
      this.__t = new qx.ui.mobile.form.TextField("test");
      this.__form.add(this.__t, "label");

      var dd = new qx.data.Array(["1"]);
      this.__s = new qx.ui.mobile.form.SelectBox();
      this.__s.setModel(dd);
      this.__form.add(this.__s, "select");

      this.__renderer = new qx.ui.mobile.form.renderer.Single(this.__form);
      this.getRoot().add(this.__renderer);
    },


    tearDown : function() {
      this.__b.dispose();
      this.__t.dispose();
      this.__s.dispose();
      this.__form.dispose();
      this.__renderer.dispose();
      this.base(arguments);
    },


    testShowHideRow : function() {
      this.__renderer.hideItem(this.__b);
      var isHidden = this.__b.getLayoutParent().hasCssClass("exclude");
      this.assertTrue(isHidden,"Buttons parent is expected to contain 'exclude' class");

      this.__renderer.showItem(this.__b);
      isHidden = this.__b.getLayoutParent().hasCssClass("exclude");
      this.assertFalse(isHidden,"Button parent is expected to not contain 'exclude' class anymore");
    },


    testItemRow : function() {
      this.assertNotNull(this.__renderer._getChildren()[0]);
      this.assertTrue(2=== this.__renderer._getChildren()[1]._getChildren().length); // we have a label and a form element in the row
    },


    testButtonRow : function() {
      this.assertNotNull(this.__renderer._getChildren()[5]);
      var buttonRowLength = this.__renderer._getChildren()[5]._getChildren().length;
      this.assertTrue(1 === buttonRowLength); // we have only the button in the row
    },


    testTwoLinesRow : function() {
      this.assertNotNull(this.__renderer._getChildren()[3]);
      var rowLength = this.__renderer._getChildren()[3]._getChildren().length;
      this.assertTrue(2 === rowLength);
    }
  }
});
