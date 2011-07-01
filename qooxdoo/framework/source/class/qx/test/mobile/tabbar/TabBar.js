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

qx.Class.define("qx.test.mobile.tabbar.TabBar",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    __createTabBar : function() {
      var tabBar = new qx.ui.mobile.tabbar.TabBar();
      this.getRoot().add(tabBar);
      return tabBar;
    },

    __assertChildNodesLength : function(tabBar, tabNumber) {
      var childrenLength = tabBar.getContentElement().childNodes.length;
      this.assertEquals(tabNumber, childrenLength);
    },

    testAdd : function()
    {
      var tabBar = this.__createTabBar();

      var button1 = new qx.ui.mobile.tabbar.TabButton("Button 1");
      tabBar.add(button1);
      this.__assertChildNodesLength(tabBar, 1);

      var button2 = new qx.ui.mobile.tabbar.TabButton("Button 2");
      tabBar.add(button2);
      this.__assertChildNodesLength(tabBar, 2);

      var button3 = new qx.ui.mobile.tabbar.TabButton("Button 3");
      tabBar.add(button3);
      this.__assertChildNodesLength(tabBar, 3);

      button1.destroy();
      button2.destroy();
      button3.destroy();
      tabBar.destroy();
    },


    testRemove : function()
    {
      var tabBar = this.__createTabBar();

      var button1 = new qx.ui.mobile.tabbar.TabButton("Button 1");
      tabBar.add(button1);
      var button2 = new qx.ui.mobile.tabbar.TabButton("Button 2");
      tabBar.add(button2);
      var button3 = new qx.ui.mobile.tabbar.TabButton("Button 3");
      tabBar.add(button3);

      this.__assertChildNodesLength(tabBar, 3);

      tabBar.remove(button2);
      this.__assertChildNodesLength(tabBar, 2);
      tabBar.remove(button1);
      this.__assertChildNodesLength(tabBar, 1);
      tabBar.remove(button3);
      this.__assertChildNodesLength(tabBar, 0);

      button1.destroy();
      button2.destroy();
      button3.destroy();
      tabBar.destroy();
    },


    testSelection : function()
    {
      var tabBar = this.__createTabBar();

      var button1 = new qx.ui.mobile.tabbar.TabButton();
      tabBar.add(button1);
      this.assertEquals(tabBar.getSelection(), button1);

      var button2 = new qx.ui.mobile.tabbar.TabButton();
      tabBar.add(button2);
      this.assertEquals(tabBar.getSelection(), button1);

      var button3 = new qx.ui.mobile.tabbar.TabButton();
      tabBar.add(button3);
      this.assertEquals(tabBar.getSelection(), button1);

      tabBar.setSelection(button2);
      this.assertEquals(tabBar.getSelection(), button2);

      tabBar.remove(button2);
      this.assertEquals(tabBar.getSelection(), null);

      this.assertEventFired(tabBar, "changeSelection", function() {
        tabBar.setSelection(button1);
      });

      button1.destroy();
      button2.destroy();
      button3.destroy();
      tabBar.destroy();
    },


    testView : function()
    {
      var tabBar = this.__createTabBar();

      var button1 = new qx.ui.mobile.tabbar.TabButton("Button 1");
      var view1 = new qx.ui.mobile.basic.Label("1");
      view1.exclude();
      button1.setView(view1);
      tabBar.add(button1);
      this.assertTrue(view1.isVisible());

      var button2 = new qx.ui.mobile.tabbar.TabButton("Button 2");
      tabBar.add(button2);
      var view2 = new qx.ui.mobile.basic.Label("2");
      button2.setView(view2);
      this.assertFalse(view2.isVisible());

      var button3 = new qx.ui.mobile.tabbar.TabButton("Button 3");
      tabBar.add(button3);
      tabBar.setSelection(button3);
      var view3 = new qx.ui.mobile.basic.Label("3");

      this.assertEventFired(button3, "changeView", function() {
        button3.setView(view3);
      });

      this.assertFalse(view1.isVisible());
      this.assertTrue(view3.isVisible());

      tabBar.remove(button3);
      this.assertFalse(view1.isVisible());
      this.assertFalse(view2.isVisible());
      this.assertFalse(view3.isVisible());

      button1.destroy();
      button2.destroy();
      button3.destroy();
      view1.destroy();
      view2.destroy();
      view3.destroy();
      tabBar.destroy();
    }
  }

});
