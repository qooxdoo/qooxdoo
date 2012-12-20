/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page showing the "Drawer" showcase.
 */
qx.Class.define("mobileshowcase.page.Drawer",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments, false);
    this.setTitle("Drawer");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },


  members :
  {
    // overridden
    _initialize : function()
    {
      this.base(arguments);
      
      var drawerBottom = new qx.ui.mobile.container.Drawer(this, new qx.ui.mobile.layout.VBox());
      drawerBottom.setOrientation("bottom");
      drawerBottom.setTouchOffset(100);
      
      var drawerBottomLabel = new qx.ui.mobile.basic.Label("This the bottom drawer.");
      drawerBottom.add(new qx.ui.mobile.form.Group([drawerBottomLabel]));
      
      var drawerTop = new qx.ui.mobile.container.Drawer(this, new qx.ui.mobile.layout.VBox());
      drawerTop.setOrientation("top");
      drawerTop.setTouchOffset(100);
      
      var drawerTopLabel = new qx.ui.mobile.basic.Label("This the top drawer.");
      drawerTop.add(new qx.ui.mobile.form.Group([drawerTopLabel]));
      
      var drawerLeft = new qx.ui.mobile.container.Drawer(this, new qx.ui.mobile.layout.VBox());
      drawerLeft.setOrientation("left");
      drawerLeft.setTouchOffset(100);
      
      var drawerLeftLabel = new qx.ui.mobile.basic.Label("This the left drawer.");
      drawerLeft.add(new qx.ui.mobile.form.Group([drawerLeftLabel]));
      
      var drawerRight = new qx.ui.mobile.container.Drawer(this, new qx.ui.mobile.layout.VBox());
      drawerRight.setOrientation("right");
      drawerRight.setTouchOffset(100);
      
      var drawerRightLabel = new qx.ui.mobile.basic.Label("This the right drawer.");
      drawerRight.add(new qx.ui.mobile.form.Group([drawerRightLabel]));
      
      var openLeftDrawerButton = new qx.ui.mobile.form.Button("Open Left Drawer");
      openLeftDrawerButton.addListener("tap",function(){drawerLeft.show()},this);
      
      var openRightDrawerButton = new qx.ui.mobile.form.Button("Open Right Drawer");
      openRightDrawerButton.addListener("tap",function(){drawerRight.show()},this);
      
      var openTopDrawerButton = new qx.ui.mobile.form.Button("Open Top Drawer");
      openTopDrawerButton.addListener("tap",function(){drawerTop.show()},this);
      
      var openBottomDrawerButton = new qx.ui.mobile.form.Button("Open Bottom Drawer");
      openBottomDrawerButton.addListener("tap",function(){drawerBottom.show()},this);
      
      var drawerMenuGroup = new qx.ui.mobile.form.Group([openLeftDrawerButton,openTopDrawerButton,openRightDrawerButton,openBottomDrawerButton]);
      this.getContent().add(drawerMenuGroup);
    },


    // overridden
    _back : function()
    {
     qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});