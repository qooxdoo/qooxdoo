/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * Mobile page responsible for showing the "tab" showcase.
 */
qx.Class.define("mobileshowcase.page.Tab",
{
  extend : qx.ui.mobile.page.NavigationPage,


  construct : function()
  {
    this.base(arguments);
    this.setTitle("Tabs");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },


  members :
  {
    // overridden
    _initialize : function()
    {
      this.base(arguments);

      this.add(this.__createTabBar());
    },


    /**
     * Creates the tab bar.
     *
     * @return {qx.ui.mobile.tabbar.TabBar} created tab bar.
     */
    __createTabBar : function()
    {
      var tabBar = new qx.ui.mobile.tabbar.TabBar();
      var tabButton1 = new qx.ui.mobile.tabbar.TabButton("Tab 1");

      tabBar.add(tabButton1);
      tabButton1.setView(this.__createView("View 1"));
      var tabButton2 = new qx.ui.mobile.tabbar.TabButton("Tab 2");
      tabButton2.setView(this.__createView("View 2"));
      tabBar.add(tabButton2);
      var tabButton3 = new qx.ui.mobile.tabbar.TabButton("Tab 3");
      tabButton3.setView(this.__createView("View 3"));
      tabBar.add(tabButton3);
      var tabButton4 = new qx.ui.mobile.tabbar.TabButton("Tab 4");
      tabButton4.setView(this.__createView("View 4"));
      tabBar.add(tabButton4);
      return tabBar;
    },


    /**
     * Creates the view for the tab.
     *
     * @param text {String} The text of the label used in this view.
     * @return {qx.ui.mobile.basic.Label} the created view.
     */
    __createView : function(text)
    {
      if(text == 'View 4')
      {
       var label = new qx.ui.mobile.basic.Label(text);
       this.getContent().add(label);
       return label;
      }
      else
      {
        var atom = new qx.ui.mobile.basic.Atom(text, "http://demo.qooxdoo.org/1.4/demobrowser/resource/qx/icon/Tango/32/actions/go-previous.png");
        this.getContent().add(atom);
        if(text.indexOf('3')!=-1) {
          atom.setIconPosition('top');
        }
        if(text.indexOf('2')!=-1) {
          atom.setIconPosition('right');
        }
        return atom;
      }
    },


    // overridden
    _back : function()
    {
     qx.ui.mobile.navigation.Manager.getInstance().executeGet("/", {reverse:true});
    }
  }
});