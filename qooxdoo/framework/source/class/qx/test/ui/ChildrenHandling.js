/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Test widget children handling
 */
qx.Class.define("qx.test.ui.ChildrenHandling",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    assertArrayEquals : function(expected, found, msg)
    {
      this.assertArray(expected, msg);
      this.assertArray(found, msg);

      this.assertEquals(expected.length, found.length, msg);
      for (var i=0; i<expected.length; i++) {
        this.assertIdentical(expected[i], found[i], msg);
      }
    },


    testDoubleAdd : function()
    {
      var parent = new qx.ui.container.Composite(new qx.ui.layout.Basic());

      var children = [];
      for (var i=0; i<4; i++)
      {
        children[i] = new qx.ui.core.Widget();
        parent.add(children[i]);
      }

      this.assertArrayEquals(children, parent.getChildren());

      // double add must move the child to the end!
      var child = children[1];
      parent.add(child);
      qx.lang.Array.remove(children, child);
      children.push(child);
      this.assertArrayEquals(children, parent.getChildren());
    }
  }
});