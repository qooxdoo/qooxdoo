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
     * Tristan Koch (tristankoch)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/actions/*)
#asset(qx/icon/${qx.icontheme}/16/apps/utilities-help.png)
#asset(qx/icon/${qx.icontheme}/22/apps/preferences-users.png)

************************************************************************ */

/**
 * Demonstrates (...):
 *
 *
 *
 */

qx.Class.define("demobrowser.demo.ui.overview.pages.ToolBar",
{
  extend: qx.ui.tabview.Page,

  include : demobrowser.demo.ui.overview.MControls,

  construct: function()
  {
    this.base(arguments);

    this.setLabel("Menu/Toolbar");
    this.setLayout(new qx.ui.layout.Canvas());

    this.__container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
    this.add(this.__container, {top: 40});

    this._initWidgets();
    this._initControls(this.__widgets, {disabled: true});
  },

  members :
  {
    __widgets: null,
    __container: null,

    _initWidgets: function()
    {
      var widgets = this.__widgets = new qx.type.Array();
      var label;
      
      label = new qx.ui.basic.Label("Menu/Toolbar");
      this.__container.add(label, {left: 0, top: 0});
      this.__container.add(this.getMenuBar(), {left: 0, top: 20});
    },

    getMenuBar : function()
    {
      var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow);
      frame.setDecorator("main");
      
      //
      // ToolBar
      //
      
      var toolbar = new qx.ui.toolbar.ToolBar;
      toolbar.setWidth(200);
      frame.add(toolbar);
      
      // Part
      var firstPart = new qx.ui.toolbar.Part;
      var secondPart = new qx.ui.toolbar.Part;

      toolbar.add(firstPart);
      toolbar.addSpacer();
      toolbar.add(secondPart);
      
      // SplitButton
      var splitButton = new qx.ui.toolbar.SplitButton("Toolbar SplitButton", "icon/16/actions/go-previous.png", this.getSplitButtonMenu());
      splitButton.setToolTip(new qx.ui.tooltip.ToolTip("Toolbar SplitButton"));
      
      // Button
      var toolbarButton = new qx.ui.toolbar.Button("Toolbar Button", "icon/16/actions/document-new.png");
      toolbarButton.setToolTip(new qx.ui.tooltip.ToolTip("Toolbar Button"));

      firstPart.add(splitButton);
      firstPart.addSeparator();
      firstPart.add(toolbarButton);
      firstPart.setShow("icon");
      
      // MenuButton
      var menuButton = new qx.ui.toolbar.MenuButton("Toolbar MenuButton");
      menuButton.setMenu(this.getButtonMenu());
      secondPart.add(menuButton);

      return frame;
    },

    getSplitButtonMenu : function()
    {
      var menu = new qx.ui.menu.Menu;
      
      //
      // Menu
      //
      
      // MenuButton
      var button1 = new qx.ui.menu.Button("Menu MenuButton");
      var button2 = new qx.ui.menu.Button("Menu MenuButton");
      var button3 = new qx.ui.menu.Button("Menu MenuButton");

      menu.add(button1);
      menu.add(button2);
      menu.add(button3);

      return menu;
    },

    getButtonMenu : function()
    {
      var menu = new qx.ui.menu.Menu;
      
      //
      // Menu
      //
      
      // MenuButton
      var button = new qx.ui.menu.Button("Menu MenuButton", "icon/16/actions/document-new.png");
      
      // CheckBox
      var checkBox = new qx.ui.menu.CheckBox("Menu MenuCheckBox");
      var checkBoxChecked = new qx.ui.menu.CheckBox("Menu MenuCheckBox").set({value: true});
      
      // RadioButton
      var radioButton = new qx.ui.menu.RadioButton("Menu RadioButton");
      var radioButtonActive = new qx.ui.menu.RadioButton("Menu RadioButton").set({value: true});

      menu.add(button);
      menu.add(checkBox);
      menu.add(checkBoxChecked);
      menu.add(radioButton);
      menu.add(radioButtonActive);

      return menu;
    }
  }
});