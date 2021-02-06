/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2016 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.core.Spacer",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  members :
  {
    tearDown: function() {
      // Restore all stubs, spies and overridden host objects.
      this.getSandbox().restore();
    },


    testConstructor : function() {
      var spacer = new qx.ui.core.Spacer();

      this.assertEquals(0, spacer.getWidth());
      this.assertEquals(0, spacer.getHeight());

      // cleanup memory
      spacer.destroy();
    },


    testConstructorWithParams : function() {
      var spacer = new qx.ui.core.Spacer(100, 200);

      this.assertEquals(100, spacer.getWidth());
      this.assertEquals(200, spacer.getHeight());

      // cleanup memory
      spacer.destroy();
    },


    testDestroy : function() {
      this.spy(qx.ui.core.queue.Dispose, "add");

      var spacer = new qx.ui.core.Spacer();
      spacer.destroy();

      this.assertCalledOnce(qx.ui.core.queue.Dispose.add);
      this.assertCalledWith(qx.ui.core.queue.Dispose.add, spacer);
    },


    testDestroyOnAlreadyDestroyed : function() {
      var spacer = new qx.ui.core.Spacer();

      // destroy it and flush the dispose queue
      spacer.destroy();
      qx.ui.core.queue.Dispose.flush();

      // add spy now, otherwise the previous destroy call is counted
      this.spy(qx.ui.core.queue.Dispose, "add");

      // now test it
      spacer.destroy();

      this.assertNotCalled(qx.ui.core.queue.Dispose.add);
    },


    testDestroyWithParent : function() {
      var layout = new qx.ui.layout.HBox();
      var container = new qx.ui.container.Composite(layout);
      var spacer = new qx.ui.core.Spacer();
      container.add(spacer);

      this.spy(container, "_remove");

      spacer.destroy();

      this.assertCalledOnce(container._remove);
      this.assertCalledWith(container._remove, spacer);

      // cleanup memory
      container.destroy();
      layout.dispose();
    }
  }
});
