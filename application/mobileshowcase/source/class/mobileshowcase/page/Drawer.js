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
    /** Factory method for creation of drawers. */
    _createDrawer : function(orientation) {
      var drawer = new qx.ui.mobile.container.Drawer(this, new qx.ui.mobile.layout.VBox());
      drawer.setOrientation(orientation);
      drawer.setTouchOffset(0);
      drawer.setPositionZ("below");
      return drawer;
    },


    /** Factory method for the a demo drawer's content. */
    _createDrawerContent : function(target) {
      var closeDrawerButton = new qx.ui.mobile.form.Button("Close");
      closeDrawerButton.addListener("tap", function(){target.hide()},this);

      var drawerContent = new qx.ui.mobile.form.Group([new qx.ui.mobile.basic.Label("This the "+target.getOrientation()+" drawer."), closeDrawerButton]);
      return drawerContent;
    },


    /** Factory method for the a drawer menu. */
    _createDrawerMenu : function(drawers) {
      var drawerGroup = new qx.ui.mobile.form.Group();
      for(var i = 0; i < drawers.length; i++) {
        var openDrawerButton = new qx.ui.mobile.form.Button("Open "+drawers[i].getOrientation() +" drawer");
        openDrawerButton.addListener("tap", drawers[i].show, drawers[i]);
        drawerGroup.add(openDrawerButton);
      }

      return drawerGroup;
    },


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      // DRAWERS

      var drawerSize = 175;

      var drawerBottom = this._createDrawer("bottom");
      drawerBottom.setHeight(drawerSize);
      drawerBottom.add(this._createDrawerContent(drawerBottom));

      var drawerTop = this._createDrawer("top");
      drawerTop.setHeight(drawerSize);
      drawerTop.add(this._createDrawerContent(drawerTop));

      var drawerLeft = this._createDrawer("left");
      drawerLeft.setWidth(drawerSize);
      drawerLeft.add(this._createDrawerContent(drawerLeft));

      var drawerRight = this._createDrawer("right");
      drawerRight.setWidth(drawerSize);
      drawerRight.add(this._createDrawerContent(drawerRight));

      // Z POSITION TOGGLE BUTTON

      var frontBackToggleButton = new qx.ui.mobile.form.ToggleButton(false, "Above","Below", 13);

      frontBackToggleButton.addListener("changeValue",function() {
        this._togglePositionZ(drawerLeft);
        this._togglePositionZ(drawerRight);
        this._togglePositionZ(drawerTop);
        this._togglePositionZ(drawerBottom);
      },this);

      // PAGE CONTENT

      var toggleModeGroup = new qx.ui.mobile.form.Group([frontBackToggleButton]);

      this.getContent().add(new qx.ui.mobile.form.Title("Position"));
      this.getContent().add(toggleModeGroup);

      this.getContent().add(new qx.ui.mobile.form.Title("Action"));
      this.getContent().add(this._createDrawerMenu([drawerTop,drawerRight,drawerBottom,drawerLeft]));
    },


    /**
     * Toggles the z-Index position of the target drawer.
     */
    _togglePositionZ : function(target) {
      qx.bom.element.Style.set(target.getContainerElement(),"transitionDuration","0s");

      if(target.getPositionZ() == "above") {
        target.setPositionZ("below")
      }
      else {
        target.setPositionZ("above")
      }

      qx.event.Timer.once(function() {
        qx.bom.element.Style.set(this,"transitionDuration", null);
      },target.getContainerElement(),0);
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});