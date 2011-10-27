/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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


    setUp : function() {
      this.base(arguments);
      this.__form = new qx.ui.mobile.form.Form();
      this.__b = new qx.ui.mobile.form.Button("a");
      this.__form.addButton(this.__b);
      this.__t = new qx.ui.mobile.form.TextField("test");
      this.__form.add(this.__t, "label");
      this.__renderer = new qx.ui.mobile.form.renderer.Single(this.__form);
      this.getRoot().add(this.__renderer);
    },

    tearDown : function() {
      this.__b.dispose();
      this.__t.dispose();
      this.__form.dispose();
      this.__renderer.dispose();
      this.base(arguments);
    },

    testItemRow : function() {
      this.assertNotNull(this.__renderer._getChildren()[0]);
      this.assertTrue(2=== this.__renderer._getChildren()[0]._getChildren().length); // we have a label and a form element in the row
    },

    testButtonRow : function() {
      this.assertNotNull(this.__renderer._getChildren()[1]);
      this.assertTrue(1=== this.__renderer._getChildren()[1]._getChildren().length); // we have only the button in the row
    }

  }
});
