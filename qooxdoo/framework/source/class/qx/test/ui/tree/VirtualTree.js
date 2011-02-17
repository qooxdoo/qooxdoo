/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.tree.VirtualTree",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    tree : null,


    setUp : function()
    {
      this.base(arguments);

      this.tree = new qx.ui.tree.VirtualTree();
      this.getRoot().add(this.tree);

      this.flush();
    },


    tearDown : function()
    {
      this.base(arguments);

      this.tree.dispose();
      this.tree = null;
    },

    testCreation : function() {
      this.assertEquals("virtual-tree", this.tree.getAppearance(), "Init value for 'appearance' is wrong!");
      this.assertTrue(this.tree.getFocusable(), "Init value for 'focusable' is wrong!");
      this.assertEquals("dblclick", this.tree.getOpenMode(), "Init value for 'openMode' is wrong!");
      this.assertFalse(this.tree.getHideRoot(), "Init value for 'hideRoot' is wrong!");
      this.assertFalse(this.tree.getRootOpenClose(), "Init value for 'rootOpenClose' is wrong!");
    }
  }
});