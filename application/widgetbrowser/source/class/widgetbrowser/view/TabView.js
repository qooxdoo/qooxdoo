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

qx.Class.define("widgetbrowser.view.TabView",
{
  extend : qx.ui.tabview.TabView,


  construct : function()
  {
    this.base(arguments);

    this.init();
    this.addListener("changeSelection", this.__rememberCurrentTab, this);
    this.__setCurrentTab();
  },

  members :
  {
    init: function() {
      var controls, classname;

      // Form
      classname = "widgetbrowser.pages.Form";
      controls = {disabled: true, hovered: true, focused: true, invalid: true};
      var form = new widgetbrowser.view.TabPage("Form", classname, controls);
      this.add(form);

      // Tree
      classname = "widgetbrowser.pages.Tree";
      controls = {disabled: true};
      var tree = new widgetbrowser.view.TabPage("Tree", classname, controls);
      this.add(tree);

      // List
      classname = "widgetbrowser.pages.List";
      controls = {disabled: true};
      var list = new widgetbrowser.view.TabPage("List", classname, controls);
      this.add(list);

      // Table
      classname = "widgetbrowser.pages.Table";
      controls = {disabled: true};
      var table = new widgetbrowser.view.TabPage("Table", classname, controls);
      this.add(table);

      // Menu
      classname = "widgetbrowser.pages.ToolBar";
      controls = {disabled: true, hovered: true, selected: true, hidesome: true};
      var menu = new widgetbrowser.view.TabPage("Toolbar/Menu", classname, controls);
      this.add(menu);

      // Window
      classname = "widgetbrowser.pages.Window";
      controls = {disabled: true};
      var win = new widgetbrowser.view.TabPage("Window", classname, controls);
      this.add(win);

      // Tab
      classname = "widgetbrowser.pages.Tab";
      controls = {disabled: true, overflow: true};
      var tab = new widgetbrowser.view.TabPage("Tab", classname, controls);
      this.add(tab);

      // Control
      classname = "widgetbrowser.pages.Control";
      controls = {disabled: true};
      var control = new widgetbrowser.view.TabPage("Control", classname, controls);
      this.add(control);

      // Embed
      classname = "widgetbrowser.pages.Embed";
      controls = {};
      var embed = new widgetbrowser.view.TabPage("Embed", classname, controls);
      this.add(embed);

      // EmbedFrame
      classname = "widgetbrowser.pages.EmbedFrame";
      controls = {};
      var embedFrame = new widgetbrowser.view.TabPage("EmbedFrame", classname, controls);
      this.add(embedFrame);

      // Basic
      classname = "widgetbrowser.pages.Basic";
      controls = {disabled: true};
      var basic = new widgetbrowser.view.TabPage("Basic", classname, controls);
      this.add(basic);

      // Misc
      classname = "widgetbrowser.pages.Misc";
      controls = {disabled: true};
      var misc = new widgetbrowser.view.TabPage("Misc", classname, controls);
      this.add(misc);

    },

    __rememberCurrentTab: function(e) {
      qx.bom.Cookie.set("currentTab", e.getData()[0].getLabel());
    },

    __setCurrentTab: function() {
      var cookie = qx.bom.Cookie.get("currentTab") ||
                   qx.bom.Cookie.set("currentTab", "basic");

      var currentTab = new qx.type.Array().append(this.getSelectables()).filter(function(tab) {
        return tab.getLabel() == cookie;
      })[0];

      if (currentTab) {
        this.setSelection([currentTab]);
      }
    }
  }
});
