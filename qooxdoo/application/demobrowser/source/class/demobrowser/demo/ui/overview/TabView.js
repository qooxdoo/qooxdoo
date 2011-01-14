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

qx.Class.define("demobrowser.demo.ui.overview.TabView",
{
  extend : qx.ui.tabview.TabView,


  construct : function()
  {
    this.base(arguments);

    this.__init();
    this.addListener("changeSelection", this.__rememberCurrentTab, this);
    this.__setCurrentTab();
  },

  members :
  {
    __init: function() {

      // Form
      var form = new demobrowser.demo.ui.overview.pages.Form();
      this.add(form);

      // Tree
      var tree = new demobrowser.demo.ui.overview.pages.Tree();
      this.add(tree);

      // List
      var list = new demobrowser.demo.ui.overview.pages.List();
      this.add(list);

      // Table
      var table = new demobrowser.demo.ui.overview.pages.Table();
      this.add(table);

      // Menu
      var menu = new demobrowser.demo.ui.overview.pages.ToolBar();
      this.add(menu);

      // Window
      var win = new demobrowser.demo.ui.overview.pages.Window();
      this.add(win);

      // Control
      var control = new demobrowser.demo.ui.overview.pages.Control();
      this.add(control);

      // SplitPane
      var splitPane = new demobrowser.demo.ui.overview.pages.SplitPane();
      this.add(splitPane);

      // Embed
      var embed = new demobrowser.demo.ui.overview.pages.Embed();
      this.add(embed);

      // EmbedFrame
      var embedFrame = new demobrowser.demo.ui.overview.pages.EmbedFrame();
      this.add(embedFrame);

      // Basic
      var basic = new demobrowser.demo.ui.overview.pages.Basic();
      this.add(basic);

      // Misc
      var misc = new demobrowser.demo.ui.overview.pages.Misc();
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
