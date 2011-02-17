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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.Tree",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var tree = this.getTree();
      this.getRoot().add(tree, {top: 20, left: 20});
    },


    getTree : function()
    {
      var junk = [];
      for (var i = 0; i < 30; i++) {
        junk.push({name:"Junk #" + i});
      }
      
      var model = {
        name: "root",
        children: 
        [
          {
            name: "Desktop",
            children: 
            [
              {
                name: "Files",
                children: []
              },
              {
                name: "Workspace",
                children: 
                [
                  {name: "Windows (C:)"},
                  {name: "Documents (D:)"}
                ]
              },
              {
                name: "Network",
                children: []
              },
              {
                name: "Trash",
                children: []
              }
            ]
          },
          {
            name: "Inbox",
            children: 
            [
              {
                name: "Presets",
                children: []
              },
              {
                name: "Sent",
                children: []
              },
              {
                name: "Trash",
                children: junk
              },
              {
                name: "Data",
                children: []
              },
              {
                name: "Edit",
                children: []
              }
            ]
          }
        ]
      };
      
      var tree = new qx.ui.tree.VirtualTree(model).set({
        width : 200,
        height : 400
      });

      // Opens the 'Desktop' node
      tree.openNode(model.children[0]);

      return tree;
    }
  }
});
