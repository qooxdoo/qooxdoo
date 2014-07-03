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
     * Mustafa Sak (msak)

************************************************************************ */


/**
 * @ignore(ColorSwitch)
 */
qx.Class.define("demobrowser.demo.ui.CommandGroupManager",
{
  extend : qx.application.Standalone,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    main : function()
    {
      this.base(arguments);

      this._manager = new qx.ui.command.GroupManager();
      this._createWidgets();
    },


    _createWidgets : function()
    {
      var tabview = new qx.ui.tabview.TabView();

      var page1 = new qx.ui.tabview.Page("Page1 - press 5 to change color");
      page1.setLayout(new qx.ui.layout.Canvas());

      var page2 = new qx.ui.tabview.Page("Page2 - press 5 to change color");
      page2.setLayout(new qx.ui.layout.Canvas());

      var page3 = new qx.ui.tabview.Page("Page3 - press 5 to change color");
      page3.setLayout(new qx.ui.layout.Canvas());

      page1.add(new ColorSwitch(this), {edge:0});
      page2.add(new ColorSwitch(this), {edge:0});
      page3.add(new ColorSwitch(this), {edge:0});

      tabview.add(page1);
      tabview.add(page2);
      tabview.add(page3);

      this.getRoot().add(tabview, {edge: 10});
    },


    getGroupManager : function()
    {
      return this._manager;
    }
  }
});


/**
 * View
 */
qx.Class.define("ColorSwitch",
{
  extend : qx.ui.container.Composite,


  construct : function(controller)
  {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox(15));
    this.setPadding(25);

    this._controller = controller;

    // create command
    var cmd = new qx.ui.command.Command("5");
    cmd.addListener("execute", this.toggleColor, this);

    // create command group
    var group = new qx.ui.command.Group();
    this._group = group;

    // add command into group
    group.add("toggleColor", cmd);

    // Register command group at command group manager
    controller.getGroupManager().add(group);

    this.addListener("appear", this._onAppear, this);
    this._createWidgets();
  },


  members :
  {
    _group : null,


    _createWidgets : function()
    {
      var btn = new qx.ui.form.TextField();
      btn.setPlaceholder("If focused here, all commands will be disabled! Please press key \"5\"!");
      btn.addListener("focusin", this._blockCommands, this);
      btn.addListener("focusout", this._unblockCommands, this);

      this.add(btn);

      var label = new qx.ui.basic.Label("All tabview pages are holding a view class with same command shortcut! Press key  \"5\" on any page to change the color of the view. You will see that only the appeared page will change his color.");
      label.set({
        rich : true,
        wrap : true
      });
      this.add(label);
    },


    toggleColor : function(target, command)
    {
      this.setBackgroundColor(this.getBackgroundColor() == "#ABEFEF" ? "#ABEFAB" : "#ABEFEF");
    },


    _onAppear : function(e)
    {
      this._controller.getGroupManager().setActive(this._group);
    },


    _blockCommands : function(e)
    {
      this._controller.getGroupManager().block();
    },


    _unblockCommands : function(e)
    {
      this._controller.getGroupManager().unblock();
    }
  }
});

