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

      // make sure the root node is open
      tree.getRoot().setOpen(true);
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
      controller.bindProperty("size", "size", null, item, id);
      controller.bindProperty("checked", "checked", null, item, id);
      controller.bindPropertyReverse("checked", "checked", null, item, id);
      controller.bindProperty("date", "date", null, item, id);
      controller.bindProperty("mode", "mode", null, item, id);
      controller.bindProperty("light", "light", null, item, id);
    },


    // delegate implementation
    createItem : function() {
      return new demobrowser.demo.data.TreeColumn();
    }
  }
});
