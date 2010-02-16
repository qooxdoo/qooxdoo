/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/devices/drive-harddisk.png)
#asset(qx/icon/${qx.icontheme}/16/places/user-trash.png)
#asset(qx/icon/${qx.icontheme}/16/places/user-desktop.png)
#asset(qx/icon/${qx.icontheme}/16/status/dialog-information.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.data.Tree_Columns",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroller = new qx.ui.container.Scroll();
      var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      container.setAllowGrowX(false);
      container.setAllowStretchX(false);
      scroller.add(container);
      this.getRoot().add(scroller, {edge : 0});

      var tree = new qx.ui.tree.Tree().set({
        width: 600,
        height: 500
      });

      container.add(tree, {left: 20, top: 48});
      
      
      // build the data
      var data = {
        label: "Root",
        children : [
          {
            label: "Desktop",
            children: [
              {label: "Files"},
              {
                label: "Workspace",
                children : [
                  {label: "Windows (C:)"},
                  {label: "Documents (D:)"}
                ]
              },
              {label: "Network"},
              {label: "Trash"}
            ]
          },
          {
            label: "Inbox",
            children: [
              {label: "Presets"},
              {label: "Sent"},
              {label: "Trash"},
              {label: "Data"},
              {label: "Edit"},
              {label: "Lists"},
              {label: "Personal"},
              {label: "Big", children: []},
              {label: "Spam"}
            ]
          }
        ]
      };
      
      for (var i = 0; i < 50; i++) {
        data.children[1].children[7].children[i] = {label: "Item " + i}
      }
      
      this.extendData(data);
      var model = qx.data.marshal.Json.createModel(data);

      // data binding
      var treeController = new qx.data.controller.Tree(null, tree, "children", "label");
      treeController.setDelegate(this);
      treeController.setModel(model);
    },
    
    
    extendData : function(data) 
    {
      data.date = "May " + Math.round(Math.random() * 30 + 1) + " 2010";
      data.size = Math.round(Math.random() * 100) + "kb";
      data.light = Math.floor(Math.random() * 4) == 0;
      data.mode = "-rw-r--r--";
      data.checked = Math.random() >= 0.5;
      if (data.children) {
        for (var i = 0; i < data.children.length; i++) {
          this.extendData(data.children[i]);
        }        
      }
    },
    
    
    // delegate implementation
    bindItem : function(controller, item, id) {
      controller.bindDefaultProperties(item, id);
      controller.bindProperty("size", "value", null, item.getUserData("size"), id);
      controller.bindProperty("checked", "value", null, item.getUserData("checkbox"), id);
      controller.bindPropertyReverse("checked", "value", null, item.getUserData("checkbox"), id);      
      controller.bindProperty("date", "value", null, item.getUserData("date"), id);
      controller.bindProperty("mode", "value", null, item.getUserData("mode"), id);
      controller.bindProperty("light", "source", {
        converter : function(data) {
          return data ? "icon/16/status/dialog-information.png" : "";
        }
      }, item.getUserData("light"), id);
      
    },
    
    
    // delegate implementation
    createItem : function() {
      var item = new qx.ui.tree.TreeFolder();
      // fist image
      var img = new qx.ui.basic.Image();
      img.setWidth(16);
      item.addWidget(img);
      item.setUserData("light", img);
      
      // Here's our indentation and tree-lines
      item.addSpacer();
      item.addOpenButton();

      // The standard tree icon follows
      item.addIcon();
      item.setIcon("icon/16/places/user-desktop.png");

      // A checkbox comes right after the tree icon
      var checkbox = new qx.ui.form.CheckBox();
      checkbox.setFocusable(false);
      item.addWidget(checkbox);
      item.setUserData("checkbox", checkbox);
      
      // The label
      item.addLabel("");      

      // All else should be right justified
      item.addWidget(new qx.ui.core.Spacer(), {flex: 1});

      // Add a file size, date and mode
      var text = new qx.ui.basic.Label();
      text.setWidth(50);
      item.addWidget(text);
      item.setUserData("size", text);

      text = new qx.ui.basic.Label();
      text.setWidth(150);
      item.addWidget(text);
      item.setUserData("date", text);
      
      text = new qx.ui.basic.Label();
      text.setWidth(80);
      item.addWidget(text);
      item.setUserData("mode", text);
         
      return item;
    }
  }
});
