/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Mustafa Sak (msak)

************************************************************************ */

qx.Class.define("qx.test.util.DisposeUtil",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testDestroyContainer : function()
    {
      var self = this;

      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      var childContainer1 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      var childContainer2 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      var childContainer3 = new qx.ui.container.Stack();

      var childContainer4 = new qx.ui.container.Stack();

      var child1 = new qx.ui.basic.Atom();
      var child2 = new qx.ui.basic.Atom();
      var child3 = new qx.ui.basic.Atom();
      var child4 = new qx.ui.basic.Atom();
      var child5 = new qx.ui.basic.Atom();

      childContainer1.add(child1);
      childContainer2.add(child2);
      childContainer3.add(child3);
      container.add(childContainer1);
      container.add(childContainer2);
      container.add(childContainer3);
      container.add(child4);
      container.add(child5);
      container.add(childContainer4);

      qx.util.DisposeUtil.destroyContainer(container);

      window.setTimeout(function() {
        self.resume(function() {
          this.assertTrue(container.isDisposed(), "container not disposed!");
          this.assertTrue(childContainer1.isDisposed(), "childContainer1 not disposed!");
          this.assertTrue(childContainer2.isDisposed(), "childContainer2 not disposed!");
          this.assertTrue(childContainer3.isDisposed(), "childContainer3 not disposed!");
          this.assertTrue(child1.isDisposed(), "child1 not disposed!");
          this.assertTrue(child2.isDisposed(), "child2 not disposed!");
          this.assertTrue(child3.isDisposed(), "child3 not disposed!");
          this.assertTrue(child4.isDisposed(), "child4 not disposed!");
          this.assertTrue(child5.isDisposed(), "child5 not disposed!");
          this.assertTrue(childContainer4.isDisposed(), "childContainer4 not disposed!");
        }, self);
      }, 10);
      this.wait();
    }
  }
});
