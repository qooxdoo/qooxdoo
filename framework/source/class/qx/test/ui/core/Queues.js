/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.core.Queues",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  members :
  {
    __widget1 : null,
    __widget2 : null,
    __widget3 : null,
    __widget4 : null,


    setUp : function() {
      // ensure an empty dispose queue before starting the test
      qx.ui.core.queue.Manager.flush();

      this.__widget1 = new qx.ui.core.Widget();
      this.__widget1.$$hash = 10e5;
      this.__widget2 = new qx.ui.core.Widget();
      this.__widget2.$$hash = 10e5 + 1;
      this.__widget3 = new qx.ui.core.Widget();
      this.__widget3.$$hash = 10e5 + 2;
      this.__widget4 = new qx.ui.core.Widget();
      this.__widget4.$$hash = 10e5 + 3;
    },


    tearDown : function() {
      // dispose the widgets
      this.__widget1.dispose();
      this.__widget2.dispose();
      this.__widget3.dispose();
      this.__widget4.dispose();
    },


    testWidgetOrder : function()
    {
      qx.ui.core.queue.Widget.add(this.__widget4);
      qx.ui.core.queue.Widget.add(this.__widget3);
      qx.ui.core.queue.Widget.add(this.__widget2);
      qx.ui.core.queue.Widget.add(this.__widget1);

      var spy1 = this.spy(this.__widget1, "syncWidget");
      var spy2 = this.spy(this.__widget2, "syncWidget");
      var spy3 = this.spy(this.__widget3, "syncWidget");
      var spy4 = this.spy(this.__widget4, "syncWidget");

      qx.ui.core.queue.Widget.flush();

      this.assertCalledOnce(spy1);
      this.assertCalledOnce(spy2);
      this.assertCalledOnce(spy3);
      this.assertCalledOnce(spy4);
      this.assertCallOrder(spy4, spy3, spy2, spy1);
    },


    testAppearanceOrder : function()
    {
      qx.ui.core.queue.Appearance.add(this.__widget4);
      qx.ui.core.queue.Appearance.add(this.__widget3);
      qx.ui.core.queue.Appearance.add(this.__widget2);
      qx.ui.core.queue.Appearance.add(this.__widget1);

      var spy1 = this.spy(this.__widget1, "syncAppearance");
      var spy2 = this.spy(this.__widget2, "syncAppearance");
      var spy3 = this.spy(this.__widget3, "syncAppearance");
      var spy4 = this.spy(this.__widget4, "syncAppearance");

      var stub = this.stub(qx.ui.core.queue.Visibility, "isVisible").returns(true);
      qx.ui.core.queue.Appearance.flush();
      stub.restore();

      this.assertCalledOnce(spy1);
      this.assertCalledOnce(spy2);
      this.assertCalledOnce(spy3);
      this.assertCalledOnce(spy4);
      this.assertCallOrder(spy4, spy3, spy2, spy1);
    },


    testDisposeOrder : function()
    {
      qx.ui.core.queue.Dispose.add(this.__widget4);
      qx.ui.core.queue.Dispose.add(this.__widget3);
      qx.ui.core.queue.Dispose.add(this.__widget2);
      qx.ui.core.queue.Dispose.add(this.__widget1);

      var spy1 = this.spy(this.__widget1, "dispose");
      var spy2 = this.spy(this.__widget2, "dispose");
      var spy3 = this.spy(this.__widget3, "dispose");
      var spy4 = this.spy(this.__widget4, "dispose");

      qx.ui.core.queue.Dispose.flush();

      this.assertCalledOnce(spy1);
      this.assertCalledOnce(spy2);
      this.assertCalledOnce(spy3);
      this.assertCalledOnce(spy4);
      this.assertCallOrder(spy4, spy3, spy2, spy1);
    },


    testVisibilityOrder : function()
    {
      qx.ui.core.queue.Visibility.add(this.__widget4);
      qx.ui.core.queue.Visibility.add(this.__widget3);
      qx.ui.core.queue.Visibility.add(this.__widget2);
      qx.ui.core.queue.Visibility.add(this.__widget1);

      var spy1 = this.spy(this.__widget1, "isRootWidget");
      var spy2 = this.spy(this.__widget2, "isRootWidget");
      var spy3 = this.spy(this.__widget3, "isRootWidget");
      var spy4 = this.spy(this.__widget4, "isRootWidget");

      qx.ui.core.queue.Visibility.flush();

      this.assertCalledOnce(spy1);
      this.assertCalledOnce(spy2);
      this.assertCalledOnce(spy3);
      this.assertCalledOnce(spy4);
      this.assertCallOrder(spy4, spy3, spy2, spy1);
    },


    testWidgetAddJobs : function()
    {
      qx.ui.core.queue.Widget.add(this.__widget4, "job4");
      qx.ui.core.queue.Widget.add(this.__widget3, "job3");
      qx.ui.core.queue.Widget.add(this.__widget2);

      qx.ui.core.queue.Widget.add(this.__widget1, "job1");
      qx.ui.core.queue.Widget.add(this.__widget1, "job1");
      qx.ui.core.queue.Widget.add(this.__widget1, "job3");
      qx.ui.core.queue.Widget.add(this.__widget1, "job2");

      var spy1 = this.spy(this.__widget1, "syncWidget");
      var spy2 = this.spy(this.__widget2, "syncWidget");
      var spy3 = this.spy(this.__widget3, "syncWidget");
      var spy4 = this.spy(this.__widget4, "syncWidget");

      qx.ui.core.queue.Widget.flush();

      this.assertCalledOnce(spy1, "widgte1");
      this.assertCalledOnce(spy2, "widget2");
      this.assertCalledOnce(spy3, "widget3");
      this.assertCalledOnce(spy4, "widget4");
      this.assertCallOrder(spy4, spy3, spy2, spy1);

      this.assertTrue(spy1.args[0][0].job1);
      this.assertTrue(spy1.args[0][0].job2);
      this.assertTrue(spy1.args[0][0].job3);

      this.assertTrue(spy2.args[0][0]["$$default"]);
      this.assertTrue(spy3.args[0][0].job3);
      this.assertTrue(spy4.args[0][0].job4);
    },

    testWidgetRemoveJobs : function()
    {
      qx.ui.core.queue.Widget.add(this.__widget2);

      qx.ui.core.queue.Widget.add(this.__widget1, "job1");
      qx.ui.core.queue.Widget.add(this.__widget1, "job1");
      qx.ui.core.queue.Widget.add(this.__widget1, "job3");
      qx.ui.core.queue.Widget.add(this.__widget1, "job2");

      qx.ui.core.queue.Widget.remove(this.__widget1, "job1");

      var spy1 = this.spy(this.__widget1, "syncWidget");
      var spy2 = this.spy(this.__widget2, "syncWidget");

      qx.ui.core.queue.Widget.flush();

      this.assertCalledOnce(spy1, "widgte1");
      this.assertCalledOnce(spy2, "widget2");

      this.assertTrue(spy1.args[0][0].job2);
      this.assertTrue(spy1.args[0][0].job3);
      this.assertUndefined(spy1.args[0][0].job1);

      this.assertTrue(spy2.args[0][0]["$$default"]);

    }
  }
});
